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
                // Aseguramos que el costo diario sea entero y el total tenga 2 decimales
                dailyCost: Math.round(rentalWithDates.dailyCost),
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
            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }

            const strategy = this.strategyFactory.getStrategy(rental.type);
            const { metadata = {}, ...rentalData } = req.body;

            // Si el metadata viene en la raíz del body, lo preparamos con la estrategia
            const preparedMetadata = metadata.dealerName ? metadata : strategy.prepareMetadata(req.body);

            const updatedData = {
                ...rentalData,
                metadata: preparedMetadata
            };

            console.log('Datos a actualizar:', {
                rentalData,
                metadata,
                preparedMetadata,
                updatedData
            });

            // Validar el alquiler actualizado
            const validation = strategy.validate({ ...rental, ...updatedData });
            if (!validation.isValid) {
                console.log('Error de validación:', validation);
                return res.status(validation.status || 400).json({
                    message: validation.message || validation.errors?.join(', ')
                });
            }

            // Calcular el nuevo total
            updatedData.total = rentalData.total || strategy.calculateTotal({ ...rental, ...updatedData });

            this.repository.merge(rental, updatedData);
            const result = await this.repository.save(rental);
            return res.json(result);
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