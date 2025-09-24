import { Router } from 'express';
import { inventoryProjectController } from '../controllers/InventoryProjectController';

const router = Router();

// Rutas
router.post('/', inventoryProjectController.assignInventoryToProject.bind(inventoryProjectController));
router.get('/', inventoryProjectController.getAllInventoryProjects.bind(inventoryProjectController));
router.get('/project/:projectId', inventoryProjectController.getInventoryProjectsByProject.bind(inventoryProjectController));
router.get('/inventory/:inventoryId', inventoryProjectController.getInventoryProjectsByInventory.bind(inventoryProjectController));
router.put('/:inventoryId/:projectId/:assignedDate', inventoryProjectController.updateInventoryProject.bind(inventoryProjectController));
router.put('/return/:inventoryId/:projectId/:assignedDate', inventoryProjectController.returnInventoryFromProject.bind(inventoryProjectController));
router.delete('/:inventoryId/:projectId/:assignedDate', inventoryProjectController.deleteInventoryProject.bind(inventoryProjectController));

export default router; 