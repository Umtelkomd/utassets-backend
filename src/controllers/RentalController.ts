import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Rental, RentalType } from '../entity/Rental';
import { RentalStrategyFactory } from '../strategies/RentalStrategyFactory';
import { getRentalRepository } from '../repositories/RentalRepository';

export class RentalController {
    private repository!: Repository<Rental>;
    private strategyFactory: RentalStrategyFactory;

    constructor() {
        this.strategyFactory = RentalStrategyFactory.getInstance();
        this.initializeRepository();
    }

    private async initializeRepository() {
        this.repository = await getRentalRepository();
    }

    // Crear un nuevo alquiler
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { type, metadata = {}, ...rentalData } = req.body;
            const rentalType = type as RentalType;

            // Convertir fechas de string a Date
            const rentalWithDates = {
                ...rentalData,
                startDate: new Date(rentalData.startDate),
                endDate: new Date(rentalData.endDate)
            };

            // Calcular días si no vienen del frontend
            if (!rentalWithDates.days) {
                const startDate = new Date(rentalWithDates.startDate);
                const endDate = new Date(rentalWithDates.endDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                const diffTime = endDate.getTime() - startDate.getTime();
                rentalWithDates.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }

            // Obtener la estrategia correspondiente
            const strategy = this.strategyFactory.getStrategy(rentalType);

            // Validar campos requeridos
            const requiredFields = strategy.getRequiredFields();
            const missingFields = requiredFields.filter(field => {
                // Buscar el campo tanto en la raíz como en metadata
                return !rentalWithDates[field] && !metadata[field];
            });

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
                    requiredFields: strategy.getRequiredFields(),
                    specificFields: strategy.getSpecificFields()
                });
            }

            // Crear el alquiler
            const rental = new Rental();
            Object.assign(rental, {
                type: rentalType,
                ...rentalWithDates,
                // Mantener precisión en el costo diario y total con 2 decimales
                dailyCost: Math.round(rentalWithDates.dailyCost * 100) / 100,
                total: Math.round(rentalWithDates.total * 100) / 100,
                metadata: strategy.prepareMetadata({ ...rentalWithDates, ...metadata })
            });

            // Validar el alquiler
            const validation = strategy.validate(rental);
            if (!validation.isValid) {
                return res.status(validation.status || 400).json({
                    message: validation.message
                });
            }

            // Ya no recalculamos el total aquí, usamos el que viene del frontend
            // rental.total = rentalData.total || strategy.calculateTotal(rental);

            // Guardar el alquiler
            const result = await this.repository.save(rental);
            return res.status(201).json(result);
        } catch (error) {
            console.error('Error detallado al crear el alquiler:', error);
            return res.status(400).json({
                message: 'Error al crear el alquiler',
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                } : error
            });
        }
    }

    // Obtener todos los alquileres
    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const rentals = await this.repository.find();
            return res.json(rentals);
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener los alquileres', error });
        }
    }

    // Obtener un alquiler por ID
    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }
            return res.json(rental);
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener el alquiler', error });
        }
    }

    // Actualizar un alquiler
    async update(req: Request, res: Response): Promise<Response> {
        try {
            console.log('=== UPDATE RENTAL DEBUG ===');
            console.log('Request body:', req.body);
            console.log('Rental ID from params:', req.params.id);

            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }

            console.log('Current rental before update:', {
                id: rental.id,
                type: rental.type,
                inventoryId: rental.inventoryId,
                vehicleId: rental.vehicleId,
                housingId: rental.housingId
            });

            const strategy = this.strategyFactory.getStrategy(rental.type);
            const { metadata = {}, ...rentalData } = req.body;

            console.log('Extracted rentalData:', rentalData);
            console.log('Extracted metadata:', metadata);

            // Convertir fechas de string a Date si vienen como string
            const processedRentalData = { ...rentalData };
            if (rentalData.startDate && typeof rentalData.startDate === 'string') {
                processedRentalData.startDate = new Date(rentalData.startDate);
            }
            if (rentalData.endDate && typeof rentalData.endDate === 'string') {
                processedRentalData.endDate = new Date(rentalData.endDate);
            }

            // Calcular días si no vienen del frontend y se han actualizado las fechas
            if (processedRentalData.startDate && processedRentalData.endDate && !processedRentalData.days) {
                const startDate = new Date(processedRentalData.startDate);
                const endDate = new Date(processedRentalData.endDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                const diffTime = endDate.getTime() - startDate.getTime();
                processedRentalData.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }

            // Aplicar las mismas transformaciones numéricas que en create
            const updatedData = {
                ...processedRentalData,
                metadata: strategy.prepareMetadata({ ...processedRentalData, ...metadata })
            };

            // Procesar campos numéricos si están presentes
            if (updatedData.dailyCost !== undefined) {
                updatedData.dailyCost = Math.round(updatedData.dailyCost * 100) / 100;
            }
            if (updatedData.total !== undefined) {
                updatedData.total = Math.round(updatedData.total * 100) / 100;
            }
            if (updatedData.inventoryId !== undefined) {
                updatedData.inventoryId = parseInt(updatedData.inventoryId, 10);
            }
            if (updatedData.vehicleId !== undefined) {
                updatedData.vehicleId = parseInt(updatedData.vehicleId, 10);
            }
            if (updatedData.housingId !== undefined) {
                updatedData.housingId = parseInt(updatedData.housingId, 10);
            }

            console.log('Final updatedData:', updatedData);

            // Debug específico para inventoryId
            if (updatedData.inventoryId !== undefined) {
                console.log('InventoryId update analysis:', {
                    oldValue: rental.inventoryId,
                    newValue: updatedData.inventoryId,
                    oldType: typeof rental.inventoryId,
                    newType: typeof updatedData.inventoryId,
                    willUpdate: rental.inventoryId !== updatedData.inventoryId,
                    strictEqual: rental.inventoryId === updatedData.inventoryId
                });
            }

            // Validar el alquiler actualizado
            const validation = strategy.validate({ ...rental, ...updatedData });
            if (!validation.isValid) {
                console.log('Validation failed:', validation);
                return res.status(validation.status || 400).json({
                    message: validation.message || validation.errors?.join(', ')
                });
            }

            console.log('Before merge - rental:', {
                id: rental.id,
                inventoryId: rental.inventoryId
            });

            // Usar update directo en lugar de merge + save para evitar problemas con relaciones
            const updateResult = await this.repository.update(rental.id, updatedData);

            console.log('Update result:', updateResult);

            // Obtener el rental actualizado desde la base de datos
            const updatedRental = await this.repository.findOne({ where: { id: rental.id } });

            console.log('After update - fresh from DB:', {
                id: updatedRental?.id,
                inventoryId: updatedRental?.inventoryId
            });
            console.log('=== END UPDATE DEBUG ===');

            return res.json(updatedRental);
        } catch (error) {
            console.error('Error al actualizar el alquiler:', error);
            return res.status(400).json({
                message: 'Error al actualizar el alquiler',
                error: error instanceof Error ? error.message : error
            });
        }
    }

    // Eliminar un alquiler
    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }

            await this.repository.remove(rental);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Error al eliminar el alquiler', error });
        }
    }

    // Obtener campos requeridos para un tipo de alquiler
    async getRequiredFields(req: Request, res: Response): Promise<Response> {
        try {
            const { type } = req.params;
            const strategy = this.strategyFactory.getStrategy(type as RentalType);
            return res.json({
                requiredFields: strategy.getRequiredFields(),
                specificFields: strategy.getSpecificFields()
            });
        } catch (error) {
            return res.status(400).json({ message: 'Error al obtener los campos requeridos', error });
        }
    }
} 