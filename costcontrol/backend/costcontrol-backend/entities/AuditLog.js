require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.AuditLog = new EntitySchema({
  name: 'AuditLog',
  tableName: 'audit_logs',
  columns: {
    id: { type: Number, primary: true, generated: true },
    entityName: { type: String, length: 100 }, // 'Pago', 'Proyecto', 'CentroCosto', etc.
    entityId: { type: String, length: 50 }, // Can be numeric or string ID
    action: { type: String, length: 20 }, // 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'DEFER'
    oldValues: { type: 'json', nullable: true },
    newValues: { type: 'json', nullable: true },
    userId: { type: Number, nullable: true },
    userName: { type: String, length: 255, nullable: true }, // Denormalized for reporting
    ipAddress: { type: String, length: 45, nullable: true }, // IPv6 compatible
    userAgent: { type: String, length: 500, nullable: true },
    timestamp: { type: 'datetime', createDate: true },
    description: { type: String, length: 500, nullable: true } // Human-readable description
  },
  indexes: [
    { name: 'idx_audit_entity', columns: ['entityName', 'entityId'] },
    { name: 'idx_audit_user', columns: ['userId'] },
    { name: 'idx_audit_timestamp', columns: ['timestamp'] },
    { name: 'idx_audit_action', columns: ['action'] }
  ]
});