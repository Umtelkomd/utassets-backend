"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HousingController_1 = require("../controllers/HousingController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const config_1 = require("@nestjs/config");
const router = (0, express_1.Router)();
const controller = new HousingController_1.HousingController(new config_1.ConfigService());
// Rutas públicas
router.get('/', controller.getAll.bind(controller));
router.get('/available', controller.getAvailable.bind(controller));
router.get('/:id', controller.getById.bind(controller));
// Rutas protegidas
router.use(authMiddleware_1.authMiddleware);
// Rutas que requieren autenticación
router.post('/', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.create.bind(controller));
router.put('/:id', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
// Rutas de búsqueda
router.get('/search/bedrooms', controller.searchByBedrooms.bind(controller));
router.get('/search/address', controller.searchByAddress.bind(controller));
// Rutas específicas para imágenes
router.put('/:id/image', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.updateImage.bind(controller));
router.delete('/:id/image', controller.deleteImage.bind(controller));
exports.default = router;
