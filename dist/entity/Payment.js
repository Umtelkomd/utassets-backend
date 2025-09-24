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
exports.Payment = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const Financing_1 = require("./Financing");
const User_1 = require("./User");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["OVERDUE"] = "overdue";
    PaymentStatus["PARTIAL"] = "partial";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Financing_1.Financing, financing => financing.payments),
    (0, typeorm_1.JoinColumn)({ name: 'financing_id' }),
    __metadata("design:type", Financing_1.Financing)
], Payment.prototype, "financing", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_number', type: 'int' }),
    __metadata("design:type", Number)
], Payment.prototype, "paymentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_date', type: 'date' }),
    __metadata("design:type", Date)
], Payment.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "scheduledAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'principal_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "principalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interest_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "interestAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remaining_balance', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "remainingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_date', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "actualDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "actualAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'recorded_by' }),
    __metadata("design:type", Object)
], Payment.prototype, "recordedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)({ name: 'payment' })
], Payment);
