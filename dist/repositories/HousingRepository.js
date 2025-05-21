"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousingRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Housing_1 = require("../entity/Housing");
class HousingRepository extends typeorm_1.Repository {
    constructor() {
        super(Housing_1.Housing, data_source_1.AppDataSource.createEntityManager());
    }
    async findAvailable() {
        return this.find({
            where: { isAvailable: true },
            order: { createdAt: 'DESC' }
        });
    }
    async findByBedrooms(bedrooms) {
        return this.find({
            where: {
                bedrooms,
                isAvailable: true
            }
        });
    }
    async searchByAddress(address) {
        return this.createQueryBuilder('housing')
            .where('LOWER(housing.address) LIKE LOWER(:address)', { address: `%${address}%` })
            .andWhere('housing.isAvailable = :isAvailable', { isAvailable: true })
            .getMany();
    }
}
exports.HousingRepository = HousingRepository;
