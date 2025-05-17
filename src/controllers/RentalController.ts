import { Request, Response } from 'express';
import { getRentalRepository } from '../repositories/RentalRepository';
import { inventoryRepository } from '../repositories/InventoryRepository';

export class RentalController {
    // Crear un nuevo alquiler
    async createRental(req: Request, res: Response): Promise<void> {
        try {
            const rentalRepository = await getRentalRepository();
            const rental = req.body;

            // Validar campos requeridos
            const requiredFields = ['objectId', 'startDate', 'endDate', 'dailyCost', 'total'];
            const missingFields = requiredFields.filter(field => !rental[field]);

            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    fields: missingFields
                });
                return;
            }

            // Parsear fechas y validar
            const startDate = new Date(rental.startDate);
            const endDate = new Date(rental.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(400).json({ message: 'Fechas inválidas' });
                return;
            }

            if (startDate >= endDate) {
                res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
                return;
            }

            // Validar que el objeto exista
            const object = await inventoryRepository.getItemById(rental.objectId);
            if (!object) {
                res.status(404).json({ message: 'Objeto no encontrado' });
                return;
            }

            // Calcular total si no se proporciona o validar
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Mínimo 1 día
            const calculatedTotal = parseFloat(rental.dailyCost) * diffDays;

            if (!rental.total || Math.abs(calculatedTotal - parseFloat(rental.total)) > 0.01) {
                rental.total = calculatedTotal;
            }

            // Crear el alquiler
            const newRental = await rentalRepository.createRental({
                objectId: rental.objectId,
                startDate,
                endDate,
                dailyCost: parseFloat(rental.dailyCost),
                peopleCount: rental.peopleCount ? parseInt(rental.peopleCount, 10) : null,
                total: parseFloat(rental.total)
            });

            // Obtener el alquiler con el objeto relacionado
            const rentalWithObject = await rentalRepository.getRentalById(newRental.id);

            res.status(201).json(rentalWithObject);
        } catch (error) {
            console.error('Error al crear el alquiler:', error);
            res.status(500).json({
                message: 'Error al crear el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener todos los alquileres
    async getAllRentals(req: Request, res: Response): Promise<void> {
        try {
            const rentalRepository = await getRentalRepository();
            const rentals = await rentalRepository.getAllRentals();
            res.status(200).json(rentals);
        } catch (error) {
            console.error('Error al obtener los alquileres:', error);
            res.status(500).json({
                message: 'Error al obtener los alquileres',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener un alquiler por ID
    async getRental(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de alquiler inválido' });
                return;
            }

            const rentalRepository = await getRentalRepository();
            const rental = await rentalRepository.getRentalById(id);
            if (!rental) {
                res.status(404).json({ message: 'Alquiler no encontrado' });
                return;
            }

            res.status(200).json(rental);
        } catch (error) {
            console.error('Error al obtener el alquiler:', error);
            res.status(500).json({
                message: 'Error al obtener el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar un alquiler
    async updateRental(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de alquiler inválido' });
                return;
            }

            const rental = req.body;

            const rentalRepository = await getRentalRepository();
            // Obtener el alquiler existente
            const existingRental = await rentalRepository.getRentalById(id);
            if (!existingRental) {
                res.status(404).json({ message: 'Alquiler no encontrado' });
                return;
            }

            // Validar fechas si se proporcionan
            if (rental.startDate || rental.endDate) {
                const startDate = rental.startDate ? new Date(rental.startDate) : existingRental.startDate;
                const endDate = rental.endDate ? new Date(rental.endDate) : existingRental.endDate;

                if (startDate >= endDate) {
                    res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
                    return;
                }
            }

            // Verificar que el objeto exista si se cambia
            if (rental.objectId && rental.objectId !== existingRental.objectId) {
                const object = await inventoryRepository.getItemById(rental.objectId);
                if (!object) {
                    res.status(404).json({ message: 'Objeto no encontrado' });
                    return;
                }
            }

            // Actualizar el alquiler
            const updatedRental = await rentalRepository.updateRental(id, rental);
            res.status(200).json(updatedRental);
        } catch (error) {
            console.error('Error al actualizar el alquiler:', error);
            res.status(500).json({
                message: 'Error al actualizar el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un alquiler
    async deleteRental(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de alquiler inválido' });
                return;
            }

            const rentalRepository = await getRentalRepository();
            const rental = await rentalRepository.getRentalById(id);
            if (!rental) {
                res.status(404).json({ message: 'Alquiler no encontrado' });
                return;
            }

            await rentalRepository.deleteRental(id);
            res.status(200).json({
                message: 'Alquiler eliminado correctamente',
                id
            });
        } catch (error) {
            console.error('Error al eliminar el alquiler:', error);
            res.status(500).json({
                message: 'Error al eliminar el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener alquileres por objeto
    async getRentalsByObject(req: Request, res: Response): Promise<void> {
        try {
            const objectId = parseInt(req.params.objectId, 10);
            if (isNaN(objectId)) {
                res.status(400).json({ message: 'ID de objeto inválido' });
                return;
            }

            // Verificar que el objeto exista
            const object = await inventoryRepository.getItemById(objectId);
            if (!object) {
                res.status(404).json({ message: 'Objeto no encontrado' });
                return;
            }

            const rentalRepository = await getRentalRepository();
            const rentals = await rentalRepository.getRentalsByObject(objectId);
            res.status(200).json(rentals);
        } catch (error) {
            console.error('Error al obtener los alquileres del objeto:', error);
            res.status(500).json({
                message: 'Error al obtener los alquileres del objeto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener alquileres por rango de fechas
    async getRentalsByDateRange(req: Request, res: Response): Promise<void> {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                res.status(400).json({ message: 'Se requieren startDate y endDate' });
                return;
            }

            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({ message: 'Fechas inválidas' });
                return;
            }

            if (start > end) {
                res.status(400).json({ message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' });
                return;
            }

            const rentalRepository = await getRentalRepository();
            const rentals = await rentalRepository.getRentalsByDateRange(start, end);
            res.status(200).json(rentals);
        } catch (error) {
            console.error('Error al obtener los alquileres por rango de fechas:', error);
            res.status(500).json({
                message: 'Error al obtener los alquileres por rango de fechas',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}

export const rentalController = new RentalController(); 