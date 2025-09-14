require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.ApprovalWorkflow = new EntitySchema({
  name: 'ApprovalWorkflow',
  tableName: 'approval_workflows',
  columns: {
    id: { type: Number, primary: true, generated: true },
    pagoId: { type: Number },
    currentStep: { type: Number, default: 1 }, // Current approval step
    totalSteps: { type: Number, default: 1 }, // Total steps required
    estado: { type: String, length: 20, default: 'pending' }, // 'pending', 'approved', 'rejected', 'cancelled'
    prioridad: { type: String, length: 10, default: 'normal' }, // 'low', 'normal', 'high', 'urgent'
    fechaLimite: { type: 'datetime', nullable: true }, // Deadline for approval
    razonUrgencia: { type: String, length: 500, nullable: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true }
  },
  relations: {
    pago: {
      type: 'one-to-one',
      target: 'Pago',
      joinColumn: { name: 'pagoId' }
    },
    steps: {
      type: 'one-to-many',
      target: 'ApprovalStep',
      inverseSide: 'workflow'
    }
  },
  indexes: [
    { name: 'idx_workflow_pago', columns: ['pagoId'], unique: true },
    { name: 'idx_workflow_estado', columns: ['estado'] },
    { name: 'idx_workflow_prioridad', columns: ['prioridad'] },
    { name: 'idx_workflow_fecha_limite', columns: ['fechaLimite'] }
  ]
});

module.exports.ApprovalStep = new EntitySchema({
  name: 'ApprovalStep',
  tableName: 'approval_steps',
  columns: {
    id: { type: Number, primary: true, generated: true },
    workflowId: { type: Number },
    stepNumber: { type: Number }, // 1, 2, 3, etc.
    approverUserId: { type: Number },
    approverRole: { type: String, length: 50 }, // 'supervisor', 'manager', 'finance', 'cfo'
    estado: { type: String, length: 20, default: 'pending' }, // 'pending', 'approved', 'rejected', 'skipped'
    comentarios: { type: String, length: 1000, nullable: true },
    fechaAprobacion: { type: 'datetime', nullable: true },
    tiempoRespuesta: { type: Number, nullable: true }, // Minutes taken to respond
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true }
  },
  relations: {
    workflow: {
      type: 'many-to-one',
      target: 'ApprovalWorkflow',
      joinColumn: { name: 'workflowId' },
      inverseSide: 'steps'
    }
  },
  indexes: [
    { name: 'idx_step_workflow', columns: ['workflowId'] },
    { name: 'idx_step_approver', columns: ['approverUserId'] },
    { name: 'idx_step_estado', columns: ['estado'] },
    { name: 'idx_step_number', columns: ['stepNumber'] }
  ]
});