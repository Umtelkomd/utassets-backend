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
exports.Vacation = exports.VacationStatus = exports.VacationType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var VacationType;
(function (VacationType) {
    VacationType["REST_DAY"] = "rest_day";
    VacationType["EXTRA_WORK_DAY"] = "extra_work_day";
})(VacationType || (exports.VacationType = VacationType = {}));
var VacationStatus;
(function (VacationStatus) {
    VacationStatus["PENDING"] = "pending";
    VacationStatus["FIRST_APPROVED"] = "first_approved";
    VacationStatus["FULLY_APPROVED"] = "fully_approved";
    VacationStatus["REJECTED"] = "rejected"; // Rechazada
})(VacationStatus || (exports.VacationStatus = VacationStatus = {}));
let Vacation = class Vacation {
    // Método auxiliar para calcular el número de días en el rango
    get dayCount() {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = end.getTime() - start.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    // Método auxiliar para verificar si una fecha está dentro del rango
    containsDate(date) {
        const checkDate = new Date(date);
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        // Normalizar horas para comparar solo fechas
        checkDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return checkDate >= start && checkDate <= end;
    }
    // Método auxiliar para obtener todas las fechas del rango
    getAllDatesInRange() {
        const dates = [];
        const current = new Date(this.startDate);
        const end = new Date(this.endDate);
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
};
exports.Vacation = Vacation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vacation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.vacations),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Vacation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Vacation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Vacation.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Vacation.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VacationType
    }),
    __metadata("design:type", String)
], Vacation.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vacation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VacationStatus,
        default: VacationStatus.PENDING
    }),
    __metadata("design:type", String)
], Vacation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Vacation.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'first_approved_by' }),
    __metadata("design:type", User_1.User)
], Vacation.prototype, "firstApprovedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vacation.prototype, "firstApprovedDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'second_approved_by' }),
    __metadata("design:type", User_1.User)
], Vacation.prototype, "secondApprovedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vacation.prototype, "secondApprovedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Vacation.prototype, "approvedDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", User_1.User)
], Vacation.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Vacation.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rejected_by' }),
    __metadata("design:type", User_1.User)
], Vacation.prototype, "rejectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Vacation.prototype, "rejectedDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Vacation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Vacation.prototype, "updatedAt", void 0);
exports.Vacation = Vacation = __decorate([
    (0, typeorm_1.Entity)()
], Vacation);
