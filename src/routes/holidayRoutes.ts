import { Router } from 'express';
import { HolidayController } from '../controllers/HolidayController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';

const router = Router();
const holidayController = new HolidayController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener festivos de un usuario
router.get('/user/:userId', holidayController.getHolidaysByUser);

// Obtener festivos por rango de fechas
router.get('/user/:userId/range', holidayController.getHolidaysByUserAndDateRange);

// Solo administradores pueden crear, actualizar y eliminar festivos
router.post('/', roleMiddleware(['administrador']), holidayController.createHoliday);
router.post('/bulk', roleMiddleware(['administrador']), holidayController.createMultipleHolidays);
router.put('/:id', roleMiddleware(['administrador']), holidayController.updateHoliday);
router.delete('/:id', roleMiddleware(['administrador']), holidayController.deleteHoliday);
router.delete('/user/:userId', roleMiddleware(['administrador']), holidayController.deleteAllHolidaysByUser);

export default router;
