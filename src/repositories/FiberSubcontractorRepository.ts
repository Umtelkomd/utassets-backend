import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberSubcontractor } from '../entity/FiberSubcontractor';

interface FiberSubcontractorCreateDTO {
    name: string;
    contact?: string;
}

interface FiberSubcontractorUpdateDTO extends Partial<FiberSubcontractorCreateDTO> { }

export class FiberSubcontractorRepository extends Repository<FiberSubcontractor> {
    constructor() {
        super(FiberSubcontractor, AppDataSource.createEntityManager());
    }

    async createSubcontractor(subcontractor: FiberSubcontractorCreateDTO): Promise<FiberSubcontractor> {
        const newSubcontractor = this.create(subcontractor);
        return await this.save(newSubcontractor);
    }

    async getAllSubcontractors(): Promise<FiberSubcontractor[]> {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }

    async getSubcontractorById(id: string): Promise<FiberSubcontractor | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async updateSubcontractor(id: string, subcontractor: FiberSubcontractorUpdateDTO): Promise<FiberSubcontractor | null> {
        const existingSubcontractor = await this.findOne({
            where: { id }
        });

        if (!existingSubcontractor) {
            return null;
        }

        if (subcontractor.name !== undefined) existingSubcontractor.name = subcontractor.name;
        if (subcontractor.contact !== undefined) existingSubcontractor.contact = subcontractor.contact;

        return await this.save(existingSubcontractor);
    }

    async deleteSubcontractor(id: string): Promise<FiberSubcontractor | null> {
        const subcontractorToRemove = await this.findOne({
            where: { id }
        });

        if (!subcontractorToRemove) {
            return null;
        }

        return await this.remove(subcontractorToRemove);
    }
}

export const fiberSubcontractorRepository = new FiberSubcontractorRepository();
