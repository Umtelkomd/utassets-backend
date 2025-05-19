import { Request, Response } from 'express';
import { getRentalRepository } from '../repositories/RentalRepository';
import { inventoryRepository } from '../repositories/InventoryRepository';
import { RentalType } from '../entity/Rental';

export class RentalController {
    // Validaciones comunes para todos los tipos de alquiler
    static validateCommonFields(rental: any): { isValid: boolean; message?: string; status?: number } {
        // Validar campos requeridos según el tipo
        let requiredFields: string[] = [];

        console.log('Rental', rental);

        switch (rental.type) {
            case RentalType.ITEM:
                requiredFields = ['itemId', 'startDate', 'endDate', 'dailyCost', 'total', 'type'];
                break;
            case RentalType.VEHICLE:
                requiredFields = ['vehicleId', 'startDate', 'endDate', 'dailyCost', 'total', 'type', 'dealerName', 'dealerAddress', 'dealerPhone'];
                break;
            case RentalType.HOUSING:
                requiredFields = ['housingId', 'startDate', 'endDate', 'dailyCost', 'total', 'type', 'guestCount', 'address', 'bedrooms', 'bathrooms'];
                break;
            default:
                return {
                    isValid: false,
                    message: `Tipo de alquiler no válido. Los tipos válidos son: ${Object.values(RentalType).join(', ')}`,
                    status: 400
                };
        }

        const missingFields = requiredFields.filter(field => !rental[field]);

        if (missingFields.length > 0) {
            return {
                isValid: false,
                message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
                status: 400
            };
        }

        // Validar fechas
        const startDate = new Date(rental.startDate);
        const endDate = new Date(rental.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return {
                isValid: false,
                message: 'Fechas inválidas',
                status: 400
            };
        }

        if (startDate >= endDate) {
            return {
                isValid: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin',
                status: 400
            };
        }

        // Validar que el costo diario y total sean números positivos
        if (isNaN(parseFloat(rental.dailyCost)) || parseFloat(rental.dailyCost) < 0) {
            return {
                isValid: false,
                message: 'El costo diario debe ser un número positivo',
                status: 400
            };
        }

        if (isNaN(parseFloat(rental.total)) || parseFloat(rental.total) < 0) {
            return {
                isValid: false,
                message: 'El total debe ser un número positivo',
                status: 400
            };
        }

        return { isValid: true };
    }

    // Validaciones específicas para cada tipo de alquiler
    private validateRentalByType(rental: any): { isValid: boolean; message?: string; status?: number } {
        switch (rental.type) {
            case RentalType.ITEM:
                // Validaciones para alquiler de artículos
                if (rental.peopleCount && (isNaN(parseInt(rental.peopleCount, 10)) || parseInt(rental.peopleCount, 10) < 1)) {
                    return {
                        isValid: false,
                        message: 'El número de personas debe ser un entero mayor o igual a 1',
                        status: 400
                    };
                }
                break;

            case RentalType.VEHICLE:
                // Validaciones para alquiler de vehículos
                const vehicleFields = ['dealerName', 'dealerAddress', 'dealerPhone'];
                const missingVehicleFields = vehicleFields.filter(field => !rental[field]);

                if (missingVehicleFields.length > 0) {
                    return {
                        isValid: false,
                        message: `Faltan campos requeridos para alquiler de vehículo: ${missingVehicleFields.join(', ')}`,
                        status: 400
                    };
                }
                break;

            case RentalType.HOUSING:
                // Validaciones para alquiler de viviendas
                const housingRequiredFields = ['guestCount', 'address', 'bedrooms', 'bathrooms'];
                const missingHousingFields = housingRequiredFields.filter(field => rental[field] === undefined || rental[field] === null);

                if (missingHousingFields.length > 0) {
                    return {
                        isValid: false,
                        message: `Faltan campos requeridos para alquiler de vivienda: ${missingHousingFields.join(', ')}`,
                        status: 400
                    };
                }

                if (isNaN(parseInt(rental.guestCount, 10)) || parseInt(rental.guestCount, 10) < 1) {
                    return {
                        isValid: false,
                        message: 'El número de huéspedes debe ser un entero mayor o igual a 1',
                        status: 400
                    };
                }

                if (isNaN(parseInt(rental.bedrooms, 10)) || parseInt(rental.bedrooms, 10) < 0) {
                    return {
                        isValid: false,
                        message: 'El número de habitaciones no puede ser negativo',
                        status: 400
                    };
                }

                if (isNaN(parseInt(rental.bathrooms, 10)) || parseInt(rental.bathrooms, 10) < 0) {
                    return {
                        isValid: false,
                        message: 'El número de baños no puede ser negativo',
                        status: 400
                    };
                }
                break;
        }

        return { isValid: true };
    }

    // Crear un nuevo alquiler
    async createRental(req: Request, res: Response): Promise<void> {
        try {
            const rentalRepository = await getRentalRepository();
            const rentalData = req.body;

            // Validaciones comunes
            const commonValidation = RentalController.validateCommonFields(rentalData);
            if (!commonValidation.isValid) {
                res.status(commonValidation.status || 400).json({ message: commonValidation.message });
                return;
            }

            // Mapear el ID específico a objectId según el tipo
            let objectId: number;
            switch (rentalData.type) {
                case RentalType.ITEM:
                    objectId = parseInt(rentalData.itemId);
                    break;
                case RentalType.VEHICLE:
                    objectId = parseInt(rentalData.vehicleId);
                    break;
                case RentalType.HOUSING:
                    objectId = parseInt(rentalData.housingId);
                    break;
                default:
                    res.status(400).json({ message: 'Tipo de alquiler no válido' });
                    return;
            }

            // Validar que el objeto exista
            const object = await inventoryRepository.getItemById(objectId);
            if (!object) {
                res.status(404).json({ message: 'Objeto no encontrado' });
                return;
            }

            // Preparar los datos del alquiler
            const rentalToCreate = {
                ...rentalData,
                objectId,
                startDate: new Date(rentalData.startDate),
                endDate: new Date(rentalData.endDate),
                dailyCost: parseFloat(rentalData.dailyCost),
                total: parseFloat(rentalData.total),
                // Convertir campos específicos según el tipo
                ...(rentalData.type === RentalType.ITEM && rentalData.peopleCount !== undefined && {
                    peopleCount: parseInt(rentalData.peopleCount, 10)
                }),
                ...(rentalData.type === RentalType.HOUSING && {
                    guestCount: parseInt(rentalData.guestCount, 10),
                    bedrooms: parseInt(rentalData.bedrooms, 10),
                    bathrooms: parseInt(rentalData.bathrooms, 10),
                    ...(rentalData.amenities && {
                        amenities: Array.isArray(rentalData.amenities)
                            ? rentalData.amenities
                            : rentalData.amenities.split(',').map((a: string) => a.trim())
                    })
                })
            };

            // Crear el alquiler
            const newRental = await rentalRepository.createRental(rentalToCreate);

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

    // Obtener todos los alquileres con filtro opcional por tipo
    async getAllRentals(req: Request, res: Response): Promise<void> {
        try {
            const rentalRepository = await getRentalRepository();
            const { type } = req.query;

            let rentals;

            if (type && Object.values(RentalType).includes(type as RentalType)) {
                // Filtrar por tipo si se proporciona un tipo válido
                rentals = await rentalRepository.getRentalsByType(type as RentalType);
            } else if (type) {
                // Si se proporciona un tipo pero no es válido, devolver error
                res.status(400).json({
                    message: `Tipo de alquiler no válido. Los tipos válidos son: ${Object.values(RentalType).join(', ')}`
                });
                return;
            } else {
                // Si no se proporciona tipo, devolver todos los alquileres
                rentals = await rentalRepository.getAllRentals();
            }

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
            const id = req.params.id;
            if (!id) {
                res.status(400).json({ message: 'ID de alquiler no proporcionado' });
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