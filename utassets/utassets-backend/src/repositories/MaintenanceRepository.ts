import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Maintenance } from '../entity/Maintenance';

interface MaintenanceCreateDTO {
    inventoryId: number;
    maintenanceDate: Date;
    maintenanceType: string;
    description?: string | null;
    performedBy?: string | null;
    cost?: number | null;
}

interface MaintenanceUpdateDTO extends Partial<MaintenanceCreateDTO> { }

export class MaintenanceRepository extends Repository<Maintenance> {
    constructor() {
        super(Maintenance, AppDataSource.createEntityManager());
    }

    async createMaintenance(maintenance: MaintenanceCreateDTO): Promise<Maintenance> {
        const newMaintenance = this.create({
            inventoryId: maintenance.inventoryId,
            maintenanceDate: maintenance.maintenanceDate,
            maintenanceType: maintenance.maintenanceType,
            description: maintenance.description || null,
            performedBy: maintenance.performedBy || null,
            cost: maintenance.cost || null
        });

        return await this.save(newMaintenance);
    }

    async getAllMaintenance(): Promise<Maintenance[]> {
        return await this.find({
            order: {
                maintenanceDate: 'DESC'
            },
            relations: ['inventory']
        });
    }

    async getMaintenanceById(id: number): Promise<Maintenance | null> {
        return await this.findOne({
            where: { id },
            relations: ['inventory']
        });
    }

    async getMaintenanceByInventoryId(inventoryId: number): Promise<Maintenance[]> {
        return await this.find({
            where: { inventoryId },
            order: {
                maintenanceDate: 'DESC'
            },
            relations: ['inventory']
        });
    }

    async updateMaintenance(id: number, maintenance: MaintenanceUpdateDTO): Promise<Maintenance | null> {
        const existingMaintenance = await this.findOne({
            where: { id }
        });

        if (!existingMaintenance) {
            return null;
        }

        // Actualizar propiedades si existen en el DTO
        if (maintenance.inventoryId !== undefined) existingMaintenance.inventoryId = maintenance.inventoryId;
        if (maintenance.maintenanceDate !== undefined) existingMaintenance.maintenanceDate = maintenance.maintenanceDate;
        if (maintenance.maintenanceType !== undefined) existingMaintenance.maintenanceType = maintenance.maintenanceType;
        if (maintenance.description !== undefined) existingMaintenance.description = maintenance.description;
        if (maintenance.performedBy !== undefined) existingMaintenance.performedBy = maintenance.performedBy;
        if (maintenance.cost !== undefined) existingMaintenance.cost = maintenance.cost;

        return await this.save(existingMaintenance);
    }

    async deleteMaintenance(id: number): Promise<Maintenance | null> {
        const maintenanceToRemove = await this.findOne({
            where: { id }
        });

        if (!maintenanceToRemove) {
            return null;
        }

        return await this.remove(maintenanceToRemove);
    }
}

export const maintenanceRepository = new MaintenanceRepository(); 