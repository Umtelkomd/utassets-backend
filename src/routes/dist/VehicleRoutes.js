"use strict";
exports.__esModule = true;
var express_1 = require("express");
var VehicleController_1 = require("../controllers/VehicleController");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var router = express_1.Router();
// Configurar multer para la subida de imágenes
var storage = multer_1["default"].diskStorage({
    destination: function (_req, _file, cb) {
        var uploadDir = 'uploads/vehicles';
        // Crear el directorio si no existe
        if (!fs_1["default"].existsSync(uploadDir)) {
            fs_1["default"].mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        // Generar un nombre único para el archivo
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'vehicle-' + uniqueSuffix + path_1["default"].extname(file.originalname));
    }
});
var upload = multer_1["default"]({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: function (_req, file, cb) {
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
// Rutas para vehículos
router.post('/', authMiddleware_1.authMiddleware, upload.single('image'), VehicleController_1.vehicleController.createVehicle);
router.get('/', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.getAllVehicles);
router.get('/:id', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.getVehicle);
router.put('/:id', authMiddleware_1.authMiddleware, upload.single('image'), VehicleController_1.vehicleController.updateVehicle);
router["delete"]('/:id', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.deleteVehicle);
// Rutas específicas para imágenes
router.put('/:id/image', authMiddleware_1.authMiddleware, upload.single('image'), VehicleController_1.vehicleController.updateVehicleImage);
router["delete"]('/:id/image', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.deleteVehicleImage);
// Rutas para gestionar responsables
router.post('/:id/responsibles', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.addResponsibleUser);
router["delete"]('/:id/responsibles', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.removeResponsibleUser);
router.get('/:id/responsibles', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.getResponsibleUsers);
exports["default"] = router;
