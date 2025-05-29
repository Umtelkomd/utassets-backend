"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRoles = exports.isAdmin = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entity/User");
const JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';
// Middleware para verificar que el usuario esté autenticado
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware para verificar que el usuario tenga rol de administrador
const isAdmin = (req, res, next) => {
    if (req.userRole !== User_1.UserRole.ADMIN) {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador' });
    }
    next();
};
exports.isAdmin = isAdmin;
// Middleware para verificar si el usuario tiene alguno de los roles permitidos
const hasRoles = (roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({
                message: 'Acceso denegado. No tienes los permisos necesarios.'
            });
        }
        next();
    };
};
exports.hasRoles = hasRoles;
