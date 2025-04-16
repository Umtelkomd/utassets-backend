"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryProjectController = exports.InventoryProjectController = void 0;
const InventoryProjectRepository_1 = require("../repositories/InventoryProjectRepository");
class InventoryProjectController {
    async assignInventoryToProject(req, res) {
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
            }
            else if (!inventoryProject.assignedDate) {
                inventoryProject.assignedDate = new Date(); // Fecha actual si no se proporciona
            }
            if (typeof inventoryProject.returnedDate === 'string' && inventoryProject.returnedDate) {
                inventoryProject.returnedDate = new Date(inventoryProject.returnedDate);
            }
            const newInventoryProject = await InventoryProjectRepository_1.inventoryProjectRepository.createInventoryProject(inventoryProject);
            res.status(201).json(newInventoryProject);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al asignar inventario al proyecto', error: error.message });
        }
    }
    async getAllInventoryProjects(_req, res) {
        try {
            const inventoryProjects = await InventoryProjectRepository_1.inventoryProjectRepository.getAllInventoryProjects();
            res.status(200).json(inventoryProjects);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener asignaciones de inventario', error: error.message });
        }
    }
    async getInventoryProjectsByProject(req, res) {
        try {
            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                res.status(400).json({ message: 'ID de proyecto inválido' });
                return;
            }
            const inventoryProjects = await InventoryProjectRepository_1.inventoryProjectRepository.getInventoryProjectsByProjectId(projectId);
            res.status(200).json(inventoryProjects);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener asignaciones de inventario por proyecto', error: error.message });
        }
    }
    async getInventoryProjectsByInventory(req, res) {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            if (isNaN(inventoryId)) {
                res.status(400).json({ message: 'ID de inventario inválido' });
                return;
            }
            const inventoryProjects = await InventoryProjectRepository_1.inventoryProjectRepository.getInventoryProjectsByInventoryId(inventoryId);
            res.status(200).json(inventoryProjects);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener asignaciones de inventario por ítem', error: error.message });
        }
    }
    async updateInventoryProject(req, res) {
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
            const updatedInventoryProject = await InventoryProjectRepository_1.inventoryProjectRepository.updateInventoryProject(inventoryId, projectId, assignedDate, inventoryProject);
            if (!updatedInventoryProject) {
                res.status(404).json({ message: 'Asignación de inventario no encontrada' });
                return;
            }
            res.status(200).json(updatedInventoryProject);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar asignación de inventario', error: error.message });
        }
    }
    async returnInventoryFromProject(req, res) {
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
            const updatedInventoryProject = await InventoryProjectRepository_1.inventoryProjectRepository.updateInventoryProject(inventoryId, projectId, assignedDate, {
                returnedDate: returnDate,
                notes
            });
            if (!updatedInventoryProject) {
                res.status(404).json({ message: 'Asignación de inventario no encontrada' });
                return;
            }
            res.status(200).json(updatedInventoryProject);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar devolución de inventario', error: error.message });
        }
    }
    async deleteInventoryProject(req, res) {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            const projectId = parseInt(req.params.projectId, 10);
            const assignedDate = new Date(req.params.assignedDate);
            if (isNaN(inventoryId) || isNaN(projectId) || isNaN(assignedDate.getTime())) {
                res.status(400).json({ message: 'Parámetros de identificación inválidos' });
                return;
            }
            const deletedInventoryProject = await InventoryProjectRepository_1.inventoryProjectRepository.deleteInventoryProject(inventoryId, projectId, assignedDate);
            if (!deletedInventoryProject) {
                res.status(404).json({ message: 'Asignación de inventario no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Asignación de inventario eliminada', inventoryProject: deletedInventoryProject });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar asignación de inventario', error: error.message });
        }
    }
}
exports.InventoryProjectController = InventoryProjectController;
exports.inventoryProjectController = new InventoryProjectController();
