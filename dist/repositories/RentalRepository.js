"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentalRepository = exports.RentalRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Rental_1 = require("../entity/Rental");
class RentalRepository extends typeorm_1.Repository {
    constructor() {
        super(Rental_1.Rental, data_source_1.AppDataSource.createEntityManager());
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
    async checkAvailability(objectId, startDate, endDate, excludeRentalId) {
        // Verificar si existen alquileres que se solapan con las fechas proporcionadas
        const query = this.createQueryBuilder('rental')
            .where('rental.objectId = :objectId', { objectId })
            .andWhere(
        // Caso 1: La fecha de inicio o fin del alquiler existente está dentro del rango solicitado
        '(rental.startDate BETWEEN :startDate AND :endDate OR ' +
            'rental.endDate BETWEEN :startDate AND :endDate OR ' +
            // Caso 2: El rango solicitado está completamente dentro del alquiler existente
            '(:startDate BETWEEN rental.startDate AND rental.endDate AND ' +
            ':endDate BETWEEN rental.startDate AND rental.endDate) OR ' +
            // Caso 3: El rango solicitado abarca completamente un alquiler existente
            '(:startDate <= rental.startDate AND :endDate >= rental.endDate))', { startDate, endDate });
        // Si se proporciona un ID de alquiler para excluir (para actualizaciones)
        if (excludeRentalId) {
            query.andWhere('rental.id != :excludeRentalId', { excludeRentalId });
        }
        const count = await query.getCount();
        return count === 0; // Si no hay alquileres que se solapen, está disponible
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
exports.rentalRepository = new RentalRepository();
