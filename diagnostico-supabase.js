/**
 * 🔍 DIAGNÓSTICO COMPLETO DE SUPABASE
 * Ejecutar con: node diagnostico-supabase.js
 */

const https = require('https');
const dns = require('dns');

// Configuración
const SUPABASE_URL = 'https://qicrqokabgfkrwlxkxcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3Jxb2thYmdma3J3bHhreGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5Nzc3MzEsImV4cCI6MjA1MjU1MzczMX0.O52LLT9u5L2nqpxlhGaMAv4DdYN9O3yxl_qRhqb_Yw4';

console.log('🔍 ========================================');
console.log('🔍 DIAGNÓSTICO SUPABASE - PLANIFICAPRO');
console.log('🔍 ========================================\n');

// 1. Test DNS
console.log('1️⃣ Probando resolución DNS...');
dns.lookup('qicrqokabgfkrwlxkxcm.supabase.co', (err, address, family) => {
    if (err) {
        console.log('❌ DNS Error:', err.message);
        console.log('💡 Posible problema: Conexión a internet o DNS bloqueado\n');
    } else {
        console.log('✅ DNS OK - IP:', address, `(IPv${family})\n`);
        
        // 2. Test HTTPS Connection
        console.log('2️⃣ Probando conexión HTTPS...');
        testHttpsConnection();
    }
});

function testHttpsConnection() {
    const options = {
        hostname: 'qicrqokabgfkrwlxkxcm.supabase.co',
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        timeout: 10000
    };

    const req = https.request(options, (res) => {
        console.log('✅ HTTPS Conexión OK - Status:', res.statusCode);
        console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('📄 Respuesta:', data.substring(0, 200) + '...\n');
            
            // 3. Test usuarios table
            console.log('3️⃣ Probando tabla usuarios...');
            testUsuariosTable();
        });
    });

    req.on('error', (error) => {
        console.log('❌ HTTPS Error:', error.message);
        console.log('💡 Posible problema:');
        console.log('   - Firewall bloqueando conexión');
        console.log('   - Antivirus con protección web');
        console.log('   - Proxy corporativo');
        console.log('   - ISP bloqueando Supabase\n');
    });

    req.on('timeout', () => {
        console.log('❌ TIMEOUT: La conexión tardó más de 10 segundos');
        console.log('💡 Posible problema: Conexión lenta o filtros de red\n');
        req.destroy();
    });

    req.end();
}

function testUsuariosTable() {
    const options = {
        hostname: 'qicrqokabgfkrwlxkxcm.supabase.co',
        port: 443,
        path: '/rest/v1/usuarios?select=count&limit=1',
        method: 'GET',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 5000
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ Tabla usuarios accesible');
                console.log('📊 Respuesta:', data, '\n');
                
                // 4. Test specific user
                console.log('4️⃣ Probando consulta específica...');
                testSpecificQuery();
            } else {
                console.log('❌ Error accediendo tabla usuarios');
                console.log('📊 Status:', res.statusCode);
                console.log('📄 Error:', data);
                console.log('💡 Posible problema:');
                console.log('   - Tabla usuarios no existe');
                console.log('   - Permisos insuficientes');
                console.log('   - API Key inválida\n');
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Error consultando usuarios:', error.message, '\n');
    });

    req.on('timeout', () => {
        console.log('❌ TIMEOUT consultando usuarios\n');
        req.destroy();
    });

    req.end();
}

function testSpecificQuery() {
    const options = {
        hostname: 'qicrqokabgfkrwlxkxcm.supabase.co',
        port: 443,
        path: '/rest/v1/usuarios?select=id,nombre,email&limit=3',
        method: 'GET',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 5000
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('📊 Consulta específica - Status:', res.statusCode);
            
            if (res.statusCode === 200) {
                const users = JSON.parse(data);
                console.log('✅ Usuarios encontrados:', users.length);
                console.log('👥 Sample:', JSON.stringify(users, null, 2));
                
                if (users.length > 0) {
                    console.log('\n🎉 ===============================');
                    console.log('🎉 SUPABASE ESTÁ FUNCIONANDO BIEN');
                    console.log('🎉 ===============================');
                    console.log('💡 El problema puede ser:');
                    console.log('   - Configuración del frontend');
                    console.log('   - CORS en el navegador');
                    console.log('   - JavaScript bloqueado');
                    console.log('   - Archivo config.js incorrecto');
                } else {
                    console.log('\n⚠️  SUPABASE OK pero no hay usuarios');
                    console.log('💡 Necesitas crear usuarios en la base de datos');
                }
            } else {
                console.log('❌ Error en consulta específica');
                console.log('📄 Response:', data);
            }
            
            console.log('\n🔍 ========================================');
            console.log('🔍 DIAGNÓSTICO COMPLETADO');
            console.log('🔍 ========================================');
        });
    });

    req.on('error', (error) => {
        console.log('❌ Error en consulta específica:', error.message);
    });

    req.on('timeout', () => {
        console.log('❌ TIMEOUT en consulta específica');
        req.destroy();
    });

    req.end();
}

// Test adicional de conectividad general
console.log('0️⃣ Probando conectividad general...');
https.get('https://www.google.com', (res) => {
    console.log('✅ Internet conectado - Google responde\n');
}).on('error', (err) => {
    console.log('❌ Sin conexión a internet:', err.message);
    console.log('💡 Revisa tu conexión de red\n');
});
