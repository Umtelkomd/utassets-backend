import { Request, Response } from 'express';
import { categoryRepository } from '../repositories/CategoryRepository';

export class CategoryController {
    async createCategory(req: Request, res: Response): Promise<void> {
        try {
            const { name, description } = req.body;

            // Verificar si la categoría ya existe
            const existingCategory = await categoryRepository.getCategoryByName(name);
            if (existingCategory) {
                res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
                return;
            }

            const newCategory = await categoryRepository.createCategory({
                name,
                description: description || null
            });

            res.status(201).json(newCategory);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la categoría', error: (error as Error).message });
        }
    }

    async getAllCategories(_req: Request, res: Response): Promise<void> {
        try {
            const categories = await categoryRepository.getAllCategories();
            res.status(200).json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las categorías', error: (error as Error).message });
        }
    }

    async getCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const category = await categoryRepository.getCategoryById(id);
            if (!category) {
                res.status(404).json({ message: 'Categoría no encontrada' });
                return;
            }

            res.status(200).json(category);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la categoría', error: (error as Error).message });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const { name, description } = req.body;

            // Si se actualiza el nombre, verificar si ya existe
            if (name) {
                const existingCategory = await categoryRepository.getCategoryByName(name);
                if (existingCategory && existingCategory.id !== id) {
                    res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
                    return;
                }
            }

            const updatedCategory = await categoryRepository.updateCategory(id, {
                name,
                description
            });

            if (!updatedCategory) {
                res.status(404).json({ message: 'Categoría no encontrada' });
                return;
            }

            res.status(200).json(updatedCategory);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la categoría', error: (error as Error).message });
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const deletedCategory = await categoryRepository.deleteCategory(id);
            if (!deletedCategory) {
                res.status(404).json({ message: 'Categoría no encontrada' });
                return;
            }

            res.status(200).json({ message: 'Categoría eliminada', category: deletedCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la categoría', error: (error as Error).message });
        }
    }
}

export const categoryController = new CategoryController(); 