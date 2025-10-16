"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidayRepository = void 0;
const data_source_1 = require("../config/data-source");
const Holiday_1 = require("../entity/Holiday");
exports.HolidayRepository = data_source_1.AppDataSource.getRepository(Holiday_1.Holiday).extend({
    async findByUserId(userId) {
        return this.find({
            where: { userId },
            order: { date: 'ASC' }
        });
    },
    async findByUserIdAndDateRange(userId, startDate, endDate) {
        return this.createQueryBuilder('holiday')
            .where('holiday.userId = :userId', { userId })
            .andWhere('holiday.date >= :startDate', { startDate })
            .andWhere('holiday.date <= :endDate', { endDate })
            .orderBy('holiday.date', 'ASC')
            .getMany();
    },
    async findByDate(userId, date) {
        return this.findOne({
            where: { userId, date }
        });
    },
    async createHoliday(data) {
        const holiday = this.create(data);
        return this.save(holiday);
    },
    async deleteByUserIdAndDate(userId, date) {
        await this.delete({ userId, date });
    }
});
