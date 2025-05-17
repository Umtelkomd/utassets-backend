import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './Inventory';

@Entity('rental')
export class Rental {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'object_id' })
    objectId!: number;

    @ManyToOne(() => Inventory, { eager: true })
    @JoinColumn({ name: 'object_id' })
    object!: Inventory;

    @Column({ name: 'start_date', type: 'date' })
    startDate!: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate!: Date;

    @Column({ name: 'daily_cost', type: 'decimal', precision: 10, scale: 2 })
    dailyCost!: number;

    @Column({ name: 'people_count', type: 'int', nullable: true })
    peopleCount!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
} 