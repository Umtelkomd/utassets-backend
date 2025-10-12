import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberMaterial } from '../entity/FiberMaterial';

interface FiberMaterialCreateDTO {
    name: string;
    unit: string;
    cost: number;
}

interface FiberMaterialUpdateDTO extends Partial<FiberMaterialCreateDTO> { }

export class FiberMaterialRepository extends Repository<FiberMaterial> {
    constructor() {
        super(FiberMaterial, AppDataSource.createEntityManager());
    }

    async createMaterial(material: FiberMaterialCreateDTO): Promise<FiberMaterial> {
        const newMaterial = this.create(material);
        return await this.save(newMaterial);
    }

    async getAllMaterials(): Promise<FiberMaterial[]> {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }

    async getMaterialById(id: string): Promise<FiberMaterial | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async updateMaterial(id: string, material: FiberMaterialUpdateDTO): Promise<FiberMaterial | null> {
        const existingMaterial = await this.findOne({
            where: { id }
        });

        if (!existingMaterial) {
            return null;
        }

        if (material.name !== undefined) existingMaterial.name = material.name;
        if (material.unit !== undefined) existingMaterial.unit = material.unit;
        if (material.cost !== undefined) existingMaterial.cost = material.cost;

        return await this.save(existingMaterial);
    }

    async deleteMaterial(id: string): Promise<FiberMaterial | null> {
        const materialToRemove = await this.findOne({
            where: { id }
        });

        if (!materialToRemove) {
            return null;
        }

        return await this.remove(materialToRemove);
    }
}

export const fiberMaterialRepository = new FiberMaterialRepository();
