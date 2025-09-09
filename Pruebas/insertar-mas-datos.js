// Insertar datos adicionales con estructura confirmada
async function insertarMasDatos() {
    console.log('🎯 INSERTANDO MÁS DATOS CON ESTRUCTURA CONFIRMADA');
    console.log('================================================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const serviceHeaders = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };
    
    const usuarioId = '18f58646-fb57-48be-91b8-58beccc21bf5';
    
    // Estructura confirmada: usuario_id, descripcion, monto, fecha
    
    console.log('\n💰 INSERTANDO INGRESOS ADICIONALES...');
    
    const ingresos = [
        {
            usuario_id: usuarioId,
            descripcion: 'Freelance desarrollo web',
            monto: 1200000,
            fecha: '2025-09-01'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Venta producto usado',
            monto: 350000,
            fecha: '2025-09-03'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Consultoría técnica',
            monto: 800000,
            fecha: '2025-09-05'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Dividendos inversión',
            monto: 150000,
            fecha: '2025-09-07'
        }
    ];
    
    for (const ingreso of ingresos) {
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/ingresos`, {
                method: 'POST',
                headers: serviceHeaders,
                body: JSON.stringify(ingreso)
            });
            
            if (response.status === 201) {
                console.log(`✅ ${ingreso.descripcion}: $${ingreso.monto.toLocaleString()}`);
            } else {
                const error = await response.text();
                console.log(`❌ Error: ${error}`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }
    
    console.log('\n💸 INSERTANDO GASTOS ADICIONALES...');
    
    const gastos = [
        {
            usuario_id: usuarioId,
            descripcion: 'Gasolina',
            monto: 120000,
            fecha: '2025-09-01'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Almuerzo restaurante',
            monto: 65000,
            fecha: '2025-09-02'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Farmacia medicamentos',
            monto: 45000,
            fecha: '2025-09-03'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Pago servicios públicos',
            monto: 280000,
            fecha: '2025-09-04'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Compra ropa',
            monto: 180000,
            fecha: '2025-09-05'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Taxi',
            monto: 25000,
            fecha: '2025-09-06'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Café',
            monto: 8000,
            fecha: '2025-09-07'
        },
        {
            usuario_id: usuarioId,
            descripcion: 'Supermercado semanal',
            monto: 220000,
            fecha: '2025-09-08'
        }
    ];
    
    for (const gasto of gastos) {
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/gastos`, {
                method: 'POST',
                headers: serviceHeaders,
                body: JSON.stringify(gasto)
            });
            
            if (response.status === 201) {
                console.log(`✅ ${gasto.descripcion}: $${gasto.monto.toLocaleString()}`);
            } else {
                const error = await response.text();
                console.log(`❌ Error: ${error}`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }
    
    // Verificar totales
    console.log('\n📊 VERIFICANDO TOTALES...');
    
    try {
        const ingresosResponse = await fetch(`${supabaseUrl}/rest/v1/ingresos?usuario_id=eq.${usuarioId}&select=monto`, {
            headers: serviceHeaders
        });
        
        const gastosResponse = await fetch(`${supabaseUrl}/rest/v1/gastos?usuario_id=eq.${usuarioId}&select=monto`, {
            headers: serviceHeaders
        });
        
        if (ingresosResponse.ok && gastosResponse.ok) {
            const ingresosData = await ingresosResponse.json();
            const gastosData = await gastosResponse.json();
            
            const totalIngresos = ingresosData.reduce((sum, item) => sum + item.monto, 0);
            const totalGastos = gastosData.reduce((sum, item) => sum + item.monto, 0);
            const balance = totalIngresos - totalGastos;
            
            console.log(`💰 Total Ingresos: $${totalIngresos.toLocaleString()} (${ingresosData.length} registros)`);
            console.log(`💸 Total Gastos: $${totalGastos.toLocaleString()} (${gastosData.length} registros)`);
            console.log(`💯 Balance: $${balance.toLocaleString()}`);
            
            if (balance > 0) {
                console.log('✅ Balance positivo - ¡Excelente gestión financiera!');
            } else {
                console.log('⚠️ Balance negativo - Revisar gastos');
            }
        }
        
    } catch (e) {
        console.log(`❌ Error verificando totales: ${e.message}`);
    }
    
    console.log('\n🎯 DATOS INSERTADOS COMPLETAMENTE');
    console.log('📊 El dashboard ahora debería mostrar gráficos reales');
    console.log('🔗 Recarga la página del dashboard para ver los cambios');
}

insertarMasDatos();
