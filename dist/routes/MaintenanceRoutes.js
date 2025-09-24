"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MaintenanceController_1 = require("../controllers/MaintenanceController");
const router = (0, express_1.Router)();
// Rutas
router.post('/', MaintenanceController_1.maintenanceController.createMaintenance.bind(MaintenanceController_1.maintenanceController));
router.get('/', MaintenanceController_1.maintenanceController.getAllMaintenance.bind(MaintenanceController_1.maintenanceController));
router.get('/:id', MaintenanceController_1.maintenanceController.getMaintenance.bind(MaintenanceController_1.maintenanceController));
router.get('/inventory/:inventoryId', MaintenanceController_1.maintenanceController.getMaintenanceByInventoryId.bind(MaintenanceController_1.maintenanceController));
router.put('/:id', MaintenanceController_1.maintenanceController.updateMaintenance.bind(MaintenanceController_1.maintenanceController));
router.delete('/:id', MaintenanceController_1.maintenanceController.deleteMaintenance.bind(MaintenanceController_1.maintenanceController));
exports.default = router;
