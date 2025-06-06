import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum VacationType {
    REST_DAY = 'rest_day',
    EXTRA_WORK_DAY = 'extra_work_day'
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

    @Column({ default: false })
    isApproved: boolean;

    @Column({ type: 'date', nullable: true })
    approvedDate?: Date;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by' })
    approvedBy?: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 