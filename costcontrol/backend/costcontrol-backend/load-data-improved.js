const fs = require('fs');
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
        
        // Split by semicolon to get complete statements
        const statements = sqlContent.split(';').filter(stmt => {
            const trimmed = stmt.trim();
            return trimmed && trimmed.toUpperCase().startsWith('INSERT INTO');
        });
        
        console.log(`📊 Found ${statements.length} INSERT statements`);
        
        // Process each INSERT statement
        for (const statement of statements) {
            try {
                // Convert MySQL syntax to SQLite
                let cleanStatement = statement.trim()
                    .replace(/INSERT INTO `([^`]+)`/g, 'INSERT INTO "$1"')
                    .replace(/`([^`]+)`/g, '"$1"');
                
                // Handle multiline VALUES
                cleanStatement = cleanStatement.replace(/\s+/g, ' ');
                
                if (cleanStatement) {
                    console.log(`🔄 Executing: ${cleanStatement.substring(0, 80)}...`);
                    await AppDataSource.query(cleanStatement);
                    console.log(`✅ Success`);
                }
            } catch (error) {
                console.log(`⚠️  Error with statement: ${error.message}`);
                console.log(`   Statement: ${statement.substring(0, 100)}...`);
            }
        }
        
        console.log('🎉 Data loading completed!');
        
        // Verify data was loaded
        const centrosCosto = await AppDataSource.query('SELECT COUNT(*) as count FROM centros_costo');
        const pagos = await AppDataSource.query('SELECT COUNT(*) as count FROM pagos');
        const users = await AppDataSource.query('SELECT COUNT(*) as count FROM users');
        const configuracion = await AppDataSource.query('SELECT COUNT(*) as count FROM configuracion');
        
        console.log('📈 Data verification:');
        console.log(`   Centros de Costo: ${centrosCosto[0].count} records`);
        console.log(`   Pagos: ${pagos[0].count} records`);
        console.log(`   Users: ${users[0].count} records`);
        console.log(`   Configuración: ${configuracion[0].count} records`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        process.exit(1);
    }
}

// Run the function
loadSQLData();