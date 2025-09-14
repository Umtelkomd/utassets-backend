import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Category } from '../entity/Category';

interface CategoryCreateDTO {
    name: string;
    description?: string | null;
}

interface CategoryUpdateDTO extends Partial<CategoryCreateDTO> { }

export class CategoryRepository extends Repository<Category> {
    constructor() {
        super(Category, AppDataSource.createEntityManager());
    }

    async createCategory(category: CategoryCreateDTO): Promise<Category> {
        const newCategory = this.create({
            name: category.name,
            description: category.description || null
        });

        return await this.save(newCategory);
    }

    async getAllCategories(): Promise<Category[]> {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }

    async getCategoryById(id: number): Promise<Category | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async getCategoryByName(name: string): Promise<Category | null> {
        return await this.findOne({
            where: { name }
        });
    }

    async updateCategory(id: number, category: CategoryUpdateDTO): Promise<Category | null> {
        const existingCategory = await this.findOne({
            where: { id }
        });

        if (!existingCategory) {
            return null;
        }

        // Actualizar propiedades si existen en el DTO
        if (category.name !== undefined) existingCategory.name = category.name;
        if (category.description !== undefined) existingCategory.description = category.description;

        return await this.save(existingCategory);
    }

    async deleteCategory(id: number): Promise<Category | null> {
        const categoryToRemove = await this.findOne({
            where: { id }
        });

        if (!categoryToRemove) {
            return null;
        }

        return await this.remove(categoryToRemove);
    }
}

export const categoryRepository = new CategoryRepository(); 