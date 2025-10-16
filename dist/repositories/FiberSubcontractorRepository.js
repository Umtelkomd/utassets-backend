"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberSubcontractorRepository = exports.FiberSubcontractorRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberSubcontractor_1 = require("../entity/FiberSubcontractor");
class FiberSubcontractorRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberSubcontractor_1.FiberSubcontractor, data_source_1.AppDataSource.createEntityManager());
    }
    async createSubcontractor(subcontractor) {
        const newSubcontractor = this.create(subcontractor);
        return await this.save(newSubcontractor);
    }
    async getAllSubcontractors() {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }
    async getSubcontractorById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateSubcontractor(id, subcontractor) {
        const existingSubcontractor = await this.findOne({
            where: { id }
        });
        if (!existingSubcontractor) {
            return null;
        }
        if (subcontractor.name !== undefined)
            existingSubcontractor.name = subcontractor.name;
        if (subcontractor.contact !== undefined)
            existingSubcontractor.contact = subcontractor.contact;
        return await this.save(existingSubcontractor);
    }
    async deleteSubcontractor(id) {
        const subcontractorToRemove = await this.findOne({
            where: { id }
        });
        if (!subcontractorToRemove) {
            return null;
        }
        return await this.remove(subcontractorToRemove);
    }
}
exports.FiberSubcontractorRepository = FiberSubcontractorRepository;
exports.fiberSubcontractorRepository = new FiberSubcontractorRepository();
