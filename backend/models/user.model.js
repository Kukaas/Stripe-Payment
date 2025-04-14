import { v4 as uuidv4 } from 'uuid';
import promisePool from '../config/db.config.js';

export async function createUser({name, email, password, verification_token, verification_token_expires}) {
    const userId = uuidv4();

    const [result] = await promisePool.query(
        `INSERT INTO users (
            id, 
            name, 
            email, 
            password, 
            verification_token, 
            verification_token_expires
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userId, 
            name, 
            email, 
            password, 
            verification_token, 
            verification_token_expires
        ]
    );

    // Return user without sensitive information
    return { 
        id: userId, 
        name, 
        email,
        email_verified: false,
        verification_token,
        verification_token_expires
    };
}

export const getUserByEmail = async (email) => {
    const [user] = await promisePool.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
    );

    return user[0];
}

export const getUserById = async (id) => {
    const [user] = await promisePool.query(
        `SELECT * FROM users WHERE id = ?`,
        [id]
    );

    if (user.length === 0) {
        return null; // User not found
    }
    // Exclude password from the returned user object
    delete user[0].password;

    return user[0];
}

export const updateUserSubscription = async (userId, subscriptionData) => {
    const { 
        stripeCustomerId, 
        stripeSubscriptionId, 
        stripePriceId,
        planStatus,
        subscriptionEndsAt,
        trialStartsAt,
        trialEndsAt,
        isInTrial
    } = subscriptionData;

    try {
        // Ensure dates are properly formatted for MySQL
        let formattedSubEnd = subscriptionEndsAt;
        let formattedTrialStart = trialStartsAt;
        let formattedTrialEnd = trialEndsAt;
        
        // Format subscription end date
        if (subscriptionEndsAt instanceof Date) {
            formattedSubEnd = subscriptionEndsAt
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
        }
        
        // Format trial dates if they exist
        if (trialStartsAt instanceof Date) {
            formattedTrialStart = trialStartsAt
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
        }
        
        if (trialEndsAt instanceof Date) {
            formattedTrialEnd = trialEndsAt
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
        }
        
        const [result] = await promisePool.query(
            `UPDATE users 
             SET stripe_customer_id = ?,
                 stripe_subscription_id = ?,
                 stripe_price_id = ?,
                 stripe_plan_status = ?,
                 subscription_ends_at = ?,
                 is_subscribed = 1,
                 trial_starts_at = ?,
                 trial_ends_at = ?,
                 is_in_trial = ?,
                 last_payment_at = NOW() 
             WHERE id = ?`,
            [
                stripeCustomerId,
                stripeSubscriptionId,
                stripePriceId,
                planStatus,
                formattedSubEnd,
                formattedTrialStart,
                formattedTrialEnd,
                isInTrial ? 1 : 0,
                userId
            ]
        );
        
        if (result.affectedRows === 0) {
            throw new Error(`No user found with ID: ${userId}`);
        }
        
        return true;
    } catch (error) {
        console.error("Error updating user subscription:", error);
        throw error;
    }
}