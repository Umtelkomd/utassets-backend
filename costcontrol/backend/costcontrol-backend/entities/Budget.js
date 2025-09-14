require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.Budget = new EntitySchema({
  name: 'Budget',
  tableName: 'budgets',
  columns: {
    id: { type: Number, primary: true, generated: true },
    centroCostoId: { type: Number },
    proyectoId: { type: Number, nullable: true },
    periodo: { type: String, length: 7 }, // 'YYYY-MM' format for monthly budgets
    year: { type: Number }, // For easier querying by year
    month: { type: Number }, // For easier querying by month (1-12)
    montoAprobado: { type: 'decimal', precision: 12, scale: 2 },
    montoGastado: { type: 'decimal', precision: 12, scale: 2, default: 0 },
    montoComprometido: { type: 'decimal', precision: 12, scale: 2, default: 0 }, // Pending approvals
    estado: { type: String, length: 20, default: 'active' }, // 'active', 'locked', 'expired', 'draft'
    notas: { type: String, length: 1000, nullable: true },
    creadoPorUserId: { type: Number, nullable: true },
    aprobadoPorUserId: { type: Number, nullable: true },
    fechaAprobacion: { type: 'datetime', nullable: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true }
  },
  relations: {
    centroCosto: {
      type: 'many-to-one',
      target: 'CentroCosto',
      joinColumn: { name: 'centroCostoId' }
    },
    proyecto: {
      type: 'many-to-one',
      target: 'Proyecto',
      joinColumn: { name: 'proyectoId' }
    }
  },
  indexes: [
    { name: 'idx_budget_centro_periodo', columns: ['centroCostoId', 'periodo'], unique: true },
    { name: 'idx_budget_proyecto_periodo', columns: ['proyectoId', 'periodo'] },
    { name: 'idx_budget_year_month', columns: ['year', 'month'] },
    { name: 'idx_budget_estado', columns: ['estado'] }
  ]
});