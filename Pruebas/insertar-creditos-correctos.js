/**
 * 🧪 INSERTAR CRÉDITOS CON ESTRUCTURA CORRECTA
 * Basado en los errores anteriores, ahora sabemos que necesita monto
 */

async function insertarCreditosCorrectos() {
    console.log('💳 INSERTANDO CRÉDITOS CON ESTRUCTURA CORRECTA');
    console.log('==============================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log('💰 Insertando créditos con monto (campo requerido)...');
        
        const creditosCorrectos = [
            {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                monto: 15000.00
            },
            {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5', 
                monto: 8000.00
            },
            {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                monto: 25000.00
            },
            {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                monto: 3500.00
            }
        ];

        const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(creditosCorrectos)
        });

        if (response.ok) {
            console.log(`✅ ${creditosCorrectos.length} créditos insertados exitosamente`);
            
            // Verificar resultado
            const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*`, {
                headers: headers
            });
            
            if (verifyResponse.ok) {
                const data = await verifyResponse.json();
                console.log(`📊 Total créditos en tabla: ${data.length}`);
                
                if (data.length > 0) {
                    console.log('📝 Estructura real confirmada:');
                    const columnas = Object.keys(data[0]);
                    console.log(`   Columnas (${columnas.length}): ${columnas.join(', ')}`);
                    
                    console.log('\n📄 Ejemplos de registros:');
                    data.slice(0, 2).forEach((item, i) => {
                        console.log(`   ${i + 1}. ${JSON.stringify(item, null, 2)}`);
                    });
                    
                    const totalMonto = data.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                    console.log(`\n💰 Monto total: S/ ${totalMonto.toLocaleString('es-PE')}`);
                    
                    console.log('\n🎯 ANÁLISIS PARA MÓDULO DE REPORTES:');
                    console.log('===================================');
                    console.log('✅ Tabla funcionando correctamente');
                    console.log(`✅ Campo 'monto' disponible para sumatorias`);
                    console.log(`✅ Campo 'usuario_id' para filtrar por usuario`);
                    
                    // Verificar si hay otros campos útiles
                    if (data[0].tipo) {
                        console.log(`✅ Campo 'tipo' disponible: ${data[0].tipo}`);
                    }
                    if (data[0].created_at) {
                        console.log(`✅ Campo 'created_at' disponible para ordenar por fecha`);
                    }
                    if (data[0].estado) {
                        console.log(`✅ Campo 'estado' disponible: ${data[0].estado}`);
                    }
                    
                    console.log('\n🚀 El módulo de reportes ya puede funcionar con estos datos');
                }
            }
        } else {
            const errorText = await response.text();
            console.log(`❌ Error insertando créditos: ${response.status}`);
            console.log(errorText);
        }

    } catch (error) {
        console.log(`❌ Error general: ${error.message}`);
    }

    console.log('\n🎯 SIGUIENTE PASO');
    console.log('================');
    console.log('1. Ve al dashboard: http://localhost:3001/dashboard.html');
    console.log('2. Haz login con: joegarcia.1395@gmail.com / 123456');
    console.log('3. Ve a la sección "📊 Reportes"');
    console.log('4. Deberías ver los datos de créditos en el resumen y tablas');
}

// Ejecutar
insertarCreditosCorrectos();
