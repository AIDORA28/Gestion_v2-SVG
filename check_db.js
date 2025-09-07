const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    port: 5434,
    database: 'gestion_presupuesto',
    user: 'postgres',
    password: 'sa123'
});

async function checkDatabase() {
    try {
        // Verificar estructura de tabla usuarios
        console.log('\n📋 Estructura de tabla usuarios:');
        const tableInfo = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'usuarios' 
            ORDER BY ordinal_position;
        `);
        
        if (tableInfo.rows.length === 0) {
            console.log('❌ La tabla usuarios no existe');
        } else {
            console.table(tableInfo.rows);
        }

        // Verificar si existen datos
        const count = await pool.query('SELECT COUNT(*) FROM usuarios');
        console.log(`\n📊 Total de usuarios: ${count.rows[0].count}`);

        pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        pool.end();
    }
}

checkDatabase();
