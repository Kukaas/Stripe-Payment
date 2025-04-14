import Stripe from "stripe";
import dotenv from "dotenv";
import { getUserById, updateUserSubscription } from "../models/user.model.js";
import promisePool from "../config/db.config.js";

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

        // Base session configuration
        const sessionConfig = {
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
        };

        // Check if this is the price ID that should have a trial
        if (priceId === process.env.STRIPE_PRICE_ID_BASIC) {
            sessionConfig.subscription_data = {
                trial_period_days: 7,
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const cancelSubscription = async (req, res) => {
    try {
      const { userId } = req.body;
      
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.stripe_subscription_id) {
        return res.status(400).json({ 
          error: "No active subscription found" 
        });
      }

      const subscription = await stripe.subscriptions.update(
        user.stripe_subscription_id,
        { cancel_at_period_end: true }
      );

      await promisePool.query(
        `UPDATE users
         SET stripe_plan_status = ?
         WHERE id = ?`,
        ['canceled', userId]
      );
      
      res.status(200).json({
        message: "Subscription canceled successfully",
        cancellation_date: new Date(subscription.current_period_end * 1000),
        subscription: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
};

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
            let trialEndsAt = null;
            let trialStartsAt = null;
            let isInTrial = false;

            // Handle subscription end date
            if (subscription.current_period_end) {
                subscriptionEndsAt = new Date(subscription.current_period_end * 1000);
            } else {
                subscriptionEndsAt = new Date();
                subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);
            }
            
            // Handle trial period
            if (subscription.trial_start && subscription.trial_end) {
                trialStartsAt = new Date(subscription.trial_start * 1000);
                trialEndsAt = new Date(subscription.trial_end * 1000);
                isInTrial = subscription.status === 'trialing';
            }
            
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
                        subscriptionEndsAt: subscriptionEndsAt,
                        trialStartsAt: trialStartsAt,
                        trialEndsAt: trialEndsAt,
                        isInTrial: isInTrial
                    }
                );
            } catch (err) {
                console.error("Error updating subscription:", err);
            }
        }
        
        // Handle trial ending webhooks
        if (event.type === 'customer.subscription.trial_will_end') {
            // This fires 3 days before trial ends, you could notify the user
            const subscription = event.data.object;
            console.log(`Trial ending soon for subscription: ${subscription.id}`);
            // Add notification logic here if needed
        }
        
        // Handle when subscription actually updates from trial to active
        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            
            // Check if status changed from trialing to active
            if (subscription.status === 'active' && event.data.previous_attributes?.status === 'trialing') {
                try {
                    // Find user by subscription ID
                    const [users] = await promisePool.query(
                        `SELECT id FROM users WHERE stripe_subscription_id = ?`,
                        [subscription.id]
                    );
                    
                    if (users.length > 0) {
                        const userId = users[0].id;
                        await updateUserSubscription(
                            userId,
                            {
                                stripeSubscriptionId: subscription.id,
                                planStatus: subscription.status,
                                subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
                                isInTrial: false
                            }
                        );
                    }
                } catch (err) {
                    console.error("Error updating subscription after trial:", err);
                }
            }
        }
        
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    res.status(200).json({ received: true });
}