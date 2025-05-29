import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Vehicle, VehicleStatus, FuelType } from '../entity/Vehicle';
import { User } from '../entity/User';
import { applyPartialUpdate } from '../utils/entityUtils';

interface VehicleCreateDTO {
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    color?: string | null;
    vehicleStatus: VehicleStatus;
    mileage?: number | null;
    fuelType: FuelType;
    insuranceExpiryDate?: Date | null;
    technicalRevisionExpiryDate?: Date | null;
    notes?: string | null;
    photoUrl?: string | null;
    photoPublicId?: string | null;
    responsibleUsers?: User[];
}

interface VehicleUpdateDTO {
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string | null;
    vehicleStatus?: VehicleStatus;
    mileage?: number | null;
    fuelType?: FuelType;
    insuranceExpiryDate?: Date | null;
    technicalRevisionExpiryDate?: Date | null;
    notes?: string | null;
    photoUrl?: string | null;
    photoPublicId?: string | null;
    responsibleUsers?: User[];
}

export class VehicleRepository extends Repository<Vehicle> {
    constructor() {
        super(Vehicle, AppDataSource.createEntityManager());
    }

    async createVehicle(vehicle: VehicleCreateDTO): Promise<Vehicle> {
        const newVehicle = this.create({
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color || null,
            vehicleStatus: vehicle.vehicleStatus,
            mileage: vehicle.mileage === undefined || vehicle.mileage === null ? 0 : vehicle.mileage,
            fuelType: vehicle.fuelType,
            insuranceExpiryDate: vehicle.insuranceExpiryDate || null,
            technicalRevisionExpiryDate: vehicle.technicalRevisionExpiryDate || null,
            notes: vehicle.notes || null,
            photoUrl: vehicle.photoUrl || null,
            photoPublicId: vehicle.photoPublicId || null,
            responsibleUsers: vehicle.responsibleUsers || []
        });

        return await this.save(newVehicle);
    }

    async getAllVehicles(): Promise<Vehicle[]> {
        return await this.find({
            relations: {
                responsibleUsers: true
            },
            order: {
                brand: 'ASC',
                model: 'ASC'
            }
        });
    }

    async getVehicleById(id: number): Promise<Vehicle | null> {
        return await this.findOne({
            where: { id },
            relations: {
                responsibleUsers: true
            }
        });
    }

    async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
        return await this.findOne({
            where: { licensePlate },
            relations: {
                responsibleUsers: true
            }
        });
    }

    async updateVehicle(id: number, vehicle: Partial<VehicleUpdateDTO>): Promise<Vehicle | null> {
        const existingVehicle = await this.findOne({
            where: { id },
            relations: { responsibleUsers: true }
        });

        if (!existingVehicle) {
            return null;
        }

        const { responsibleUsers, ...vehicleFields } = vehicle;

        applyPartialUpdate(existingVehicle, vehicleFields, ['responsibleUsers']);

        if (responsibleUsers !== undefined) {
            try {
                const userRepository = AppDataSource.getRepository(User);
                let usersToAssign: User[] = [];

                if (Array.isArray(responsibleUsers)) {
                    const userIds = responsibleUsers.map(user =>
                        typeof user === 'object' ? user.id : user
                    );
                    usersToAssign = await userRepository.findByIds(userIds);
                } else if (typeof responsibleUsers === 'string') {
                    const parsedUsers = JSON.parse(responsibleUsers);
                    if (Array.isArray(parsedUsers)) {
                        const userIds = parsedUsers.map(user => user.id);
                        usersToAssign = await userRepository.findByIds(userIds);
                    }
                }

                existingVehicle.responsibleUsers = usersToAssign;
            } catch (error) {
                console.error('Error al procesar responsibleUsers:', error);
            }
        }

        return await this.save(existingVehicle);
    }


    async deleteVehicle(id: number): Promise<Vehicle | null> {
        const vehicleToRemove = await this.findOne({
            where: { id }
        });

        if (!vehicleToRemove) {
            return null;
        }

        return await this.remove(vehicleToRemove);
    }
}

export const vehicleRepository = new VehicleRepository(); 