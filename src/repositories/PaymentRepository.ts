import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Payment, PaymentStatus } from '../entity/Payment';

export class PaymentRepository {
    private repository: Repository<Payment>;

    constructor() {
        this.repository = AppDataSource.getRepository(Payment);
    }

    async findAll(): Promise<Payment[]> {
        return await this.repository.find({
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'DESC' }
        });
    }

    async findById(id: number): Promise<Payment | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['financing', 'recordedBy']
        });
    }

    async findByFinancing(financingId: number): Promise<Payment[]> {
        return await this.repository.find({
            where: { financing: { id: financingId } },
            relations: ['recordedBy'],
            order: { paymentNumber: 'ASC' }
        });
    }

    async findByStatus(status: PaymentStatus): Promise<Payment[]> {
        return await this.repository.find({
            where: { status },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async findOverduePayments(): Promise<Payment[]> {
        const today = new Date();
        return await this.repository.find({
            where: {
                status: PaymentStatus.PENDING,
                scheduledDate: {
                    $lt: today
                } as any
            },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async findUpcomingPayments(days: number = 7): Promise<Payment[]> {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return await this.repository.find({
            where: {
                status: PaymentStatus.PENDING,
                scheduledDate: {
                    $gte: today,
                    $lte: futureDate
                } as any
            },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
        return await this.repository.find({
            where: {
                scheduledDate: {
                    $gte: startDate,
                    $lte: endDate
                } as any
            },
            relations: ['financing', 'recordedBy'],
            order: { scheduledDate: 'ASC' }
        });
    }

    async getPaymentSummaryByFinancing(financingId: number): Promise<{
        totalPayments: number;
        paidPayments: number;
        pendingPayments: number;
        overduePayments: number;
        totalPaid: number;
        totalPending: number;
        totalOverdue: number;
    }> {
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
            .setParameter('paidStatus', PaymentStatus.PAID)
            .setParameter('pendingStatus', PaymentStatus.PENDING)
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

    async getNextPaymentByFinancing(financingId: number): Promise<Payment | null> {
        return await this.repository.findOne({
            where: {
                financing: { id: financingId },
                status: PaymentStatus.PENDING
            },
            order: { paymentNumber: 'ASC' }
        });
    }

    async create(paymentData: Partial<Payment>): Promise<Payment> {
        const payment = this.repository.create(paymentData);
        return await this.repository.save(payment);
    }

    async createMany(paymentsData: Partial<Payment>[]): Promise<Payment[]> {
        const payments = this.repository.create(paymentsData);
        return await this.repository.save(payments);
    }

    async update(id: number, paymentData: Partial<Payment>): Promise<Payment | null> {
        await this.repository.update(id, paymentData);
        return await this.findById(id);
    }

    async markAsPaid(id: number, actualAmount: number, actualDate: Date, recordedBy: any, paymentMethod?: string, reference?: string): Promise<Payment | null> {
        await this.repository.update(id, {
            status: PaymentStatus.PAID,
            actualAmount,
            actualDate,
            recordedBy,
            paymentMethod,
            reference,
            updatedAt: new Date()
        });
        return await this.findById(id);
    }

    async markAsOverdue(paymentIds: number[]): Promise<void> {
        if (paymentIds.length === 0) return;

        const today = new Date();
        await this.repository
            .createQueryBuilder()
            .update(Payment)
            .set({
                status: PaymentStatus.OVERDUE,
                updatedAt: today
            })
            .where('id IN (:...ids)', { ids: paymentIds })
            .andWhere('status = :pendingStatus', { pendingStatus: PaymentStatus.PENDING })
            .andWhere('scheduled_date < :today', { today: today.toISOString().split('T')[0] })
            .execute();
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async deleteByFinancing(financingId: number): Promise<void> {
        await this.repository.delete({ financing: { id: financingId } });
    }

    async getMonthlyPaymentSummary(year: number, month: number): Promise<{
        totalScheduled: number;
        totalPaid: number;
        totalOverdue: number;
        paymentsCount: number;
    }> {
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
            .setParameter('paidStatus', PaymentStatus.PAID)
            .setParameter('overdueStatus', PaymentStatus.OVERDUE)
            .getRawOne();

        return {
            totalScheduled: parseFloat(result.totalScheduled) || 0,
            totalPaid: parseFloat(result.totalPaid) || 0,
            totalOverdue: parseFloat(result.totalOverdue) || 0,
            paymentsCount: parseInt(result.paymentsCount) || 0
        };
    }
} 