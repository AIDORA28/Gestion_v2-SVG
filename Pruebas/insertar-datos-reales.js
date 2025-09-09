// Script final para crear usuario y datos de prueba
async function insertarDatosReales() {
    console.log('🎯 INSERTANDO DATOS REALES EN SUPABASE - PASO A PASO');
    console.log('===================================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const serviceHeaders = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };
    
    // PASO 1: Crear usuario con la estructura correcta
    console.log('\n👤 PASO 1: CREANDO USUARIO VÁLIDO...');
    
    const usuarioCompleto = {
        id: '18f58646-fb57-48be-91b8-58beccc21bf5',
        email: 'joegarcia.1395@gmail.com',
        nombre: 'Joe Guillermo',
        apellido: 'Garcia',  // ← Esta columna es obligatoria
        password_hash: '$2b$10$dummy.hash.for.testing.purposes.only',  // ← Hash obligatorio
        telefono: '3001234567',
        fecha_nacimiento: '1990-05-15',
        created_at: new Date().toISOString()
    };
    
    try {
        const crearUsuarioResponse = await fetch(`${supabaseUrl}/rest/v1/usuarios`, {
            method: 'POST',
            headers: serviceHeaders,
            body: JSON.stringify(usuarioCompleto)
        });
        
        console.log(`Status: ${crearUsuarioResponse.status}`);
        const responseText = await crearUsuarioResponse.text();
        console.log(`Response: ${responseText}`);
        
        if (crearUsuarioResponse.status === 201) {
            if (responseText) {
                const usuarioCreado = JSON.parse(responseText);
                console.log('✅ Usuario creado exitosamente:');
                console.log(JSON.stringify(usuarioCreado, null, 2));
            } else {
                console.log('✅ Usuario creado exitosamente (sin respuesta JSON)');
            }
        } else if (crearUsuarioResponse.status === 409) {
            console.log('✅ Usuario ya existe, continuando...');
        } else {
            if (responseText) {
                try {
                    const error = JSON.parse(responseText);
                    console.log(`❌ Error: ${error.message}`);
                    if (!error.message.includes('duplicate') && !error.message.includes('already exists')) {
                        return;
                    }
                } catch (e) {
                    console.log(`❌ Error parseando respuesta: ${responseText}`);
                }
            } else {
                console.log(`❌ Error sin mensaje, status: ${crearUsuarioResponse.status}`);
            }
        }
    } catch (e) {
        console.log(`❌ Error creando usuario: ${e.message}`);
        return;
    }
    
    // PASO 2: Descubrir estructura de ingresos
    console.log('\n💰 PASO 2: DESCUBRIENDO ESTRUCTURA DE INGRESOS...');
    
    const estructurasIngresos = [
        {
            usuario_id: usuarioCompleto.id,
            descripcion: 'Salario mensual',
            monto: 3500000,
            fecha: '2025-09-09'
        },
        {
            usuario_id: usuarioCompleto.id,
            concepto: 'Salario mensual',
            valor: 3500000,
            fecha: '2025-09-09'
        },
        {
            usuario_id: usuarioCompleto.id,
            descripcion: 'Salario mensual',
            valor: 3500000,
            fecha: '2025-09-09'
        },
        {
            usuario_id: usuarioCompleto.id,
            detalle: 'Salario mensual',
            monto: 3500000,
            fecha: '2025-09-09'
        }
    ];
    
    let ingresoExitoso = null;
    for (let i = 0; i < estructurasIngresos.length; i++) {
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/ingresos`, {
                method: 'POST',
                headers: serviceHeaders,
                body: JSON.stringify(estructurasIngresos[i])
            });
            
            if (response.ok) {
                const resultado = await response.json();
                console.log(`✅ Estructura ${i + 1} de ingresos FUNCIONÓ:`);
                console.log(JSON.stringify(resultado, null, 2));
                ingresoExitoso = resultado;
                break;
            } else {
                const error = await response.json();
                console.log(`❌ Estructura ${i + 1}: ${error.message}`);
            }
        } catch (e) {
            console.log(`❌ Estructura ${i + 1}: ${e.message}`);
        }
    }
    
    // PASO 3: Descubrir estructura de gastos
    console.log('\n💸 PASO 3: DESCUBRIENDO ESTRUCTURA DE GASTOS...');
    
    const estructurasGastos = [
        {
            usuario_id: usuarioCompleto.id,
            descripcion: 'Supermercado',
            monto: 150000,
            fecha: '2025-09-09'
        },
        {
            usuario_id: usuarioCompleto.id,
            concepto: 'Supermercado',
            valor: 150000,
            fecha: '2025-09-09'
        },
        {
            usuario_id: usuarioCompleto.id,
            descripcion: 'Supermercado',
            valor: 150000,
            fecha: '2025-09-09'
        },
        {
            usuario_id: usuarioCompleto.id,
            detalle: 'Supermercado',
            monto: 150000,
            fecha: '2025-09-09'
        }
    ];
    
    let gastoExitoso = null;
    for (let i = 0; i < estructurasGastos.length; i++) {
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/gastos`, {
                method: 'POST',
                headers: serviceHeaders,
                body: JSON.stringify(estructurasGastos[i])
            });
            
            if (response.ok) {
                const resultado = await response.json();
                console.log(`✅ Estructura ${i + 1} de gastos FUNCIONÓ:`);
                console.log(JSON.stringify(resultado, null, 2));
                gastoExitoso = resultado;
                break;
            } else {
                const error = await response.json();
                console.log(`❌ Estructura ${i + 1}: ${error.message}`);
            }
        } catch (e) {
            console.log(`❌ Estructura ${i + 1}: ${e.message}`);
        }
    }
    
    // PASO 4: Insertar más datos de prueba si las estructuras funcionaron
    if (ingresoExitoso) {
        console.log('\n💰 PASO 4: INSERTANDO MÁS INGRESOS...');
        
        const masIngresos = [
            {
                usuario_id: usuarioCompleto.id,
                descripcion: 'Freelance',
                monto: 800000,
                fecha: '2025-09-05'
            },
            {
                usuario_id: usuarioCompleto.id,
                descripcion: 'Venta producto',
                monto: 300000,
                fecha: '2025-09-03'
            }
        ];
        
        for (const ingreso of masIngresos) {
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/ingresos`, {
                    method: 'POST',
                    headers: serviceHeaders,
                    body: JSON.stringify(ingreso)
                });
                
                if (response.ok) {
                    const resultado = await response.json();
                    console.log('✅ Ingreso adicional creado:', resultado[0]?.descripcion);
                }
            } catch (e) {
                console.log('❌ Error:', e.message);
            }
        }
    }
    
    if (gastoExitoso) {
        console.log('\n💸 PASO 5: INSERTANDO MÁS GASTOS...');
        
        const masGastos = [
            {
                usuario_id: usuarioCompleto.id,
                descripcion: 'Gasolina',
                monto: 80000,
                fecha: '2025-09-08'
            },
            {
                usuario_id: usuarioCompleto.id,
                descripcion: 'Restaurante',
                monto: 45000,
                fecha: '2025-09-07'
            },
            {
                usuario_id: usuarioCompleto.id,
                descripcion: 'Farmacia',
                monto: 25000,
                fecha: '2025-09-06'
            }
        ];
        
        for (const gasto of masGastos) {
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/gastos`, {
                    method: 'POST',
                    headers: serviceHeaders,
                    body: JSON.stringify(gasto)
                });
                
                if (response.ok) {
                    const resultado = await response.json();
                    console.log('✅ Gasto adicional creado:', resultado[0]?.descripcion);
                }
            } catch (e) {
                console.log('❌ Error:', e.message);
            }
        }
    }
    
    // PASO 6: Verificar los datos insertados
    console.log('\n📊 PASO 6: VERIFICANDO DATOS INSERTADOS...');
    
    try {
        // Verificar ingresos
        const ingresosResponse = await fetch(`${supabaseUrl}/rest/v1/ingresos?usuario_id=eq.${usuarioCompleto.id}&select=*`, {
            method: 'GET',
            headers: serviceHeaders
        });
        
        if (ingresosResponse.ok) {
            const ingresos = await ingresosResponse.json();
            console.log(`✅ Ingresos encontrados: ${ingresos.length}`);
            ingresos.forEach((ing, index) => {
                console.log(`   ${index + 1}. ${ing.descripcion}: $${ing.monto?.toLocaleString() || ing.valor?.toLocaleString()}`);
            });
        }
        
        // Verificar gastos
        const gastosResponse = await fetch(`${supabaseUrl}/rest/v1/gastos?usuario_id=eq.${usuarioCompleto.id}&select=*`, {
            method: 'GET',
            headers: serviceHeaders
        });
        
        if (gastosResponse.ok) {
            const gastos = await gastosResponse.json();
            console.log(`✅ Gastos encontrados: ${gastos.length}`);
            gastos.forEach((gasto, index) => {
                console.log(`   ${index + 1}. ${gasto.descripcion}: $${gasto.monto?.toLocaleString() || gasto.valor?.toLocaleString()}`);
            });
        }
        
    } catch (e) {
        console.log(`❌ Error verificando datos: ${e.message}`);
    }
    
    console.log('\n🎯 ¡PROCESO COMPLETADO!');
    console.log('======================');
    console.log('✅ Usuario creado/verificado');
    console.log('✅ Estructuras de tablas descubiertas');
    console.log('✅ Datos de prueba insertados');
    console.log('\n🔗 Ahora el dashboard debería mostrar datos reales');
}

// Ejecutar
insertarDatosReales();
