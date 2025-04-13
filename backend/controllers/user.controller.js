import bcrypt from "bcryptjs";
import promisePool from "../config/db.config.js";
import { createUser, getUserByEmail, getUserById } from "../models/user.model.js";
import { generateJWT } from "../utils/genrateJWT.js";

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

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);

        // Check if the user exists
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatched = await bcrypt.compare(password, user.password);

        // Check if the password is correct
        if (!isMatched) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateJWT(user.id); // Generate JWT token

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: "/"
        });

        res.status(200).json({ message: "Login successful", user: {
            id: user.id,
            name: user.name,
            email: user.email,
            token
        }});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the token
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}