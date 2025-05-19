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
    async createRental(rentalData) {
        var _a;
        try {
            // Crear instancia del alquiler con los datos básicos
            const rental = new Rental_1.Rental();
            // Asignar campos comunes
            rental.objectId = rentalData.objectId;
            rental.startDate = rentalData.startDate;
            rental.endDate = rentalData.endDate;
            rental.dailyCost = rentalData.dailyCost;
            rental.total = rentalData.total;
            rental.type = rentalData.type;
            rental.comments = rentalData.comments || undefined;
            // Asignar campos específicos según el tipo de alquiler usando type guards
            if (rentalData.type === Rental_1.RentalType.ITEM) {
                const itemRental = rentalData;
                rental.peopleCount = (_a = itemRental.peopleCount) !== null && _a !== void 0 ? _a : null;
            }
            else if (rentalData.type === Rental_1.RentalType.VEHICLE) {
                const vehicleRental = rentalData;
                rental.dealerName = vehicleRental.dealerName;
                rental.dealerAddress = vehicleRental.dealerAddress;
                rental.dealerPhone = vehicleRental.dealerPhone;
            }
            else if (rentalData.type === Rental_1.RentalType.HOUSING) {
                const housingRental = rentalData;
                rental.guestCount = housingRental.guestCount;
                rental.address = housingRental.address;
                rental.bedrooms = housingRental.bedrooms;
                rental.bathrooms = housingRental.bathrooms;
                if (housingRental.amenities !== undefined) {
                    rental.amenities = Array.isArray(housingRental.amenities)
                        ? housingRental.amenities
                        : (housingRental.amenities || '').split(',').map(a => a.trim());
                }
                if (housingRental.rules !== undefined) {
                    rental.rules = housingRental.rules;
                }
            }
            // Guardar el alquiler en la base de datos
            const savedRental = await this.save(rental);
            // Obtener el alquiler con las relaciones cargadas
            const rentalWithRelations = await this.findOne({
                where: { id: savedRental.id },
                relations: ['object']
            });
            if (!rentalWithRelations) {
                throw new Error('No se pudo recuperar el alquiler recién creado');
            }
            return rentalWithRelations;
        }
        catch (error) {
            console.error('Error en createRental:', error);
            throw error;
        }
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
        const numericId = Number(id);
        // Solo buscar por ID numérico
        if (isNaN(numericId) || numericId <= 0) {
            return null;
        }
        return await this.findOne({
            where: { id: numericId },
            relations: { object: true }
        });
    }
    async getRentalsByType(type) {
        return await this.find({
            where: { type },
            relations: { object: true },
            order: { createdAt: 'DESC' }
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
