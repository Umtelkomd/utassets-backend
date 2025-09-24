"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRepository = exports.CategoryRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Category_1 = require("../entity/Category");
class CategoryRepository extends typeorm_1.Repository {
    constructor() {
        super(Category_1.Category, data_source_1.AppDataSource.createEntityManager());
    }
    async createCategory(category) {
        const newCategory = this.create({
            name: category.name,
            description: category.description || null
        });
        return await this.save(newCategory);
    }
    async getAllCategories() {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }
    async getCategoryById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async getCategoryByName(name) {
        return await this.findOne({
            where: { name }
        });
    }
    async updateCategory(id, category) {
        const existingCategory = await this.findOne({
            where: { id }
        });
        if (!existingCategory) {
            return null;
        }
        // Actualizar propiedades si existen en el DTO
        if (category.name !== undefined)
            existingCategory.name = category.name;
        if (category.description !== undefined)
            existingCategory.description = category.description;
        return await this.save(existingCategory);
    }
    async deleteCategory(id) {
        const categoryToRemove = await this.findOne({
            where: { id }
        });
        if (!categoryToRemove) {
            return null;
        }
        return await this.remove(categoryToRemove);
    }
}
exports.CategoryRepository = CategoryRepository;
exports.categoryRepository = new CategoryRepository();
