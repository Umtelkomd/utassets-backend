import { Request, Response } from 'express';
import { inventoryProjectRepository } from '../repositories/InventoryProjectRepository';

export class InventoryProjectController {
    async assignInventoryToProject(req: Request, res: Response): Promise<void> {
        try {
            const inventoryProject = req.body;

            // Convertir campos opcionales vacíos a null
            if (inventoryProject.notes === '' || inventoryProject.notes === undefined) {
                inventoryProject.notes = null;
            }

            if (inventoryProject.returnedDate === '' || inventoryProject.returnedDate === undefined) {
                inventoryProject.returnedDate = null;
            }

            // Convertir strings a números si es necesario
            if (typeof inventoryProject.inventoryId === 'string') {
                inventoryProject.inventoryId = parseInt(inventoryProject.inventoryId, 10);
            }

            if (typeof inventoryProject.projectId === 'string') {
                inventoryProject.projectId = parseInt(inventoryProject.projectId, 10);
            }

            if (typeof inventoryProject.quantity === 'string') {
                inventoryProject.quantity = parseInt(inventoryProject.quantity, 10);
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof inventoryProject.assignedDate === 'string') {
                inventoryProject.assignedDate = new Date(inventoryProject.assignedDate);
            } else if (!inventoryProject.assignedDate) {
                inventoryProject.assignedDate = new Date(); // Fecha actual si no se proporciona
            }

            if (typeof inventoryProject.returnedDate === 'string' && inventoryProject.returnedDate) {
                inventoryProject.returnedDate = new Date(inventoryProject.returnedDate);
            }

            const newInventoryProject = await inventoryProjectRepository.createInventoryProject(inventoryProject);
            res.status(201).json(newInventoryProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al asignar inventario al proyecto', error: (error as Error).message });
        }
    }

    async getAllInventoryProjects(_req: Request, res: Response): Promise<void> {
        try {
            const inventoryProjects = await inventoryProjectRepository.getAllInventoryProjects();
            res.status(200).json(inventoryProjects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener asignaciones de inventario', error: (error as Error).message });
        }
    }

    async getInventoryProjectsByProject(req: Request, res: Response): Promise<void> {
        try {
            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                res.status(400).json({ message: 'ID de proyecto inválido' });
                return;
            }

            const inventoryProjects = await inventoryProjectRepository.getInventoryProjectsByProjectId(projectId);
            res.status(200).json(inventoryProjects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener asignaciones de inventario por proyecto', error: (error as Error).message });
        }
    }

    async getInventoryProjectsByInventory(req: Request, res: Response): Promise<void> {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            if (isNaN(inventoryId)) {
                res.status(400).json({ message: 'ID de inventario inválido' });
                return;
            }

            const inventoryProjects = await inventoryProjectRepository.getInventoryProjectsByInventoryId(inventoryId);
            res.status(200).json(inventoryProjects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener asignaciones de inventario por ítem', error: (error as Error).message });
        }
    }

    async updateInventoryProject(req: Request, res: Response): Promise<void> {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            const projectId = parseInt(req.params.projectId, 10);
            const assignedDate = new Date(req.params.assignedDate);

            if (isNaN(inventoryId) || isNaN(projectId) || isNaN(assignedDate.getTime())) {
                res.status(400).json({ message: 'Parámetros de identificación inválidos' });
                return;
            }

            const inventoryProject = req.body;

            // Convertir strings a números si es necesario
            if (typeof inventoryProject.quantity === 'string' && inventoryProject.quantity) {
                inventoryProject.quantity = parseInt(inventoryProject.quantity, 10);
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof inventoryProject.returnedDate === 'string' && inventoryProject.returnedDate) {
                inventoryProject.returnedDate = new Date(inventoryProject.returnedDate);
            }

            const updatedInventoryProject = await inventoryProjectRepository.updateInventoryProject(
                inventoryId,
                projectId,
                assignedDate,
                inventoryProject
            );

            if (!updatedInventoryProject) {
                res.status(404).json({ message: 'Asignación de inventario no encontrada' });
                return;
            }

            res.status(200).json(updatedInventoryProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar asignación de inventario', error: (error as Error).message });
        }
    }

    async returnInventoryFromProject(req: Request, res: Response): Promise<void> {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            const projectId = parseInt(req.params.projectId, 10);
            const assignedDate = new Date(req.params.assignedDate);

            if (isNaN(inventoryId) || isNaN(projectId) || isNaN(assignedDate.getTime())) {
                res.status(400).json({ message: 'Parámetros de identificación inválidos' });
                return;
            }

            const returnDate = req.body.returnedDate ? new Date(req.body.returnedDate) : new Date();
            const notes = req.body.notes || '';

            const updatedInventoryProject = await inventoryProjectRepository.updateInventoryProject(
                inventoryId,
                projectId,
                assignedDate,
                {
                    returnedDate: returnDate,
                    notes
                }
            );

            if (!updatedInventoryProject) {
                res.status(404).json({ message: 'Asignación de inventario no encontrada' });
                return;
            }

            res.status(200).json(updatedInventoryProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar devolución de inventario', error: (error as Error).message });
        }
    }

    async deleteInventoryProject(req: Request, res: Response): Promise<void> {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            const projectId = parseInt(req.params.projectId, 10);
            const assignedDate = new Date(req.params.assignedDate);

            if (isNaN(inventoryId) || isNaN(projectId) || isNaN(assignedDate.getTime())) {
                res.status(400).json({ message: 'Parámetros de identificación inválidos' });
                return;
            }

            const deletedInventoryProject = await inventoryProjectRepository.deleteInventoryProject(
                inventoryId,
                projectId,
                assignedDate
            );

            if (!deletedInventoryProject) {
                res.status(404).json({ message: 'Asignación de inventario no encontrada' });
                return;
            }

            res.status(200).json({ message: 'Asignación de inventario eliminada', inventoryProject: deletedInventoryProject });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar asignación de inventario', error: (error as Error).message });
        }
    }
}

export const inventoryProjectController = new InventoryProjectController(); 