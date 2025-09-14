require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.Configuracion = new EntitySchema({
  name: 'Configuracion',
  tableName: 'configuracion',
  columns: {
    id: { type: Number, primary: true, generated: true },
    nombreEmpresa: { type: String },
    moneda: { type: String },
    formatoFecha: { type: String },
    // Configuración de Slack
    slackBotToken: { type: String, nullable: true },
    slackChannel: { type: String, nullable: true },
    slackEnabled: { type: Boolean, default: false },
    ultimaActualizacion: { type: 'datetime', updateDate: true },
  },
}); 