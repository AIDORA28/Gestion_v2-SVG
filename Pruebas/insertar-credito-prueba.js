// Insertar crédito con estructura correcta
async function insertarCreditoPrueba() {
    console.log('🔍 INSERTANDO CRÉDITO CON ESTRUCTURA CORRECTA');
    console.log('============================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };

    // Basándome en el error, parece que la estructura es similar a ingresos/gastos
    // pero con campo 'monto' obligatorio
    const credito = {
        usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
        monto: 15000,  // Campo obligatorio
        descripcion: 'Crédito personal para mejoras del hogar',
        tipo: 'personal',
        plazo: 24,
        tasa: 18.5,
        cuota: 789.50,
        estado: 'simulacion',
        fecha: '2025-09-10',
        notas: 'Simulación de crédito personal con tasa competitiva'
    };

    console.log('📋 Intentando insertar crédito:');
    console.log(JSON.stringify(credito, null, 2));

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(credito)
        });

        if (response.ok) {
            console.log('✅ ¡ÉXITO! Crédito insertado correctamente');
            const data = await response.json();
            console.log('📊 Registro creado:', data);
            
            // Obtener la estructura completa
            const getResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*`, {
                headers: headers
            });
            
            if (getResponse.ok) {
                const allData = await getResponse.json();
                if (allData.length > 0) {
                    const columnas = Object.keys(allData[0]);
                    console.log(`\n📝 ESTRUCTURA COMPLETA DESCUBIERTA (${columnas.length} columnas):`);
                    console.log('   Columnas:', columnas.join(', '));
                    
                    console.log('\n📋 ANÁLISIS DETALLADO DE LA ESTRUCTURA:');
                    for (const [key, value] of Object.entries(allData[0])) {
                        const tipo = typeof value;
                        const esNull = value === null;
                        const esBoolean = tipo === 'boolean';
                        const esNumero = tipo === 'number';
                        const esFecha = (typeof value === 'string' && (value.includes('T') || key.includes('fecha')));
                        
                        let tipoInfo = tipo;
                        if (esNull) tipoInfo += ' (NULL)';
                        if (esBoolean) tipoInfo += ' (boolean)';
                        if (esNumero) tipoInfo += ' (numeric)';
                        if (esFecha) tipoInfo += ' (timestamp/date)';
                        
                        console.log(`   ${key.padEnd(20)}: ${tipoInfo.padEnd(20)} = ${JSON.stringify(value)}`);
                    }
                    
                    console.log('\n🎯 ESTRUCTURA PARA EL MÓDULO DE CRÉDITOS:');
                    console.log('=========================================');
                    
                    // Crear la estructura que necesitamos para el módulo
                    const estructuraModulo = {
                        campos_principales: [],
                        campos_opcionales: [],
                        campos_sistema: []
                    };
                    
                    for (const [key, value] of Object.entries(allData[0])) {
                        if (['id', 'created_at', 'updated_at'].includes(key)) {
                            estructuraModulo.campos_sistema.push(key);
                        } else if (['usuario_id', 'monto'].includes(key)) {
                            estructuraModulo.campos_principales.push(key);
                        } else {
                            estructuraModulo.campos_opcionales.push(key);
                        }
                    }
                    
                    console.log('📋 Campos principales (obligatorios):', estructuraModulo.campos_principales.join(', '));
                    console.log('📋 Campos opcionales:', estructuraModulo.campos_opcionales.join(', '));
                    console.log('📋 Campos del sistema:', estructuraModulo.campos_sistema.join(', '));
                    
                    return allData[0];
                }
            }
        } else {
            console.log(`❌ Falló: ${response.status}`);
            const errorText = await response.text();
            console.log('📄 Error completo:', errorText);
            
            // Si el error menciona una columna específica, ajustemos
            if (errorText.includes('column')) {
                console.log('\n💡 Ajustando estructura basándome en el error...');
                
                // Probar solo con campos básicos
                const creditoBasico = {
                    usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
                    monto: 15000
                };
                
                const basicResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(creditoBasico)
                });
                
                if (basicResponse.ok) {
                    console.log('✅ Inserción básica exitosa');
                    const basicData = await basicResponse.json();
                    console.log('📊 Registro básico:', basicData);
                } else {
                    console.log(`❌ Inserción básica también falló: ${basicResponse.status}`);
                    const basicError = await basicResponse.text();
                    console.log('📄 Error básico:', basicError);
                }
            }
        }
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
    }
}

insertarCreditoPrueba();
