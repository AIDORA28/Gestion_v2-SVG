/**
 * 🧪 TEST DIRECTO API BACKEND - SIN REWRITES
 * Prueba acceder directamente a /api/backend en lugar de /health
 */

const https = require('https');

const VERCEL_DOMAIN = 'planificapro-v2-9s5q3laq7-aidora28s-projects.vercel.app';

console.log('🔍 TESTING API BACKEND DIRECTO...\n');

function testDirectAPI() {
    return new Promise((resolve, reject) => {
        const url = `https://${VERCEL_DOMAIN}/api/backend`;
        
        console.log(`📡 URL: ${url}`);
        console.log('🎯 Probando acceso directo al backend sin rewrites...\n');
        
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DirectBackendTest/1.0'
            },
            timeout: 15000
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            
            console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📝 Response Length: ${data.length} bytes`);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ JSON Response:`, JSON.stringify(jsonData, null, 2));
                    
                    if (res.statusCode === 200) {
                        console.log('\n🎉 ¡BACKEND API FUNCIONA DIRECTAMENTE!');
                        console.log('💡 El problema es el routing en vercel.json');
                    }
                    
                } catch (parseError) {
                    console.log(`📄 Raw Response (first 500 chars):`, data.substring(0, 500));
                    
                    if (res.statusCode === 401) {
                        console.log('\n🔐 OIDC sigue bloqueando el acceso directo al API');
                    } else if (res.statusCode === 404) {
                        console.log('\n❌ API Backend no encontrado - problema con Vercel Functions');
                    }
                }
                
                resolve({
                    status: res.statusCode,
                    data: data,
                    success: res.statusCode === 200
                });
            });
        });
        
        req.on('error', (error) => {
            console.log(`💥 Network Error: ${error.message}`);
            reject(error);
        });
        
        req.end();
    });
}

// Ejecutar test
testDirectAPI()
    .then(result => {
        console.log('\n📊 DIAGNÓSTICO:');
        
        if (result.success) {
            console.log('✅ Backend funciona - Problema es routing');
            console.log('🔧 Solución: Arreglar vercel.json rewrites');
        } else if (result.status === 401) {
            console.log('❌ OIDC bloquea todo el proyecto');
            console.log('🔧 Solución: Crear nuevo proyecto sin OIDC');
        } else if (result.status === 404) {
            console.log('❌ Vercel Functions no está funcionando');
            console.log('🔧 Solución: Revisar api/backend.js');
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.log('💥 TEST FAILED:', error.message);
        process.exit(1);
    });
