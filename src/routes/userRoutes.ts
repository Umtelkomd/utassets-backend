import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';
import { authController } from '../controllers/AuthController';

const router = Router();
const controller = new UserController();

// Rutas públicas
router.post('/register', upload.single('image'), handleMulterError, controller.createUser.bind(controller));
router.post('/confirm-email', controller.confirmEmail.bind(controller));
router.post('/resend-confirmation', controller.resendConfirmationEmail.bind(controller));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Rutas protegidas
router.use(authMiddleware);

// Rutas que requieren autenticación
router.get('/', controller.getUsers.bind(controller));
router.get('/:id', controller.getUserById.bind(controller));
router.put('/:id', upload.single('image'), handleMulterError, controller.updateUser.bind(controller));

// Rutas específicas para imágenes
router.put('/:id/image', upload.single('image'), handleMulterError, controller.updateUserImage.bind(controller));
router.delete('/:id/image', controller.deleteUserImage.bind(controller));

// Ruta para eliminar usuario (solo administradores)
router.delete('/:id', isAdmin, authController.deleteUser.bind(authController));

export default router; 