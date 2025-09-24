"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadMultiple = exports.uploadSingle = exports.handleMulterError = void 0;
const multer_1 = __importDefault(require("multer"));
// Configurar multer para almacenar en memoria
const storage = multer_1.default.memoryStorage();
// Configurar límites y filtros
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (_req, file, cb) => {
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
exports.upload = upload;
// Middleware para manejar errores de multer
const handleMulterError = (err, _req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB' });
        }
        return res.status(400).json({ message: err.message });
    }
    else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
exports.handleMulterError = handleMulterError;
// Middleware para subir una sola imagen
const uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadSingle = uploadSingle;
// Middleware para subir múltiples imágenes
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
