"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleAssignmentRepository = void 0;
const data_source_1 = require("../config/data-source");
const VehicleAssignment_1 = require("../entity/VehicleAssignment");
class VehicleAssignmentRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(VehicleAssignment_1.VehicleAssignment);
    }
    async getAllAssignments() {
        return this.repository.find({
            relations: ['vehicle', 'user']
        });
    }
    async getAssignmentById(id) {
        return this.repository.findOne({
            where: { id },
            relations: ['vehicle', 'user']
        });
    }
    async getAssignmentsByVehicle(vehicleId) {
        return this.repository.find({
            where: { vehicleId },
            relations: ['user'],
            order: { startDate: 'DESC' }
        });
    }
    async getAssignmentsByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: ['vehicle'],
            order: { startDate: 'DESC' }
        });
    }
    async getActiveAssignmentsByVehicle(vehicleId) {
        return this.repository.find({
            where: {
                vehicleId,
                assignmentStatus: VehicleAssignment_1.AssignmentStatus.ACTIVA
            },
            relations: ['user'],
            order: { startDate: 'DESC' }
        });
    }
    async getActiveAssignmentsByUser(userId) {
        return this.repository.find({
            where: {
                userId,
                assignmentStatus: VehicleAssignment_1.AssignmentStatus.ACTIVA
            },
            relations: ['vehicle'],
            order: { startDate: 'DESC' }
        });
    }
    async getActiveResponsibleForVehicle(vehicleId) {
        return this.repository.findOne({
            where: {
                vehicleId,
                assignmentType: VehicleAssignment_1.AssignmentType.RESPONSABLE,
                assignmentStatus: VehicleAssignment_1.AssignmentStatus.ACTIVA
            },
            relations: ['user']
        });
    }
    async createAssignment(assignmentData) {
        const assignment = this.repository.create(assignmentData);
        return this.repository.save(assignment);
    }
    async updateAssignment(id, assignmentData) {
        await this.repository.update(id, assignmentData);
        return this.getAssignmentById(id);
    }
    async deleteAssignment(id) {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }
    async endAssignment(id, endDate, notes) {
        await this.repository.update(id, {
            assignmentStatus: VehicleAssignment_1.AssignmentStatus.FINALIZADA,
            endDate,
            notes: notes || null
        });
        return this.getAssignmentById(id);
    }
}
exports.vehicleAssignmentRepository = new VehicleAssignmentRepository();
