"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const InventoryController_1 = require("../controllers/InventoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Configurar multer para la subida de imágenes
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'uploads/inventory';
        // Crear el directorio si no existe
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        // Generar un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'inventory-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: (_req, file, cb) => {
        // Validar tipos de archivo
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});
// Rutas
router.post('/', authMiddleware_1.authMiddleware, upload.single('image'), InventoryController_1.inventoryController.createItem);
router.get('/', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.getAllItems);
router.get('/:id', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.getItem);
router.put('/:id', authMiddleware_1.authMiddleware, upload.single('image'), InventoryController_1.inventoryController.updateItem);
router.delete('/:id', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.deleteItem);
// Rutas específicas para imágenes
router.post('/:id/image', authMiddleware_1.authMiddleware, upload.single('image'), InventoryController_1.inventoryController.updateItemImage);
router.delete('/:id/image', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.deleteItemImage);
// Rutas para usuarios responsables
router.post('/:id/responsibles', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.addResponsibleUser);
router.delete('/:id/responsibles', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.removeResponsibleUser);
router.get('/:id/responsibles', authMiddleware_1.authMiddleware, InventoryController_1.inventoryController.getResponsibleUsers);
exports.default = router;
