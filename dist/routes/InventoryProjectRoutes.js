"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InventoryProjectController_1 = require("../controllers/InventoryProjectController");
const router = (0, express_1.Router)();
// Rutas
router.post('/', InventoryProjectController_1.inventoryProjectController.assignInventoryToProject.bind(InventoryProjectController_1.inventoryProjectController));
router.get('/', InventoryProjectController_1.inventoryProjectController.getAllInventoryProjects.bind(InventoryProjectController_1.inventoryProjectController));
router.get('/project/:projectId', InventoryProjectController_1.inventoryProjectController.getInventoryProjectsByProject.bind(InventoryProjectController_1.inventoryProjectController));
router.get('/inventory/:inventoryId', InventoryProjectController_1.inventoryProjectController.getInventoryProjectsByInventory.bind(InventoryProjectController_1.inventoryProjectController));
router.put('/:inventoryId/:projectId/:assignedDate', InventoryProjectController_1.inventoryProjectController.updateInventoryProject.bind(InventoryProjectController_1.inventoryProjectController));
router.put('/return/:inventoryId/:projectId/:assignedDate', InventoryProjectController_1.inventoryProjectController.returnInventoryFromProject.bind(InventoryProjectController_1.inventoryProjectController));
router.delete('/:inventoryId/:projectId/:assignedDate', InventoryProjectController_1.inventoryProjectController.deleteInventoryProject.bind(InventoryProjectController_1.inventoryProjectController));
exports.default = router;
