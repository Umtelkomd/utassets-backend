"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Rutas públicas
router.post('/login', AuthController_1.authController.login.bind(AuthController_1.authController));
router.post('/register', AuthController_1.authController.register.bind(AuthController_1.authController));
// Rutas protegidas que requieren autenticación
router.get('/me', authMiddleware_1.authMiddleware, AuthController_1.authController.getCurrentUser.bind(AuthController_1.authController));
router.post('/change-password', authMiddleware_1.authMiddleware, AuthController_1.authController.changePassword.bind(AuthController_1.authController));
// Rutas de administración (solo administradores)
router.get('/users', authMiddleware_1.authMiddleware, AuthController_1.authController.getAllUsers.bind(AuthController_1.authController));
router.get('/users/:id', authMiddleware_1.isAdmin, AuthController_1.authController.getUserById.bind(AuthController_1.authController));
router.put('/users/:id', authMiddleware_1.isAdmin, AuthController_1.authController.updateUser.bind(AuthController_1.authController));
router.delete('/users/:id', authMiddleware_1.isAdmin, AuthController_1.authController.deleteUser.bind(AuthController_1.authController));
exports.default = router;
