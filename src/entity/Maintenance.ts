import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './Inventory';

@Entity({ name: 'maintenance_history' })
export class Maintenance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'inventory_id' })
    inventoryId: number;

    @Column({ name: 'maintenance_date', type: 'date' })
    maintenanceDate: Date;

    @Column({ name: 'maintenance_type', type: 'varchar' })
    maintenanceType: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'performed_by', type: 'varchar', nullable: true })
    performedBy: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Inventory)
    @JoinColumn({ name: 'inventory_id' })
    inventory: Inventory;
} 