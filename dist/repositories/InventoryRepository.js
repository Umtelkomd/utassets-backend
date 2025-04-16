"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRepository = exports.InventoryRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Inventory_1 = require("../entity/Inventory");
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
            responsiblePerson: item.responsiblePerson || null,
            notes: item.notes || null,
            imagePath: item.imagePath || null
        });
        return await this.save(newItem);
    }
    async getAllItems() {
        return await this.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async getItemById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateItem(id, item) {
        const existingItem = await this.findOne({
            where: { id }
        });
        if (!existingItem) {
            return null;
        }
        // Actualizar propiedades si existen en el DTO
        if (item.itemName !== undefined)
            existingItem.itemName = item.itemName;
        if (item.itemCode !== undefined)
            existingItem.itemCode = item.itemCode;
        if (item.category !== undefined)
            existingItem.category = item.category;
        if (item.quantity !== undefined)
            existingItem.quantity = item.quantity;
        if (item.condition !== undefined)
            existingItem.condition = item.condition;
        if (item.location !== undefined)
            existingItem.location = item.location;
        if (item.acquisitionDate !== undefined)
            existingItem.acquisitionDate = item.acquisitionDate;
        if (item.lastMaintenanceDate !== undefined)
            existingItem.lastMaintenanceDate = item.lastMaintenanceDate;
        if (item.nextMaintenanceDate !== undefined)
            existingItem.nextMaintenanceDate = item.nextMaintenanceDate;
        if (item.responsiblePerson !== undefined)
            existingItem.responsiblePerson = item.responsiblePerson;
        if (item.notes !== undefined)
            existingItem.notes = item.notes;
        if (item.imagePath !== undefined)
            existingItem.imagePath = item.imagePath;
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
