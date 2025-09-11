/**
 * 🔐 LOGIN Y TEST REPORTES
 * Autor: Asistente IA
 * Fecha: 10 Sep 2025
 * 
 * Propósito: Autenticarse con las credenciales reales y probar reportes
 */

const https = require('https');
const http = require('http');

// ====================================
// 🔧 CONFIGURACIÓN
// ====================================

const CONFIG = {
    usuario: {
        email: 'joegarcia.1395@gmail.com',
        password: '123456'
    },
    
    supabase: {
        url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
    },
    
    servidor: {
        host: 'localhost',
        puerto: 3002
    }
};

// ====================================
// 🛠️ UTILIDADES HTTP
// ====================================

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.protocol === 'https:' ? https : http;
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData,
                        rawData: data
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: null,
                        rawData: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// ====================================
// 🔐 AUTENTICACIÓN
// ====================================

async function autenticarUsuario() {
    console.log('🔐 INICIANDO AUTENTICACIÓN');
    console.log('=============================');
    console.log(`👤 Email: ${CONFIG.usuario.email}`);
    console.log(`🔑 Password: ${CONFIG.usuario.password}`);
    console.log('');

    try {
        // Paso 1: Autenticación con Supabase
        console.log('📡 1. Autenticando con Supabase...');
        
        const loginData = {
            email: CONFIG.usuario.email,
            password: CONFIG.usuario.password
        };
        
        const authOptions = {
            hostname: 'lobyofpwqwqsszugdwnw.supabase.co',
            port: 443,
            path: '/auth/v1/token?grant_type=password',
            method: 'POST',
            protocol: 'https:',
            headers: {
                'apikey': CONFIG.supabase.key,
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(loginData).length
            }
        };

        const authResponse = await makeRequest(authOptions, JSON.stringify(loginData));
        
        if (authResponse.statusCode === 200 && authResponse.data.access_token) {
            const token = authResponse.data.access_token;
            const user = authResponse.data.user;
            
            console.log('   ✅ Autenticación exitosa');
            console.log(`   🆔 User ID: ${user.id}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔑 Token obtenido: ${token.substring(0, 50)}...`);
            
            return {
                success: true,
                token: token,
                user: user
            };
        } else {
            console.log(`   ❌ Error de autenticación: HTTP ${authResponse.statusCode}`);
            console.log(`   📄 Respuesta: ${authResponse.rawData}`);
            return { success: false, error: authResponse.rawData };
        }
        
    } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ====================================
// 🧪 PRUEBAS DE REPORTES
// ====================================

async function probarReportes(authData) {
    console.log('');
    console.log('📊 PROBANDO MÓDULO DE REPORTES');
    console.log('===============================');
    
    if (!authData.success) {
        console.log('❌ No se puede probar reportes sin autenticación');
        return;
    }
    
    const { token, user } = authData;
    
    // Paso 1: Probar servidor local
    console.log('🖥️ 1. Probando servidor local...');
    const servidorLocal = await probarServidorLocal();
    
    // Paso 2: Probar Supabase directo
    console.log('');
    console.log('☁️ 2. Probando Supabase directo...');
    const supabaseDirecto = await probarSupabaseDirecto(token, user.id);
    
    // Paso 3: Generar reporte
    console.log('');
    console.log('📊 3. Generando reporte completo...');
    generarReporte(servidorLocal, supabaseDirecto);
}

async function probarServidorLocal() {
    const endpoints = ['ingresos', 'gastos', 'creditos'];
    const resultados = {};
    
    for (const endpoint of endpoints) {
        try {
            console.log(`   🔍 Probando /api/${endpoint}...`);
            
            const options = {
                hostname: CONFIG.servidor.host,
                port: CONFIG.servidor.puerto,
                path: `/api/${endpoint}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer demo_token'
                }
            };

            const response = await makeRequest(options);
            
            if (response.statusCode === 200) {
                const data = response.data[endpoint] || response.data.data || response.data;
                const items = Array.isArray(data) ? data : [];
                
                resultados[endpoint] = {
                    success: true,
                    cantidad: items.length,
                    datos: items,
                    total: items.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0)
                };
                
                console.log(`      ✅ ${items.length} registros, Total: S/ ${resultados[endpoint].total.toFixed(2)}`);
                
                if (items.length > 0) {
                    const ejemplo = items[0];
                    console.log(`      📝 Ejemplo: ${ejemplo.descripcion || ejemplo.tipo_credito || 'Sin descripción'} - S/ ${ejemplo.monto || 0}`);
                }
            } else {
                console.log(`      ❌ HTTP ${response.statusCode}`);
                resultados[endpoint] = { success: false, error: `HTTP ${response.statusCode}` };
            }
            
        } catch (error) {
            console.log(`      ❌ Error: ${error.message}`);
            resultados[endpoint] = { success: false, error: error.message };
        }
    }
    
    return resultados;
}

async function probarSupabaseDirecto(token, userId) {
    const tablas = [
        { endpoint: 'ingresos', tabla: 'ingresos' },
        { endpoint: 'gastos', tabla: 'gastos' },
        { endpoint: 'creditos', tabla: 'simulaciones_credito' }
    ];
    
    const resultados = {};
    
    for (const { endpoint, tabla } of tablas) {
        try {
            console.log(`   🔍 Probando ${tabla}...`);
            
            const url = new URL(`${CONFIG.supabase.url}/rest/v1/${tabla}`);
            url.searchParams.append('usuario_id', `eq.${userId}`);
            url.searchParams.append('select', '*');
            
            if (endpoint !== 'creditos') {
                url.searchParams.append('order', 'fecha.desc');
            } else {
                url.searchParams.append('order', 'created_at.desc');
            }

            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname + url.search,
                method: 'GET',
                protocol: 'https:',
                headers: {
                    'apikey': CONFIG.supabase.key,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            };

            const response = await makeRequest(options);
            
            if (response.statusCode === 200) {
                const items = Array.isArray(response.data) ? response.data : [];
                
                resultados[endpoint] = {
                    success: true,
                    cantidad: items.length,
                    datos: items,
                    total: items.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0)
                };
                
                console.log(`      ✅ ${items.length} registros, Total: S/ ${resultados[endpoint].total.toFixed(2)}`);
                
                if (items.length > 0) {
                    const ejemplo = items[0];
                    console.log(`      📝 Ejemplo: ${ejemplo.descripcion || ejemplo.tipo_credito || 'Sin descripción'} - S/ ${ejemplo.monto || 0}`);
                }
            } else {
                console.log(`      ❌ HTTP ${response.statusCode}: ${response.rawData}`);
                resultados[endpoint] = { success: false, error: `HTTP ${response.statusCode}` };
            }
            
        } catch (error) {
            console.log(`      ❌ Error: ${error.message}`);
            resultados[endpoint] = { success: false, error: error.message };
        }
    }
    
    return resultados;
}

function generarReporte(servidorLocal, supabaseDirecto) {
    console.log('📋 REPORTE COMPARATIVO');
    console.log('┌─────────────┬──────────────────┬──────────────────┬─────────────┐');
    console.log('│ Tipo        │ Servidor Local   │ Supabase Directo │ Recomend.   │');
    console.log('├─────────────┼──────────────────┼──────────────────┼─────────────┤');
    
    const endpoints = ['ingresos', 'gastos', 'creditos'];
    let mejorFuente = null;
    let totalServidorLocal = 0;
    let totalSupabase = 0;
    
    for (const endpoint of endpoints) {
        const local = servidorLocal[endpoint];
        const supabase = supabaseDirecto[endpoint];
        
        const localOk = local && local.success;
        const supabaseOk = supabase && supabase.success;
        
        const localStr = localOk ? `${local.cantidad} (S/${local.total.toFixed(2)})` : 'ERROR';
        const supabaseStr = supabaseOk ? `${supabase.cantidad} (S/${supabase.total.toFixed(2)})` : 'ERROR';
        
        let recomendacion;
        if (localOk && supabaseOk) {
            recomendacion = local.cantidad >= supabase.cantidad ? 'LOCAL' : 'SUPABASE';
            totalServidorLocal += local.total;
            totalSupabase += supabase.total;
        } else if (localOk) {
            recomendacion = 'LOCAL';
            totalServidorLocal += local.total;
        } else if (supabaseOk) {
            recomendacion = 'SUPABASE';
            totalSupabase += supabase.total;
        } else {
            recomendacion = 'NINGUNO';
        }
        
        console.log(`│ ${endpoint.padEnd(11)} │ ${localStr.padEnd(16)} │ ${supabaseStr.padEnd(16)} │ ${recomendacion.padEnd(11)} │`);
    }
    
    console.log('└─────────────┴──────────────────┴──────────────────┴─────────────┘');
    
    // Determinar mejor fuente de datos
    if (totalServidorLocal > 0 && totalSupabase > 0) {
        mejorFuente = totalServidorLocal >= totalSupabase ? 'Servidor Local' : 'Supabase Directo';
    } else if (totalServidorLocal > 0) {
        mejorFuente = 'Servidor Local';
    } else if (totalSupabase > 0) {
        mejorFuente = 'Supabase Directo';
    } else {
        mejorFuente = 'Ninguna fuente disponible';
    }
    
    console.log('');
    console.log('🎯 CONCLUSIONES:');
    console.log(`   🏆 Mejor fuente de datos: ${mejorFuente}`);
    console.log(`   💰 Total en Servidor Local: S/ ${totalServidorLocal.toFixed(2)}`);
    console.log(`   ☁️ Total en Supabase: S/ ${totalSupabase.toFixed(2)}`);
    
    if (mejorFuente === 'Servidor Local') {
        console.log('   ✅ Recomendación: Usar servidor local como fuente principal');
        console.log('   🔄 Configurar fallback a Supabase para redundancia');
    } else if (mejorFuente === 'Supabase Directo') {
        console.log('   ✅ Recomendación: Usar Supabase directo como fuente principal');
        console.log('   🔧 Revisar configuración del servidor local');
    } else {
        console.log('   ❌ Problema: No hay datos disponibles en ninguna fuente');
        console.log('   🔧 Verificar conectividad y permisos');
    }
}

// ====================================
// 🚀 FUNCIÓN PRINCIPAL
// ====================================

async function main() {
    console.log('🧪 TEST COMPLETO DE REPORTES CON LOGIN REAL');
    console.log('=============================================');
    console.log('');

    try {
        // Paso 1: Autenticarse
        const authData = await autenticarUsuario();
        
        // Paso 2: Probar reportes si la autenticación fue exitosa
        await probarReportes(authData);
        
        console.log('');
        console.log('🏁 PRUEBAS COMPLETADAS');
        console.log('=============================================');
        
    } catch (error) {
        console.error('💥 ERROR FATAL:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { main, autenticarUsuario, probarReportes };
