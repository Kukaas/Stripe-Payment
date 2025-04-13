import express from 'express';

// Import the user controller
import { registerUser } from '../controllers/user.controller.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);


export default router;