"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleController = exports.VehicleController = void 0;
const VehicleRepository_1 = require("../repositories/VehicleRepository");
const Vehicle_1 = require("../entity/Vehicle");
const fs_1 = __importDefault(require("fs"));
class VehicleController {
    async createVehicle(req, res) {
        try {
            const vehicle = req.body;
            const file = req.file;
            // Si hay una imagen, agregar la ruta al vehículo
            if (file) {
                vehicle.imagePath = file.path.replace(/\\/g, '/'); // Normalizar la ruta para usar forward slashes
            }
            // Validar que los campos requeridos estén presentes
            const requiredFields = ['brand', 'model', 'year', 'licensePlate', 'vehicleStatus', 'fuelType'];
            const missingFields = requiredFields.filter(field => !vehicle[field]);
            if (missingFields.length > 0) {
                // Si hay error y se subió una imagen, eliminarla
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    fields: missingFields
                });
                return;
            }
            // Convertir campos opcionales vacíos a null
            const optionalFields = ['vin', 'color', 'mileage', 'insuranceExpiryDate', 'notes'];
            optionalFields.forEach((field) => {
                if (vehicle[field] === '' || vehicle[field] === undefined) {
                    vehicle[field] = null;
                }
            });
            // Convertir strings a números si es necesario
            if (typeof vehicle.year === 'string') {
                vehicle.year = parseInt(vehicle.year, 10);
            }
            if (typeof vehicle.mileage === 'string' && vehicle.mileage) {
                vehicle.mileage = parseInt(vehicle.mileage, 10);
            }
            // Verificar que los enums sean válidos
            if (vehicle.vehicleStatus && !Object.values(Vehicle_1.VehicleStatus).includes(vehicle.vehicleStatus)) {
                // Si hay error y se subió una imagen, eliminarla
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(400).json({
                    message: 'Estado de vehículo inválido',
                    validValues: Object.values(Vehicle_1.VehicleStatus)
                });
                return;
            }
            if (vehicle.fuelType && !Object.values(Vehicle_1.FuelType).includes(vehicle.fuelType)) {
                // Si hay error y se subió una imagen, eliminarla
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(400).json({
                    message: 'Tipo de combustible inválido',
                    validValues: Object.values(Vehicle_1.FuelType)
                });
                return;
            }
            // Convertir fecha a objeto Date si viene como string
            if (typeof vehicle.insuranceExpiryDate === 'string' && vehicle.insuranceExpiryDate) {
                vehicle.insuranceExpiryDate = new Date(vehicle.insuranceExpiryDate);
            }
            // Verificar si ya existe un vehículo con la misma placa o VIN
            if (vehicle.licensePlate) {
                const existingVehicleByPlate = await VehicleRepository_1.vehicleRepository.getVehicleByLicensePlate(vehicle.licensePlate);
                if (existingVehicleByPlate) {
                    // Si hay error y se subió una imagen, eliminarla
                    if (file) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    res.status(400).json({
                        message: 'Ya existe un vehículo con esa placa',
                        existingVehicle: existingVehicleByPlate
                    });
                    return;
                }
            }
            if (vehicle.vin) {
                const existingVehicleByVin = await VehicleRepository_1.vehicleRepository.getVehicleByVin(vehicle.vin);
                if (existingVehicleByVin) {
                    // Si hay error y se subió una imagen, eliminarla
                    if (file) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    res.status(400).json({
                        message: 'Ya existe un vehículo con ese VIN',
                        existingVehicle: existingVehicleByVin
                    });
                    return;
                }
            }
            console.log('Creando vehículo:', vehicle);
            const newVehicle = await VehicleRepository_1.vehicleRepository.createVehicle(vehicle);
            console.log('Vehículo creado:', newVehicle);
            res.status(201).json({
                message: 'Vehículo creado exitosamente',
                vehicle: newVehicle
            });
        }
        catch (error) {
            // Si hay error y se subió una imagen, eliminarla
            if (req.file) {
                fs_1.default.unlinkSync(req.file.path);
            }
            console.error('Error al crear el vehículo:', error);
            res.status(500).json({
                message: 'Error al crear el vehículo',
                error: error instanceof Error ? error.message : 'Error desconocido',
                details: error
            });
        }
    }
    async getAllVehicles(_req, res) {
        try {
            const vehicles = await VehicleRepository_1.vehicleRepository.getAllVehicles();
            res.status(200).json(vehicles);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los vehículos', error: error.message });
        }
    }
    async getVehicle(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(id);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            res.status(200).json(vehicle);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el vehículo', error: error.message });
        }
    }
    async updateVehicle(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                if (req.file) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            const vehicle = req.body;
            const file = req.file;
            // Obtener el vehículo existente
            const existingVehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(id);
            if (!existingVehicle) {
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Si hay una nueva imagen
            if (file) {
                // Eliminar la imagen anterior si existe
                if (existingVehicle.imagePath && fs_1.default.existsSync(existingVehicle.imagePath)) {
                    fs_1.default.unlinkSync(existingVehicle.imagePath);
                }
                vehicle.imagePath = file.path.replace(/\\/g, '/');
            }
            // Convertir strings a números si es necesario
            if (typeof vehicle.year === 'string' && vehicle.year) {
                vehicle.year = parseInt(vehicle.year, 10);
            }
            if (typeof vehicle.mileage === 'string' && vehicle.mileage) {
                vehicle.mileage = parseInt(vehicle.mileage, 10);
            }
            // Verificar que los enums sean válidos
            if (vehicle.vehicleStatus && !Object.values(Vehicle_1.VehicleStatus).includes(vehicle.vehicleStatus)) {
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(400).json({ message: 'Estado de vehículo inválido' });
                return;
            }
            if (vehicle.fuelType && !Object.values(Vehicle_1.FuelType).includes(vehicle.fuelType)) {
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(400).json({ message: 'Tipo de combustible inválido' });
                return;
            }
            // Convertir fecha a objeto Date si viene como string
            if (typeof vehicle.insuranceExpiryDate === 'string' && vehicle.insuranceExpiryDate) {
                vehicle.insuranceExpiryDate = new Date(vehicle.insuranceExpiryDate);
            }
            // Verificar si ya existe otro vehículo con la misma placa o VIN
            if (vehicle.licensePlate) {
                const existingVehicleByPlate = await VehicleRepository_1.vehicleRepository.getVehicleByLicensePlate(vehicle.licensePlate);
                if (existingVehicleByPlate && existingVehicleByPlate.id !== id) {
                    if (file) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    res.status(400).json({ message: 'Ya existe otro vehículo con esa placa' });
                    return;
                }
            }
            if (vehicle.vin) {
                const existingVehicleByVin = await VehicleRepository_1.vehicleRepository.getVehicleByVin(vehicle.vin);
                if (existingVehicleByVin && existingVehicleByVin.id !== id) {
                    if (file) {
                        fs_1.default.unlinkSync(file.path);
                    }
                    res.status(400).json({ message: 'Ya existe otro vehículo con ese VIN' });
                    return;
                }
            }
            const updatedVehicle = await VehicleRepository_1.vehicleRepository.updateVehicle(id, vehicle);
            if (!updatedVehicle) {
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            res.status(200).json(updatedVehicle);
        }
        catch (error) {
            if (req.file) {
                fs_1.default.unlinkSync(req.file.path);
            }
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el vehículo', error: error.message });
        }
    }
    async deleteVehicle(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            // Obtener el vehículo antes de eliminarlo para poder eliminar su imagen
            const vehicleToDelete = await VehicleRepository_1.vehicleRepository.getVehicleById(id);
            if (!vehicleToDelete) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Eliminar la imagen si existe
            if (vehicleToDelete.imagePath && fs_1.default.existsSync(vehicleToDelete.imagePath)) {
                fs_1.default.unlinkSync(vehicleToDelete.imagePath);
            }
            const deletedVehicle = await VehicleRepository_1.vehicleRepository.deleteVehicle(id);
            if (!deletedVehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Vehículo eliminado', vehicle: deletedVehicle });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el vehículo', error: error.message });
        }
    }
}
exports.VehicleController = VehicleController;
exports.vehicleController = new VehicleController();
