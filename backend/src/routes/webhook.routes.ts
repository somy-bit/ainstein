import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();

// Stripe webhook endpoint - must use raw body
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
