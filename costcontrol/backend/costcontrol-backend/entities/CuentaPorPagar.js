require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.CuentaPorPagar = new EntitySchema({
  name: 'CuentaPorPagar',
  tableName: 'cuentas_por_pagar',
  columns: {
    id: { type: Number, primary: true, generated: true },
    fecha: { type: Date },
    fechaVencimiento: { type: Date },
    proveedor: { type: String },
    concepto: { type: String },
    monto: { type: 'decimal', precision: 10, scale: 2 },
    centroCostoId: { type: Number },
    estado: { type: String },
    comentarios: { type: String, nullable: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true },
  },
}); 