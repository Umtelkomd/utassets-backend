import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Financing, AssetType, FinancingStatus } from '../entity/Financing';
import { Payment, PaymentStatus } from '../entity/Payment';

export class FinancingRepository {
    private repository: Repository<Financing>;

    constructor() {
        this.repository = AppDataSource.getRepository(Financing);
    }

    async findAll(): Promise<Financing[]> {
        return await this.repository.find({
            relations: ['createdBy', 'payments'],
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: number): Promise<Financing | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['createdBy', 'payments', 'payments.recordedBy']
        });
    }

    async findByAsset(assetType: AssetType, assetId: number): Promise<Financing[]> {
        return await this.repository.find({
            where: { assetType, assetId },
            relations: ['createdBy', 'payments'],
            order: { createdAt: 'DESC' }
        });
    }

    async findActiveByAsset(assetType: AssetType, assetId: number): Promise<Financing | null> {
        return await this.repository.findOne({
            where: {
                assetType,
                assetId,
                status: FinancingStatus.ACTIVE
            },
            relations: ['createdBy', 'payments']
        });
    }

    async findByStatus(status: FinancingStatus): Promise<Financing[]> {
        return await this.repository.find({
            where: { status },
            relations: ['createdBy', 'payments'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOverdueFinancings(): Promise<Financing[]> {
        const today = new Date().toISOString().split('T')[0];

        return await this.repository
            .createQueryBuilder('financing')
            .leftJoinAndSelect('financing.payments', 'payment')
            .leftJoinAndSelect('financing.createdBy', 'createdBy')
            .where('financing.status = :status', { status: FinancingStatus.ACTIVE })
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('COUNT(*)')
                    .from(Payment, 'p')
                    .where('p.financing_id = financing.id')
                    .andWhere('p.status = :paidStatus')
                    .getQuery();
                return `(${subQuery}) < financing.term_months`;
            }, { paidStatus: PaymentStatus.PAID })
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('MIN(p.scheduled_date)')
                    .from(Payment, 'p')
                    .where('p.financing_id = financing.id')
                    .andWhere('p.status = :pendingStatus')
                    .getQuery();
                return `(${subQuery}) < :today`;
            }, { pendingStatus: PaymentStatus.PENDING, today })
            .getMany();
    }

    async findFinancingsDueSoon(days: number = 7): Promise<Financing[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const futureDateStr = futureDate.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        return await this.repository
            .createQueryBuilder('financing')
            .leftJoinAndSelect('financing.payments', 'payment')
            .leftJoinAndSelect('financing.createdBy', 'createdBy')
            .where('financing.status = :status', { status: FinancingStatus.ACTIVE })
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('MIN(p.scheduled_date)')
                    .from(Payment, 'p')
                    .where('p.financing_id = financing.id')
                    .andWhere('p.status = :pendingStatus')
                    .getQuery();
                return `(${subQuery}) BETWEEN :today AND :futureDate`;
            }, { pendingStatus: PaymentStatus.PENDING, today, futureDate: futureDateStr })
            .getMany();
    }

    async getFinancingSummary(): Promise<{
        totalActive: number;
        totalFinanced: number;
        totalPaid: number;
        totalOverdue: number;
        averageInterestRate: number;
    }> {
        const result = await this.repository
            .createQueryBuilder('financing')
            .select([
                'COUNT(CASE WHEN financing.status = :activeStatus THEN 1 END) as totalActive',
                'COALESCE(SUM(CASE WHEN financing.status = :activeStatus THEN financing.loan_amount ELSE 0 END), 0) as totalFinanced',
                'COALESCE(SUM(CASE WHEN financing.status = :activeStatus THEN financing.total_paid ELSE 0 END), 0) as totalPaid',
                'COALESCE(AVG(CASE WHEN financing.status = :activeStatus THEN financing.interest_rate ELSE NULL END), 0) as averageInterestRate'
            ])
            .setParameter('activeStatus', FinancingStatus.ACTIVE)
            .getRawOne();

        const overdueFinancings = await this.findOverdueFinancings();
        const totalOverdue = overdueFinancings.reduce((sum, financing) => {
            const overduePendingPayments = financing.payments?.filter(p =>
                p.status === PaymentStatus.PENDING &&
                p.scheduledDate < new Date()
            ) || [];
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

    async create(financingData: Partial<Financing>): Promise<Financing> {
        const financing = this.repository.create(financingData);
        return await this.repository.save(financing);
    }

    async update(id: number, financingData: Partial<Financing>): Promise<Financing | null> {
        await this.repository.update(id, financingData);
        return await this.findById(id);
    }

    async delete(id: number): Promise<void> {
        // Usar transacción para eliminar en cascada
        await this.repository.manager.transaction(async transactionalEntityManager => {
            // Primero eliminar todos los pagos asociados
            await transactionalEntityManager
                .createQueryBuilder()
                .delete()
                .from(Payment)
                .where('financing_id = :id', { id })
                .execute();

            // Luego eliminar el financiamiento
            await transactionalEntityManager
                .createQueryBuilder()
                .delete()
                .from(Financing)
                .where('id = :id', { id })
                .execute();
        });
    }

    async findByAssetTypeGrouped(): Promise<{ assetType: AssetType; count: number; totalAmount: number }[]> {
        const result = await this.repository
            .createQueryBuilder('financing')
            .select([
                'financing.asset_type as assetType',
                'COUNT(*) as count',
                'COALESCE(SUM(financing.loan_amount), 0) as totalAmount'
            ])
            .where('financing.status = :status', { status: FinancingStatus.ACTIVE })
            .groupBy('financing.asset_type')
            .getRawMany();

        return result.map(item => ({
            assetType: item.assetType,
            count: parseInt(item.count),
            totalAmount: parseFloat(item.totalAmount)
        }));
    }

    async findExpiringThisMonth(): Promise<Financing[]> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return await this.repository.find({
            where: {
                status: FinancingStatus.ACTIVE,
                endDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth
                } as any
            },
            relations: ['createdBy', 'payments']
        });
    }
} 