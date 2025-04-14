import express from 'express';
import { cancelSubscription, createCheckoutSession, handleStripeWebhook, changePlan, createCustomerPortalSession } from '../controllers/stripe.controller.js';

const router = express.Router();

// Middleware to verify the request body and headers
router.post('/webhook', handleStripeWebhook);

router.post('/create-checkout-session', createCheckoutSession);

router.post('/cancel-subscription', cancelSubscription);

router.post('/change-plan', changePlan);

router.post('/create-customer-portal-session', createCustomerPortalSession);

export default router;