/**
 * 🚀 API BACKEND PARA VERCEL - PLANIFICAPRO
 * Replica exacta de server-local.js para producción
 * Maneja todas las rutas API para deployment en Vercel
 */

const url = require('url');

// Configuración de Supabase (mismas credenciales que server-local.js)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// Función para hacer requests HTTP a Supabase (igual que server-local.js)
async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const https = require('https');
    const urlParts = new URL(SUPABASE_URL);
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: urlParts.hostname,
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

// Función para requests de autenticación a Supabase Auth (igual que server-local.js)
async function supabaseAuthRequest(endpoint, method = 'POST', body = null) {
    const https = require('https');
    const urlParts = new URL(SUPABASE_URL);
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: urlParts.hostname,
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

// Obtener token del header Authorization
function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

// Obtener usuario ID del token (simulado por ahora - igual que server-local.js)
function getUserIdFromToken(token) {
    // En producción aquí se verificaría el JWT token
    // Por ahora retornamos un ID simulado para las pruebas
    return '18f58646-fb57-48be-91b8-58beccc21bf5'; // ID del usuario de prueba
}

// Función para leer el body de la request
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// Función principal del handler para Vercel
module.exports = async (req, res) => {
    // CORS headers (igual que server-local.js)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    try {
        // ================================
        // 🔐 RUTAS API DE AUTENTICACIÓN (igual que server-local.js)
        // ================================
        
        if ((pathname === '/api/login' || pathname === '/login') && method === 'POST') {
            const body = await parseBody(req);
            const { email, password } = body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }
            
            try {
                console.log('🔐 Intentando login con Supabase Auth para:', email);
                
                // Usar Supabase Auth para login (igual que server-local.js)
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
                    
                    return res.status(200).json({
                        success: true,
                        message: `¡Bienvenido ${usuario.nombre}!`,
                        data: { 
                            user: usuario,
                            access_token: authResponse.data.access_token
                        }
                    });
                    
                } else {
                    return res.status(401).json({
                        success: false,
                        message: 'Credenciales inválidas'
                    });
                }
                
            } catch (authError) {
                console.error('❌ Error en autenticación:', authError);
                return res.status(401).json({
                    success: false,
                    message: 'Error de autenticación. Verifique sus credenciales.'
                });
            }
        }
        
        // Test de conexión a Supabase (igual que server-local.js)
        if ((pathname === '/api/health' || pathname === '/health') && method === 'GET') {
            try {
                const result = await supabaseRequest('usuarios?select=count', 'GET');
                
                return res.status(200).json({
                    success: true,
                    message: '✅ API Backend conectado a Supabase',
                    status: 'healthy',
                    database: 'connected',
                    environment: 'vercel',
                    supabase_status: result.status,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error conectando a Supabase',
                    error: error.message
                });
            }
        }
        
        // Listar usuarios (para pruebas - igual que server-local.js)
        if ((pathname === '/api/usuarios' || pathname === '/usuarios') && method === 'GET') {
            try {
                const result = await supabaseRequest('usuarios?select=id,nombre,email,telefono,created_at&order=created_at.desc');
                
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    count: result.data.length,
                    server: 'vercel'
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error obteniendo usuarios',
                    error: error.message
                });
            }
        }
        
        // Crear usuario (registro - igual que server-local.js)
        if ((pathname === '/api/usuarios' || pathname === '/usuarios') && method === 'POST') {
            const userData = await parseBody(req);
            console.log('📝 Datos de registro recibidos:', userData);
            
            // Extraer password y crear userData sin password para Supabase
            const { password, ...userDataWithoutPassword } = userData;
            
            try {
                console.log('🔄 Creando usuario con Supabase Auth...');
                
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
                        return res.status(201).json({
                            success: true,
                            message: '✅ Usuario registrado exitosamente',
                            data: profileResult.data[0] || profileData,
                            server: 'vercel'
                        });
                    } else {
                        // Error creando perfil pero Auth fue exitoso
                        return res.status(201).json({
                            success: true,
                            message: '✅ Usuario registrado (perfil pendiente)',
                            data: {
                                id: authResponse.data.user.id,
                                email: authResponse.data.user.email,
                                ...userDataWithoutPassword
                            },
                            server: 'vercel',
                            note: 'Usuario creado en Auth, perfil pendiente'
                        });
                    }
                } else {
                    // Error en Auth
                    return res.status(400).json({
                        success: false,
                        message: authResponse.data.error_description || 'Error al crear cuenta',
                        error: authResponse.data
                    });
                }
                
            } catch (authError) {
                console.error('❌ Error en registro:', authError);
                return res.status(500).json({
                    success: false,
                    message: 'Error interno al crear cuenta',
                    error: authError.message
                });
            }
        }
        
        // ================================
        // 💰 RUTAS API DE INGRESOS (igual que server-local.js)
        // ================================
        
        // GET /api/ingresos - Obtener lista de ingresos del usuario
        if ((pathname === '/api/ingresos' || pathname === '/ingresos') && method === 'GET') {
            const token = getTokenFromRequest(req);
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de autorización requerido'
                });
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
            
            try {
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
                
                return res.status(200).json({
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
                });
                
            } catch (error) {
                console.error('Error obteniendo ingresos:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error obteniendo ingresos',
                    error: error.message
                });
            }
        }
        
        // POST /api/ingresos - Crear nuevo ingreso
        if ((pathname === '/api/ingresos' || pathname === '/ingresos') && method === 'POST') {
            const token = getTokenFromRequest(req);
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de autorización requerido'
                });
            }
            
            const userId = getUserIdFromToken(token);
            const ingresoData = await parseBody(req);
            
            // Validaciones
            if (!ingresoData.descripcion || !ingresoData.monto) {
                return res.status(400).json({
                    success: false,
                    message: 'Descripción y monto son obligatorios'
                });
            }
            
            if (ingresoData.monto <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser mayor a 0'
                });
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
            
            try {
                // Crear ingreso en Supabase
                const result = await supabaseRequest('ingresos', 'POST', dataToInsert);
                
                if (result.status >= 200 && result.status < 300) {
                    return res.status(201).json({
                        success: true,
                        message: 'Ingreso creado exitosamente',
                        data: result.data[0] || dataToInsert
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Error creando ingreso',
                        error: result.data
                    });
                }
                
            } catch (error) {
                console.error('Error creando ingreso:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: error.message
                });
            }
        }
        
        // GET /api/user - Obtener información del usuario actual desde token
        if ((pathname === '/api/user' || pathname === '/user') && method === 'GET') {
            const token = getTokenFromRequest(req);
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de autorización requerido'
                });
            }
            
            const userId = getUserIdFromToken(token);
            
            try {
                // Obtener usuario
                const userResult = await supabaseRequest(`usuarios?id=eq.${userId}&select=id,nombre,apellido,email,telefono,created_at&limit=1`);
                
                if (!userResult.data || userResult.data.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    data: userResult.data[0]
                });
                
            } catch (error) {
                console.error('Error obteniendo usuario:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error obteniendo información del usuario',
                    error: error.message
                });
            }
        }
        
        // Dashboard básico (igual que server-local.js)
        if (pathname.startsWith('/api/dashboard/') && method === 'GET') {
            const userId = pathname.split('/')[3];
            try {
                // Obtener usuario
                const userResult = await supabaseRequest(`usuarios?id=eq.${userId}&select=id,nombre,email`);
                
                if (!userResult.data || userResult.data.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
                
                // Obtener ingresos y gastos
                const ingresosResult = await supabaseRequest(`ingresos?usuario_id=eq.${userId}`);
                const gastosResult = await supabaseRequest(`gastos?usuario_id=eq.${userId}`);
                
                const ingresos = ingresosResult.data || [];
                const gastos = gastosResult.data || [];
                
                const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                const balance = totalIngresos - totalGastos;
                
                return res.status(200).json({
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
                    server: 'vercel'
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error obteniendo dashboard',
                    error: error.message
                });
            }
        }
        
        // 404 para rutas no encontradas
        return res.status(404).json({
            success: false,
            message: 'Ruta no encontrada',
            path: pathname,
            server: 'vercel',
            availableEndpoints: [
                'GET /api/health',
                'POST /api/login',
                'GET /api/user',
                'GET /api/usuarios',
                'POST /api/usuarios',
                'GET /api/dashboard/:userId',
                'GET /api/ingresos',
                'POST /api/ingresos'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error general en API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
            server: 'vercel'
        });
    }
};
