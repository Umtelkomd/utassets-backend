"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const InventoryRepository_1 = require("../repositories/InventoryRepository");
const InventoryController_1 = require("../controllers/InventoryController");
const router = (0, express_1.Router)();
// Asegurarse de que existe la carpeta uploads
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configurar multer para guardar imágenes
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: async (req, file, cb) => {
        try {
            // Obtener el nombre del ítem
            let itemName = '';
            // Si es una actualización, obtener el nombre del ítem existente
            if (req.params.id) {
                const itemId = parseInt(req.params.id, 10);
                if (!isNaN(itemId)) {
                    const existingItem = await InventoryRepository_1.inventoryRepository.getItemById(itemId);
                    if (existingItem && existingItem.itemName) {
                        itemName = existingItem.itemName;
                    }
                }
            }
            // Si no pudimos obtener el nombre o es un nuevo ítem, usar el nombre del body
            if (!itemName && req.body && req.body.itemName) {
                itemName = req.body.itemName;
            }
            // Si aún no tenemos nombre, usar un valor por defecto
            if (!itemName) {
                itemName = 'inventory_item';
            }
            // Procesar el nombre para que sea seguro como nombre de archivo
            const safeItemName = itemName
                .toLowerCase()
                .replace(/[^a-z0-9]/gi, '_') // Reemplazar caracteres no alfanuméricos con guiones bajos
                .replace(/_+/g, '_') // Reemplazar múltiples guiones bajos con uno solo
                .replace(/^_|_$/g, '') // Eliminar guiones bajos al inicio y al final
                .slice(0, 50); // Limitar longitud
            const fileExt = path_1.default.extname(file.originalname);
            // Añadir un código corto para evitar colisiones en caso de nombres iguales
            const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
            cb(null, `${safeItemName}_${timestamp}${fileExt}`);
        }
        catch (error) {
            // En caso de error, usar un nombre genérico
            console.error('Error al generar nombre de archivo:', error);
            const timestamp = Date.now();
            const fileExt = path_1.default.extname(file.originalname);
            cb(null, `inventory_${timestamp}${fileExt}`);
        }
    }
});
const upload = (0, multer_1.default)({ storage });
// Rutas
router.post('/', upload.single('imagePath'), InventoryController_1.inventoryController.createItem.bind(InventoryController_1.inventoryController));
router.get('/', InventoryController_1.inventoryController.getAllItems.bind(InventoryController_1.inventoryController));
router.get('/:id', InventoryController_1.inventoryController.getItem.bind(InventoryController_1.inventoryController));
router.put('/:id', upload.single('imagePath'), InventoryController_1.inventoryController.updateItem.bind(InventoryController_1.inventoryController));
router.delete('/:id', InventoryController_1.inventoryController.deleteItem.bind(InventoryController_1.inventoryController));
exports.default = router;
