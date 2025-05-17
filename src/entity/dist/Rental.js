"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Rental = void 0;
require("reflect-metadata");
var typeorm_1 = require("typeorm");
var Inventory_1 = require("./Inventory");
var Rental = /** @class */ (function () {
    function Rental() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Rental.prototype, "id");
    __decorate([
        typeorm_1.ManyToOne(function () { return Inventory_1.Inventory; }, { eager: true }),
        typeorm_1.JoinColumn({ name: 'object_id' })
    ], Rental.prototype, "object");
    __decorate([
        typeorm_1.Column({ name: 'object_id' })
    ], Rental.prototype, "objectId");
    __decorate([
        typeorm_1.Column({ name: 'start_date', type: 'date' })
    ], Rental.prototype, "startDate");
    __decorate([
        typeorm_1.Column({ name: 'end_date', type: 'date' })
    ], Rental.prototype, "endDate");
    __decorate([
        typeorm_1.Column({ name: 'daily_cost', type: 'decimal', precision: 10, scale: 2 })
    ], Rental.prototype, "dailyCost");
    __decorate([
        typeorm_1.Column({ name: 'people_count', type: 'int', nullable: true })
    ], Rental.prototype, "peopleCount");
    __decorate([
        typeorm_1.Column({ type: 'decimal', precision: 10, scale: 2 })
    ], Rental.prototype, "total");
    __decorate([
        typeorm_1.CreateDateColumn({ name: 'created_at' })
    ], Rental.prototype, "createdAt");
    __decorate([
        typeorm_1.UpdateDateColumn({ name: 'updated_at' })
    ], Rental.prototype, "updatedAt");
    Rental = __decorate([
        typeorm_1.Entity('rental')
    ], Rental);
    return Rental;
}());
exports.Rental = Rental;
