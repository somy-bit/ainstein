import { Router, RequestHandler } from 'express';
import { cancelSubscription, getSubscriptionStatus, getPlans } from '../controllers/subscriptionController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', getPlans);
router.use(authenticateToken as unknown as RequestHandler);

router.post('/cancel', cancelSubscription as unknown as RequestHandler);
router.get('/status', getSubscriptionStatus as unknown as RequestHandler);

export default router;
