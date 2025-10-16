import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberActivity } from '../entity/FiberActivity';

interface FiberActivityCreateDTO {
    description: string;
    unit: string;
    price: number;
}

interface FiberActivityUpdateDTO extends Partial<FiberActivityCreateDTO> { }

export class FiberActivityRepository extends Repository<FiberActivity> {
    constructor() {
        super(FiberActivity, AppDataSource.createEntityManager());
    }

    async createActivity(activity: FiberActivityCreateDTO): Promise<FiberActivity> {
        const newActivity = this.create(activity);
        return await this.save(newActivity);
    }

    async getAllActivities(): Promise<FiberActivity[]> {
        return await this.find({
            order: {
                description: 'ASC'
            }
        });
    }

    async getActivityById(id: string): Promise<FiberActivity | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async updateActivity(id: string, activity: FiberActivityUpdateDTO): Promise<FiberActivity | null> {
        const existingActivity = await this.findOne({
            where: { id }
        });

        if (!existingActivity) {
            return null;
        }

        if (activity.description !== undefined) existingActivity.description = activity.description;
        if (activity.unit !== undefined) existingActivity.unit = activity.unit;
        if (activity.price !== undefined) existingActivity.price = activity.price;

        return await this.save(existingActivity);
    }

    async deleteActivity(id: string): Promise<FiberActivity | null> {
        const activityToRemove = await this.findOne({
            where: { id }
        });

        if (!activityToRemove) {
            return null;
        }

        return await this.remove(activityToRemove);
    }
}

export const fiberActivityRepository = new FiberActivityRepository();
