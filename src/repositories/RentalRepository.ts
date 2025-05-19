import 'reflect-metadata';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource, initialize } from '../config/data-source';
import { Rental, RentalType } from '../entity/Rental';
import { Inventory } from '../entity/Inventory';

interface BaseRentalDTO {
    objectId: number;
    startDate: Date;
    endDate: Date;
    dailyCost: number;
    total: number;
    type: RentalType;
    comments?: string;
}

interface ItemRentalDTO extends BaseRentalDTO {
    type: RentalType.ITEM;
    peopleCount?: number | null;
}

interface VehicleRentalDTO extends BaseRentalDTO {
    type: RentalType.VEHICLE;
    dealerName: string;
    dealerAddress: string;
    dealerPhone: string;
}

interface HousingRentalDTO extends BaseRentalDTO {
    type: RentalType.HOUSING;
    guestCount: number;
    address: string;
    bedrooms: number;
    bathrooms: number;
    amenities?: string[] | string;
    rules?: string;
}

type RentalCreateDTO = ItemRentalDTO | VehicleRentalDTO | HousingRentalDTO;

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
        // Crear objeto base del alquiler
        const rentalData: any = {
            objectId: rental.objectId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            dailyCost: rental.dailyCost,
            total: rental.total,
            type: rental.type,
            comments: rental.comments || null
        };

        // Agregar campos específicos según el tipo de alquiler
        switch (rental.type) {
            case RentalType.ITEM:
                rentalData.peopleCount = rental.peopleCount || null;
                break;

            case RentalType.VEHICLE:
                rentalData.dealerName = rental.dealerName;
                rentalData.dealerAddress = rental.dealerAddress;
                rentalData.dealerPhone = rental.dealerPhone;
                break;

            case RentalType.HOUSING:
                rentalData.guestCount = rental.guestCount;
                rentalData.address = rental.address;
                rentalData.bedrooms = rental.bedrooms;
                rentalData.bathrooms = rental.bathrooms;
                rentalData.amenities = Array.isArray(rental.amenities) 
                    ? rental.amenities 
                    : (rental.amenities || '').split(',').map((a: string) => a.trim());
                rentalData.rules = rental.rules || null;
                break;
        }

        const newRental = this.create(rentalData);
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

    async getRentalById(id: number | string): Promise<Rental | null> {
        const numericId = Number(id);
        
        // Si el ID es un número o puede convertirse a número, buscar por id numérico
        if (!isNaN(numericId) && numericId > 0) {
            return await this.findOne({
                where: { id: numericId },
                relations: { object: true }
            });
        }
        
        // Si no es un número válido, buscar por _id (MongoDB)
        return await this.findOne({
            where: { _id: id as string },
            relations: { object: true }
        });
    }
    
    async getRentalsByType(type: RentalType): Promise<Rental[]> {
        return await this.find({
            where: { type },
            relations: { object: true },
            order: { createdAt: 'DESC' }
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