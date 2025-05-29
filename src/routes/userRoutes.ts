import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new UserController();

// Rutas públicas
router.post('/register', upload.single('image'), handleMulterError, controller.createUser.bind(controller));

// Rutas protegidas
router.use(authMiddleware);

// Rutas que requieren autenticación
router.get('/', controller.getUsers.bind(controller));
router.get('/:id', controller.getUserById.bind(controller));
router.put('/:id', controller.updateUser.bind(controller));

// Rutas específicas para imágenes
router.put('/:id/image', upload.single('image'), handleMulterError, controller.updateUserImage.bind(controller));
router.delete('/:id/image', controller.deleteUserImage.bind(controller));

export default router; 