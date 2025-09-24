import { Router } from 'express';
import { RentalController } from '../controllers/RentalController';

const router = Router();
const controller = new RentalController();

// Rutas CRUD básicas
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Ruta para obtener campos requeridos por tipo
router.get('/fields/:type', controller.getRequiredFields.bind(controller));

export default router; 