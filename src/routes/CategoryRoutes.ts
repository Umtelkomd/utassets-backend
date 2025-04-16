import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';

const router = Router();

// Rutas
router.post('/', categoryController.createCategory.bind(categoryController));
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategory.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

export default router; 