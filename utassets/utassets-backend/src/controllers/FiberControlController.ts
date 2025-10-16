import { Request, Response } from 'express';
import { fiberWorkOrderRepository } from '../repositories/FiberWorkOrderRepository';
import { fiberActivityRepository } from '../repositories/FiberActivityRepository';
import { fiberTechnicianRepository } from '../repositories/FiberTechnicianRepository';
import { fiberEquipmentRepository } from '../repositories/FiberEquipmentRepository';
import { fiberMaterialRepository } from '../repositories/FiberMaterialRepository';
import { fiberSubcontractorRepository } from '../repositories/FiberSubcontractorRepository';
import { fiberSettingsRepository } from '../repositories/FiberSettingsRepository';

export class FiberControlController {
    // ==================== WORK ORDERS ====================
    async createWorkOrder(req: Request, res: Response): Promise<void> {
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
            } else {
                workOrder.endDate = null;
            }

            const newWorkOrder = await fiberWorkOrderRepository.createWorkOrder(workOrder);
            res.status(201).json(newWorkOrder);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la orden de trabajo', error: (error as Error).message });
        }
    }

    async getAllWorkOrders(_req: Request, res: Response): Promise<void> {
        try {
            const workOrders = await fiberWorkOrderRepository.getAllWorkOrders();
            res.status(200).json(workOrders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las órdenes de trabajo', error: (error as Error).message });
        }
    }

    async getWorkOrder(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const workOrder = await fiberWorkOrderRepository.getWorkOrderById(id);

            if (!workOrder) {
                res.status(404).json({ message: 'Orden de trabajo no encontrada' });
                return;
            }

            res.status(200).json(workOrder);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la orden de trabajo', error: (error as Error).message });
        }
    }

    async getWorkOrdersByStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = req.params.status;
            const workOrders = await fiberWorkOrderRepository.getWorkOrdersByStatus(status);
            res.status(200).json(workOrders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las órdenes de trabajo', error: (error as Error).message });
        }
    }

    async updateWorkOrder(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const workOrder = req.body;

            if (typeof workOrder.startDate === 'string' && workOrder.startDate) {
                workOrder.startDate = new Date(workOrder.startDate);
            }

            if (workOrder.endDate && typeof workOrder.endDate === 'string' && workOrder.endDate.trim() !== '') {
                workOrder.endDate = new Date(workOrder.endDate);
            } else {
                workOrder.endDate = null;
            }

            const updatedWorkOrder = await fiberWorkOrderRepository.updateWorkOrder(id, workOrder);

            if (!updatedWorkOrder) {
                res.status(404).json({ message: 'Orden de trabajo no encontrada' });
                return;
            }

            res.status(200).json(updatedWorkOrder);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la orden de trabajo', error: (error as Error).message });
        }
    }

    async deleteWorkOrder(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const deletedWorkOrder = await fiberWorkOrderRepository.deleteWorkOrder(id);

            if (!deletedWorkOrder) {
                res.status(404).json({ message: 'Orden de trabajo no encontrada' });
                return;
            }

            res.status(200).json({ message: 'Orden de trabajo eliminada', workOrder: deletedWorkOrder });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la orden de trabajo', error: (error as Error).message });
        }
    }

    // ==================== ACTIVITIES ====================
    async createActivity(req: Request, res: Response): Promise<void> {
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

            const newActivity = await fiberActivityRepository.createActivity(activity);
            res.status(201).json(newActivity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la actividad', error: (error as Error).message });
        }
    }

    async getAllActivities(_req: Request, res: Response): Promise<void> {
        try {
            const activities = await fiberActivityRepository.getAllActivities();
            res.status(200).json(activities);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las actividades', error: (error as Error).message });
        }
    }

    async getActivity(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const activity = await fiberActivityRepository.getActivityById(id);

            if (!activity) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }

            res.status(200).json(activity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la actividad', error: (error as Error).message });
        }
    }

    async updateActivity(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const activity = req.body;
            const updatedActivity = await fiberActivityRepository.updateActivity(id, activity);

            if (!updatedActivity) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }

            res.status(200).json(updatedActivity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la actividad', error: (error as Error).message });
        }
    }

    async deleteActivity(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const deletedActivity = await fiberActivityRepository.deleteActivity(id);

            if (!deletedActivity) {
                res.status(404).json({ message: 'Actividad no encontrada' });
                return;
            }

            res.status(200).json({ message: 'Actividad eliminada', activity: deletedActivity });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la actividad', error: (error as Error).message });
        }
    }

    // ==================== TECHNICIANS ====================
    async createTechnician(req: Request, res: Response): Promise<void> {
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

            const newTechnician = await fiberTechnicianRepository.createTechnician(technician);
            res.status(201).json(newTechnician);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el técnico', error: (error as Error).message });
        }
    }

    async getAllTechnicians(_req: Request, res: Response): Promise<void> {
        try {
            const technicians = await fiberTechnicianRepository.getAllTechnicians();
            res.status(200).json(technicians);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los técnicos', error: (error as Error).message });
        }
    }

    async getTechnician(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const technician = await fiberTechnicianRepository.getTechnicianById(id);

            if (!technician) {
                res.status(404).json({ message: 'Técnico no encontrado' });
                return;
            }

            res.status(200).json(technician);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el técnico', error: (error as Error).message });
        }
    }

    async updateTechnician(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const technician = req.body;
            const updatedTechnician = await fiberTechnicianRepository.updateTechnician(id, technician);

            if (!updatedTechnician) {
                res.status(404).json({ message: 'Técnico no encontrado' });
                return;
            }

            res.status(200).json(updatedTechnician);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el técnico', error: (error as Error).message });
        }
    }

    async deleteTechnician(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const deletedTechnician = await fiberTechnicianRepository.deleteTechnician(id);

            if (!deletedTechnician) {
                res.status(404).json({ message: 'Técnico no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Técnico eliminado', technician: deletedTechnician });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el técnico', error: (error as Error).message });
        }
    }

    // ==================== EQUIPMENT ====================
    async createEquipment(req: Request, res: Response): Promise<void> {
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

            const newEquipment = await fiberEquipmentRepository.createEquipment(equipment);
            res.status(201).json(newEquipment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el equipo', error: (error as Error).message });
        }
    }

    async getAllEquipment(_req: Request, res: Response): Promise<void> {
        try {
            const equipment = await fiberEquipmentRepository.getAllEquipment();
            res.status(200).json(equipment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los equipos', error: (error as Error).message });
        }
    }

    async getEquipment(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const equipment = await fiberEquipmentRepository.getEquipmentById(id);

            if (!equipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return;
            }

            res.status(200).json(equipment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el equipo', error: (error as Error).message });
        }
    }

    async updateEquipment(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const equipment = req.body;
            const updatedEquipment = await fiberEquipmentRepository.updateEquipment(id, equipment);

            if (!updatedEquipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return;
            }

            res.status(200).json(updatedEquipment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el equipo', error: (error as Error).message });
        }
    }

    async deleteEquipment(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const deletedEquipment = await fiberEquipmentRepository.deleteEquipment(id);

            if (!deletedEquipment) {
                res.status(404).json({ message: 'Equipo no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Equipo eliminado', equipment: deletedEquipment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el equipo', error: (error as Error).message });
        }
    }

    // ==================== MATERIALS ====================
    async createMaterial(req: Request, res: Response): Promise<void> {
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

            const newMaterial = await fiberMaterialRepository.createMaterial(material);
            res.status(201).json(newMaterial);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el material', error: (error as Error).message });
        }
    }

    async getAllMaterials(_req: Request, res: Response): Promise<void> {
        try {
            const materials = await fiberMaterialRepository.getAllMaterials();
            res.status(200).json(materials);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los materiales', error: (error as Error).message });
        }
    }

    async getMaterial(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const material = await fiberMaterialRepository.getMaterialById(id);

            if (!material) {
                res.status(404).json({ message: 'Material no encontrado' });
                return;
            }

            res.status(200).json(material);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el material', error: (error as Error).message });
        }
    }

    async updateMaterial(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const material = req.body;
            const updatedMaterial = await fiberMaterialRepository.updateMaterial(id, material);

            if (!updatedMaterial) {
                res.status(404).json({ message: 'Material no encontrado' });
                return;
            }

            res.status(200).json(updatedMaterial);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el material', error: (error as Error).message });
        }
    }

    async deleteMaterial(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const deletedMaterial = await fiberMaterialRepository.deleteMaterial(id);

            if (!deletedMaterial) {
                res.status(404).json({ message: 'Material no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Material eliminado', material: deletedMaterial });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el material', error: (error as Error).message });
        }
    }

    // ==================== SUBCONTRACTORS ====================
    async createSubcontractor(req: Request, res: Response): Promise<void> {
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

            const newSubcontractor = await fiberSubcontractorRepository.createSubcontractor(subcontractor);
            res.status(201).json(newSubcontractor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la subcontrata', error: (error as Error).message });
        }
    }

    async getAllSubcontractors(_req: Request, res: Response): Promise<void> {
        try {
            const subcontractors = await fiberSubcontractorRepository.getAllSubcontractors();
            res.status(200).json(subcontractors);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las subcontratas', error: (error as Error).message });
        }
    }

    async getSubcontractor(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const subcontractor = await fiberSubcontractorRepository.getSubcontractorById(id);

            if (!subcontractor) {
                res.status(404).json({ message: 'Subcontrata no encontrada' });
                return;
            }

            res.status(200).json(subcontractor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la subcontrata', error: (error as Error).message });
        }
    }

    async updateSubcontractor(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const subcontractor = req.body;
            const updatedSubcontractor = await fiberSubcontractorRepository.updateSubcontractor(id, subcontractor);

            if (!updatedSubcontractor) {
                res.status(404).json({ message: 'Subcontrata no encontrada' });
                return;
            }

            res.status(200).json(updatedSubcontractor);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la subcontrata', error: (error as Error).message });
        }
    }

    async deleteSubcontractor(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const deletedSubcontractor = await fiberSubcontractorRepository.deleteSubcontractor(id);

            if (!deletedSubcontractor) {
                res.status(404).json({ message: 'Subcontrata no encontrada' });
                return;
            }

            res.status(200).json({ message: 'Subcontrata eliminada', subcontractor: deletedSubcontractor });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la subcontrata', error: (error as Error).message });
        }
    }

    // ==================== SETTINGS ====================
    async getSettings(_req: Request, res: Response): Promise<void> {
        try {
            const settings = await fiberSettingsRepository.getSettings();
            res.status(200).json(settings);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la configuración', error: (error as Error).message });
        }
    }

    async updateSettings(req: Request, res: Response): Promise<void> {
        try {
            const settings = req.body;
            const updatedSettings = await fiberSettingsRepository.updateSettings(settings);
            res.status(200).json(updatedSettings);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la configuración', error: (error as Error).message });
        }
    }

    // ==================== BULK INITIALIZATION ====================
    async initializeDefaultData(_req: Request, res: Response): Promise<void> {
        try {
            // Check if activities exist, if not create default ones
            let activities = await fiberActivityRepository.getAllActivities();

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
                    await fiberActivityRepository.createActivity(activity);
                }

                activities = await fiberActivityRepository.getAllActivities();
            }

            const technicians = await fiberTechnicianRepository.getAllTechnicians();
            const equipment = await fiberEquipmentRepository.getAllEquipment();
            const materials = await fiberMaterialRepository.getAllMaterials();
            const subcontractors = await fiberSubcontractorRepository.getAllSubcontractors();
            const settings = await fiberSettingsRepository.getSettings();

            res.status(200).json({
                activities,
                technicians,
                equipment,
                materials,
                subcontractors,
                settings
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al inicializar datos', error: (error as Error).message });
        }
    }
}

export const fiberControlController = new FiberControlController();
