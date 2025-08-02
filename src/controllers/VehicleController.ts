import { Request, Response } from 'express';
import { vehicleRepository } from '../repositories/VehicleRepository';
import { VehicleStatus, FuelType } from '../entity/Vehicle';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { In } from 'typeorm';
import { uploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';

class VehicleController {
    private uploadService = uploadService;

    constructor() {
        const configService = new ConfigService({
            load: [() => ({
                CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
                CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
                CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
            })]
        });

        this.uploadService = uploadService;

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

    createVehicle = async (req: Request, res: Response): Promise<void> => {
        try {
            const vehicleData = req.body;
            const file = req.file;

            // Procesar la imagen si existe
            if (file) {
                try {
                    const uploadResult = await this.uploadService.uploadImage(file, 'vehicles');
                    vehicleData.photoUrl = uploadResult.url;
                    vehicleData.photoPublicId = uploadResult.public_id;
                } catch (error) {
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
            } else if (typeof vehicleData.mileage === 'string') {
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
            if (vehicleData.vehicleStatus && !Object.values(VehicleStatus).includes(vehicleData.vehicleStatus)) {
                res.status(400).json({
                    message: 'Estado de vehículo inválido',
                    validValues: Object.values(VehicleStatus)
                });
                return;
            }

            if (vehicleData.fuelType && !Object.values(FuelType).includes(vehicleData.fuelType)) {
                res.status(400).json({
                    message: 'Tipo de combustible inválido',
                    validValues: Object.values(FuelType)
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
                const existingVehicleByPlate = await vehicleRepository.getVehicleByLicensePlate(vehicleData.licensePlate);
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
                        const userIds = vehicleData.responsibleUsers.map((user: { id: number }) => user.id);

                        // Verificar que todos los usuarios existan
                        const users = await AppDataSource.getRepository(User).findBy({ id: In(userIds) });

                        if (users.length !== userIds.length) {
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return;
                        }

                        vehicleData.responsibleUsers = users;
                    }
                } catch (error) {
                    console.error('Error al procesar usuarios responsables:', error);
                    res.status(400).json({
                        message: 'Error al procesar los usuarios responsables'
                    });
                    return;
                }
            } else if (vehicleData.responsibleUsers === null) {
                vehicleData.responsibleUsers = [];
            }

            // Asegurarnos de que los campos de la imagen se incluyan en los datos del vehículo
            const vehicleToCreate = {
                ...vehicleData,
                photoUrl: vehicleData.photoUrl || null,
                photoPublicId: vehicleData.photoPublicId || null,
                mileage: vehicleData.mileage || 0
            };

            const newVehicle = await vehicleRepository.createVehicle(vehicleToCreate);

            res.status(201).json({
                message: 'Vehículo creado exitosamente',
                vehicle: newVehicle
            });
        } catch (error) {
            console.error('Error al crear vehículo:', error);
            res.status(500).json({ message: 'Error al crear el vehículo' });
        }
    }

    async getAllVehicles(_req: Request, res: Response): Promise<void> {
        try {
            const vehicles = await vehicleRepository.getAllVehicles();
            const vehiclesWithResponsibles = vehicles.map(vehicle => ({
                ...vehicle,
                responsibleUsers: vehicle.responsibleUsers?.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive
                })) || []
            }));
            res.status(200).json(vehiclesWithResponsibles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los vehículos', error: (error as Error).message });
        }
    }

    async getVehicle(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }

            const vehicle = await vehicleRepository.getVehicleById(id);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            // Filtrar la información de los usuarios responsables
            const vehicleWithFilteredResponsibles = {
                ...vehicle,
                responsibleUsers: vehicle.responsibleUsers?.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive
                })) || []
            };

            res.status(200).json(vehicleWithFilteredResponsibles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el vehículo', error: (error as Error).message });
        }
    }

    async updateVehicle(req: Request, res: Response): Promise<void> {
        try {
            const vehicleId = parseInt(req.params.id, 10);
            const vehicleData = req.body;
            const file = req.file;

            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }

            const existingVehicle = await vehicleRepository.getVehicleById(vehicleId);
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
                } catch (error) {
                    console.error('Error al procesar la imagen:', error);
                    res.status(500).json({ message: 'Error al procesar la imagen del vehículo' });
                    return;
                }
            }

            // Verificar si la nueva placa ya está en uso por otro vehículo
            if (vehicleData.licensePlate && vehicleData.licensePlate !== existingVehicle.licensePlate) {
                const vehicleWithSamePlate = await vehicleRepository.getVehicleByLicensePlate(vehicleData.licensePlate);
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
                        const userIds = vehicleData.responsibleUsers.map((user: { id: number }) => user.id);

                        // Verificar que todos los usuarios existan
                        const users = await AppDataSource.getRepository(User).findBy({ id: In(userIds) });

                        if (users.length !== userIds.length) {
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return;
                        }

                        vehicleData.responsibleUsers = users;
                    }
                } catch (error) {
                    console.error('Error al procesar usuarios responsables:', error);
                    res.status(400).json({
                        message: 'Error al procesar los usuarios responsables'
                    });
                    return;
                }
            }

            // Actualizar el vehículo
            const updatedVehicle = await vehicleRepository.updateVehicle(vehicleId, {
                ...vehicleData,
                year: vehicleData.year ? parseInt(vehicleData.year) : undefined,
                mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : undefined,
                insuranceExpiryDate: vehicleData.insuranceExpiryDate ? new Date(vehicleData.insuranceExpiryDate) : undefined,
                technicalRevisionExpiryDate: vehicleData.technicalRevisionExpiryDate ? new Date(vehicleData.technicalRevisionExpiryDate) : undefined
            });

            res.status(200).json(updatedVehicle);
        } catch (error) {
            console.error('Error al actualizar vehículo:', error);
            res.status(500).json({ message: 'Error al actualizar el vehículo' });
        }
    }

    async deleteVehicle(req: Request, res: Response): Promise<void> {
        try {
            const vehicleId = parseInt(req.params.id, 10);
            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }

            const vehicle = await vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            // Eliminar imagen de Cloudinary si existe
            if (vehicle.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(vehicle.photoPublicId);
                } catch (error) {
                    console.error('Error al eliminar imagen de Cloudinary:', error);
                    // Continuar con la eliminación del vehículo aunque falle la eliminación de la imagen
                }
            }

            await vehicleRepository.deleteVehicle(vehicleId);
            res.status(200).json({ message: 'Vehículo eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar vehículo:', error);
            res.status(500).json({ message: 'Error al eliminar el vehículo' });
        }
    }

    async updateVehicleImage(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            const file = req.file;

            if (!file) {
                res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
                return;
            }

            const vehicle = await vehicleRepository.getVehicleById(id);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            // Eliminar la imagen anterior si existe
            if (vehicle.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(vehicle.photoPublicId);
                } catch (error) {
                    console.error('Error al eliminar la imagen anterior:', error);
                }
            }

            // Subir la nueva imagen
            try {
                const uploadResult = await this.uploadService.uploadImage(file, 'vehicles');
                vehicle.photoUrl = uploadResult.url;
                vehicle.photoPublicId = uploadResult.public_id;
                await vehicleRepository.updateVehicle(id, vehicle);

                res.status(200).json({
                    message: 'Imagen actualizada exitosamente',
                    photoUrl: vehicle.photoUrl
                });
            } catch (error) {
                console.error('Error al subir la nueva imagen:', error);
                res.status(500).json({ message: 'Error al actualizar la imagen del vehículo' });
            }
        } catch (error) {
            console.error('Error al actualizar la imagen:', error);
            res.status(500).json({
                message: 'Error al actualizar la imagen',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    async deleteVehicleImage(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            const vehicle = await vehicleRepository.getVehicleById(id);

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
                await vehicleRepository.updateVehicle(id, vehicle);

                res.status(200).json({ message: 'Imagen eliminada exitosamente' });
            } catch (error) {
                console.error('Error al eliminar la imagen:', error);
                res.status(500).json({ message: 'Error al eliminar la imagen del vehículo' });
            }
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            res.status(500).json({
                message: 'Error al eliminar la imagen',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    async addResponsibleUser(req: Request, res: Response): Promise<void> {
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

            const vehicle = await vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Verificar si el usuario ya es responsable
            const isAlreadyResponsible = vehicle.responsibleUsers?.some(u => u.id === userId);
            if (isAlreadyResponsible) {
                res.status(400).json({ message: 'El usuario ya es responsable de este vehículo' });
                return;
            }

            // Agregar el usuario a la lista de responsables
            vehicle.responsibleUsers = [...(vehicle.responsibleUsers || []), user];
            await vehicleRepository.updateVehicle(vehicleId, vehicle);

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
        } catch (error) {
            console.error('Error al agregar usuario responsable:', error);
            res.status(500).json({ message: 'Error al agregar usuario responsable' });
        }
    }

    async removeResponsibleUser(req: Request, res: Response): Promise<void> {
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

            const vehicle = await vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            // Verificar si el usuario es responsable
            const isResponsible = vehicle.responsibleUsers?.some(u => u.id === userId);
            if (!isResponsible) {
                res.status(400).json({ message: 'El usuario no es responsable de este vehículo' });
                return;
            }

            // Remover el usuario de la lista de responsables
            vehicle.responsibleUsers = vehicle.responsibleUsers?.filter(u => u.id !== userId) || [];
            await vehicleRepository.updateVehicle(vehicleId, vehicle);

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
        } catch (error) {
            console.error('Error al remover usuario responsable:', error);
            res.status(500).json({ message: 'Error al remover usuario responsable' });
        }
    }

    async getResponsibleUsers(req: Request, res: Response): Promise<void> {
        try {
            const vehicleId = parseInt(req.params.id, 10);

            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }

            const vehicle = await vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            const responsibleUsers = vehicle.responsibleUsers?.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive
            })) || [];

            res.status(200).json(responsibleUsers);
        } catch (error) {
            console.error('Error al obtener usuarios responsables:', error);
            res.status(500).json({ message: 'Error al obtener usuarios responsables' });
        }
    }

}

// Crear una única instancia del controlador
const vehicleController = new VehicleController();

// Exportar la instancia
export { vehicleController }; 