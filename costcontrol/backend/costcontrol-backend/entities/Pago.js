require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.Pago = new EntitySchema({
  name: 'Pago',
  tableName: 'pagos',
  columns: {
    id: { type: Number, primary: true, generated: true },
    fecha: { type: Date },
    proveedor: { type: String },
    concepto: { type: String },
    monto: { type: 'decimal', precision: 10, scale: 2 },
    centroCostoId: { type: Number },
    metodoPago: { type: String },
    referencia: { type: String, nullable: true },
    comentarios: { type: String, nullable: true },
    // User system fields
    status: { type: String, default: 'pending' }, // 'pending', 'approved', 'deferred'
    createdByUserId: { type: Number, nullable: true }, // ID of user who created the payment
    reviewedByUserId: { type: Number, nullable: true }, // ID of user who reviewed the payment
    reviewDate: { type: Date, nullable: true }, // Date of approval/deferral
    reviewComments: { type: String, nullable: true }, // Reviewer's comments
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true },
  },
}); 