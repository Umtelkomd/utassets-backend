"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VacationController_1 = require("../controllers/VacationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const controller = new VacationController_1.VacationController();
// Todas las rutas requieren autenticación
router.use(authMiddleware_1.authMiddleware);
// Rutas disponibles para técnicos y administradores
router.get('/users/:userId', controller.getUserVacations.bind(controller));
router.get('/users/:userId/available-days', controller.getUserAvailableDays.bind(controller));
router.post('/', controller.createVacation.bind(controller));
// Rutas para verificación de conflictos (necesarias para técnicos al crear solicitudes)
router.get('/date-range', controller.getVacationsByDateRange.bind(controller));
router.get('/conflicts/:date', controller.getDateConflicts.bind(controller));
// Rutas que requieren permisos de administrador
router.use(authMiddleware_1.isAdmin);
// Rutas para vacaciones (solo administradores)
router.get('/', controller.getAllVacations.bind(controller));
router.get('/users', controller.getAllUsersAvailableDays.bind(controller));
// Rutas para gestión de solicitudes pendientes
router.get('/pending', controller.getPendingVacations.bind(controller));
router.put('/:id/approve', controller.approveVacation.bind(controller));
router.put('/approve/selected-days', controller.approveSelectedDaysFromRequest.bind(controller));
router.delete('/:id/reject', controller.rejectVacation.bind(controller));
router.put('/approve/bulk', controller.approveBulkVacations.bind(controller));
router.delete('/:id', controller.deleteVacation.bind(controller));
router.delete('/bulk/multiple', controller.deleteBulkVacations.bind(controller));
exports.default = router;
