"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceRepository = exports.MaintenanceRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Maintenance_1 = require("../entity/Maintenance");
class MaintenanceRepository extends typeorm_1.Repository {
    constructor() {
        super(Maintenance_1.Maintenance, data_source_1.AppDataSource.createEntityManager());
    }
    async createMaintenance(maintenance) {
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
    async getAllMaintenance() {
        return await this.find({
            order: {
                maintenanceDate: 'DESC'
            },
            relations: ['inventory']
        });
    }
    async getMaintenanceById(id) {
        return await this.findOne({
            where: { id },
            relations: ['inventory']
        });
    }
    async getMaintenanceByInventoryId(inventoryId) {
        return await this.find({
            where: { inventoryId },
            order: {
                maintenanceDate: 'DESC'
            },
            relations: ['inventory']
        });
    }
    async updateMaintenance(id, maintenance) {
        const existingMaintenance = await this.findOne({
            where: { id }
        });
        if (!existingMaintenance) {
            return null;
        }
        // Actualizar propiedades si existen en el DTO
        if (maintenance.inventoryId !== undefined)
            existingMaintenance.inventoryId = maintenance.inventoryId;
        if (maintenance.maintenanceDate !== undefined)
            existingMaintenance.maintenanceDate = maintenance.maintenanceDate;
        if (maintenance.maintenanceType !== undefined)
            existingMaintenance.maintenanceType = maintenance.maintenanceType;
        if (maintenance.description !== undefined)
            existingMaintenance.description = maintenance.description;
        if (maintenance.performedBy !== undefined)
            existingMaintenance.performedBy = maintenance.performedBy;
        if (maintenance.cost !== undefined)
            existingMaintenance.cost = maintenance.cost;
        return await this.save(existingMaintenance);
    }
    async deleteMaintenance(id) {
        const maintenanceToRemove = await this.findOne({
            where: { id }
        });
        if (!maintenanceToRemove) {
            return null;
        }
        return await this.remove(maintenanceToRemove);
    }
}
exports.MaintenanceRepository = MaintenanceRepository;
exports.maintenanceRepository = new MaintenanceRepository();
