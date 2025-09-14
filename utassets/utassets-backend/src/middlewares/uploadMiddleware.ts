import { RequestHandler, Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configurar multer para almacenar en memoria
const storage = multer.memoryStorage();

// Configurar límites y filtros
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Validar tipos de archivo
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});

// Middleware para manejar errores de multer
export const handleMulterError = (
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
): void | Response => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB' });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Middleware para subir una sola imagen
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware para subir múltiples imágenes
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount);

export { upload }; 