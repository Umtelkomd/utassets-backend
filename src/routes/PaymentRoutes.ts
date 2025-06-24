import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();
const paymentController = new PaymentController();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas públicas (para técnicos y administradores)
router.get('/', paymentController.getPayments);
router.get('/overdue', paymentController.getOverduePayments);
router.get('/upcoming', paymentController.getUpcomingPayments);
router.get('/monthly-summary', paymentController.getMonthlyPaymentSummary);
router.get('/financing/:financingId/summary', paymentController.getPaymentSummary);
router.get('/:id', paymentController.getPaymentById);

// Rutas que requieren permisos de administrador
router.post('/:id/record', adminMiddleware, paymentController.recordPayment);
router.post('/record-multiple', adminMiddleware, paymentController.recordMultiplePayments);
router.put('/:id', adminMiddleware, paymentController.updatePayment);

// Tarea programada para marcar pagos vencidos
router.post('/mark-overdue', adminMiddleware, paymentController.markOverduePayments);

export default router; 