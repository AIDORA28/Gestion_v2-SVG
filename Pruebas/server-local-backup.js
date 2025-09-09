/**
 * 🚀 SERVIDOR LOCAL PARA PRUEBAS - PLANIFICAPRO
 * Usar con: node server-local.js
 * Puerto: http://localhost:3001
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

// Configuración de Supabase (mismas credenciales que Vercel)
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// Función simple para hacer requests HTTP a Supabase
// Función para requests a la API REST de Supabase  
async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lobyofpwqwqsszugdwnw.supabase.co',
            port: 443,
            path: `/rest/v1/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
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
                    resolve({ data: jsonData, status: res.statusCode, headers: res.headers });
                } catch (e) {
                    resolve({ data: data, status: res.statusCode, headers: res.headers });
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

// Función para requests a la API de Auth de Supabase
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
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
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
                    resolve({ data: jsonData, status: res.statusCode, headers: res.headers });
                } catch (e) {
                    resolve({ data: data, status: res.statusCode, headers: res.headers });
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

// Función para servir archivos estáticos
function serveStaticFile(res, filePath) {
    const fullPath = path.join(__dirname, 'public', filePath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Archivo no encontrado');
            return;
        }
        
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        
        switch (ext) {
            case '.html': contentType = 'text/html'; break;
            case '.css': contentType = 'text/css'; break;
            case '.js': contentType = 'application/javascript'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpeg'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
        }
        
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(data);
    });
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // ================================
    // 🔐 RUTAS API DE AUTENTICACIÓN
    // ================================
    
    if (pathname === '/api/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { email, password } = JSON.parse(body);
                
                if (!email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Email y contraseña son requeridos'
                    }));
                    return;
                }
                
                // Usuario demo para desarrollo (mientras configuramos Auth)
                const usuarioDemo = {
                    id: 1,
                    nombre: 'Usuario Demo',
                    apellido: 'Desarrollo',
                    email: email.toLowerCase(),
                    telefono: '+51999999999',
                    created_at: new Date().toISOString()
                };
                
                console.log('🔍 Login demo para:', email);
                console.log('✅ Usuario demo creado para desarrollo');
                
                // Validación simple para demo (cualquier password funciona)
                if (password.length < 3) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Password debe tener al menos 3 caracteres'
                    }));
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: `¡Bienvenido ${usuarioDemo.nombre}! (Modo desarrollo)`,
                    data: { user: usuarioDemo }
                }));
                
            } catch (error) {
                console.error('Error en login:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Error interno del servidor',
                    error: error.message
                }));
            }
        });
        return;
    }
    
    // Test de conexión a Supabase (con y sin prefijo /api para compatibilidad)
    if ((pathname === '/api/health' || pathname === '/health') && method === 'GET') {
        try {
            const result = await supabaseRequest('usuarios?select=count', 'GET');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: '✅ Servidor local conectado a Supabase',
                status: 'healthy',
                database: 'connected',
                port: PORT,
                supabase_status: result.status,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error conectando a Supabase',
                error: error.message
            }));
        }
        return;
    }
    
    // Listar usuarios (para pruebas)
    if (pathname === '/api/usuarios' && method === 'GET') {
        try {
            const result = await supabaseRequest('usuarios?select=id,nombre,email,telefono,created_at&order=created_at.desc');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: result.data,
                count: result.data.length,
                server: 'local'
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo usuarios',
                error: error.message
            }));
        }
        return;
    }
    
    // Crear usuario (registro)
    if (pathname === '/api/usuarios' && method === 'POST') {
        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const userData = JSON.parse(body);
                    console.log('📝 Datos de registro recibidos:', userData);
                    
                    // Extraer password y crear userData sin password para Supabase
                    const { password, ...userDataWithoutPassword } = userData;
                    console.log('🔐 Password extraído, datos para Supabase:', userDataWithoutPassword);
                    
                    // Por ahora solo simulamos la creación exitosa
                    // (En producción se usaría Supabase Auth para crear el usuario primero)
                    console.log('� Simulando creación de usuario...');
                    
                    // Generar un ID temporal para simular un usuario creado
                    const simulatedUser = {
                        id: Date.now(), // ID temporal
                        ...userDataWithoutPassword,
                        ingresos_mensuales: 0, // Valor por defecto
                        gastos_fijos: 0, // Valor por defecto
                        created_at: new Date().toISOString()
                    };
                    
                    console.log('✅ Usuario simulado creado:', simulatedUser);
                    
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: '✅ Usuario registrado exitosamente (modo desarrollo)',
                        data: simulatedUser,
                        server: 'local',
                        note: 'En desarrollo: no se guarda en base de datos hasta configurar Auth'
                    }));
                } catch (parseError) {
                    console.error('❌ Error parsing JSON:', parseError);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Datos inválidos'
                    }));
                }
            });
        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            }));
        }
        return;
    }
    
    // Dashboard básico
    if (pathname.startsWith('/api/dashboard/') && method === 'GET') {
        const userId = pathname.split('/')[3];
        try {
            // Obtener usuario
            const userResult = await supabaseRequest(`usuarios?id=eq.${userId}&select=id,nombre,email`);
            
            if (!userResult.data || userResult.data.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Usuario no encontrado'
                }));
                return;
            }
            
            // Obtener ingresos y gastos
            const ingresosResult = await supabaseRequest(`ingresos?usuario_id=eq.${userId}`);
            const gastosResult = await supabaseRequest(`gastos?usuario_id=eq.${userId}`);
            
            const ingresos = ingresosResult.data || [];
            const gastos = gastosResult.data || [];
            
            const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            const balance = totalIngresos - totalGastos;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    usuario: userResult.data[0],
                    resumen: {
                        totalIngresos,
                        totalGastos,
                        balance
                    },
                    ingresos,
                    gastos
                },
                server: 'local'
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo dashboard',
                error: error.message
            }));
        }
        return;
    }
    
    // ================================
    // 📁 SERVIR ARCHIVOS ESTÁTICOS
    // ================================
    
    // Ruta raíz
    if (pathname === '/') {
        serveStaticFile(res, 'index.html');
        return;
    }
    
    // Otras rutas de archivos
    if (pathname.endsWith('.html') || pathname.endsWith('.css') || 
        pathname.endsWith('.js') || pathname.endsWith('.json') ||
        pathname.endsWith('.png') || pathname.endsWith('.jpg') || 
        pathname.endsWith('.svg')) {
        serveStaticFile(res, pathname.substring(1));
        return;
    }
    
    // 404 para todo lo demás
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: false,
        message: 'Ruta no encontrada',
        path: pathname,
        server: 'local',
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'POST /api/login',
            'GET /api/usuarios',
            'GET /api/dashboard/:userId'
        ]
    }));
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log('🌟 PLANIFICAPRO - SERVIDOR LOCAL ACTIVO');
    console.log('🚀 ========================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🗄️  Supabase: ${SUPABASE_URL}`);
    console.log('📋 Endpoints disponibles:');
    console.log('   - GET  / (página principal)');
    console.log('   - GET  /api/health (test conexión)');
    console.log('   - POST /api/login (autenticación)');
    console.log('   - GET  /api/usuarios (listar usuarios)');
    console.log('   - POST /api/usuarios (crear usuario/registro)');
    console.log('   - GET  /api/dashboard/:userId');
    console.log('🚀 ========================================');
    console.log('💡 Tip: Abre http://localhost:3001/api/health para probar');
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso. Intenta con otro puerto.`);
    } else {
        console.error('❌ Error del servidor:', error);
    }
});
