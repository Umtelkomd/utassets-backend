"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
const paymentController = new PaymentController_1.PaymentController();
// Aplicar autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Rutas públicas (para técnicos y administradores)
router.get('/', paymentController.getPayments);
router.get('/overdue', paymentController.getOverduePayments);
router.get('/upcoming', paymentController.getUpcomingPayments);
router.get('/monthly-summary', paymentController.getMonthlyPaymentSummary);
router.get('/financing/:financingId/summary', paymentController.getPaymentSummary);
router.get('/:id', paymentController.getPaymentById);
// Rutas que requieren permisos de administrador
router.post('/:id/record', adminMiddleware_1.adminMiddleware, paymentController.recordPayment);
router.post('/record-multiple', adminMiddleware_1.adminMiddleware, paymentController.recordMultiplePayments);
router.put('/:id', adminMiddleware_1.adminMiddleware, paymentController.updatePayment);
// Tarea programada para marcar pagos vencidos
router.post('/mark-overdue', adminMiddleware_1.adminMiddleware, paymentController.markOverduePayments);
exports.default = router;
