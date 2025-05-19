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

    async createRental(rentalData: RentalCreateDTO): Promise<Rental> {
        try {
            // Crear instancia del alquiler con los datos básicos
            const rental = new Rental();
            
            // Asignar campos comunes
            rental.objectId = rentalData.objectId;
            rental.startDate = rentalData.startDate;
            rental.endDate = rentalData.endDate;
            rental.dailyCost = rentalData.dailyCost;
            rental.total = rentalData.total;
            rental.type = rentalData.type;
            rental.comments = rentalData.comments || undefined;

            // Asignar campos específicos según el tipo de alquiler usando type guards
            if (rentalData.type === RentalType.ITEM) {
                const itemRental = rentalData as ItemRentalDTO;
                rental.peopleCount = itemRental.peopleCount ?? null;
            }
            else if (rentalData.type === RentalType.VEHICLE) {
                const vehicleRental = rentalData as VehicleRentalDTO;
                rental.dealerName = vehicleRental.dealerName;
                rental.dealerAddress = vehicleRental.dealerAddress;
                rental.dealerPhone = vehicleRental.dealerPhone;
            }
            else if (rentalData.type === RentalType.HOUSING) {
                const housingRental = rentalData as HousingRentalDTO;
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
        } catch (error) {
            console.error('Error en createRental:', error);
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