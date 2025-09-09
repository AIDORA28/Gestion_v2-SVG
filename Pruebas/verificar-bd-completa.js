// Verificador completo de base de datos Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNzY5MDQsImV4cCI6MjA1MTc1MjkwNH0.wuSF0fNW3TgQY1wFr7w7oSpBV41NLBaM9xnfGCRNqL0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarBaseDatosCompleta() {
    console.log('🔍 VERIFICACIÓN COMPLETA DE BASE DE DATOS SUPABASE');
    console.log('=====================================================');
    
    try {
        // 1. Login con usuario de prueba
        console.log('\n🔐 Iniciando sesión con usuario de prueba...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'joegarcia.1395@gmail.com',
            password: 'Joe1395@'
        });
        
        if (authError) {
            console.error('❌ Error de autenticación:', authError.message);
            return;
        }
        console.log('✅ Autenticación exitosa');
        console.log('👤 Usuario ID:', authData.user.id);
        
        // 2. Obtener todas las tablas del esquema public
        console.log('\n📋 CONSULTANDO TODAS LAS TABLAS DEL ESQUEMA PUBLIC...');
        const { data: tablas, error: errorTablas } = await supabase
            .rpc('get_schema_tables')
            .select('*');
            
        if (errorTablas) {
            console.log('⚠️  RPC no disponible, probando método alternativo...');
            
            // Método alternativo: probar tablas conocidas
            const tablasConocidas = [
                'usuarios', 'profiles', 'user_profiles', 'perfiles_usuario',
                'ingresos', 'gastos', 'creditos', 'prestamos',
                'simulaciones_credito', 'transacciones', 'categorias',
                'metas_financieras', 'presupuestos', 'reportes',
                'configuraciones', 'notificaciones'
            ];
            
            console.log('\n🔍 PROBANDO TABLAS CONOCIDAS...');
            for (const tabla of tablasConocidas) {
                try {
                    const { data, error, count } = await supabase
                        .from(tabla)
                        .select('*', { count: 'exact', head: true });
                    
                    if (!error) {
                        console.log(`✅ Tabla '${tabla}' existe - Registros: ${count || 0}`);
                        
                        // Obtener estructura de la tabla
                        try {
                            const { data: muestra } = await supabase
                                .from(tabla)
                                .select('*')
                                .limit(1);
                            
                            if (muestra && muestra.length > 0) {
                                console.log(`   📊 Columnas: ${Object.keys(muestra[0]).join(', ')}`);
                            } else {
                                // Intentar insertar un registro de prueba para ver el esquema
                                const { error: insertError } = await supabase
                                    .from(tabla)
                                    .insert({ test_column: 'test' });
                                
                                if (insertError) {
                                    const mensaje = insertError.message;
                                    if (mensaje.includes('column')) {
                                        console.log(`   📝 Info de esquema: ${mensaje}`);
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(`   ⚠️  No se pudo obtener estructura de '${tabla}'`);
                        }
                    } else {
                        console.log(`❌ Tabla '${tabla}' no existe o no accesible`);
                    }
                } catch (e) {
                    console.log(`❌ Tabla '${tabla}' no accesible`);
                }
            }
        } else {
            console.log('✅ Tablas encontradas:', tablas);
        }
        
        // 3. Verificar tablas específicas que sabemos que existen
        console.log('\n🔍 VERIFICACIÓN DETALLADA DE TABLAS EXISTENTES...');
        
        const tablasExistentes = ['ingresos', 'gastos', 'simulaciones_credito'];
        
        for (const tabla of tablasExistentes) {
            console.log(`\n📋 Analizando tabla: ${tabla}`);
            
            try {
                // Contar registros
                const { count } = await supabase
                    .from(tabla)
                    .select('*', { count: 'exact', head: true });
                
                console.log(`   📊 Total registros: ${count || 0}`);
                
                // Intentar obtener un registro para ver la estructura
                const { data: muestra } = await supabase
                    .from(tabla)
                    .select('*')
                    .limit(1);
                
                if (muestra && muestra.length > 0) {
                    console.log(`   📝 Columnas: ${Object.keys(muestra[0]).join(', ')}`);
                    console.log(`   📄 Ejemplo:`, JSON.stringify(muestra[0], null, 2));
                } else {
                    console.log(`   📝 Tabla vacía, intentando descubrir estructura...`);
                    
                    // Intentar insertar diferentes estructuras para descubrir el esquema
                    const estructurasPrueba = [
                        { usuario_id: authData.user.id, descripcion: 'test' },
                        { user_id: authData.user.id, descripcion: 'test' },
                        { id_usuario: authData.user.id, descripcion: 'test' }
                    ];
                    
                    for (let i = 0; i < estructurasPrueba.length; i++) {
                        const { error } = await supabase
                            .from(tabla)
                            .insert(estructurasPrueba[i]);
                        
                        if (error) {
                            console.log(`   🔍 Prueba ${i + 1}: ${error.message}`);
                        } else {
                            console.log(`   ✅ Estructura ${i + 1} funcionó!`);
                            break;
                        }
                    }
                }
                
            } catch (error) {
                console.log(`   ❌ Error al analizar: ${error.message}`);
            }
        }
        
        // 4. Verificar información del usuario actual
        console.log('\n👤 INFORMACIÓN DEL USUARIO ACTUAL...');
        
        // Buscar en diferentes posibles tablas de perfiles
        const tablasPerfiles = ['profiles', 'usuarios', 'user_profiles', 'perfiles_usuario'];
        
        for (const tablaPerfiles of tablasPerfiles) {
            try {
                const { data: perfil } = await supabase
                    .from(tablaPerfiles)
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();
                
                if (perfil) {
                    console.log(`✅ Perfil encontrado en '${tablaPerfiles}':`, perfil);
                } else {
                    console.log(`❌ No hay perfil en '${tablaPerfiles}'`);
                }
            } catch (e) {
                console.log(`❌ Tabla '${tablaPerfiles}' no accesible`);
            }
        }
        
        console.log('\n🎯 RESUMEN DE VERIFICACIÓN COMPLETADO');
        console.log('=====================================');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar verificación
verificarBaseDatosCompleta();
