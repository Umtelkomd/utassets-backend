import { Router } from 'express';
import { inventoryController } from '../controllers/InventoryController';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rutas públicas
router.get('/', inventoryController.getAllItems.bind(inventoryController));
router.get('/:id', inventoryController.getItem.bind(inventoryController));

// Rutas protegidas
router.use(authMiddleware);

// Rutas que requieren autenticación
router.post('/', upload.single('image'), handleMulterError, inventoryController.createItem.bind(inventoryController));
router.put('/:id', upload.single('image'), handleMulterError, inventoryController.updateItem.bind(inventoryController));
router.delete('/:id', inventoryController.deleteItem.bind(inventoryController));

// Rutas para manejo de imágenes
router.put('/:id/image', upload.single('image'), handleMulterError, inventoryController.updateItemImage.bind(inventoryController));
router.delete('/:id/image', inventoryController.deleteItemImage.bind(inventoryController));

// Rutas para manejo de usuarios responsables
router.post('/:id/responsibles', inventoryController.addResponsibleUser.bind(inventoryController));
router.delete('/:id/responsibles', inventoryController.removeResponsibleUser.bind(inventoryController));
router.get('/:id/responsibles', inventoryController.getResponsibleUsers.bind(inventoryController));

export default router;