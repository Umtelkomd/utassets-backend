"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const data_source_1 = require("../config/data-source");
const Payment_1 = require("../entity/Payment");
class PaymentRepository {
    constructor() {
        this.repository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    }
    async findAll() {
        return await this.repository.find({
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'DESC' }
        });
    }
    async findById(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ['financing', 'recordedBy']
        });
    }
    async findByFinancing(financingId) {
        return await this.repository.find({
            where: { financing: { id: financingId } },
            relations: ['recordedBy'],
            order: { paymentNumber: 'ASC' }
        });
    }
    async findByStatus(status) {
        return await this.repository.find({
            where: { status },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }
    async findOverduePayments() {
        const today = new Date();
        return await this.repository.find({
            where: {
                status: Payment_1.PaymentStatus.PENDING,
                scheduledDate: {
                    $lt: today
                }
            },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }
    async findUpcomingPayments(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        return await this.repository.find({
            where: {
                status: Payment_1.PaymentStatus.PENDING,
                scheduledDate: {
                    $gte: today,
                    $lte: futureDate
                }
            },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }
    async findByDateRange(startDate, endDate) {
        return await this.repository.find({
            where: {
                scheduledDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }
    async getPaymentSummaryByFinancing(financingId) {
        const result = await this.repository
            .createQueryBuilder('payment')
            .select([
            'COUNT(*) as totalPayments',
            'COUNT(CASE WHEN payment.status = :paidStatus THEN 1 END) as paidPayments',
            'COUNT(CASE WHEN payment.status = :pendingStatus THEN 1 END) as pendingPayments',
            'COUNT(CASE WHEN payment.status = :pendingStatus AND payment.scheduled_date < :today THEN 1 END) as overduePayments',
            'COALESCE(SUM(CASE WHEN payment.status = :paidStatus THEN payment.actual_amount ELSE 0 END), 0) as totalPaid',
            'COALESCE(SUM(CASE WHEN payment.status = :pendingStatus THEN payment.scheduled_amount ELSE 0 END), 0) as totalPending',
            'COALESCE(SUM(CASE WHEN payment.status = :pendingStatus AND payment.scheduled_date < :today THEN payment.scheduled_amount ELSE 0 END), 0) as totalOverdue'
        ])
            .where('payment.financing_id = :financingId', { financingId })
            .setParameter('paidStatus', Payment_1.PaymentStatus.PAID)
            .setParameter('pendingStatus', Payment_1.PaymentStatus.PENDING)
            .setParameter('today', new Date())
            .getRawOne();
        return {
            totalPayments: parseInt(result.totalPayments) || 0,
            paidPayments: parseInt(result.paidPayments) || 0,
            pendingPayments: parseInt(result.pendingPayments) || 0,
            overduePayments: parseInt(result.overduePayments) || 0,
            totalPaid: parseFloat(result.totalPaid) || 0,
            totalPending: parseFloat(result.totalPending) || 0,
            totalOverdue: parseFloat(result.totalOverdue) || 0
        };
    }
    async getNextPaymentByFinancing(financingId) {
        return await this.repository.findOne({
            where: {
                financing: { id: financingId },
                status: Payment_1.PaymentStatus.PENDING
            },
            order: { paymentNumber: 'ASC' }
        });
    }
    async create(paymentData) {
        const payment = this.repository.create(paymentData);
        return await this.repository.save(payment);
    }
    async createMany(paymentsData) {
        const payments = this.repository.create(paymentsData);
        return await this.repository.save(payments);
    }
    async update(id, paymentData) {
        await this.repository.update(id, paymentData);
        return await this.findById(id);
    }
    async markAsPaid(id, actualAmount, actualDate, recordedBy, paymentMethod, reference) {
        await this.repository.update(id, {
            status: Payment_1.PaymentStatus.PAID,
            actualAmount,
            actualDate,
            recordedBy,
            paymentMethod,
            reference,
            updatedAt: new Date()
        });
        return await this.findById(id);
    }
    async markAsOverdue(paymentIds) {
        if (paymentIds.length === 0)
            return;
        const today = new Date();
        await this.repository
            .createQueryBuilder()
            .update(Payment_1.Payment)
            .set({
            status: Payment_1.PaymentStatus.OVERDUE,
            updatedAt: today
        })
            .where('id IN (:...ids)', { ids: paymentIds })
            .andWhere('status = :pendingStatus', { pendingStatus: Payment_1.PaymentStatus.PENDING })
            .andWhere('scheduled_date < :today', { today: today.toISOString().split('T')[0] })
            .execute();
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async deleteByFinancing(financingId) {
        await this.repository.delete({ financing: { id: financingId } });
    }
    async getMonthlyPaymentSummary(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const result = await this.repository
            .createQueryBuilder('payment')
            .select([
            'COALESCE(SUM(payment.scheduled_amount), 0) as totalScheduled',
            'COALESCE(SUM(CASE WHEN payment.status = :paidStatus THEN payment.actual_amount ELSE 0 END), 0) as totalPaid',
            'COALESCE(SUM(CASE WHEN payment.status = :overdueStatus THEN payment.scheduled_amount ELSE 0 END), 0) as totalOverdue',
            'COUNT(*) as paymentsCount'
        ])
            .where('payment.scheduled_date BETWEEN :startDate AND :endDate', {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        })
            .setParameter('paidStatus', Payment_1.PaymentStatus.PAID)
            .setParameter('overdueStatus', Payment_1.PaymentStatus.OVERDUE)
            .getRawOne();
        return {
            totalScheduled: parseFloat(result.totalScheduled) || 0,
            totalPaid: parseFloat(result.totalPaid) || 0,
            totalOverdue: parseFloat(result.totalOverdue) || 0,
            paymentsCount: parseInt(result.paymentsCount) || 0
        };
    }
}
exports.PaymentRepository = PaymentRepository;
