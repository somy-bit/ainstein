import { Router } from 'express';
import { getPosts, addPost, updatePost, deletePost, addComment } from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPosts);
router.post('/', authenticateToken, addPost as any);
router.put('/:id', authenticateToken, updatePost as any);
router.delete('/:id', authenticateToken, deletePost as any);
router.post('/:postId/comments', authenticateToken, addComment as any);

export default router;
