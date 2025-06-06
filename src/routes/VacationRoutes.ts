import { Router } from 'express';
import { VacationController } from '../controllers/VacationController';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';

const router = Router();
const controller = new VacationController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Todas las rutas de vacaciones requieren permisos de administrador
router.use(isAdmin);

// Rutas para vacaciones
router.get('/', controller.getAllVacations.bind(controller));
router.get('/users', controller.getAllUsersAvailableDays.bind(controller));
router.get('/users/:userId', controller.getUserVacations.bind(controller));
router.get('/users/:userId/available-days', controller.getUserAvailableDays.bind(controller));
router.get('/date-range', controller.getVacationsByDateRange.bind(controller));
router.get('/conflicts/:date', controller.getDateConflicts.bind(controller));

router.post('/', controller.createVacation.bind(controller));
router.delete('/:id', controller.deleteVacation.bind(controller));

export default router; 