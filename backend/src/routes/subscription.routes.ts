import { Router } from 'express';
import { 
  getAllSubscriptions, 
  getSubscriptionByOrg, 
  createSubscription, 
  updateSubscriptionUsage,
  createPaymentIntent,
  changePlan,
  createCustomerPortalSession
} from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllSubscriptions);
router.get('/org/:orgId', getSubscriptionByOrg);
router.post('/', createSubscription);
router.patch('/org/:orgId/usage', updateSubscriptionUsage);
router.post('/payment-intent', createPaymentIntent);
router.post('/change-plan', changePlan);
router.post('/customer-portal', authenticateToken as any, createCustomerPortalSession as any);

export default router;
