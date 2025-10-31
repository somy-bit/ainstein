import { Router } from 'express';
import { proxyGenerateText, proxySendMessageToChat } from '../controllers/ai.controller';
import { checkUsageLimit } from '../middleware/subscriptionLimits';
import { extractOrgId } from '../middleware/extractOrgId';

const router = Router();

router.post('/generate-text', extractOrgId, checkUsageLimit('textTokens', 100), proxyGenerateText);
router.post('/send-message', extractOrgId, checkUsageLimit('textTokens', 50), proxySendMessageToChat);

export default router;