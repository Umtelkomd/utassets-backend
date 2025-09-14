import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Comment } from './Comment';

export enum ReportStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum ReportType {
    INVENTORY = 'INVENTORY',
    VEHICLES = 'VEHICLES',
    OTHER = 'OTHER'
}

@Entity()
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'enum',
        enum: ReportType,
        default: ReportType.OTHER
    })
    type: ReportType;

    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING
    })
    status: ReportStatus;

    @ManyToOne(() => User, user => user.reports)
    user: User;

    @OneToMany(() => Comment, comment => comment.report)
    comments: Comment[];
} 