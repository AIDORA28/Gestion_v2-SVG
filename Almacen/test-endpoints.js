/**
 * 🌐 VALIDADOR DE ENDPOINTS - Prueba todos los endpoints necesarios
 * Uso: node test-endpoints.js
 */

const https = require('https');
const http = require('http');

// Configuración
const LOCAL_BASE = 'http://localhost:3001';
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

console.log('🌐 ========================================');
console.log('🔍 VALIDADOR DE ENDPOINTS');
console.log('🌐 ========================================');

// Función para hacer requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Tests
async function runTests() {
    console.log('\n🧪 1. PROBANDO SERVIDOR LOCAL:');
    
    try {
        // Test 1: Health check local
        const healthResponse = await makeRequest(`${LOCAL_BASE}/api/health`);
        console.log(`${healthResponse.status === 200 ? '✅' : '❌'} Health Check Local (${healthResponse.status})`);
        
        // Test 2: Página principal local
        const homeResponse = await makeRequest(`${LOCAL_BASE}/`);
        console.log(`${homeResponse.status === 200 ? '✅' : '❌'} Página Principal (${homeResponse.status})`);
        
        // Test 3: Dashboard local
        const dashboardResponse = await makeRequest(`${LOCAL_BASE}/dashboard`);
        console.log(`${dashboardResponse.status === 200 ? '✅' : '❌'} Dashboard (${dashboardResponse.status})`);
        
    } catch (error) {
        console.log('❌ ERROR: Servidor local no está corriendo');
        console.log('💡 Ejecuta: node server-local.js');
    }
    
    console.log('\n🗄️ 2. PROBANDO CONEXIÓN A SUPABASE:');
    
    try {
        // Test 4: Conexión directa a Supabase
        const supabaseResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/usuarios?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`${supabaseResponse.status === 200 ? '✅' : '❌'} Supabase Database (${supabaseResponse.status})`);
        
        // Test 5: Supabase Auth
        const authResponse = await makeRequest(`${SUPABASE_URL}/auth/v1/settings`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`${authResponse.status === 200 ? '✅' : '❌'} Supabase Auth (${authResponse.status})`);
        
    } catch (error) {
        console.log('❌ ERROR: No se puede conectar a Supabase:', error.message);
    }
    
    console.log('\n🔐 3. PROBANDO AUTENTICACIÓN:');
    
    try {
        // Test 6: Login con credenciales de prueba
        const loginResponse = await makeRequest(`${LOCAL_BASE}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'joegarcia.1395@gmail.com',
                password: '123456'
            })
        });
        
        console.log(`${loginResponse.status === 200 ? '✅' : '❌'} Login Test (${loginResponse.status})`);
        if (loginResponse.data && loginResponse.data.success) {
            console.log('✅ Credenciales de prueba funcionan');
        }
        
    } catch (error) {
        console.log('❌ ERROR: No se pudo probar login:', error.message);
    }
    
    // Resultado final
    console.log('\n🎯 ========================================');
    console.log('📊 RESUMEN DE VALIDACIÓN:');
    console.log('✅ Si todos los tests locales pasan → Vercel debería funcionar');
    console.log('❌ Si hay errores → Corregir antes de hacer deploy');
    console.log('🎯 ========================================');
}

runTests().catch(console.error);
