import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, User } from '../entity/User';

const JWT_SECRET = process.env.JWT_SECRET || 'utassets_secret_key_2024_secure_token';

// Extender la interfaz Request de Express
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            userRole?: UserRole;
            user?: User;
        }
    }
}

// Middleware para verificar que el usuario esté autenticado
export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Si no hay token en el header, intentar obtenerlo de las cookies
    if (!token) {
        token = req.cookies?.authToken;
    }

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
            id: number;
            email: string;
            role: UserRole;
            username?: string;
        };

        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
            username: decoded.username || decoded.email.split('@')[0]
        } as User;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

// Middleware para verificar que el usuario tenga rol de administrador
export const isAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador' });
    }
    next();
};

// Middleware para verificar si el usuario tiene alguno de los roles permitidos
export const hasRoles = (roles: UserRole[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({
                message: 'Acceso denegado. No tienes los permisos necesarios.'
            });
        }
        next();
    };
}; 