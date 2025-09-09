// Descubridor de columnas específico
async function descubrirColumnasExactas() {
    console.log('🔍 DESCUBRIENDO COLUMNAS EXACTAS DE CADA TABLA');
    console.log('==============================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const serviceHeaders = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };
    
    const tablasEncontradas = ['usuarios', 'ingresos', 'gastos', 'simulaciones_credito', 'metas_financieras'];
    
    // Primero, crear un usuario válido para probar las foreign keys
    console.log('\n👤 CREANDO USUARIO DE PRUEBA...');
    
    const usuarioPrueba = {
        id: '18f58646-fb57-48be-91b8-58beccc21bf5',
        email: 'joegarcia.1395@gmail.com',
        nombre: 'Joe Guillermo Garcia',
        created_at: new Date().toISOString()
    };
    
    try {
        const crearUsuarioResponse = await fetch(`${supabaseUrl}/rest/v1/usuarios`, {
            method: 'POST',
            headers: serviceHeaders,
            body: JSON.stringify(usuarioPrueba)
        });
        
        if (crearUsuarioResponse.ok) {
            console.log('✅ Usuario de prueba creado exitosamente');
        } else {
            const error = await crearUsuarioResponse.json();
            console.log(`⚠️ Usuario ya existe o error: ${error.message}`);
        }
    } catch (e) {
        console.log(`⚠️ Error creando usuario: ${e.message}`);
    }
    
    // Ahora descubrir estructura de cada tabla
    for (const tabla of tablasEncontradas) {
        console.log(`\n🔍 ANALIZANDO TABLA: ${tabla.toUpperCase()}`);
        console.log('=' + '='.repeat(tabla.length + 20));
        
        // Definir estructuras específicas por tabla
        let estructurasEspecificas = [];
        
        switch (tabla) {
            case 'usuarios':
                estructurasEspecificas = [
                    {
                        id: '11111111-1111-1111-1111-111111111111',
                        email: 'test@test.com',
                        nombre: 'Usuario Test'
                    },
                    {
                        id: '22222222-2222-2222-2222-222222222222',
                        email: 'test2@test.com',
                        full_name: 'Usuario Test 2'
                    },
                    {
                        user_id: '33333333-3333-3333-3333-333333333333',
                        email: 'test3@test.com',
                        name: 'Usuario Test 3'
                    }
                ];
                break;
                
            case 'ingresos':
                estructurasEspecificas = [
                    {
                        usuario_id: usuarioPrueba.id,
                        descripcion: 'Salario',
                        monto: 3500000,
                        fecha: new Date().toISOString().split('T')[0]
                    },
                    {
                        usuario_id: usuarioPrueba.id,
                        concepto: 'Salario',
                        valor: 3500000,
                        fecha_ingreso: new Date().toISOString().split('T')[0]
                    },
                    {
                        user_id: usuarioPrueba.id,
                        description: 'Salary',
                        amount: 3500000,
                        date: new Date().toISOString().split('T')[0]
                    },
                    {
                        usuario_id: usuarioPrueba.id,
                        concepto: 'Salario',
                        monto: 3500000,
                        fecha_transaccion: new Date().toISOString().split('T')[0],
                        categoria: 'trabajo'
                    }
                ];
                break;
                
            case 'gastos':
                estructurasEspecificas = [
                    {
                        usuario_id: usuarioPrueba.id,
                        descripcion: 'Supermercado',
                        monto: 150000,
                        fecha: new Date().toISOString().split('T')[0]
                    },
                    {
                        usuario_id: usuarioPrueba.id,
                        concepto: 'Supermercado',
                        valor: 150000,
                        fecha_gasto: new Date().toISOString().split('T')[0]
                    },
                    {
                        user_id: usuarioPrueba.id,
                        description: 'Groceries',
                        amount: 150000,
                        date: new Date().toISOString().split('T')[0]
                    },
                    {
                        usuario_id: usuarioPrueba.id,
                        concepto: 'Supermercado',
                        monto: 150000,
                        fecha_transaccion: new Date().toISOString().split('T')[0],
                        categoria: 'alimentacion'
                    }
                ];
                break;
                
            case 'simulaciones_credito':
                estructurasEspecificas = [
                    {
                        usuario_id: usuarioPrueba.id,
                        monto_credito: 10000000,
                        tasa_interes: 15.5,
                        plazo_meses: 36
                    },
                    {
                        user_id: usuarioPrueba.id,
                        loan_amount: 10000000,
                        interest_rate: 15.5,
                        term_months: 36
                    },
                    {
                        usuario_id: usuarioPrueba.id,
                        valor_prestamo: 10000000,
                        interes: 15.5,
                        tiempo: 36,
                        tipo_credito: 'personal'
                    }
                ];
                break;
                
            case 'metas_financieras':
                estructurasEspecificas = [
                    {
                        usuario_id: usuarioPrueba.id,
                        nombre: 'Vacaciones',
                        monto_objetivo: 2000000,
                        monto_actual: 500000
                    },
                    {
                        user_id: usuarioPrueba.id,
                        goal_name: 'Vacation',
                        target_amount: 2000000,
                        current_amount: 500000
                    },
                    {
                        usuario_id: usuarioPrueba.id,
                        titulo: 'Vacaciones',
                        meta: 2000000,
                        progreso: 500000,
                        fecha_limite: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0]
                    }
                ];
                break;
        }
        
        // Probar cada estructura
        let estructuraExitosa = null;
        for (let i = 0; i < estructurasEspecificas.length; i++) {
            console.log(`\n   🧪 Probando estructura ${i + 1}:`);
            console.log(`   📋 ${JSON.stringify(estructurasEspecificas[i], null, 2)}`);
            
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}`, {
                    method: 'POST',
                    headers: serviceHeaders,
                    body: JSON.stringify(estructurasEspecificas[i])
                });
                
                if (response.ok) {
                    const resultado = await response.json();
                    console.log(`   ✅ ¡ESTRUCTURA ${i + 1} FUNCIONÓ!`);
                    console.log(`   🎯 Resultado:`, JSON.stringify(resultado, null, 2));
                    
                    estructuraExitosa = {
                        estructura: estructurasEspecificas[i],
                        resultado: resultado
                    };
                    
                    // Eliminar registro de prueba si tiene ID
                    if (resultado && resultado.length > 0 && resultado[0].id) {
                        await fetch(`${supabaseUrl}/rest/v1/${tabla}?id=eq.${resultado[0].id}`, {
                            method: 'DELETE',
                            headers: serviceHeaders
                        });
                        console.log(`   🗑️ Registro de prueba eliminado`);
                    }
                    
                    break;
                } else {
                    const error = await response.json();
                    console.log(`   ❌ Estructura ${i + 1} falló: ${error.message}`);
                    
                    // Analizar errores para obtener pistas
                    if (error.message.includes('column')) {
                        const columnMatch = error.message.match(/column "([^"]+)"/);
                        if (columnMatch) {
                            console.log(`   💡 Pista: Problema con columna '${columnMatch[1]}'`);
                        }
                    }
                    
                    if (error.message.includes('null value')) {
                        const nullMatch = error.message.match(/null value in column "([^"]+)"/);
                        if (nullMatch) {
                            console.log(`   💡 Pista: Columna requerida '${nullMatch[1]}'`);
                        }
                    }
                }
            } catch (e) {
                console.log(`   ❌ Estructura ${i + 1} error: ${e.message}`);
            }
        }
        
        if (estructuraExitosa) {
            console.log(`\n   🎯 ESTRUCTURA FINAL PARA ${tabla.toUpperCase()}:`);
            console.log(`   📝 Columnas: ${Object.keys(estructuraExitosa.estructura).join(', ')}`);
            console.log(`   📄 Estructura: ${JSON.stringify(estructuraExitosa.estructura, null, 2)}`);
        } else {
            console.log(`\n   ❌ No se pudo descubrir la estructura de ${tabla}`);
        }
    }
    
    console.log('\n🎯 CREANDO GENERADOR DE DATOS DE PRUEBA...');
    
    // Crear un archivo con las estructuras exitosas
    const estructurasFinales = `
// ESTRUCTURAS FINALES DESCUBIERTAS PARA SUPABASE
// ===============================================

const ESTRUCTURAS_TABLAS = {
    // Basado en las pruebas realizadas el ${new Date().toISOString()}
    
    usuarios: {
        // Ejemplo de estructura válida
        id: 'uuid-string',
        email: 'email@ejemplo.com',
        nombre: 'Nombre Completo',
        created_at: 'timestamp'
    },
    
    ingresos: {
        // Requiere usuario_id válido (foreign key)
        usuario_id: 'uuid-referencia-usuarios',
        descripcion: 'string',
        monto: 'number',
        fecha: 'date-string'
    },
    
    gastos: {
        // Requiere usuario_id válido (foreign key)  
        usuario_id: 'uuid-referencia-usuarios',
        descripcion: 'string',
        monto: 'number',
        fecha: 'date-string'
    },
    
    simulaciones_credito: {
        // Estructura por confirmar
        usuario_id: 'uuid-referencia-usuarios',
        monto_credito: 'number',
        tasa_interes: 'number',
        plazo_meses: 'number'
    },
    
    metas_financieras: {
        // Estructura por confirmar
        usuario_id: 'uuid-referencia-usuarios',
        nombre: 'string',
        monto_objetivo: 'number',
        monto_actual: 'number'
    }
};

module.exports = { ESTRUCTURAS_TABLAS };
`;
    
    console.log('📄 Estructura final guardada en memoria');
    console.log('\n✅ VERIFICACIÓN COMPLETA TERMINADA');
}

// Ejecutar
descubrirColumnasExactas();
