"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.projectController = exports.ProjectController = void 0;
var ProjectRepository_1 = require("../repositories/ProjectRepository");
var ProjectController = /** @class */ (function () {
    function ProjectController() {
    }
    ProjectController.prototype.createProject = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var project_1, requiredFields, missingFields, optionalFields, newProject, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        project_1 = req.body;
                        requiredFields = ['name', 'location', 'startDate', 'status'];
                        missingFields = requiredFields.filter(function (field) { return !project_1[field]; });
                        if (missingFields.length > 0) {
                            res.status(400).json({
                                message: 'Faltan campos requeridos',
                                missingFields: missingFields
                            });
                            return [2 /*return*/];
                        }
                        optionalFields = ['description', 'endDate'];
                        optionalFields.forEach(function (field) {
                            if (project_1[field] === '' || project_1[field] === undefined) {
                                project_1[field] = null;
                            }
                        });
                        // Convertir fechas a objetos Date si vienen como string
                        if (typeof project_1.startDate === 'string') {
                            project_1.startDate = new Date(project_1.startDate);
                        }
                        if (typeof project_1.endDate === 'string' && project_1.endDate) {
                            project_1.endDate = new Date(project_1.endDate);
                        }
                        // Validar que la fecha de inicio sea válida
                        if (isNaN(project_1.startDate.getTime())) {
                            res.status(400).json({ message: 'La fecha de inicio no es válida' });
                            return [2 /*return*/];
                        }
                        // Validar que la fecha de fin sea posterior a la de inicio si existe
                        if (project_1.endDate && project_1.startDate > project_1.endDate) {
                            res.status(400).json({
                                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ProjectRepository_1.projectRepository.createProject(project_1)];
                    case 1:
                        newProject = _a.sent();
                        res.status(201).json(newProject);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        res.status(500).json({ message: 'Error al crear el proyecto', error: error_1.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProjectController.prototype.getAllProjects = function (_req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var projects, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ProjectRepository_1.projectRepository.getAllProjects()];
                    case 1:
                        projects = _a.sent();
                        res.status(200).json(projects);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error(error_2);
                        res.status(500).json({ message: 'Error al obtener los proyectos', error: error_2.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProjectController.prototype.getProject = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, project, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ProjectRepository_1.projectRepository.getProjectById(id)];
                    case 1:
                        project = _a.sent();
                        if (!project) {
                            res.status(404).json({ message: 'Proyecto no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json(project);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error(error_3);
                        res.status(500).json({ message: 'Error al obtener el proyecto', error: error_3.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProjectController.prototype.updateProject = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, project_2, updatableFields, hasUpdatableField, updatedProject, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        project_2 = req.body;
                        updatableFields = ['name', 'description', 'location', 'startDate', 'endDate', 'status'];
                        hasUpdatableField = updatableFields.some(function (field) { return project_2[field] !== undefined; });
                        if (!hasUpdatableField) {
                            res.status(400).json({
                                message: 'Debe proporcionar al menos un campo para actualizar',
                                updatableFields: updatableFields
                            });
                            return [2 /*return*/];
                        }
                        // Convertir fechas a objetos Date si vienen como string
                        if (typeof project_2.startDate === 'string' && project_2.startDate) {
                            project_2.startDate = new Date(project_2.startDate);
                        }
                        if (typeof project_2.endDate === 'string' && project_2.endDate) {
                            project_2.endDate = new Date(project_2.endDate);
                        }
                        // Validar fechas si están presentes
                        if (project_2.startDate && isNaN(project_2.startDate.getTime())) {
                            res.status(400).json({ message: 'La fecha de inicio no es válida' });
                            return [2 /*return*/];
                        }
                        if (project_2.endDate && isNaN(project_2.endDate.getTime())) {
                            res.status(400).json({ message: 'La fecha de fin no es válida' });
                            return [2 /*return*/];
                        }
                        // Validar que la fecha de fin sea posterior a la de inicio si ambas están presentes
                        if (project_2.startDate && project_2.endDate && project_2.startDate > project_2.endDate) {
                            res.status(400).json({
                                message: 'La fecha de fin debe ser posterior a la fecha de inicio'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ProjectRepository_1.projectRepository.updateProject(id, project_2)];
                    case 1:
                        updatedProject = _a.sent();
                        if (!updatedProject) {
                            res.status(404).json({ message: 'Proyecto no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json(updatedProject);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error(error_4);
                        res.status(500).json({ message: 'Error al actualizar el proyecto', error: error_4.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProjectController.prototype.deleteProject = function (req, res) {
        return __awaiter(this, void 0, Promise, function () {
            var id, deletedProject, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10);
                        if (isNaN(id)) {
                            res.status(400).json({ message: 'ID inválido' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ProjectRepository_1.projectRepository.deleteProject(id)];
                    case 1:
                        deletedProject = _a.sent();
                        if (!deletedProject) {
                            res.status(404).json({ message: 'Proyecto no encontrado' });
                            return [2 /*return*/];
                        }
                        res.status(200).json({ message: 'Proyecto eliminado', project: deletedProject });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error(error_5);
                        res.status(500).json({ message: 'Error al eliminar el proyecto', error: error_5.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ProjectController;
}());
exports.ProjectController = ProjectController;
exports.projectController = new ProjectController();
