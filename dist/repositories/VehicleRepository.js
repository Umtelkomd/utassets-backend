"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRepository = exports.VehicleRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Vehicle_1 = require("../entity/Vehicle");
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
            notes: vehicle.notes || null
        });
        return await this.save(newVehicle);
    }
    async getAllVehicles() {
        return await this.find({
            order: {
                brand: 'ASC',
                model: 'ASC'
            }
        });
    }
    async getVehicleById(id) {
        return await this.findOne({
            where: { id }
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
            where: { id }
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
        if (vehicle.notes !== undefined)
            existingVehicle.notes = vehicle.notes;
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
