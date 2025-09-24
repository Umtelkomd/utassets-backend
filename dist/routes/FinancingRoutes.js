"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinancingController_1 = require("../controllers/FinancingController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
const financingController = new FinancingController_1.FinancingController();
// Aplicar autenticación a todas las rutas
router.use(authMiddleware_1.authMiddleware);
// Rutas públicas (para técnicos y administradores)
router.get('/', financingController.getFinancings);
router.get('/summary', financingController.getFinancingSummary);
router.get('/overdue', financingController.getOverdueFinancings);
router.get('/due-soon', financingController.getFinancingsDueSoon);
router.get('/:id', financingController.getFinancingById);
// Rutas que requieren permisos de administrador
router.post('/', adminMiddleware_1.adminMiddleware, financingController.createFinancing);
router.put('/:id', adminMiddleware_1.adminMiddleware, financingController.updateFinancing);
router.delete('/:id', adminMiddleware_1.adminMiddleware, financingController.deleteFinancing);
// Calculadora de escenarios (disponible para todos)
router.post('/calculate-scenarios', financingController.calculateFinancingScenarios);
exports.default = router;
