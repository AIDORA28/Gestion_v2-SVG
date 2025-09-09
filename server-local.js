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

// Configuración de Supabase (mismas credencial                    console.log('🔄 Creando usuario con Supabase Auth...');s que Vercel)
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// Función simple para hacer requests HTTP a Supabase
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

// Función para requests de autenticación a Supabase Auth
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
                
                // Intentar login con Supabase Auth
                console.log('🔐 Intentando login con Supabase Auth para:', email);
                
                try {
                    // Usar Supabase Auth para login
                    const authResponse = await supabaseAuthRequest('token?grant_type=password', 'POST', {
                        email: email.toLowerCase(),
                        password: password
                    });
                    
                    console.log('📊 Respuesta de Supabase Auth:', authResponse);
                    
                    if (authResponse.status === 200 && authResponse.data.access_token) {
                        // Login exitoso - obtener datos del usuario
                        const userResult = await supabaseRequest(`usuarios?email=eq.${email.toLowerCase()}&limit=1`);
                        
                        let usuario;
                        if (userResult.status === 200 && userResult.data && userResult.data.length > 0) {
                            usuario = userResult.data[0];
                        } else {
                            // Usuario autenticado pero sin perfil en usuarios
                            usuario = {
                                id: authResponse.data.user.id,
                                nombre: authResponse.data.user.user_metadata?.nombre || 'Usuario',
                                apellido: authResponse.data.user.user_metadata?.apellido || '',
                                email: authResponse.data.user.email,
                                created_at: authResponse.data.user.created_at
                            };
                        }
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: `¡Bienvenido ${usuario.nombre}!`,
                            data: { 
                                user: usuario,
                                access_token: authResponse.data.access_token
                            }
                        }));
                        
                    } else {
                        // Credenciales inválidas
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Credenciales inválidas'
                        }));
                    }
                    
                } catch (authError) {
                    console.error('❌ Error en autenticación:', authError);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Error de autenticación. Verifique sus credenciales.'
                    }));
                }
                
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
                    
                    // Crear usuario con Supabase Auth
                    try {
                        // Primero crear el usuario en Auth
                        const authResponse = await supabaseAuthRequest('signup', 'POST', {
                            email: userData.email.toLowerCase(),
                            password: password,
                            data: {
                                nombre: userData.nombre,
                                apellido: userData.apellido
                            }
                        });
                        
                        console.log('📊 Respuesta de Supabase Auth:', authResponse);
                        
                        if (authResponse.status === 200 && authResponse.data.user) {
                            // Auth exitoso - ahora crear el perfil en la tabla usuarios
                            const profileData = {
                                ...userDataWithoutPassword,
                                id: authResponse.data.user.id, // Usar el ID de Auth
                                ingresos_mensuales: 0,
                                gastos_fijos: 0
                            };
                            
                            // Crear perfil en tabla usuarios
                            const profileResult = await supabaseRequest('usuarios', 'POST', profileData);
                            
                            if (profileResult.status >= 200 && profileResult.status < 300) {
                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: true,
                                    message: '✅ Usuario registrado exitosamente',
                                    data: profileResult.data[0] || profileData,
                                    server: 'local'
                                }));
                            } else {
                                // Error creando perfil pero Auth fue exitoso
                                console.error('❌ Error creando perfil:', profileResult);
                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: true,
                                    message: '✅ Usuario registrado (perfil pendiente)',
                                    data: {
                                        id: authResponse.data.user.id,
                                        email: authResponse.data.user.email,
                                        ...userDataWithoutPassword
                                    },
                                    server: 'local',
                                    note: 'Usuario creado en Auth, perfil pendiente'
                                }));
                            }
                        } else {
                            // Error en Auth
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: false,
                                message: authResponse.data.error_description || 'Error al crear cuenta',
                                error: authResponse.data
                            }));
                        }
                        
                    } catch (authError) {
                        console.error('❌ Error en registro:', authError);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Error interno al crear cuenta',
                            error: authError.message
                        }));
                    }
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
    
    // ================================
    // 💰 RUTAS API DE INGRESOS
    // ================================
    
    // Obtener token del header Authorization
    function getTokenFromRequest(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    // Obtener usuario ID del token (simulado por ahora)
    function getUserIdFromToken(token) {
        // En producción aquí se verificaría el JWT token
        // Por ahora retornamos un ID simulado para las pruebas
        // Podrías usar las credenciales del usuario logueado: joegarcia.1395@gmail.com
        return '18f58646-fb57-48be-91b8-58beccc21bf5'; // ID del usuario de prueba
    }
    
    // GET /api/ingresos - Obtener lista de ingresos del usuario con filtros y paginación
    if (pathname === '/api/ingresos' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            const { page = 1, limit = 10, search = '', categoria = '', fechaDesde = '', fechaHasta = '' } = parsedUrl.query;
            
            // Construir filtros para Supabase
            let filters = [`usuario_id=eq.${userId}`];
            
            if (search) {
                filters.push(`or=(descripcion.ilike.*${search}*,notas.ilike.*${search}*)`);
            }
            if (categoria) {
                filters.push(`categoria=eq.${categoria}`);
            }
            if (fechaDesde) {
                filters.push(`fecha=gte.${fechaDesde}`);
            }
            if (fechaHasta) {
                filters.push(`fecha=lte.${fechaHasta}`);
            }
            
            const filtersString = filters.join('&');
            const offset = (page - 1) * limit;
            
            // Obtener ingresos con filtros y paginación
            const ingresosResult = await supabaseRequest(
                `ingresos?${filtersString}&order=fecha.desc,created_at.desc&limit=${limit}&offset=${offset}`
            );
            
            // Obtener total de registros para paginación
            const countResult = await supabaseRequest(
                `ingresos?${filtersString}&select=count`
            );
            
            const ingresos = ingresosResult.data || [];
            const totalCount = countResult.data?.[0]?.count || 0;
            
            // Calcular resumen
            const summaryResult = await supabaseRequest(
                `ingresos?${filtersString}&select=monto`
            );
            const allIngresos = summaryResult.data || [];
            const totalMonto = allIngresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            
            // Ingresos del mes actual
            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
            const monthlyFilter = filters.concat([`fecha=gte.${currentMonth}-01`, `fecha=lt.${currentMonth}-32`]).join('&');
            const monthlyResult = await supabaseRequest(`ingresos?${monthlyFilter}&select=monto`);
            const monthlyIngresos = monthlyResult.data || [];
            const monthlyTotal = monthlyIngresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            
            const totalPages = Math.ceil(totalCount / limit);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                ingresos: ingresos,
                summary: {
                    ingresosTotal: totalMonto,
                    ingresosMes: monthlyTotal,
                    cantidadRegistros: totalCount
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    totalPages: totalPages,
                    from: offset + 1,
                    to: Math.min(offset + parseInt(limit), totalCount)
                }
            }));
            
        } catch (error) {
            console.error('Error obteniendo ingresos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo ingresos',
                error: error.message
            }));
        }
        return;
    }
    
    // POST /api/ingresos - Crear nuevo ingreso
    if (pathname === '/api/ingresos' && method === 'POST') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const ingresoData = JSON.parse(body);
                    
                    // Validaciones
                    if (!ingresoData.descripcion || !ingresoData.monto) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Descripción y monto son obligatorios'
                        }));
                        return;
                    }
                    
                    if (ingresoData.monto <= 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'El monto debe ser mayor a 0'
                        }));
                        return;
                    }
                    
                    // Preparar datos para insertar
                    const dataToInsert = {
                        usuario_id: userId,
                        descripcion: ingresoData.descripcion,
                        monto: parseFloat(ingresoData.monto),
                        categoria: ingresoData.categoria || null,
                        fecha: ingresoData.fecha || new Date().toISOString().split('T')[0],
                        es_recurrente: ingresoData.es_recurrente || false,
                        frecuencia_dias: ingresoData.frecuencia_dias || null,
                        notas: ingresoData.notas || null
                    };
                    
                    // Crear ingreso en Supabase
                    const result = await supabaseRequest('ingresos', 'POST', dataToInsert);
                    
                    if (result.status >= 200 && result.status < 300) {
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: 'Ingreso creado exitosamente',
                            data: result.data[0] || dataToInsert
                        }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Error creando ingreso',
                            error: result.data
                        }));
                    }
                    
                } catch (parseError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Datos inválidos'
                    }));
                }
            });
            
        } catch (error) {
            console.error('Error creando ingreso:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            }));
        }
        return;
    }
    
    // GET /api/ingresos/:id - Obtener un ingreso específico
    if (pathname.match(/^\/api\/ingresos\/[a-f0-9-]+$/) && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            const ingresoId = pathname.split('/')[3];
            
            const result = await supabaseRequest(`ingresos?id=eq.${ingresoId}&usuario_id=eq.${userId}&limit=1`);
            
            if (result.data && result.data.length > 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.data[0]));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Ingreso no encontrado'
                }));
            }
            
        } catch (error) {
            console.error('Error obteniendo ingreso:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo ingreso',
                error: error.message
            }));
        }
        return;
    }
    
    // PUT /api/ingresos/:id - Actualizar ingreso
    if (pathname.match(/^\/api\/ingresos\/[a-f0-9-]+$/) && method === 'PUT') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            const ingresoId = pathname.split('/')[3];
            
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    const ingresoData = JSON.parse(body);
                    
                    // Validaciones
                    if (!ingresoData.descripcion || !ingresoData.monto) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Descripción y monto son obligatorios'
                        }));
                        return;
                    }
                    
                    if (ingresoData.monto <= 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'El monto debe ser mayor a 0'
                        }));
                        return;
                    }
                    
                    // Preparar datos para actualizar
                    const dataToUpdate = {
                        descripcion: ingresoData.descripcion,
                        monto: parseFloat(ingresoData.monto),
                        categoria: ingresoData.categoria || null,
                        fecha: ingresoData.fecha || new Date().toISOString().split('T')[0],
                        es_recurrente: ingresoData.es_recurrente || false,
                        frecuencia_dias: ingresoData.frecuencia_dias || null,
                        notas: ingresoData.notas || null
                    };
                    
                    // Actualizar ingreso en Supabase
                    const result = await supabaseRequest(`ingresos?id=eq.${ingresoId}&usuario_id=eq.${userId}`, 'PATCH', dataToUpdate);
                    
                    if (result.status >= 200 && result.status < 300) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: 'Ingreso actualizado exitosamente',
                            data: result.data[0] || dataToUpdate
                        }));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Error actualizando ingreso',
                            error: result.data
                        }));
                    }
                    
                } catch (parseError) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Datos inválidos'
                    }));
                }
            });
            
        } catch (error) {
            console.error('Error actualizando ingreso:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            }));
        }
        return;
    }
    
    // DELETE /api/ingresos/:id - Eliminar ingreso
    if (pathname.match(/^\/api\/ingresos\/[a-f0-9-]+$/) && method === 'DELETE') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            const ingresoId = pathname.split('/')[3];
            
            // Eliminar ingreso de Supabase
            const result = await supabaseRequest(`ingresos?id=eq.${ingresoId}&usuario_id=eq.${userId}`, 'DELETE');
            
            if (result.status >= 200 && result.status < 300) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Ingreso eliminado exitosamente'
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Ingreso no encontrado o error al eliminar'
                }));
            }
            
        } catch (error) {
            console.error('Error eliminando ingreso:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            }));
        }
        return;
    }
    
    // ================================
    // 💸 RUTAS API DE GASTOS
    // ================================
    
    // GET /api/gastos - Obtener lista de gastos del usuario
    if (pathname === '/api/gastos' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            const { page = 1, limit = 10, search = '', categoria = '', fechaDesde = '', fechaHasta = '' } = parsedUrl.query;
            
            // Construir filtros para Supabase
            let filters = [`usuario_id=eq.${userId}`];
            
            if (search) {
                filters.push(`or=(descripcion.ilike.*${search}*,notas.ilike.*${search}*)`);
            }
            if (categoria) {
                filters.push(`categoria=eq.${categoria}`);
            }
            if (fechaDesde) {
                filters.push(`fecha=gte.${fechaDesde}`);
            }
            if (fechaHasta) {
                filters.push(`fecha=lte.${fechaHasta}`);
            }
            
            const filtersString = filters.join('&');
            const offset = (page - 1) * limit;
            
            // Obtener gastos con filtros y paginación
            const gastosResult = await supabaseRequest(
                `gastos?${filtersString}&order=fecha.desc,created_at.desc&limit=${limit}&offset=${offset}`
            );
            
            // Obtener total de registros para paginación
            const countResult = await supabaseRequest(
                `gastos?${filtersString}&select=count`
            );
            
            const gastos = gastosResult.data || [];
            const totalCount = countResult.data?.[0]?.count || 0;
            
            // Calcular resumen
            const summaryResult = await supabaseRequest(
                `gastos?${filtersString}&select=monto`
            );
            const allGastos = summaryResult.data || [];
            const totalMonto = allGastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            
            // Gastos del mes actual
            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
            const monthlyFilter = filters.concat([`fecha=gte.${currentMonth}-01`, `fecha=lt.${currentMonth}-32`]).join('&');
            const monthlyResult = await supabaseRequest(`gastos?${monthlyFilter}&select=monto`);
            const monthlyGastos = monthlyResult.data || [];
            const monthlyTotal = monthlyGastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
            
            const totalPages = Math.ceil(totalCount / limit);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                gastos: gastos,
                summary: {
                    gastosTotal: totalMonto,
                    gastosMes: monthlyTotal,
                    cantidadRegistros: totalCount
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    totalPages: totalPages,
                    from: offset + 1,
                    to: Math.min(offset + parseInt(limit), totalCount)
                }
            }));
            
        } catch (error) {
            console.error('Error obteniendo gastos:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo gastos',
                error: error.message
            }));
        }
        return;
    }
    
    // GET /api/user - Obtener información del usuario actual desde token
    if (pathname === '/api/user' && method === 'GET') {
        try {
            const token = getTokenFromRequest(req);
            if (!token) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Token de autorización requerido'
                }));
                return;
            }
            
            const userId = getUserIdFromToken(token);
            
            // Obtener usuario
            const userResult = await supabaseRequest(`usuarios?id=eq.${userId}&select=id,nombre,apellido,email,telefono,created_at&limit=1`);
            
            if (!userResult.data || userResult.data.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Usuario no encontrado'
                }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: userResult.data[0]
            }));
            
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error obteniendo información del usuario',
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
            'GET /api/user',
            'GET /api/usuarios',
            'POST /api/usuarios',
            'GET /api/dashboard/:userId',
            'GET /api/ingresos',
            'POST /api/ingresos',
            'GET /api/ingresos/:id',
            'PUT /api/ingresos/:id',
            'DELETE /api/ingresos/:id'
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
    console.log('   - GET  /api/user (usuario actual)');
    console.log('   - GET  /api/usuarios (listar usuarios)');
    console.log('   - POST /api/usuarios (crear usuario/registro)');
    console.log('   - GET  /api/dashboard/:userId');
    console.log('   - GET  /api/ingresos (listar ingresos)');
    console.log('   - POST /api/ingresos (crear ingreso)');
    console.log('   - GET  /api/ingresos/:id (obtener ingreso)');
    console.log('   - PUT  /api/ingresos/:id (actualizar ingreso)');
    console.log('   - DELETE /api/ingresos/:id (eliminar ingreso)');
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
