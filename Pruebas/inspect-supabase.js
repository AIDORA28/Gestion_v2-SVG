/**
 * 🔍 SCRIPT DE INSPECCIÓN DE SUPABASE
 * Inspecciona todas las tablas y estructura de la base de datos
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de conexión
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspectSupabase() {
    console.log('🔍 INSPECCIÓN COMPLETA DE SUPABASE');
    console.log('=====================================');
    console.log('URL:', SUPABASE_URL);
    console.log('=====================================\n');

    try {
        // 1. Obtener todas las tablas
        console.log('📋 1. OBTENIENDO TODAS LAS TABLAS...');
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_schema_tables');
        
        if (tablesError) {
            console.log('❌ Error obteniendo tablas con RPC, intentando método alternativo...');
            
            // Método alternativo: consulta directa a information_schema
            const { data: altTables, error: altError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .order('table_name');
            
            if (altError) {
                console.log('❌ Error con método alternativo:', altError);
            } else {
                console.log('✅ Tablas encontradas (método alternativo):');
                altTables.forEach(table => console.log(`  - ${table.table_name}`));
            }
        } else {
            console.log('✅ Tablas encontradas (RPC):');
            tables.forEach(table => console.log(`  - ${table.table_name}`));
        }

        console.log('\n📊 2. INSPECCIONANDO TABLAS PRINCIPALES...\n');

        // 2. Lista de tablas esperadas
        const expectedTables = [
            'usuarios', 
            'ingresos', 
            'gastos', 
            'perfiles_usuario',
            'simulaciones_credito',
            'categorias_personalizadas',
            'metas_financieras'
        ];

        const schemaInfo = {};

        for (const tableName of expectedTables) {
            console.log(`🔍 Inspeccionando tabla: ${tableName}`);
            
            try {
                // Intentar hacer un SELECT simple para ver si la tabla existe
                const { data: testData, error: testError, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (testError) {
                    console.log(`  ❌ ${tableName}: NO EXISTE o SIN ACCESO`);
                    console.log(`     Error: ${testError.message}`);
                    schemaInfo[tableName] = {
                        exists: false,
                        error: testError.message
                    };
                } else {
                    console.log(`  ✅ ${tableName}: EXISTE (${count} registros)`);
                    
                    // Si existe, obtener algunos registros de muestra
                    const { data: sampleData, error: sampleError } = await supabase
                        .from(tableName)
                        .select('*')
                        .limit(1);
                    
                    if (!sampleError && sampleData && sampleData.length > 0) {
                        const columns = Object.keys(sampleData[0]);
                        console.log(`     Columnas: ${columns.join(', ')}`);
                        
                        schemaInfo[tableName] = {
                            exists: true,
                            count: count,
                            columns: columns,
                            sampleRecord: sampleData[0]
                        };
                    } else {
                        // Tabla vacía, intentar obtener estructura
                        console.log(`     Tabla vacía, obteniendo estructura...`);
                        schemaInfo[tableName] = {
                            exists: true,
                            count: count,
                            columns: 'tabla_vacia'
                        };
                    }
                }
            } catch (err) {
                console.log(`  ❌ ${tableName}: ERROR - ${err.message}`);
                schemaInfo[tableName] = {
                    exists: false,
                    error: err.message
                };
            }
            
            console.log(''); // Línea en blanco
        }

        console.log('📋 3. RESUMEN FINAL:');
        console.log('====================');
        
        Object.entries(schemaInfo).forEach(([table, info]) => {
            if (info.exists) {
                console.log(`✅ ${table}: ${info.count} registros`);
                if (info.columns && Array.isArray(info.columns)) {
                    console.log(`   Columnas: ${info.columns.join(', ')}`);
                }
            } else {
                console.log(`❌ ${table}: NO EXISTE`);
            }
        });

        // 4. Intentar obtener información específica de la tabla usuarios
        console.log('\n👤 4. INFORMACIÓN DETALLADA DE USUARIOS:');
        console.log('=========================================');
        
        try {
            const { data: usuarios, error: usuariosError } = await supabase
                .from('usuarios')
                .select('*')
                .limit(3);
            
            if (!usuariosError) {
                console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
                if (usuarios.length > 0) {
                    console.log('📄 Estructura de usuario:');
                    Object.keys(usuarios[0]).forEach(key => {
                        console.log(`   - ${key}: ${typeof usuarios[0][key]}`);
                    });
                    
                    console.log('\n📄 Ejemplo de registro:');
                    console.log(JSON.stringify(usuarios[0], null, 2));
                }
            } else {
                console.log('❌ Error obteniendo usuarios:', usuariosError.message);
            }
        } catch (err) {
            console.log('❌ Error inesperado con usuarios:', err.message);
        }

        return schemaInfo;

    } catch (error) {
        console.error('💥 Error general:', error);
        return null;
    }
}

// Ejecutar inspección
inspectSupabase()
    .then(result => {
        console.log('\n🎉 INSPECCIÓN COMPLETADA');
        if (result) {
            console.log('\n📊 RESULTADO JSON:');
            console.log(JSON.stringify(result, null, 2));
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
