import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Function to send verification email
const transtporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;
    const emailContent = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
    `;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: emailContent,
    };
    try {
        await transtporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }

}