/**
 * 🔄 SERVIDOR PROXY LOCAL PARA SUPABASE
 * Evita bloqueos de red usando proxy local
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PROXY_PORT = 3002;
const SUPABASE_HOST = 'qicrqokabgfkrwlxkxcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3Jxb2thYmdma3J3bHhreGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5Nzc3MzEsImV4cCI6MjA1MjU1MzczMX0.O52LLT9u5L2nqpxlhGaMAv4DdYN9O3yxl_qRhqb_Yw4';

// IPs alternativas de Supabase
const SUPABASE_IPS = [
    '3.33.152.147',
    '52.85.83.228',
    '99.84.238.227',
    '13.225.103.118'
];

let currentIPIndex = 0;

console.log('🔄 ========================================');
console.log('🔄 PROXY LOCAL para evitar bloqueos DNS');
console.log('🔄 ========================================');

const proxyServer = http.createServer((req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    console.log(`🔄 Proxy request: ${req.method} ${req.url}`);
    
    // Recolectar body si existe
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        proxyToSupabase(req, res, body);
    });
});

function proxyToSupabase(req, res, body) {
    const currentIP = SUPABASE_IPS[currentIPIndex];
    
    const options = {
        hostname: currentIP,
        port: 443,
        path: `/rest/v1${req.url}`,
        method: req.method,
        headers: {
            'Host': SUPABASE_HOST,
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'User-Agent': 'PlanificaPro-Proxy/1.0'
        },
        timeout: 10000
    };
    
    if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    
    const proxyReq = https.request(options, (proxyRes) => {
        console.log(`✅ Proxy response: ${proxyRes.statusCode} from IP ${currentIP}`);
        
        // Reenviar headers
        Object.keys(proxyRes.headers).forEach(key => {
            res.setHeader(key, proxyRes.headers[key]);
        });
        
        res.writeHead(proxyRes.statusCode);
        
        // Reenviar data
        proxyRes.on('data', chunk => res.write(chunk));
        proxyRes.on('end', () => res.end());
    });
    
    proxyReq.on('error', (error) => {
        console.log(`❌ Error con IP ${currentIP}:`, error.message);
        
        // Intentar con siguiente IP
        currentIPIndex = (currentIPIndex + 1) % SUPABASE_IPS.length;
        
        if (currentIPIndex === 0) {
            // Ya probamos todas las IPs
            console.log('❌ Todas las IPs fallaron');
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Supabase no accesible desde tu red',
                error: 'DNS_BLOCKED_OR_FILTERED',
                suggestion: 'Intenta desde otra red o contacta tu administrador IT'
            }));
        } else {
            console.log(`🔄 Retentando con IP ${SUPABASE_IPS[currentIPIndex]}`);
            proxyToSupabase(req, res, body);
        }
    });
    
    proxyReq.on('timeout', () => {
        console.log(`⏱️  Timeout con IP ${currentIP}`);
        proxyReq.destroy();
        
        res.writeHead(408, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            message: 'Timeout conectando a Supabase',
            error: 'CONNECTION_TIMEOUT'
        }));
    });
    
    if (body) {
        proxyReq.write(body);
    }
    
    proxyReq.end();
}

// Test inicial de conectividad
function testAllIPs() {
    console.log('🔍 Probando todas las IPs de Supabase...\n');
    
    SUPABASE_IPS.forEach((ip, index) => {
        const options = {
            hostname: ip,
            port: 443,
            path: '/rest/v1/',
            method: 'GET',
            headers: {
                'Host': SUPABASE_HOST,
                'apikey': SUPABASE_KEY
            },
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            console.log(`✅ IP ${ip} funciona - Status: ${res.statusCode}`);
            if (currentIPIndex === 0) currentIPIndex = index; // Usar primera IP que funcione
        });
        
        req.on('error', (error) => {
            console.log(`❌ IP ${ip} falla: ${error.message}`);
        });
        
        req.on('timeout', () => {
            console.log(`⏱️  IP ${ip} timeout`);
            req.destroy();
        });
        
        req.end();
    });
}

proxyServer.listen(PROXY_PORT, () => {
    console.log(`🔄 Proxy corriendo en http://localhost:${PROXY_PORT}`);
    console.log(`🎯 Proxy target: ${SUPABASE_HOST} (múltiples IPs)`);
    console.log(`📋 Uso: Cambia API_BASE_URL a http://localhost:${PROXY_PORT}\n`);
    
    testAllIPs();
    
    setTimeout(() => {
        console.log('\n💡 INSTRUCCIONES:');
        console.log('1. Cambia config.js para usar: http://localhost:3002');
        console.log('2. O crea un config-proxy.js');
        console.log('3. Mantén este proxy corriendo mientras uses la app\n');
    }, 3000);
});

proxyServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PROXY_PORT} ya en uso`);
    } else {
        console.error('❌ Error proxy:', error);
    }
});
