"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberActivityRepository = exports.FiberActivityRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberActivity_1 = require("../entity/FiberActivity");
class FiberActivityRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberActivity_1.FiberActivity, data_source_1.AppDataSource.createEntityManager());
    }
    async createActivity(activity) {
        const newActivity = this.create(activity);
        return await this.save(newActivity);
    }
    async getAllActivities() {
        return await this.find({
            order: {
                description: 'ASC'
            }
        });
    }
    async getActivityById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateActivity(id, activity) {
        const existingActivity = await this.findOne({
            where: { id }
        });
        if (!existingActivity) {
            return null;
        }
        if (activity.description !== undefined)
            existingActivity.description = activity.description;
        if (activity.unit !== undefined)
            existingActivity.unit = activity.unit;
        if (activity.price !== undefined)
            existingActivity.price = activity.price;
        return await this.save(existingActivity);
    }
    async deleteActivity(id) {
        const activityToRemove = await this.findOne({
            where: { id }
        });
        if (!activityToRemove) {
            return null;
        }
        return await this.remove(activityToRemove);
    }
}
exports.FiberActivityRepository = FiberActivityRepository;
exports.fiberActivityRepository = new FiberActivityRepository();
