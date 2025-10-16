"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FiberControlController_1 = require("../controllers/FiberControlController");
const router = (0, express_1.Router)();
// Work Orders
router.post('/work-orders', FiberControlController_1.fiberControlController.createWorkOrder.bind(FiberControlController_1.fiberControlController));
router.get('/work-orders', FiberControlController_1.fiberControlController.getAllWorkOrders.bind(FiberControlController_1.fiberControlController));
router.get('/work-orders/status/:status', FiberControlController_1.fiberControlController.getWorkOrdersByStatus.bind(FiberControlController_1.fiberControlController));
router.get('/work-orders/:id', FiberControlController_1.fiberControlController.getWorkOrder.bind(FiberControlController_1.fiberControlController));
router.put('/work-orders/:id', FiberControlController_1.fiberControlController.updateWorkOrder.bind(FiberControlController_1.fiberControlController));
router.delete('/work-orders/:id', FiberControlController_1.fiberControlController.deleteWorkOrder.bind(FiberControlController_1.fiberControlController));
// Activities
router.post('/activities', FiberControlController_1.fiberControlController.createActivity.bind(FiberControlController_1.fiberControlController));
router.get('/activities', FiberControlController_1.fiberControlController.getAllActivities.bind(FiberControlController_1.fiberControlController));
router.get('/activities/:id', FiberControlController_1.fiberControlController.getActivity.bind(FiberControlController_1.fiberControlController));
router.put('/activities/:id', FiberControlController_1.fiberControlController.updateActivity.bind(FiberControlController_1.fiberControlController));
router.delete('/activities/:id', FiberControlController_1.fiberControlController.deleteActivity.bind(FiberControlController_1.fiberControlController));
// Technicians
router.post('/technicians', FiberControlController_1.fiberControlController.createTechnician.bind(FiberControlController_1.fiberControlController));
router.get('/technicians', FiberControlController_1.fiberControlController.getAllTechnicians.bind(FiberControlController_1.fiberControlController));
router.get('/technicians/:id', FiberControlController_1.fiberControlController.getTechnician.bind(FiberControlController_1.fiberControlController));
router.put('/technicians/:id', FiberControlController_1.fiberControlController.updateTechnician.bind(FiberControlController_1.fiberControlController));
router.delete('/technicians/:id', FiberControlController_1.fiberControlController.deleteTechnician.bind(FiberControlController_1.fiberControlController));
// Equipment
router.post('/equipment', FiberControlController_1.fiberControlController.createEquipment.bind(FiberControlController_1.fiberControlController));
router.get('/equipment', FiberControlController_1.fiberControlController.getAllEquipment.bind(FiberControlController_1.fiberControlController));
router.get('/equipment/:id', FiberControlController_1.fiberControlController.getEquipment.bind(FiberControlController_1.fiberControlController));
router.put('/equipment/:id', FiberControlController_1.fiberControlController.updateEquipment.bind(FiberControlController_1.fiberControlController));
router.delete('/equipment/:id', FiberControlController_1.fiberControlController.deleteEquipment.bind(FiberControlController_1.fiberControlController));
// Materials
router.post('/materials', FiberControlController_1.fiberControlController.createMaterial.bind(FiberControlController_1.fiberControlController));
router.get('/materials', FiberControlController_1.fiberControlController.getAllMaterials.bind(FiberControlController_1.fiberControlController));
router.get('/materials/:id', FiberControlController_1.fiberControlController.getMaterial.bind(FiberControlController_1.fiberControlController));
router.put('/materials/:id', FiberControlController_1.fiberControlController.updateMaterial.bind(FiberControlController_1.fiberControlController));
router.delete('/materials/:id', FiberControlController_1.fiberControlController.deleteMaterial.bind(FiberControlController_1.fiberControlController));
// Subcontractors
router.post('/subcontractors', FiberControlController_1.fiberControlController.createSubcontractor.bind(FiberControlController_1.fiberControlController));
router.get('/subcontractors', FiberControlController_1.fiberControlController.getAllSubcontractors.bind(FiberControlController_1.fiberControlController));
router.get('/subcontractors/:id', FiberControlController_1.fiberControlController.getSubcontractor.bind(FiberControlController_1.fiberControlController));
router.put('/subcontractors/:id', FiberControlController_1.fiberControlController.updateSubcontractor.bind(FiberControlController_1.fiberControlController));
router.delete('/subcontractors/:id', FiberControlController_1.fiberControlController.deleteSubcontractor.bind(FiberControlController_1.fiberControlController));
// Settings
router.get('/settings', FiberControlController_1.fiberControlController.getSettings.bind(FiberControlController_1.fiberControlController));
router.put('/settings', FiberControlController_1.fiberControlController.updateSettings.bind(FiberControlController_1.fiberControlController));
// Initialize all default data
router.get('/initialize', FiberControlController_1.fiberControlController.initializeDefaultData.bind(FiberControlController_1.fiberControlController));
exports.default = router;
