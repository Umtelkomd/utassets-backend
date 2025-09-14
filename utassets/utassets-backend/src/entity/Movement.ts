import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './Inventory';

@Entity({ name: 'inventory_movements' })
export class Movement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'inventory_id' })
    inventoryId: number;

    @Column({ name: 'movement_type', type: 'varchar' })
    movementType: string;

    @Column({ name: 'from_location', type: 'varchar', nullable: true })
    fromLocation: string | null;

    @Column({ name: 'to_location', type: 'varchar', nullable: true })
    toLocation: string | null;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ name: 'expected_return_date', type: 'date', nullable: true })
    expectedReturnDate: Date | null;

    @Column({ name: 'actual_return_date', type: 'date', nullable: true })
    actualReturnDate: Date | null;

    @Column({ name: 'person_responsible', type: 'varchar', nullable: true })
    personResponsible: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @CreateDateColumn({ name: 'movement_date' })
    movementDate: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Inventory)
    @JoinColumn({ name: 'inventory_id' })
    inventory: Inventory;
} 