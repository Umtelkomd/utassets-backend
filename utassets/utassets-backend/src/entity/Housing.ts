import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('housing')
export class Housing {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    address!: string;

    @Column()
    bedrooms!: number;

    @Column()
    bathrooms!: number;

    @Column({ type: 'decimal', precision: 8, scale: 2 })
    squareMeters!: number;

    @Column({ type: 'boolean', default: true })
    isAvailable!: boolean;

    @Column({ type: 'simple-array', nullable: true })
    amenities!: string[];

    @Column({ type: 'text', nullable: true })
    rules!: string;

    @Column({ type: 'varchar', nullable: true })
    photoUrl!: string | null;

    @Column({ type: 'varchar', nullable: true })
    photoPublicId!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
} 