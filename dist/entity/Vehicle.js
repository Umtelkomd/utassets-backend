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
exports.Vehicle = exports.FuelType = exports.VehicleStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
// Enum para el estado del vehículo
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["OPERATIVO"] = "Operativo";
    VehicleStatus["EN_REPARACION"] = "En Reparaci\u00F3n";
    VehicleStatus["FUERA_DE_SERVICIO"] = "Fuera de Servicio";
})(VehicleStatus || (exports.VehicleStatus = VehicleStatus = {}));
// Enum para el tipo de combustible
var FuelType;
(function (FuelType) {
    FuelType["GASOLINA"] = "Gasolina";
    FuelType["DIESEL"] = "Di\u00E9sel";
    FuelType["ELECTRICO"] = "El\u00E9ctrico";
    FuelType["HIBRIDO"] = "H\u00EDbrido";
})(FuelType || (exports.FuelType = FuelType = {}));
let Vehicle = class Vehicle {
};
exports.Vehicle = Vehicle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vehicle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'license_plate', type: 'varchar', length: 20, unique: true }),
    __metadata("design:type", String)
], Vehicle.prototype, "licensePlate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Vehicle.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Vehicle.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Vehicle.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'vehicle_status',
        type: 'enum',
        enum: VehicleStatus,
        default: VehicleStatus.OPERATIVO
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "vehicleStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "mileage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fuel_type',
        type: 'enum',
        enum: FuelType
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'insurance_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "insuranceExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'technical_revision_expiry_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "technicalRevisionExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_public_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Vehicle.prototype, "photoPublicId", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, user => user.vehicles),
    (0, typeorm_1.JoinTable)({
        name: 'vehicle_responsibles',
        joinColumn: {
            name: 'vehicle_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Vehicle.prototype, "responsibleUsers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Vehicle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Vehicle.prototype, "updatedAt", void 0);
exports.Vehicle = Vehicle = __decorate([
    (0, typeorm_1.Entity)({ name: 'vehicle' })
], Vehicle);
