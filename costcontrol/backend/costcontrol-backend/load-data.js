const fs = require('fs');
const path = require('path');
const { AppDataSource } = require('./data-source');

async function loadSQLData() {
    try {
        console.log('🔄 Initializing database connection...');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        console.log('✅ Database connected successfully');
        
        // Read SQL file
        const sqlFile = '/Users/esneiderherrera/Desktop/umtelkomd/costcontrol/backend/costcontrol.sql';
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('📁 SQL file loaded');
        
        // Extract INSERT statements and convert them to SQLite compatible format
        const insertStatements = sqlContent
            .split('\n')
            .filter(line => line.trim().startsWith('INSERT INTO'))
            .map(line => {
                // Convert MySQL INSERT syntax to SQLite compatible
                return line
                    .replace(/INSERT INTO `([^`]+)`/g, 'INSERT INTO "$1"')
                    .replace(/`([^`]+)`/g, '"$1"')
                    .replace(/,\s*$/, ';'); // Ensure semicolon at end
            });
        
        console.log(`📊 Found ${insertStatements.length} INSERT statements`);
        
        // Execute each INSERT statement
        for (const statement of insertStatements) {
            try {
                // Clean up the statement
                const cleanStatement = statement.replace(/;$/, '');
                if (cleanStatement.trim()) {
                    await AppDataSource.query(cleanStatement);
                    console.log(`✅ Executed: ${cleanStatement.substring(0, 50)}...`);
                }
            } catch (error) {
                console.log(`⚠️  Skipped (might be duplicate): ${statement.substring(0, 50)}...`);
                console.log(`   Error: ${error.message}`);
            }
        }
        
        console.log('🎉 Data loading completed successfully!');
        
        // Verify data was loaded
        const centrosCosto = await AppDataSource.query('SELECT COUNT(*) as count FROM centros_costo');
        const pagos = await AppDataSource.query('SELECT COUNT(*) as count FROM pagos');
        const users = await AppDataSource.query('SELECT COUNT(*) as count FROM users');
        
        console.log('📈 Data verification:');
        console.log(`   Centros de Costo: ${centrosCosto[0].count} records`);
        console.log(`   Pagos: ${pagos[0].count} records`);
        console.log(`   Users: ${users[0].count} records`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        process.exit(1);
    }
}

// Run the function
loadSQLData();