"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movementController = exports.MovementController = void 0;
const MovementRepository_1 = require("../repositories/MovementRepository");
class MovementController {
    async createMovement(req, res) {
        try {
            const movement = req.body;
            // Convertir campos opcionales vacíos a null
            const optionalFields = [
                'fromLocation',
                'toLocation',
                'expectedReturnDate',
                'actualReturnDate',
                'personResponsible',
                'notes'
            ];
            optionalFields.forEach((field) => {
                if (movement[field] === '' || movement[field] === undefined) {
                    movement[field] = null;
                }
            });
            // Convertir strings a números si es necesario
            if (typeof movement.inventoryId === 'string') {
                movement.inventoryId = parseInt(movement.inventoryId, 10);
            }
            if (typeof movement.quantity === 'string') {
                movement.quantity = parseInt(movement.quantity, 10);
            }
            // Convertir fechas a objetos Date si vienen como string
            if (typeof movement.expectedReturnDate === 'string' && movement.expectedReturnDate) {
                movement.expectedReturnDate = new Date(movement.expectedReturnDate);
            }
            if (typeof movement.actualReturnDate === 'string' && movement.actualReturnDate) {
                movement.actualReturnDate = new Date(movement.actualReturnDate);
            }
            const newMovement = await MovementRepository_1.movementRepository.createMovement(movement);
            res.status(201).json(newMovement);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear registro de movimiento', error: error.message });
        }
    }
    async getAllMovements(_req, res) {
        try {
            const movements = await MovementRepository_1.movementRepository.getAllMovements();
            res.status(200).json(movements);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registros de movimientos', error: error.message });
        }
    }
    async getMovement(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const movement = await MovementRepository_1.movementRepository.getMovementById(id);
            if (!movement) {
                res.status(404).json({ message: 'Registro de movimiento no encontrado' });
                return;
            }
            res.status(200).json(movement);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registro de movimiento', error: error.message });
        }
    }
    async getMovementsByInventoryId(req, res) {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            if (isNaN(inventoryId)) {
                res.status(400).json({ message: 'ID de inventario inválido' });
                return;
            }
            const movements = await MovementRepository_1.movementRepository.getMovementsByInventoryId(inventoryId);
            res.status(200).json(movements);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registros de movimientos para el inventario', error: error.message });
        }
    }
    async updateMovement(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const movement = req.body;
            // Convertir strings a números si es necesario
            if (typeof movement.inventoryId === 'string' && movement.inventoryId) {
                movement.inventoryId = parseInt(movement.inventoryId, 10);
            }
            if (typeof movement.quantity === 'string' && movement.quantity) {
                movement.quantity = parseInt(movement.quantity, 10);
            }
            // Convertir fechas a objetos Date si vienen como string
            if (typeof movement.expectedReturnDate === 'string' && movement.expectedReturnDate) {
                movement.expectedReturnDate = new Date(movement.expectedReturnDate);
            }
            if (typeof movement.actualReturnDate === 'string' && movement.actualReturnDate) {
                movement.actualReturnDate = new Date(movement.actualReturnDate);
            }
            const updatedMovement = await MovementRepository_1.movementRepository.updateMovement(id, movement);
            if (!updatedMovement) {
                res.status(404).json({ message: 'Registro de movimiento no encontrado' });
                return;
            }
            res.status(200).json(updatedMovement);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar registro de movimiento', error: error.message });
        }
    }
    async deleteMovement(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const deletedMovement = await MovementRepository_1.movementRepository.deleteMovement(id);
            if (!deletedMovement) {
                res.status(404).json({ message: 'Registro de movimiento no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Registro de movimiento eliminado', movement: deletedMovement });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar registro de movimiento', error: error.message });
        }
    }
}
exports.MovementController = MovementController;
exports.movementController = new MovementController();
