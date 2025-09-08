/**
 * 🗄️ EXTRACTOR DE ESTRUCTURA COMPLETA DE BD
 * Obtiene el DDL de todas las tablas de PostgreSQL local
 */

const { Pool } = require('pg');

// Usar las mismas credenciales del check_db.js que funciona
const pool = new Pool({
    host: '127.0.0.1',
    port: 5434,
    database: 'gestion_presupuesto',
    user: 'postgres',
    password: 'sa123'
});

async function extractDatabaseStructure() {
    try {
        console.log('🗄️ ===== EXTRAYENDO ESTRUCTURA COMPLETA DE BD =====\n');

        // 1. Obtener todas las tablas
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        
        const tablesResult = await pool.query(tablesQuery);
        console.log('📋 Tablas encontradas:', tablesResult.rows.map(r => r.table_name));

        // 2. Para cada tabla, obtener su estructura
        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.table_name;
            console.log(`\n🔍 Analizando tabla: ${tableName}`);
            
            // Obtener columnas
            const columnsQuery = `
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = $1 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            `;
            
            const columnsResult = await pool.query(columnsQuery, [tableName]);
            
            console.log('📊 Columnas:');
            columnsResult.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
            });

            // Obtener índices
            const indexesQuery = `
                SELECT 
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE tablename = $1 
                AND schemaname = 'public';
            `;
            
            const indexesResult = await pool.query(indexesQuery, [tableName]);
            
            if (indexesResult.rows.length > 0) {
                console.log('🔑 Índices:');
                indexesResult.rows.forEach(idx => {
                    console.log(`   - ${idx.indexname}`);
                });
            }

            // Obtener foreign keys
            const fkQuery = `
                SELECT 
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = $1;
            `;
            
            const fkResult = await pool.query(fkQuery, [tableName]);
            
            if (fkResult.rows.length > 0) {
                console.log('🔗 Foreign Keys:');
                fkResult.rows.forEach(fk => {
                    console.log(`   - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
                });
            }
        }

        // 3. Generar datos de muestra de algunas tablas importantes
        console.log('\n📊 ===== DATOS DE MUESTRA =====');
        
        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.table_name;
            
            try {
                const sampleQuery = `SELECT * FROM ${tableName} LIMIT 3;`;
                const sampleResult = await pool.query(sampleQuery);
                
                if (sampleResult.rows.length > 0) {
                    console.log(`\n🔍 Muestra de ${tableName}:`);
                    console.log(JSON.stringify(sampleResult.rows, null, 2));
                }
            } catch (error) {
                console.log(`⚠️ No se pudo obtener muestra de ${tableName}:`, error.message);
            }
        }

        console.log('\n✅ Extracción completada');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

extractDatabaseStructure();
