"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RentalController_1 = require("../controllers/RentalController");
const router = (0, express_1.Router)();
const controller = new RentalController_1.RentalController();
// Rutas CRUD básicas
router.get('/rental', controller.getAll.bind(controller));
router.get('/rental/:id', controller.getById.bind(controller));
router.post('/rental', controller.create.bind(controller));
router.put('/rental/:id', controller.update.bind(controller));
router.delete('/rental/:id', controller.delete.bind(controller));
// Ruta para obtener campos requeridos por tipo
router.get('/rental/fields/:type', controller.getRequiredFields.bind(controller));
exports.default = router;
