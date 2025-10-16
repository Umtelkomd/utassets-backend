import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("fiber_activities")
export class FiberActivity {
  @PrimaryColumn({ type: "varchar", length: 50 })
  id: string;

  @Column({ type: "varchar", length: 255 })
  description: string;

  @Column({ type: "varchar", length: 100 })
  unit: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
