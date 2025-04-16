"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleAssignmentController = exports.VehicleAssignmentController = void 0;
const VehicleAssignmentRepository_1 = require("../repositories/VehicleAssignmentRepository");
const VehicleRepository_1 = require("../repositories/VehicleRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const VehicleAssignment_1 = require("../entity/VehicleAssignment");
class VehicleAssignmentController {
    async getAllAssignments(req, res) {
        try {
            const assignments = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAllAssignments();
            res.status(200).json(assignments);
        }
        catch (error) {
            console.error('Error al obtener las asignaciones:', error);
            res.status(500).json({
                message: 'Error al obtener las asignaciones',
                error: error.message
            });
        }
    }
    async getAssignmentById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const assignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAssignmentById(id);
            if (!assignment) {
                res.status(404).json({ message: 'Asignación no encontrada' });
                return;
            }
            res.status(200).json(assignment);
        }
        catch (error) {
            console.error('Error al obtener la asignación:', error);
            res.status(500).json({
                message: 'Error al obtener la asignación',
                error: error.message
            });
        }
    }
    async getAssignmentsByVehicle(req, res) {
        try {
            const vehicleId = parseInt(req.params.vehicleId, 10);
            if (isNaN(vehicleId)) {
                res.status(400).json({ message: 'ID de vehículo inválido' });
                return;
            }
            // Verificar que el vehículo existe
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            const assignments = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAssignmentsByVehicle(vehicleId);
            res.status(200).json(assignments);
        }
        catch (error) {
            console.error('Error al obtener las asignaciones del vehículo:', error);
            res.status(500).json({
                message: 'Error al obtener las asignaciones del vehículo',
                error: error.message
            });
        }
    }
    async getAssignmentsByUser(req, res) {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (isNaN(userId)) {
                res.status(400).json({ message: 'ID de usuario inválido' });
                return;
            }
            // Verificar que el usuario existe
            const user = await UserRepository_1.userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            const assignments = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAssignmentsByUser(userId);
            res.status(200).json(assignments);
        }
        catch (error) {
            console.error('Error al obtener las asignaciones del usuario:', error);
            res.status(500).json({
                message: 'Error al obtener las asignaciones del usuario',
                error: error.message
            });
        }
    }
    async createAssignment(req, res) {
        try {
            const { vehicleId, userId, assignmentType, assignmentStatus, startDate, endDate, notes } = req.body;
            // Validar datos obligatorios
            if (!vehicleId || !userId || !assignmentType || !startDate) {
                res.status(400).json({
                    message: 'Datos incompletos. Se requiere vehicleId, userId, assignmentType y startDate.'
                });
                return;
            }
            // Verificar que el vehículo existe
            const vehicle = await VehicleRepository_1.vehicleRepository.getVehicleById(vehicleId);
            if (!vehicle) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }
            // Verificar que el usuario existe
            const user = await UserRepository_1.userRepository.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }
            // Si es tipo RESPONSABLE, verificar si ya existe uno activo
            if (assignmentType === VehicleAssignment_1.AssignmentType.RESPONSABLE) {
                const activeResponsible = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getActiveResponsibleForVehicle(vehicleId);
                if (activeResponsible) {
                    res.status(400).json({
                        message: 'Ya existe un responsable activo para este vehículo. Finalice la asignación actual antes de crear una nueva.'
                    });
                    return;
                }
            }
            // Crear la asignación
            const newAssignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.createAssignment({
                vehicleId,
                userId,
                assignmentType,
                assignmentStatus: assignmentStatus || VehicleAssignment_1.AssignmentStatus.ACTIVA,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                notes
            });
            res.status(201).json({
                message: 'Asignación creada exitosamente',
                assignment: newAssignment
            });
        }
        catch (error) {
            console.error('Error al crear la asignación:', error);
            res.status(500).json({
                message: 'Error al crear la asignación',
                error: error.message
            });
        }
    }
    async updateAssignment(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const assignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAssignmentById(id);
            if (!assignment) {
                res.status(404).json({ message: 'Asignación no encontrada' });
                return;
            }
            const { assignmentType, assignmentStatus, startDate, endDate, notes } = req.body;
            // Actualizar la asignación
            const updatedAssignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.updateAssignment(id, {
                assignmentType,
                assignmentStatus,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                notes
            });
            res.status(200).json({
                message: 'Asignación actualizada exitosamente',
                assignment: updatedAssignment
            });
        }
        catch (error) {
            console.error('Error al actualizar la asignación:', error);
            res.status(500).json({
                message: 'Error al actualizar la asignación',
                error: error.message
            });
        }
    }
    async deleteAssignment(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const assignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAssignmentById(id);
            if (!assignment) {
                res.status(404).json({ message: 'Asignación no encontrada' });
                return;
            }
            await VehicleAssignmentRepository_1.vehicleAssignmentRepository.deleteAssignment(id);
            res.status(200).json({
                message: 'Asignación eliminada exitosamente',
                assignment
            });
        }
        catch (error) {
            console.error('Error al eliminar la asignación:', error);
            res.status(500).json({
                message: 'Error al eliminar la asignación',
                error: error.message
            });
        }
    }
    async endAssignment(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const assignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.getAssignmentById(id);
            if (!assignment) {
                res.status(404).json({ message: 'Asignación no encontrada' });
                return;
            }
            if (assignment.assignmentStatus !== VehicleAssignment_1.AssignmentStatus.ACTIVA) {
                res.status(400).json({ message: 'Solo se pueden finalizar asignaciones activas' });
                return;
            }
            const { endDate, notes } = req.body;
            if (!endDate) {
                res.status(400).json({ message: 'Se requiere la fecha de finalización' });
                return;
            }
            const updatedAssignment = await VehicleAssignmentRepository_1.vehicleAssignmentRepository.endAssignment(id, new Date(endDate), notes);
            res.status(200).json({
                message: 'Asignación finalizada exitosamente',
                assignment: updatedAssignment
            });
        }
        catch (error) {
            console.error('Error al finalizar la asignación:', error);
            res.status(500).json({
                message: 'Error al finalizar la asignación',
                error: error.message
            });
        }
    }
}
exports.VehicleAssignmentController = VehicleAssignmentController;
exports.vehicleAssignmentController = new VehicleAssignmentController();
