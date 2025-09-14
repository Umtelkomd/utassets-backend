import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

@Entity({ name: 'inventory' })
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'item_name', type: 'varchar' })
    itemName: string;

    @Column({ name: 'item_code', type: 'varchar', unique: true })
    itemCode: string;

    @Column({ type: 'varchar' })
    category: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'varchar' })
    condition: string;

    @Column({ type: 'varchar' })
    location: string;

    @Column({ name: 'acquisition_date', type: 'date', nullable: true })
    acquisitionDate: Date | null;

    @Column({ name: 'last_maintenance_date', type: 'date', nullable: true })
    lastMaintenanceDate: Date | null;

    @Column({ name: 'next_maintenance_date', type: 'date', nullable: true })
    nextMaintenanceDate: Date | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'varchar', nullable: true })
    photoUrl!: string | null;

    @Column({ type: 'varchar', nullable: true })
    photoPublicId!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToMany(() => User, user => user.inventories)
    @JoinTable({
        name: 'inventory_responsibles',
        joinColumn: {
            name: 'inventory_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    responsibleUsers: User[];
} 