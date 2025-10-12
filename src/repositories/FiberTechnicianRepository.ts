import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FiberTechnician } from '../entity/FiberTechnician';

interface FiberTechnicianCreateDTO {
    name: string;
    costPerHour: number;
}

interface FiberTechnicianUpdateDTO extends Partial<FiberTechnicianCreateDTO> { }

export class FiberTechnicianRepository extends Repository<FiberTechnician> {
    constructor() {
        super(FiberTechnician, AppDataSource.createEntityManager());
    }

    async createTechnician(technician: FiberTechnicianCreateDTO): Promise<FiberTechnician> {
        const newTechnician = this.create(technician);
        return await this.save(newTechnician);
    }

    async getAllTechnicians(): Promise<FiberTechnician[]> {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }

    async getTechnicianById(id: string): Promise<FiberTechnician | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async updateTechnician(id: string, technician: FiberTechnicianUpdateDTO): Promise<FiberTechnician | null> {
        const existingTechnician = await this.findOne({
            where: { id }
        });

        if (!existingTechnician) {
            return null;
        }

        if (technician.name !== undefined) existingTechnician.name = technician.name;
        if (technician.costPerHour !== undefined) existingTechnician.costPerHour = technician.costPerHour;

        return await this.save(existingTechnician);
    }

    async deleteTechnician(id: string): Promise<FiberTechnician | null> {
        const technicianToRemove = await this.findOne({
            where: { id }
        });

        if (!technicianToRemove) {
            return null;
        }

        return await this.remove(technicianToRemove);
    }
}

export const fiberTechnicianRepository = new FiberTechnicianRepository();
