"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RentalRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalRepository = void 0;
exports.getRentalRepository = getRentalRepository;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Rental_1 = require("../entity/Rental");
let RentalRepository = RentalRepository_1 = class RentalRepository extends typeorm_1.Repository {
    constructor() {
        super(Rental_1.Rental, data_source_1.AppDataSource.manager);
    }
    static getInstance() {
        if (!RentalRepository_1.instance) {
            RentalRepository_1.instance = new RentalRepository_1();
        }
        return RentalRepository_1.instance;
    }
    async createRental(rentalData) {
        try {
            const rental = new Rental_1.Rental();
            // Asignar campos comunes
            rental.type = rentalData.type;
            rental.startDate = rentalData.startDate;
            rental.endDate = rentalData.endDate;
            rental.dailyCost = rentalData.dailyCost;
            rental.comments = rentalData.comments;
            // Asignar ID específico según el tipo
            switch (rentalData.type) {
                case Rental_1.RentalType.ITEM:
                    rental.inventoryId = rentalData.inventoryId;
                    rental.metadata = rentalData.metadata;
                    break;
                case Rental_1.RentalType.VEHICLE:
                    rental.vehicleId = rentalData.vehicleId;
                    rental.metadata = rentalData.metadata;
                    break;
                case Rental_1.RentalType.HOUSING:
                    rental.housingId = rentalData.housingId;
                    rental.metadata = rentalData.metadata;
                    break;
            }
            return await this.save(rental);
        }
        catch (error) {
            console.error('Error al crear el alquiler:', error);
            throw error;
        }
    }
    async getAllRentals() {
        return await this.find({
            relations: ['inventory', 'vehicle', 'housing'],
            order: { createdAt: 'DESC' }
        });
    }
    async getRentalById(id) {
        return await this.findOne({
            where: { id },
            relations: ['inventory', 'vehicle', 'housing']
        });
    }
    async getRentalsByType(type) {
        return this.find({
            where: { type },
            relations: ['inventory', 'vehicle', 'housing'],
            order: { createdAt: 'DESC' }
        });
    }
    async updateRental(id, rentalData) {
        const existingRental = await this.findOne({
            where: { id },
            relations: ['inventory', 'vehicle', 'housing']
        });
        if (!existingRental) {
            return null;
        }
        // Actualizar campos comunes
        if (rentalData.startDate)
            existingRental.startDate = rentalData.startDate;
        if (rentalData.endDate)
            existingRental.endDate = rentalData.endDate;
        if (rentalData.dailyCost)
            existingRental.dailyCost = rentalData.dailyCost;
        if (rentalData.comments !== undefined)
            existingRental.comments = rentalData.comments;
        // Actualizar campos específicos según el tipo
        if (rentalData.type === existingRental.type) {
            switch (rentalData.type) {
                case Rental_1.RentalType.ITEM:
                    if ('inventoryId' in rentalData)
                        existingRental.inventoryId = rentalData.inventoryId;
                    break;
                case Rental_1.RentalType.VEHICLE:
                    if ('vehicleId' in rentalData)
                        existingRental.vehicleId = rentalData.vehicleId;
                    break;
                case Rental_1.RentalType.HOUSING:
                    if ('housingId' in rentalData)
                        existingRental.housingId = rentalData.housingId;
                    break;
            }
            if (rentalData.metadata) {
                existingRental.metadata = {
                    ...existingRental.metadata,
                    ...rentalData.metadata
                };
            }
        }
        return await this.save(existingRental);
    }
    async deleteRental(id) {
        const rentalToRemove = await this.findOne({
            where: { id },
            relations: ['inventory', 'vehicle', 'housing']
        });
        if (!rentalToRemove) {
            return null;
        }
        return await this.remove(rentalToRemove);
    }
    async getRentalsByDateRange(startDate, endDate) {
        return this.find({
            where: {
                startDate: (0, typeorm_1.Between)(startDate, endDate)
            },
            relations: ['inventory', 'vehicle', 'housing'],
            order: { startDate: 'ASC' }
        });
    }
};
exports.RentalRepository = RentalRepository;
exports.RentalRepository = RentalRepository = RentalRepository_1 = __decorate([
    (0, typeorm_1.EntityRepository)(Rental_1.Rental),
    __metadata("design:paramtypes", [])
], RentalRepository);
async function getRentalRepository() {
    return RentalRepository.getInstance();
}
