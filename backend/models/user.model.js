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