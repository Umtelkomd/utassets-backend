"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberControlController = exports.FiberControlController = void 0;
const FiberWorkOrderRepository_1 = require("../repositories/FiberWorkOrderRepository");
const FiberActivityRepository_1 = require("../repositories/FiberActivityRepository");
const FiberTechnicianRepository_1 = require("../repositories/FiberTechnicianRepository");
const FiberEquipmentRepository_1 = require("../repositories/FiberEquipmentRepository");
const FiberMaterialRepository_1 = require("../repositories/FiberMaterialRepository");
const FiberSubcontractorRepository_1 = require("../repositories/FiberSubcontractorRepository");
const FiberSettingsRepository_1 = require("../repositories/FiberSettingsRepository");
class FiberControlController {
    // ==================== WORK ORDERS ====================
    async createWorkOrder(req, res) {
        try {
            const workOrder = req.body;
            const requiredFields = ['orderNumber', 'projectName', 'clientName', 'status', 'startDate', 'executorType'];
            const missingFields = requiredFields.filter(field => !workOrder[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }
            if (typeof workOrder.startDate === 'string') {
                workOrder.startDate = new Date(workOrder.startDate);
            }
            if (workOrder.endDate && typeof workOrder.endDate === 'string' && workOrder.endDate.trim() !== '') {
                workOrder.endDate = new Date(workOrder.endDate);
            }
            else {
                workOrder.endDate = null;
            }
            const newWorkOrder = await FiberWorkOrderRepository_1.fiberWorkOrderRepository.createWorkOrder(workOrder);
            res.status(201).json(newWorkOrder);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la orden de trabajo', error: error.message });
        }
    }
    async getAllWorkOrders(_req, res) {
        try {
            const workOrders = await FiberWorkOrderRepository_1.fiberWorkOrderRepository.getAllWorkOrders();
            res.status(200).json(workOrders);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las órdenes de trabajo', error: error.message });
        }
    }
    async getWorkOrder(req, res) {
        try {
            const id = req.params.id;
            const workOrder = await FiberWorkOrderRepository_1.fiberWorkOrderRepository.getWorkOrderById(id);
            if (!workOrder) {
                res.status(404).json({ message: 'Orden de trabajo no encontrada' });
                return;
            }
            res.status(200).json(workOrder);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la orden de trabajo', error: error.message });
        }
    }
    async getWorkOrdersByStatus(req, res) {
        try {
            const status = req.params.status;
            const workOrders = await FiberWorkOrderRepository_1.fiberWorkOrderRepository.getWorkOrdersByStatus(status);
            res.status(200).json(workOrders);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las órdenes de trabajo', error: error.message });
        }
    }
    async updateWorkOrder(req, res) {
        try {
            const id = req.params.id;
            const workOrder = req.body;
            if (typeof workOrder.startDate === 'string' && workOrder.startDate) {
                workOrder.startDate = new Date(workOrder.startDate);
            }
            if (workOrder.endDate && typeof workOrder.endDate === 'string' && workOrder.endDate.trim() !== '') {
                workOrder.endDate = new Date(workOrder.endDate);
            }
            else {
                workOrder.endDate = null;
            }
            const updatedWorkOrder = await FiberWorkOrderRepository_1.fiberWorkOrderRepository.updateWorkOrder(id, workOrder);
            if (!updatedWorkOrder) {
                res.status(404).json({ message: 'Orden de trabajo no encontrada' });
                return;
            }
            res.status(200).json(updatedWorkOrder);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la orden de trabajo', error: error.message });
        }
    }
    async deleteWorkOrder(req, res) {
        try {
            const id = req.params.id;
            const deletedWorkOrder = await FiberWorkOrderRepository_1.fiberWorkOrderRepository.deleteWorkOrder(id);
            if (!deletedWorkOrder) {
                res.status(404).json({ message: 'Orden de trabajo no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Orden de trabajo eliminada', workOrder: deletedWorkOrder });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la orden de trabajo', error: error.message });
        }
    }
    // ==================== ACTIVITIES ====================
    async createActivity(req, res) {
        try {
            const activity = req.body;
            const requiredFields = ['id', 'description', 'unit', 'price'];
            const missingFields = requiredFields.filter(field => !activity[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }
            const newActivity = await FiberActivityRepository_1.fiberActivityRepository.createActivity(activity);
            res.status(201).json(newActivity);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la actividad', error: error.message });
        }
    }
    async getAllActivities(_req, res) {
        try {
            const activities = await FiberActivityRepository_1.fiberActivityRepository.getAllActivities();
            res.status(200).json(activities);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las actividades', error: error.message });
        }
    }
    async getActivity(req, res) {
        try {
            const id = req.params.id;
            const activity = await FiberActivityRepository_1.fiberActivityRepository.getActivityById(id);
            if (!activity) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }
            res.status(200).json(activity);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la actividad', error: error.message });
        }
    }
    async updateActivity(req, res) {
        try {
            const id = req.params.id;
            const activity = req.body;
            const updatedActivity = await FiberActivityRepository_1.fiberActivityRepository.updateActivity(id, activity);
            if (!updatedActivity) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }
            res.status(200).json(updatedActivity);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la actividad', error: error.message });
        }
    }
    async deleteActivity(req, res) {
        try {
            const id = req.params.id;
            const deletedActivity = await FiberActivityRepository_1.fiberActivityRepository.deleteActivity(id);
            if (!deletedActivity) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Actividad eliminada', activity: deletedActivity });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la actividad', error: error.message });
        }
    }
    // ==================== TECHNICIANS ====================
    async createTechnician(req, res) {
        try {
            const technician = req.body;
            const requiredFields = ['name', 'costPerHour'];
            const missingFields = requiredFields.filter(field => !technician[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }
            const newTechnician = await FiberTechnicianRepository_1.fiberTechnicianRepository.createTechnician(technician);
            res.status(201).json(newTechnician);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el técnico', error: error.message });
        }
    }
    async getAllTechnicians(_req, res) {
        try {
            const technicians = await FiberTechnicianRepository_1.fiberTechnicianRepository.getAllTechnicians();
            res.status(200).json(technicians);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los técnicos', error: error.message });
        }
    }
    async getTechnician(req, res) {
        try {
            const id = req.params.id;
            const technician = await FiberTechnicianRepository_1.fiberTechnicianRepository.getTechnicianById(id);
            if (!technician) {
                res.status(404).json({ message: 'Técnico no encontrado' });
                return;
            }
            res.status(200).json(technician);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el técnico', error: error.message });
        }
    }
    async updateTechnician(req, res) {
        try {
            const id = req.params.id;
            const technician = req.body;
            const updatedTechnician = await FiberTechnicianRepository_1.fiberTechnicianRepository.updateTechnician(id, technician);
            if (!updatedTechnician) {
                res.status(404).json({ message: 'Técnico no encontrado' });
                return;
            }
            res.status(200).json(updatedTechnician);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el técnico', error: error.message });
        }
    }
    async deleteTechnician(req, res) {
        try {
            const id = req.params.id;
            const deletedTechnician = await FiberTechnicianRepository_1.fiberTechnicianRepository.deleteTechnician(id);
            if (!deletedTechnician) {
                res.status(404).json({ message: 'Técnico no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Técnico eliminado', technician: deletedTechnician });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el técnico', error: error.message });
        }
    }
    // ==================== EQUIPMENT ====================
    async createEquipment(req, res) {
        try {
            const equipment = req.body;
            const requiredFields = ['name', 'costPerHour'];
            const missingFields = requiredFields.filter(field => !equipment[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }
            const newEquipment = await FiberEquipmentRepository_1.fiberEquipmentRepository.createEquipment(equipment);
            res.status(201).json(newEquipment);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el equipo', error: error.message });
        }
    }
    async getAllEquipment(_req, res) {
        try {
            const equipment = await FiberEquipmentRepository_1.fiberEquipmentRepository.getAllEquipment();
            res.status(200).json(equipment);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los equipos', error: error.message });
        }
    }
    async getEquipment(req, res) {
        try {
            const id = req.params.id;
            const equipment = await FiberEquipmentRepository_1.fiberEquipmentRepository.getEquipmentById(id);
            if (!equipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return;
            }
            res.status(200).json(equipment);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el equipo', error: error.message });
        }
    }
    async updateEquipment(req, res) {
        try {
            const id = req.params.id;
            const equipment = req.body;
            const updatedEquipment = await FiberEquipmentRepository_1.fiberEquipmentRepository.updateEquipment(id, equipment);
            if (!updatedEquipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return;
            }
            res.status(200).json(updatedEquipment);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el equipo', error: error.message });
        }
    }
    async deleteEquipment(req, res) {
        try {
            const id = req.params.id;
            const deletedEquipment = await FiberEquipmentRepository_1.fiberEquipmentRepository.deleteEquipment(id);
            if (!deletedEquipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Equipo eliminado', equipment: deletedEquipment });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el equipo', error: error.message });
        }
    }
    // ==================== MATERIALS ====================
    async createMaterial(req, res) {
        try {
            const material = req.body;
            const requiredFields = ['name', 'unit', 'cost'];
            const missingFields = requiredFields.filter(field => !material[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }
            const newMaterial = await FiberMaterialRepository_1.fiberMaterialRepository.createMaterial(material);
            res.status(201).json(newMaterial);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el material', error: error.message });
        }
    }
    async getAllMaterials(_req, res) {
        try {
            const materials = await FiberMaterialRepository_1.fiberMaterialRepository.getAllMaterials();
            res.status(200).json(materials);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los materiales', error: error.message });
        }
    }
    async getMaterial(req, res) {
        try {
            const id = req.params.id;
            const material = await FiberMaterialRepository_1.fiberMaterialRepository.getMaterialById(id);
            if (!material) {
                res.status(404).json({ message: 'Material no encontrado' });
                return;
            }
            res.status(200).json(material);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el material', error: error.message });
        }
    }
    async updateMaterial(req, res) {
        try {
            const id = req.params.id;
            const material = req.body;
            const updatedMaterial = await FiberMaterialRepository_1.fiberMaterialRepository.updateMaterial(id, material);
            if (!updatedMaterial) {
                res.status(404).json({ message: 'Material no encontrado' });
                return;
            }
            res.status(200).json(updatedMaterial);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el material', error: error.message });
        }
    }
    async deleteMaterial(req, res) {
        try {
            const id = req.params.id;
            const deletedMaterial = await FiberMaterialRepository_1.fiberMaterialRepository.deleteMaterial(id);
            if (!deletedMaterial) {
                res.status(404).json({ message: 'Material no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Material eliminado', material: deletedMaterial });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el material', error: error.message });
        }
    }
    // ==================== SUBCONTRACTORS ====================
    async createSubcontractor(req, res) {
        try {
            const subcontractor = req.body;
            const requiredFields = ['name'];
            const missingFields = requiredFields.filter(field => !subcontractor[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }
            const newSubcontractor = await FiberSubcontractorRepository_1.fiberSubcontractorRepository.createSubcontractor(subcontractor);
            res.status(201).json(newSubcontractor);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la subcontrata', error: error.message });
        }
    }
    async getAllSubcontractors(_req, res) {
        try {
            const subcontractors = await FiberSubcontractorRepository_1.fiberSubcontractorRepository.getAllSubcontractors();
            res.status(200).json(subcontractors);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las subcontratas', error: error.message });
        }
    }
    async getSubcontractor(req, res) {
        try {
            const id = req.params.id;
            const subcontractor = await FiberSubcontractorRepository_1.fiberSubcontractorRepository.getSubcontractorById(id);
            if (!subcontractor) {
                res.status(404).json({ message: 'Subcontrata no encontrada' });
                return;
            }
            res.status(200).json(subcontractor);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la subcontrata', error: error.message });
        }
    }
    async updateSubcontractor(req, res) {
        try {
            const id = req.params.id;
            const subcontractor = req.body;
            const updatedSubcontractor = await FiberSubcontractorRepository_1.fiberSubcontractorRepository.updateSubcontractor(id, subcontractor);
            if (!updatedSubcontractor) {
                res.status(404).json({ message: 'Subcontrata no encontrada' });
                return;
            }
            res.status(200).json(updatedSubcontractor);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la subcontrata', error: error.message });
        }
    }
    async deleteSubcontractor(req, res) {
        try {
            const id = req.params.id;
            const deletedSubcontractor = await FiberSubcontractorRepository_1.fiberSubcontractorRepository.deleteSubcontractor(id);
            if (!deletedSubcontractor) {
                res.status(404).json({ message: 'Subcontrata no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Subcontrata eliminada', subcontractor: deletedSubcontractor });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la subcontrata', error: error.message });
        }
    }
    // ==================== SETTINGS ====================
    async getSettings(_req, res) {
        try {
            const settings = await FiberSettingsRepository_1.fiberSettingsRepository.getSettings();
            res.status(200).json(settings);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la configuración', error: error.message });
        }
    }
    async updateSettings(req, res) {
        try {
            const settings = req.body;
            const updatedSettings = await FiberSettingsRepository_1.fiberSettingsRepository.updateSettings(settings);
            res.status(200).json(updatedSettings);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la configuración', error: error.message });
        }
    }
    // ==================== BULK INITIALIZATION ====================
    async initializeDefaultData(_req, res) {
        try {
            // Check if activities exist, if not create default ones
            let activities = await FiberActivityRepository_1.fiberActivityRepository.getAllActivities();
            if (activities.length === 0) {
                const defaultActivities = [
                    { id: 'DGF_ACT_001', description: 'HÜP-GFTA-ONT, FUSION + ACTIVAC.+ BOHRUNG', unit: 'UDS', price: 230.00 },
                    { id: 'DGF_ACT_003', description: 'HÜP-GFTA-ONT, FUSION + BOHRUNG', unit: 'UDS', price: 184.00 },
                    { id: 'DGF_ACT_004', description: 'HÜP-GFTA-ONT, ACTIVATION PART', unit: 'UDS', price: 46.00 },
                    { id: 'DGF_BLOW_001', description: 'Blow 6/12/24 Glasfaserkabel (RD)', unit: 'ML', price: 0.43 },
                    { id: 'DGF_BLOW_002', description: 'Blow 48/96/144 Glasfaserkabel (RA)', unit: 'ML', price: 0.62 },
                    { id: 'DGF_BLOW_003', description: 'DP INSTALLATIONDP (TRAY, ROUTING PIPES INCL.)', unit: 'UDS', price: 705.00 },
                    { id: 'DGF_BLOW_004', description: 'POP INSTALATION POP +CONECTING TRAYS', unit: 'UDS', price: 1300.00 },
                    { id: 'GVG_BLOW_004', description: 'POP INSTALATION POP +CONECTING TRAYS', unit: 'UDS', price: 2500.00 },
                    { id: 'DGF_CW_204', description: 'zusätzliche Kopflöcher Einblasen (ÜB)', unit: 'M3', price: 78.00 },
                    { id: 'DGF_CW_205', description: 'zusätz. Kopflöcher Einblasen (Pflaster)', unit: 'M3', price: 110.00 },
                    { id: 'DGF_CW_206', description: 'zusätz. Kopflöcher Einblasen (Asphalt)', unit: 'M3', price: 136.00 },
                    { id: 'ING_FIX_003', description: 'HAUSBEGEHUNG INDIVIDUELLER POP GEBIET', unit: 'Units', price: 36.00 },
                    { id: 'ING_FIX_010', description: 'HAUSANSCHLUSS TERMIN', unit: 'Termin', price: 2.60 },
                    { id: 'ING_FIX_011', description: 'HAUSBEGEHUNG POP GEBIET KOMPLETER PAKET 35-45', unit: 'Termin', price: 21.00 },
                    { id: 'ING_FIX_012', description: 'CLAUSULA PROTECCION EXCESO +45% HBG', unit: 'Termin', price: 33.00 },
                    { id: 'ING_FIX_015', description: 'HAUSBEGEHUNG POP GEBIET KOMPLETER PAKET 35-45 GF+', unit: 'Termin', price: 26.00 }
                ];
                for (const activity of defaultActivities) {
                    await FiberActivityRepository_1.fiberActivityRepository.createActivity(activity);
                }
                activities = await FiberActivityRepository_1.fiberActivityRepository.getAllActivities();
            }
            const technicians = await FiberTechnicianRepository_1.fiberTechnicianRepository.getAllTechnicians();
            const equipment = await FiberEquipmentRepository_1.fiberEquipmentRepository.getAllEquipment();
            const materials = await FiberMaterialRepository_1.fiberMaterialRepository.getAllMaterials();
            const subcontractors = await FiberSubcontractorRepository_1.fiberSubcontractorRepository.getAllSubcontractors();
            const settings = await FiberSettingsRepository_1.fiberSettingsRepository.getSettings();
            res.status(200).json({
                activities,
                technicians,
                equipment,
                materials,
                subcontractors,
                settings
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al inicializar datos', error: error.message });
        }
    }
}
exports.FiberControlController = FiberControlController;
exports.fiberControlController = new FiberControlController();
