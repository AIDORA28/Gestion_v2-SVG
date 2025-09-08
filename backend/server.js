/**
 * 🚀 SERVIDOR API - SISTEMA GESTIÓN PRESUPUESTO PERSONAL
 * Stack: Node.js + Express + Supabase
 * Base de Datos: Supabase (PostgreSQL Cloud)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// 🔧 CONFIGURACIÓN MIDDLEWARE
// ================================

app.use(helmet());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================================
// 🗄️ CONFIGURACIÓN SUPABASE
// ================================

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de Supabase no configuradas');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('✅ Cliente Supabase inicializado');
console.log('🌐 URL:', supabaseUrl);

// ================================
// 📊 RUTAS PRINCIPALES
// ================================

// 🏠 Ruta de inicio
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API Gestión Presupuesto Personal - Supabase',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        database: 'Supabase (PostgreSQL Cloud)',
        endpoints: {
            usuarios: '/api/usuarios',
            ingresos: '/api/ingresos',
            gastos: '/api/gastos',
            dashboard: '/api/dashboard',
            health: '/health'
        }
    });
});

// Health check con Supabase
app.get('/health', async (req, res) => {
    try {
        const { data, error, count } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });

        if (error) {
            return res.status(500).json({
                success: false,
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message
            });
        }

        res.json({
            success: true,
            status: 'healthy',
            database: 'connected',
            message: 'Supabase conectado correctamente ✅',
            tables: {
                usuarios: count !== null ? `${count} registros` : 'accesible'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            database: 'error',
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
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, email, telefono, estado_civil, ingresos_mensuales, gastos_fijos, created_at, updated_at')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: data,
            count: data.length
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
        const { data: existingUser, error: checkError } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear usuario
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{
                nombre,
                apellido,
                email,
                password_hash: hashedPassword,
                dni,
                telefono,
                direccion,
                fecha_nacimiento,
                profesion,
                estado_civil,
                genero,
                nacionalidad,
                numero_hijos: numero_hijos || 0,
                ingresos_mensuales: parseFloat(ingresos_mensuales) || 0,
                gastos_fijos: parseFloat(gastos_fijos) || 0
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Remover password_hash de la respuesta
        const { password_hash, ...userResponse } = data;
        
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: userResponse
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

// Obtener ingresos de un usuario
app.get('/api/ingresos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const { data, error } = await supabase
            .from('ingresos')
            .select('*')
            .eq('usuario_id', userId)
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: data,
            count: data.length
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
        const { usuario_id, monto, descripcion, categoria, fecha, es_recurrente, frecuencia_recurrencia } = req.body;
        
        if (!usuario_id || !monto || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Usuario ID, monto y descripción son requeridos'
            });
        }
        
        const { data, error } = await supabase
            .from('ingresos')
            .insert([{
                usuario_id,
                monto: parseFloat(monto),
                descripcion,
                categoria,
                fecha: fecha || new Date().toISOString(),
                es_recurrente: es_recurrente || false,
                frecuencia_recurrencia
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Ingreso creado exitosamente',
            data: data
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

// ================================
// 💸 RUTAS GASTOS
// ================================

// Obtener gastos de un usuario
app.get('/api/gastos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const { data, error } = await supabase
            .from('gastos')
            .select('*')
            .eq('usuario_id', userId)
            .order('fecha', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: data,
            count: data.length
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
        const { usuario_id, monto, descripcion, categoria, fecha, es_recurrente, frecuencia_recurrencia } = req.body;
        
        if (!usuario_id || !monto || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Usuario ID, monto y descripción son requeridos'
            });
        }
        
        const { data, error } = await supabase
            .from('gastos')
            .insert([{
                usuario_id,
                monto: parseFloat(monto),
                descripcion,
                categoria,
                fecha: fecha || new Date().toISOString(),
                es_recurrente: es_recurrente || false,
                frecuencia_recurrencia
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            message: 'Gasto creado exitosamente',
            data: data
        });
    } catch (error) {
        console.error('Error creando gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando gasto',
            error: error.message
        });
    }
});

// ================================
// 📊 RUTAS DASHBOARD
// ================================

// Obtener resumen del dashboard
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Obtener ingresos totales del mes actual
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        
        const { data: ingresos, error: errorIngresos } = await supabase
            .from('ingresos')
            .select('monto')
            .eq('usuario_id', userId)
            .gte('fecha', inicioMes.toISOString());
        
        const { data: gastos, error: errorGastos } = await supabase
            .from('gastos')
            .select('monto')
            .eq('usuario_id', userId)
            .gte('fecha', inicioMes.toISOString());
        
        if (errorIngresos || errorGastos) {
            throw new Error(errorIngresos?.message || errorGastos?.message);
        }
        
        const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const balance = totalIngresos - totalGastos;
        
        res.json({
            success: true,
            data: {
                totalIngresos,
                totalGastos,
                balance,
                mes: inicioMes.getMonth() + 1,
                año: inicioMes.getFullYear()
            }
        });
    } catch (error) {
        console.error('Error obteniendo dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos del dashboard',
            error: error.message
        });
    }
});

// ================================
// 🚫 MANEJO DE RUTAS NO ENCONTRADAS
// ================================

app.use('*', (req, res) => {
    const availableEndpoints = [
        'GET /',
        'GET /health',
        'GET /api/usuarios',
        'POST /api/usuarios',
        'GET /api/ingresos/:userId',
        'POST /api/ingresos',
        'GET /api/gastos/:userId',
        'POST /api/gastos',
        'GET /api/dashboard/:userId'
    ];
    
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        availableEndpoints
    });
});

// ================================
// 🚀 INICIAR SERVIDOR
// ================================

app.listen(PORT, () => {
    console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log(`📡 API disponible en: http://localhost:${PORT}`);
});

// Exportar para Vercel
module.exports = app;
