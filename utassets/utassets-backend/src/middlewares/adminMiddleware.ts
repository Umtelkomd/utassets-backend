import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../entity/User';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No se proporcionó token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { role: UserRole };
        if (decoded.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'No tiene permisos de administrador' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}; 