const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    port: 5434,
    database: 'gestion_presupuesto',
    user: 'postgres',
    password: 'sa123'
});

async function showUsers() {
    try {
        console.log('👥 USUARIOS REGISTRADOS:');
        console.log('=' .repeat(60));
        
        const result = await pool.query(`
            SELECT id, nombre, apellido, email, password_hash, dni, telefono, 
                   profesion, estado_civil, active, created_at
            FROM usuarios
            ORDER BY created_at DESC
        `);
        
        if (result.rowCount === 0) {
            console.log('❌ No hay usuarios registrados');
        } else {
            result.rows.forEach((user, index) => {
                console.log(`\n🧑 Usuario ${index + 1}:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Nombre: ${user.nombre} ${user.apellido || ''}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Password: ${user.password_hash}`);
                console.log(`   DNI: ${user.dni || 'N/A'}`);
                console.log(`   Teléfono: ${user.telefono || 'N/A'}`);
                console.log(`   Profesión: ${user.profesion || 'N/A'}`);
                console.log(`   Estado Civil: ${user.estado_civil || 'N/A'}`);
                console.log(`   Estado: ${user.active ? 'Activo' : 'Inactivo'}`);
                console.log(`   Creado: ${user.created_at}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

showUsers();
