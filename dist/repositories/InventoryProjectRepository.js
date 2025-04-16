"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryProjectRepository = exports.InventoryProjectRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const InventoryProject_1 = require("../entity/InventoryProject");
class InventoryProjectRepository extends typeorm_1.Repository {
    constructor() {
        super(InventoryProject_1.InventoryProject, data_source_1.AppDataSource.createEntityManager());
    }
    async createInventoryProject(inventoryProject) {
        const newInventoryProject = this.create({
            inventoryId: inventoryProject.inventoryId,
            projectId: inventoryProject.projectId,
            assignedDate: inventoryProject.assignedDate,
            quantity: inventoryProject.quantity,
            notes: inventoryProject.notes || null,
            returnedDate: inventoryProject.returnedDate || null
        });
        return await this.save(newInventoryProject);
    }
    async getAllInventoryProjects() {
        return await this.find({
            relations: ['inventory', 'project'],
            order: {
                assignedDate: 'DESC'
            }
        });
    }
    async getInventoryProjectsByProjectId(projectId) {
        return await this.find({
            where: { projectId },
            relations: ['inventory', 'project'],
            order: {
                assignedDate: 'DESC'
            }
        });
    }
    async getInventoryProjectsByInventoryId(inventoryId) {
        return await this.find({
            where: { inventoryId },
            relations: ['inventory', 'project'],
            order: {
                assignedDate: 'DESC'
            }
        });
    }
    async getInventoryProject(inventoryId, projectId, assignedDate) {
        return await this.findOne({
            where: {
                inventoryId,
                projectId,
                assignedDate
            },
            relations: ['inventory', 'project']
        });
    }
    async updateInventoryProject(inventoryId, projectId, assignedDate, inventoryProject) {
        const existingInventoryProject = await this.findOne({
            where: {
                inventoryId,
                projectId,
                assignedDate
            }
        });
        if (!existingInventoryProject) {
            return null;
        }
        // Actualizar propiedades si existen en el DTO
        if (inventoryProject.quantity !== undefined)
            existingInventoryProject.quantity = inventoryProject.quantity;
        if (inventoryProject.notes !== undefined)
            existingInventoryProject.notes = inventoryProject.notes;
        if (inventoryProject.returnedDate !== undefined)
            existingInventoryProject.returnedDate = inventoryProject.returnedDate;
        return await this.save(existingInventoryProject);
    }
    async deleteInventoryProject(inventoryId, projectId, assignedDate) {
        const inventoryProjectToRemove = await this.findOne({
            where: {
                inventoryId,
                projectId,
                assignedDate
            }
        });
        if (!inventoryProjectToRemove) {
            return null;
        }
        return await this.remove(inventoryProjectToRemove);
    }
}
exports.InventoryProjectRepository = InventoryProjectRepository;
exports.inventoryProjectRepository = new InventoryProjectRepository();
