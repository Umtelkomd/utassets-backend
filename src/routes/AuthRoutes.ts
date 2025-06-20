import express from 'express';
import passport from 'passport';
import { authController } from '../controllers/AuthController';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

// Middleware para verificar si Google OAuth está configurado
const checkGoogleOAuthConfig = (req: any, res: any, next: any) => {
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
router.post('/login', authController.login.bind(authController));
router.post('/register', upload.single('image'), authController.register.bind(authController));

// Rutas de Google OAuth (con verificación de configuración)
router.get('/google',
    checkGoogleOAuthConfig,
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    checkGoogleOAuthConfig,
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000/utassets'}/login?error=google_auth_failed` }),
    authController.googleCallback.bind(authController)
);

// Rutas protegidas que requieren autenticación
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

// Rutas de administración (solo administradores)
router.get('/users', authMiddleware, authController.getAllUsers.bind(authController));
router.get('/users/:id', isAdmin, authController.getUserById.bind(authController));
router.put('/users/:id', isAdmin, authController.updateUser.bind(authController));
router.delete('/users/:id', isAdmin, authController.deleteUser.bind(authController));

export default router; 