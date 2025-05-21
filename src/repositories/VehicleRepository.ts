import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Vehicle, VehicleStatus, FuelType } from '../entity/Vehicle';
import { User } from '../entity/User';

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
    imagePath?: string | null;
    responsibleUsers?: User[];
}

interface VehicleUpdateDTO extends Partial<VehicleCreateDTO> { }

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
            mileage: vehicle.mileage || null,
            fuelType: vehicle.fuelType,
            insuranceExpiryDate: vehicle.insuranceExpiryDate || null,
            technicalRevisionExpiryDate: vehicle.technicalRevisionExpiryDate || null,
            notes: vehicle.notes || null,
            imagePath: vehicle.imagePath || null,
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

    async updateVehicle(id: number, vehicle: VehicleUpdateDTO): Promise<Vehicle | null> {
        const existingVehicle = await this.findOne({
            where: { id },
            relations: {
                responsibleUsers: true
            }
        });

        if (!existingVehicle) {
            return null;
        }

        // Actualizar propiedades si existen en el DTO
        if (vehicle.licensePlate !== undefined) existingVehicle.licensePlate = vehicle.licensePlate;
        if (vehicle.brand !== undefined) existingVehicle.brand = vehicle.brand;
        if (vehicle.model !== undefined) existingVehicle.model = vehicle.model;
        if (vehicle.year !== undefined) existingVehicle.year = vehicle.year;
        if (vehicle.color !== undefined) existingVehicle.color = vehicle.color;
        if (vehicle.vehicleStatus !== undefined) existingVehicle.vehicleStatus = vehicle.vehicleStatus;
        if (vehicle.mileage !== undefined) existingVehicle.mileage = vehicle.mileage;
        if (vehicle.fuelType !== undefined) existingVehicle.fuelType = vehicle.fuelType;
        if (vehicle.insuranceExpiryDate !== undefined) existingVehicle.insuranceExpiryDate = vehicle.insuranceExpiryDate;
        if (vehicle.technicalRevisionExpiryDate !== undefined) existingVehicle.technicalRevisionExpiryDate = vehicle.technicalRevisionExpiryDate;
        if (vehicle.notes !== undefined) existingVehicle.notes = vehicle.notes;
        if (vehicle.imagePath !== undefined) existingVehicle.imagePath = vehicle.imagePath;

        // Manejar la actualización de usuarios responsables
        if (vehicle.responsibleUsers !== undefined) {
            // Cargar los usuarios completos desde la base de datos
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.findByIds(vehicle.responsibleUsers.map(u => u.id));
            existingVehicle.responsibleUsers = users;
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