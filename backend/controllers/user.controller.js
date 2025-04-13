import bcrypt from "bcryptjs";
import promisePool from "../config/db.config.js";
import { createUser, getUserByEmail, getUserById } from "../models/user.model.js";
import { generateJWT } from "../utils/genrateJWT.js";
import { generateVerificationToken } from "../utils/utils.js";
import { sendVerificationEmail } from "../utils/email.js";

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

        const verificationToken = generateVerificationToken();  
        const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        const user = await createUser({
            name,
            email,
            password: hashedPassword,
            verification_token: verificationToken,
            verification_token_expires: verificationTokenExpires,
        })

        await sendVerificationEmail(email, verificationToken); // Send verification email

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // First check if email is already verified for this token
        const [verifiedUsers] = await promisePool.query(
            `SELECT * FROM users 
             WHERE verification_token = ? 
             AND email_verified = true`,
            [token]
        );

        if (verifiedUsers.length > 0) {
            return res.status(200).json({
                message: "Email already verified. You can now login.",
                isVerified: true
            });
        }

        // Check for valid unverified token
        const [users] = await promisePool.query(
            `SELECT * FROM users 
             WHERE verification_token = ? 
             AND verification_token_expires > NOW()
             AND email_verified = false`,
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        // Update user verification status
        await promisePool.query(
            `UPDATE users 
             SET email_verified = true,
                 verification_token = NULL,
                 verification_token_expires = NULL
             WHERE verification_token = ?`,
            [token]
        );

        res.status(200).json({
            message: "Email verified successfully",
            isVerified: true
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            message: "Error verifying email",
            error: error.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);

        // Check if the user exists
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.email_verified) {
            return res.status(403).json({ message: "Email not verified" });
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

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("access_token", { path: "/" }); // Clear the cookie
        res.status(200).json({ message: "Logout successful" });
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