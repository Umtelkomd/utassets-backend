import { Request, Response } from 'express';
import { maintenanceRepository } from '../repositories/MaintenanceRepository';

export class MaintenanceController {
    async createMaintenance(req: Request, res: Response): Promise<void> {
        try {
            const maintenance = req.body;

            // Convertir campos opcionales vacíos a null
            const optionalFields = ['description', 'performedBy', 'cost'];
            optionalFields.forEach((field) => {
                if (maintenance[field] === '' || maintenance[field] === undefined) {
                    maintenance[field] = null;
                }
            });

            // Convertir strings a números si es necesario
            if (typeof maintenance.inventoryId === 'string') {
                maintenance.inventoryId = parseInt(maintenance.inventoryId, 10);
            }

            if (typeof maintenance.cost === 'string' && maintenance.cost) {
                maintenance.cost = parseFloat(maintenance.cost);
            }

            // Convertir fecha a objeto Date si viene como string
            if (typeof maintenance.maintenanceDate === 'string') {
                maintenance.maintenanceDate = new Date(maintenance.maintenanceDate);
            }

            const newMaintenance = await maintenanceRepository.createMaintenance(maintenance);
            res.status(201).json(newMaintenance);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear registro de mantenimiento', error: (error as Error).message });
        }
    }

    async getAllMaintenance(_req: Request, res: Response): Promise<void> {
        try {
            const maintenances = await maintenanceRepository.getAllMaintenance();
            res.status(200).json(maintenances);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registros de mantenimiento', error: (error as Error).message });
        }
    }

    async getMaintenance(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const maintenance = await maintenanceRepository.getMaintenanceById(id);
            if (!maintenance) {
                res.status(404).json({ message: 'Registro de mantenimiento no encontrado' });
                return;
            }

            res.status(200).json(maintenance);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registro de mantenimiento', error: (error as Error).message });
        }
    }

    async getMaintenanceByInventoryId(req: Request, res: Response): Promise<void> {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            if (isNaN(inventoryId)) {
                res.status(400).json({ message: 'ID de inventario inválido' });
                return;
            }

            const maintenances = await maintenanceRepository.getMaintenanceByInventoryId(inventoryId);
            res.status(200).json(maintenances);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registros de mantenimiento para el inventario', error: (error as Error).message });
        }
    }

    async updateMaintenance(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const maintenance = req.body;

            // Convertir strings a números si es necesario
            if (typeof maintenance.inventoryId === 'string' && maintenance.inventoryId) {
                maintenance.inventoryId = parseInt(maintenance.inventoryId, 10);
            }

            if (typeof maintenance.cost === 'string' && maintenance.cost) {
                maintenance.cost = parseFloat(maintenance.cost);
            }

            // Convertir fecha a objeto Date si viene como string
            if (typeof maintenance.maintenanceDate === 'string' && maintenance.maintenanceDate) {
                maintenance.maintenanceDate = new Date(maintenance.maintenanceDate);
            }

            const updatedMaintenance = await maintenanceRepository.updateMaintenance(id, maintenance);
            if (!updatedMaintenance) {
                res.status(404).json({ message: 'Registro de mantenimiento no encontrado' });
                return;
            }

            res.status(200).json(updatedMaintenance);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar registro de mantenimiento', error: (error as Error).message });
        }
    }

    async deleteMaintenance(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const deletedMaintenance = await maintenanceRepository.deleteMaintenance(id);
            if (!deletedMaintenance) {
                res.status(404).json({ message: 'Registro de mantenimiento no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Registro de mantenimiento eliminado', maintenance: deletedMaintenance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar registro de mantenimiento', error: (error as Error).message });
        }
    }
}

export const maintenanceController = new MaintenanceController(); 