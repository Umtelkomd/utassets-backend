require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.Proyecto = new EntitySchema({
  name: 'Proyecto',
  tableName: 'proyectos',
  columns: {
    id: { type: Number, primary: true, generated: true },
    nombre: { type: String },
    descripcion: { type: String, nullable: true },
    codigo: { type: String, unique: true }, // Código único del proyecto
    fechaInicio: { type: Date },
    fechaFin: { type: Date, nullable: true },
    presupuesto: { type: 'decimal', precision: 12, scale: 2, nullable: true },
    estado: { type: String, default: 'activo' }, // 'activo', 'pausado', 'finalizado', 'cancelado'
    responsableId: { type: Number, nullable: true }, // ID del usuario responsable
    cliente: { type: String, nullable: true }, // Cliente o departamento
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true },
  },
  relations: {
    centrosCosto: {
      type: 'one-to-many',
      target: 'CentroCosto',
      inverseSide: 'proyecto',
    },
  },
}); 