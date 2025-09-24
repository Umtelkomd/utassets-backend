"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Reporte = exports.TipoReporte = exports.EstadoReporte = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Comentario_1 = require("./Comentario");
var EstadoReporte;
(function (EstadoReporte) {
    EstadoReporte["PENDIENTE"] = "PENDIENTE";
    EstadoReporte["COMPLETADO"] = "COMPLETADO";
    EstadoReporte["CANCELADO"] = "CANCELADO";
})(EstadoReporte = exports.EstadoReporte || (exports.EstadoReporte = {}));
var TipoReporte;
(function (TipoReporte) {
    TipoReporte["INVENTARIO"] = "INVENTARIO";
    TipoReporte["VEHICULOS"] = "VEHICULOS";
    TipoReporte["OTRO"] = "OTRO";
})(TipoReporte = exports.TipoReporte || (exports.TipoReporte = {}));
var Reporte = /** @class */ (function () {
    function Reporte() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Reporte.prototype, "id");
    __decorate([
        typeorm_1.Column()
    ], Reporte.prototype, "titulo");
    __decorate([
        typeorm_1.Column('text')
    ], Reporte.prototype, "descripcion");
    __decorate([
        typeorm_1.CreateDateColumn()
    ], Reporte.prototype, "fechaCreacion");
    __decorate([
        typeorm_1.Column({
            type: 'enum',
            "enum": TipoReporte,
            "default": TipoReporte.OTRO
        })
    ], Reporte.prototype, "tipoReporte");
    __decorate([
        typeorm_1.Column({
            type: 'enum',
            "enum": EstadoReporte,
            "default": EstadoReporte.PENDIENTE
        })
    ], Reporte.prototype, "estado");
    __decorate([
        typeorm_1.ManyToOne(function () { return User_1.User; }, function (user) { return user.reportes; })
    ], Reporte.prototype, "usuario");
    __decorate([
        typeorm_1.OneToMany(function () { return Comentario_1.Comentario; }, function (comentario) { return comentario.reporte; })
    ], Reporte.prototype, "comentarios");
    Reporte = __decorate([
        typeorm_1.Entity()
    ], Reporte);
    return Reporte;
}());
exports.Reporte = Reporte;
