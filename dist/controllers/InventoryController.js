"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const InventoryRepository_1 = require("../repositories/InventoryRepository");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const data_source_1 = require("../config/data-source");
const User_1 = require("../entity/User");
const typeorm_1 = require("typeorm");
const UserRepository_1 = require("../repositories/UserRepository");
class InventoryController {
    async createItem(req, res) {
        try {
            const item = req.body;
            const file = req.file;
            // Si hay una imagen, agregar la ruta al vehículo
            if (file) {
                item.imagePath = file.filename;
            }
            // Validar que los campos requeridos estén presentes
            const requiredFields = ['itemName', 'category', 'quantity', 'condition'];
            const missingFields = requiredFields.filter(field => !item[field]);
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
            // Manejar usuarios responsables
            if (item.responsibleUsers) {
                // Si es un string, intentar parsearlo como JSON
                if (typeof item.responsibleUsers === 'string') {
                    try {
                        item.responsibleUsers = JSON.parse(item.responsibleUsers);
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
                if (Array.isArray(item.responsibleUsers)) {
                    // Verificar que todos los usuarios existan
                    const userIds = item.responsibleUsers.map((user) => user.id);
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
                    item.responsibleUsers = users;
                }
            }
            else if (item.responsibleUsers === null) {
                // Si se envía null, significa que se quieren eliminar todos los responsables
                item.responsibleUsers = [];
            }
            const newItem = await InventoryRepository_1.inventoryRepository.createItem(item);
            res.status(201).json(newItem);
        }
        catch (error) {
            // Si hay error y se subió una imagen, eliminarla
            if (req.file) {
                fs_1.default.unlinkSync(req.file.path);
            }
            console.error('Error al crear el item:', error);
            res.status(500).json({
                message: 'Error al crear el item',
                error: error instanceof Error ? error.message : 'Error desconocido',
                details: error
            });
        }
    }
    async getAllItems(req, res) {
        try {
            const items = await InventoryRepository_1.inventoryRepository.getAllItems();
            const itemsWithResponsibles = items.map(item => {
                var _a;
                return ({
                    ...item,
                    responsibleUsers: ((_a = item.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(user => ({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        isActive: user.isActive
                    }))) || []
                });
            });
            res.status(200).json(itemsWithResponsibles);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los items', error: error.message });
        }
    }
    async getItem(req, res) {
        var _a;
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }
            const item = await InventoryRepository_1.inventoryRepository.getItemById(id);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            // Filtrar la información de los usuarios responsables
            const itemWithFilteredResponsibles = {
                ...item,
                responsibleUsers: ((_a = item.responsibleUsers) === null || _a === void 0 ? void 0 : _a.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive
                }))) || []
            };
            res.status(200).json(itemWithFilteredResponsibles);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el item', error: error.message });
        }
    }
    async updateItem(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                if (req.file) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const item = req.body;
            const file = req.file;
            // Obtener el item existente antes de actualizarlo
            const existingItem = await InventoryRepository_1.inventoryRepository.getItemById(id);
            if (!existingItem) {
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            // Si hay archivo cargado, guardar solo el nombre del archivo y eliminar la anterior
            if (file) {
                // Eliminar la imagen anterior si existe
                if (existingItem.imagePath) {
                    const oldImagePath = path_1.default.join(__dirname, '..', '..', 'uploads', 'vehicles', existingItem.imagePath);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                }
                // Solo guardar el nombre del archivo
                item.imagePath = file.filename;
            }
            // Manejar usuarios responsables
            if (item.responsibleUsers) {
                // Si es un string, intentar parsearlo como JSON
                if (typeof item.responsibleUsers === 'string') {
                    try {
                        item.responsibleUsers = JSON.parse(item.responsibleUsers);
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
                if (Array.isArray(item.responsibleUsers)) {
                    // Verificar que todos los usuarios existan
                    const userIds = item.responsibleUsers.map((user) => user.id);
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
                    item.responsibleUsers = users;
                }
            }
            else if (item.responsibleUsers === null) {
                // Si se envía null, significa que se quieren eliminar todos los responsables
                item.responsibleUsers = [];
            }
            const updatedItem = await InventoryRepository_1.inventoryRepository.updateItem(id, item);
            if (!updatedItem) {
                if (file) {
                    fs_1.default.unlinkSync(file.path);
                }
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            res.status(200).json(updatedItem);
        }
        catch (error) {
            // Si hay un error y se subió un archivo, intentar eliminarlo
            if (req.file) {
                try {
                    const filePath = path_1.default.join(process.cwd(), 'uploads', 'inventory', req.file.filename);
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                        console.log(`Archivo eliminado debido a error: ${filePath}`);
                    }
                }
                catch (err) {
                    console.error('Error al eliminar archivo tras fallo:', err);
                }
            }
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el item', error: error.message });
        }
    }
    async deleteItem(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            // Obtener el item antes de eliminarlo para poder eliminar también su imagen
            const itemToDelete = await InventoryRepository_1.inventoryRepository.getItemById(id);
            if (!itemToDelete) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            // Eliminar la imagen si existe
            if (itemToDelete.imagePath) {
                try {
                    // Usar directamente el nombre del archivo guardado
                    const fullPath = path_1.default.join(process.cwd(), 'uploads', 'inventory', itemToDelete.imagePath);
                    // Verificar si el archivo existe antes de intentar eliminarlo
                    if (fs_1.default.existsSync(fullPath)) {
                        fs_1.default.unlinkSync(fullPath);
                        console.log(`Imagen eliminada: ${itemToDelete.imagePath}`);
                    }
                }
                catch (err) {
                    console.error('Error al eliminar la imagen:', err);
                    // Continuamos con la eliminación aunque no se haya podido eliminar la imagen
                }
            }
            const deletedItem = await InventoryRepository_1.inventoryRepository.deleteItem(id);
            if (!deletedItem) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Item eliminado', item: deletedItem });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el item', error: error.message });
        }
    }
    async updateItemImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const item = await InventoryRepository_1.inventoryRepository.getItemById(id);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            if (!req.file) {
                res.status(400).json({ message: 'No se proporcionó una imagen' });
                return;
            }
            // Eliminar la imagen anterior si existe
            if (item.imagePath) {
                try {
                    const oldImagePath = path_1.default.join(process.cwd(), 'uploads', 'inventory', item.imagePath);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        fs_1.default.unlinkSync(oldImagePath);
                        console.log(`Imagen anterior eliminada: ${item.imagePath}`);
                    }
                }
                catch (err) {
                    console.error('Error al eliminar la imagen anterior:', err);
                }
            }
            // Actualizar con la nueva imagen
            item.imagePath = req.file.filename;
            const updatedItem = await InventoryRepository_1.inventoryRepository.updateItem(id, item);
            res.status(200).json({
                message: 'Imagen actualizada exitosamente',
                item: updatedItem
            });
        }
        catch (error) {
            console.error(error);
            if (req.file) {
                try {
                    const filePath = path_1.default.join(process.cwd(), 'uploads', 'inventory', req.file.filename);
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                        console.log(`Archivo eliminado debido a error: ${filePath}`);
                    }
                }
                catch (err) {
                    console.error('Error al eliminar archivo tras fallo:', err);
                }
            }
            res.status(500).json({ message: 'Error al actualizar la imagen', error: error.message });
        }
    }
    async deleteItemImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const item = await InventoryRepository_1.inventoryRepository.getItemById(id);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            if (!item.imagePath) {
                res.status(400).json({ message: 'El item no tiene una imagen' });
                return;
            }
            // Eliminar la imagen
            try {
                const imagePath = path_1.default.join(process.cwd(), 'uploads', 'inventory', item.imagePath);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                    console.log(`Imagen eliminada: ${item.imagePath}`);
                }
            }
            catch (err) {
                console.error('Error al eliminar la imagen:', err);
            }
            // Actualizar el item para eliminar la referencia a la imagen
            item.imagePath = null;
            const updatedItem = await InventoryRepository_1.inventoryRepository.updateItem(id, item);
            res.status(200).json({
                message: 'Imagen eliminada exitosamente',
                item: updatedItem
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la imagen', error: error.message });
        }
    }
    async addResponsibleUser(req, res) {
        try {
            const itemId = parseInt(req.params.id, 10);
            const { userId } = req.body;
            if (isNaN(itemId) || !userId) {
                res.status(400).json({ message: 'ID de item y usuario requeridos' });
                return;
            }
            const item = await InventoryRepository_1.inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            const user = await UserRepository_1.userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Verificar si el usuario ya es responsable
            const isAlreadyResponsible = item.responsibleUsers.some(u => u.id === userId);
            if (isAlreadyResponsible) {
                res.status(400).json({ message: 'El usuario ya es responsable de este item' });
                return;
            }
            // Agregar el usuario como responsable
            item.responsibleUsers.push(user);
            await InventoryRepository_1.inventoryRepository.updateItem(itemId, { responsibleUsers: item.responsibleUsers });
            res.status(200).json({
                message: 'Usuario agregado como responsable exitosamente',
                item: {
                    ...item,
                    responsibleUsers: item.responsibleUsers
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
            const itemId = parseInt(req.params.id, 10);
            const { userId } = req.body;
            if (isNaN(itemId) || !userId) {
                res.status(400).json({ message: 'ID de item y usuario requeridos' });
                return;
            }
            const item = await InventoryRepository_1.inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            // Verificar si el usuario es responsable
            const userIndex = item.responsibleUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                res.status(400).json({ message: 'El usuario no es responsable de este item' });
                return;
            }
            // Remover el usuario de los responsables
            item.responsibleUsers.splice(userIndex, 1);
            await InventoryRepository_1.inventoryRepository.updateItem(itemId, { responsibleUsers: item.responsibleUsers });
            res.status(200).json({
                message: 'Usuario removido como responsable exitosamente',
                item: {
                    ...item,
                    responsibleUsers: item.responsibleUsers
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
            const itemId = parseInt(req.params.id, 10);
            if (isNaN(itemId)) {
                res.status(400).json({ message: 'ID de item inválido' });
                return;
            }
            const item = await InventoryRepository_1.inventoryRepository.getItemById(itemId);
            if (!item) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            res.status(200).json({
                message: 'Responsables del item obtenidos exitosamente',
                responsibleUsers: item.responsibleUsers
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
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
