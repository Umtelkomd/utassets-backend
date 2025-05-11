"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.User = exports.UserRole = void 0;
var typeorm_1 = require("typeorm");
var Vehicle_1 = require("./Vehicle");
var Inventory_1 = require("./Inventory");
var Report_1 = require("./Report");
var Comment_1 = require("./Comment");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "administrador";
    UserRole["TECH"] = "tecnico";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var User = /** @class */ (function () {
    function User() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], User.prototype, "id");
    __decorate([
        typeorm_1.Column({ length: 100, unique: true })
    ], User.prototype, "username");
    __decorate([
        typeorm_1.Column({ length: 100, unique: true })
    ], User.prototype, "email");
    __decorate([
        typeorm_1.Column()
    ], User.prototype, "password");
    __decorate([
        typeorm_1.Column({
            type: 'enum',
            "enum": UserRole,
            "default": UserRole.TECH
        })
    ], User.prototype, "role");
    __decorate([
        typeorm_1.Column({ length: 100 })
    ], User.prototype, "fullName");
    __decorate([
        typeorm_1.Column({ nullable: true, length: 20 })
    ], User.prototype, "phone");
    __decorate([
        typeorm_1.Column({ type: 'date', nullable: true })
    ], User.prototype, "birthDate");
    __decorate([
        typeorm_1.Column({ "default": true })
    ], User.prototype, "isActive");
    __decorate([
        typeorm_1.Column({ nullable: true, length: 255 })
    ], User.prototype, "lastLoginIp");
    __decorate([
        typeorm_1.Column({ nullable: true })
    ], User.prototype, "lastLoginDate");
    __decorate([
        typeorm_1.Column({ name: 'image_path', type: 'varchar', nullable: true })
    ], User.prototype, "imagePath");
    __decorate([
        typeorm_1.CreateDateColumn()
    ], User.prototype, "createdAt");
    __decorate([
        typeorm_1.UpdateDateColumn()
    ], User.prototype, "updatedAt");
    __decorate([
        typeorm_1.ManyToMany(function () { return Vehicle_1.Vehicle; }, function (vehicle) { return vehicle.responsibleUsers; })
    ], User.prototype, "vehicles");
    __decorate([
        typeorm_1.ManyToMany(function () { return Inventory_1.Inventory; }, function (inventory) { return inventory.responsibleUsers; })
    ], User.prototype, "inventories");
    __decorate([
        typeorm_1.OneToMany(function () { return Report_1.Report; }, function (report) { return report.user; })
    ], User.prototype, "reports");
    __decorate([
        typeorm_1.OneToMany(function () { return Comment_1.Comment; }, function (comment) { return comment.user; })
    ], User.prototype, "comments");
    User = __decorate([
        typeorm_1.Entity()
    ], User);
    return User;
}());
exports.User = User;
