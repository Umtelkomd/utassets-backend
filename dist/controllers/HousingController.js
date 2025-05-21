"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HousingController = void 0;
const HousingRepository_1 = require("../repositories/HousingRepository");
class HousingController {
    constructor() {
        this.repository = new HousingRepository_1.HousingRepository();
    }
    // Obtener todas las viviendas
    async getAll(req, res) {
        try {
            const housings = await this.repository.find();
            return res.json(housings);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener las viviendas', error });
        }
    }
    // Obtener viviendas disponibles
    async getAvailable(req, res) {
        try {
            const housings = await this.repository.findAvailable();
            return res.json(housings);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener las viviendas disponibles', error });
        }
    }
    // Obtener una vivienda por ID
    async getById(req, res) {
        try {
            const housing = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            return res.json(housing);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al obtener la vivienda', error });
        }
    }
    // Crear una nueva vivienda
    async create(req, res) {
        try {
            const housing = this.repository.create(req.body);
            const result = await this.repository.save(housing);
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error al crear la vivienda', error });
        }
    }
    // Actualizar una vivienda
    async update(req, res) {
        try {
            const housing = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            this.repository.merge(housing, req.body);
            const result = await this.repository.save(housing);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error al actualizar la vivienda', error });
        }
    }
    // Eliminar una vivienda
    async delete(req, res) {
        try {
            const housing = await this.repository.findOne({ where: { id: Number(req.params.id) } });
            if (!housing) {
                return res.status(404).json({ message: 'Vivienda no encontrada' });
            }
            await this.repository.remove(housing);
            return res.status(204).send();
        }
        catch (error) {
            return res.status(500).json({ message: 'Error al eliminar la vivienda', error });
        }
    }
    // Buscar por número de habitaciones
    async searchByBedrooms(req, res) {
        try {
            const { bedrooms } = req.query;
            const housings = await this.repository.findByBedrooms(Number(bedrooms));
            return res.json(housings);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error en la búsqueda por habitaciones', error });
        }
    }
    // Buscar por dirección
    async searchByAddress(req, res) {
        try {
            const { address } = req.query;
            const housings = await this.repository.searchByAddress(String(address));
            return res.json(housings);
        }
        catch (error) {
            return res.status(400).json({ message: 'Error en la búsqueda por dirección', error });
        }
    }
}
exports.HousingController = HousingController;
