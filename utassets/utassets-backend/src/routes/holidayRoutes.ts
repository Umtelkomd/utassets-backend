import { Router } from 'express';
import { HolidayController } from '../controllers/HolidayController';
import { authMiddleware, hasRoles } from '../middlewares/authMiddleware';
import { UserRole } from '../entity/User';

const router = Router();
const holidayController = new HolidayController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener festivos de un usuario
router.get('/user/:userId', holidayController.getHolidaysByUser);

// Obtener festivos por rango de fechas
router.get('/user/:userId/range', holidayController.getHolidaysByUserAndDateRange);

// Solo administradores pueden crear, actualizar y eliminar festivos
router.post('/', hasRoles([UserRole.ADMIN]), holidayController.createHoliday);
router.post('/bulk', hasRoles([UserRole.ADMIN]), holidayController.createMultipleHolidays);
router.put('/:id', hasRoles([UserRole.ADMIN]), holidayController.updateHoliday);
router.delete('/:id', hasRoles([UserRole.ADMIN]), holidayController.deleteHoliday);
router.delete('/user/:userId', hasRoles([UserRole.ADMIN]), holidayController.deleteAllHolidaysByUser);

export default router;
