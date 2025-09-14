require('reflect-metadata');
const { EntitySchema } = require('typeorm');

module.exports.User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String, length: 100 },
    email: { type: String, unique: true, length: 255 },
    password: { type: String, length: 255 },
    role: { type: String, length: 50 }, // 'creator' or 'approver'
    active: { type: Boolean, default: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true },
  },
}); 