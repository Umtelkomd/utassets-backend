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
exports.Movement = void 0;
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
let Movement = class Movement {
};
exports.Movement = Movement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Movement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inventory_id' }),
    __metadata("design:type", Number)
], Movement.prototype, "inventoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'movement_type', type: 'varchar' }),
    __metadata("design:type", String)
], Movement.prototype, "movementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_location', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Movement.prototype, "fromLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_location', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Movement.prototype, "toLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Movement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_return_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Movement.prototype, "expectedReturnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_return_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Movement.prototype, "actualReturnDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'person_responsible', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Movement.prototype, "personResponsible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Movement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'movement_date' }),
    __metadata("design:type", Date)
], Movement.prototype, "movementDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Movement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Movement.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventory_1.Inventory),
    (0, typeorm_1.JoinColumn)({ name: 'inventory_id' }),
    __metadata("design:type", Inventory_1.Inventory)
], Movement.prototype, "inventory", void 0);
exports.Movement = Movement = __decorate([
    (0, typeorm_1.Entity)({ name: 'inventory_movements' })
], Movement);
