import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberEquipment } from '../entity/FiberEquipment';

interface FiberEquipmentCreateDTO {
    name: string;
    costPerHour: number;
}

interface FiberEquipmentUpdateDTO extends Partial<FiberEquipmentCreateDTO> { }

export class FiberEquipmentRepository extends Repository<FiberEquipment> {
    constructor() {
        super(FiberEquipment, AppDataSource.createEntityManager());
    }

    async createEquipment(equipment: FiberEquipmentCreateDTO): Promise<FiberEquipment> {
        const newEquipment = this.create(equipment);
        return await this.save(newEquipment);
    }

    async getAllEquipment(): Promise<FiberEquipment[]> {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }

    async getEquipmentById(id: string): Promise<FiberEquipment | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async updateEquipment(id: string, equipment: FiberEquipmentUpdateDTO): Promise<FiberEquipment | null> {
        const existingEquipment = await this.findOne({
            where: { id }
        });

        if (!existingEquipment) {
            return null;
        }

        if (equipment.name !== undefined) existingEquipment.name = equipment.name;
        if (equipment.costPerHour !== undefined) existingEquipment.costPerHour = equipment.costPerHour;

        return await this.save(existingEquipment);
    }

    async deleteEquipment(id: string): Promise<FiberEquipment | null> {
        const equipmentToRemove = await this.findOne({
            where: { id }
        });

        if (!equipmentToRemove) {
            return null;
        }

        return await this.remove(equipmentToRemove);
    }
}

export const fiberEquipmentRepository = new FiberEquipmentRepository();
