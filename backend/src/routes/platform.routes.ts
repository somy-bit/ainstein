import { Router } from 'express';
import { getPlatformStripeConfig, updatePlatformStripeConfig } from '../controllers/platform.controller';

const router = Router();

router.get('/stripe-config', getPlatformStripeConfig);
router.put('/stripe-config', updatePlatformStripeConfig);

export default router;
