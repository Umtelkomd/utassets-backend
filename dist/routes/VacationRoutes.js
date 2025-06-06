"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VacationController_1 = require("../controllers/VacationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const controller = new VacationController_1.VacationController();
// Todas las rutas requieren autenticación
router.use(authMiddleware_1.authMiddleware);
// Todas las rutas de vacaciones requieren permisos de administrador
router.use(authMiddleware_1.isAdmin);
// Rutas para vacaciones
router.get('/', controller.getAllVacations.bind(controller));
router.get('/users', controller.getAllUsersAvailableDays.bind(controller));
router.get('/users/:userId', controller.getUserVacations.bind(controller));
router.get('/users/:userId/available-days', controller.getUserAvailableDays.bind(controller));
router.get('/date-range', controller.getVacationsByDateRange.bind(controller));
router.get('/conflicts/:date', controller.getDateConflicts.bind(controller));
router.post('/', controller.createVacation.bind(controller));
router.delete('/:id', controller.deleteVacation.bind(controller));
exports.default = router;
