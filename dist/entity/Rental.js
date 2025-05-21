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
const typeorm_1 = require("typeorm");
const Inventory_1 = require("./Inventory");
const Vehicle_1 = require("./Vehicle");
const Housing_1 = require("./Housing");
var RentalType;
(function (RentalType) {
    RentalType["ITEM"] = "item";
    RentalType["VEHICLE"] = "vehicle";
    RentalType["HOUSING"] = "housing";
})(RentalType || (exports.RentalType = RentalType = {}));
let Rental = class Rental {
};
exports.Rental = Rental;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    __metadata("design:type", Number)
], Rental.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rental_type', type: 'enum', enum: RentalType }),
    __metadata("design:type", String)
], Rental.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inventory_id', nullable: true }),
    __metadata("design:type", Number)
], Rental.prototype, "inventoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vehicle_id', nullable: true }),
    __metadata("design:type", Number)
], Rental.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'housing_id', nullable: true }),
    __metadata("design:type", Number)
], Rental.prototype, "housingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Inventory_1.Inventory, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'inventory_id' }),
    __metadata("design:type", Inventory_1.Inventory)
], Rental.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vehicle_1.Vehicle, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vehicle_id' }),
    __metadata("design:type", Vehicle_1.Vehicle)
], Rental.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Housing_1.Housing, { eager: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'housing_id' }),
    __metadata("design:type", Housing_1.Housing)
], Rental.prototype, "housing", void 0);
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
    (0, typeorm_1.Column)({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Rental.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rental_comments', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Rental.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rental_metadata', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Rental.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Rental.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Rental.prototype, "updatedAt", void 0);
exports.Rental = Rental = __decorate([
    (0, typeorm_1.Entity)('rental')
], Rental);
