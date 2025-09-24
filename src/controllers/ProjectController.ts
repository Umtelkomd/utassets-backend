import { Request, Response } from 'express';
import { projectRepository } from '../repositories/ProjectRepository';

export class ProjectController {
    async createProject(req: Request, res: Response): Promise<void> {
        try {
            const project = req.body;

            // Validar campos requeridos
            const requiredFields = ['name', 'location', 'startDate', 'status'];
            const missingFields = requiredFields.filter(field => !project[field]);

            if (missingFields.length > 0) {
                res.status(400).json({
                    message: 'Faltan campos requeridos',
                    missingFields
                });
                return;
            }

            // Convertir campos opcionales vacíos a null
            const optionalFields = ['description', 'endDate'];
            optionalFields.forEach((field) => {
                if (project[field] === '' || project[field] === undefined) {
                    project[field] = null;
                }
            });

            // Convertir fechas a objetos Date si vienen como string
            if (typeof project.startDate === 'string') {
                project.startDate = new Date(project.startDate);
            }

            if (typeof project.endDate === 'string' && project.endDate) {
                project.endDate = new Date(project.endDate);
            }

            // Validar que la fecha de inicio sea válida
            if (isNaN(project.startDate.getTime())) {
                res.status(400).json({ message: 'La fecha de inicio no es válida' });
                return;
            }

            // Validar que la fecha de fin sea posterior a la de inicio si existe
            if (project.endDate && project.startDate > project.endDate) {
                res.status(400).json({
                    message: 'La fecha de fin debe ser posterior a la fecha de inicio'
                });
                return;
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

            // Validar que al menos un campo modificable esté presente
            const updatableFields = ['name', 'description', 'location', 'startDate', 'endDate', 'status'];
            const hasUpdatableField = updatableFields.some(field => project[field] !== undefined);

            if (!hasUpdatableField) {
                res.status(400).json({
                    message: 'Debe proporcionar al menos un campo para actualizar',
                    updatableFields
                });
                return;
            }

            // Convertir fechas a objetos Date si vienen como string
            if (typeof project.startDate === 'string' && project.startDate) {
                project.startDate = new Date(project.startDate);
            }

            if (typeof project.endDate === 'string' && project.endDate) {
                project.endDate = new Date(project.endDate);
            }

            // Validar fechas si están presentes
            if (project.startDate && isNaN(project.startDate.getTime())) {
                res.status(400).json({ message: 'La fecha de inicio no es válida' });
                return;
            }

            if (project.endDate && isNaN(project.endDate.getTime())) {
                res.status(400).json({ message: 'La fecha de fin no es válida' });
                return;
            }

            // Validar que la fecha de fin sea posterior a la de inicio si ambas están presentes
            if (project.startDate && project.endDate && project.startDate > project.endDate) {
                res.status(400).json({
                    message: 'La fecha de fin debe ser posterior a la fecha de inicio'
                });
                return;
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