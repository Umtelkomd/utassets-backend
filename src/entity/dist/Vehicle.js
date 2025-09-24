"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Vehicle = exports.FuelType = exports.VehicleStatus = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
// Enum para el estado del vehículo
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["OPERATIVO"] = "Operativo";
    VehicleStatus["EN_REPARACION"] = "En Reparaci\u00F3n";
    VehicleStatus["FUERA_DE_SERVICIO"] = "Fuera de Servicio";
})(VehicleStatus = exports.VehicleStatus || (exports.VehicleStatus = {}));
// Enum para el tipo de combustible
var FuelType;
(function (FuelType) {
    FuelType["GASOLINA"] = "Gasolina";
    FuelType["DIESEL"] = "Di\u00E9sel";
    FuelType["ELECTRICO"] = "El\u00E9ctrico";
    FuelType["HIBRIDO"] = "H\u00EDbrido";
})(FuelType = exports.FuelType || (exports.FuelType = {}));
var Vehicle = /** @class */ (function () {
    function Vehicle() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Vehicle.prototype, "id");
    __decorate([
        typeorm_1.Column({ name: 'license_plate', type: 'varchar', length: 20, unique: true })
    ], Vehicle.prototype, "licensePlate");
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 50 })
    ], Vehicle.prototype, "brand");
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 50 })
    ], Vehicle.prototype, "model");
    __decorate([
        typeorm_1.Column({ type: 'int' })
    ], Vehicle.prototype, "year");
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 17, unique: true, nullable: true })
    ], Vehicle.prototype, "vin");
    __decorate([
        typeorm_1.Column({ type: 'varchar', length: 30, nullable: true })
    ], Vehicle.prototype, "color");
    __decorate([
        typeorm_1.Column({
            name: 'vehicle_status',
            type: 'enum',
            "enum": VehicleStatus,
            "default": VehicleStatus.OPERATIVO
        })
    ], Vehicle.prototype, "vehicleStatus");
    __decorate([
        typeorm_1.Column({ type: 'int', nullable: true })
    ], Vehicle.prototype, "mileage");
    __decorate([
        typeorm_1.Column({
            name: 'fuel_type',
            type: 'enum',
            "enum": FuelType
        })
    ], Vehicle.prototype, "fuelType");
    __decorate([
        typeorm_1.Column({ name: 'insurance_expiry_date', type: 'date', nullable: true })
    ], Vehicle.prototype, "insuranceExpiryDate");
    __decorate([
        typeorm_1.Column({ name: 'technical_revision_expiry_date', type: 'date', nullable: true })
    ], Vehicle.prototype, "technicalRevisionExpiryDate");
    __decorate([
        typeorm_1.Column({ type: 'text', nullable: true })
    ], Vehicle.prototype, "notes");
    __decorate([
        typeorm_1.Column({ name: 'image_path', type: 'varchar', nullable: true })
    ], Vehicle.prototype, "imagePath");
    __decorate([
        typeorm_1.ManyToMany(function () { return User_1.User; }, function (user) { return user.vehicles; }),
        typeorm_1.JoinTable({
            name: 'vehicle_responsibles',
            joinColumn: {
                name: 'vehicle_id',
                referencedColumnName: 'id'
            },
            inverseJoinColumn: {
                name: 'user_id',
                referencedColumnName: 'id'
            }
        })
    ], Vehicle.prototype, "responsibleUsers");
    __decorate([
        typeorm_1.CreateDateColumn({ name: 'created_at' })
    ], Vehicle.prototype, "createdAt");
    __decorate([
        typeorm_1.UpdateDateColumn({ name: 'updated_at' })
    ], Vehicle.prototype, "updatedAt");
    Vehicle = __decorate([
        typeorm_1.Entity({ name: 'vehicle' })
    ], Vehicle);
    return Vehicle;
}());
exports.Vehicle = Vehicle;
