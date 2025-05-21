"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HousingController_1 = require("../controllers/HousingController");
const router = (0, express_1.Router)();
const controller = new HousingController_1.HousingController();
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
exports.default = router;
