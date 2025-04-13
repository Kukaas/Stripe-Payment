import express from 'express';
import { createCheckoutSession, handleStripeWebhook } from '../controllers/stripe.controller.js';

const router = express.Router();

// Middleware to verify the request body and headers
router.post('/webhook', handleStripeWebhook);

router.post('/create-checkout-session', createCheckoutSession);

export default router;