import { Router } from 'express';
import { 
  getAllSubscriptions, 
  getSubscriptionByOrg, 
  createSubscription, 
  updateSubscriptionUsage,
  createPaymentIntent,
  changePlan
} from '../controllers/subscription.controller';

const router = Router();

router.get('/', getAllSubscriptions);
router.get('/org/:orgId', getSubscriptionByOrg);
router.post('/', createSubscription);
router.patch('/org/:orgId/usage', updateSubscriptionUsage);
router.post('/payment-intent', createPaymentIntent);
router.post('/change-plan', changePlan);

export default router;
