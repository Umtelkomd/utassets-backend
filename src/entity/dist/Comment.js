"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Comment = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Report_1 = require("./Report");
var Comment = /** @class */ (function () {
    function Comment() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Comment.prototype, "id");
    __decorate([
        typeorm_1.Column('text')
    ], Comment.prototype, "content");
    __decorate([
        typeorm_1.CreateDateColumn()
    ], Comment.prototype, "createdAt");
    __decorate([
        typeorm_1.ManyToOne(function () { return User_1.User; }, function (user) { return user.comments; })
    ], Comment.prototype, "user");
    __decorate([
        typeorm_1.ManyToOne(function () { return Report_1.Report; }, function (report) { return report.comments; })
    ], Comment.prototype, "report");
    Comment = __decorate([
        typeorm_1.Entity()
    ], Comment);
    return Comment;
}());
exports.Comment = Comment;
