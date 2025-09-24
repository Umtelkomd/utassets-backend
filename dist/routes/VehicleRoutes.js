"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VehicleController_1 = require("../controllers/VehicleController");
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Configurar multer para almacenar en memoria
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
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
// Rutas para vehículos
router.post('/', authMiddleware_1.authMiddleware, upload.single('image'), VehicleController_1.vehicleController.createVehicle);
router.get('/', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.getAllVehicles);
router.get('/:id', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.getVehicle);
router.put('/:id', authMiddleware_1.authMiddleware, upload.single('image'), VehicleController_1.vehicleController.updateVehicle);
router.delete('/:id', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.deleteVehicle);
// Rutas específicas para imágenes
router.put('/:id/image', authMiddleware_1.authMiddleware, upload.single('image'), VehicleController_1.vehicleController.updateVehicleImage);
router.delete('/:id/image', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.deleteVehicleImage);
// Rutas para gestionar responsables
router.post('/:id/responsibles', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.addResponsibleUser);
router.delete('/:id/responsibles', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.removeResponsibleUser);
router.get('/:id/responsibles', authMiddleware_1.authMiddleware, VehicleController_1.vehicleController.getResponsibleUsers);
exports.default = router;
