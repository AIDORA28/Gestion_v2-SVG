const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    port: 5434,
    database: 'gestion_presupuesto',
    user: 'postgres',
    password: 'sa123'
});

async function updateUsersTable() {
    try {
        console.log('\n🔧 Actualizando estructura de tabla usuarios...');
        
        // Agregar columnas faltantes
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS ingresos_mensuales DECIMAL(10,2) DEFAULT 0.00,
            ADD COLUMN IF NOT EXISTS gastos_fijos DECIMAL(10,2) DEFAULT 0.00;
        `);
        
        console.log('✅ Columnas agregadas exitosamente:');
        console.log('   - ingresos_mensuales (DECIMAL)');
        console.log('   - gastos_fijos (DECIMAL)');

        // Verificar nueva estructura
        console.log('\n📋 Nueva estructura de tabla usuarios:');
        const tableInfo = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'usuarios' 
            AND column_name IN ('ingresos_mensuales', 'gastos_fijos')
            ORDER BY ordinal_position;
        `);
        
        console.table(tableInfo.rows);

        // Verificar que los usuarios existentes tengan valores por defecto
        await pool.query(`
            UPDATE usuarios 
            SET ingresos_mensuales = COALESCE(ingresos_mensuales, 0.00),
                gastos_fijos = COALESCE(gastos_fijos, 0.00)
            WHERE ingresos_mensuales IS NULL OR gastos_fijos IS NULL;
        `);

        console.log('\n✅ ¡Estructura de base de datos actualizada correctamente!');
        console.log('🚀 El backend ahora debería funcionar sin errores.');

        pool.end();
    } catch (error) {
        console.error('❌ Error actualizando tabla:', error.message);
        pool.end();
    }
}

updateUsersTable();
