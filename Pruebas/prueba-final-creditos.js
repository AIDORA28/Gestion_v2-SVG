/**
 * 🎯 PRUEBA FINAL DEL MÓDULO CRÉDITOS
 * 
 * Este script simula exactamente lo que pasa cuando un usuario:
 * 1. Se autentica
 * 2. Va al dashboard 
 * 3. Hace clic en "Créditos"
 * 4. Ve los datos
 * 
 * Ejecutar: node prueba-final-creditos.js
 */

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

const USER_CREDENTIALS = {
    email: 'joegarcia.1395@gmail.com',
    password: '123456'
};

async function autenticarUsuario() {
    console.log('🔐 AUTENTICANDO USUARIO...');
    
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(USER_CREDENTIALS)
        });

        if (response.ok) {
            const authData = await response.json();
            console.log('✅ Autenticación exitosa');
            console.log(`👤 Usuario: ${authData.user.email}`);
            console.log(`🔑 Token obtenido: ${authData.access_token.substring(0, 20)}...`);
            return authData;
        } else {
            const error = await response.text();
            console.log('❌ Error de autenticación:', error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

async function cargarCreditosConToken(authData) {
    console.log('\n💳 CARGANDO MÓDULO CRÉDITOS CON TOKEN DE USUARIO...');
    
    try {
        // Usar el token del usuario autenticado (no el anon key)
        const response = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito?select=*&usuario_id=eq.${authData.user.id}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${authData.access_token}`, // ¡Token del usuario!
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const creditos = await response.json();
            console.log(`✅ Créditos cargados: ${creditos.length} registros`);
            
            if (creditos.length > 0) {
                console.log('\n📋 LISTA DE CRÉDITOS:');
                creditos.forEach((credito, index) => {
                    console.log(`\n${index + 1}. ID: ${credito.id}`);
                    console.log(`   Tipo: ${credito.tipo_credito}`);
                    console.log(`   Monto: $${credito.monto ? credito.monto.toLocaleString() : 'No definido'}`);
                    console.log(`   Plazo: ${credito.plazo_meses} meses`);
                    console.log(`   Tasa: ${credito.tasa_anual}% anual`);
                    console.log(`   Cuota: $${credito.cuota_mensual ? credito.cuota_mensual.toLocaleString() : 'No calculada'}`);
                    console.log(`   Total pagar: $${credito.total_pagar ? credito.total_pagar.toLocaleString() : 'No calculado'}`);
                    console.log(`   Fecha: ${credito.created_at}`);
                });
                
                return { success: true, data: creditos };
            } else {
                console.log('⚠️ Usuario no tiene créditos registrados');
                return { success: true, data: [] };
            }
            
        } else {
            const error = await response.text();
            console.log('❌ Error cargando créditos:', error);
            return { success: false, error };
        }
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return { success: false, error: error.message };
    }
}

async function crearCreditoPrueba(authData) {
    console.log('\n🔧 CREANDO CRÉDITO DE PRUEBA...');
    
    // Datos usando la estructura CORRECTA de la tabla
    const nuevoCreditoData = {
        usuario_id: authData.user.id,
        tipo_credito: 'Personal - Prueba Final',
        monto: 75000,
        plazo_meses: 18,
        tasa_anual: 16.5,
        cuota_mensual: 4852.50,
        total_intereses: 12345,
        total_pagar: 87345,
        resultado: 'aprobado',
        guardada: true
    };
    
    console.log('📝 Datos a insertar:');
    console.log(JSON.stringify(nuevoCreditoData, null, 2));
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${authData.access_token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(nuevoCreditoData)
        });

        if (response.ok) {
            const creditoCreado = await response.json();
            console.log('✅ Crédito creado exitosamente');
            console.log(`🆔 ID: ${creditoCreado[0]?.id}`);
            return { success: true, data: creditoCreado[0] };
        } else {
            const error = await response.text();
            console.log('❌ Error creando crédito:', error);
            return { success: false, error };
        }
        
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return { success: false, error: error.message };
    }
}

async function verificarFuncionamientoCompleto() {
    console.log('🎯 PRUEBA FINAL - FUNCIONAMIENTO COMPLETO DEL MÓDULO CRÉDITOS');
    console.log('===========================================================\n');

    // 1. Autenticar usuario
    const authData = await autenticarUsuario();
    if (!authData) {
        console.log('❌ PRUEBA FALLÓ: No se pudo autenticar');
        return;
    }

    // 2. Cargar créditos existentes
    const loadResult = await cargarCreditosConToken(authData);
    if (!loadResult.success) {
        console.log('❌ PRUEBA FALLÓ: No se pudieron cargar créditos');
        return;
    }

    // 3. Crear crédito de prueba
    const createResult = await crearCreditoPrueba(authData);
    if (!createResult.success) {
        console.log('⚠️ ADVERTENCIA: No se pudo crear crédito de prueba');
    }

    // 4. Volver a cargar para confirmar
    console.log('\n🔄 RECARGANDO CRÉDITOS PARA CONFIRMAR...');
    const reloadResult = await cargarCreditosConToken(authData);

    // 5. Resumen final
    console.log('\n🏁 RESUMEN DE LA PRUEBA FINAL');
    console.log('==============================');
    console.log(`✅ Autenticación: ${authData ? 'ÉXITO' : 'FALLÓ'}`);
    console.log(`✅ Carga inicial: ${loadResult.success ? 'ÉXITO' : 'FALLÓ'}`);
    console.log(`✅ Creación prueba: ${createResult.success ? 'ÉXITO' : 'FALLÓ'}`);
    console.log(`✅ Recarga final: ${reloadResult.success ? 'ÉXITO' : 'FALLÓ'}`);
    console.log(`📊 Créditos totales: ${reloadResult.data ? reloadResult.data.length : 'N/A'}`);

    if (loadResult.success && reloadResult.success) {
        console.log('\n🎉 ¡MÓDULO CRÉDITOS FUNCIONANDO CORRECTAMENTE!');
        console.log('El problema de "Cargando créditos..." debería estar resuelto.');
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('1. Reinicia tu servidor: node server-local-v2.js');
        console.log('2. Ve a: http://localhost:3002/dashboard.html');
        console.log('3. Inicia sesión con: joegarcia.1395@gmail.com / 123456');
        console.log('4. Haz clic en "Créditos" en el sidebar');
        console.log('5. Deberías ver los créditos cargados');
    } else {
        console.log('\n❌ MÓDULO CRÉDITOS TIENE PROBLEMAS');
        console.log('Revisar logs de errores arriba');
    }
}

// Ejecutar prueba final
if (require.main === module) {
    verificarFuncionamientoCompleto().catch(console.error);
}
