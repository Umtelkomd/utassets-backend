"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleController = void 0;
const VehicleRepository_1 = require("../repositories/VehicleRepository");
const Vehicle_1 = require("../entity/Vehicle");
const data_source_1 = require("../config/data-source");
const User_1 = require("../entity/User");
const typeorm_1 = require("typeorm");
const upload_service_1 = require("../upload/upload.service");
const config_1 = require("@nestjs/config");
class VehicleController {
    constructor() {
        this.createVehicle = async (req, res) => {
            try {
                const vehicleData = req.body;
                const file = req.file;
                // Procesar la imagen si existe
                if (file) {
                    try {
                        const uploadResult = await this.uploadService.uploadImage(file, 'vehicles');
                        vehicleData.photoUrl = uploadResult.url;
                        vehicleData.photoPublicId = uploadResult.public_id;
                    }
                    catch (error) {
                        console.error('Error al subir la imagen a Cloudinary:', error);
                        res.status(500).json({ message: 'Error al subir la imagen del vehículo' });
                        return;
                    }
                }
                // Convertir cadenas vacías a null para campos únicos
                if (vehicleData.licensePlate === '') {
                    vehicleData.licensePlate = null;
                }
                // Manejar el kilometraje
                if (vehicleData.mileage === '' || vehicleData.mileage === undefined) {
                    vehicleData.mileage = 0;
                }
                else if (typeof vehicleData.mileage === 'string') {
                    vehicleData.mileage = parseInt(vehicleData.mileage, 10) || 0;
                }
                // Validar que los campos requeridos estén presentes
                const requiredFields = ['brand', 'model', 'year', 'licensePlate', 'vehicleStatus', 'fuelType'];
                const missingFields = requiredFields.filter(field => !vehicleData[field]);
                if (missingFields.length > 0) {
                    res.status(400).json({
                        message: 'Faltan campos requeridos',
                        fields: missingFields
                    });
                    return;
                }
                // Convertir campos opcionales vacíos a null
                const optionalFields = ['color', 'insuranceExpiryDate', 'technicalRevisionExpiryDate', 'notes'];
                optionalFields.forEach((field) => {
                    if (vehicleData[field] === '' || vehicleData[field] === undefined) {
                        vehicleData[field] = null;
                    }
                });
                // Convertir strings a números si es necesario
                if (typeof vehicleData.year === 'string') {
                    vehicleData.year = parseInt(vehicleData.year, 10);
                }
                // Verificar que los enums sean válidos
                if (vehicleData.vehicleStatus && !Object.values(Vehicle_1.VehicleStatus).includes(vehicleData.vehicleStatus)) {
                    res.status(400).json({
                        message: 'Estado de vehículo inválido',
                        validValues: Object.values(Vehicle_1.VehicleStatus)
                    });
                    return;
                }
                if (vehicleData.fuelType && !Object.values(Vehicle_1.FuelType).includes(vehicleData.fuelType)) {
                    res.status(400).json({
                        message: 'Tipo de combustible inválido',
                        validValues: Object.values(Vehicle_1.FuelType)
                    });
                    return;
                }
                // Convertir fecha a objeto Date si viene como string
                if (typeof vehicleData.insuranceExpiryDate === 'string' && vehicleData.insuranceExpiryDate) {
                    vehicleData.insuranceExpiryDate = new Date(vehicleData.insuranceExpiryDate);
                }
                if (typeof vehicleData.technicalRevisionExpiryDate === 'string' && vehicleData.technicalRevisionExpiryDate) {
                    vehicleData.technicalRevisionExpiryDate = new Date(vehicleData.technicalRevisionExpiryDate);
                }
                // Verificar si ya existe un vehículo con la misma placa
                if (vehicleData.licensePlate) {
                    const existingVehicleByPlate = await VehicleRepository_1.vehicleRepository.getVehicleByLicensePlate(vehicleData.licensePlate);
                    if (existingVehicleByPlate) {
                        res.status(400).json({
                            message: 'Ya existe un vehículo con esa placa',
                            existingVehicle: existingVehicleByPlate
                        });
                        return;
                    }
                }
                // Manejar usuarios responsables
                if (vehicleData.responsibleUsers) {
                    try {
                        // Si es un string, intentar parsearlo como JSON
                        if (typeof vehicleData.responsibleUsers === 'string') {
                            vehicleData.responsibleUsers = JSON.parse(vehicleData.responsibleUsers);
                        }
                        if (Array.isArray(vehicleData.responsibleUsers)) {
                            // Extraer los IDs de los usuarios
                            const userIds = vehicleData.responsibleUsers.map((user) => user.id);
                            // Verificar que todos los usuarios existan
                            const users = await data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: (0, typeorm_1.In)(userIds) });
                            if (users.length !== userIds.length) {
                                res.status(400).json({
                                    message: 'Uno o más usuarios responsables no existen'
                                });
                                return;
                            }
                            vehicleData.responsibleUsers = users;
                        }
                    }
                    catch (error) {
                        console.error('Error al procesar usuarios responsables:', error);
                        res.status(400).json({
                            message: 'Error al procesar los usuarios responsables'
                        });
                        return;
                    }
                }
                else if (vehicleData.responsibleUsers === null) {
                    vehicleData.responsibleUsers = [];
                }
                // Asegurarnos de que los campos de la imagen se incluyan en los datos del vehículo
                const vehicleToCreate = {
                    ...vehicleData,
                    photoUrl: vehicleData.photoUrl || null,
                    photoPublicId: vehicleData.photoPublicId || null,
                    mileage: vehicleData.mileage || 0
                };
                const newVehicle = await VehicleRepository_1.vehicleRepository.createVehicle(vehicleToCreate);
                res.status(201).json({
                    message: 'Vehículo creado exitosamente',
                    vehicle: newVehicle
                });
            }
            catch (error) {
                console.error('Error al crear vehículo:', error);
                res.status(500).json({ message: 'Error al crear el vehículo' });
            }
        };
        const configService = new config_1.ConfigService({
            load: [() => ({
                    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
                    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
                    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
                })]
        });
        this.uploadService = new upload_service_1.UploadService(configService);
        // Vincular los métodos al contexto de la clase
        this.createVehicle = this.createVehicle.bind(this);
        this.updateVehicle = this.updateVehicle.bind(this);
        this.deleteVehicle = this.deleteVehicle.bind(this);
        this.updateVehicleImage = this.updateVehicleImage.bind(this);
        this.deleteVehicleImage = this.deleteVehicleImage.bind(this);
        this.addResponsibleUser = this.addResponsibleUser.bind(this);
        this.removeResponsibleUser = this.removeResponsibleUser.bind(this);
        this.getResponsibleUsers = this.getResponsibleUsers.bind(this);
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
            const vehicleId = parseInt(req.params.id, 10);
            const vehicleData = req.body;
            const file = req.file;
            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            const existingVehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!existingVehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Procesar la imagen si existe
            if (file) {
                try {
                    // Eliminar imagen anterior de Cloudinary si existe
                    if (existingVehicle.photoPublicId) {
                        await this.uploadService.deleteImage(existingVehicle.photoPublicId);
                    }
                    // Subir nueva imagen
                    const uploadResult = await this.uploadService.uploadImage(file, 'vehicles');
                    vehicleData.photoUrl = uploadResult.url;
                    vehicleData.photoPublicId = uploadResult.public_id;
                }
                catch (error) {
                    console.error('Error al procesar la imagen:', error);
                    res.status(500).json({ message: 'Error al procesar la imagen del vehículo' });
                    return;
                }
            }
            // Verificar si la nueva placa ya está en uso por otro vehículo
            if (vehicleData.licensePlate && vehicleData.licensePlate !== existingVehicle.licensePlate) {
                const vehicleWithSamePlate = await VehicleRepository_1.vehicleRepository.getVehicleByLicensePlate(vehicleData.licensePlate);
                if (vehicleWithSamePlate) {
                    res.status(400).json({ message: 'Ya existe otro vehículo con esta placa' });
                    return;
                }
            }
            // Manejar usuarios responsables
            if (vehicleData.responsibleUsers !== undefined) {
                try {
                    // Si es un string, intentar parsearlo como JSON
                    if (typeof vehicleData.responsibleUsers === 'string') {
                        vehicleData.responsibleUsers = JSON.parse(vehicleData.responsibleUsers);
                    }
                    if (Array.isArray(vehicleData.responsibleUsers)) {
                        // Extraer los IDs de los usuarios
                        const userIds = vehicleData.responsibleUsers.map((user) => user.id);
                        // Verificar que todos los usuarios existan
                        const users = await data_source_1.AppDataSource.getRepository(User_1.User).findBy({ id: (0, typeorm_1.In)(userIds) });
                        if (users.length !== userIds.length) {
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return;
                        }
                        vehicleData.responsibleUsers = users;
                    }
                }
                catch (error) {
                    console.error('Error al procesar usuarios responsables:', error);
                    res.status(400).json({
                        message: 'Error al procesar los usuarios responsables'
                    });
                    return;
                }
            }
            // Actualizar el vehículo
            const updatedVehicle = await VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, {
                ...vehicleData,
                year: vehicleData.year ? parseInt(vehicleData.year) : undefined,
                mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : undefined,
                insuranceExpiryDate: vehicleData.insuranceExpiryDate ? new Date(vehicleData.insuranceExpiryDate) : undefined,
                technicalRevisionExpiryDate: vehicleData.technicalRevisionExpiryDate ? new Date(vehicleData.technicalRevisionExpiryDate) : undefined
            });
            res.status(200).json(updatedVehicle);
        }
        catch (error) {
            console.error('Error al actualizar vehículo:', error);
            res.status(500).json({ message: 'Error al actualizar el vehículo' });
        }
    }
    async deleteVehicle(req, res) {
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
            // Eliminar imagen de Cloudinary si existe
            if (vehicle.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(vehicle.photoPublicId);
                }
                catch (error) {
                    console.error('Error al eliminar imagen de Cloudinary:', error);
                    // Continuar con la eliminación del vehículo aunque falle la eliminación de la imagen
                }
            }
            await VehicleRepository_1.vehicleRepository.deleteVehicle(vehicleId);
            res.status(200).json({ message: 'Vehículo eliminado exitosamente' });
        }
        catch (error) {
            console.error('Error al eliminar vehículo:', error);
            res.status(500).json({ message: 'Error al eliminar el vehículo' });
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
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Eliminar la imagen anterior si existe
            if (vehicle.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(vehicle.photoPublicId);
                }
                catch (error) {
                    console.error('Error al eliminar la imagen anterior:', error);
                }
            }
            // Subir la nueva imagen
            try {
                const uploadResult = await this.uploadService.uploadImage(file, 'vehicles');
                vehicle.photoUrl = uploadResult.url;
                vehicle.photoPublicId = uploadResult.public_id;
                await VehicleRepository_1.vehicleRepository.updateVehicle(id, vehicle);
                res.status(200).json({
                    message: 'Imagen actualizada exitosamente',
                    photoUrl: vehicle.photoUrl
                });
            }
            catch (error) {
                console.error('Error al subir la nueva imagen:', error);
                res.status(500).json({ message: 'Error al actualizar la imagen del vehículo' });
            }
        }
        catch (error) {
            console.error('Error al actualizar la imagen:', error);
            res.status(500).json({
                message: 'Error al actualizar la imagen',
                error: error instanceof Error ? error.message : 'Error desconocido'
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
            if (!vehicle.photoPublicId) {
                res.status(400).json({ message: 'El vehículo no tiene una imagen asociada' });
                return;
            }
            try {
                await this.uploadService.deleteImage(vehicle.photoPublicId);
                vehicle.photoUrl = null;
                vehicle.photoPublicId = null;
                await VehicleRepository_1.vehicleRepository.updateVehicle(id, vehicle);
                res.status(200).json({ message: 'Imagen eliminada exitosamente' });
            }
            catch (error) {
                console.error('Error al eliminar la imagen:', error);
                res.status(500).json({ message: 'Error al eliminar la imagen del vehículo' });
            }
        }
        catch (error) {
            console.error('Error al eliminar la imagen:', error);
            res.status(500).json({
                message: 'Error al eliminar la imagen',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    async addResponsibleUser(req, res) {
        var _a;
        try {
            const vehicleId = parseInt(req.params.id, 10);
            const { userId } = req.body;
            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            if (!userId) {
                res.status(400).json({ message: 'ID de usuario requerido' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ id: userId });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Verificar si el usuario ya es responsable
            const isAlreadyResponsible = (_a = vehicle.responsibleUsers) === null || _a === void 0 ? void 0 : _a.some(u => u.id === userId);
            if (isAlreadyResponsible) {
                res.status(400).json({ message: 'El usuario ya es responsable de este vehículo' });
                return;
            }
            // Agregar el usuario a la lista de responsables
            vehicle.responsibleUsers = [...(vehicle.responsibleUsers || []), user];
            await VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, vehicle);
            res.status(200).json({
                message: 'Usuario agregado como responsable exitosamente',
                vehicle: {
                    ...vehicle,
                    responsibleUsers: vehicle.responsibleUsers.map(user => ({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        isActive: user.isActive
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error al agregar usuario responsable:', error);
            res.status(500).json({ message: 'Error al agregar usuario responsable' });
        }
    }
    async removeResponsibleUser(req, res) {
        var _a, _b;
        try {
            const vehicleId = parseInt(req.params.id, 10);
            const { userId } = req.body;
            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            if (!userId) {
                res.status(400).json({ message: 'ID de usuario requerido' });
                return;
            }
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Verificar si el usuario es responsable
            const isResponsible = (_a = vehicle.responsibleUsers) === null || _a === void 0 ? void 0 : _a.some(u => u.id === userId);
            if (!isResponsible) {
                res.status(400).json({ message: 'El usuario no es responsable de este vehículo' });
                return;
            }
            // Remover el usuario de la lista de responsables
            vehicle.responsibleUsers = ((_b = vehicle.responsibleUsers) === null || _b === void 0 ? void 0 : _b.filter(u => u.id !== userId)) || [];
            await VehicleRepository_1.vehicleRepository.updateVehicle(vehicleId, vehicle);
            res.status(200).json({
                message: 'Usuario removido como responsable exitosamente',
                vehicle: {
                    ...vehicle,
                    responsibleUsers: vehicle.responsibleUsers.map(user => ({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        isActive: user.isActive
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error al remover usuario responsable:', error);
            res.status(500).json({ message: 'Error al remover usuario responsable' });
        }
    }
    async getResponsibleUsers(req, res) {
        var _a;
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
            const responsibleUsers = ((_a = vehicle.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive
            }))) || [];
            res.status(200).json(responsibleUsers);
        }
        catch (error) {
            console.error('Error al obtener usuarios responsables:', error);
            res.status(500).json({ message: 'Error al obtener usuarios responsables' });
        }
    }
}
// Crear una única instancia del controlador
const vehicleController = new VehicleController();
exports.vehicleController = vehicleController;
