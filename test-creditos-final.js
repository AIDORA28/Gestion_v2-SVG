// Insertar crédito final con estructura correcta
async function insertarCreditoFinal() {
    console.log('🔍 INSERTANDO CRÉDITO CON CAMPOS OBLIGATORIOS');
    console.log('===========================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };

    // Basándome en los errores, estos son los campos obligatorios
    const credito = {
        usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
        monto: 25000,           // Campo obligatorio
        plazo_meses: 36,        // Campo obligatorio
        tasa_anual: 18.5        // Campo obligatorio según último error
    };

    console.log('📋 Insertando crédito con campos obligatorios:');
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
            
            // Obtener todos los registros para ver la estructura
            const getResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*`, {
                headers: headers
            });
            
            if (getResponse.ok) {
                const allData = await getResponse.json();
                console.log(`\n📊 Total registros en tabla: ${allData.length}`);
                
                if (allData.length > 0) {
                    const registro = allData[0];
                    const columnas = Object.keys(registro);
                    
                    console.log(`\n📝 ESTRUCTURA COMPLETA DESCUBIERTA (${columnas.length} columnas):`);
                    console.log('   Columnas:', columnas.join(', '));
                    
                    console.log('\n📋 ANÁLISIS DETALLADO DE CADA CAMPO:');
                    for (const [key, value] of Object.entries(registro)) {
                        const tipo = typeof value;
                        const esNull = value === null;
                        const esBoolean = tipo === 'boolean';
                        const esNumero = tipo === 'number';
                        const esFecha = (typeof value === 'string' && (value.includes('T') || key.includes('fecha')));
                        const esUUID = (typeof value === 'string' && value.length === 36 && value.includes('-'));
                        
                        let tipoInfo = tipo;
                        if (esNull) tipoInfo += ' (NULL)';
                        if (esBoolean) tipoInfo += ' (boolean)';
                        if (esNumero) tipoInfo += ' (numeric)';
                        if (esFecha) tipoInfo += ' (timestamp)';
                        if (esUUID) tipoInfo += ' (UUID)';
                        
                        console.log(`   ${key.padEnd(25)}: ${tipoInfo.padEnd(25)} = ${JSON.stringify(value)}`);
                    }
                    
                    console.log('\n🎯 ESTRUCTURA PARA IMPLEMENTAR EL MÓDULO:');
                    console.log('=========================================');
                    
                    // Clasificar campos para el módulo
                    const clasificacion = {
                        obligatorios: ['usuario_id', 'monto', 'plazo_meses'],
                        financieros: [],
                        informativos: [],
                        sistema: ['id', 'created_at', 'updated_at']
                    };
                    
                    for (const key of columnas) {
                        if (!clasificacion.obligatorios.includes(key) && !clasificacion.sistema.includes(key)) {
                            if (key.includes('tasa') || key.includes('interes') || key.includes('cuota') || key.includes('total')) {
                                clasificacion.financieros.push(key);
                            } else {
                                clasificacion.informativos.push(key);
                            }
                        }
                    }
                    
                    console.log('📋 Campos obligatorios:', clasificacion.obligatorios.join(', '));
                    console.log('📋 Campos financieros:', clasificacion.financieros.join(', '));
                    console.log('📋 Campos informativos:', clasificacion.informativos.join(', '));
                    console.log('📋 Campos del sistema:', clasificacion.sistema.join(', '));
                    
                    // Crear estructura para el template
                    console.log('\n🚀 CONFIGURACIÓN PARA EL TEMPLATE DE CRÉDITOS:');
                    console.log('==============================================');
                    
                    const templateConfig = {
                        tabla: 'simulaciones_credito',
                        campos: clasificacion,
                        ejemplo: registro
                    };
                    
                    console.log(JSON.stringify(templateConfig, null, 2));
                    
                    return templateConfig;
                }
            }
        } else {
            console.log(`❌ Falló: ${response.status}`);
            const errorText = await response.text();
            console.log('📄 Error:', errorText);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

insertarCreditoFinal();
