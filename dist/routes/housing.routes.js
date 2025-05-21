"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HousingController_1 = require("../controllers/HousingController");
const router = (0, express_1.Router)();
const controller = new HousingController_1.HousingController();
// Rutas CRUD básicas
router.get('/housing', controller.getAll.bind(controller));
router.get('/housing/available', controller.getAvailable.bind(controller));
router.get('/housing/:id', controller.getById.bind(controller));
router.post('/housing', controller.create.bind(controller));
router.put('/housing/:id', controller.update.bind(controller));
router.delete('/housing/:id', controller.delete.bind(controller));
// Rutas de búsqueda
router.get('/housing/search/price', controller.searchByPriceRange.bind(controller));
router.get('/housing/search/bedrooms', controller.searchByBedrooms.bind(controller));
router.get('/housing/search/address', controller.searchByAddress.bind(controller));
exports.default = router;
