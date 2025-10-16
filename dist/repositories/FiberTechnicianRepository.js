"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberTechnicianRepository = exports.FiberTechnicianRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberTechnician_1 = require("../entity/FiberTechnician");
class FiberTechnicianRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberTechnician_1.FiberTechnician, data_source_1.AppDataSource.createEntityManager());
    }
    async createTechnician(technician) {
        const newTechnician = this.create(technician);
        return await this.save(newTechnician);
    }
    async getAllTechnicians() {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }
    async getTechnicianById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateTechnician(id, technician) {
        const existingTechnician = await this.findOne({
            where: { id }
        });
        if (!existingTechnician) {
            return null;
        }
        if (technician.name !== undefined)
            existingTechnician.name = technician.name;
        if (technician.costPerHour !== undefined)
            existingTechnician.costPerHour = technician.costPerHour;
        return await this.save(existingTechnician);
    }
    async deleteTechnician(id) {
        const technicianToRemove = await this.findOne({
            where: { id }
        });
        if (!technicianToRemove) {
            return null;
        }
        return await this.remove(technicianToRemove);
    }
}
exports.FiberTechnicianRepository = FiberTechnicianRepository;
exports.fiberTechnicianRepository = new FiberTechnicianRepository();
