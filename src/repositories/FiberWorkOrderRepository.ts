import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberWorkOrder } from '../entity/FiberWorkOrder';

interface FiberWorkOrderCreateDTO {
    orderNumber: string;
    projectName: string;
    clientName: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    executorType: string;
    activities?: Array<{ activityId: string; quantity: number }>;
    dailyLogs?: Array<{
        date: string;
        time: Array<{ technicianId: string; hours: number }>;
        equipment: Array<{ equipmentId: string; hours: number }>;
        materials: Array<{ materialId: string; quantity: number }>;
    }>;
    subcontractorId?: string;
    subcontractorCost?: number;
    billedAmount?: number;
}

interface FiberWorkOrderUpdateDTO extends Partial<FiberWorkOrderCreateDTO> { }

export class FiberWorkOrderRepository extends Repository<FiberWorkOrder> {
    constructor() {
        super(FiberWorkOrder, AppDataSource.createEntityManager());
    }

    async createWorkOrder(workOrder: FiberWorkOrderCreateDTO): Promise<FiberWorkOrder> {
        const newWorkOrder = this.create(workOrder);
        return await this.save(newWorkOrder);
    }

    async getAllWorkOrders(): Promise<FiberWorkOrder[]> {
        return await this.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getWorkOrderById(id: string): Promise<FiberWorkOrder | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async getWorkOrdersByStatus(status: string): Promise<FiberWorkOrder[]> {
        return await this.find({
            where: { status },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async updateWorkOrder(id: string, workOrder: FiberWorkOrderUpdateDTO): Promise<FiberWorkOrder | null> {
        const existingWorkOrder = await this.findOne({
            where: { id }
        });

        if (!existingWorkOrder) {
            return null;
        }

        if (workOrder.orderNumber !== undefined) existingWorkOrder.orderNumber = workOrder.orderNumber;
        if (workOrder.projectName !== undefined) existingWorkOrder.projectName = workOrder.projectName;
        if (workOrder.clientName !== undefined) existingWorkOrder.clientName = workOrder.clientName;
        if (workOrder.status !== undefined) existingWorkOrder.status = workOrder.status;
        if (workOrder.startDate !== undefined) existingWorkOrder.startDate = workOrder.startDate;
        if (workOrder.endDate !== undefined) existingWorkOrder.endDate = workOrder.endDate;
        if (workOrder.executorType !== undefined) existingWorkOrder.executorType = workOrder.executorType;
        if (workOrder.activities !== undefined) existingWorkOrder.activities = workOrder.activities;
        if (workOrder.dailyLogs !== undefined) existingWorkOrder.dailyLogs = workOrder.dailyLogs;
        if (workOrder.subcontractorId !== undefined) existingWorkOrder.subcontractorId = workOrder.subcontractorId;
        if (workOrder.subcontractorCost !== undefined) existingWorkOrder.subcontractorCost = workOrder.subcontractorCost;
        if (workOrder.billedAmount !== undefined) existingWorkOrder.billedAmount = workOrder.billedAmount;

        return await this.save(existingWorkOrder);
    }

    async deleteWorkOrder(id: string): Promise<FiberWorkOrder | null> {
        const workOrderToRemove = await this.findOne({
            where: { id }
        });

        if (!workOrderToRemove) {
            return null;
        }

        return await this.remove(workOrderToRemove);
    }
}

export const fiberWorkOrderRepository = new FiberWorkOrderRepository();
