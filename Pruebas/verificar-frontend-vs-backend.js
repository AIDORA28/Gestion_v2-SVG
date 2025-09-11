/**
 * 🔧 VERIFICADOR DE FUNCIONAMIENTO FRONTEND vs BACKEND
 * 
 * Este script simula exactamente lo que hace el frontend para comparar
 * con el funcionamiento de la prueba que funcionó.
 */

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

const USER_CREDENTIALS = {
    email: 'joegarcia.1395@gmail.com',
    password: '123456'
};

async function simularFrontendCompleto() {
    console.log('🎯 SIMULANDO EXACTAMENTE LO QUE HACE EL FRONTEND');
    console.log('==============================================\n');

    // 1. Autenticar (igual que el frontend)
    console.log('1️⃣ Autenticación (como en el frontend)...');
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(USER_CREDENTIALS)
    });

    if (!authResponse.ok) {
        console.log('❌ Error de autenticación');
        return;
    }

    const authData = await authResponse.json();
    console.log(`✅ Usuario autenticado: ${authData.user.email}`);
    console.log(`🔑 Token obtenido: ${authData.access_token.substring(0, 20)}...`);

    // 2. Simular setupSupabase() del frontend
    console.log('\n2️⃣ Configurando cliente Supabase (como en el frontend)...');
    const userToken = authData.access_token;
    console.log('✅ Cliente configurado con token de usuario');

    // 3. Simular loadCreditos() del frontend (ANTES de la corrección)
    console.log('\n3️⃣ Simulando loadCreditos() ANTES de la corrección...');
    try {
        const response1 = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito?select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response1.ok) {
            const data1 = await response1.json();
            console.log(`⚠️ SIN FILTRO: ${data1.length} créditos (TODOS los usuarios)`);
        } else {
            console.log('❌ Error sin filtro:', response1.status);
        }
    } catch (error) {
        console.log('❌ Error sin filtro:', error.message);
    }

    // 4. Simular loadCreditos() del frontend (DESPUÉS de la corrección)
    console.log('\n4️⃣ Simulando loadCreditos() DESPUÉS de la corrección...');
    try {
        const response2 = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito?select=*&usuario_id=eq.${authData.user.id}&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response2.ok) {
            const data2 = await response2.json();
            console.log(`✅ CON FILTRO: ${data2.length} créditos (solo del usuario)`);
            
            if (data2.length > 0) {
                console.log('\n📋 CRÉDITOS DEL USUARIO:');
                data2.slice(0, 3).forEach((credito, index) => {
                    console.log(`   ${index + 1}. ${credito.tipo_credito} - $${credito.monto?.toLocaleString()} (${credito.plazo_meses} meses)`);
                });
                if (data2.length > 3) {
                    console.log(`   ... y ${data2.length - 3} más`);
                }
            }
        } else {
            const error = await response2.text();
            console.log('❌ Error con filtro:', error);
        }
    } catch (error) {
        console.log('❌ Error con filtro:', error.message);
    }

    // 5. Simular createCredito() del frontend
    console.log('\n5️⃣ Simulando createCredito() (como en el frontend)...');
    const nuevoCreditoData = {
        tipo_credito: 'Frontend Test',
        monto: 30000,
        plazo_meses: 15,
        tasa_anual: 14.0,
        cuota_mensual: 2156.50,
        total_intereses: 2347.50,
        total_pagar: 32347.50,
        resultado: 'simulacion',
        guardada: true
    };

    try {
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                usuario_id: authData.user.id,
                ...nuevoCreditoData
            })
        });

        if (createResponse.ok) {
            const createdData = await createResponse.json();
            console.log('✅ Crédito creado desde frontend simulado');
            console.log(`🆔 ID: ${createdData[0]?.id}`);
        } else {
            const error = await createResponse.text();
            console.log('❌ Error creando crédito:', error);
        }
    } catch (error) {
        console.log('❌ Error de conexión creando crédito:', error.message);
    }

    // 6. Resumen
    console.log('\n🏁 RESUMEN DE LA SIMULACIÓN FRONTEND');
    console.log('====================================');
    console.log('✅ El problema era que NO se filtraba por usuario_id');
    console.log('✅ Ahora con la corrección debería funcionar');
    console.log('💡 Refresca el navegador y prueba de nuevo');
}

if (require.main === module) {
    simularFrontendCompleto().catch(console.error);
}
