import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Inventory } from '../entity/Inventory';
import { User } from '../entity/User';

interface InventoryCreateDTO {
    itemName: string;
    itemCode: string;
    category: string;
    quantity: number;
    condition: string;
    location: string;
    acquisitionDate?: Date | null;
    lastMaintenanceDate?: Date | null;
    nextMaintenanceDate?: Date | null;
    notes?: string | null;
    imagePath?: string | null;
    responsibleUsers?: User[];
}

export class InventoryRepository extends Repository<Inventory> {
    constructor() {
        super(Inventory, AppDataSource.createEntityManager());
    }

    async createItem(item: InventoryCreateDTO): Promise<Inventory> {
        const newItem = this.create({
            itemName: item.itemName,
            itemCode: item.itemCode,
            category: item.category,
            quantity: item.quantity,
            condition: item.condition,
            location: item.location,
            acquisitionDate: item.acquisitionDate || null,
            lastMaintenanceDate: item.lastMaintenanceDate || null,
            nextMaintenanceDate: item.nextMaintenanceDate || null,
            notes: item.notes || null,
            imagePath: item.imagePath || null,
            responsibleUsers: item.responsibleUsers || []
        });

        return await this.save(newItem);
    }

    async getAllItems(): Promise<Inventory[]> {
        return await this.find({
            relations: {
                responsibleUsers: true
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getItemById(id: number): Promise<Inventory | null> {
        return await this.findOne({
            where: { id },
            relations: {
                responsibleUsers: true
            }
        });
    }

    async updateItem(id: number, item: Partial<InventoryCreateDTO>): Promise<Inventory | null> {
        const existingItem = await this.findOne({
            where: { id },
            relations: {
                responsibleUsers: true
            }
        });

        if (!existingItem) {
            return null;
        }

        if (item.responsibleUsers !== undefined) {
            // Cargar los usuarios completos desde la base de datos
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.findByIds(item.responsibleUsers.map(u => u.id));
            existingItem.responsibleUsers = users;
        }

        Object.assign(existingItem, item);
        return await this.save(existingItem);
    }

    async deleteItem(id: number): Promise<Inventory | null> {
        const itemToRemove = await this.findOne({
            where: { id },
            relations: ['responsibleUsers']
        });

        if (!itemToRemove) {
            return null;
        }

        return await this.remove(itemToRemove);
    }
}

export const inventoryRepository = new InventoryRepository(); 