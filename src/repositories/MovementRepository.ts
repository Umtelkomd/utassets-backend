import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Movement } from '../entity/Movement';

interface MovementCreateDTO {
    inventoryId: number;
    movementType: string;
    fromLocation?: string | null;
    toLocation?: string | null;
    quantity: number;
    expectedReturnDate?: Date | null;
    actualReturnDate?: Date | null;
    personResponsible?: string | null;
    notes?: string | null;
}

interface MovementUpdateDTO extends Partial<MovementCreateDTO> { }

export class MovementRepository extends Repository<Movement> {
    constructor() {
        super(Movement, AppDataSource.createEntityManager());
    }

    async createMovement(movement: MovementCreateDTO): Promise<Movement> {
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

    async getAllMovements(): Promise<Movement[]> {
        return await this.find({
            order: {
                movementDate: 'DESC'
            },
            relations: ['inventory']
        });
    }

    async getMovementById(id: number): Promise<Movement | null> {
        return await this.findOne({
            where: { id },
            relations: ['inventory']
        });
    }

    async getMovementsByInventoryId(inventoryId: number): Promise<Movement[]> {
        return await this.find({
            where: { inventoryId },
            order: {
                movementDate: 'DESC'
            },
            relations: ['inventory']
        });
    }

    async updateMovement(id: number, movement: MovementUpdateDTO): Promise<Movement | null> {
        const existingMovement = await this.findOne({
            where: { id }
        });

        if (!existingMovement) {
            return null;
        }

        // Actualizar propiedades si existen en el DTO
        if (movement.inventoryId !== undefined) existingMovement.inventoryId = movement.inventoryId;
        if (movement.movementType !== undefined) existingMovement.movementType = movement.movementType;
        if (movement.fromLocation !== undefined) existingMovement.fromLocation = movement.fromLocation;
        if (movement.toLocation !== undefined) existingMovement.toLocation = movement.toLocation;
        if (movement.quantity !== undefined) existingMovement.quantity = movement.quantity;
        if (movement.expectedReturnDate !== undefined) existingMovement.expectedReturnDate = movement.expectedReturnDate;
        if (movement.actualReturnDate !== undefined) existingMovement.actualReturnDate = movement.actualReturnDate;
        if (movement.personResponsible !== undefined) existingMovement.personResponsible = movement.personResponsible;
        if (movement.notes !== undefined) existingMovement.notes = movement.notes;

        return await this.save(existingMovement);
    }

    async deleteMovement(id: number): Promise<Movement | null> {
        const movementToRemove = await this.findOne({
            where: { id }
        });

        if (!movementToRemove) {
            return null;
        }

        return await this.remove(movementToRemove);
    }
}

export const movementRepository = new MovementRepository(); 