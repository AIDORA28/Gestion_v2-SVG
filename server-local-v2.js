/**
 * 🚀 SERVIDOR LOCAL MODERNO - PLANIFICAPRO V2
 * Versión actualizada y optimizada para el módulo de reportes
 * Fecha: 10 Sep 2025
 * Puerto: http://localhost:3002
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3002;

// 🌐 CONFIGURACIÓN SUPABASE - Exacta del proyecto actual
const SUPABASE_CONFIG = {
    url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI',
};

// 👤 USUARIO DE PRUEBA REAL
const TEST_USER = {
    email: 'joegarcia.1395@gmail.com',
    id: '18f58646-fb57-48be-91b8-58beccc21bf5'
};

// 📁 TIPOS MIME MODERNOS
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg', 
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 🛠️ FUNCIÓN MODERNA PARA REQUESTS A SUPABASE
async function supabaseRequest(endpoint, method = 'GET', body = null, token = null) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lobyofpwqwqsszugdwnw.supabase.co',
            port: 443,
            path: `/rest/v1/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${token || SUPABASE_CONFIG.anonKey}`,
                'Prefer': 'return=representation'
            }
        };

        if (body && method !== 'GET') {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ 
                        data: jsonData, 
                        status: res.statusCode, 
                        headers: res.headers,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({ 
                        data: data, 
                        status: res.statusCode, 
                        headers: res.headers,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (body && method !== 'GET') {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// 🔐 FUNCIÓN PARA AUTENTICACIÓN
async function supabaseAuthRequest(endpoint, method = 'POST', body = null) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lobyofpwqwqsszugdwnw.supabase.co',
            port: 443,
            path: `/auth/v1/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
            }
        };

        if (body && method !== 'GET') {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ 
                        data: jsonData, 
                        status: res.statusCode, 
                        headers: res.headers,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({ 
                        data: data, 
                        status: res.statusCode, 
                        headers: res.headers,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (body && method !== 'GET') {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// 📁 FUNCIÓN OPTIMIZADA PARA SERVIR ARCHIVOS
function serveStaticFile(res, filePath) {
    let fullPath;
    
    if (filePath === '' || filePath === '/') {
        fullPath = path.join(__dirname, 'public', 'dashboard.html');
    } else {
        fullPath = path.join(__dirname, 'public', filePath);
    }
    
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`❌ Archivo no encontrado: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - PLANIFICAPRO</title>
                    <meta charset="utf-8">
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            margin: 0;
                        }
                        .container { 
                            background: rgba(255,255,255,0.1); 
                            padding: 40px; 
                            border-radius: 20px; 
                            backdrop-filter: blur(10px);
                            display: inline-block;
                        }
                        .error { color: #ff6b6b; font-size: 4em; margin: 0; }
                        .info { margin-top: 20px; }
                        a { color: #4ecdc4; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        ul { display: inline-block; text-align: left; }
                        li { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">404</h1>
                        <h2>Archivo no encontrado</h2>
                        <p>El archivo <code>${filePath}</code> no existe en PLANIFICAPRO.</p>
                        <div class="info">
                            <p><strong>🔗 Rutas disponibles:</strong></p>
                            <ul>
                                <li><a href="/">🏠 Dashboard Principal</a></li>
                                <li><a href="/dashboard.html">📊 Dashboard</a></li>
                                <li><a href="/login.html">🔐 Login</a></li>
                                <li><a href="/api/health">💊 Health Check</a></li>
                                <li><a href="/api/reportes">📈 API Reportes</a></li>
                            </ul>
                        </div>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        
        fs.readFile(fullPath, (readErr, data) => {
            if (readErr) {
                console.error(`❌ Error leyendo ${fullPath}:`, readErr);
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Error interno del servidor');
                return;
            }
            
            const ext = path.extname(fullPath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'no-cache'
            });
            res.end(data);
            
            console.log(`✅ Sirviendo: ${filePath} (${contentType})`);
        });
    });
}

// 🔑 OBTENER TOKEN Y USER ID
function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

function getUserIdFromToken(token) {
    return TEST_USER.id; // Simplificado para pruebas
}

// 🌐 SERVIDOR HTTP PRINCIPAL
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${method} ${pathname}`);
    
    // 🔧 CORS HEADERS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 📊 HEALTH CHECK
    if (pathname === '/api/health' && method === 'GET') {
        try {
            const testResult = await supabaseRequest('usuarios?select=count&limit=1');
            
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: '🚀 PLANIFICAPRO Server V2 - Funcionando perfectamente',
                status: 'healthy',
                database: testResult.success ? 'connected' : 'error',
                supabase_url: SUPABASE_CONFIG.url,
                port: PORT,
                version: '2.0',
                timestamp: new Date().toISOString(),
                features: {
                    auth: true,
                    ingresos: true,
                    gastos: true,
                    creditos: true,
                    reportes: true
                }
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error conectando a Supabase',
                error: error.message
            }));
        }
        return;
    }
    
    // 🔐 LOGIN API
    if (pathname === '/api/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { email, password } = JSON.parse(body);
                
                console.log(`🔐 Login attempt: ${email}`);
                
                const authResponse = await supabaseAuthRequest('token?grant_type=password', 'POST', {
                    email: email.toLowerCase(),
                    password: password
                });
                
                if (authResponse.success && authResponse.data.access_token) {
                    console.log(`✅ Login exitoso: ${email}`);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        success: true,
                        message: `¡Bienvenido a PLANIFICAPRO!`,
                        data: { 
                            user: {
                                id: authResponse.data.user.id,
                                email: authResponse.data.user.email,
                                nombre: authResponse.data.user.user_metadata?.nombre || 'Usuario'
                            },
                            access_token: authResponse.data.access_token
                        }
                    }));
                } else {
                    console.log(`❌ Login fallido: ${email}`);
                    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Credenciales inválidas'
                    }));
                }
                
            } catch (error) {
                console.error('❌ Error en login:', error);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Error interno del servidor'
                }));
            }
        });
        return;
    }
    
    // 📊 API REPORTES - ENDPOINT PRINCIPAL
    if (pathname === '/api/reportes' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            const userId = getUserIdFromToken(token);
            
            console.log(`📊 Generando reportes para usuario: ${userId}`);
            
            // Obtener todos los datos en paralelo
            const [ingresosResult, gastosResult, creditosResult] = await Promise.all([
                supabaseRequest(`ingresos?usuario_id=eq.${userId}&order=fecha.desc`, 'GET', null, token),
                supabaseRequest(`gastos?usuario_id=eq.${userId}&order=fecha.desc`, 'GET', null, token),
                supabaseRequest(`simulaciones_credito?usuario_id=eq.${userId}&order=created_at.desc`, 'GET', null, token)
            ]);
            
            const ingresos = ingresosResult.data || [];
            const gastos = gastosResult.data || [];
            const creditos = creditosResult.data || [];
            
            // Calcular totales
            const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            const totalCreditos = creditos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            const balanceNeto = totalIngresos - totalGastos;
            
            console.log(`📊 Reportes generados - Ingresos: ${ingresos.length}, Gastos: ${gastos.length}, Créditos: ${creditos.length}`);
            
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                message: '📊 Reportes generados exitosamente',
                data: {
                    resumen: {
                        totalIngresos,
                        totalGastos, 
                        totalCreditos,
                        balanceNeto
                    },
                    detalles: {
                        ingresos,
                        gastos,
                        creditos
                    },
                    contadores: {
                        ingresos: ingresos.length,
                        gastos: gastos.length,
                        creditos: creditos.length
                    },
                    periodo: {
                        desde: ingresos.length > 0 ? ingresos[ingresos.length - 1].fecha : null,
                        hasta: ingresos.length > 0 ? ingresos[0].fecha : null
                    }
                },
                timestamp: new Date().toISOString(),
                server: 'local-v2'
            }));
            
        } catch (error) {
            console.error('❌ Error API reportes:', error);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error generando reportes',
                error: error.message
            }));
        }
        return;
    }
    
    // 💰 API INGRESOS
    if (pathname === '/api/ingresos' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            const userId = getUserIdFromToken(token);
            
            const result = await supabaseRequest(`ingresos?usuario_id=eq.${userId}&order=fecha.desc`, 'GET', null, token);
            
            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Ingresos obtenidos exitosamente',
                    data: result.data,
                    count: result.data.length
                }));
            } else {
                throw new Error('Error obteniendo ingresos');
            }
            
        } catch (error) {
            console.error('❌ Error API ingresos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo ingresos'
            }));
        }
        return;
    }
    
    // 💸 API GASTOS
    if (pathname === '/api/gastos' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            const userId = getUserIdFromToken(token);
            
            const result = await supabaseRequest(`gastos?usuario_id=eq.${userId}&order=fecha.desc`, 'GET', null, token);
            
            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Gastos obtenidos exitosamente',
                    data: result.data,
                    count: result.data.length
                }));
            } else {
                throw new Error('Error obteniendo gastos');
            }
            
        } catch (error) {
            console.error('❌ Error API gastos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo gastos'
            }));
        }
        return;
    }
    
    // 💳 API CRÉDITOS
    if (pathname === '/api/creditos' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            const userId = getUserIdFromToken(token);
            
            const result = await supabaseRequest(`simulaciones_credito?usuario_id=eq.${userId}&order=created_at.desc`, 'GET', null, token);
            
            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Créditos obtenidos exitosamente',
                    data: result.data,
                    count: result.data.length
                }));
            } else {
                throw new Error('Error obteniendo créditos');
            }
            
        } catch (error) {
            console.error('❌ Error API créditos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo créditos'
            }));
        }
        return;
    }
    
    // 📁 ARCHIVOS ESTÁTICOS
    if (pathname === '/') {
        serveStaticFile(res, 'dashboard.html');
        return;
    }
    
    if (pathname.includes('.')) {
        serveStaticFile(res, pathname.substring(1));
        return;
    }
    
    // 404 PERSONALIZADO
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
        success: false,
        message: '🔍 Endpoint no encontrado',
        path: pathname,
        method: method,
        server: 'planificapro-local-v2',
        availableEndpoints: [
            'GET / - Dashboard Principal',
            'GET /api/health - Estado del servidor',
            'POST /api/login - Autenticación',
            'GET /api/reportes - Resumen completo con todos los datos',
            'GET /api/ingresos - Lista de ingresos',
            'GET /api/gastos - Lista de gastos',
            'GET /api/creditos - Lista de créditos'
        ],
        testCredentials: {
            email: TEST_USER.email,
            password: '123456'
        }
    }));
});

// 🚀 INICIAR SERVIDOR
server.listen(PORT, () => {
    console.log('');
    console.log('🚀 ==========================================');
    console.log('🌟        PLANIFICAPRO SERVER V2          ');
    console.log('🚀 ==========================================');
    console.log(`📍 URL Principal: http://localhost:${PORT}`);
    console.log(`🏠 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`💊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 API Reportes: http://localhost:${PORT}/api/reportes`);
    console.log(`🗄️ Base de Datos: ${SUPABASE_CONFIG.url}`);
    console.log('');
    console.log('🎯 CARACTERÍSTICAS PRINCIPALES:');
    console.log('   ✅ Servidor HTTP nativo optimizado');
    console.log('   ✅ Integración directa con Supabase');
    console.log('   ✅ API de reportes completa');
    console.log('   ✅ Soporte para módulo de reportes');
    console.log('   ✅ CORS habilitado');
    console.log('   ✅ Manejo de errores mejorado');
    console.log('');
    console.log('📋 ENDPOINTS API:');
    console.log('   🔐 POST /api/login - Autenticación');
    console.log('   📊 GET  /api/reportes - Resumen completo');
    console.log('   💰 GET  /api/ingresos - Lista de ingresos');
    console.log('   💸 GET  /api/gastos - Lista de gastos');
    console.log('   💳 GET  /api/creditos - Lista de créditos');
    console.log('   🏥 GET  /api/health - Estado del servidor');
    console.log('');
    console.log('👤 CREDENCIALES DE PRUEBA:');
    console.log(`   📧 Email: ${TEST_USER.email}`);
    console.log(`   🔑 Password: 123456`);
    console.log('   🆔 User ID: ' + TEST_USER.id.substring(0, 8) + '...');
    console.log('');
    console.log('🚀 ¡SERVIDOR LISTO! Abre tu navegador en la URL principal');
    console.log('⏹️ Para detener: Ctrl+C');
    console.log('🚀 ==========================================');
});

// 🛑 MANEJO DE ERRORES
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso.`);
        console.log('💡 Soluciones:');
        console.log('   - Cambiar PORT en línea 11 del código');
        console.log('   - Usar: netstat -ano | findstr :3002');
        console.log('   - Detener proceso que usa el puerto');
    } else {
        console.error('❌ Error del servidor:', error);
    }
});

// 🔄 CIERRE GRACEFUL
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando PLANIFICAPRO Server V2...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando PLANIFICAPRO Server V2...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});
