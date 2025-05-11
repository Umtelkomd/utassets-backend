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
exports.Reporte = exports.TipoReporte = exports.EstadoReporte = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Comentario_1 = require("./Comentario");
var EstadoReporte;
(function (EstadoReporte) {
    EstadoReporte["PENDIENTE"] = "PENDIENTE";
    EstadoReporte["COMPLETADO"] = "COMPLETADO";
    EstadoReporte["CANCELADO"] = "CANCELADO";
})(EstadoReporte || (exports.EstadoReporte = EstadoReporte = {}));
var TipoReporte;
(function (TipoReporte) {
    TipoReporte["INVENTARIO"] = "INVENTARIO";
    TipoReporte["VEHICULOS"] = "VEHICULOS";
    TipoReporte["OTRO"] = "OTRO";
})(TipoReporte || (exports.TipoReporte = TipoReporte = {}));
let Reporte = class Reporte {
};
exports.Reporte = Reporte;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reporte.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Reporte.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Reporte.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Reporte.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoReporte,
        default: TipoReporte.OTRO
    }),
    __metadata("design:type", String)
], Reporte.prototype, "tipoReporte", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EstadoReporte,
        default: EstadoReporte.PENDIENTE
    }),
    __metadata("design:type", String)
], Reporte.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.reportes),
    __metadata("design:type", User_1.User)
], Reporte.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comentario_1.Comentario, comentario => comentario.reporte),
    __metadata("design:type", Array)
], Reporte.prototype, "comentarios", void 0);
exports.Reporte = Reporte = __decorate([
    (0, typeorm_1.Entity)()
], Reporte);
