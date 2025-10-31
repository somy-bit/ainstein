import { Router } from 'express';
import { getOrganizations, addOrganization, updateOrganization, deleteOrganization, getUsersByOrg, getSubscriptionForOrg, getReferralConfig, updateReferralConfig } from '../controllers/organization.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

router.get('/', getOrganizations as any);
router.post('/', addOrganization as any);
router.put('/:id', updateOrganization as any);
router.delete('/:id', deleteOrganization as any);
router.get('/:orgId/users', getUsersByOrg as any);
router.get('/:orgId/subscription', getSubscriptionForOrg as any);
router.get('/:orgId/referral-config', getReferralConfig as any);
router.put('/:orgId/referral-config', updateReferralConfig as any);

export default router;