import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

// Enum para el estado del vehículo
export enum VehicleStatus {
    OPERATIVO = 'Operativo',
    EN_REPARACION = 'En Reparación',
    FUERA_DE_SERVICIO = 'Fuera de Servicio'
}

// Enum para el tipo de combustible
export enum FuelType {
    GASOLINA = 'Gasolina',
    DIESEL = 'Diésel',
    ELECTRICO = 'Eléctrico',
    HIBRIDO = 'Híbrido'
}

@Entity({ name: 'vehicle' })
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'license_plate', type: 'varchar', length: 20, unique: true })
    licensePlate: string;

    @Column({ type: 'varchar', length: 50 })
    brand: string;

    @Column({ type: 'varchar', length: 50 })
    model: string;

    @Column({ type: 'int' })
    year: number;

    @Column({ type: 'varchar', length: 30, nullable: true })
    color: string | null;

    @Column({
        name: 'vehicle_status',
        type: 'enum',
        enum: VehicleStatus,
        default: VehicleStatus.OPERATIVO
    })
    vehicleStatus: VehicleStatus;

    @Column({ type: 'int', nullable: true })
    mileage: number | null;

    @Column({
        name: 'fuel_type',
        type: 'enum',
        enum: FuelType
    })
    fuelType: FuelType;

    @Column({ name: 'insurance_expiry_date', type: 'date', nullable: true })
    insuranceExpiryDate: Date | null;

    @Column({ name: 'technical_revision_expiry_date', type: 'date', nullable: true })
    technicalRevisionExpiryDate: Date | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'photo_url', type: 'varchar', nullable: true })
    photoUrl: string | null;

    @Column({ name: 'photo_public_id', type: 'varchar', nullable: true })
    photoPublicId: string | null;

    @ManyToMany(() => User, user => user.vehicles)
    @JoinTable({
        name: 'vehicle_responsibles',
        joinColumn: {
            name: 'vehicle_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    responsibleUsers: User[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}