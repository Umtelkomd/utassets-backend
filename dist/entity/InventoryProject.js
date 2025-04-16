"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryProject = void 0;
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
const Project_1 = require("./Project");
let InventoryProject = class InventoryProject {
};
exports.InventoryProject = InventoryProject;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'inventory_id' }),
    __metadata("design:type", Number)
], InventoryProject.prototype, "inventoryId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'project_id' }),
    __metadata("design:type", Number)
], InventoryProject.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'assigned_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InventoryProject.prototype, "assignedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], InventoryProject.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], InventoryProject.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'returned_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], InventoryProject.prototype, "returnedDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventory_1.Inventory),
    (0, typeorm_1.JoinColumn)({ name: 'inventory_id' }),
    __metadata("design:type", Inventory_1.Inventory)
], InventoryProject.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Project_1.Project),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", Project_1.Project)
], InventoryProject.prototype, "project", void 0);
exports.InventoryProject = InventoryProject = __decorate([
    (0, typeorm_1.Entity)({ name: 'inventory_projects' })
], InventoryProject);
