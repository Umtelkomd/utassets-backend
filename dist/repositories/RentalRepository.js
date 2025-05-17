"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRentalRepository = exports.RentalRepository = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Rental_1 = require("../entity/Rental");
class RentalRepository extends typeorm_1.Repository {
    constructor() {
        super(Rental_1.Rental, data_source_1.AppDataSource.manager);
    }
    static async getInstance() {
        if (!RentalRepository.instance) {
            if (!data_source_1.AppDataSource.isInitialized) {
                await (0, data_source_1.initialize)();
            }
            RentalRepository.instance = new RentalRepository();
        }
        return RentalRepository.instance;
    }
    async createRental(rental) {
        const newRental = this.create({
            objectId: rental.objectId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            dailyCost: rental.dailyCost,
            peopleCount: rental.peopleCount || null,
            total: rental.total
        });
        return await this.save(newRental);
    }
    async getAllRentals() {
        return await this.find({
            relations: {
                object: true
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async getRentalById(id) {
        return await this.findOne({
            where: { id },
            relations: {
                object: true
            }
        });
    }
    async updateRental(id, rental) {
        const existingRental = await this.findOne({
            where: { id },
            relations: {
                object: true
            }
        });
        if (!existingRental) {
            return null;
        }
        Object.assign(existingRental, rental);
        return await this.save(existingRental);
    }
    async deleteRental(id) {
        const rentalToRemove = await this.findOne({
            where: { id },
            relations: ['object']
        });
        if (!rentalToRemove) {
            return null;
        }
        return await this.remove(rentalToRemove);
    }
    async getRentalsByObject(objectId) {
        return await this.find({
            where: { objectId },
            relations: {
                object: true
            },
            order: {
                startDate: 'ASC'
            }
        });
    }
    async getRentalsByDateRange(startDate, endDate) {
        return await this.find({
            where: [
                // Alquileres que comienzan dentro del rango
                { startDate: (0, typeorm_1.Between)(startDate, endDate) },
                // Alquileres que terminan dentro del rango
                { endDate: (0, typeorm_1.Between)(startDate, endDate) },
                // Alquileres que abarcan todo el rango
                {
                    startDate: (0, typeorm_1.LessThanOrEqual)(startDate),
                    endDate: (0, typeorm_1.MoreThanOrEqual)(endDate)
                }
            ],
            relations: {
                object: true
            },
            order: {
                startDate: 'ASC'
            }
        });
    }
}
exports.RentalRepository = RentalRepository;
let rentalRepositoryInstance = null;
const getRentalRepository = async () => {
    if (!rentalRepositoryInstance) {
        rentalRepositoryInstance = await RentalRepository.getInstance();
    }
    return rentalRepositoryInstance;
};
exports.getRentalRepository = getRentalRepository;
