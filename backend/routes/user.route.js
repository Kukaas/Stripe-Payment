import express from 'express';

// Import the user controller
import { loginUser, registerUser } from '../controllers/user.controller.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);


export default router;