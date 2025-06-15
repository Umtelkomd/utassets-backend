"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = express_1.default.Router();
// Middleware para verificar si Google OAuth está configurado
const checkGoogleOAuthConfig = (req, res, next) => {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET ||
        GOOGLE_CLIENT_ID === 'your_google_client_id_here' ||
        GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
        return res.status(503).json({
            message: 'Google OAuth no está configurado en el servidor',
            error: 'GOOGLE_OAUTH_NOT_CONFIGURED',
            instructions: 'Por favor, configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en las variables de entorno'
        });
    }
    next();
};
// Rutas públicas
router.post('/login', AuthController_1.authController.login.bind(AuthController_1.authController));
router.post('/register', uploadMiddleware_1.upload.single('image'), AuthController_1.authController.register.bind(AuthController_1.authController));
// Rutas de Google OAuth (con verificación de configuración)
router.get('/google', checkGoogleOAuthConfig, passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', checkGoogleOAuthConfig, passport_1.default.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/utassets/login?error=google_auth_failed` }), AuthController_1.authController.googleCallback.bind(AuthController_1.authController));
// Rutas protegidas que requieren autenticación
router.get('/me', authMiddleware_1.authMiddleware, AuthController_1.authController.getCurrentUser.bind(AuthController_1.authController));
router.post('/change-password', authMiddleware_1.authMiddleware, AuthController_1.authController.changePassword.bind(AuthController_1.authController));
// Rutas de administración (solo administradores)
router.get('/users', authMiddleware_1.authMiddleware, AuthController_1.authController.getAllUsers.bind(AuthController_1.authController));
router.get('/users/:id', authMiddleware_1.isAdmin, AuthController_1.authController.getUserById.bind(AuthController_1.authController));
router.put('/users/:id', authMiddleware_1.isAdmin, AuthController_1.authController.updateUser.bind(AuthController_1.authController));
router.delete('/users/:id', authMiddleware_1.isAdmin, AuthController_1.authController.deleteUser.bind(AuthController_1.authController));
exports.default = router;
