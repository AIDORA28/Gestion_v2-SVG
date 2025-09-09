// Verificar TODAS las tablas de Supabase
async function verificarTodasLasTablas() {
    console.log('🔍 VERIFICANDO TODAS LAS TABLAS DE SUPABASE');
    console.log('==========================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const serviceHeaders = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };
    
    // Tablas que veo en la imagen de Supabase
    const tablasEnImagen = [
        'categorias_personalizadas',
        'gastos',
        'geography_columns',
        'geometry_columns', 
        'ingresos',
        'logs_auditoria',
        'metas_financieras',
        'sesiones',
        'simulaciones_credito',
        'spatial_ref_sys',
        'usuarios'
    ];
    
    console.log('\n📋 VERIFICANDO TABLAS VISIBLES EN SUPABASE UI...');
    console.log(`Total tablas identificadas: ${tablasEnImagen.length}`);
    
    const resultados = {};
    
    for (const tabla of tablasEnImagen) {
        console.log(`\n🔍 Verificando: ${tabla}`);
        
        try {
            // Obtener información básica
            const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*&limit=1`, {
                method: 'HEAD',
                headers: serviceHeaders
            });
            
            if (response.ok) {
                const contentRange = response.headers.get('content-range');
                const totalCount = contentRange ? contentRange.split('/')[1] : 'desconocido';
                
                console.log(`✅ Accesible - Registros: ${totalCount}`);
                
                // Obtener una muestra de datos
                const dataResponse = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*&limit=1`, {
                    method: 'GET',
                    headers: serviceHeaders
                });
                
                if (dataResponse.ok) {
                    const data = await dataResponse.json();
                    if (data && data.length > 0) {
                        const columnas = Object.keys(data[0]);
                        resultados[tabla] = {
                            accesible: true,
                            registros: totalCount,
                            columnas: columnas,
                            muestra: data[0]
                        };
                        console.log(`   📝 Columnas (${columnas.length}): ${columnas.join(', ')}`);
                    } else {
                        resultados[tabla] = {
                            accesible: true,
                            registros: totalCount,
                            columnas: [],
                            vacia: true
                        };
                        console.log(`   📊 Tabla vacía`);
                    }
                }
            } else {
                console.log(`❌ No accesible (Status: ${response.status})`);
                resultados[tabla] = {
                    accesible: false,
                    error: response.status
                };
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
            resultados[tabla] = {
                accesible: false,
                error: e.message
            };
        }
    }
    
    // Resumen por categorías
    console.log('\n📊 RESUMEN POR CATEGORÍAS');
    console.log('=========================');
    
    const categorias = {
        'Financieras': ['ingresos', 'gastos', 'metas_financieras', 'simulaciones_credito', 'categorias_personalizadas'],
        'Sistema': ['usuarios', 'sesiones', 'logs_auditoria'],
        'PostGIS/Espacial': ['geography_columns', 'geometry_columns', 'spatial_ref_sys']
    };
    
    for (const [categoria, tablas] of Object.entries(categorias)) {
        console.log(`\n📋 ${categoria.toUpperCase()}:`);
        
        for (const tabla of tablas) {
            const info = resultados[tabla];
            if (info && info.accesible) {
                const registros = info.registros === 'desconocido' ? '?' : info.registros;
                const columnas = info.columnas ? info.columnas.length : 0;
                console.log(`   ✅ ${tabla}: ${registros} registros, ${columnas} columnas`);
                
                if (info.columnas && info.columnas.length > 0) {
                    console.log(`      Estructura: ${info.columnas.join(', ')}`);
                }
            } else {
                console.log(`   ❌ ${tabla}: No accesible`);
            }
        }
    }
    
    // Información detallada de tablas principales
    console.log('\n🎯 TABLAS PRINCIPALES PARA EL DASHBOARD');
    console.log('======================================');
    
    const tablasPrincipales = ['usuarios', 'ingresos', 'gastos', 'metas_financieras', 'categorias_personalizadas'];
    
    for (const tabla of tablasPrincipales) {
        const info = resultados[tabla];
        if (info && info.accesible) {
            console.log(`\n📋 ${tabla.toUpperCase()}:`);
            console.log(`   📊 Registros: ${info.registros}`);
            console.log(`   📝 Columnas: ${info.columnas ? info.columnas.join(', ') : 'N/A'}`);
            
            if (info.muestra) {
                console.log(`   📄 Ejemplo:`);
                console.log(`   ${JSON.stringify(info.muestra, null, 4)}`);
            }
        }
    }
    
    // Propuesta de uso de nuevas tablas
    console.log('\n💡 OPORTUNIDADES DE MEJORA DEL DASHBOARD');
    console.log('========================================');
    
    if (resultados['categorias_personalizadas'] && resultados['categorias_personalizadas'].accesible) {
        console.log('✅ Tabla "categorias_personalizadas" disponible:');
        console.log('   - Puede usarse para categorizar ingresos y gastos');
        console.log('   - Mejoraría los gráficos del dashboard');
    }
    
    if (resultados['metas_financieras'] && resultados['metas_financieras'].accesible) {
        console.log('✅ Tabla "metas_financieras" disponible:');
        console.log('   - Puede agregar sección de metas al dashboard');
        console.log('   - Tracking de objetivos financieros');
    }
    
    if (resultados['logs_auditoria'] && resultados['logs_auditoria'].accesible) {
        console.log('✅ Tabla "logs_auditoria" disponible:');
        console.log('   - Puede mostrar historial de cambios');
        console.log('   - Auditoría de transacciones');
    }
    
    console.log('\n🎯 RESUMEN FINAL');
    console.log('================');
    const accesibles = Object.values(resultados).filter(r => r.accesible).length;
    const conDatos = Object.values(resultados).filter(r => r.accesible && r.registros !== '0').length;
    
    console.log(`📊 Total tablas verificadas: ${tablasEnImagen.length}`);
    console.log(`✅ Tablas accesibles: ${accesibles}`);
    console.log(`📈 Tablas con datos: ${conDatos}`);
    console.log(`🎯 Tablas principales listas: ingresos (${resultados.ingresos?.registros || 0}), gastos (${resultados.gastos?.registros || 0})`);
}

verificarTodasLasTablas();
