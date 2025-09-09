// Verificador de base de datos usando fetch directo
async function verificarBaseDatos() {
    console.log('🔍 VERIFICACIÓN COMPLETA DE BASE DE DATOS SUPABASE');
    console.log('=====================================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    try {
        // 1. Login
        console.log('\n🔐 Intentando login...');
        const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'joegarcia.1395@gmail.com',
                password: 'Joe1395@'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.error('❌ Error de login:', loginData);
            return;
        }
        
        const accessToken = loginData.access_token;
        console.log('✅ Login exitoso');
        
        // Headers para requests autenticados
        const headers = {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        
        // 2. Probar tablas conocidas
        const tablasConocidas = [
            'usuarios', 'profiles', 'user_profiles', 'perfiles_usuario',
            'ingresos', 'gastos', 'creditos', 'prestamos',
            'simulaciones_credito', 'transacciones', 'categorias',
            'metas_financieras', 'presupuestos', 'reportes',
            'configuraciones', 'notificaciones', 'auth.users'
        ];
        
        console.log('\n🔍 PROBANDO TABLAS CONOCIDAS...');
        const tablasExistentes = [];
        
        for (const tabla of tablasConocidas) {
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*&limit=1`, {
                    method: 'GET',
                    headers: headers
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const count = response.headers.get('content-range');
                    console.log(`✅ Tabla '${tabla}' existe`);
                    
                    if (data.length > 0) {
                        console.log(`   📝 Columnas: ${Object.keys(data[0]).join(', ')}`);
                        console.log(`   📊 Ejemplo:`, JSON.stringify(data[0], null, 2));
                    } else {
                        console.log(`   📊 Tabla vacía`);
                    }
                    
                    tablasExistentes.push(tabla);
                } else {
                    const error = await response.json();
                    console.log(`❌ Tabla '${tabla}' no accesible: ${error.message || response.status}`);
                }
            } catch (e) {
                console.log(`❌ Error al probar '${tabla}': ${e.message}`);
            }
        }
        
        // 3. Para tablas existentes, intentar obtener más información
        console.log('\n📋 ANÁLISIS DETALLADO DE TABLAS EXISTENTES...');
        
        for (const tabla of tablasExistentes) {
            console.log(`\n🔍 Analizando: ${tabla}`);
            
            try {
                // Obtener conteo total
                const countResponse = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*`, {
                    method: 'HEAD',
                    headers: headers
                });
                
                const contentRange = countResponse.headers.get('content-range');
                const totalCount = contentRange ? contentRange.split('/')[1] : 'desconocido';
                console.log(`   📊 Total registros: ${totalCount}`);
                
                // Obtener algunos registros para ver estructura
                const dataResponse = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*&limit=3`, {
                    method: 'GET',
                    headers: headers
                });
                
                if (dataResponse.ok) {
                    const data = await dataResponse.json();
                    
                    if (data.length > 0) {
                        console.log(`   📝 Columnas disponibles: ${Object.keys(data[0]).join(', ')}`);
                        console.log(`   📄 Datos de ejemplo:`);
                        data.forEach((row, index) => {
                            console.log(`      Registro ${index + 1}:`, JSON.stringify(row, null, 2));
                        });
                    } else {
                        console.log(`   📝 Tabla vacía`);
                    }
                }
                
            } catch (e) {
                console.log(`   ❌ Error al analizar: ${e.message}`);
            }
        }
        
        // 4. Intentar descubrir estructura de tablas vacías
        console.log('\n🧪 PROBANDO ESTRUCTURAS DE INSERCIÓN...');
        
        const tablasVacias = ['ingresos', 'gastos', 'simulaciones_credito'];
        
        for (const tabla of tablasVacias) {
            if (tablasExistentes.includes(tabla)) {
                console.log(`\n🧪 Probando inserción en: ${tabla}`);
                
                const estructurasPrueba = [
                    { usuario_id: loginData.user.id, descripcion: 'test', monto: 100 },
                    { user_id: loginData.user.id, descripcion: 'test', monto: 100 },
                    { id_usuario: loginData.user.id, descripcion: 'test', monto: 100 },
                    { usuario_id: loginData.user.id, concepto: 'test', valor: 100 },
                    { user_id: loginData.user.id, concepto: 'test', valor: 100 }
                ];
                
                for (let i = 0; i < estructurasPrueba.length; i++) {
                    try {
                        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${tabla}`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(estructurasPrueba[i])
                        });
                        
                        if (insertResponse.ok) {
                            console.log(`   ✅ Estructura ${i + 1} FUNCIONÓ para ${tabla}!`);
                            console.log(`   📝 Estructura exitosa:`, JSON.stringify(estructurasPrueba[i], null, 2));
                            
                            // Eliminar el registro de prueba
                            const insertedData = await insertResponse.json();
                            if (insertedData && insertedData.length > 0 && insertedData[0].id) {
                                await fetch(`${supabaseUrl}/rest/v1/${tabla}?id=eq.${insertedData[0].id}`, {
                                    method: 'DELETE',
                                    headers: headers
                                });
                                console.log(`   🗑️  Registro de prueba eliminado`);
                            }
                            break;
                        } else {
                            const error = await insertResponse.json();
                            console.log(`   ❌ Estructura ${i + 1}: ${error.message}`);
                        }
                    } catch (e) {
                        console.log(`   ❌ Estructura ${i + 1}: ${e.message}`);
                    }
                }
            }
        }
        
        console.log('\n🎯 RESUMEN FINAL');
        console.log('================');
        console.log(`✅ Tablas encontradas: ${tablasExistentes.length}`);
        console.log(`📋 Lista: ${tablasExistentes.join(', ')}`);
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar
verificarBaseDatos();
