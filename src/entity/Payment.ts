import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Financing } from './Financing';
import { User } from './User';

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    OVERDUE = 'overdue',
    PARTIAL = 'partial'
}

@Entity({ name: 'payment' })
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Financing, financing => financing.payments)
    @JoinColumn({ name: 'financing_id' })
    financing: Financing;

    @Column({ name: 'payment_number', type: 'int' })
    paymentNumber: number;

    @Column({ name: 'scheduled_date', type: 'date' })
    scheduledDate: Date;

    @Column({ name: 'scheduled_amount', type: 'decimal', precision: 12, scale: 2 })
    scheduledAmount: number;

    @Column({ name: 'principal_amount', type: 'decimal', precision: 12, scale: 2 })
    principalAmount: number;

    @Column({ name: 'interest_amount', type: 'decimal', precision: 12, scale: 2 })
    interestAmount: number;

    @Column({ name: 'remaining_balance', type: 'decimal', precision: 12, scale: 2 })
    remainingBalance: number;

    @Column({ name: 'actual_date', type: 'date', nullable: true })
    actualDate: Date | null;

    @Column({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
    actualAmount: number | null;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
    paymentMethod: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    reference: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'recorded_by' })
    recordedBy: User | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 