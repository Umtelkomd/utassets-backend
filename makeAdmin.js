const mysql = require('mysql2/promise');
require('dotenv').config();

async function makeUserAdmin() {
    let connection;
    
    try {
        // Crear conexión a la base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Conectado a la base de datos');

        // Obtener todos los usuarios
        const [users] = await connection.execute(
            'SELECT id, username, email, fullName, role FROM user ORDER BY id ASC'
        );

        if (users.length === 0) {
            console.log('❌ No se encontraron usuarios en la base de datos');
            return;
        }

        console.log('\n=== USUARIOS DISPONIBLES ===');
        users.forEach(user => {
            console.log(`ID: ${user.id} | Usuario: ${user.username} | Email: ${user.email} | Nombre: ${user.fullName} | Rol: ${user.role}`);
        });

        // Hacer administrador al primer usuario
        const userToPromote = users[0];
        
        await connection.execute(
            'UPDATE user SET role = ? WHERE id = ?',
            ['administrador', userToPromote.id]
        );

        console.log(`\n✅ Usuario ${userToPromote.fullName} (${userToPromote.username}) ahora es ADMINISTRADOR`);
        console.log('🔄 Por favor, cierra sesión y vuelve a iniciar sesión para ver los cambios');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Asegúrate de que la base de datos esté ejecutándose y las credenciales sean correctas');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0);
    }
}

makeUserAdmin(); 