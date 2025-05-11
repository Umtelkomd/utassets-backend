"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRepository = exports.InventoryRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Inventory_1 = require("../entity/Inventory");
const User_1 = require("../entity/User");
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
            imagePath: item.imagePath || null,
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
            relations: {
                responsibleUsers: true
            }
        });
        if (!existingItem) {
            return null;
        }
        if (item.responsibleUsers !== undefined) {
            // Cargar los usuarios completos desde la base de datos
            const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
            const users = await userRepository.findByIds(item.responsibleUsers.map(u => u.id));
            existingItem.responsibleUsers = users;
        }
        Object.assign(existingItem, item);
        return await this.save(existingItem);
    }
    async deleteItem(id) {
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
exports.InventoryRepository = InventoryRepository;
exports.inventoryRepository = new InventoryRepository();
