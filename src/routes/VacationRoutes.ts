import { Router } from 'express';
import { VacationController } from '../controllers/VacationController';
import { authMiddleware, isAdmin, hasRoles } from '../middlewares/authMiddleware';
import { UserRole } from '../entity/User';

const router = Router();
const controller = new VacationController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas disponibles para técnicos y administradores
router.get('/users/:userId', controller.getUserVacations.bind(controller));
router.get('/users/:userId/available-days', controller.getUserAvailableDays.bind(controller));
router.post('/', controller.createVacation.bind(controller));

// Rutas para verificación de conflictos (necesarias para técnicos al crear solicitudes)
router.get('/date-range', controller.getVacationsByDateRange.bind(controller));
router.get('/conflicts/:date', controller.getDateConflicts.bind(controller));

// Rutas que requieren permisos de administrador
router.use(isAdmin);

// Rutas para vacaciones (solo administradores)
router.get('/', controller.getAllVacations.bind(controller));
router.get('/users', controller.getAllUsersAvailableDays.bind(controller));

// Ruta para ajustar días de vacaciones (debe ir antes que las rutas con parámetros dinámicos)
router.put('/users/:userId/vacation-days', controller.updateUserVacationDays.bind(controller));

// Ruta para actualizar vacaciones existentes con días hábiles calculados
router.put('/update-working-days', controller.updateExistingVacationsWorkingDays.bind(controller));

// Rutas para gestión de solicitudes pendientes
router.get('/pending', controller.getPendingVacations.bind(controller));
router.get('/pending/grouped', controller.getPendingVacationsGrouped.bind(controller));
router.put('/:id/approve', controller.approveVacation.bind(controller));
router.delete('/:id/reject', controller.rejectVacation.bind(controller));
router.put('/approve/bulk', controller.approveBulkVacations.bind(controller));
router.put('/approve/period', controller.approvePeriodVacations.bind(controller));
router.delete('/reject/period', controller.rejectPeriodVacations.bind(controller));

router.delete('/:id', controller.deleteVacation.bind(controller));
router.delete('/bulk/multiple', controller.deleteBulkVacations.bind(controller));

export default router; 