import { Router } from 'express';
import { HousingController } from '../controllers/HousingController';

const router = Router();
const controller = new HousingController();

// Rutas CRUD básicas
router.get('/', controller.getAll.bind(controller));
router.get('/available', controller.getAvailable.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Rutas de búsqueda
router.get('/search/bedrooms', controller.searchByBedrooms.bind(controller));
router.get('/search/address', controller.searchByAddress.bind(controller));

export default router; 