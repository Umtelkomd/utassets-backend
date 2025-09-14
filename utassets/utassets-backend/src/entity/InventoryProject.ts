import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './Inventory';
import { Project } from './Project';

@Entity({ name: 'inventory_projects' })
export class InventoryProject {
    @PrimaryColumn({ name: 'inventory_id' })
    inventoryId: number;

    @PrimaryColumn({ name: 'project_id' })
    projectId: number;

    @PrimaryColumn({ name: 'assigned_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    assignedDate: Date;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'returned_date', type: 'timestamp', nullable: true })
    returnedDate: Date | null;

    @ManyToOne(() => Inventory)
    @JoinColumn({ name: 'inventory_id' })
    inventory: Inventory;

    @ManyToOne(() => Project)
    @JoinColumn({ name: 'project_id' })
    project: Project;
} 