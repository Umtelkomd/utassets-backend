import { Router } from 'express';
import { fiberControlController } from '../controllers/FiberControlController';

const router = Router();

// Work Orders
router.post('/work-orders', fiberControlController.createWorkOrder.bind(fiberControlController));
router.get('/work-orders', fiberControlController.getAllWorkOrders.bind(fiberControlController));
router.get('/work-orders/status/:status', fiberControlController.getWorkOrdersByStatus.bind(fiberControlController));
router.get('/work-orders/:id', fiberControlController.getWorkOrder.bind(fiberControlController));
router.put('/work-orders/:id', fiberControlController.updateWorkOrder.bind(fiberControlController));
router.delete('/work-orders/:id', fiberControlController.deleteWorkOrder.bind(fiberControlController));

// Activities
router.post('/activities', fiberControlController.createActivity.bind(fiberControlController));
router.get('/activities', fiberControlController.getAllActivities.bind(fiberControlController));
router.get('/activities/:id', fiberControlController.getActivity.bind(fiberControlController));
router.put('/activities/:id', fiberControlController.updateActivity.bind(fiberControlController));
router.delete('/activities/:id', fiberControlController.deleteActivity.bind(fiberControlController));

// Technicians
router.post('/technicians', fiberControlController.createTechnician.bind(fiberControlController));
router.get('/technicians', fiberControlController.getAllTechnicians.bind(fiberControlController));
router.get('/technicians/:id', fiberControlController.getTechnician.bind(fiberControlController));
router.put('/technicians/:id', fiberControlController.updateTechnician.bind(fiberControlController));
router.delete('/technicians/:id', fiberControlController.deleteTechnician.bind(fiberControlController));

// Equipment
router.post('/equipment', fiberControlController.createEquipment.bind(fiberControlController));
router.get('/equipment', fiberControlController.getAllEquipment.bind(fiberControlController));
router.get('/equipment/:id', fiberControlController.getEquipment.bind(fiberControlController));
router.put('/equipment/:id', fiberControlController.updateEquipment.bind(fiberControlController));
router.delete('/equipment/:id', fiberControlController.deleteEquipment.bind(fiberControlController));

// Materials
router.post('/materials', fiberControlController.createMaterial.bind(fiberControlController));
router.get('/materials', fiberControlController.getAllMaterials.bind(fiberControlController));
router.get('/materials/:id', fiberControlController.getMaterial.bind(fiberControlController));
router.put('/materials/:id', fiberControlController.updateMaterial.bind(fiberControlController));
router.delete('/materials/:id', fiberControlController.deleteMaterial.bind(fiberControlController));

// Subcontractors
router.post('/subcontractors', fiberControlController.createSubcontractor.bind(fiberControlController));
router.get('/subcontractors', fiberControlController.getAllSubcontractors.bind(fiberControlController));
router.get('/subcontractors/:id', fiberControlController.getSubcontractor.bind(fiberControlController));
router.put('/subcontractors/:id', fiberControlController.updateSubcontractor.bind(fiberControlController));
router.delete('/subcontractors/:id', fiberControlController.deleteSubcontractor.bind(fiberControlController));

// Settings
router.get('/settings', fiberControlController.getSettings.bind(fiberControlController));
router.put('/settings', fiberControlController.updateSettings.bind(fiberControlController));

// Initialize all default data
router.get('/initialize', fiberControlController.initializeDefaultData.bind(fiberControlController));

export default router;
