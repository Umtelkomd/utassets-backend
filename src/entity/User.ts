import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Vehicle } from './Vehicle';
import { Inventory } from './Inventory';

export enum UserRole {
    ADMIN = 'administrador',
    TECH = 'tecnico'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    username: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column()
    password: string; // Se almacenará hasheada

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.TECH
    })
    role: UserRole;

    @Column({ length: 100 })
    fullName: string;

    @Column({ nullable: true, length: 20 })
    phone?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true, length: 255 })
    lastLoginIp?: string;

    @Column({ nullable: true })
    lastLoginDate?: Date;

    @Column({ name: 'image_path', type: 'varchar', nullable: true })
    imagePath: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Vehicle, vehicle => vehicle.responsibleUsers)
    vehicles: Vehicle[];

    @ManyToMany(() => Inventory, inventory => inventory.responsibleUsers)
    inventories: Inventory[];
} 