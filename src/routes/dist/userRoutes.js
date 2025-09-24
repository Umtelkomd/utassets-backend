"use strict";
exports.__esModule = true;
var express_1 = require("express");
var userController_1 = require("../controllers/userController");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var router = express_1["default"].Router();
var userController = new userController_1.UserController();
// Configuración de multer para subir imágenes
var storage = multer_1["default"].diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = 'uploads/users';
        // Crear el directorio si no existe
        if (!fs_1["default"].existsSync(uploadDir)) {
            fs_1["default"].mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + path_1["default"].extname(file.originalname));
    }
});
var upload = multer_1["default"]({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: function (req, file, cb) {
        // Validar tipos de archivo
        var filetypes = /jpeg|jpg|png|webp/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path_1["default"].extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});
// Middleware para manejar errores de multer
var handleMulterError = function (err, req, res, next) {
    if (err instanceof multer_1["default"].MulterError) {
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
router.post('/register', upload.single('image'), handleMulterError, userController.createUser.bind(userController));
// Rutas protegidas
router.get('/', authMiddleware_1.authMiddleware, userController.getUsers.bind(userController));
router.get('/:id', authMiddleware_1.authMiddleware, userController.getUserById.bind(userController));
router.put('/:id', authMiddleware_1.authMiddleware, userController.updateUser.bind(userController));
router.put('/:id/image', authMiddleware_1.authMiddleware, upload.single('image'), handleMulterError, userController.updateUserImage.bind(userController));
router["delete"]('/:id/image', authMiddleware_1.authMiddleware, userController.deleteUserImage.bind(userController));
exports["default"] = router;
