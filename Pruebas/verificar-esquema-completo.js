// Verificador completo de base de datos con Service Role
async function verificarBaseDatosCompleta() {
    console.log('🔍 VERIFICACIÓN COMPLETA DE BASE DE DATOS SUPABASE');
    console.log('=====================================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    try {
        // Headers con service role para acceso completo
        const serviceHeaders = {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
        };
        
        // 1. Obtener información del esquema usando service role
        console.log('\n🔍 OBTENIENDO INFORMACIÓN DEL ESQUEMA...');
        
        // Consultar información de tablas desde information_schema
        const schemaQuery = `
            SELECT 
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position
        `;
        
        try {
            const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: serviceHeaders,
                body: JSON.stringify({ query: schemaQuery })
            });
            
            if (!schemaResponse.ok) {
                console.log('⚠️ RPC no disponible, usando método alternativo...');
            }
        } catch (e) {
            console.log('⚠️ No se pudo usar RPC, continuando con método alternativo...');
        }
        
        // 2. Método alternativo: probar tablas directamente
        const tablasConocidas = [
            'usuarios', 'profiles', 'user_profiles', 'perfiles_usuario',
            'ingresos', 'gastos', 'creditos', 'prestamos',
            'simulaciones_credito', 'transacciones', 'categorias',
            'metas_financieras', 'presupuestos', 'reportes',
            'configuraciones', 'notificaciones'
        ];
        
        console.log('\n🔍 VERIFICANDO TABLAS EXISTENTES...');
        const tablasEncontradas = [];
        const estructurasTablas = {};
        
        for (const tabla of tablasConocidas) {
            try {
                // Usar service role para obtener información completa
                const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*&limit=1`, {
                    method: 'GET',
                    headers: serviceHeaders
                });
                
                if (response.ok) {
                    const data = await response.json();
                    tablasEncontradas.push(tabla);
                    console.log(`✅ Tabla '${tabla}' existe`);
                    
                    if (data && data.length > 0) {
                        const columnas = Object.keys(data[0]);
                        estructurasTablas[tabla] = {
                            columnas: columnas,
                            ejemplo: data[0]
                        };
                        console.log(`   📝 Columnas: ${columnas.join(', ')}`);
                    } else {
                        console.log(`   📊 Tabla vacía`);
                        estructurasTablas[tabla] = { columnas: [], ejemplo: null };
                    }
                } else {
                    console.log(`❌ Tabla '${tabla}' no accesible`);
                }
            } catch (e) {
                console.log(`❌ Error al verificar '${tabla}': ${e.message}`);
            }
        }
        
        // 3. Para tablas vacías, intentar descubrir estructura
        console.log('\n🧪 DESCUBRIENDO ESTRUCTURA DE TABLAS VACÍAS...');
        
        const tablasVacias = tablasEncontradas.filter(tabla => 
            !estructurasTablas[tabla] || estructurasTablas[tabla].columnas.length === 0
        );
        
        for (const tabla of tablasVacias) {
            console.log(`\n🔍 Descubriendo estructura de: ${tabla}`);
            
            // Probar diferentes estructuras típicas
            const estructurasPrueba = [
                // Estructura básica con usuario_id
                {
                    usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    descripcion: 'test',
                    monto: 1000,
                    fecha: new Date().toISOString()
                },
                // Estructura con user_id
                {
                    user_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    concepto: 'test',
                    valor: 1000,
                    fecha_registro: new Date().toISOString()
                },
                // Estructura con id_usuario
                {
                    id_usuario: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    nombre: 'test',
                    cantidad: 1000,
                    created_at: new Date().toISOString()
                }
            ];
            
            for (let i = 0; i < estructurasPrueba.length; i++) {
                try {
                    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${tabla}`, {
                        method: 'POST',
                        headers: serviceHeaders,
                        body: JSON.stringify(estructurasPrueba[i])
                    });
                    
                    if (insertResponse.ok) {
                        const insertedData = await insertResponse.json();
                        console.log(`   ✅ Estructura ${i + 1} FUNCIONÓ!`);
                        console.log(`   📝 Estructura exitosa:`, JSON.stringify(estructurasPrueba[i], null, 2));
                        
                        // Guardar la estructura que funcionó
                        estructurasTablas[tabla] = {
                            columnas: Object.keys(estructurasPrueba[i]),
                            estructuraExitosa: estructurasPrueba[i],
                            ejemplo: insertedData[0] || estructurasPrueba[i]
                        };
                        
                        // Eliminar el registro de prueba
                        if (insertedData && insertedData.length > 0 && insertedData[0].id) {
                            await fetch(`${supabaseUrl}/rest/v1/${tabla}?id=eq.${insertedData[0].id}`, {
                                method: 'DELETE',
                                headers: serviceHeaders
                            });
                            console.log(`   🗑️ Registro de prueba eliminado`);
                        }
                        break;
                    } else {
                        const error = await insertResponse.json();
                        console.log(`   ❌ Estructura ${i + 1}: ${error.message}`);
                        
                        // Analizar el error para entender la estructura
                        if (error.message.includes('violates foreign key constraint')) {
                            console.log(`   💡 Pista: La tabla requiere un usuario_id válido`);
                        }
                        if (error.message.includes('null value in column')) {
                            const match = error.message.match(/null value in column "([^"]+)"/);
                            if (match) {
                                console.log(`   💡 Pista: Columna requerida '${match[1]}'`);
                            }
                        }
                    }
                } catch (e) {
                    console.log(`   ❌ Estructura ${i + 1}: ${e.message}`);
                }
            }
        }
        
        // 4. Crear un usuario de prueba primero
        console.log('\n👤 VERIFICANDO USUARIOS EXISTENTES...');
        
        try {
            // Verificar si hay usuarios
            const usuariosResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&limit=5`, {
                method: 'GET',
                headers: serviceHeaders
            });
            
            if (usuariosResponse.ok) {
                const usuarios = await usuariosResponse.json();
                console.log(`✅ Tabla 'profiles' encontrada con ${usuarios.length} usuarios`);
                
                if (usuarios.length > 0) {
                    console.log('📋 Usuarios existentes:');
                    usuarios.forEach(usuario => {
                        console.log(`   - ID: ${usuario.id}, Email: ${usuario.email || 'N/A'}`);
                    });
                    
                    // Usar el primer usuario para las pruebas
                    const usuarioPrueba = usuarios[0].id;
                    console.log(`🎯 Usando usuario para pruebas: ${usuarioPrueba}`);
                    
                    // 5. Ahora probar insertar datos reales
                    console.log('\n🧪 INSERTANDO DATOS DE PRUEBA REALES...');
                    
                    const datosReales = {
                        ingresos: {
                            usuario_id: usuarioPrueba,
                            descripcion: 'Salario mensual',
                            monto: 3500000,
                            fecha: new Date().toISOString().split('T')[0],
                            categoria: 'trabajo'
                        },
                        gastos: {
                            usuario_id: usuarioPrueba,
                            descripcion: 'Compra supermercado',
                            monto: 150000,
                            fecha: new Date().toISOString().split('T')[0],
                            categoria: 'alimentacion'
                        }
                    };
                    
                    for (const [tabla, datos] of Object.entries(datosReales)) {
                        if (tablasEncontradas.includes(tabla)) {
                            try {
                                const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}`, {
                                    method: 'POST',
                                    headers: serviceHeaders,
                                    body: JSON.stringify(datos)
                                });
                                
                                if (response.ok) {
                                    const resultado = await response.json();
                                    console.log(`✅ Datos insertados en '${tabla}':`, resultado);
                                } else {
                                    const error = await response.json();
                                    console.log(`❌ Error insertando en '${tabla}': ${error.message}`);
                                }
                            } catch (e) {
                                console.log(`❌ Error insertando en '${tabla}': ${e.message}`);
                            }
                        }
                    }
                }
            } else {
                console.log('❌ No se pudo acceder a la tabla de usuarios');
            }
        } catch (e) {
            console.log(`❌ Error verificando usuarios: ${e.message}`);
        }
        
        // 6. Resumen final
        console.log('\n🎯 RESUMEN FINAL DE VERIFICACIÓN');
        console.log('=====================================');
        console.log(`✅ Tablas encontradas: ${tablasEncontradas.length}`);
        console.log(`📋 Lista: ${tablasEncontradas.join(', ')}`);
        
        console.log('\n📊 ESTRUCTURAS DESCUBIERTAS:');
        for (const [tabla, info] of Object.entries(estructurasTablas)) {
            if (info.columnas && info.columnas.length > 0) {
                console.log(`\n📋 ${tabla.toUpperCase()}:`);
                console.log(`   Columnas: ${info.columnas.join(', ')}`);
                if (info.ejemplo) {
                    console.log(`   Ejemplo: ${JSON.stringify(info.ejemplo, null, 2)}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar verificación
verificarBaseDatosCompleta();
