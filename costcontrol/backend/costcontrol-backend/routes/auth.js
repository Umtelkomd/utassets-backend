const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { login, verify, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-costcontrol-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Public routes
router.post('/login', login);

// Protected routes
router.get('/verify', authenticateToken, verify);
router.post('/logout', authenticateToken, logout);

// Endpoint para verificar tokens (incluye manejo de tokens temporales)
router.post('/verify', async (req, res) => {
    try {
        const { token, tempToken, userData } = req.body;

        // Si es un token temporal de UTAssets
        if (tempToken && userData) {
            console.log('🔑 [Auth] Procesando token temporal de UTAssets');
            console.log('📄 [Auth] Datos del usuario:', {
                email: userData.email,
                role: userData.role,
                id: userData.id
            });

            // Verificar que el token temporal no sea muy antiguo (máximo 5 minutos)
            const tokenAge = Date.now() - userData.timestamp;
            if (tokenAge > 5 * 60 * 1000) {
                return res.status(401).json({
                    valid: false,
                    message: 'Token temporal expirado'
                });
            }

            // Verificar que sea administrador
            if (userData.role !== 'administrador' && userData.role !== 'ADMIN') {
                return res.status(403).json({
                    valid: false,
                    message: 'Solo administradores pueden acceder al Sistema de Control de Costos'
                });
            }

            // Generar token JWT válido para CostControl
            const jwtToken = jwt.sign(
                {
                    id: userData.id,
                    email: userData.email,
                    role: userData.role
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            console.log('✅ [Auth] Token JWT válido generado para:', userData.email);

            // Estructurar datos del usuario
            const user = {
                id: userData.id,
                email: userData.email,
                fullName: userData.email.split('@')[0], // Usar parte del email como nombre
                role: userData.role
            };

            return res.json({
                valid: true,
                token: jwtToken,
                user: user,
                message: 'Token temporal convertido exitosamente'
            });
        }

        // Si es un token JWT normal, verificarlo con UTAssets
        if (token) {
            const axios = require('axios');
            const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5051/api/auth';

            console.log('🔍 [Auth] Verificando token JWT con UTAssets');

            try {
                const response = await axios.post(`${AUTH_SERVICE_URL}/verify-token`, {
                    token: token
                }, {
                    timeout: 5000
                });

                if (response.data.valid && response.data.user) {
                    // Verificar que sea administrador
                    if (response.data.user.role !== 'administrador' && response.data.user.role !== 'ADMIN') {
                        return res.status(403).json({
                            valid: false,
                            message: 'Solo administradores pueden acceder al Sistema de Control de Costos'
                        });
                    }

                    console.log('✅ [Auth] Token JWT válido verificado para:', response.data.user.email);

                    return res.json({
                        valid: true,
                        user: response.data.user,
                        message: 'Token verificado exitosamente'
                    });
                } else {
                    return res.status(401).json({
                        valid: false,
                        message: 'Token inválido'
                    });
                }
            } catch (verifyError) {
                console.error('❌ [Auth] Error verificando token con UTAssets:', verifyError.message);
                
                if (verifyError.code === 'ECONNREFUSED') {
                    return res.status(503).json({
                        valid: false,
                        message: 'Servicio de autenticación no disponible'
                    });
                }

                return res.status(401).json({
                    valid: false,
                    message: 'Error verificando token'
                });
            }
        }

        return res.status(400).json({
            valid: false,
            message: 'Token o datos de usuario requeridos'
        });

    } catch (error) {
        console.error('❌ [Auth] Error en verificación:', error);
        return res.status(500).json({
            valid: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;