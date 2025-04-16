"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VehicleAssignmentController_1 = require("../controllers/VehicleAssignmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Rutas protegidas que requieren autenticación
router.get('/', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.getAllAssignments.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.get('/:id', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.getAssignmentById.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.get('/vehicle/:vehicleId', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.getAssignmentsByVehicle.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.get('/user/:userId', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.getAssignmentsByUser.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.post('/', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.createAssignment.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.put('/:id', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.updateAssignment.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.delete('/:id', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.deleteAssignment.bind(VehicleAssignmentController_1.vehicleAssignmentController));
router.post('/:id/end', authMiddleware_1.authMiddleware, VehicleAssignmentController_1.vehicleAssignmentController.endAssignment.bind(VehicleAssignmentController_1.vehicleAssignmentController));
exports.default = router;
