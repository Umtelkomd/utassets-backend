import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { calculateWorkingDays } from '../utils/dateUtils';

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
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

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

    @Column({ name: 'working_days', type: 'int', default: 0 })
    workingDays: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Método auxiliar para calcular el número de días laborables en el rango (excluyendo fines de semana)
    get dayCount(): number {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        return calculateWorkingDays(start, end);
    }

    // Método auxiliar para verificar si una fecha está dentro del rango
    containsDate(date: Date): boolean {
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
    getAllDatesInRange(): Date[] {
        const dates: Date[] = [];
        const current = new Date(this.startDate);
        const end = new Date(this.endDate);

        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }
} 