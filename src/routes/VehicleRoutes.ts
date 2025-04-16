import { Router } from 'express';
import { vehicleController } from '../controllers/VehicleController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Configurar multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'uploads/vehicles';
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        // Generar un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
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

// Rutas para vehículos
router.post('/', authMiddleware, upload.single('image'), vehicleController.createVehicle);
router.get('/', authMiddleware, vehicleController.getAllVehicles);
router.get('/:id', authMiddleware, vehicleController.getVehicle);
router.put('/:id', authMiddleware, upload.single('image'), vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

// Rutas específicas para imágenes
router.put('/:id/image', authMiddleware, upload.single('image'), vehicleController.updateVehicleImage);
router.delete('/:id/image', authMiddleware, vehicleController.deleteVehicleImage);

// Rutas para gestionar responsables
router.post('/:id/responsibles', authMiddleware, vehicleController.addResponsibleUser);
router.delete('/:id/responsibles', authMiddleware, vehicleController.removeResponsibleUser);
router.get('/:id/responsibles', authMiddleware, vehicleController.getResponsibleUsers);

export default router; 