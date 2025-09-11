/**
 * 🧪 INSERTAR DATOS BÁSICOS DE CRÉDITOS
 * Usando solo columnas que probablemente existen
 */

async function insertarCreditosBasicos() {
    console.log('💳 INSERTANDO CRÉDITOS CON ESTRUCTURA BÁSICA');
    console.log('============================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };

    try {
        // Probar con estructura mínima similar a las otras tablas
        console.log('🎯 Intentando estructura básica similar a ingresos/gastos...');
        
        const credito1 = {
            usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
            descripcion: 'Préstamo Personal BCP',
            monto: 15000.00
        };

        const response1 = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(credito1)
        });

        if (response1.ok) {
            console.log('✅ Crédito 1 insertado exitosamente');
            
            // Si funciona, insertar más datos
            const creditosBasicos = [
                {
                    usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    descripcion: 'Línea de Crédito BBVA',
                    monto: 8000.00
                },
                {
                    usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    descripcion: 'Crédito Vehicular',
                    monto: 25000.00
                },
                {
                    usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    descripcion: 'Tarjeta de Crédito',
                    monto: 3500.00
                }
            ];

            const response2 = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(creditosBasicos)
            });

            if (response2.ok) {
                console.log(`✅ ${creditosBasicos.length} créditos adicionales insertados`);
                
                // Verificar resultado final
                const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*`, {
                    headers: headers
                });
                
                if (verifyResponse.ok) {
                    const data = await verifyResponse.json();
                    console.log(`📊 Total créditos en tabla: ${data.length}`);
                    
                    if (data.length > 0) {
                        const columnas = Object.keys(data[0]);
                        console.log(`📝 Estructura real (${columnas.length} columnas): ${columnas.join(', ')}`);
                        console.log('📄 Ejemplo de registro:');
                        console.log(JSON.stringify(data[0], null, 2));
                        
                        const totalMonto = data.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                        console.log(`💰 Monto total: S/ ${totalMonto.toLocaleString('es-PE')}`);
                    }
                }
            } else {
                const errorText2 = await response2.text();
                console.log(`❌ Error insertando batch: ${response2.status}`);
                console.log(errorText2);
            }
        } else {
            const errorText1 = await response1.text();
            console.log(`❌ Error insertando crédito básico: ${response1.status}`);
            console.log(errorText1);
            
            // Probar con aún menos campos
            console.log('\n🔄 Intentando con solo usuario_id...');
            
            const creditoMinimo = {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5'
            };

            const response3 = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(creditoMinimo)
            });

            if (response3.ok) {
                console.log('✅ Crédito mínimo insertado');
                
                // Ver qué se insertó para entender la estructura
                const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*&limit=1`, {
                    headers: headers
                });
                
                if (verifyResponse.ok) {
                    const data = await verifyResponse.json();
                    if (data.length > 0) {
                        const columnas = Object.keys(data[0]);
                        console.log(`📝 Estructura detectada: ${columnas.join(', ')}`);
                        console.log('📄 Registro:', JSON.stringify(data[0], null, 2));
                    }
                }
            } else {
                const errorText3 = await response3.text();
                console.log(`❌ Ni siquiera usuario_id funciona: ${response3.status}`);
                console.log(errorText3);
            }
        }

    } catch (error) {
        console.log(`❌ Error general: ${error.message}`);
    }

    console.log('\n🎯 RESULTADO');
    console.log('=============');
    console.log('Si este script funciona, el módulo de reportes podrá mostrar datos de créditos');
    console.log('Si falla, necesitamos crear la tabla con el SQL que preparé anteriormente');
}

// Ejecutar
insertarCreditosBasicos();
