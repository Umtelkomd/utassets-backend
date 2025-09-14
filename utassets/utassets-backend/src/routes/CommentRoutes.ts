import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const commentController = new CommentController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Comment routes
router.get('/report/:reportId', commentController.getByReportId);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

export default router; 