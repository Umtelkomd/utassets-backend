import { Request, Response } from 'express';
import { movementRepository } from '../repositories/MovementRepository';

export class MovementController {
    async createMovement(req: Request, res: Response): Promise<void> {
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

            const newMovement = await movementRepository.createMovement(movement);
            res.status(201).json(newMovement);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear registro de movimiento', error: (error as Error).message });
        }
    }

    async getAllMovements(_req: Request, res: Response): Promise<void> {
        try {
            const movements = await movementRepository.getAllMovements();
            res.status(200).json(movements);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registros de movimientos', error: (error as Error).message });
        }
    }

    async getMovement(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const movement = await movementRepository.getMovementById(id);
            if (!movement) {
                res.status(404).json({ message: 'Registro de movimiento no encontrado' });
                return;
            }

            res.status(200).json(movement);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registro de movimiento', error: (error as Error).message });
        }
    }

    async getMovementsByInventoryId(req: Request, res: Response): Promise<void> {
        try {
            const inventoryId = parseInt(req.params.inventoryId, 10);
            if (isNaN(inventoryId)) {
                res.status(400).json({ message: 'ID de inventario inválido' });
                return;
            }

            const movements = await movementRepository.getMovementsByInventoryId(inventoryId);
            res.status(200).json(movements);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener registros de movimientos para el inventario', error: (error as Error).message });
        }
    }

    async updateMovement(req: Request, res: Response): Promise<void> {
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

            const updatedMovement = await movementRepository.updateMovement(id, movement);
            if (!updatedMovement) {
                res.status(404).json({ message: 'Registro de movimiento no encontrado' });
                return;
            }

            res.status(200).json(updatedMovement);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar registro de movimiento', error: (error as Error).message });
        }
    }

    async deleteMovement(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const deletedMovement = await movementRepository.deleteMovement(id);
            if (!deletedMovement) {
                res.status(404).json({ message: 'Registro de movimiento no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Registro de movimiento eliminado', movement: deletedMovement });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar registro de movimiento', error: (error as Error).message });
        }
    }
}

export const movementController = new MovementController();