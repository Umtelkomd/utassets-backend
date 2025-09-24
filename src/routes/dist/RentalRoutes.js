"use strict";
exports.__esModule = true;
var express_1 = require("express");
var RentalController_1 = require("../controllers/RentalController");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var router = express_1.Router();
// Rutas CRUD para alquileres
router.post('/', authMiddleware_1.authMiddleware, RentalController_1.rentalController.createRental);
router.get('/', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getAllRentals);
router.get('/:id', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getRental);
router.put('/:id', authMiddleware_1.authMiddleware, RentalController_1.rentalController.updateRental);
router["delete"]('/:id', authMiddleware_1.authMiddleware, RentalController_1.rentalController.deleteRental);
// Rutas adicionales
router.get('/by-object/:objectId', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getRentalsByObject);
router.get('/by-date-range', authMiddleware_1.authMiddleware, RentalController_1.rentalController.getRentalsByDateRange);
exports["default"] = router;
