"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InventoryController_1 = require("../controllers/InventoryController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', InventoryController_1.inventoryController.getAllItems.bind(InventoryController_1.inventoryController));
router.get('/:id', InventoryController_1.inventoryController.getItem.bind(InventoryController_1.inventoryController));
// Rutas protegidas
router.use(authMiddleware_1.authMiddleware);
// Rutas que requieren autenticación
router.post('/', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, InventoryController_1.inventoryController.createItem.bind(InventoryController_1.inventoryController));
router.put('/:id', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, InventoryController_1.inventoryController.updateItem.bind(InventoryController_1.inventoryController));
router.delete('/:id', InventoryController_1.inventoryController.deleteItem.bind(InventoryController_1.inventoryController));
// Rutas para manejo de imágenes
router.put('/:id/image', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, InventoryController_1.inventoryController.updateItemImage.bind(InventoryController_1.inventoryController));
router.delete('/:id/image', InventoryController_1.inventoryController.deleteItemImage.bind(InventoryController_1.inventoryController));
// Rutas para manejo de usuarios responsables
router.post('/:id/responsibles', InventoryController_1.inventoryController.addResponsibleUser.bind(InventoryController_1.inventoryController));
router.delete('/:id/responsibles', InventoryController_1.inventoryController.removeResponsibleUser.bind(InventoryController_1.inventoryController));
router.get('/:id/responsibles', InventoryController_1.inventoryController.getResponsibleUsers.bind(InventoryController_1.inventoryController));
exports.default = router;
