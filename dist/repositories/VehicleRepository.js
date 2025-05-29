"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRepository = exports.VehicleRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Vehicle_1 = require("../entity/Vehicle");
const User_1 = require("../entity/User");
const entityUtils_1 = require("../utils/entityUtils");
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
            where: { licensePlate },
            relations: {
                responsibleUsers: true
            }
        });
    }
    async updateVehicle(id, vehicle) {
        const existingVehicle = await this.findOne({
            where: { id },
            relations: { responsibleUsers: true }
        });
        if (!existingVehicle) {
            return null;
        }
        const { responsibleUsers, ...vehicleFields } = vehicle;
        (0, entityUtils_1.applyPartialUpdate)(existingVehicle, vehicleFields, ['responsibleUsers']);
        if (responsibleUsers !== undefined) {
            try {
                const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
                let usersToAssign = [];
                if (Array.isArray(responsibleUsers)) {
                    const userIds = responsibleUsers.map(user => typeof user === 'object' ? user.id : user);
                    usersToAssign = await userRepository.findByIds(userIds);
                }
                else if (typeof responsibleUsers === 'string') {
                    const parsedUsers = JSON.parse(responsibleUsers);
                    if (Array.isArray(parsedUsers)) {
                        const userIds = parsedUsers.map(user => user.id);
                        usersToAssign = await userRepository.findByIds(userIds);
                    }
                }
                existingVehicle.responsibleUsers = usersToAssign;
            }
            catch (error) {
                console.error('Error al procesar responsibleUsers:', error);
            }
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
