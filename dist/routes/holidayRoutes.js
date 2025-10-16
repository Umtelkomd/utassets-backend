"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HolidayController_1 = require("../controllers/HolidayController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
const holidayController = new HolidayController_1.HolidayController();
// Todas las rutas requieren autenticación
router.use(authMiddleware_1.authMiddleware);
// Obtener festivos de un usuario
router.get('/user/:userId', holidayController.getHolidaysByUser);
// Obtener festivos por rango de fechas
router.get('/user/:userId/range', holidayController.getHolidaysByUserAndDateRange);
// Solo administradores pueden crear, actualizar y eliminar festivos
router.post('/', (0, authMiddleware_1.hasRoles)([User_1.UserRole.ADMIN]), holidayController.createHoliday);
router.post('/bulk', (0, authMiddleware_1.hasRoles)([User_1.UserRole.ADMIN]), holidayController.createMultipleHolidays);
router.put('/:id', (0, authMiddleware_1.hasRoles)([User_1.UserRole.ADMIN]), holidayController.updateHoliday);
router.delete('/:id', (0, authMiddleware_1.hasRoles)([User_1.UserRole.ADMIN]), holidayController.deleteHoliday);
router.delete('/user/:userId', (0, authMiddleware_1.hasRoles)([User_1.UserRole.ADMIN]), holidayController.deleteAllHolidaysByUser);
exports.default = router;
