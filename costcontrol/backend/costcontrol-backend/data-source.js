require('reflect-metadata');
const { DataSource } = require('typeorm');
const { Pago } = require('./entities/Pago');
const { CentroCosto } = require('./entities/CentroCosto');
const { CuentaPorPagar } = require('./entities/CuentaPorPagar');
const { Configuracion } = require('./entities/Configuracion');
const { User } = require('./entities/User');
const { Proyecto } = require('./entities/Proyecto');
const { AuditLog } = require('./entities/AuditLog');
const { Budget } = require('./entities/Budget');
const { ApprovalWorkflow, ApprovalStep } = require('./entities/ApprovalWorkflow');
require('dotenv').config();
const fs = require('fs');

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE || 'sqlite',
  // SQLite configuration
  database: process.env.DB_DATABASE || './database.sqlite',
  // MySQL configuration (used when DB_TYPE=mysql)
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Common configuration
  synchronize: true, // Cambia a false en producción
  logging: process.env.NODE_ENV === 'development',
  entities: [Pago, CentroCosto, CuentaPorPagar, Configuracion, User, Proyecto, AuditLog, Budget, ApprovalWorkflow, ApprovalStep],
  migrations: [],
  subscribers: [],
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('¿Existe .env?', fs.existsSync('./.env'));

module.exports = { AppDataSource }; 