import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const reportController = new ReportController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Report routes
router.post('/', reportController.create);
router.get('/', reportController.getAll);
router.get('/:id', reportController.getById);
router.put('/:id', reportController.update);
router.delete('/:id', reportController.delete);

// Comment routes within reports
router.post('/:id/comments', reportController.addComment);

export default router; 