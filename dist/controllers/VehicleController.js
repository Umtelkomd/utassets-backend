"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleController = exports.VehicleController = void 0;
const VehicleRepository_1 = require("../repositories/VehicleRepository");
const Vehicle_1 = require("../entity/Vehicle");
const data_source_1 = require("../config/data-source");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UserRepository_1 = require("../repositories/UserRepository");
const User_1 = require("../entity/User");
const typeorm_1 = require("typeorm");
class VehicleController {
    async createVehicle(req, res) {
        try {
            const vehicle = req.body;
            const file = req.file;
            // Si hay una imagen, agregar la ruta al vehículo
            if (file) {
                vehicle.imagePath = file.filename;
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
            const optionalFields = ['vin', 'color', 'mileage', 'insuranceExpiryDate', 'technicalRevisionExpiryDate', 'notes'];
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
            // Convertir fecha a objeto Date si viene como string
            if (typeof vehicle.technicalRevisionExpiryDate === 'string' && vehicle.technicalRevisionExpiryDate) {
                vehicle.technicalRevisionExpiryDate = new Date(vehicle.technicalRevisionExpiryDate);
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
            // Manejar usuarios responsables
            if (vehicle.responsibleUsers) {
                // Si es un string, intentar parsearlo como JSON
                if (typeof vehicle.responsibleUsers === 'string') {
                    try {
                        vehicle.responsibleUsers = JSON.parse(vehicle.responsibleUsers);
                    }
                    catch (error) {
                        if (file) {
                            fs_1.default.unlinkSync(file.path);
                        }
                        res.status(400).json({
                            message: 'Formato inválido para usuarios responsables'
                        });
                        return;
                    }
                }
                if (Array.isArray(vehicle.responsibleUsers)) {
                    // Verificar que todos los usuarios existan
                    const userIds = vehicle.responsibleUsers.map((user) => user.id);
                    const users = await data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: (0, typeorm_1.In)(userIds) });
                    if (users.length !== userIds.length) {
                        if (file) {
                            fs_1.default.unlinkSync(file.path);
                        }
                        res.status(400).json({
                            message: 'Uno o más usuarios responsables no existen'
                        });
                        return;
                    }
                    vehicle.responsibleUsers = users;
                }
            }
            else if (vehicle.responsibleUsers === null) {
                // Si se envía null, significa que se quieren eliminar todos los responsables
                vehicle.responsibleUsers = [];
            }
            const newVehicle = await VehicleRepository_1.vehicleRepository.createVehicle(vehicle);
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
            const vehiclesWithResponsibles = vehicles.map(vehicle => {
                var _a;
                return ({
                    ...vehicle,
                    responsibleUsers: ((_a = vehicle.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(user => ({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        isActive: user.isActive
                    }))) || []
                });
            });
            res.status(200).json(vehiclesWithResponsibles);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los vehículos', error: error.message });
        }
    }
    async getVehicle(req, res) {
        var _a;
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
            // Filtrar la información de los usuarios responsables
            const vehicleWithFilteredResponsibles = {
                ...vehicle,
                responsibleUsers: ((_a = vehicle.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive
                }))) || []
            };
            res.status(200).json(vehicleWithFilteredResponsibles);
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
                if (existingVehicle.imagePath) {
                    const oldImagePath = path_1.default.join(__dirname, '..', '..', 'uploads', 'vehicles', existingVehicle.imagePath);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
                // Solo guardar el nombre del archivo
                vehicle.imagePath = file.filename;
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
            // Convertir fecha a objeto Date si viene como string
            if (typeof vehicle.technicalRevisionExpiryDate === 'string' && vehicle.technicalRevisionExpiryDate) {
                vehicle.technicalRevisionExpiryDate = new Date(vehicle.technicalRevisionExpiryDate);
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
            console.log(vehicle, 'vehicle');
            // Manejar usuarios responsables
            if (vehicle.responsibleUsers) {
                // Si es un string, intentar parsearlo como JSON
                if (typeof vehicle.responsibleUsers === 'string') {
                    try {
                        vehicle.responsibleUsers = JSON.parse(vehicle.responsibleUsers);
                    }
                    catch (error) {
                        if (file) {
                            fs_1.default.unlinkSync(file.path);
                        }
                        res.status(400).json({
                            message: 'Formato inválido para usuarios responsables'
                        });
                        return;
                    }
                }
                if (Array.isArray(vehicle.responsibleUsers)) {
                    // Verificar que todos los usuarios existan
                    const userIds = vehicle.responsibleUsers.map((user) => user.id);
                    const users = await data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: (0, typeorm_1.In)(userIds) });
                    if (users.length !== userIds.length) {
                        if (file) {
                            fs_1.default.unlinkSync(file.path);
                        }
                        res.status(400).json({
                            message: 'Uno o más usuarios responsables no existen'
                        });
                        return;
                    }
                    vehicle.responsibleUsers = users;
                }
            }
            else if (vehicle.responsibleUsers === null) {
                // Si se envía null, significa que se quieren eliminar todos los responsables
                vehicle.responsibleUsers = [];
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
    async updateVehicleImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const file = req.file;
            if (!file) {
                res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(id);
            if (!vehicle) {
                // Si no se encuentra el vehículo, eliminar la imagen subida
                fs_1.default.unlinkSync(file.path);
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Si el vehículo ya tiene una imagen, eliminarla
            if (vehicle.imagePath) {
                const oldImagePath = path_1.default.join(process.cwd(), 'uploads', 'vehicles', vehicle.imagePath);
                console.log('Intentando eliminar imagen anterior:', oldImagePath);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                    console.log('Imagen anterior eliminada exitosamente');
                }
                else {
                    console.log('No se encontró la imagen anterior en:', oldImagePath);
                }
            }
            // Actualizar la ruta de la imagen en el vehículo
            vehicle.imagePath = file.filename;
            await VehicleRepository_1.vehicleRepository.updateVehicle(id, { imagePath: vehicle.imagePath });
            res.status(200).json({
                message: 'Imagen del vehículo actualizada exitosamente',
                vehicle: {
                    ...vehicle,
                    imagePath: vehicle.imagePath
                }
            });
        }
        catch (error) {
            // Si hay un error, eliminar la imagen subida
            if (req.file) {
                fs_1.default.unlinkSync(req.file.path);
            }
            console.error('Error al actualizar la imagen del vehículo:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async deleteVehicleImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(id);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            if (!vehicle.imagePath) {
                res.status(400).json({ message: 'El vehículo no tiene una imagen para eliminar' });
                return;
            }
            // Eliminar la imagen del sistema de archivos
            const imagePath = path_1.default.join(__dirname, '..', '..', 'uploads', 'vehicle', vehicle.imagePath);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
            // Actualizar el vehículo para eliminar la referencia a la imagen
            vehicle.imagePath = null;
            await VehicleRepository_1.vehicleRepository.updateVehicle(id, { imagePath: null });
            res.status(200).json({
                message: 'Imagen del vehículo eliminada exitosamente',
                vehicle: {
                    ...vehicle,
                    imagePath: null
                }
            });
        }
        catch (error) {
            console.error('Error al eliminar la imagen del vehículo:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async addResponsibleUser(req, res) {
        try {
            const vehicleId = parseInt(req.params.id, 10);
            const { userId } = req.body;
            if (isNaN(vehicleId) || !userId) {
                res.status(400).json({ message: 'ID de vehículo y usuario requeridos' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            const user = await UserRepository_1.userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Verificar si el usuario ya es responsable
            const isAlreadyResponsible = vehicle.responsibleUsers.some(u => u.id === userId);
            if (isAlreadyResponsible) {
                res.status(400).json({ message: 'El usuario ya es responsable de este vehículo' });
                return;
            }
            // Agregar el usuario como responsable
            vehicle.responsibleUsers.push(user);
            await VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, { responsibleUsers: vehicle.responsibleUsers });
            res.status(200).json({
                message: 'Usuario agregado como responsable exitosamente',
                vehicle: {
                    ...vehicle,
                    responsibleUsers: vehicle.responsibleUsers
                }
            });
        }
        catch (error) {
            console.error('Error al agregar responsable:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async removeResponsibleUser(req, res) {
        try {
            const vehicleId = parseInt(req.params.id, 10);
            const { userId } = req.body;
            if (isNaN(vehicleId) || !userId) {
                res.status(400).json({ message: 'ID de vehículo y usuario requeridos' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Verificar si el usuario es responsable
            const userIndex = vehicle.responsibleUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                res.status(400).json({ message: 'El usuario no es responsable de este vehículo' });
                return;
            }
            // Remover el usuario de los responsables
            vehicle.responsibleUsers.splice(userIndex, 1);
            await VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, { responsibleUsers: vehicle.responsibleUsers });
            res.status(200).json({
                message: 'Usuario removido como responsable exitosamente',
                vehicle: {
                    ...vehicle,
                    responsibleUsers: vehicle.responsibleUsers
                }
            });
        }
        catch (error) {
            console.error('Error al remover responsable:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
    async getResponsibleUsers(req, res) {
        try {
            const vehicleId = parseInt(req.params.id, 10);
            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            res.status(200).json({
                message: 'Responsables del vehículo obtenidos exitosamente',
                responsibleUsers: vehicle.responsibleUsers
            });
        }
        catch (error) {
            console.error('Error al obtener responsables:', error);
            res.status(500).json({
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
}
exports.VehicleController = VehicleController;
exports.vehicleController = new VehicleController();
