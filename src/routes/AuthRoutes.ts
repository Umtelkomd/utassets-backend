import express from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Rutas públicas
router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));

// Rutas protegidas que requieren autenticación
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

// Rutas de administración (solo administradores)
router.get('/users', authMiddleware, authController.getAllUsers.bind(authController));
router.get('/users/:id', isAdmin, authController.getUserById.bind(authController));
router.put('/users/:id', isAdmin, authController.updateUser.bind(authController));
router.delete('/users/:id', isAdmin, authController.deleteUser.bind(authController));

export default router; 