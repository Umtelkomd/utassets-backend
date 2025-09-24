"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Report = exports.ReportType = exports.ReportStatus = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
var Comment_1 = require("./Comment");
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["COMPLETED"] = "COMPLETED";
    ReportStatus["CANCELLED"] = "CANCELLED";
})(ReportStatus = exports.ReportStatus || (exports.ReportStatus = {}));
var ReportType;
(function (ReportType) {
    ReportType["INVENTORY"] = "INVENTORY";
    ReportType["VEHICLES"] = "VEHICLES";
    ReportType["OTHER"] = "OTHER";
})(ReportType = exports.ReportType || (exports.ReportType = {}));
var Report = /** @class */ (function () {
    function Report() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn()
    ], Report.prototype, "id");
    __decorate([
        typeorm_1.Column()
    ], Report.prototype, "title");
    __decorate([
        typeorm_1.Column('text')
    ], Report.prototype, "description");
    __decorate([
        typeorm_1.CreateDateColumn()
    ], Report.prototype, "createdAt");
    __decorate([
        typeorm_1.Column({
            type: 'enum',
            "enum": ReportType,
            "default": ReportType.OTHER
        })
    ], Report.prototype, "type");
    __decorate([
        typeorm_1.Column({
            type: 'enum',
            "enum": ReportStatus,
            "default": ReportStatus.PENDING
        })
    ], Report.prototype, "status");
    __decorate([
        typeorm_1.ManyToOne(function () { return User_1.User; }, function (user) { return user.reports; })
    ], Report.prototype, "user");
    __decorate([
        typeorm_1.OneToMany(function () { return Comment_1.Comment; }, function (comment) { return comment.report; })
    ], Report.prototype, "comments");
    Report = __decorate([
        typeorm_1.Entity()
    ], Report);
    return Report;
}());
exports.Report = Report;
