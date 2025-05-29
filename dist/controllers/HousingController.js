"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousingController = void 0;
const HousingRepository_1 = require("../repositories/HousingRepository");
const upload_service_1 = require("../upload/upload.service");
class HousingController {
    constructor(configService) {
        this.repository = new HousingRepository_1.HousingRepository();
        this.uploadService = new upload_service_1.UploadService(configService);
    }
    // Obtener todas las viviendas
    async getAll(req, res) {
        try {
            const housings = await this.repository.find();
            return res.json(housings);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener las viviendas', error });
        }
    }
    // Obtener viviendas disponibles
    async getAvailable(req, res) {
        try {
            const housings = await this.repository.findAvailable();
            return res.json(housings);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener las viviendas disponibles', error });
        }
    }
    // Obtener una vivienda por ID
    async getById(req, res) {
        try {
            const housing = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            return res.json(housing);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener la vivienda', error });
        }
    }
    // Crear una nueva vivienda
    async create(req, res) {
        try {
            const housing = req.body;
            const file = req.file;
            // Validar campos requeridos PRIMERO
            const requiredFields = ['address', 'bedrooms', 'bathrooms', 'squareMeters'];
            const missingFields = requiredFields.filter(field => !housing[field]);
            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Faltan campos requeridos',
                    fields: missingFields
                });
            }
            // Convertir strings a números si es necesario
            if (typeof housing.bedrooms === 'string') {
                housing.bedrooms = parseInt(housing.bedrooms, 10);
            }
            if (typeof housing.bathrooms === 'string') {
                housing.bathrooms = parseInt(housing.bathrooms, 10);
            }
            if (typeof housing.squareMeters === 'string') {
                housing.squareMeters = parseFloat(housing.squareMeters);
            }
            // Convertir isAvailable de string a boolean si es necesario
            if (typeof housing.isAvailable === 'string') {
                housing.isAvailable = housing.isAvailable === 'true';
            }
            else if (housing.isAvailable === undefined) {
                housing.isAvailable = true; // Valor por defecto
            }
            // Convertir amenities de string a array si viene como string
            if (typeof housing.amenities === 'string') {
                housing.amenities = housing.amenities.split(',').map((item) => item.trim());
            }
            // Subir imagen a Cloudinary si existe
            if (file) {
                try {
                    const uploadResult = await this.uploadService.uploadImage(file, 'housing');
                    housing.photoUrl = uploadResult.url;
                    housing.photoPublicId = uploadResult.public_id;
                }
                catch (uploadError) {
                    return res.status(500).json({
                        message: 'Error al subir la imagen',
                        error: uploadError
                    });
                }
            }
            const result = await this.repository.save(housing);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error al crear la vivienda', error });
        }
    }
    // Actualizar una vivienda
    async update(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID de vivienda inválido' });
            }
            const housing = req.body;
            const file = req.file;
            const existingHousing = await this.repository.findOne({ where: { id } });
            if (!existingHousing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            // Si hay una nueva imagen
            if (file) {
                try {
                    // Subir nueva imagen a Cloudinary
                    const uploadResult = await this.uploadService.uploadImage(file, 'housing');
                    // Eliminar imagen anterior de Cloudinary si existe
                    if (existingHousing.photoPublicId) {
                        await this.uploadService.deleteImage(existingHousing.photoPublicId);
                    }
                    housing.photoUrl = uploadResult.url;
                    housing.photoPublicId = uploadResult.public_id;
                }
                catch (uploadError) {
                    return res.status(500).json({
                        message: 'Error al subir la nueva imagen',
                        error: uploadError
                    });
                }
            }
            // Convertir strings a números si es necesario
            if (typeof housing.bedrooms === 'string') {
                housing.bedrooms = parseInt(housing.bedrooms, 10);
            }
            if (typeof housing.bathrooms === 'string') {
                housing.bathrooms = parseInt(housing.bathrooms, 10);
            }
            if (typeof housing.squareMeters === 'string') {
                housing.squareMeters = parseFloat(housing.squareMeters);
            }
            // Convertir isAvailable de string a boolean si es necesario
            if (typeof housing.isAvailable === 'string') {
                housing.isAvailable = housing.isAvailable === 'true';
            }
            // Convertir amenities de string a array si viene como string
            if (typeof housing.amenities === 'string') {
                housing.amenities = housing.amenities.split(',').map((item) => item.trim());
            }
            this.repository.merge(existingHousing, housing);
            const result = await this.repository.save(existingHousing);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error al actualizar la vivienda', error });
        }
    }
    // Eliminar una vivienda
    async delete(req, res) {
        try {
            const housing = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            // Eliminar la imagen de Cloudinary si existe
            if (housing.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(housing.photoPublicId);
                }
                catch (deleteError) {
                    console.error('Error eliminando imagen de Cloudinary:', deleteError);
                    // Continuar con la eliminación del registro aunque falle la imagen
                }
            }
            await this.repository.remove(housing);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al eliminar la vivienda', error });
        }
    }
    // Buscar por número de habitaciones
    async searchByBedrooms(req, res) {
        try {
            const { bedrooms } = req.query;
            const housings = await this.repository.findByBedrooms(Number(bedrooms));
            return res.json(housings);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error en la búsqueda por habitaciones', error });
        }
    }
    // Buscar por dirección
    async searchByAddress(req, res) {
        try {
            const { address } = req.query;
            const housings = await this.repository.searchByAddress(String(address));
            return res.json(housings);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error en la búsqueda por dirección', error });
        }
    }
    // Actualizar solo la imagen de una vivienda
    async updateImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
            }
            const housing = await this.repository.findOne({ where: { id } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            try {
                // Subir nueva imagen a Cloudinary
                const uploadResult = await this.uploadService.uploadImage(file, 'housing');
                // Eliminar imagen anterior de Cloudinary si existe
                if (housing.photoPublicId) {
                    await this.uploadService.deleteImage(housing.photoPublicId);
                }
                // Actualizar con los nuevos datos
                housing.photoUrl = uploadResult.url;
                housing.photoPublicId = uploadResult.public_id;
                await this.repository.save(housing);
                return res.status(200).json({
                    message: 'Imagen de la vivienda actualizada exitosamente',
                    housing: {
                        ...housing,
                        photoUrl: housing.photoUrl
                    }
                });
            }
            catch (uploadError) {
                return res.status(500).json({
                    message: 'Error al subir la imagen',
                    error: uploadError
                });
            }
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al actualizar la imagen', error });
        }
    }
    // Eliminar la imagen de una vivienda
    async deleteImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const housing = await this.repository.findOne({ where: { id } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            if (!housing.photoUrl || !housing.photoPublicId) {
                return res.status(400).json({ message: 'La vivienda no tiene imagen' });
            }
            try {
                // Eliminar de Cloudinary
                await this.uploadService.deleteImage(housing.photoPublicId);
                // Actualizar la vivienda para eliminar las referencias
                housing.photoUrl = null;
                housing.photoPublicId = null;
                await this.repository.save(housing);
                return res.status(200).json({
                    message: 'Imagen eliminada exitosamente',
                    housing
                });
            }
            catch (deleteError) {
                return res.status(500).json({
                    message: 'Error al eliminar la imagen de Cloudinary',
                    error: deleteError
                });
            }
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al eliminar la imagen', error });
        }
    }
}
exports.HousingController = HousingController;
