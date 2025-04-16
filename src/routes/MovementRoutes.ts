import { Router } from 'express';
import { movementController } from '../controllers/MovementController';

const router = Router();

// Rutas
router.post('/', movementController.createMovement.bind(movementController));
router.get('/', movementController.getAllMovements.bind(movementController));
router.get('/:id', movementController.getMovement.bind(movementController));
router.get('/inventory/:inventoryId', movementController.getMovementsByInventoryId.bind(movementController));
router.put('/:id', movementController.updateMovement.bind(movementController));
router.delete('/:id', movementController.deleteMovement.bind(movementController));

export default router; 