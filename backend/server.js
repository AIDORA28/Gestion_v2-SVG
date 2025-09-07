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
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// 🔧 CONFIGURACIÓN MIDDLEWARE
// ================================

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================================
// 🗄️ CONFIGURACIÓN POSTGRESQL
// ================================

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 30000
});

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
        const { nombre, email, telefono, estado_civil, ingresos_mensuales, gastos_fijos } = req.body;
        
        const result = await pool.query(`
            INSERT INTO usuarios (nombre, email, telefono, estado_civil, ingresos_mensuales, gastos_fijos)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [nombre, email, telefono, estado_civil, ingresos_mensuales || 0, gastos_fijos || 0]);
        
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

// Crear ingreso
app.post('/api/ingresos', async (req, res) => {
    try {
        const { usuario_id, descripcion, monto, categoria, fecha, es_fijo } = req.body;
        
        const result = await pool.query(`
            INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha, es_fijo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [usuario_id, descripcion, monto, categoria, fecha, es_fijo || false]);
        
        res.status(201).json({
            success: true,
            message: 'Ingreso registrado exitosamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error registrando ingreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando ingreso',
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
