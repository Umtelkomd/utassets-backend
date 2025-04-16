"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const InventoryRepository_1 = require("../repositories/InventoryRepository");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class InventoryController {
    async createItem(req, res) {
        try {
            const item = req.body;
            // Convertir campos opcionales vacíos a null
            const optionalFields = [
                'acquisitionDate',
                'lastMaintenanceDate',
                'nextMaintenanceDate',
                'notes',
                'imagePath'
            ];
            optionalFields.forEach((field) => {
                if (item[field] === '' || item[field] === undefined) {
                    item[field] = null;
                }
            });
            // Si hay archivo cargado, guardar solo el nombre del archivo
            if (req.file) {
                item.imagePath = req.file.filename;
                console.log(`Imagen guardada: ${req.file.filename} para ítem: ${item.itemName || 'Nuevo'}`);
            }
            const newItem = await InventoryRepository_1.inventoryRepository.createItem(item);
            res.status(201).json(newItem);
        }
        catch (error) {
            console.error(error);
            // Si hay un error y se subió un archivo, intentar eliminarlo
            if (req.file) {
                try {
                    const filePath = path_1.default.join(process.cwd(), 'uploads', req.file.filename);
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                        console.log(`Archivo eliminado debido a error: ${filePath}`);
                    }
                }
                catch (err) {
                    console.error('Error al eliminar archivo tras fallo:', err);
                }
            }
            res.status(500).json({ message: 'Error al crear el item', error: error.message });
        }
    }
    async getAllItems(req, res) {
        try {
            const items = await InventoryRepository_1.inventoryRepository.getAllItems();
            res.status(200).json(items);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los items', error: error.message });
        }
    }
    async getItem(req, res) {
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
            res.status(200).json(item);
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
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            // Obtener el item existente antes de actualizarlo
            const existingItem = await InventoryRepository_1.inventoryRepository.getItemById(id);
            if (!existingItem) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            const item = req.body;
            // Si hay archivo cargado, guardar solo el nombre del archivo y eliminar la anterior
            if (req.file) {
                // Guardar solo el nombre del archivo nuevo
                item.imagePath = req.file.filename;
                console.log(`Nueva imagen guardada: ${req.file.filename} para ítem: ${existingItem.itemName || id}`);
                // Eliminar la imagen anterior si existe
                if (existingItem.imagePath) {
                    try {
                        // Usar directamente el nombre del archivo guardado
                        const fullPath = path_1.default.join(process.cwd(), 'uploads', existingItem.imagePath);
                        // Verificar si el archivo existe antes de intentar eliminarlo
                        if (fs_1.default.existsSync(fullPath)) {
                            fs_1.default.unlinkSync(fullPath);
                            console.log(`Imagen anterior eliminada: ${existingItem.imagePath}`);
                        }
                    }
                    catch (err) {
                        console.error('Error al eliminar la imagen anterior:', err);
                        // Continuamos con la actualización aunque no se haya podido eliminar la imagen
                    }
                }
            }
            const updatedItem = await InventoryRepository_1.inventoryRepository.updateItem(id, item);
            if (!updatedItem) {
                res.status(404).json({ message: 'Item no encontrado' });
                return;
            }
            res.status(200).json(updatedItem);
        }
        catch (error) {
            console.error(error);
            // Si hay un error y se subió un archivo, intentar eliminarlo
            if (req.file) {
                try {
                    const filePath = path_1.default.join(process.cwd(), 'uploads', req.file.filename);
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                        console.log(`Archivo eliminado debido a error: ${filePath}`);
                    }
                }
                catch (err) {
                    console.error('Error al eliminar archivo tras fallo:', err);
                }
            }
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
                    const fullPath = path_1.default.join(process.cwd(), 'uploads', itemToDelete.imagePath);
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
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
