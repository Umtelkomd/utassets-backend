"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRepository = exports.InventoryRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Inventory_1 = require("../entity/Inventory");
const User_1 = require("../entity/User");
const entityUtils_1 = require("../utils/entityUtils");
class InventoryRepository extends typeorm_1.Repository {
    constructor() {
        super(Inventory_1.Inventory, data_source_1.AppDataSource.createEntityManager());
    }
    async createItem(item) {
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
    async getAllItems() {
        return await this.find({
            relations: {
                responsibleUsers: true
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async getItemById(id) {
        return await this.findOne({
            where: { id },
            relations: {
                responsibleUsers: true
            }
        });
    }
    async updateItem(id, item) {
        const existingItem = await this.findOne({
            where: { id },
            relations: { responsibleUsers: true }
        });
        if (!existingItem) {
            throw new Error('Item no encontrado');
        }
        const { responsibleUsers, ...itemFields } = item;
        (0, entityUtils_1.applyPartialUpdate)(existingItem, itemFields, ['responsibleUsers']);
        if (responsibleUsers !== undefined) {
            try {
                const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
                let usersToAssign = [];
                if (Array.isArray(responsibleUsers)) {
                    const userIds = responsibleUsers.map(user => typeof user === 'object' ? user.id : user);
                    usersToAssign = await userRepository.findByIds(userIds);
                }
                else if (typeof responsibleUsers === 'string') {
                    const parsedUsers = JSON.parse(responsibleUsers);
                    if (Array.isArray(parsedUsers)) {
                        const userIds = parsedUsers.map(user => user.id);
                        usersToAssign = await userRepository.findByIds(userIds);
                    }
                }
                existingItem.responsibleUsers = usersToAssign;
            }
            catch (error) {
                console.error('Error al procesar responsibleUsers:', error);
            }
        }
        return await this.save(existingItem);
    }
    async deleteItem(id) {
        const itemToRemove = await this.findOne({
            where: { id }
        });
        if (!itemToRemove) {
            return null;
        }
        return await this.remove(itemToRemove);
    }
}
exports.InventoryRepository = InventoryRepository;
exports.inventoryRepository = new InventoryRepository();
