import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("fiber_work_orders")
export class FiberWorkOrder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  orderNumber: string;

  @Column({ type: "varchar", length: 255 })
  projectName: string;

  @Column({ type: "varchar", length: 255 })
  clientName: string;

  @Column({ type: "varchar", length: 50, default: "Pendiente" })
  status: string; // Pendiente, En Progreso, Completada, Cancelada, Facturada

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @Column({ type: "varchar", length: 50 })
  executorType: string; // internal, subcontractor

  // Activities as JSON
  @Column({ type: "json", nullable: true })
  activities: Array<{ activityId: string; quantity: number }>;

  // Daily Logs as JSON (for internal execution)
  @Column({ type: "json", nullable: true })
  dailyLogs: Array<{
    date: string;
    time: Array<{ technicianId: string; hours: number }>;
    equipment: Array<{ equipmentId: string; hours: number }>;
    materials: Array<{ materialId: string; quantity: number }>;
  }>;

  // Subcontractor data (for subcontractor execution)
  @Column({ type: "varchar", length: 255, nullable: true })
  subcontractorId: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  subcontractorCost: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  billedAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
