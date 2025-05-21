import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Housing } from '../entity/Housing';

export class HousingRepository extends Repository<Housing> {
    constructor() {
        super(Housing, AppDataSource.createEntityManager());
    }

    async findAvailable(): Promise<Housing[]> {
        return this.find({
            where: { isAvailable: true },
            order: { createdAt: 'DESC' }
        });
    }

    async findByBedrooms(bedrooms: number): Promise<Housing[]> {
        return this.find({
            where: {
                bedrooms,
                isAvailable: true
            }
        });
    }

    async searchByAddress(address: string): Promise<Housing[]> {
        return this.createQueryBuilder('housing')
            .where('LOWER(housing.address) LIKE LOWER(:address)', { address: `%${address}%` })
            .andWhere('housing.isAvailable = :isAvailable', { isAvailable: true })
            .getMany();
    }
} 