"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = exports.ProjectRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const Project_1 = require("../entity/Project");
class ProjectRepository extends typeorm_1.Repository {
    constructor() {
        super(Project_1.Project, data_source_1.AppDataSource.createEntityManager());
    }
    async createProject(project) {
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
    async getAllProjects() {
        return await this.find({
            order: {
                createdAt: 'DESC'
            }
        });
    }
    async getProjectById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateProject(id, project) {
        const existingProject = await this.findOne({
            where: { id }
        });
        if (!existingProject) {
            return null;
        }
        // Actualizar propiedades si existen en el DTO
        if (project.name !== undefined)
            existingProject.name = project.name;
        if (project.description !== undefined)
            existingProject.description = project.description;
        if (project.location !== undefined)
            existingProject.location = project.location;
        if (project.startDate !== undefined)
            existingProject.startDate = project.startDate;
        if (project.endDate !== undefined)
            existingProject.endDate = project.endDate;
        if (project.status !== undefined)
            existingProject.status = project.status;
        return await this.save(existingProject);
    }
    async deleteProject(id) {
        const projectToRemove = await this.findOne({
            where: { id }
        });
        if (!projectToRemove) {
            return null;
        }
        return await this.remove(projectToRemove);
    }
}
exports.ProjectRepository = ProjectRepository;
exports.projectRepository = new ProjectRepository();
