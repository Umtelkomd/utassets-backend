const axios = require('axios');

// URL del servicio de autenticación (UTAssets)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5051/api/auth';

// Middleware para verificar tokens JWT con el servicio de autenticación central
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1];

        // Si no hay token en el header, intentar obtenerlo de las cookies
        if (!token) {
            token = req.cookies?.authToken;
        }

        if (!token) {
            return res.status(401).json({ 
                error: 'Token de acceso requerido',
                message: 'Debe autenticarse para acceder a este recurso' 
            });
        }

        // Verificar el token con el servicio de autenticación central (UTAssets)
        const response = await axios.post(`${AUTH_SERVICE_URL}/verify-token`, {
            token: token
        }, {
            timeout: 5000 // 5 segundos de timeout
        });

        if (response.data.valid && response.data.user) {
            // Token válido, sincronizar usuario localmente
            const usersController = require('../controllers/usersController');
            try {
                const syncedUser = await usersController.syncUserFromUTAssets(response.data.user);
                console.log(`Usuario sincronizado: ${syncedUser.email}`);
            } catch (syncError) {
                console.error('Error al sincronizar usuario:', syncError.message);
                // Continuar aunque falle la sincronización
            }

            // Añadir información del usuario a la request
            req.user = response.data.user;
            req.userId = response.data.user.id;
            req.userRole = response.data.user.role;
            next();
        } else {
            return res.status(401).json({ 
                error: 'Token inválido',
                message: 'Su sesión ha expirado o el token no es válido' 
            });
        }

    } catch (error) {
        console.error('Error al verificar token:', error.message);
        
        if (error.code === 'ECONNREFUSED' || error.code === 'TIMEOUT') {
            return res.status(503).json({ 
                error: 'Servicio de autenticación no disponible',
                message: 'No se puede verificar la autenticación en este momento' 
            });
        }

        return res.status(401).json({ 
            error: 'Error de autenticación',
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar roles específicos
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado',
                message: 'Debe autenticarse para acceder a este recurso' 
            });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({ 
                error: 'Acceso denegado',
                message: 'No tiene permisos para acceder a este recurso' 
            });
        }

        next();
    };
};

// Middleware específico para administradores
const requireAdmin = requireRole(['administrador', 'ADMIN']);

module.exports = {
    authMiddleware,
    requireRole,
    requireAdmin
}; 