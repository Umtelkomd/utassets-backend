import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './Inventory';
import { Vehicle } from './Vehicle';
import { Housing } from './Housing';

export enum RentalType {
    ITEM = 'item',
    VEHICLE = 'vehicle',
    HOUSING = 'housing'
}

@Entity('rental')
export class Rental {
    @PrimaryGeneratedColumn({ name: 'id' })
    id!: number;

    @Column({ name: 'rental_type', type: 'enum', enum: RentalType })
    type!: RentalType;

    @Column({ name: 'inventory_id', nullable: true })
    inventoryId?: number;

    @Column({ name: 'vehicle_id', nullable: true })
    vehicleId?: number;

    @Column({ name: 'housing_id', nullable: true })
    housingId?: number;

    @ManyToOne(() => Inventory, { eager: true, nullable: true })
    @JoinColumn({ name: 'inventory_id' })
    inventory?: Inventory;

    @ManyToOne(() => Vehicle, { eager: true, nullable: true })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle?: Vehicle;

    @ManyToOne(() => Housing, { eager: true, nullable: true })
    @JoinColumn({ name: 'housing_id' })
    housing?: Housing;

    @Column({ name: 'start_date', type: 'date' })
    startDate!: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate!: Date;

    @Column({ name: 'days', type: 'int' })
    days!: number;

    @Column({ name: 'daily_cost', type: 'decimal', precision: 10, scale: 2 })
    dailyCost!: number;

    @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2 })
    total!: number;

    @Column({ name: 'rental_comments', type: 'text', nullable: true })
    comments?: string;

    @Column({ name: 'rental_metadata', type: 'json', nullable: true })
    metadata?: {
        peopleCount?: number;
        dealerName?: string;
        dealerAddress?: string;
        dealerPhone?: string;
        mileage?: number;
        guestCount?: number;
        baseGuestCount?: number;
        amenities?: string[];
        rules?: string;
        address?: string;
        bedrooms?: number;
        bathrooms?: number;
    };

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
} 