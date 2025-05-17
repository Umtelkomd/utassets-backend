import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './Inventory';

@Entity()
export class Rental {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'object_id' })
    objectId!: number;

    @ManyToOne(() => Inventory)
    @JoinColumn({ name: 'object_id' })
    object!: Inventory;

    @Column({ type: 'date' })
    startDate!: Date;

    @Column({ type: 'date' })
    endDate!: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    dailyCost!: number;

    @Column({ type: 'int', nullable: true })
    peopleCount!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 