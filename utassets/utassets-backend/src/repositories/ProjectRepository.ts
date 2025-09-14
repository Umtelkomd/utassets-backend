import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Project } from '../entity/Project';

interface ProjectCreateDTO {
    name: string;
    description?: string | null;
    location: string;
    startDate: Date;
    endDate?: Date | null;
    status: string;
}

interface ProjectUpdateDTO extends Partial<ProjectCreateDTO> { }

export class ProjectRepository extends Repository<Project> {
    constructor() {
        super(Project, AppDataSource.createEntityManager());
    }

    async createProject(project: ProjectCreateDTO): Promise<Project> {
        const newProject = this.create({
            name: project.name,
            description: project.description || null,
            location: project.location,
            startDate: project.startDate,
            endDate: project.endDate || null,
            status: project.status
        });

        return await this.save(newProject);
    }

    async getAllProjects(): Promise<Project[]> {
        return await this.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async getProjectById(id: number): Promise<Project | null> {
        return await this.findOne({
            where: { id }
        });
    }

    async updateProject(id: number, project: ProjectUpdateDTO): Promise<Project | null> {
        const existingProject = await this.findOne({
            where: { id }
        });

        if (!existingProject) {
            return null;
        }

        // Actualizar propiedades si existen en el DTO
        if (project.name !== undefined) existingProject.name = project.name;
        if (project.description !== undefined) existingProject.description = project.description;
        if (project.location !== undefined) existingProject.location = project.location;
        if (project.startDate !== undefined) existingProject.startDate = project.startDate;
        if (project.endDate !== undefined) existingProject.endDate = project.endDate;
        if (project.status !== undefined) existingProject.status = project.status;

        return await this.save(existingProject);
    }

    async deleteProject(id: number): Promise<Project | null> {
        const projectToRemove = await this.findOne({
            where: { id }
        });

        if (!projectToRemove) {
            return null;
        }

        return await this.remove(projectToRemove);
    }
}

export const projectRepository = new ProjectRepository(); 