import express from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const userController = new UserController();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/users');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Rutas públicas
router.post('/register', userController.createUser.bind(userController));

// Rutas protegidas
router.get('/', authMiddleware, userController.getUsers.bind(userController));
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));
router.put('/:id', authMiddleware, userController.updateUser.bind(userController));
router.put('/:id/image', authMiddleware, upload.single('image'), userController.updateUserImage.bind(userController));
router.delete('/:id/image', authMiddleware, userController.deleteUserImage.bind(userController));

export default router; 