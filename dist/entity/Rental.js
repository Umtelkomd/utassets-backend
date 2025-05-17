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
exports.Rental = void 0;
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
let Rental = class Rental {
};
exports.Rental = Rental;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Rental.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventory_1.Inventory),
    (0, typeorm_1.JoinColumn)({ name: 'object_id' }),
    __metadata("design:type", Inventory_1.Inventory)
], Rental.prototype, "object", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'object_id' }),
    __metadata("design:type", Number)
], Rental.prototype, "objectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Rental.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], Rental.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_cost', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Rental.prototype, "dailyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'people_count', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Rental.prototype, "peopleCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Rental.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Rental.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Rental.prototype, "updatedAt", void 0);
exports.Rental = Rental = __decorate([
    (0, typeorm_1.Entity)({ name: 'rental' })
], Rental);
