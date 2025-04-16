import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { inventoryController } from '../controllers/InventoryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Configurar multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'uploads/inventory';
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        // Generar un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'inventory-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: (_req, file, cb) => {
        // Validar tipos de archivo
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});

// Rutas
router.post('/', authMiddleware, upload.single('image'), inventoryController.createItem);
router.get('/', authMiddleware, inventoryController.getAllItems);
router.get('/:id', authMiddleware, inventoryController.getItem);
router.put('/:id', authMiddleware, upload.single('image'), inventoryController.updateItem);
router.delete('/:id', authMiddleware, inventoryController.deleteItem);

// Rutas específicas para imágenes
router.post('/:id/image', authMiddleware, upload.single('image'), inventoryController.updateItemImage);
router.delete('/:id/image', authMiddleware, inventoryController.deleteItemImage);

export default router;