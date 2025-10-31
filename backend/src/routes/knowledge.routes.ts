import { Router } from 'express';
import { getKnowledgeFiles, addKnowledgeFile, deleteKnowledgeFile, downloadKnowledgeFile, uploadKnowledgeFile, upload, getMarketingEvents, addMarketingEvent } from '../controllers/knowledge.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken as any);

router.get('/files', getKnowledgeFiles as any);
router.post('/files', addKnowledgeFile as any);
router.post('/files/upload', upload.single('file'), uploadKnowledgeFile as any);
router.get('/files/:id/download', downloadKnowledgeFile as any);
router.delete('/files/:id', deleteKnowledgeFile as any);
router.get('/marketing-events', getMarketingEvents);
router.post('/marketing-events', addMarketingEvent);

export default router;
