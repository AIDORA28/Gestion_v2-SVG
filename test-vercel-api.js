/**
 * 🧪 TEST LOCAL - API VERCEL PRODUCTION
 * Prueba los endpoints de Vercel desde local
 */

const https = require('https');
const http = require('http');

// Configurar tu dominio de Vercel aquí - ACTUALIZAR CON TU DOMINIO REAL
const VERCEL_DOMAIN = process.env.VERCEL_DOMAIN || 'planificapro-v2-9s5q3laq7-aidora28s-projects.vercel.app'; // Actualiza con tu dominio real

console.log('🚀 TESTING API VERCEL PRODUCTION...\n');

// Función para hacer request HTTP/HTTPS
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'NodeJS-Test-Client/1.0',
                ...options.headers
            },
            timeout: 10000,
            ...options
        };

        const req = protocol.request(url, requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: data,
                    success: res.statusCode >= 200 && res.statusCode < 300
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

// Lista de endpoints para testear
const endpoints = [
    '/health',
    '/api/ingresos', 
    '/auth/login' // Este dará error pero nos ayudará a ver si llega
];

// Test de cada endpoint
async function testEndpoint(endpoint) {
    const url = `https://${VERCEL_DOMAIN}${endpoint}`;
    
    console.log(`🧪 Testing: ${endpoint}`);
    console.log(`📡 URL: ${url}`);
    
    try {
        const result = await makeRequest(url);
        
        console.log(`📊 Status: ${result.status} ${result.statusText}`);
        console.log(`⏱️ Response Headers:`, Object.keys(result.headers).length, 'headers');
        
        // Intentar parsear JSON
        try {
            const jsonData = JSON.parse(result.data);
            console.log(`✅ JSON Response:`, JSON.stringify(jsonData, null, 2));
        } catch {
            console.log(`📝 Raw Response: ${result.data.substring(0, 200)}${result.data.length > 200 ? '...' : ''}`);
        }
        
        if (result.success) {
            console.log(`✅ SUCCESS: ${endpoint}`);
        } else {
            console.log(`⚠️ HTTP ERROR: ${endpoint} (${result.status})`);
        }
        
        return result;
        
    } catch (error) {
        console.log(`❌ NETWORK ERROR: ${error.message}`);
        return { success: false, error: error.message };
    }
    
    console.log('─'.repeat(60));
}

// Ejecutar todos los tests
async function runAllTests() {
    console.log(`🎯 Testing domain: ${VERCEL_DOMAIN}\n`);
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push({ endpoint, ...result });
        console.log(''); // Línea vacía entre tests
    }
    
    // Resumen
    console.log('📊 RESUMEN DE TESTS:');
    console.log('='.repeat(50));
    
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const statusCode = result.status || 'N/A';
        console.log(`${status} ${result.endpoint.padEnd(20)} (${statusCode})`);
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎯 Exitosos: ${successCount}/${results.length}`);
    
    if (successCount === 0) {
        console.log('\n💡 POSIBLES CAUSAS:');
        console.log('   1. Dominio incorrecto en VERCEL_DOMAIN');
        console.log('   2. Deployment aún no completado');
        console.log('   3. Variables de entorno faltantes en Vercel');
        console.log('   4. Error en configuración vercel.json');
    }
    
    return results;
}

// Ejecutar tests
runAllTests()
    .then(results => {
        const hasSuccess = results.some(r => r.success);
        console.log(hasSuccess ? '\n🚀 Al menos un endpoint funciona!' : '\n💥 Todos los endpoints fallaron');
    })
    .catch(error => {
        console.log('💥 ERROR FATAL:', error);
    });
