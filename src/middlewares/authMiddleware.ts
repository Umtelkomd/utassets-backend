import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../entity/User';

const JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';

// Interfaz para extender la Request y añadir los datos del usuario
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userRole?: UserRole;
        }
    }
}

// Middleware para verificar que el usuario esté autenticado
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Agregar datos del usuario decodificados a la request
        req.userId = decoded.id;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({ message: 'Token inválido o expirado', error: (error as Error).message });
    }
};

// Middleware para verificar que el usuario tenga rol de administrador
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
        return;
    }
    next();
};

// Middleware combinado para verificar autenticación y rol de administrador
export const isAdmin = [authMiddleware, adminMiddleware];

// Middleware para verificar si el usuario tiene alguno de los roles permitidos
export const hasRoles = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!roles.includes(req.userRole as UserRole)) {
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