"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RentalController_1 = require("../controllers/RentalController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Ruta para verificar disponibilidad
router.get('/availability', authMiddleware_1.authMiddleware, RentalController_1.rentalController.checkAvailability);
// Rutas CRUD para alquileres
router.post('/', authMiddleware_1.authMiddleware, RentalController_1.rentalController.createRental);
router.get('/', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getAllRentals);
router.get('/:id', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getRental);
router.put('/:id', authMiddleware_1.authMiddleware, RentalController_1.rentalController.updateRental);
router.delete('/:id', authMiddleware_1.authMiddleware, RentalController_1.rentalController.deleteRental);
// Rutas adicionales
router.get('/by-object/:objectId', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getRentalsByObject);
router.get('/by-date-range', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getRentalsByDateRange);
exports.default = router;
