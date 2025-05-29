"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const controller = new userController_1.UserController();
// Rutas públicas
router.post('/register', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.createUser.bind(controller));
// Rutas protegidas
router.use(authMiddleware_1.authMiddleware);
// Rutas que requieren autenticación
router.get('/', controller.getUsers.bind(controller));
router.get('/:id', controller.getUserById.bind(controller));
router.put('/:id', controller.updateUser.bind(controller));
// Rutas específicas para imágenes
router.put('/:id/image', uploadMiddleware_1.upload.single('image'), uploadMiddleware_1.handleMulterError, controller.updateUserImage.bind(controller));
router.delete('/:id/image', controller.deleteUserImage.bind(controller));
exports.default = router;
