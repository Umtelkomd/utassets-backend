"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
const controller = new userController_1.UserController();
// Rutas públicas
router.post('/register', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.createUser.bind(controller));
router.post('/confirm-email', controller.confirmEmail.bind(controller));
router.post('/resend-confirmation', controller.resendConfirmationEmail.bind(controller));
router.post('/forgot-password', AuthController_1.authController.forgotPassword.bind(AuthController_1.authController));
router.post('/reset-password', AuthController_1.authController.resetPassword.bind(AuthController_1.authController));
// Rutas protegidas
router.use(authMiddleware_1.authMiddleware);
// Rutas que requieren autenticación
router.get('/', controller.getUsers.bind(controller));
router.get('/:id', controller.getUserById.bind(controller));
router.put('/:id', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.updateUser.bind(controller));
// Rutas específicas para imágenes
router.put('/:id/image', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.updateUserImage.bind(controller));
router.delete('/:id/image', controller.deleteUserImage.bind(controller));
// Ruta para eliminar usuario (solo administradores)
router.delete('/:id', authMiddleware_1.isAdmin, AuthController_1.authController.deleteUser.bind(AuthController_1.authController));
exports.default = router;
