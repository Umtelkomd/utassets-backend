import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Inventory } from './Inventory';

export enum RentalType {
    ITEM = 'item',
    VEHICLE = 'vehicle',
    HOUSING = 'housing'
}

@Entity('rental')
export class Rental {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'enum', enum: RentalType, default: RentalType.ITEM })
    type!: RentalType;

    // ID del objeto relacionado (puede ser item, vehicle o housing)
    @Column({ name: 'object_id' })
    objectId!: number;

    @ManyToOne(() => Inventory, { eager: true })
    @JoinColumn({ name: 'object_id' })
    object!: Inventory;

    // Campos comunes a todos los tipos de alquiler
    @Column({ name: 'start_date', type: 'date' })
    startDate!: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate!: Date;

    @Column({ name: 'daily_cost', type: 'decimal', precision: 10, scale: 2 })
    dailyCost!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total!: number;

    // Campos específicos para alquiler de artículos
    @Column({ name: 'people_count', type: 'int', nullable: true })
    peopleCount?: number | null;

    // Campos específicos para alquiler de vehículos
    @Column({ name: 'dealer_name', nullable: true })
    dealerName?: string;

    @Column({ name: 'dealer_address', type: 'text', nullable: true })
    dealerAddress?: string;

    @Column({ name: 'dealer_phone', nullable: true })
    dealerPhone?: string;

    // Campos específicos para alquiler de viviendas
    @Column({ name: 'guest_count', type: 'int', nullable: true })
    guestCount?: number;

    @Column({ name: 'address', type: 'text', nullable: true })
    address?: string;

    @Column({ name: 'bedrooms', type: 'int', nullable: true })
    bedrooms?: number;

    @Column({ name: 'bathrooms', type: 'int', nullable: true })
    bathrooms?: number;

    @Column({ name: 'amenities', type: 'simple-array', nullable: true })
    amenities?: string[];

    @Column({ name: 'rules', type: 'text', nullable: true })
    rules?: string;

    // Campos comunes
    @Column({ name: 'comments', type: 'text', nullable: true })
    comments?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    validateDates() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
    }
} 