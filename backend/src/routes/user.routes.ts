import { Router } from 'express';
import { getAllUsers, addUser, updateUser, fetchCurrentUser, deleteUser } from '../controllers/user.controller';
import { extractOrgId } from '../middleware/extractOrgId';
import { updateUsageAfterUserOperation } from '../middleware/updateUsageCounters';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

router.get('/', getAllUsers as any);
router.post('/', updateUsageAfterUserOperation('create'), addUser as any);
router.put('/:id', updateUser as any);
router.delete('/:id', extractOrgId, updateUsageAfterUserOperation('delete'), deleteUser as any);
router.get('/current', fetchCurrentUser as any);

export default router;


