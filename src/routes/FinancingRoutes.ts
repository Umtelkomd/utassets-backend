import { Router } from 'express';
import { FinancingController } from '../controllers/FinancingController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();
const financingController = new FinancingController();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas públicas (para técnicos y administradores)
router.get('/', financingController.getFinancings);
router.get('/summary', financingController.getFinancingSummary);
router.get('/overdue', financingController.getOverdueFinancings);
router.get('/due-soon', financingController.getFinancingsDueSoon);
router.get('/:id', financingController.getFinancingById);

// Rutas que requieren permisos de administrador
router.post('/', adminMiddleware, financingController.createFinancing);
router.put('/:id', adminMiddleware, financingController.updateFinancing);
router.delete('/:id', adminMiddleware, financingController.deleteFinancing);

// Calculadora de escenarios (disponible para todos)
router.post('/calculate-scenarios', financingController.calculateFinancingScenarios);

export default router; 