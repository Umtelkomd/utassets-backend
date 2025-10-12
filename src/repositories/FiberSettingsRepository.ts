import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberSettings } from '../entity/FiberSettings';

interface FiberSettingsUpdateDTO {
    indirectCostRate?: number;
    subcontractorIndirectCostRate?: number;
}

export class FiberSettingsRepository extends Repository<FiberSettings> {
    constructor() {
        super(FiberSettings, AppDataSource.createEntityManager());
    }

    async getSettings(): Promise<FiberSettings> {
        let settings = await this.findOne({
            where: {},
            order: { createdAt: 'DESC' }
        });

        if (!settings) {
            // Create default settings if none exist
            settings = this.create({
                indirectCostRate: 25,
                subcontractorIndirectCostRate: 10
            });
            settings = await this.save(settings);
        }

        return settings;
    }

    async updateSettings(data: FiberSettingsUpdateDTO): Promise<FiberSettings> {
        let settings = await this.getSettings();

        if (data.indirectCostRate !== undefined) {
            settings.indirectCostRate = data.indirectCostRate;
        }
        if (data.subcontractorIndirectCostRate !== undefined) {
            settings.subcontractorIndirectCostRate = data.subcontractorIndirectCostRate;
        }

        return await this.save(settings);
    }
}

export const fiberSettingsRepository = new FiberSettingsRepository();
