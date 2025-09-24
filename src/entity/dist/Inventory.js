"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Inventory = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Inventory = /** @class */ (function () {
    function Inventory() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Inventory.prototype, "id");
    __decorate([
        typeorm_1.Column({ name: 'item_name', type: 'varchar' })
    ], Inventory.prototype, "itemName");
    __decorate([
        typeorm_1.Column({ name: 'item_code', type: 'varchar', unique: true })
    ], Inventory.prototype, "itemCode");
    __decorate([
        typeorm_1.Column({ type: 'varchar' })
    ], Inventory.prototype, "category");
    __decorate([
        typeorm_1.Column({ type: 'int', "default": 1 })
    ], Inventory.prototype, "quantity");
    __decorate([
        typeorm_1.Column({ type: 'varchar' })
    ], Inventory.prototype, "condition");
    __decorate([
        typeorm_1.Column({ type: 'varchar' })
    ], Inventory.prototype, "location");
    __decorate([
        typeorm_1.Column({ name: 'acquisition_date', type: 'date', nullable: true })
    ], Inventory.prototype, "acquisitionDate");
    __decorate([
        typeorm_1.Column({ name: 'last_maintenance_date', type: 'date', nullable: true })
    ], Inventory.prototype, "lastMaintenanceDate");
    __decorate([
        typeorm_1.Column({ name: 'next_maintenance_date', type: 'date', nullable: true })
    ], Inventory.prototype, "nextMaintenanceDate");
    __decorate([
        typeorm_1.Column({ type: 'text', nullable: true })
    ], Inventory.prototype, "notes");
    __decorate([
        typeorm_1.Column({ name: 'image_path', type: 'varchar', nullable: true })
    ], Inventory.prototype, "imagePath");
    __decorate([
        typeorm_1.CreateDateColumn({ name: 'created_at' })
    ], Inventory.prototype, "createdAt");
    __decorate([
        typeorm_1.UpdateDateColumn({ name: 'updated_at' })
    ], Inventory.prototype, "updatedAt");
    __decorate([
        typeorm_1.ManyToMany(function () { return User_1.User; }, function (user) { return user.inventories; }),
        typeorm_1.JoinTable({
            name: 'inventory_responsibles',
            joinColumn: {
                name: 'inventory_id',
                referencedColumnName: 'id'
            },
            inverseJoinColumn: {
                name: 'user_id',
                referencedColumnName: 'id'
            }
        })
    ], Inventory.prototype, "responsibleUsers");
    Inventory = __decorate([
        typeorm_1.Entity({ name: 'inventory' })
    ], Inventory);
    return Inventory;
}());
exports.Inventory = Inventory;
