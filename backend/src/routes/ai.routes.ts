import { Router } from 'express';
import { proxyGenerateText, proxySendMessageToChat } from '../controllers/ai.controller';
import { checkUsageLimit } from '../middleware/subscriptionLimits';
import { extractOrgId } from '../middleware/extractOrgId';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate-text', authenticateToken, extractOrgId, checkUsageLimit('textTokens', 100), proxyGenerateText);
router.post('/send-message', authenticateToken, extractOrgId, checkUsageLimit('textTokens', 50), proxySendMessageToChat);

export default router;