import { Router } from 'express';
import { HousingController } from '../controllers/HousingController';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ConfigService } from '@nestjs/config';

const router = Router();
const controller = new HousingController(new ConfigService());

// Rutas públicas
router.get('/', controller.getAll.bind(controller));
router.get('/available', controller.getAvailable.bind(controller));
router.get('/:id', controller.getById.bind(controller));

// Rutas protegidas
router.use(authMiddleware);

// Rutas que requieren autenticación
router.post('/', upload.single('image'), handleMulterError, controller.create.bind(controller));
router.put('/:id', upload.single('image'), handleMulterError, controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Rutas de búsqueda
router.get('/search/bedrooms', controller.searchByBedrooms.bind(controller));
router.get('/search/address', controller.searchByAddress.bind(controller));

// Rutas específicas para imágenes
router.put('/:id/image', upload.single('image'), handleMulterError, controller.updateImage.bind(controller));
router.delete('/:id/image', controller.deleteImage.bind(controller));

export default router; 