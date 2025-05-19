import 'reflect-metadata';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource, initialize } from '../config/data-source';
import { Rental, RentalType } from '../entity/Rental';
import { Inventory } from '../entity/Inventory';

interface BaseRentalDTO {
    type: RentalType;
    startDate: Date;
    endDate: Date;
    dailyCost: number;
    total: number;
    comments?: string;
}

interface ItemRentalDTO extends BaseRentalDTO {
    type: RentalType.ITEM;
    itemId: number;
    peopleCount?: number | null;
}

interface VehicleRentalDTO extends BaseRentalDTO {
    type: RentalType.VEHICLE;
    vehicleId: number;
    dealerName: string;
    dealerAddress: string;
    dealerPhone: string;
}

interface HousingRentalDTO extends BaseRentalDTO {
    type: RentalType.HOUSING;
    housingId: number;
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

    async createRental(rentalData: RentalCreateDTO): Promise<Rental> {
        try {
            // Crear instancia del alquiler con los datos básicos
            const rental = new Rental();

            // Asignar campos comunes
            rental.type = rentalData.type;
            rental.startDate = rentalData.startDate;
            rental.endDate = rentalData.endDate;
            rental.dailyCost = rentalData.dailyCost;
            rental.total = rentalData.total;
            rental.comments = rentalData.comments || undefined;

            // Asignar objectId según el tipo
            switch (rentalData.type) {
                case RentalType.ITEM:
                    rental.objectId = (rentalData as ItemRentalDTO).itemId;
                    rental.peopleCount = (rentalData as ItemRentalDTO).peopleCount ?? null;
                    break;
                case RentalType.VEHICLE:
                    const vehicleRental = rentalData as VehicleRentalDTO;
                    rental.objectId = vehicleRental.vehicleId;
                    rental.dealerName = vehicleRental.dealerName;
                    rental.dealerAddress = vehicleRental.dealerAddress;
                    rental.dealerPhone = vehicleRental.dealerPhone;
                    break;
                case RentalType.HOUSING:
                    const housingRental = rentalData as HousingRentalDTO;
                    rental.objectId = housingRental.housingId;
                    rental.guestCount = housingRental.guestCount;
                    rental.address = housingRental.address;
                    rental.bedrooms = housingRental.bedrooms;
                    rental.bathrooms = housingRental.bathrooms;
                    if (housingRental.amenities !== undefined) {
                        rental.amenities = Array.isArray(housingRental.amenities)
                            ? housingRental.amenities
                            : housingRental.amenities.split(',').map(a => a.trim());
                    }
                    if (housingRental.rules !== undefined) {
                        rental.rules = housingRental.rules;
                    }
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

        // Solo buscar por ID numérico
        if (isNaN(numericId) || numericId <= 0) {
            return null;
        }

        return await this.findOne({
            where: { id: numericId },
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