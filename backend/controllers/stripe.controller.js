import Stripe from "stripe";
import dotenv from "dotenv";
import { getUserById, updateUserSubscription } from "../models/user.model.js";

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    const { priceId, userId } = req.body;

    try {
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let customerId = user.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: userId
                }
            });
            customerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                userId: userId,
                priceId: priceId,
            },
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
        
        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // Retrieve the subscription details with all fields
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription,
                { expand: ['items'] }
            );
            
            let subscriptionEndsAt = null;

            if (subscription.current_period_end) {
                // Convert from Unix timestamp (seconds) to JavaScript timestamp (milliseconds)
                const currentPeriodEnd = subscription.current_period_end * 1000;
                subscriptionEndsAt = new Date(currentPeriodEnd);
            } else {
                console.warn("Missing subscription.current_period_end");
                
                // Fallback: set end date to 30 days from now
                subscriptionEndsAt = new Date();
                subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);
            }
            
            // Format the date correctly for MySQL
            const formattedDate = subscriptionEndsAt.toISOString().slice(0, 19).replace('T', ' ');
            
            // Update user's subscription status in your database
            const userId = session.metadata.userId;
            const priceId = session.metadata.priceId;
            
            try {
                await updateUserSubscription(
                    userId,
                    {
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription,
                        stripePriceId: priceId,
                        planStatus: subscription.status,
                        subscriptionEndsAt: formattedDate, // Use formatted date
                    }
                );
            } catch (err) {
                console.error("Error updating subscription:", err);
            }
        }
        
        // Handle other event types as needed
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    res.status(200).json({ received: true });
}