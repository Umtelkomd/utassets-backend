import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { InventoryProject } from '../entity/InventoryProject';

interface InventoryProjectCreateDTO {
    inventoryId: number;
    projectId: number;
    assignedDate: Date;
    quantity: number;
    notes?: string | null;
    returnedDate?: Date | null;
}

interface InventoryProjectUpdateDTO extends Partial<InventoryProjectCreateDTO> { }

export class InventoryProjectRepository extends Repository<InventoryProject> {
    constructor() {
        super(InventoryProject, AppDataSource.createEntityManager());
    }

    async createInventoryProject(inventoryProject: InventoryProjectCreateDTO): Promise<InventoryProject> {
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

    async getAllInventoryProjects(): Promise<InventoryProject[]> {
        return await this.find({
            relations: ['inventory', 'project'],
            order: {
                assignedDate: 'DESC'
            }
        });
    }

    async getInventoryProjectsByProjectId(projectId: number): Promise<InventoryProject[]> {
        return await this.find({
            where: { projectId },
            relations: ['inventory', 'project'],
            order: {
                assignedDate: 'DESC'
            }
        });
    }

    async getInventoryProjectsByInventoryId(inventoryId: number): Promise<InventoryProject[]> {
        return await this.find({
            where: { inventoryId },
            relations: ['inventory', 'project'],
            order: {
                assignedDate: 'DESC'
            }
        });
    }

    async getInventoryProject(inventoryId: number, projectId: number, assignedDate: Date): Promise<InventoryProject | null> {
        return await this.findOne({
            where: {
                inventoryId,
                projectId,
                assignedDate
            },
            relations: ['inventory', 'project']
        });
    }

    async updateInventoryProject(
        inventoryId: number,
        projectId: number,
        assignedDate: Date,
        inventoryProject: InventoryProjectUpdateDTO
    ): Promise<InventoryProject | null> {
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
        if (inventoryProject.quantity !== undefined) existingInventoryProject.quantity = inventoryProject.quantity;
        if (inventoryProject.notes !== undefined) existingInventoryProject.notes = inventoryProject.notes;
        if (inventoryProject.returnedDate !== undefined) existingInventoryProject.returnedDate = inventoryProject.returnedDate;

        return await this.save(existingInventoryProject);
    }

    async deleteInventoryProject(inventoryId: number, projectId: number, assignedDate: Date): Promise<InventoryProject | null> {
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

export const inventoryProjectRepository = new InventoryProjectRepository(); 