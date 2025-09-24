"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RentalController_1 = require("../controllers/RentalController");
const router = (0, express_1.Router)();
const controller = new RentalController_1.RentalController();
// Rutas CRUD básicas
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
// Ruta para obtener campos requeridos por tipo
router.get('/fields/:type', controller.getRequiredFields.bind(controller));
exports.default = router;
