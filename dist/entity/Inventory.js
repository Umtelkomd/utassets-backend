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
exports.Inventory = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let Inventory = class Inventory {
};
exports.Inventory = Inventory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Inventory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_name', type: 'varchar' }),
    __metadata("design:type", String)
], Inventory.prototype, "itemName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_code', type: 'varchar', unique: true }),
    __metadata("design:type", String)
], Inventory.prototype, "itemCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Inventory.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Inventory.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Inventory.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Inventory.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acquisition_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "acquisitionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_maintenance_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "lastMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_maintenance_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "nextMaintenanceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_path', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Inventory.prototype, "imagePath", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Inventory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Inventory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, user => user.inventories),
    (0, typeorm_1.JoinTable)({
        name: 'inventory_responsibles',
        joinColumn: {
            name: 'inventory_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Inventory.prototype, "responsibleUsers", void 0);
exports.Inventory = Inventory = __decorate([
    (0, typeorm_1.Entity)({ name: 'inventory' })
], Inventory);
