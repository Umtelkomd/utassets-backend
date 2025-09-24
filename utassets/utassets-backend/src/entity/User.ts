import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { Vehicle } from './Vehicle';
import { Inventory } from './Inventory';
import { Report } from './Report';
import { Comment } from './Comment';
import { Vacation } from './Vacation';

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

    // Campos adicionales para facilitar el registro desde el frontend
    firstName?: string;
    lastName?: string;

    @Column({ nullable: true, length: 20 })
    phone?: string;

    @Column({ type: 'date', nullable: true })
    birthDate?: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true, length: 255 })
    lastLoginIp?: string;

    @Column({ nullable: true })
    lastLoginDate?: Date;

    @Column({ name: 'photo_url', type: 'varchar', nullable: true })
    photoUrl: string | null;

    @Column({ name: 'photo_public_id', type: 'varchar', nullable: true })
    photoPublicId: string | null;

    @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
    googleId?: string;

    @Column({ name: 'is_email_confirmed', default: false })
    isEmailConfirmed: boolean;

    @Column({ name: 'email_confirmation_token', type: 'varchar', nullable: true })
    emailConfirmationToken?: string;

    @Column({ name: 'email_confirmation_token_expires', type: 'timestamp', nullable: true })
    emailConfirmationTokenExpires?: Date;

    @Column({ name: 'password_reset_token', type: 'varchar', nullable: true })
    passwordResetToken?: string;

    @Column({ name: 'password_reset_token_expires', type: 'timestamp', nullable: true })
    passwordResetTokenExpires?: Date;

    @Column({ name: 'vacation_days', type: 'int', default: 25 })
    vacationDays: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Vehicle, vehicle => vehicle.responsibleUsers)
    vehicles: Vehicle[];

    @ManyToMany(() => Inventory, inventory => inventory.responsibleUsers)
    inventories: Inventory[];

    @OneToMany(() => Report, report => report.user)
    reports: Report[];

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];

    @OneToMany(() => Vacation, vacation => vacation.user)
    vacations: Vacation[];
} 