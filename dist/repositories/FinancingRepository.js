"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancingRepository = void 0;
const data_source_1 = require("../config/data-source");
const Financing_1 = require("../entity/Financing");
const Payment_1 = require("../entity/Payment");
class FinancingRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Financing_1.Financing);
    }
    async findAll() {
        return await this.repository.find({
            relations: ['createdBy', 'payments'],
            order: { createdAt: 'DESC' }
        });
    }
    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ['createdBy', 'payments', 'payments.recordedBy']
        });
    }
    async findByAsset(assetType, assetId) {
        return await this.repository.find({
            where: { assetType, assetId },
            relations: ['createdBy', 'payments'],
            order: { createdAt: 'DESC' }
        });
    }
    async findActiveByAsset(assetType, assetId) {
        return await this.repository.findOne({
            where: {
                assetType,
                assetId,
                status: Financing_1.FinancingStatus.ACTIVE
            },
            relations: ['createdBy', 'payments']
        });
    }
    async findByStatus(status) {
        return await this.repository.find({
            where: { status },
            relations: ['createdBy', 'payments'],
            order: { createdAt: 'DESC' }
        });
    }
    async findOverdueFinancings() {
        const today = new Date().toISOString().split('T')[0];
        return await this.repository
            .createQueryBuilder('financing')
            .leftJoinAndSelect('financing.payments', 'payment')
            .leftJoinAndSelect('financing.createdBy', 'createdBy')
            .where('financing.status = :status', { status: Financing_1.FinancingStatus.ACTIVE })
            .andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('COUNT(*)')
                .from(Payment_1.Payment, 'p')
                .where('p.financing_id = financing.id')
                .andWhere('p.status = :paidStatus')
                .getQuery();
            return `(${subQuery}) < financing.term_months`;
        }, { paidStatus: Payment_1.PaymentStatus.PAID })
            .andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('MIN(p.scheduled_date)')
                .from(Payment_1.Payment, 'p')
                .where('p.financing_id = financing.id')
                .andWhere('p.status = :pendingStatus')
                .getQuery();
            return `(${subQuery}) < :today`;
        }, { pendingStatus: Payment_1.PaymentStatus.PENDING, today })
            .getMany();
    }
    async findFinancingsDueSoon(days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const futureDateStr = futureDate.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return await this.repository
            .createQueryBuilder('financing')
            .leftJoinAndSelect('financing.payments', 'payment')
            .leftJoinAndSelect('financing.createdBy', 'createdBy')
            .where('financing.status = :status', { status: Financing_1.FinancingStatus.ACTIVE })
            .andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('MIN(p.scheduled_date)')
                .from(Payment_1.Payment, 'p')
                .where('p.financing_id = financing.id')
                .andWhere('p.status = :pendingStatus')
                .getQuery();
            return `(${subQuery}) BETWEEN :today AND :futureDate`;
        }, { pendingStatus: Payment_1.PaymentStatus.PENDING, today, futureDate: futureDateStr })
            .getMany();
    }
    async getFinancingSummary() {
        const result = await this.repository
            .createQueryBuilder('financing')
            .select([
            'COUNT(CASE WHEN financing.status = :activeStatus THEN 1 END) as totalActive',
            'COALESCE(SUM(CASE WHEN financing.status = :activeStatus THEN financing.loan_amount ELSE 0 END), 0) as totalFinanced',
            'COALESCE(SUM(CASE WHEN financing.status = :activeStatus THEN financing.total_paid ELSE 0 END), 0) as totalPaid',
            'COALESCE(AVG(CASE WHEN financing.status = :activeStatus THEN financing.interest_rate ELSE NULL END), 0) as averageInterestRate'
        ])
            .setParameter('activeStatus', Financing_1.FinancingStatus.ACTIVE)
            .getRawOne();
        const overdueFinancings = await this.findOverdueFinancings();
        const totalOverdue = overdueFinancings.reduce((sum, financing) => {
            var _a;
            const overduePendingPayments = ((_a = financing.payments) === null || _a === void 0 ? void 0 : _a.filter(p => p.status === Payment_1.PaymentStatus.PENDING &&
                p.scheduledDate < new Date())) || [];
            return sum + overduePendingPayments.reduce((paymentSum, payment) => paymentSum + payment.scheduledAmount, 0);
        }, 0);
        return {
            totalActive: parseInt(result.totalActive) || 0,
            totalFinanced: parseFloat(result.totalFinanced) || 0,
            totalPaid: parseFloat(result.totalPaid) || 0,
            totalOverdue: parseFloat(totalOverdue.toString()) || 0,
            averageInterestRate: parseFloat(result.averageInterestRate) || 0
        };
    }
    async create(financingData) {
        const financing = this.repository.create(financingData);
        return await this.repository.save(financing);
    }
    async update(id, financingData) {
        await this.repository.update(id, financingData);
        return await this.findById(id);
    }
    async delete(id) {
        // Usar transacción para eliminar en cascada
        await this.repository.manager.transaction(async (transactionalEntityManager) => {
            // Primero eliminar todos los pagos asociados
            await transactionalEntityManager
                .createQueryBuilder()
                .delete()
                .from(Payment_1.Payment)
                .where('financing_id = :id', { id })
                .execute();
            // Luego eliminar el financiamiento
            await transactionalEntityManager
                .createQueryBuilder()
                .delete()
                .from(Financing_1.Financing)
                .where('id = :id', { id })
                .execute();
        });
    }
    async findByAssetTypeGrouped() {
        const result = await this.repository
            .createQueryBuilder('financing')
            .select([
            'financing.asset_type as assetType',
            'COUNT(*) as count',
            'COALESCE(SUM(financing.loan_amount), 0) as totalAmount'
        ])
            .where('financing.status = :status', { status: Financing_1.FinancingStatus.ACTIVE })
            .groupBy('financing.asset_type')
            .getRawMany();
        return result.map(item => ({
            assetType: item.assetType,
            count: parseInt(item.count),
            totalAmount: parseFloat(item.totalAmount)
        }));
    }
    async findExpiringThisMonth() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return await this.repository.find({
            where: {
                status: Financing_1.FinancingStatus.ACTIVE,
                endDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                }
            },
            relations: ['createdBy', 'payments']
        });
    }
}
exports.FinancingRepository = FinancingRepository;
