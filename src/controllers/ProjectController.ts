import { Request, Response } from 'express';
import { projectRepository } from '../repositories/ProjectRepository';

export class ProjectController {
    async createProject(req: Request, res: Response): Promise<void> {
        try {
            const project = req.body;

            // Convertir campos opcionales vacíos a null
            const optionalFields = ['description', 'endDate'];
            optionalFields.forEach((field) => {
                if (project[field] === '' || project[field] === undefined) {
                    project[field] = null;
                }
            });

            // Verificar si el código de proyecto ya existe
            const existingProject = await projectRepository.getProjectByCode(project.projectCode);
            if (existingProject) {
                res.status(400).json({ message: 'Ya existe un proyecto con ese código' });
                return;
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof project.startDate === 'string') {
                project.startDate = new Date(project.startDate);
            }

            if (typeof project.endDate === 'string' && project.endDate) {
                project.endDate = new Date(project.endDate);
            }

            const newProject = await projectRepository.createProject(project);
            res.status(201).json(newProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el proyecto', error: (error as Error).message });
        }
    }

    async getAllProjects(_req: Request, res: Response): Promise<void> {
        try {
            const projects = await projectRepository.getAllProjects();
            res.status(200).json(projects);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los proyectos', error: (error as Error).message });
        }
    }

    async getProject(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const project = await projectRepository.getProjectById(id);
            if (!project) {
                res.status(404).json({ message: 'Proyecto no encontrado' });
                return;
            }

            res.status(200).json(project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el proyecto', error: (error as Error).message });
        }
    }

    async updateProject(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const project = req.body;

            // Si se actualiza el código, verificar si ya existe
            if (project.projectCode) {
                const existingProject = await projectRepository.getProjectByCode(project.projectCode);
                if (existingProject && existingProject.id !== id) {
                    res.status(400).json({ message: 'Ya existe un proyecto con ese código' });
                    return;
                }
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof project.startDate === 'string' && project.startDate) {
                project.startDate = new Date(project.startDate);
            }

            if (typeof project.endDate === 'string' && project.endDate) {
                project.endDate = new Date(project.endDate);
            }

            const updatedProject = await projectRepository.updateProject(id, project);
            if (!updatedProject) {
                res.status(404).json({ message: 'Proyecto no encontrado' });
                return;
            }

            res.status(200).json(updatedProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el proyecto', error: (error as Error).message });
        }
    }

    async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ message: 'ID inválido' });
                return;
            }

            const deletedProject = await projectRepository.deleteProject(id);
            if (!deletedProject) {
                res.status(404).json({ message: 'Proyecto no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Proyecto eliminado', project: deletedProject });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el proyecto', error: (error as Error).message });
        }
    }
}

export const projectController = new ProjectController(); 