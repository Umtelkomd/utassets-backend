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
exports.Financing = exports.FinancingStatus = exports.AssetType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Payment_1 = require("./Payment");
var AssetType;
(function (AssetType) {
    AssetType["VEHICLE"] = "vehicle";
    AssetType["INVENTORY"] = "inventory";
    AssetType["HOUSING"] = "housing";
})(AssetType || (exports.AssetType = AssetType = {}));
var FinancingStatus;
(function (FinancingStatus) {
    FinancingStatus["ACTIVE"] = "active";
    FinancingStatus["COMPLETED"] = "completed";
    FinancingStatus["DEFAULTED"] = "defaulted";
    FinancingStatus["CANCELLED"] = "cancelled";
})(FinancingStatus || (exports.FinancingStatus = FinancingStatus = {}));
let Financing = class Financing {
};
exports.Financing = Financing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Financing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'asset_type',
        type: 'enum',
        enum: AssetType
    }),
    __metadata("design:type", String)
], Financing.prototype, "assetType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', type: 'int' }),
    __metadata("design:type", Number)
], Financing.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'loan_amount', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Financing.prototype, "loanAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'down_payment', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Financing.prototype, "downPayment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Financing.prototype, "interestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'term_months', type: 'int' }),
    __metadata("design:type", Number)
], Financing.prototype, "termMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monthly_payment', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Financing.prototype, "monthlyPayment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Financing.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", Date)
], Financing.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FinancingStatus,
        default: FinancingStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Financing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Financing.prototype, "lender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Financing.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_balance', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Financing.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_paid', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Financing.prototype, "totalPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payments_made', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Financing.prototype, "paymentsMade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Financing.prototype, "assetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_reference', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Financing.prototype, "assetReference", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_1.User)
], Financing.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Payment_1.Payment, payment => payment.financing, { cascade: true }),
    __metadata("design:type", Array)
], Financing.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Financing.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Financing.prototype, "updatedAt", void 0);
exports.Financing = Financing = __decorate([
    (0, typeorm_1.Entity)({ name: 'financing' })
], Financing);
