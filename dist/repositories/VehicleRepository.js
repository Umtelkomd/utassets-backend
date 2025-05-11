"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRepository = exports.VehicleRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Vehicle_1 = require("../entity/Vehicle");
const User_1 = require("../entity/User");
class VehicleRepository extends typeorm_1.Repository {
    constructor() {
        super(Vehicle_1.Vehicle, data_source_1.AppDataSource.createEntityManager());
    }
    async createVehicle(vehicle) {
        const newVehicle = this.create({
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin || null,
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
    async getAllVehicles() {
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
    async getVehicleById(id) {
        return await this.findOne({
            where: { id },
            relations: {
                responsibleUsers: true
            }
        });
    }
    async getVehicleByLicensePlate(licensePlate) {
        return await this.findOne({
            where: { licensePlate }
        });
    }
    async getVehicleByVin(vin) {
        return await this.findOne({
            where: { vin }
        });
    }
    async updateVehicle(id, vehicle) {
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
        if (vehicle.licensePlate !== undefined)
            existingVehicle.licensePlate = vehicle.licensePlate;
        if (vehicle.brand !== undefined)
            existingVehicle.brand = vehicle.brand;
        if (vehicle.model !== undefined)
            existingVehicle.model = vehicle.model;
        if (vehicle.year !== undefined)
            existingVehicle.year = vehicle.year;
        if (vehicle.vin !== undefined)
            existingVehicle.vin = vehicle.vin;
        if (vehicle.color !== undefined)
            existingVehicle.color = vehicle.color;
        if (vehicle.vehicleStatus !== undefined)
            existingVehicle.vehicleStatus = vehicle.vehicleStatus;
        if (vehicle.mileage !== undefined)
            existingVehicle.mileage = vehicle.mileage;
        if (vehicle.fuelType !== undefined)
            existingVehicle.fuelType = vehicle.fuelType;
        if (vehicle.insuranceExpiryDate !== undefined)
            existingVehicle.insuranceExpiryDate = vehicle.insuranceExpiryDate;
        if (vehicle.technicalRevisionExpiryDate !== undefined)
            existingVehicle.technicalRevisionExpiryDate = vehicle.technicalRevisionExpiryDate;
        if (vehicle.notes !== undefined)
            existingVehicle.notes = vehicle.notes;
        if (vehicle.imagePath !== undefined)
            existingVehicle.imagePath = vehicle.imagePath;
        // Manejar la actualización de usuarios responsables
        if (vehicle.responsibleUsers !== undefined) {
            // Cargar los usuarios completos desde la base de datos
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const users = await userRepository.findByIds(vehicle.responsibleUsers.map(u => u.id));
            existingVehicle.responsibleUsers = users;
        }
        return await this.save(existingVehicle);
    }
    async deleteVehicle(id) {
        const vehicleToRemove = await this.findOne({
            where: { id }
        });
        if (!vehicleToRemove) {
            return null;
        }
        return await this.remove(vehicleToRemove);
    }
}
exports.VehicleRepository = VehicleRepository;
exports.vehicleRepository = new VehicleRepository();
