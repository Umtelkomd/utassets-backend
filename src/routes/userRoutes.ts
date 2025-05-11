import express, { Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const userController = new UserController();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/users';
        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadMulter = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: (req, file, cb) => {
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

// Middleware para manejar errores de multer
const handleMulterError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB' });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Rutas públicas
router.post('/register', uploadMulter.single('image'), handleMulterError, userController.createUser.bind(userController));

// Rutas protegidas
router.get('/', authMiddleware, userController.getUsers.bind(userController));
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));
router.put('/:id', authMiddleware, userController.updateUser.bind(userController));
router.put('/:id/image', authMiddleware, uploadMulter.single('image'), handleMulterError, userController.updateUserImage.bind(userController));
router.delete('/:id/image', authMiddleware, userController.deleteUserImage.bind(userController));

export default router; 