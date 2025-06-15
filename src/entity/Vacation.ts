import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum VacationType {
    REST_DAY = 'rest_day',
    EXTRA_WORK_DAY = 'extra_work_day'
}

export enum VacationStatus {
    PENDING = 'pending',           // Pendiente de aprobación
    FIRST_APPROVED = 'first_approved',  // Aprobada por el primer administrador
    FULLY_APPROVED = 'fully_approved',  // Aprobada por ambos administradores
    REJECTED = 'rejected'          // Rechazada
}

@Entity()
export class Vacation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.vacations)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({
        type: 'enum',
        enum: VacationType
    })
    type: VacationType;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: VacationStatus,
        default: VacationStatus.PENDING
    })
    status: VacationStatus;

    @Column({ default: false })
    isApproved: boolean;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'first_approved_by' })
    firstApprovedBy?: User;

    @Column({ type: 'timestamp', nullable: true })
    firstApprovedDate?: Date;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'second_approved_by' })
    secondApprovedBy?: User;

    @Column({ type: 'timestamp', nullable: true })
    secondApprovedDate?: Date;

    @Column({ type: 'date', nullable: true })
    approvedDate?: Date;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by' })
    approvedBy?: User;

    @Column({ type: 'text', nullable: true })
    rejectionReason?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'rejected_by' })
    rejectedBy?: User;

    @Column({ type: 'timestamp', nullable: true })
    rejectedDate?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 