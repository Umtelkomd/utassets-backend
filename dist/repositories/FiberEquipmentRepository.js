"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberEquipmentRepository = exports.FiberEquipmentRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberEquipment_1 = require("../entity/FiberEquipment");
class FiberEquipmentRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberEquipment_1.FiberEquipment, data_source_1.AppDataSource.createEntityManager());
    }
    async createEquipment(equipment) {
        const newEquipment = this.create(equipment);
        return await this.save(newEquipment);
    }
    async getAllEquipment() {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }
    async getEquipmentById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateEquipment(id, equipment) {
        const existingEquipment = await this.findOne({
            where: { id }
        });
        if (!existingEquipment) {
            return null;
        }
        if (equipment.name !== undefined)
            existingEquipment.name = equipment.name;
        if (equipment.costPerHour !== undefined)
            existingEquipment.costPerHour = equipment.costPerHour;
        return await this.save(existingEquipment);
    }
    async deleteEquipment(id) {
        const equipmentToRemove = await this.findOne({
            where: { id }
        });
        if (!equipmentToRemove) {
            return null;
        }
        return await this.remove(equipmentToRemove);
    }
}
exports.FiberEquipmentRepository = FiberEquipmentRepository;
exports.fiberEquipmentRepository = new FiberEquipmentRepository();
