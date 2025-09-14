import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Payment } from './Payment';

export enum AssetType {
    VEHICLE = 'vehicle',
    INVENTORY = 'inventory',
    HOUSING = 'housing'
}

export enum FinancingStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    DEFAULTED = 'defaulted',
    CANCELLED = 'cancelled'
}

@Entity({ name: 'financing' })
export class Financing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'asset_type',
        type: 'enum',
        enum: AssetType
    })
    assetType: AssetType;

    @Column({ name: 'asset_id', type: 'int' })
    assetId: number;

    @Column({ name: 'loan_amount', type: 'decimal', precision: 12, scale: 2 })
    loanAmount: number;

    @Column({ name: 'down_payment', type: 'decimal', precision: 12, scale: 2, default: 0 })
    downPayment: number;

    @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2 })
    interestRate: number;

    @Column({ name: 'term_months', type: 'int' })
    termMonths: number;

    @Column({ name: 'monthly_payment', type: 'decimal', precision: 12, scale: 2 })
    monthlyPayment: number;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: FinancingStatus,
        default: FinancingStatus.ACTIVE
    })
    status: FinancingStatus;

    @Column({ type: 'varchar', length: 100 })
    lender: string;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'current_balance', type: 'decimal', precision: 12, scale: 2 })
    currentBalance: number;

    @Column({ name: 'total_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalPaid: number;

    @Column({ name: 'payments_made', type: 'int', default: 0 })
    paymentsMade: number;

    @Column({ name: 'asset_name', type: 'varchar', length: 255, nullable: true })
    assetName: string | null;

    @Column({ name: 'asset_reference', type: 'varchar', length: 100, nullable: true })
    assetReference: string | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @OneToMany(() => Payment, payment => payment.financing, { cascade: true })
    payments: Payment[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 