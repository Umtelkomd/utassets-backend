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
exports.Maintenance = void 0;
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
let Maintenance = class Maintenance {
};
exports.Maintenance = Maintenance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Maintenance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inventory_id' }),
    __metadata("design:type", Number)
], Maintenance.prototype, "inventoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maintenance_date', type: 'date' }),
    __metadata("design:type", Date)
], Maintenance.prototype, "maintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maintenance_type', type: 'varchar' }),
    __metadata("design:type", String)
], Maintenance.prototype, "maintenanceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Maintenance.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performed_by', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Maintenance.prototype, "performedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Maintenance.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Maintenance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Maintenance.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventory_1.Inventory),
    (0, typeorm_1.JoinColumn)({ name: 'inventory_id' }),
    __metadata("design:type", Inventory_1.Inventory)
], Maintenance.prototype, "inventory", void 0);
exports.Maintenance = Maintenance = __decorate([
    (0, typeorm_1.Entity)({ name: 'maintenance_history' })
], Maintenance);
