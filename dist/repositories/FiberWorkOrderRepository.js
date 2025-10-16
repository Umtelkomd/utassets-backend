"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberWorkOrderRepository = exports.FiberWorkOrderRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberWorkOrder_1 = require("../entity/FiberWorkOrder");
class FiberWorkOrderRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberWorkOrder_1.FiberWorkOrder, data_source_1.AppDataSource.createEntityManager());
    }
    async createWorkOrder(workOrder) {
        const newWorkOrder = this.create(workOrder);
        return await this.save(newWorkOrder);
    }
    async getAllWorkOrders() {
        return await this.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async getWorkOrderById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async getWorkOrdersByStatus(status) {
        return await this.find({
            where: { status },
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async updateWorkOrder(id, workOrder) {
        const existingWorkOrder = await this.findOne({
            where: { id }
        });
        if (!existingWorkOrder) {
            return null;
        }
        if (workOrder.orderNumber !== undefined)
            existingWorkOrder.orderNumber = workOrder.orderNumber;
        if (workOrder.projectName !== undefined)
            existingWorkOrder.projectName = workOrder.projectName;
        if (workOrder.clientName !== undefined)
            existingWorkOrder.clientName = workOrder.clientName;
        if (workOrder.status !== undefined)
            existingWorkOrder.status = workOrder.status;
        if (workOrder.startDate !== undefined)
            existingWorkOrder.startDate = workOrder.startDate;
        if (workOrder.endDate !== undefined)
            existingWorkOrder.endDate = workOrder.endDate;
        if (workOrder.executorType !== undefined)
            existingWorkOrder.executorType = workOrder.executorType;
        if (workOrder.activities !== undefined)
            existingWorkOrder.activities = workOrder.activities;
        if (workOrder.dailyLogs !== undefined)
            existingWorkOrder.dailyLogs = workOrder.dailyLogs;
        if (workOrder.subcontractorId !== undefined)
            existingWorkOrder.subcontractorId = workOrder.subcontractorId;
        if (workOrder.subcontractorCost !== undefined)
            existingWorkOrder.subcontractorCost = workOrder.subcontractorCost;
        if (workOrder.billedAmount !== undefined)
            existingWorkOrder.billedAmount = workOrder.billedAmount;
        return await this.save(existingWorkOrder);
    }
    async deleteWorkOrder(id) {
        const workOrderToRemove = await this.findOne({
            where: { id }
        });
        if (!workOrderToRemove) {
            return null;
        }
        return await this.remove(workOrderToRemove);
    }
}
exports.FiberWorkOrderRepository = FiberWorkOrderRepository;
exports.fiberWorkOrderRepository = new FiberWorkOrderRepository();
