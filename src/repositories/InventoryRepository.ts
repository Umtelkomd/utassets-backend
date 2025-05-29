import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Inventory } from '../entity/Inventory';
import { User } from '../entity/User';
import { EntityRepository } from 'typeorm';
import { applyPartialUpdate } from '../utils/entityUtils';

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
    photoUrl?: string | null;
    photoPublicId?: string | null;
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
            photoUrl: item.photoUrl || null,
            photoPublicId: item.photoPublicId || null,
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
            relations: { responsibleUsers: true }
        });

        if (!existingItem) {
            throw new Error('Item no encontrado');
        }

        const { responsibleUsers, ...itemFields } = item;

        applyPartialUpdate(existingItem, itemFields, ['responsibleUsers']);

        if (responsibleUsers !== undefined) {
            try {
                const userRepository = AppDataSource.getRepository(User);
                let usersToAssign: User[] = [];

                if (Array.isArray(responsibleUsers)) {
                    const userIds = responsibleUsers.map(user =>
                        typeof user === 'object' ? user.id : user
                    );
                    usersToAssign = await userRepository.findByIds(userIds);
                } else if (typeof responsibleUsers === 'string') {
                    const parsedUsers = JSON.parse(responsibleUsers);
                    if (Array.isArray(parsedUsers)) {
                        const userIds = parsedUsers.map(user => user.id);
                        usersToAssign = await userRepository.findByIds(userIds);
                    }
                }

                existingItem.responsibleUsers = usersToAssign;
            } catch (error) {
                console.error('Error al procesar responsibleUsers:', error);
            }
        }

        return await this.save(existingItem);
    }

    async deleteItem(id: number): Promise<Inventory | null> {
        const itemToRemove = await this.findOne({
            where: { id }
        });

        if (!itemToRemove) {
            return null;
        }

        return await this.remove(itemToRemove);
    }
}

export const inventoryRepository = new InventoryRepository(); 