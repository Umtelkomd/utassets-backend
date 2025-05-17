import { Router } from 'express';
import { rentalController } from '../controllers/RentalController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rutas CRUD para alquileres
router.post('/', authMiddleware, rentalController.createRental);
router.get('/', authMiddleware, rentalController.getAllRentals);
router.get('/:id', authMiddleware, rentalController.getRental);
router.put('/:id', authMiddleware, rentalController.updateRental);
router.delete('/:id', authMiddleware, rentalController.deleteRental);

// Rutas adicionales
router.get('/by-object/:objectId', authMiddleware, rentalController.getRentalsByObject);
router.get('/by-date-range', authMiddleware, rentalController.getRentalsByDateRange);

export default router; 