import 'reflect-metadata';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource, initialize } from '../config/data-source';
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
    private static instance: RentalRepository;

    private constructor() {
        super(Rental, AppDataSource.manager);
    }

    public static async getInstance(): Promise<RentalRepository> {
        if (!RentalRepository.instance) {
            if (!AppDataSource.isInitialized) {
                await initialize();
            }
            RentalRepository.instance = new RentalRepository();
        }
        return RentalRepository.instance;
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

let rentalRepositoryInstance: RentalRepository | null = null;

export const getRentalRepository = async (): Promise<RentalRepository> => {
    if (!rentalRepositoryInstance) {
        rentalRepositoryInstance = await RentalRepository.getInstance();
    }
    return rentalRepositoryInstance;
}; 