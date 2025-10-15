import { AppDataSource } from '../config/data-source';
import { Holiday } from '../entity/Holiday';

export const HolidayRepository = AppDataSource.getRepository(Holiday).extend({
    async findByUserId(userId: number): Promise<Holiday[]> {
        return this.find({
            where: { userId },
            order: { date: 'ASC' }
        });
    },

    async findByUserIdAndDateRange(userId: number, startDate: Date, endDate: Date): Promise<Holiday[]> {
        return this.createQueryBuilder('holiday')
            .where('holiday.userId = :userId', { userId })
            .andWhere('holiday.date >= :startDate', { startDate })
            .andWhere('holiday.date <= :endDate', { endDate })
            .orderBy('holiday.date', 'ASC')
            .getMany();
    },

    async findByDate(userId: number, date: Date): Promise<Holiday | null> {
        return this.findOne({
            where: { userId, date }
        });
    },

    async createHoliday(data: { date: Date; name: string; description?: string; userId: number }): Promise<Holiday> {
        const holiday = this.create(data);
        return this.save(holiday);
    },

    async deleteByUserIdAndDate(userId: number, date: Date): Promise<void> {
        await this.delete({ userId, date });
    }
});
