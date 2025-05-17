import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Rental } from '../entity/Rental';
import { Inventory } from '../entity/Inventory';

interface RentalCreateDTO {
    objectId: number;
    startDate: Date;
    endDate: Date;
    dailyCost: number;
    peopleCount?: number | null;
    total: number;
}

export class RentalRepository extends Repository<Rental> {
    constructor() {
        super(Rental, AppDataSource.createEntityManager());
    }

    async createRental(rental: RentalCreateDTO): Promise<Rental> {
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

    async getAllRentals(): Promise<Rental[]> {
        return await this.find({
            relations: {
                object: true
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getRentalById(id: number): Promise<Rental | null> {
        return await this.findOne({
            where: { id },
            relations: {
                object: true
            }
        });
    }

    async updateRental(id: number, rental: Partial<RentalCreateDTO>): Promise<Rental | null> {
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

    async deleteRental(id: number): Promise<Rental | null> {
        const rentalToRemove = await this.findOne({
            where: { id },
            relations: ['object']
        });

        if (!rentalToRemove) {
            return null;
        }

        return await this.remove(rentalToRemove);
    }

    async checkAvailability(objectId: number, startDate: Date, endDate: Date, excludeRentalId?: number): Promise<boolean> {
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
                '(:startDate <= rental.startDate AND :endDate >= rental.endDate))',
                { startDate, endDate }
            );

        // Si se proporciona un ID de alquiler para excluir (para actualizaciones)
        if (excludeRentalId) {
            query.andWhere('rental.id != :excludeRentalId', { excludeRentalId });
        }

        const count = await query.getCount();
        return count === 0; // Si no hay alquileres que se solapen, está disponible
    }

    async getRentalsByObject(objectId: number): Promise<Rental[]> {
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

    async getRentalsByDateRange(startDate: Date, endDate: Date): Promise<Rental[]> {
        return await this.find({
            where: [
                // Alquileres que comienzan dentro del rango
                { startDate: Between(startDate, endDate) },
                // Alquileres que terminan dentro del rango
                { endDate: Between(startDate, endDate) },
                // Alquileres que abarcan todo el rango
                {
                    startDate: LessThanOrEqual(startDate),
                    endDate: MoreThanOrEqual(endDate)
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

export const rentalRepository = new RentalRepository(); 