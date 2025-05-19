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
exports.Rental = exports.RentalType = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
var RentalType;
(function (RentalType) {
    RentalType["ITEM"] = "item";
    RentalType["VEHICLE"] = "vehicle";
    RentalType["HOUSING"] = "housing";
})(RentalType || (exports.RentalType = RentalType = {}));
let Rental = class Rental {
    validateDates() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
    }
};
exports.Rental = Rental;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Rental.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: RentalType, default: RentalType.ITEM }),
    __metadata("design:type", String)
], Rental.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'object_id' }),
    __metadata("design:type", Number)
], Rental.prototype, "objectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventory_1.Inventory, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'object_id' }),
    __metadata("design:type", Inventory_1.Inventory)
], Rental.prototype, "object", void 0);
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
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Rental.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'people_count', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Rental.prototype, "peopleCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dealer_name', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "dealerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dealer_address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "dealerAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dealer_phone', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "dealerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'guest_count', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Rental.prototype, "guestCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bedrooms', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Rental.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bathrooms', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Rental.prototype, "bathrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'amenities', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Rental.prototype, "amenities", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rules', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "rules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Rental.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Rental.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Rental.prototype, "validateDates", null);
exports.Rental = Rental = __decorate([
    (0, typeorm_1.Entity)('rental')
], Rental);
