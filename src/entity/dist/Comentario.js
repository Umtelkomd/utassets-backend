"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Comentario = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Reporte_1 = require("./Reporte");
var Comentario = /** @class */ (function () {
    function Comentario() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Comentario.prototype, "id");
    __decorate([
        typeorm_1.Column('text')
    ], Comentario.prototype, "contenido");
    __decorate([
        typeorm_1.CreateDateColumn()
    ], Comentario.prototype, "fechaCreacion");
    __decorate([
        typeorm_1.ManyToOne(function () { return User_1.User; }, function (user) { return user.comentarios; })
    ], Comentario.prototype, "usuario");
    __decorate([
        typeorm_1.ManyToOne(function () { return Reporte_1.Reporte; }, function (reporte) { return reporte.comentarios; })
    ], Comentario.prototype, "reporte");
    Comentario = __decorate([
        typeorm_1.Entity()
    ], Comentario);
    return Comentario;
}());
exports.Comentario = Comentario;
