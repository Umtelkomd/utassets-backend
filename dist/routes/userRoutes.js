"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const userController = new userController_1.UserController();
// Configuración de multer para subir imágenes
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/users';
        // Crear el directorio si no existe
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const uploadMulter = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: (req, file, cb) => {
        // Validar tipos de archivo
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});
// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
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
// Rutas públicas
router.post('/register', uploadMulter.single('image'), handleMulterError, userController.createUser.bind(userController));
// Rutas protegidas
router.get('/', authMiddleware_1.authMiddleware, userController.getUsers.bind(userController));
router.get('/:id', authMiddleware_1.authMiddleware, userController.getUserById.bind(userController));
router.put('/:id', authMiddleware_1.authMiddleware, userController.updateUser.bind(userController));
router.put('/:id/image', authMiddleware_1.authMiddleware, uploadMulter.single('image'), handleMulterError, userController.updateUserImage.bind(userController));
router.delete('/:id/image', authMiddleware_1.authMiddleware, userController.deleteUserImage.bind(userController));
exports.default = router;
