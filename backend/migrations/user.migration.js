import promisePool from "../config/db.config.js";

export async function createUsersTable() {
    await promisePool.query(`DROP TABLE IF EXISTS users`);
    await promisePool.query(`
      CREATE TABLE users (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(64),
        verification_token_expires DATETIME,
  
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        stripe_price_id VARCHAR(255),
        
        trial_starts_at DATETIME,
        trial_ends_at DATETIME,
        is_in_trial BOOLEAN DEFAULT FALSE,
        has_used_trial BOOLEAN DEFAULT FALSE,
        subscription_ends_at DATETIME,
        is_subscribed BOOLEAN DEFAULT FALSE,
        stripe_plan_status VARCHAR(100),
        last_payment_at DATETIME,
  
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  
    console.log("✅ users table created.");
  }