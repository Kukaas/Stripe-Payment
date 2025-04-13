import { v4 as uuidv4 } from 'uuid';
import promisePool from '../config/db.config.js';

export async function createUser({name, email, password}) {
    const userId = uuidv4();

    await promisePool.query(
        `INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`,
        [userId, name, email, password]
    );

    return { id: userId, name, email };
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
        subscriptionEndsAt
    } = subscriptionData;

    try {
        // Ensure the date is properly formatted for MySQL
        let formattedDate = subscriptionEndsAt;
        
        // If it's a Date object, format it correctly
        if (subscriptionEndsAt instanceof Date) {
            formattedDate = subscriptionEndsAt
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
                 last_payment_at = NOW() 
             WHERE id = ?`,
            [
                stripeCustomerId,
                stripeSubscriptionId,
                stripePriceId,
                planStatus,
                formattedDate,
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