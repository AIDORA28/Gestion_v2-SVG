// Probar estructura básica de simulaciones_credito
async function probarEstructuraBasica() {
    console.log('🔍 PROBANDO ESTRUCTURA BÁSICA DE SIMULACIONES_CREDITO');
    console.log('===================================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };

    // Campos básicos que probablemente existen (similar a ingresos/gastos)
    const estructurasProbar = [
        // Estructura mínima
        {
            nombre: 'Estructura Mínima',
            datos: {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                monto: 10000,
                descripcion: 'Prueba básica'
            }
        },
        // Con campos financieros básicos
        {
            nombre: 'Estructura Financiera Básica',
            datos: {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                monto_solicitado: 10000,
                plazo_meses: 12,
                tasa_interes: 15.5
            }
        },
        // Estructura similar a ingresos/gastos
        {
            nombre: 'Estructura Similar a Ingresos/Gastos',
            datos: {
                usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                descripcion: 'Crédito personal de prueba',
                monto: 10000,
                categoria: 'personal',
                fecha: '2025-09-10',
                notas: 'Simulación de prueba'
            }
        }
    ];

    for (const estructura of estructurasProbar) {
        console.log(`\n📋 Probando: ${estructura.nombre}`);
        console.log('   Datos:', JSON.stringify(estructura.datos, null, 2));
        
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(estructura.datos)
            });

            if (response.ok) {
                console.log('✅ ¡ÉXITO! Estructura válida encontrada');
                const data = await response.json();
                console.log('📊 Registro creado:', data);
                
                // Obtener el registro completo para ver todas las columnas
                const getResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*&limit=1`, {
                    headers: headers
                });
                
                if (getResponse.ok) {
                    const fullData = await getResponse.json();
                    if (fullData.length > 0) {
                        const columnas = Object.keys(fullData[0]);
                        console.log(`📝 ESTRUCTURA COMPLETA DESCUBIERTA (${columnas.length} columnas):`);
                        console.log('   Columnas:', columnas.join(', '));
                        console.log('📄 Registro completo:', fullData[0]);
                        
                        console.log('\n🎯 ANÁLISIS DE LA ESTRUCTURA:');
                        for (const [key, value] of Object.entries(fullData[0])) {
                            const tipo = typeof value;
                            const esNull = value === null;
                            console.log(`   ${key}: ${tipo}${esNull ? ' (NULL)' : ''} = ${JSON.stringify(value)}`);
                        }
                        
                        return fullData[0]; // Salir después del primer éxito
                    }
                }
                
                break; // Salir del bucle si tuvimos éxito
            } else {
                console.log(`❌ Falló: ${response.status}`);
                const errorText = await response.text();
                console.log('📄 Error:', errorText);
                
                // Analizar error para obtener pistas
                if (errorText.includes('column') && errorText.includes('not found')) {
                    const match = errorText.match(/'([^']+)' column/);
                    if (match) {
                        console.log(`💡 Columna no encontrada: ${match[1]}`);
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Error de conexión: ${error.message}`);
        }
    }

    console.log('\n🔍 INTENTANDO MÉTODO ALTERNATIVO...');
    
    // Método alternativo: crear con solo campos obligatorios
    const camposMinimos = {
        usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5'
    };

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(camposMinimos)
        });

        if (response.ok) {
            console.log('✅ Inserción con campos mínimos exitosa');
            const data = await response.json();
            console.log('📊 Datos:', data);
        } else {
            console.log(`❌ Falló con campos mínimos: ${response.status}`);
            const errorText = await response.text();
            console.log('📄 Error:', errorText);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

probarEstructuraBasica();
