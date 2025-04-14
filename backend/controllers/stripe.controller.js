import Stripe from "stripe";
import dotenv from "dotenv";
import { getUserById, updateUserSubscription } from "../models/user.model.js";
import promisePool from "../config/db.config.js";

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    const { priceId, userId, isChangingPlan = false } = req.body;

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
                isChangingPlan: isChangingPlan ? 'true' : 'false'
            },
        };        // Only apply free trial if:
        // 1. This is the basic plan
        // 2. User hasn't used trial before
        // 3. This is NOT a plan change (user doesn't have an active subscription)
        if (priceId === process.env.STRIPE_PRICE_ID_BASIC && !user.has_used_trial && !isChangingPlan) {
            sessionConfig.subscription_data = {
                trial_period_days: 1, // Changed from 7 to 1 day for testing purposes
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

      // Check if user is in trial or actively subscribed
      const isInTrial = user.is_in_trial === 1;

      try {
        // First, retrieve the subscription to check its status
        const subscriptionData = await stripe.subscriptions.retrieve(
          user.stripe_subscription_id
        );
        
        // Handle based on subscription status
        if (isInTrial) {
          // For trial, immediately cancel if not already canceled
          if (subscriptionData.status !== 'canceled') {
            await stripe.subscriptions.cancel(user.stripe_subscription_id);
          }
          
          // Clear all trial and subscription data except has_used_trial
          await promisePool.query(
            `UPDATE users
             SET stripe_subscription_id = NULL,
                 stripe_price_id = NULL,
                 is_in_trial = FALSE,
                 subscription_ends_at = NULL,
                 is_subscribed = FALSE,
                 stripe_plan_status = NULL,
                 has_used_trial = TRUE
             WHERE id = ?`,
            [userId]
          );
          
          res.status(200).json({
            message: "Trial ended successfully",
            subscription: {
              status: "canceled",
              canceledImmediately: true
            }
          });
        } else {
          // For regular subscription, only update if not already canceled
          if (subscriptionData.status !== 'canceled' && !subscriptionData.cancel_at_period_end) {
            await stripe.subscriptions.update(
              user.stripe_subscription_id,
              { cancel_at_period_end: true }
            );
          }
          
          // Update database to reflect cancellation status
          await promisePool.query(
            `UPDATE users 
             SET stripe_subscription_id = NULL,
                 stripe_price_id = NULL,
                 trial_starts_at = NULL,
                 trial_ends_at = NULL,
                 is_in_trial = FALSE,
                 subscription_ends_at = NULL,
                 is_subscribed = FALSE,
                 stripe_plan_status = 'canceled'
             WHERE id = ?`,
            [userId]
          );
          
          res.status(200).json({
            message: "Subscription canceled successfully",
            cancellation_date: new Date(subscriptionData.current_period_end * 1000),
            subscription: {
              status: subscriptionData.status,
              cancelAtPeriodEnd: true
            }
          });
        }
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        
        // If the subscription doesn't exist in Stripe anymore, clean up the database
        if (stripeError.type === 'StripeInvalidRequestError' && 
            stripeError.raw?.message?.includes('No such subscription')) {
          
          // Update database based on whether it was a trial or subscription
          if (isInTrial) {
            await promisePool.query(
              `UPDATE users
               SET stripe_subscription_id = NULL,
                   stripe_price_id = NULL,
                   trial_starts_at = NULL,
                   trial_ends_at = NULL,
                   is_in_trial = FALSE,
                   subscription_ends_at = NULL,
                   is_subscribed = FALSE,
                   stripe_plan_status = NULL,
                   has_used_trial = TRUE
               WHERE id = ?`,
              [userId]
            );
          } else {
            await promisePool.query(
              `UPDATE users
               SET stripe_subscription_id = NULL,
                   stripe_price_id = NULL,
                   subscription_ends_at = NULL,
                   is_subscribed = FALSE,
                   stripe_plan_status = NULL
               WHERE id = ?`,
              [userId]
            );
          }
          
          return res.status(200).json({
            message: isInTrial ? "Trial ended successfully" : "Subscription canceled successfully",
            note: "Subscription was already removed in Stripe, local database updated"
          });
        }
        
        throw stripeError; // Re-throw for the outer catch block
      }
      
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
                // Determine if we need to update has_used_trial
                const shouldUpdateHasUsedTrial = isInTrial && subscription.trial_start && subscription.trial_end;
                
                // If this is a trial subscription, also update has_used_trial to true
                if (shouldUpdateHasUsedTrial) {
                    // Direct database update for has_used_trial
                    await promisePool.query(
                        `UPDATE users SET has_used_trial = TRUE WHERE id = ?`,
                        [userId]
                    );
                }
                
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

export const changePlan = async (req, res) => {
  try {
    const { userId, newPriceId } = req.body;
    
    // Validate required parameters
    if (!userId || !newPriceId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // Get user information
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if user has an active subscription
    if (!user.stripe_subscription_id) {
      return res.status(400).json({ error: "No active subscription found" });
    }
    
    // Retrieve the current subscription from Stripe
    const currentSubscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    
    // Check if user is in trial
    const isInTrial = user.is_in_trial === 1 || currentSubscription.status === 'trialing';
    
    // If in trial, just update the subscription without refund
    if (isInTrial) {
      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(
        user.stripe_subscription_id,
        {
          items: [
            {
              id: currentSubscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          // Keep the current trial end date
          trial_end: currentSubscription.trial_end,
        }
      );
      
      // Update user record in database
      await promisePool.query(
        `UPDATE users
         SET stripe_price_id = ?
         WHERE id = ?`,
        [newPriceId, userId]
      );
      
      return res.status(200).json({
        message: "Plan updated successfully while in trial period",
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          current_period_end: new Date(updatedSubscription.current_period_end * 1000),
        }
      });
    } 
    // If not in trial, process with refund for remaining time
    else {
      // Calculate prorated refund amount
      const currentPeriodStart = currentSubscription.current_period_start;
      const currentPeriodEnd = currentSubscription.current_period_end;
      const currentTime = Math.floor(Date.now() / 1000);
        // Find the latest invoice for this subscription
      const invoices = await stripe.invoices.list({
        subscription: user.stripe_subscription_id,
        limit: 1,
        status: 'paid'
      });
      
      let refundAmount = 0;
      let paymentIntentId = null;
      
      // Get the payment intent from the most recent invoice
      if (invoices.data.length > 0) {
        const latestInvoice = invoices.data[0];
        
        // Make sure the invoice has a payment intent ID
        if (latestInvoice.payment_intent) {
          // Get the payment intent details
          const paymentIntent = await stripe.paymentIntents.retrieve(latestInvoice.payment_intent);
          
          if (paymentIntent.status === 'succeeded') {
            paymentIntentId = paymentIntent.id;
            
            // Calculate unused time percentage
            const totalPeriod = currentPeriodEnd - currentPeriodStart;
            const unusedTime = currentPeriodEnd - currentTime;
            const unusedPercentage = unusedTime / totalPeriod;
            
            // Calculate refund amount in cents
            refundAmount = Math.floor(latestInvoice.amount_paid * unusedPercentage);
            
            console.log("Refund calculation:", {
              totalPeriod,
              unusedTime,
              unusedPercentage,
              originalAmount: latestInvoice.amount_paid,
              refundAmount
            });
          }
        }
      }
      
      // Process refund if applicable
      if (paymentIntentId && refundAmount > 0) {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: refundAmount,
          metadata: {
            reason: 'Plan change proration',
            old_subscription_id: user.stripe_subscription_id,
            old_price_id: user.stripe_price_id,
            new_price_id: newPriceId,
            user_id: userId
          }
        });
      }
      
      // Cancel the current subscription
      await stripe.subscriptions.cancel(user.stripe_subscription_id);
      
      // Create a new subscription with the new price
      const newSubscription = await stripe.subscriptions.create({
        customer: user.stripe_customer_id,
        items: [
          {
            price: newPriceId,
          },
        ],
        metadata: {
          userId: userId,
          previousSubscription: user.stripe_subscription_id
        }
      });
      
      // Update user record in database
      await promisePool.query(
        `UPDATE users
         SET stripe_subscription_id = ?,
             stripe_price_id = ?,
             stripe_plan_status = ?
         WHERE id = ?`,
        [newSubscription.id, newPriceId, newSubscription.status, userId]
      );
      
      return res.status(200).json({
        message: "Plan changed successfully with prorated refund",
        refund: {
          amount: refundAmount / 100, // Convert cents to dollars for frontend display
          currency: "usd" // Assuming USD
        },
        subscription: {
          id: newSubscription.id,
          status: newSubscription.status,
          current_period_end: new Date(newSubscription.current_period_end * 1000)
        }
      });
    }
  } catch (error) {
    console.error("Error changing plan:", error);
    res.status(500).json({ error: "Failed to change plan" });
  }
};

export const createCustomerPortalSession = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get user from database
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: "No billing account found" });
    }
    
    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/subscription`,
    });
    
    // Return the URL to the client
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    res.status(500).json({ error: "Failed to create billing portal session" });
  }
};