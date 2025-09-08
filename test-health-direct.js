/**
 * 🧪 TEST DIRECTO - HEALTH ENDPOINT
 * Prueba el endpoint de salud sin autenticación
 */

const https = require('https');

const VERCEL_DOMAIN = 'planificapro-v2-9s5q3laq7-aidora28s-projects.vercel.app';

console.log('🩺 TESTING HEALTH ENDPOINT DIRECTO...\n');

function testHealthEndpoint() {
    return new Promise((resolve, reject) => {
        const url = `https://${VERCEL_DOMAIN}/health`;
        
        console.log(`📡 URL: ${url}`);
        
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'HealthCheck/1.0'
            },
            timeout: 15000
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            
            console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
            console.log(`🔧 Headers:`, Object.keys(res.headers));
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📝 Response Length: ${data.length} bytes`);
                
                try {
                    // Intentar parsear como JSON
                    const jsonData = JSON.parse(data);
                    console.log(`✅ JSON Response:`, JSON.stringify(jsonData, null, 2));
                    
                    if (res.statusCode === 200) {
                        console.log('🎉 HEALTH CHECK EXITOSO!');
                    } else {
                        console.log(`⚠️ Health check con status: ${res.statusCode}`);
                    }
                    
                } catch (parseError) {
                    console.log(`📄 Raw Response (first 300 chars):`, data.substring(0, 300));
                    
                    if (data.includes('Authentication Required')) {
                        console.log('🔐 PROBLEMA: Endpoint requiere autenticación');
                        console.log('💡 Esto significa que el backend está funcionando pero mal configurado');
                    } else if (data.includes('NOT_FOUND')) {
                        console.log('❌ PROBLEMA: Endpoint no encontrado');
                        console.log('💡 Vercel Functions no está sirviendo correctamente');
                    } else {
                        console.log('🤔 RESPUESTA INESPERADA');
                    }
                }
                
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    data: data,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', (error) => {
            console.log(`💥 Network Error: ${error.message}`);
            reject(error);
        });
        
        req.on('timeout', () => {
            console.log('⏰ Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

// Ejecutar test
testHealthEndpoint()
    .then(result => {
        console.log('\n📊 RESUMEN:');
        console.log(`Status: ${result.status}`);
        console.log(`Success: ${result.status >= 200 && result.status < 300 ? 'YES' : 'NO'}`);
        
        if (result.status === 401) {
            console.log('\n🔧 DIAGNÓSTICO:');
            console.log('✅ Vercel Functions está funcionando');
            console.log('✅ El backend responde');
            console.log('❌ Problema de configuración de autenticación');
            console.log('💡 Posible solución: Revisar middlewares de autenticación en server.js');
        }
        
        process.exit(result.status === 200 ? 0 : 1);
    })
    .catch(error => {
        console.log('💥 TEST FAILED:', error.message);
        process.exit(1);
    });
