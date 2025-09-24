"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjectController_1 = require("../controllers/ProjectController");
const router = (0, express_1.Router)();
// Rutas
router.post('/', ProjectController_1.projectController.createProject.bind(ProjectController_1.projectController));
router.get('/', ProjectController_1.projectController.getAllProjects.bind(ProjectController_1.projectController));
router.get('/:id', ProjectController_1.projectController.getProject.bind(ProjectController_1.projectController));
router.put('/:id', ProjectController_1.projectController.updateProject.bind(ProjectController_1.projectController));
router.delete('/:id', ProjectController_1.projectController.deleteProject.bind(ProjectController_1.projectController));
exports.default = router;
