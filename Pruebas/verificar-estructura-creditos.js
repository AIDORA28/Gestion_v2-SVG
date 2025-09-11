// Verificar estructura específica de la tabla simulaciones_credito
async function verificarEstructuraCreditos() {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA SIMULACIONES_CREDITO');
    console.log('=====================================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };

    try {
        // Intentar obtener información de la tabla
        console.log('📋 Método 1: Intentar SELECT con límite...');
        const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*&limit=1`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Respuesta exitosa');
            console.log('📊 Datos obtenidos:', data);
            
            if (data.length > 0) {
                const columnas = Object.keys(data[0]);
                console.log(`📝 Columnas encontradas (${columnas.length}):`, columnas);
                console.log('📄 Ejemplo de registro:', data[0]);
            } else {
                console.log('📊 Tabla vacía, pero accesible');
            }
        } else {
            console.log(`❌ Error HTTP: ${response.status}`);
            const errorText = await response.text();
            console.log('📄 Respuesta de error:', errorText);
        }

        // Método 2: Intentar insertar un registro de prueba para ver la estructura
        console.log('\n📋 Método 2: Probar estructura con INSERT...');
        const creditoPrueba = {
            usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
            tipo_credito: 'personal',
            monto_solicitado: 10000,
            plazo_meses: 12,
            tasa_interes: 15.5,
            entidad_financiera: 'Banco de Prueba',
            estado: 'simulacion',
            cuota_mensual: 950.84,
            total_intereses: 1410.08,
            total_pagar: 11410.08,
            fecha_simulacion: '2025-09-10',
            notas: 'Simulación de prueba para verificar estructura'
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(creditoPrueba)
        });

        if (insertResponse.ok) {
            console.log('✅ INSERT exitoso - estructura identificada');
            const insertedData = await insertResponse.json();
            console.log('📊 Registro insertado:', insertedData);
            
            // Ahora obtener la estructura completa
            const getResponse = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*&limit=1`, {
                headers: headers
            });
            
            if (getResponse.ok) {
                const fullData = await getResponse.json();
                if (fullData.length > 0) {
                    const columnas = Object.keys(fullData[0]);
                    console.log(`📝 Estructura completa (${columnas.length} columnas):`, columnas);
                    
                    // Mostrar tipos de datos inferidos
                    console.log('\n📋 ANÁLISIS DE TIPOS DE DATOS:');
                    for (const [key, value] of Object.entries(fullData[0])) {
                        const tipo = typeof value;
                        const esFecha = key.includes('fecha') || key.includes('created') || key.includes('updated');
                        const esID = key.includes('id');
                        console.log(`   ${key}: ${tipo}${esFecha ? ' (fecha)' : ''}${esID ? ' (UUID)' : ''} = ${value}`);
                    }
                }
            }
        } else {
            console.log(`❌ INSERT falló: ${insertResponse.status}`);
            const errorText = await insertResponse.text();
            console.log('📄 Error:', errorText);
            
            // Intentar analizar el error para entender la estructura esperada
            try {
                const errorObj = JSON.parse(errorText);
                if (errorObj.message) {
                    console.log('💡 Analizando error para entender estructura...');
                    console.log('   Mensaje:', errorObj.message);
                }
            } catch (e) {
                console.log('   Error no parseado:', errorText);
            }
        }

        // Método 3: Intentar DESCRIBE o información del esquema
        console.log('\n📋 Método 3: Consultar metadatos de la tabla...');
        
        // En PostgreSQL/Supabase, podemos consultar information_schema
        const schemaQuery = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'simulaciones_credito'
            ORDER BY ordinal_position
        `;

        const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ sql: schemaQuery })
        });

        if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            console.log('✅ Esquema obtenido:', schemaData);
        } else {
            console.log('❌ No se pudo obtener esquema via RPC');
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
    }

    console.log('\n🎯 PROPUESTA DE ESTRUCTURA PARA CRÉDITOS');
    console.log('========================================');
    console.log('Basándome en sistemas financieros típicos, sugiero:');
    console.log(`
📋 ESTRUCTURA ESPERADA:
- id (UUID, PK)
- usuario_id (UUID, FK -> usuarios)
- tipo_credito (VARCHAR) - personal, hipotecario, vehicular, empresarial
- entidad_financiera (VARCHAR) 
- monto_solicitado (NUMERIC)
- monto_aprobado (NUMERIC) 
- plazo_meses (INTEGER)
- tasa_interes (NUMERIC) - porcentaje anual
- cuota_mensual (NUMERIC)
- total_intereses (NUMERIC)
- total_pagar (NUMERIC)
- estado (VARCHAR) - simulacion, solicitado, aprobado, rechazado, activo, pagado
- fecha_simulacion (DATE)
- fecha_solicitud (DATE)
- fecha_aprobacion (DATE)
- fecha_primer_pago (DATE)
- notas (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
    `);
}

verificarEstructuraCreditos();
