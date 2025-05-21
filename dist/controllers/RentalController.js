"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalController = void 0;
const Rental_1 = require("../entity/Rental");
const RentalStrategyFactory_1 = require("../strategies/RentalStrategyFactory");
const RentalRepository_1 = require("../repositories/RentalRepository");
class RentalController {
    constructor() {
        this.strategyFactory = RentalStrategyFactory_1.RentalStrategyFactory.getInstance();
        this.initializeRepository();
    }
    async initializeRepository() {
        this.repository = await (0, RentalRepository_1.getRentalRepository)();
    }
    // Crear un nuevo alquiler
    async create(req, res) {
        try {
            const { type, metadata = {}, ...rentalData } = req.body;
            const rentalType = type;
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
            const rental = new Rental_1.Rental();
            Object.assign(rental, {
                type: rentalType,
                ...rentalWithDates,
                metadata: strategy.prepareMetadata({ ...rentalWithDates, ...metadata })
            });
            // Validar el alquiler
            const validation = strategy.validate(rental);
            if (!validation.isValid) {
                return res.status(validation.status || 400).json({
                    message: validation.message
                });
            }
            // Calcular el total
            rental.total = strategy.calculateTotal(rental);
            // Guardar el alquiler
            const result = await this.repository.save(rental);
            return res.status(201).json(result);
        }
        catch (error) {
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
    async getAll(req, res) {
        try {
            const rentals = await this.repository.find();
            return res.json(rentals);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener los alquileres', error });
        }
    }
    // Obtener un alquiler por ID
    async getById(req, res) {
        try {
            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }
            return res.json(rental);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener el alquiler', error });
        }
    }
    // Actualizar un alquiler
    async update(req, res) {
        try {
            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }
            const strategy = this.strategyFactory.getStrategy(rental.type);
            const updatedData = {
                ...req.body,
                metadata: strategy.prepareMetadata(req.body)
            };
            // Validar el alquiler actualizado
            const validation = strategy.validate({ ...rental, ...updatedData });
            if (!validation.isValid) {
                return res.status(validation.status || 400).json({
                    message: validation.message
                });
            }
            // Calcular el nuevo total
            updatedData.total = strategy.calculateTotal({ ...rental, ...updatedData });
            this.repository.merge(rental, updatedData);
            const result = await this.repository.save(rental);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error al actualizar el alquiler', error });
        }
    }
    // Eliminar un alquiler
    async delete(req, res) {
        try {
            const rental = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!rental) {
                return res.status(404).json({ message: 'Alquiler no encontrado' });
            }
            await this.repository.remove(rental);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al eliminar el alquiler', error });
        }
    }
    // Obtener campos requeridos para un tipo de alquiler
    async getRequiredFields(req, res) {
        try {
            const { type } = req.params;
            const strategy = this.strategyFactory.getStrategy(type);
            return res.json({
                requiredFields: strategy.getRequiredFields(),
                specificFields: strategy.getSpecificFields()
            });
        }
        catch (error) {
            return res.status(400).json({ message: 'Error al obtener los campos requeridos', error });
        }
    }
}
exports.RentalController = RentalController;
