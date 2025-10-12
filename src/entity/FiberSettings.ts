import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("fiber_settings")
export class FiberSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 25 })
  indirectCostRate: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 10 })
  subcontractorIndirectCostRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
