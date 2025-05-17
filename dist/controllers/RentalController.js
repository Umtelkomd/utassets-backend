"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentalController = exports.RentalController = void 0;
const RentalRepository_1 = require("../repositories/RentalRepository");
const InventoryRepository_1 = require("../repositories/InventoryRepository");
class RentalController {
    // Verificar disponibilidad de un objeto en un rango de fechas
    async checkAvailability(req, res) {
        try {
            const { objectId, startDate, endDate } = req.query;
            // Validar parámetros
            if (!objectId || !startDate || !endDate) {
                res.status(400).json({
                    message: 'Se requieren objectId, startDate y endDate',
                    available: false
                });
                return;
            }
            const objId = parseInt(objectId, 10);
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Validar que las fechas sean válidas
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({
                    message: 'Fechas inválidas',
                    available: false
                });
                return;
            }
            // Validar que la fecha de inicio sea anterior a la fecha de fin
            if (start >= end) {
                res.status(400).json({
                    message: 'La fecha de inicio debe ser anterior a la fecha de fin',
                    available: false
                });
                return;
            }
            // Validar que el objeto exista
            const object = await InventoryRepository_1.inventoryRepository.getItemById(objId);
            if (!object) {
                res.status(404).json({
                    message: 'Objeto no encontrado',
                    available: false
                });
                return;
            }
            // Verificar disponibilidad
            const isAvailable = await RentalRepository_1.rentalRepository.checkAvailability(objId, start, end);
            res.status(200).json({
                available: isAvailable,
                object: {
                    id: object.id,
                    itemName: object.itemName,
                    itemCode: object.itemCode
                },
                startDate: start,
                endDate: end
            });
        }
        catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            res.status(500).json({
                message: 'Error al verificar disponibilidad',
                error: error instanceof Error ? error.message : 'Error desconocido',
                available: false
            });
        }
    }
    // Crear un nuevo alquiler
    async createRental(req, res) {
        try {
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
            const object = await InventoryRepository_1.inventoryRepository.getItemById(rental.objectId);
            if (!object) {
                res.status(404).json({ message: 'Objeto no encontrado' });
                return;
            }
            // Verificar disponibilidad
            const isAvailable = await RentalRepository_1.rentalRepository.checkAvailability(rental.objectId, startDate, endDate);
            if (!isAvailable) {
                res.status(409).json({
                    message: 'El objeto no está disponible en el rango de fechas solicitado'
                });
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
            const newRental = await RentalRepository_1.rentalRepository.createRental({
                objectId: rental.objectId,
                startDate,
                endDate,
                dailyCost: parseFloat(rental.dailyCost),
                peopleCount: rental.peopleCount ? parseInt(rental.peopleCount, 10) : null,
                total: parseFloat(rental.total)
            });
            // Obtener el alquiler con el objeto relacionado
            const rentalWithObject = await RentalRepository_1.rentalRepository.getRentalById(newRental.id);
            res.status(201).json(rentalWithObject);
        }
        catch (error) {
            console.error('Error al crear el alquiler:', error);
            res.status(500).json({
                message: 'Error al crear el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Obtener todos los alquileres
    async getAllRentals(req, res) {
        try {
            const rentals = await RentalRepository_1.rentalRepository.getAllRentals();
            res.status(200).json(rentals);
        }
        catch (error) {
            console.error('Error al obtener los alquileres:', error);
            res.status(500).json({
                message: 'Error al obtener los alquileres',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Obtener un alquiler por ID
    async getRental(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de alquiler inválido' });
                return;
            }
            const rental = await RentalRepository_1.rentalRepository.getRentalById(id);
            if (!rental) {
                res.status(404).json({ message: 'Alquiler no encontrado' });
                return;
            }
            res.status(200).json(rental);
        }
        catch (error) {
            console.error('Error al obtener el alquiler:', error);
            res.status(500).json({
                message: 'Error al obtener el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Actualizar un alquiler
    async updateRental(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de alquiler inválido' });
                return;
            }
            const rental = req.body;
            // Obtener el alquiler existente
            const existingRental = await RentalRepository_1.rentalRepository.getRentalById(id);
            if (!existingRental) {
                res.status(404).json({ message: 'Alquiler no encontrado' });
                return;
            }
            // Si se cambiaron fechas u objeto, verificar disponibilidad
            if ((rental.startDate && rental.startDate !== existingRental.startDate.toISOString().split('T')[0]) ||
                (rental.endDate && rental.endDate !== existingRental.endDate.toISOString().split('T')[0]) ||
                (rental.objectId && rental.objectId !== existingRental.objectId)) {
                const startDate = rental.startDate ? new Date(rental.startDate) : existingRental.startDate;
                const endDate = rental.endDate ? new Date(rental.endDate) : existingRental.endDate;
                const objectId = rental.objectId || existingRental.objectId;
                if (startDate >= endDate) {
                    res.status(400).json({ message: 'La fecha de inicio debe ser anterior a la fecha de fin' });
                    return;
                }
                // Verificar que el objeto exista si se cambia
                if (rental.objectId && rental.objectId !== existingRental.objectId) {
                    const object = await InventoryRepository_1.inventoryRepository.getItemById(rental.objectId);
                    if (!object) {
                        res.status(404).json({ message: 'Objeto no encontrado' });
                        return;
                    }
                }
                // Verificar disponibilidad excluyendo el alquiler actual
                const isAvailable = await RentalRepository_1.rentalRepository.checkAvailability(objectId, startDate, endDate, id);
                if (!isAvailable) {
                    res.status(409).json({
                        message: 'El objeto no está disponible en el rango de fechas solicitado'
                    });
                    return;
                }
            }
            // Actualizar el alquiler
            const updatedRental = await RentalRepository_1.rentalRepository.updateRental(id, rental);
            res.status(200).json(updatedRental);
        }
        catch (error) {
            console.error('Error al actualizar el alquiler:', error);
            res.status(500).json({
                message: 'Error al actualizar el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Eliminar un alquiler
    async deleteRental(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID de alquiler inválido' });
                return;
            }
            const rental = await RentalRepository_1.rentalRepository.getRentalById(id);
            if (!rental) {
                res.status(404).json({ message: 'Alquiler no encontrado' });
                return;
            }
            await RentalRepository_1.rentalRepository.deleteRental(id);
            res.status(200).json({
                message: 'Alquiler eliminado correctamente',
                id
            });
        }
        catch (error) {
            console.error('Error al eliminar el alquiler:', error);
            res.status(500).json({
                message: 'Error al eliminar el alquiler',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Obtener alquileres por objeto
    async getRentalsByObject(req, res) {
        try {
            const objectId = parseInt(req.params.objectId, 10);
            if (isNaN(objectId)) {
                res.status(400).json({ message: 'ID de objeto inválido' });
                return;
            }
            // Verificar que el objeto exista
            const object = await InventoryRepository_1.inventoryRepository.getItemById(objectId);
            if (!object) {
                res.status(404).json({ message: 'Objeto no encontrado' });
                return;
            }
            const rentals = await RentalRepository_1.rentalRepository.getRentalsByObject(objectId);
            res.status(200).json(rentals);
        }
        catch (error) {
            console.error('Error al obtener los alquileres del objeto:', error);
            res.status(500).json({
                message: 'Error al obtener los alquileres del objeto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
    // Obtener alquileres por rango de fechas
    async getRentalsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({ message: 'Se requieren startDate y endDate' });
                return;
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({ message: 'Fechas inválidas' });
                return;
            }
            if (start > end) {
                res.status(400).json({ message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' });
                return;
            }
            const rentals = await RentalRepository_1.rentalRepository.getRentalsByDateRange(start, end);
            res.status(200).json(rentals);
        }
        catch (error) {
            console.error('Error al obtener los alquileres por rango de fechas:', error);
            res.status(500).json({
                message: 'Error al obtener los alquileres por rango de fechas',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}
exports.RentalController = RentalController;
exports.rentalController = new RentalController();
