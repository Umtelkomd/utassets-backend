"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberSettingsRepository = exports.FiberSettingsRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberSettings_1 = require("../entity/FiberSettings");
class FiberSettingsRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberSettings_1.FiberSettings, data_source_1.AppDataSource.createEntityManager());
    }
    async getSettings() {
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
    async updateSettings(data) {
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
exports.FiberSettingsRepository = FiberSettingsRepository;
exports.fiberSettingsRepository = new FiberSettingsRepository();
