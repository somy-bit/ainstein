import { Router } from 'express';
import { getPlanTemplates, createPlanTemplate, updatePlanTemplate, deletePlanTemplate } from '../controllers/planTemplate.controller';

const router = Router();

router.get('/', getPlanTemplates);
router.post('/', createPlanTemplate);
router.put('/:id', updatePlanTemplate);
router.delete('/:id', deletePlanTemplate);

export default router;
