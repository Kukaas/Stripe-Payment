import express from 'express';

// Import the user controller
import { getMe, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';

// Import the authenticate middleware
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);

// Logout a user
router.post('/logout', logoutUser);

// Get user details (protected route)
router.get('/me', authenticate, getMe);


export default router;