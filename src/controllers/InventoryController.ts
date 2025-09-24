import { Request, Response } from 'express';
import { inventoryRepository } from '../repositories/InventoryRepository';
import { uploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import { In } from 'typeorm';

class InventoryController {
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
        this.createItem = this.createItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.getAllItems = this.getAllItems.bind(this);
        this.getItem = this.getItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.updateItemImage = this.updateItemImage.bind(this);
        this.deleteItemImage = this.deleteItemImage.bind(this);
        this.addResponsibleUser = this.addResponsibleUser.bind(this);
        this.removeResponsibleUser = this.removeResponsibleUser.bind(this);
        this.getResponsibleUsers = this.getResponsibleUsers.bind(this);
    }

    async createItem(req: Request, res: Response): Promise<void> {
        try {
            const item = req.body;
            const file = req.file;

            // Procesar la imagen si existe
            if (file) {
                try {
                    const uploadResult = await this.uploadService.uploadImage(file, 'inventory');
                    item.photoUrl = uploadResult.url;
                    item.photoPublicId = uploadResult.public_id;
                } catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    res.status(500).json({ message: 'Error al subir la imagen del item' });
                    return;
                }
            }

            // Validar que los campos requeridos estén presentes
            const requiredFields = ['itemName', 'category', 'quantity', 'condition'];
            const missingFields = requiredFields.filter(field => !item[field]);

            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    fields: missingFields
                });
                return;
            }

            // Convertir campos opcionales vacíos a null
            const optionalFields = [
                'acquisitionDate',
                'lastMaintenanceDate',
                'nextMaintenanceDate',
                'notes'
            ];

            optionalFields.forEach((field) => {
                if (item[field] === '' || item[field] === undefined) {
                    item[field] = null;
                }
            });

            // Convertir strings a números si es necesario
            if (typeof item.quantity === 'string' && item.quantity) {
                item.quantity = parseInt(item.quantity, 10);
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof item.acquisitionDate === 'string' && item.acquisitionDate) {
                item.acquisitionDate = new Date(item.acquisitionDate);
            }

            if (typeof item.lastMaintenanceDate === 'string' && item.lastMaintenanceDate) {
                item.lastMaintenanceDate = new Date(item.lastMaintenanceDate);
            }

            if (typeof item.nextMaintenanceDate === 'string' && item.nextMaintenanceDate) {
                item.nextMaintenanceDate = new Date(item.nextMaintenanceDate);
            }

            // Manejar usuarios responsables
            if (item.responsibleUsers) {
                try {
                    // Si es un string, intentar parsearlo como JSON
                    if (typeof item.responsibleUsers === 'string') {
                        item.responsibleUsers = JSON.parse(item.responsibleUsers);
                    }

                    if (Array.isArray(item.responsibleUsers)) {
                        // Extraer los IDs de los usuarios
                        const userIds = item.responsibleUsers.map((user: { id: number }) => user.id);

                        // Verificar que todos los usuarios existan
                        const users = await AppDataSource.getRepository(User).findBy({ id: In(userIds) });

                        if (users.length !== userIds.length) {
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return;
                        }

                        item.responsibleUsers = users;
                    }
                } catch (error) {
                    console.error('Error al procesar usuarios responsables:', error);
                    res.status(400).json({
                        message: 'Error al procesar los usuarios responsables'
                    });
                    return;
                }
            } else if (item.responsibleUsers === null) {
                item.responsibleUsers = [];
            }

            const newItem = await inventoryRepository.createItem(item);
            res.status(201).json(newItem);
        } catch (error) {
            console.error('Error al crear item:', error);
            res.status(500).json({ message: 'Error al crear el item' });
        }
    }

    async getAllItems(req: Request, res: Response): Promise<void> {
        try {
            const items = await inventoryRepository.getAllItems();
            const itemsWithResponsibles = items.map(item => ({
                ...item,
                responsibleUsers: item.responsibleUsers?.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive
                })) || []
            }));
            res.status(200).json(itemsWithResponsibles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los items', error: (error as Error).message });
        }
    }

    async getItem(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }

            const item = await inventoryRepository.getItemById(id);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }

            // Filtrar la información de los usuarios responsables
            const itemWithFilteredResponsibles = {
                ...item,
                responsibleUsers: item.responsibleUsers?.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive
                })) || []
            };

            res.status(200).json(itemWithFilteredResponsibles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el item', error: (error as Error).message });
        }
    }

    async updateItem(req: Request, res: Response): Promise<void> {
        try {
            const itemId = parseInt(req.params.id, 10);
            const item = req.body;
            const file = req.file;

            if (isNaN(itemId)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }

            const existingItem = await inventoryRepository.getItemById(itemId);
            if (!existingItem) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }

            // Procesar la imagen si existe
            if (file) {
                try {
                    // Eliminar imagen anterior de Cloudinary si existe
                    if (existingItem.photoPublicId) {
                        await this.uploadService.deleteImage(existingItem.photoPublicId);
                    }

                    // Subir nueva imagen
                    const uploadResult = await this.uploadService.uploadImage(file, 'inventory');
                    item.photoUrl = uploadResult.url;
                    item.photoPublicId = uploadResult.public_id;
                } catch (error) {
                    console.error('Error al procesar la imagen:', error);
                    res.status(500).json({ message: 'Error al procesar la imagen del item' });
                    return;
                }
            }

            // Convertir campos opcionales vacíos a null
            const optionalFields = [
                'acquisitionDate',
                'lastMaintenanceDate',
                'nextMaintenanceDate',
                'notes'
            ];

            optionalFields.forEach((field) => {
                if (item[field] === '' || item[field] === undefined) {
                    item[field] = null;
                }
            });

            // Convertir strings a números si es necesario
            if (typeof item.quantity === 'string' && item.quantity) {
                item.quantity = parseInt(item.quantity, 10);
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof item.acquisitionDate === 'string' && item.acquisitionDate) {
                item.acquisitionDate = new Date(item.acquisitionDate);
            }

            if (typeof item.lastMaintenanceDate === 'string' && item.lastMaintenanceDate) {
                item.lastMaintenanceDate = new Date(item.lastMaintenanceDate);
            }

            if (typeof item.nextMaintenanceDate === 'string' && item.nextMaintenanceDate) {
                item.nextMaintenanceDate = new Date(item.nextMaintenanceDate);
            }

            // Manejar usuarios responsables
            if (item.responsibleUsers !== undefined) {
                try {
                    // Si es un string, intentar parsearlo como JSON
                    if (typeof item.responsibleUsers === 'string') {
                        item.responsibleUsers = JSON.parse(item.responsibleUsers);
                    }

                    if (Array.isArray(item.responsibleUsers)) {
                        // Extraer los IDs de los usuarios
                        const userIds = item.responsibleUsers.map((user: { id: number }) => user.id);

                        // Verificar que todos los usuarios existan
                        const users = await AppDataSource.getRepository(User).findBy({ id: In(userIds) });

                        if (users.length !== userIds.length) {
                            res.status(400).json({
                                message: 'Uno o más usuarios responsables no existen'
                            });
                            return;
                        }

                        item.responsibleUsers = users;
                    }
                } catch (error) {
                    console.error('Error al procesar usuarios responsables:', error);
                    res.status(400).json({
                        message: 'Error al procesar los usuarios responsables'
                    });
                    return;
                }
            }

            const updatedItem = await inventoryRepository.updateItem(itemId, item);
            res.status(200).json(updatedItem);
        } catch (error) {
            console.error('Error al actualizar item:', error);
            res.status(500).json({ message: 'Error al actualizar el item' });
        }
    }

    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            const itemId = parseInt(req.params.id, 10);
            if (isNaN(itemId)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }

            const item = await inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }

            // Eliminar imagen de Cloudinary si existe
            if (item.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(item.photoPublicId);
                } catch (error) {
                    console.error('Error al eliminar imagen de Cloudinary:', error);
                    // Continuar con la eliminación del item aunque falle la eliminación de la imagen
                }
            }

            await inventoryRepository.deleteItem(itemId);
            res.status(200).json({ message: 'Item eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar item:', error);
            res.status(500).json({ message: 'Error al eliminar el item' });
        }
    }

    async updateItemImage(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id, 10);
            const file = req.file;

            if (!file) {
                res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
                return res.status(500).json({ message: 'Error al actualizar la imagen', error: 'No se proporcionó ninguna imagen' });
            }

            const item = await inventoryRepository.getItemById(id);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return res.status(500).json({ message: 'Error al actualizar la imagen', error: 'Item no encontrado' });
            }

            // Eliminar la imagen anterior si existe
            if (item.photoPublicId) {
                try {
                    await this.uploadService.deleteImage(item.photoPublicId);
                } catch (error) {
                    console.error('Error al eliminar la imagen anterior:', error);
                }
            }

            try {
                // Subir nueva imagen a Cloudinary
                const uploadResult = await this.uploadService.uploadImage(file, 'inventory');

                // Actualizar con los nuevos datos
                item.photoUrl = uploadResult.url;
                item.photoPublicId = uploadResult.public_id;
                await inventoryRepository.updateItem(id, {
                    photoUrl: uploadResult.url,
                    photoPublicId: uploadResult.public_id
                });

                return res.status(200).json({
                    message: 'Imagen del item actualizada exitosamente',
                    item: {
                        ...item,
                        photoUrl: item.photoUrl
                    }
                });
            } catch (uploadError) {
                return res.status(500).json({
                    message: 'Error al subir la imagen',
                    error: uploadError
                });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Error al actualizar la imagen', error });
        }
    }

    async deleteItemImage(req: Request, res: Response): Promise<Response> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ message: 'ID de item inválido' });
            }

            const item = await inventoryRepository.getItemById(id);
            if (!item) {
                return res.status(404).json({ message: 'Item no encontrado' });
            }

            if (!item.photoPublicId) {
                return res.status(400).json({ message: 'El item no tiene imagen' });
            }

            // Eliminar la imagen de Cloudinary
            try {
                await this.uploadService.deleteImage(item.photoPublicId);
            } catch (error) {
                console.error('Error al eliminar la imagen de Cloudinary:', error);
                return res.status(500).json({ message: 'Error al eliminar la imagen' });
            }

            // Actualizar el item para eliminar las referencias a la imagen
            const updatedItem = await inventoryRepository.updateItem(id, {
                photoUrl: null,
                photoPublicId: null
            });

            return res.status(200).json({
                message: 'Imagen eliminada exitosamente',
                item: updatedItem
            });
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            return res.status(500).json({ message: 'Error al eliminar la imagen' });
        }
    }

    async addResponsibleUser(req: Request, res: Response): Promise<void> {
        try {
            const itemId = parseInt(req.params.id, 10);
            const { userId } = req.body;

            if (isNaN(itemId)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }

            if (!userId) {
                res.status(400).json({ message: 'ID de usuario requerido' });
                return;
            }

            const item = await inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }

            const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Verificar si el usuario ya es responsable
            const isAlreadyResponsible = item.responsibleUsers?.some(u => u.id === userId);
            if (isAlreadyResponsible) {
                res.status(400).json({ message: 'El usuario ya es responsable de este item' });
                return;
            }

            // Agregar el usuario a la lista de responsables
            item.responsibleUsers = [...(item.responsibleUsers || []), user];
            await inventoryRepository.updateItem(itemId, item);

            res.status(200).json({
                message: 'Usuario agregado como responsable exitosamente',
                item: {
                    ...item,
                    responsibleUsers: item.responsibleUsers.map(user => ({
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
            const itemId = parseInt(req.params.id, 10);
            const { userId } = req.body;

            if (isNaN(itemId)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }

            if (!userId) {
                res.status(400).json({ message: 'ID de usuario requerido' });
                return;
            }

            const item = await inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }

            // Verificar si el usuario es responsable
            const isResponsible = item.responsibleUsers?.some(u => u.id === userId);
            if (!isResponsible) {
                res.status(400).json({ message: 'El usuario no es responsable de este item' });
                return;
            }

            // Remover el usuario de la lista de responsables
            item.responsibleUsers = item.responsibleUsers?.filter(u => u.id !== userId) || [];
            await inventoryRepository.updateItem(itemId, item);

            res.status(200).json({
                message: 'Usuario removido como responsable exitosamente',
                item: {
                    ...item,
                    responsibleUsers: item.responsibleUsers.map(user => ({
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
            const itemId = parseInt(req.params.id, 10);

            if (isNaN(itemId)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }

            const item = await inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }

            const responsibleUsers = item.responsibleUsers?.map(user => ({
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

// Exportar la instancia con el nombre correcto
export const inventoryController = new InventoryController(); 