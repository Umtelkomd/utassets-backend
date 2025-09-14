import { Router } from 'express';
import { maintenanceController } from '../controllers/MaintenanceController';

const router = Router();

// Rutas
router.post('/', maintenanceController.createMaintenance.bind(maintenanceController));
router.get('/', maintenanceController.getAllMaintenance.bind(maintenanceController));
router.get('/:id', maintenanceController.getMaintenance.bind(maintenanceController));
router.get('/inventory/:inventoryId', maintenanceController.getMaintenanceByInventoryId.bind(maintenanceController));
router.put('/:id', maintenanceController.updateMaintenance.bind(maintenanceController));
router.delete('/:id', maintenanceController.deleteMaintenance.bind(maintenanceController));

export default router; 