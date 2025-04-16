"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = exports.CategoryController = void 0;
const CategoryRepository_1 = require("../repositories/CategoryRepository");
class CategoryController {
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            // Verificar si la categoría ya existe
            const existingCategory = await CategoryRepository_1.categoryRepository.getCategoryByName(name);
            if (existingCategory) {
                res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
                return;
            }
            const newCategory = await CategoryRepository_1.categoryRepository.createCategory({
                name,
                description: description || null
            });
            res.status(201).json(newCategory);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
        }
    }
    async getAllCategories(_req, res) {
        try {
            const categories = await CategoryRepository_1.categoryRepository.getAllCategories();
            res.status(200).json(categories);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
        }
    }
    async getCategory(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const category = await CategoryRepository_1.categoryRepository.getCategoryById(id);
            if (!category) {
                res.status(404).json({ message: 'Categoría no encontrada' });
                return;
            }
            res.status(200).json(category);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la categoría', error: error.message });
        }
    }
    async updateCategory(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const { name, description } = req.body;
            // Si se actualiza el nombre, verificar si ya existe
            if (name) {
                const existingCategory = await CategoryRepository_1.categoryRepository.getCategoryByName(name);
                if (existingCategory && existingCategory.id !== id) {
                    res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
                    return;
                }
            }
            const updatedCategory = await CategoryRepository_1.categoryRepository.updateCategory(id, {
                name,
                description
            });
            if (!updatedCategory) {
                res.status(404).json({ message: 'Categoría no encontrada' });
                return;
            }
            res.status(200).json(updatedCategory);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la categoría', error: error.message });
        }
    }
    async deleteCategory(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }
            const deletedCategory = await CategoryRepository_1.categoryRepository.deleteCategory(id);
            if (!deletedCategory) {
                res.status(404).json({ message: 'Categoría no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Categoría eliminada', category: deletedCategory });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la categoría', error: error.message });
        }
    }
}
exports.CategoryController = CategoryController;
exports.categoryController = new CategoryController();
