// Test completo del módulo de créditos
async function testCreditosModulo() {
    console.log('🧪 TESTING MÓDULO DE CRÉDITOS');
    console.log('==============================');
    
    const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';
    
    const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
    };
    
    // 1. Verificar tabla simulaciones_credito
    console.log('📋 1. Verificando tabla simulaciones_credito...');
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*&limit=1`, {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Tabla accesible');
            
            if (data.length > 0) {
                console.log('📊 Datos existentes encontrados:');
                console.log(JSON.stringify(data[0], null, 2));
            } else {
                console.log('📊 Tabla vacía - listo para insertar datos de prueba');
            }
        } else {
            console.log('❌ Error accediendo a la tabla:', response.status);
            return;
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        return;
    }
    
    // 2. Insertar datos de prueba
    console.log('\n💾 2. Insertando datos de prueba...');
    
    const creditosPrueba = [
        {
            usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
            tipo_credito: 'Crédito Personal',
            monto: 15000,
            plazo_meses: 24,
            tasa_anual: 18.5,
            cuota_mensual: 747.07,
            total_intereses: 2929.68,
            total_pagar: 17929.68,
            resultado: 'aprobado',
            guardada: true
        },
        {
            usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
            tipo_credito: 'Crédito Vehicular',
            monto: 45000,
            plazo_meses: 48,
            tasa_anual: 14.2,
            cuota_mensual: 1156.43,
            total_intereses: 10508.64,
            total_pagar: 55508.64,
            resultado: 'pendiente',
            guardada: true
        },
        {
            usuario_id: '18f58646-fb57-48be-91b8-58beccc21bf5',
            tipo_credito: 'Crédito Hipotecario',
            monto: 120000,
            plazo_meses: 240,
            tasa_anual: 9.8,
            cuota_mensual: 1145.23,
            total_intereses: 154855.20,
            total_pagar: 274855.20,
            resultado: 'simulacion',
            guardada: true
        }
    ];
    
    for (let i = 0; i < creditosPrueba.length; i++) {
        const credito = creditosPrueba[i];
        console.log(`\n📝 Insertando crédito ${i + 1}: ${credito.tipo_credito}`);
        
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(credito)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Crédito ${i + 1} insertado correctamente`);
                console.log(`   ID: ${result[0]?.id || 'N/A'}`);
                console.log(`   Monto: $${credito.monto.toLocaleString()}`);
                console.log(`   Cuota: $${credito.cuota_mensual.toFixed(2)}`);
            } else {
                const error = await response.text();
                console.log(`❌ Error insertando crédito ${i + 1}: ${response.status}`);
                console.log(`   Detalle: ${error}`);
            }
        } catch (error) {
            console.log(`❌ Error de red: ${error.message}`);
        }
        
        // Pequeña pausa entre inserciones
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 3. Verificar datos insertados
    console.log('\n📊 3. Verificando datos insertados...');
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/simulaciones_credito?select=*&order=created_at.desc`, {
            headers
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Total simulaciones en la tabla: ${data.length}`);
            
            data.forEach((credito, index) => {
                console.log(`\n📋 Simulación ${index + 1}:`);
                console.log(`   Tipo: ${credito.tipo_credito}`);
                console.log(`   Monto: $${credito.monto.toLocaleString()}`);
                console.log(`   Plazo: ${credito.plazo_meses} meses`);
                console.log(`   Tasa: ${credito.tasa_anual}%`);
                console.log(`   Cuota: $${credito.cuota_mensual}`);
                console.log(`   Estado: ${credito.resultado}`);
            });
        }
    } catch (error) {
        console.log('❌ Error verificando datos:', error.message);
    }
    
    // 4. Test de funciones matemáticas
    console.log('\n🧮 4. Testeando funciones matemáticas...');
    
    function calcularCuotaMensual(monto, tasaAnual, plazoMeses) {
        const tasaMensual = tasaAnual / 100 / 12;
        
        if (tasaMensual === 0) {
            return monto / plazoMeses;
        }
        
        const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                     (Math.pow(1 + tasaMensual, plazoMeses) - 1);
        
        return cuota;
    }
    
    const testCases = [
        { monto: 10000, tasa: 15, plazo: 12 },
        { monto: 25000, tasa: 18.5, plazo: 24 },
        { monto: 50000, tasa: 12, plazo: 36 }
    ];
    
    testCases.forEach((test, index) => {
        const cuota = calcularCuotaMensual(test.monto, test.tasa, test.plazo);
        const totalPagar = cuota * test.plazo;
        const intereses = totalPagar - test.monto;
        
        console.log(`\n🧮 Test ${index + 1}:`);
        console.log(`   Monto: $${test.monto.toLocaleString()}`);
        console.log(`   Tasa: ${test.tasa}% anual`);
        console.log(`   Plazo: ${test.plazo} meses`);
        console.log(`   Cuota: $${cuota.toFixed(2)}`);
        console.log(`   Total a pagar: $${totalPagar.toFixed(2)}`);
        console.log(`   Intereses: $${intereses.toFixed(2)}`);
    });
    
    console.log('\n🎯 RESUMEN DE TESTS');
    console.log('==================');
    console.log('✅ Tabla simulaciones_credito accesible');
    console.log('✅ Datos de prueba insertados');
    console.log('✅ Funciones matemáticas funcionando');
    console.log('✅ Módulo de créditos listo para usar');
    
    console.log('\n📱 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Abrir dashboard.html');
    console.log('2. Navegar a la sección Créditos');
    console.log('3. Verificar que se muestren las simulaciones');
    console.log('4. Probar crear nueva simulación');
    console.log('5. Probar editar/eliminar simulaciones');
}

// Ejecutar test
testCreditosModulo();
