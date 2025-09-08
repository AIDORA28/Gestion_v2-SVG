/**
 * 🚀 SERVIDOR API - SISTEMA GESTIÓN PRESUPUESTO PERSONAL
 * Stack: Node.js + Express + PostgreSQL
 * Puerto: 5000
 * Base de Datos: PostgreSQL Local (127.0.0.1:5434)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// 🔧 CONFIGURACIÓN MIDDLEWARE
// ================================

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================================
// 🗄️ CONFIGURACIÓN POSTGRESQL/SUPABASE
// ================================

// Detectar entorno y configurar conexión apropiada
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const isVercel = process.env.VERCEL === '1';

let poolConfig;

if ((isProduction || isVercel) && process.env.SUPABASE_URL) {
    // 🌐 PRODUCCIÓN/VERCEL: Usar Supabase
    console.log('🌐 Configurando conexión a Supabase (Vercel)...');
    
    // Extraer datos de la URL de Supabase
    const supabaseUrl = new URL(process.env.SUPABASE_URL);
    const host = supabaseUrl.hostname;
    const port = parseInt(supabaseUrl.port) || 5432;
    
    poolConfig = {
        host: host,
        port: port,
        database: 'postgres', // Base de datos por defecto en Supabase
        user: 'postgres',     // Usuario por defecto en Supabase
        password: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
        ssl: {
            rejectUnauthorized: false
        },
        max: 20,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000
    };
    
    console.log(`📡 Supabase Host: ${host}:${port}`);
    
} else {
    // 🏠 DESARROLLO: Usar PostgreSQL local
    console.log('🏠 Configurando conexión a PostgreSQL local...');
    
    poolConfig = {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5434,
        database: process.env.DB_NAME || 'gestion_presupuesto',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'sa123',
        max: 20,
        connectionTimeoutMillis: 2000,
        idleTimeoutMillis: 30000
    };
    
    console.log(`🏠 Local DB: ${poolConfig.host}:${poolConfig.port}`);
}

const pool = new Pool(poolConfig);

// Test conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a PostgreSQL:', err);
        return;
    }
    console.log('✅ PostgreSQL conectado correctamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    release();
});

// ================================
// 📊 RUTAS PRINCIPALES
// ================================

// 🏠 Ruta de estado
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API Gestión Presupuesto Personal',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL Local',
        endpoints: {
            usuarios: '/api/usuarios',
            ingresos: '/api/ingresos',
            gastos: '/api/gastos',
            simulaciones: '/api/simulaciones',
            reportes: '/api/reportes'
        }
    });
});

// 🔍 Health check
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as timestamp');
        res.json({
            success: true,
            status: 'healthy',
            database: 'connected',
            timestamp: result.rows[0].timestamp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// ================================
// 👤 RUTAS USUARIOS
// ================================

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, nombre, email, telefono, estado_civil, 
                   ingresos_mensuales, gastos_fijos, created_at, updated_at 
            FROM usuarios 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo usuarios',
            error: error.message
        });
    }
});

// Crear usuario
app.post('/api/usuarios', async (req, res) => {
    try {
        const { 
            nombre, apellido, email, password, dni, telefono, direccion,
            fecha_nacimiento, profesion, estado_civil, genero, nacionalidad,
            numero_hijos, ingresos_mensuales, gastos_fijos
        } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido, email y contraseña son requeridos'
            });
        }

        // Verificar si el email ya existe
        const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (existingUser.rowCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Guardar contraseña directamente (sin hash por simplicidad)
        const result = await pool.query(`
            INSERT INTO usuarios (
                nombre, apellido, email, password_hash, dni, telefono, direccion,
                fecha_nacimiento, profesion, estado_civil, genero, nacionalidad,
                numero_hijos, ingresos_mensuales, gastos_fijos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id, nombre, apellido, email, dni, telefono, direccion, fecha_nacimiento, 
                      profesion, estado_civil, genero, nacionalidad, numero_hijos, 
                      ingresos_mensuales, gastos_fijos, created_at
        `, [
            nombre, apellido, email, password, dni, telefono, direccion,
            fecha_nacimiento, profesion, estado_civil, genero, nacionalidad,
            numero_hijos || 0, ingresos_mensuales || 0, gastos_fijos || 0
        ]);
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando usuario',
            error: error.message
        });
    }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario por email y password (sin bcrypt por simplicidad)
        const result = await pool.query(`
            SELECT id, nombre, apellido, email, dni, telefono, direccion, fecha_nacimiento,
                   profesion, estado_civil, genero, nacionalidad, numero_hijos,
                   ingresos_mensuales, gastos_fijos, created_at, active
            FROM usuarios 
            WHERE email = $1 AND password_hash = $2 AND active = true
        `, [email, password]);

        if (result.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas - Usuario no encontrado o contraseña incorrecta'
            });
        }

        const user = result.rows[0];
        
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: user
            }
        });
        
        console.log(`✅ Login exitoso para usuario: ${user.email}`);
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
});

// Verificar usuario autenticado (simulando JWT para compatibilidad con frontend)
app.get('/auth/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Extraer el "token" (en nuestro caso, será el email del usuario)
        const token = authHeader.substring(7); // Remover "Bearer "
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Buscar usuario por email (usando el email como "token")
        const result = await pool.query(`
            SELECT id, nombre, apellido, email, dni, telefono, direccion, fecha_nacimiento,
                   profesion, estado_civil, genero, nacionalidad, numero_hijos,
                   ingresos_mensuales, gastos_fijos, created_at, active
            FROM usuarios 
            WHERE email = $1 AND active = true
        `, [token]);

        if (result.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = result.rows[0];
        
        res.json({
            success: true,
            message: 'Token válido',
            ...user  // Enviar los datos del usuario directamente
        });
        
    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando autenticación',
            error: error.message
        });
    }
});

// ================================
// 💰 RUTAS INGRESOS
// ================================

// Obtener ingresos por usuario
app.get('/api/ingresos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(`
            SELECT i.*, u.nombre as usuario_nombre
            FROM ingresos i
            LEFT JOIN usuarios u ON i.usuario_id = u.id
            WHERE i.usuario_id = $1
            ORDER BY i.fecha DESC
        `, [userId]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error obteniendo ingresos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ingresos',
            error: error.message
        });
    }
});

// ================================
// 💰 RUTAS INGRESOS EXTENDIDAS PARA FRONTEND
// ================================

// Middleware para extraer userId del token
const extractUserFromToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token requerido' });
        }

        // Extraer email del token (simple, sin JWT)
        const email = token;
        req.userEmail = email;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// Obtener usuario por email
const getUserByEmail = async (email) => {
    const result = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    return result.rows[0];
};

// Obtener ingresos con paginación y filtros
app.get('/api/ingresos', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const {
            page = 1,
            limit = 10,
            search = '',
            categoria = '',
            fechaDesde = '',
            fechaHasta = ''
        } = req.query;

        const offset = (page - 1) * limit;
        
        // Construir filtros dinámicos
        let whereConditions = ['usuario_id = $1'];
        let params = [user.id];
        let paramCount = 1;

        if (search) {
            paramCount++;
            whereConditions.push(`(descripcion ILIKE $${paramCount} OR notas ILIKE $${paramCount})`);
            params.push(`%${search}%`);
        }

        if (categoria) {
            paramCount++;
            whereConditions.push(`categoria = $${paramCount}`);
            params.push(categoria);
        }

        if (fechaDesde) {
            paramCount++;
            whereConditions.push(`fecha >= $${paramCount}`);
            params.push(fechaDesde);
        }

        if (fechaHasta) {
            paramCount++;
            whereConditions.push(`fecha <= $${paramCount}`);
            params.push(fechaHasta);
        }

        const whereClause = whereConditions.join(' AND ');

        // Consulta principal con paginación
        const ingresosQuery = `
            SELECT id, descripcion, monto, categoria, fecha, es_recurrente, 
                   frecuencia_dias, notas, created_at, updated_at
            FROM ingresos 
            WHERE ${whereClause}
            ORDER BY fecha DESC, created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        
        params.push(limit, offset);
        const ingresosResult = await pool.query(ingresosQuery, params);

        // Consulta para contar total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM ingresos 
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params.slice(0, -2));

        // Consulta para resumen
        const summaryQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE) THEN monto ELSE 0 END), 0) as ingresos_mes,
                COALESCE(SUM(monto), 0) as ingresos_total,
                COUNT(*) as cantidad_registros
            FROM ingresos 
            WHERE ${whereClause}
        `;
        const summaryResult = await pool.query(summaryQuery, params.slice(0, -2));

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        const currentPage = parseInt(page);

        res.json({
            success: true,
            ingresos: ingresosResult.rows,
            summary: {
                ingresosMes: summaryResult.rows[0].ingresos_mes,
                ingresosTotal: summaryResult.rows[0].ingresos_total,
                cantidadRegistros: summaryResult.rows[0].cantidad_registros
            },
            pagination: {
                page: currentPage,
                limit: parseInt(limit),
                total: total,
                totalPages: totalPages,
                from: total > 0 ? offset + 1 : 0,
                to: Math.min(offset + parseInt(limit), total)
            }
        });

    } catch (error) {
        console.error('Error obteniendo ingresos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ingresos',
            error: error.message
        });
    }
});

// Crear nuevo ingreso (versión extendida)
app.post('/api/ingresos', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const { 
            descripcion, 
            monto, 
            categoria = null, 
            fecha = null, 
            es_recurrente = false,
            frecuencia_dias = null,
            notas = null 
        } = req.body;

        // Validaciones
        if (!descripcion || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Descripción y monto son obligatorios'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }

        const result = await pool.query(`
            INSERT INTO ingresos (
                usuario_id, descripcion, monto, categoria, fecha, 
                es_recurrente, frecuencia_dias, notas, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *
        `, [
            user.id, descripcion, monto, categoria, fecha || new Date().toISOString().split('T')[0],
            es_recurrente, frecuencia_dias, notas
        ]);

        res.status(201).json({
            success: true,
            message: 'Ingreso creado exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error creando ingreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando ingreso',
            error: error.message
        });
    }
});

// Obtener ingreso específico
app.get('/api/ingresos/:id', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM ingresos 
            WHERE id = $1 AND usuario_id = $2
        `, [id, user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ingreso no encontrado'
            });
        }

        res.json({
            success: true,
            ...result.rows[0]
        });

    } catch (error) {
        console.error('Error obteniendo ingreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo ingreso',
            error: error.message
        });
    }
});

// Actualizar ingreso
app.put('/api/ingresos/:id', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const { id } = req.params;
        const { 
            descripcion, 
            monto, 
            categoria, 
            fecha, 
            es_recurrente,
            frecuencia_dias,
            notas 
        } = req.body;

        // Validaciones
        if (!descripcion || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Descripción y monto son obligatorios'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }

        const result = await pool.query(`
            UPDATE ingresos 
            SET descripcion = $1, monto = $2, categoria = $3, fecha = $4,
                es_recurrente = $5, frecuencia_dias = $6, notas = $7, updated_at = NOW()
            WHERE id = $8 AND usuario_id = $9
            RETURNING *
        `, [
            descripcion, monto, categoria, fecha, 
            es_recurrente, frecuencia_dias, notas, id, user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ingreso no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Ingreso actualizado exitosamente',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error actualizando ingreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando ingreso',
            error: error.message
        });
    }
});

// Eliminar ingreso
app.delete('/api/ingresos/:id', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const { id } = req.params;
        const result = await pool.query(`
            DELETE FROM ingresos 
            WHERE id = $1 AND usuario_id = $2
            RETURNING *
        `, [id, user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ingreso no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Ingreso eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando ingreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando ingreso',
            error: error.message
        });
    }
});

// Resumen de ingresos
app.get('/api/ingresos/summary', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const result = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE) THEN monto ELSE 0 END), 0) as ingresos_mes,
                COALESCE(SUM(monto), 0) as ingresos_total,
                COUNT(*) as cantidad_registros
            FROM ingresos 
            WHERE usuario_id = $1
        `, [user.id]);

        res.json({
            success: true,
            summary: result.rows[0]
        });

    } catch (error) {
        console.error('Error obteniendo resumen:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo resumen',
            error: error.message
        });
    }
});

// Exportar ingresos a CSV
app.get('/api/ingresos/export', extractUserFromToken, async (req, res) => {
    try {
        const user = await getUserByEmail(req.userEmail);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const {
            search = '',
            categoria = '',
            fechaDesde = '',
            fechaHasta = ''
        } = req.query;

        // Aplicar los mismos filtros que en la consulta principal
        let whereConditions = ['usuario_id = $1'];
        let params = [user.id];
        let paramCount = 1;

        if (search) {
            paramCount++;
            whereConditions.push(`(descripcion ILIKE $${paramCount} OR notas ILIKE $${paramCount})`);
            params.push(`%${search}%`);
        }

        if (categoria) {
            paramCount++;
            whereConditions.push(`categoria = $${paramCount}`);
            params.push(categoria);
        }

        if (fechaDesde) {
            paramCount++;
            whereConditions.push(`fecha >= $${paramCount}`);
            params.push(fechaDesde);
        }

        if (fechaHasta) {
            paramCount++;
            whereConditions.push(`fecha <= $${paramCount}`);
            params.push(fechaHasta);
        }

        const whereClause = whereConditions.join(' AND ');

        const result = await pool.query(`
            SELECT descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas
            FROM ingresos 
            WHERE ${whereClause}
            ORDER BY fecha DESC
        `, params);

        // Generar CSV
        const headers = ['Fecha', 'Descripción', 'Monto', 'Categoría', 'Recurrente', 'Frecuencia (días)', 'Notas'];
        const csvContent = [
            headers.join(','),
            ...result.rows.map(row => [
                row.fecha,
                `"${row.descripcion}"`,
                row.monto,
                row.categoria || '',
                row.es_recurrente ? 'Sí' : 'No',
                row.frecuencia_dias || '',
                `"${row.notas || ''}"`
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ingresos.csv');
        res.send(csvContent);

    } catch (error) {
        console.error('Error exportando ingresos:', error);
        res.status(500).json({
            success: false,
            message: 'Error exportando ingresos',
            error: error.message
        });
    }
});

// ================================
// 💳 RUTAS GASTOS
// ================================

// Obtener gastos por usuario
app.get('/api/gastos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(`
            SELECT g.*, u.nombre as usuario_nombre
            FROM gastos g
            LEFT JOIN usuarios u ON g.usuario_id = u.id
            WHERE g.usuario_id = $1
            ORDER BY g.fecha DESC
        `, [userId]);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error obteniendo gastos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo gastos',
            error: error.message
        });
    }
});

// Crear gasto
app.post('/api/gastos', async (req, res) => {
    try {
        const { usuario_id, descripcion, monto, categoria, fecha, es_fijo } = req.body;
        
        const result = await pool.query(`
            INSERT INTO gastos (usuario_id, descripcion, monto, categoria, fecha, es_fijo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [usuario_id, descripcion, monto, categoria, fecha, es_fijo || false]);
        
        res.status(201).json({
            success: true,
            message: 'Gasto registrado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error registrando gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando gasto',
            error: error.message
        });
    }
});

// ================================
// 📈 RUTAS REPORTES
// ================================

// Dashboard resumen por usuario
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Obtener totales del mes actual
        const result = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1 AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as ingresos_mes,
                (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1 AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as gastos_mes,
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1) as ingresos_total,
                (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1) as gastos_total
        `, [userId]);
        
        const data = result.rows[0];
        data.balance_mes = data.ingresos_mes - data.gastos_mes;
        data.balance_total = data.ingresos_total - data.gastos_total;
        
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error obteniendo dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo dashboard',
            error: error.message
        });
    }
});

// Estadísticas financieras para el dashboard
app.get('/api/financial/stats', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const userEmail = authHeader.substring(7);
        
        // Obtener ID del usuario
        const userResult = await pool.query('SELECT id FROM usuarios WHERE email = $1', [userEmail]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const userId = userResult.rows[0].id;
        
        // Obtener estadísticas del mes actual
        const result = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1 AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as income,
                (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1 AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) as expenses,
                (SELECT COALESCE(SUM(monto), 0) FROM ingresos WHERE usuario_id = $1) as total_income,
                (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE usuario_id = $1) as total_expenses
        `, [userId]);
        
        const data = result.rows[0];
        data.balance = data.total_income - data.total_expenses;
        data.savings = data.income - data.expenses;
        
        res.json(data);
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas',
            error: error.message
        });
    }
});

// Transacciones recientes
app.get('/api/transactions/recent', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const userEmail = authHeader.substring(7);
        const limit = parseInt(req.query.limit) || 10;
        
        // Obtener ID del usuario
        const userResult = await pool.query('SELECT id FROM usuarios WHERE email = $1', [userEmail]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const userId = userResult.rows[0].id;
        
        // Obtener transacciones recientes (combinando ingresos y gastos)
        const result = await pool.query(`
            (SELECT id, descripcion, categoria, monto, fecha, 'ingreso' as tipo 
             FROM ingresos WHERE usuario_id = $1)
            UNION ALL
            (SELECT id, descripcion, categoria, monto, fecha, 'gasto' as tipo 
             FROM gastos WHERE usuario_id = $1)
            ORDER BY fecha DESC
            LIMIT $2
        `, [userId, limit]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo transacciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo transacciones',
            error: error.message
        });
    }
});

// Datos para gráficos del dashboard
app.get('/api/analytics/charts', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const userEmail = authHeader.substring(7);
        
        // Obtener ID del usuario
        const userResult = await pool.query('SELECT id FROM usuarios WHERE email = $1', [userEmail]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        const userId = userResult.rows[0].id;
        
        // Datos para gráfico mensual (últimos 6 meses)
        const monthlyResult = await pool.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months' + INTERVAL '1 month' * generate_series(0, 5)), 'Mon') as month,
                COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END), 0) as expenses
            FROM (
                SELECT monto, fecha, 'ingreso' as tipo FROM ingresos WHERE usuario_id = $1
                UNION ALL
                SELECT monto, fecha, 'gasto' as tipo FROM gastos WHERE usuario_id = $1
            ) t
            WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
            GROUP BY DATE_TRUNC('month', fecha)
            ORDER BY DATE_TRUNC('month', fecha)
        `, [userId]);
        
        // Datos para gráfico de categorías (gastos)
        const categoryResult = await pool.query(`
            SELECT categoria, SUM(monto) as amount
            FROM gastos 
            WHERE usuario_id = $1 
            AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY categoria
            ORDER BY amount DESC
            LIMIT 5
        `, [userId]);
        
        // Datos para gráfico de tendencia (balance mensual)
        const trendResult = await pool.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', fecha), 'Mon') as month,
                SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) as balance
            FROM (
                SELECT monto, fecha, 'ingreso' as tipo FROM ingresos WHERE usuario_id = $1
                UNION ALL
                SELECT monto, fecha, 'gasto' as tipo FROM gastos WHERE usuario_id = $1
            ) t
            WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
            GROUP BY DATE_TRUNC('month', fecha)
            ORDER BY DATE_TRUNC('month', fecha)
        `, [userId]);
        
        res.json({
            monthlyFlow: {
                labels: monthlyResult.rows.map(row => row.month),
                income: monthlyResult.rows.map(row => parseFloat(row.income)),
                expenses: monthlyResult.rows.map(row => parseFloat(row.expenses))
            },
            categoryBreakdown: {
                labels: categoryResult.rows.map(row => row.categoria),
                amounts: categoryResult.rows.map(row => parseFloat(row.amount))
            },
            yearlyTrend: {
                labels: trendResult.rows.map(row => row.month),
                balance: trendResult.rows.map(row => parseFloat(row.balance))
            }
        });
    } catch (error) {
        console.error('Error obteniendo datos de gráficos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos de gráficos',
            error: error.message
        });
    }
});

// ================================
// 🚨 MANEJO DE ERRORES
// ================================

// Ruta no encontrada
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api/usuarios',
            'POST /api/usuarios',
            'GET /api/ingresos/:userId',
            'POST /api/ingresos',
            'GET /api/gastos/:userId',
            'POST /api/gastos',
            'GET /api/dashboard/:userId'
        ]
    });
});

// Error handler global
app.use((error, req, res, next) => {
    console.error('❌ Error global:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
});

// ================================
// 🚀 INICIAR SERVIDOR
// ================================

app.listen(PORT, () => {
    console.log('\n🚀 ====================================');
    console.log(`   API GESTIÓN PRESUPUESTO PERSONAL`);
    console.log('🚀 ====================================');
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(`🗄️ Base de datos: PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT})`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log('🚀 ====================================\n');
});

module.exports = app;
