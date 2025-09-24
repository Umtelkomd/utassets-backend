"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movementRepository = exports.MovementRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Movement_1 = require("../entity/Movement");
class MovementRepository extends typeorm_1.Repository {
    constructor() {
        super(Movement_1.Movement, data_source_1.AppDataSource.createEntityManager());
    }
    async createMovement(movement) {
        const newMovement = this.create({
            inventoryId: movement.inventoryId,
            movementType: movement.movementType,
            fromLocation: movement.fromLocation || null,
            toLocation: movement.toLocation || null,
            quantity: movement.quantity,
            expectedReturnDate: movement.expectedReturnDate || null,
            actualReturnDate: movement.actualReturnDate || null,
            personResponsible: movement.personResponsible || null,
            notes: movement.notes || null
        });
        return await this.save(newMovement);
    }
    async getAllMovements() {
        return await this.find({
            order: {
                movementDate: 'DESC'
            },
            relations: ['inventory']
        });
    }
    async getMovementById(id) {
        return await this.findOne({
            where: { id },
            relations: ['inventory']
        });
    }
    async getMovementsByInventoryId(inventoryId) {
        return await this.find({
            where: { inventoryId },
            order: {
                movementDate: 'DESC'
            },
            relations: ['inventory']
        });
    }
    async updateMovement(id, movement) {
        const existingMovement = await this.findOne({
            where: { id }
        });
        if (!existingMovement) {
            return null;
        }
        // Actualizar propiedades si existen en el DTO
        if (movement.inventoryId !== undefined)
            existingMovement.inventoryId = movement.inventoryId;
        if (movement.movementType !== undefined)
            existingMovement.movementType = movement.movementType;
        if (movement.fromLocation !== undefined)
            existingMovement.fromLocation = movement.fromLocation;
        if (movement.toLocation !== undefined)
            existingMovement.toLocation = movement.toLocation;
        if (movement.quantity !== undefined)
            existingMovement.quantity = movement.quantity;
        if (movement.expectedReturnDate !== undefined)
            existingMovement.expectedReturnDate = movement.expectedReturnDate;
        if (movement.actualReturnDate !== undefined)
            existingMovement.actualReturnDate = movement.actualReturnDate;
        if (movement.personResponsible !== undefined)
            existingMovement.personResponsible = movement.personResponsible;
        if (movement.notes !== undefined)
            existingMovement.notes = movement.notes;
        return await this.save(existingMovement);
    }
    async deleteMovement(id) {
        const movementToRemove = await this.findOne({
            where: { id }
        });
        if (!movementToRemove) {
            return null;
        }
        return await this.remove(movementToRemove);
    }
}
exports.MovementRepository = MovementRepository;
exports.movementRepository = new MovementRepository();
