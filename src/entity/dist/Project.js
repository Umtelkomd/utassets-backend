"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Project = void 0;
var typeorm_1 = require("typeorm");
var Project = /** @class */ (function () {
    function Project() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Project.prototype, "id");
    __decorate([
        typeorm_1.Column({ type: 'varchar' })
    ], Project.prototype, "name");
    __decorate([
        typeorm_1.Column({ type: 'text', nullable: true })
    ], Project.prototype, "description");
    __decorate([
        typeorm_1.Column({ type: 'varchar' })
    ], Project.prototype, "location");
    __decorate([
        typeorm_1.Column({ name: 'start_date', type: 'date' })
    ], Project.prototype, "startDate");
    __decorate([
        typeorm_1.Column({ name: 'end_date', type: 'date', nullable: true })
    ], Project.prototype, "endDate");
    __decorate([
        typeorm_1.Column({ type: 'varchar' })
    ], Project.prototype, "status");
    __decorate([
        typeorm_1.CreateDateColumn({ name: 'created_at' })
    ], Project.prototype, "createdAt");
    __decorate([
        typeorm_1.UpdateDateColumn({ name: 'updated_at' })
    ], Project.prototype, "updatedAt");
    Project = __decorate([
        typeorm_1.Entity({ name: 'projects' })
    ], Project);
    return Project;
}());
exports.Project = Project;
