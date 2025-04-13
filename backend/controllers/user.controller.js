import bcrypt from "bcryptjs";
import { createUser } from "../models/user.model.js";
import promisePool from "../config/db.config.js";

export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the user already exists
        const [existingUser] = await promisePool.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await createUser({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}