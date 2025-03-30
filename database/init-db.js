// database/init-db.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de PostgreSQL desde variables de entorno o valores por defecto
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'panda_assets',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
  console.log('Inicializando la base de datos...');
  
  try {
    // Leer el archivo de esquema SQL
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir el archivo en instrucciones SQL individuales
    // (asumiendo que cada instrucción termina con un punto y coma seguido de un salto de línea)
    const sqlStatements = schemaSql
      .split(';\n')
      .filter(statement => statement.trim() !== '')
      .map(statement => statement.trim() + ';');
    
    // Conectar a la base de datos
    const client = await pool.connect();
    
    try {
      // Comenzar una transacción
      await client.query('BEGIN');
      
      // Ejecutar cada declaración SQL
      for (const sql of sqlStatements) {
        await client.query(sql);
      }
      
      // Confirmar la transacción
      await client.query('COMMIT');
      console.log('Base de datos inicializada correctamente.');
    } catch (err) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      console.error('Error al inicializar la base de datos:', err);
      throw err;
    } finally {
      // Liberar el cliente
      client.release();
    }
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    throw err;
  }
}

module.exports = {
  initializeDatabase,
  pool
};