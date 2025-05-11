"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRoles = exports.isAdmin = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entity/User");
const JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';
// Middleware para verificar que el usuario esté autenticado
const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No se proporcionó token de autenticación' });
            return;
        }
        // Extraer el token
        const token = authHeader.split(' ')[1];
        // Verificar y decodificar el token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Agregar datos del usuario decodificados a la request
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware para verificar que el usuario tenga rol de administrador
const adminMiddleware = (req, res, next) => {
    if (req.userRole !== User_1.UserRole.ADMIN) {
        res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
// Middleware combinado para verificar autenticación y rol de administrador
exports.isAdmin = [exports.authMiddleware, exports.adminMiddleware];
// Middleware para verificar si el usuario tiene alguno de los roles permitidos
const hasRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            res.status(403).json({
                message: 'Acceso denegado. No tiene los permisos necesarios.',
                requiredRoles: roles,
                currentRole: req.userRole
            });
            return;
        }
        next();
    };
};
exports.hasRoles = hasRoles;
