/**
 * 🔧 SOLUCIONADOR DE PROBLEMAS DNS
 * Prueba diferentes servidores DNS y configuraciones
 */

const { exec } = require('child_process');
const https = require('https');

console.log('🔧 ========================================');
console.log('🔧 SOLUCIONADOR PROBLEMAS DNS');
console.log('🔧 ========================================\n');

// 1. Verificar configuración DNS actual
console.log('1️⃣ Verificando DNS actual...');
exec('nslookup qicrqokabgfkrwlxkxcm.supabase.co', (error, stdout, stderr) => {
    console.log('📊 DNS Lookup resultado:');
    console.log(stdout);
    if (error) {
        console.log('❌ Error:', error.message);
        console.log('\n💡 POSIBLES SOLUCIONES:');
        console.log('1. Cambiar DNS a Google (8.8.8.8, 8.8.4.4)');
        console.log('2. Cambiar DNS a Cloudflare (1.1.1.1, 1.0.0.1)');
        console.log('3. Limpiar cache DNS: ipconfig /flushdns');
        console.log('4. Desactivar antivirus/firewall temporalmente');
        console.log('5. Verificar configuración proxy\n');
        
        // Probar con Google DNS
        console.log('2️⃣ Probando con Google DNS...');
        exec('nslookup qicrqokabgfkrwlxkxcm.supabase.co 8.8.8.8', (error2, stdout2, stderr2) => {
            console.log('📊 Google DNS resultado:');
            console.log(stdout2);
            if (!error2) {
                console.log('✅ Google DNS funciona! Cambia tu DNS a 8.8.8.8');
            }
            
            // Sugerir comandos para cambiar DNS
            console.log('\n🛠️  COMANDOS PARA CAMBIAR DNS (Ejecutar como Administrador):');
            console.log('netsh interface ip set dns "Wi-Fi" static 8.8.8.8');
            console.log('netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2');
            console.log('ipconfig /flushdns');
            console.log('\n💡 O cambiar manualmente en Configuración > Red > Propiedades de Wi-Fi > DNS');
        });
    } else {
        console.log('✅ DNS funciona correctamente');
        testDirectConnection();
    }
});

function testDirectConnection() {
    console.log('\n3️⃣ Probando conexión directa por IP...');
    
    // Intentar obtener la IP de Supabase
    const dns = require('dns');
    dns.resolve4('qicrqokabgfkrwlxkxcm.supabase.co', (err, addresses) => {
        if (err) {
            console.log('❌ No se puede resolver IP:', err.message);
            
            // IP manual conocida de Supabase (puede cambiar)
            console.log('🔄 Intentando con IP manual...');
            testHttpsByIP('3.33.152.147'); // IP común de Supabase
        } else {
            console.log('✅ IPs encontradas:', addresses);
            testHttpsByIP(addresses[0]);
        }
    });
}

function testHttpsByIP(ip) {
    console.log(`\n4️⃣ Probando HTTPS directo a IP: ${ip}...`);
    
    const options = {
        hostname: ip,
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
            'Host': 'qicrqokabgfkrwlxkxcm.supabase.co',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3Jxb2thYmdma3J3bHhreGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5Nzc3MzEsImV4cCI6MjA1MjU1MzczMX0.O52LLT9u5L2nqpxlhGaMAv4DdYN9O3yxl_qRhqb_Yw4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3Jxb2thYmdma3J3bHhreGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5Nzc3MzEsImV4cCI6MjA1MjU1MzczMX0.O52LLT9u5L2nqpxlhGaMAv4DdYN9O3yxl_qRhqb_Yw4'
        },
        timeout: 5000
    };

    const req = https.request(options, (res) => {
        console.log('✅ Conexión por IP exitosa! Status:', res.statusCode);
        console.log('💡 El problema es solo DNS, no conectividad');
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('📄 Respuesta:', data.substring(0, 100) + '...');
            
            console.log('\n🎯 SOLUCIÓN CONFIRMADA:');
            console.log('✅ Supabase funciona');
            console.log('❌ DNS bloqueado/filtrado');
            console.log('🛠️  Necesitas cambiar DNS a Google o Cloudflare');
        });
    });

    req.on('error', (error) => {
        console.log('❌ Error conexión por IP:', error.message);
        console.log('💡 Posible firewall corporativo o proxy');
    });

    req.on('timeout', () => {
        console.log('❌ Timeout conexión por IP');
        console.log('💡 Red muy lenta o filtros estrictos');
        req.destroy();
    });

    req.end();
}

// Test adicional - verificar si es un problema específico de Supabase
console.log('\n5️⃣ Probando otros servicios similares...');
https.get('https://api.github.com', (res) => {
    console.log('✅ GitHub API responde:', res.statusCode);
}).on('error', (err) => {
    console.log('❌ GitHub API error:', err.message);
});

setTimeout(() => {
    console.log('\n🔧 ========================================');
    console.log('🔧 DIAGNÓSTICO COMPLETADO');
    console.log('🔧 ========================================');
}, 5000);
