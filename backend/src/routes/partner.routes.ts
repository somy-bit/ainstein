import { Router } from 'express';
import { getPartners, getPartnerById, addPartner, updatePartner, deletePartner } from '../controllers/partner.controller';
import { checkSubscriptionLimit } from '../middleware/subscriptionLimits';
import { extractOrgId } from '../middleware/extractOrgId';
import { updateUsageAfterPartnerOperation } from '../middleware/updateUsageCounters';
import { checkSubscriptionAccess } from '../middleware/subscriptionMiddleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

router.get('/', checkSubscriptionAccess, getPartners as any);
router.get('/:id', checkSubscriptionAccess, getPartnerById);
router.post('/', extractOrgId, checkSubscriptionAccess, checkSubscriptionLimit('partners'), updateUsageAfterPartnerOperation('create'), addPartner);
router.put('/:id', checkSubscriptionAccess, updatePartner);
router.delete('/:id', extractOrgId, checkSubscriptionAccess, updateUsageAfterPartnerOperation('delete'), deletePartner);

export default router;