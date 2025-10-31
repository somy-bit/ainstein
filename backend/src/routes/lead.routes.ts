import { Router } from 'express';
import { getLeads, addLead, updateLead } from '../controllers/lead.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

router.get('/', getLeads as any);
router.post('/', addLead as any);
router.put('/:id', updateLead as any);

export default router;
