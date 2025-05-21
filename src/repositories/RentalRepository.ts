import 'reflect-metadata';
import { Repository, EntityRepository, Between } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Rental, RentalType } from '../entity/Rental';

interface BaseRentalDTO {
    type: RentalType;
    startDate: Date;
    endDate: Date;
    dailyCost: number;
    comments?: string;
}

interface ItemRentalDTO extends BaseRentalDTO {
    type: RentalType.ITEM;
    inventoryId: number;
    metadata?: {
        peopleCount?: number;
    };
}

interface VehicleRentalDTO extends BaseRentalDTO {
    type: RentalType.VEHICLE;
    vehicleId: number;
    metadata?: {
        dealerName: string;
        dealerAddress: string;
        dealerPhone: string;
        mileage?: number;
    };
}

interface HousingRentalDTO extends BaseRentalDTO {
    type: RentalType.HOUSING;
    housingId: number;
    metadata?: {
        guestCount: number;
        baseGuestCount?: number;
        amenities?: string[];
        rules?: string;
    };
}

type RentalCreateDTO = ItemRentalDTO | VehicleRentalDTO | HousingRentalDTO;

@EntityRepository(Rental)
export class RentalRepository extends Repository<Rental> {
    private static instance: RentalRepository;

    private constructor() {
        super(Rental, AppDataSource.manager);
    }

    public static getInstance(): RentalRepository {
        if (!RentalRepository.instance) {
            RentalRepository.instance = new RentalRepository();
        }
        return RentalRepository.instance;
    }

    async createRental(rentalData: RentalCreateDTO): Promise<Rental> {
        try {
            const rental = new Rental();

            // Asignar campos comunes
            rental.type = rentalData.type;
            rental.startDate = rentalData.startDate;
            rental.endDate = rentalData.endDate;
            rental.dailyCost = rentalData.dailyCost;
            rental.comments = rentalData.comments;

            // Asignar ID específico según el tipo
            switch (rentalData.type) {
                case RentalType.ITEM:
                    rental.inventoryId = rentalData.inventoryId;
                    rental.metadata = rentalData.metadata;
                    break;
                case RentalType.VEHICLE:
                    rental.vehicleId = rentalData.vehicleId;
                    rental.metadata = rentalData.metadata;
                    break;
                case RentalType.HOUSING:
                    rental.housingId = rentalData.housingId;
                    rental.metadata = rentalData.metadata;
                    break;
            }

            return await this.save(rental);
        } catch (error) {
            console.error('Error al crear el alquiler:', error);
            throw error;
        }
    }

    async getAllRentals(): Promise<Rental[]> {
        return await this.find({
            relations: ['inventory', 'vehicle', 'housing'],
            order: { createdAt: 'DESC' }
        });
    }

    async getRentalById(id: number): Promise<Rental | null> {
        return await this.findOne({
            where: { id },
            relations: ['inventory', 'vehicle', 'housing']
        });
    }

    async getRentalsByType(type: RentalType): Promise<Rental[]> {
        return this.find({
            where: { type },
            relations: ['inventory', 'vehicle', 'housing'],
            order: { createdAt: 'DESC' }
        });
    }

    async updateRental(id: number, rentalData: Partial<RentalCreateDTO>): Promise<Rental | null> {
        const existingRental = await this.findOne({
            where: { id },
            relations: ['inventory', 'vehicle', 'housing']
        });

        if (!existingRental) {
            return null;
        }

        // Actualizar campos comunes
        if (rentalData.startDate) existingRental.startDate = rentalData.startDate;
        if (rentalData.endDate) existingRental.endDate = rentalData.endDate;
        if (rentalData.dailyCost) existingRental.dailyCost = rentalData.dailyCost;
        if (rentalData.comments !== undefined) existingRental.comments = rentalData.comments;

        // Actualizar campos específicos según el tipo
        if (rentalData.type === existingRental.type) {
            switch (rentalData.type) {
                case RentalType.ITEM:
                    if ('inventoryId' in rentalData) existingRental.inventoryId = rentalData.inventoryId;
                    break;
                case RentalType.VEHICLE:
                    if ('vehicleId' in rentalData) existingRental.vehicleId = rentalData.vehicleId;
                    break;
                case RentalType.HOUSING:
                    if ('housingId' in rentalData) existingRental.housingId = rentalData.housingId;
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

    async deleteRental(id: number): Promise<Rental | null> {
        const rentalToRemove = await this.findOne({
            where: { id },
            relations: ['inventory', 'vehicle', 'housing']
        });

        if (!rentalToRemove) {
            return null;
        }

        return await this.remove(rentalToRemove);
    }

    async getRentalsByDateRange(startDate: Date, endDate: Date): Promise<Rental[]> {
        return this.find({
            where: {
                startDate: Between(startDate, endDate)
            },
            relations: ['inventory', 'vehicle', 'housing'],
            order: { startDate: 'ASC' }
        });
    }
}

export async function getRentalRepository(): Promise<RentalRepository> {
    return RentalRepository.getInstance();
} 