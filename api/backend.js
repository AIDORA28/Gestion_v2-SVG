/**
 * 🚀 VERCEL FUNCTION - SISTEMA GESTIÓN PRESUPUESTO PERSONAL
 * Stack: Node.js + Express + Supabase (Cloud)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const app = express();

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

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log('- SUPABASE_URL:', !!supabaseUrl);
console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables de Supabase no configuradas');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('✅ Cliente Supabase inicializado para Vercel Function');

// ================================
// 📊 RUTAS PRINCIPALES
// ================================

// 🏠 Ruta de inicio
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 PLANIFICAPRO - API Gestión Presupuesto Personal',
        version: '2.0.1',
        status: 'running',
        timestamp: new Date().toISOString(),
        database: 'Supabase (Cloud)',
        environment: 'Vercel Function',
        endpoints: {
            usuarios: '/api/usuarios',
            ingresos: '/api/ingresos',
            gastos: '/api/gastos',
            dashboard: '/api/dashboard',
            health: '/health'
        }
    });
});

// ================================
// 🔍 HEALTH CHECK AVANZADO
// ================================

app.get('/health', async (req, res) => {
    console.log('🔍 Health Check - Vercel Function');
    console.log('Environment Variables:');
    console.log('- SUPABASE_URL:', !!process.env.SUPABASE_URL);
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    try {
        console.log('🔍 Testing Supabase connection...');
        const { data, error, count } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
                environment: 'Vercel Function'
            });
        }

        console.log('✅ Supabase connection successful');
        res.json({
            success: true,
            status: 'healthy',
            database: 'connected',
            message: '✅ PLANIFICAPRO conectado a Supabase correctamente',
            tables: {
                usuarios: count !== null ? `${count} registros` : 'accesible'
            },
            timestamp: new Date().toISOString(),
            environment: 'Vercel Function'
        });
    } catch (error) {
        console.log('💥 Unexpected error:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            database: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
            environment: 'Vercel Function'
        });
    }
});

// ================================
// 🧪 DEBUG ENDPOINTS
// ================================

// Verificar variables de entorno
app.get('/api/env-check', (req, res) => {
    console.log('🔍 ENV CHECK - Verificando variables...');
    
    const envInfo = {
        success: true,
        timestamp: new Date().toISOString(),
        environment: 'Vercel Function',
        variables: {
            NODE_ENV: process.env.NODE_ENV || 'not-set',
            SUPABASE_URL: process.env.SUPABASE_URL ? 
                process.env.SUPABASE_URL.substring(0, 35) + '...' : 'NOT_SET',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'NOT_SET',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'NOT_SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
        },
        debug: {
            url_starts_with_https: process.env.SUPABASE_URL?.startsWith('https://'),
            url_contains_supabase: process.env.SUPABASE_URL?.includes('supabase.co'),
            service_key_starts_with_ey: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ')
        }
    };

    console.log('📊 Environment info:', JSON.stringify(envInfo, null, 2));
    
    return res.json(envInfo);
});

// ================================
// � ENDPOINT TEMPORAL PARA INSPECCIÓN DE ESQUEMA
// ================================

app.get('/api/inspect-schema', async (req, res) => {
    try {
        console.log('🔍 Inspeccionando esquema de Supabase...');
        
        // Consultar todas las tablas de la base de datos
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .order('table_name');
        
        if (tablesError) {
            console.log('Error obteniendo tablas:', tablesError);
        }
        
        // Intentar obtener información de columnas de cada tabla
        const schemaInfo = {};
        
        // Lista de tablas que esperamos encontrar
        const expectedTables = ['usuarios', 'ingresos', 'gastos', 'perfiles_usuario', 'simulaciones_credito'];
        
        for (const tableName of expectedTables) {
            try {
                // Consultar estructura de la tabla
                const { data: columns, error: columnsError } = await supabase
                    .from('information_schema.columns')
                    .select('column_name, data_type, is_nullable, column_default')
                    .eq('table_schema', 'public')
                    .eq('table_name', tableName)
                    .order('ordinal_position');
                
                if (!columnsError && columns && columns.length > 0) {
                    schemaInfo[tableName] = {
                        exists: true,
                        columns: columns
                    };
                    
                    // Intentar contar registros
                    try {
                        const { count, error: countError } = await supabase
                            .from(tableName)
                            .select('*', { count: 'exact', head: true });
                        
                        if (!countError) {
                            schemaInfo[tableName].recordCount = count;
                        }
                    } catch (countErr) {
                        schemaInfo[tableName].recordCount = 'error';
                    }
                } else {
                    schemaInfo[tableName] = {
                        exists: false,
                        error: columnsError?.message || 'Tabla no encontrada'
                    };
                }
            } catch (err) {
                schemaInfo[tableName] = {
                    exists: false,
                    error: err.message
                };
            }
        }
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Inspección de esquema completada',
            schema: schemaInfo,
            allTables: tables || []
        });
        
    } catch (error) {
        console.error('💥 Error inspeccionando esquema:', error);
        res.status(500).json({
            success: false,
            message: 'Error inspeccionando esquema',
            error: error.message
        });
    }
});

// ================================
// �👤 RUTAS USUARIOS
// ================================

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

// ================================
// � RUTAS INGRESOS
// ================================

// Obtener todos los ingresos
app.get('/api/ingresos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ingresos')
            .select('*')
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

// Crear nuevo ingreso
app.post('/api/ingresos', async (req, res) => {
    try {
        const { descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas } = req.body;
        
        // Validaciones básicas
        if (!descripcion || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Descripción y monto son requeridos'
            });
        }
        
        if (monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }
        
        // Por ahora usamos un usuario fijo (luego implementaremos autenticación)
        const usuario_id = '00000000-0000-0000-0000-000000000000';
        
        const ingresoData = {
            descripcion,
            monto: parseFloat(monto),
            categoria: categoria || 'otros',
            fecha: fecha || new Date().toISOString().split('T')[0],
            es_recurrente: es_recurrente || false,
            frecuencia_dias: frecuencia_dias || null,
            notas: notas || null,
            usuario_id
        };
        
        const { data, error } = await supabase
            .from('ingresos')
            .insert([ingresoData])
            .select('*')
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

// Eliminar ingreso
app.delete('/api/ingresos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('ingresos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
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

// ================================
// 💸 RUTAS GASTOS
// ================================

// Obtener todos los gastos
app.get('/api/gastos', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('gastos')
            .select('*')
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

// Crear nuevo gasto
app.post('/api/gastos', async (req, res) => {
    try {
        const { descripcion, monto, categoria, fecha, metodo_pago, es_recurrente, frecuencia_dias, notas } = req.body;
        
        // Validaciones básicas
        if (!descripcion || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Descripción y monto son requeridos'
            });
        }
        
        if (monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }
        
        // Por ahora usamos un usuario fijo (luego implementaremos autenticación)
        const usuario_id = '00000000-0000-0000-0000-000000000000';
        
        const gastoData = {
            descripcion,
            monto: parseFloat(monto),
            categoria: categoria || 'otros',
            fecha: fecha || new Date().toISOString().split('T')[0],
            metodo_pago: metodo_pago || 'efectivo',
            es_recurrente: es_recurrente || false,
            frecuencia_dias: frecuencia_dias || null,
            notas: notas || null,
            usuario_id
        };
        
        const { data, error } = await supabase
            .from('gastos')
            .insert([gastoData])
            .select('*')
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

// Eliminar gasto
app.delete('/api/gastos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('gastos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Gasto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando gasto',
            error: error.message
        });
    }
});

// ================================
// 📊 RUTA DASHBOARD (RESUMEN)
// ================================

app.get('/api/dashboard', async (req, res) => {
    try {
        // Obtener ingresos del mes actual
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const { data: ingresos, error: ingresosError } = await supabase
            .from('ingresos')
            .select('monto')
            .gte('fecha', `${currentMonth}-01`)
            .lt('fecha', `${currentMonth}-32`);
        
        if (ingresosError) throw ingresosError;
        
        const { data: gastos, error: gastosError } = await supabase
            .from('gastos')
            .select('monto')
            .gte('fecha', `${currentMonth}-01`)
            .lt('fecha', `${currentMonth}-32`);
        
        if (gastosError) throw gastosError;
        
        // Calcular totales
        const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const balance = totalIngresos - totalGastos;
        const porcentajeAhorro = totalIngresos > 0 ? ((balance / totalIngresos) * 100) : 0;
        
        res.json({
            success: true,
            data: {
                periodo: currentMonth,
                ingresos_totales: totalIngresos,
                gastos_totales: totalGastos,
                balance_total: balance,
                ahorro_proyectado: balance > 0 ? balance : 0,
                porcentaje_ahorro: porcentajeAhorro,
                resumen: {
                    status: balance >= 0 ? 'positivo' : 'negativo',
                    mensaje: balance >= 0 ? 
                        `¡Excelente! Tienes un ahorro de $${balance.toFixed(2)} este mes` :
                        `Atención: Tienes un déficit de $${Math.abs(balance).toFixed(2)} este mes`
                }
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
// 🏛️ RUTA SUNAT (CÁLCULOS TRIBUTARIOS)
// ================================

app.get('/api/sunat', async (req, res) => {
    try {
        // Obtener ingresos del año actual
        const currentYear = new Date().getFullYear();
        
        const { data: ingresos, error: ingresosError } = await supabase
            .from('ingresos')
            .select('monto, categoria')
            .gte('fecha', `${currentYear}-01-01`)
            .lt('fecha', `${currentYear + 1}-01-01`);
        
        if (ingresosError) throw ingresosError;
        
        const { data: gastos, error: gastosError } = await supabase
            .from('gastos')
            .select('monto, categoria')
            .gte('fecha', `${currentYear}-01-01`)
            .lt('fecha', `${currentYear + 1}-01-01`);
        
        if (gastosError) throw gastosError;
        
        // Calcular totales anuales
        const ingresosAnuales = ingresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const gastosAnuales = gastos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        
        // Cálculos tributarios básicos (Perú 2024)
        const UIT_2024 = 5150; // Unidad Impositiva Tributaria 2024
        
        // IGV (solo si eres independiente con ingresos > 8 UIT)
        const igvAplicable = ingresosAnuales > (8 * UIT_2024);
        const igvMensual = igvAplicable ? (ingresosAnuales * 0.18) / 12 : 0;
        
        // Impuesto a la Renta
        let impuestoRenta = 0;
        let tramoTributario = 'Exonerado';
        
        if (ingresosAnuales <= 5 * UIT_2024) {
            impuestoRenta = 0;
            tramoTributario = 'Exonerado (hasta 5 UIT)';
        } else if (ingresosAnuales <= 20 * UIT_2024) {
            const exceso = ingresosAnuales - (5 * UIT_2024);
            impuestoRenta = exceso * 0.08;
            tramoTributario = 'Primer tramo (8%)';
        } else if (ingresosAnuales <= 35 * UIT_2024) {
            const base8 = 15 * UIT_2024 * 0.08;
            const exceso = ingresosAnuales - (20 * UIT_2024);
            impuestoRenta = base8 + (exceso * 0.14);
            tramoTributario = 'Segundo tramo (14%)';
        } else if (ingresosAnuales <= 45 * UIT_2024) {
            const base8 = 15 * UIT_2024 * 0.08;
            const base14 = 15 * UIT_2024 * 0.14;
            const exceso = ingresosAnuales - (35 * UIT_2024);
            impuestoRenta = base8 + base14 + (exceso * 0.17);
            tramoTributario = 'Tercer tramo (17%)';
        } else {
            const base8 = 15 * UIT_2024 * 0.08;
            const base14 = 15 * UIT_2024 * 0.14;
            const base17 = 10 * UIT_2024 * 0.17;
            const exceso = ingresosAnuales - (45 * UIT_2024);
            impuestoRenta = base8 + base14 + base17 + (exceso * 0.30);
            tramoTributario = 'Cuarto tramo (30%)';
        }
        
        res.json({
            success: true,
            data: {
                periodo: currentYear,
                resumen_fiscal: {
                    ingresos_anuales: ingresosAnuales,
                    gastos_anuales: gastosAnuales,
                    base_imponible: Math.max(0, ingresosAnuales - gastosAnuales)
                },
                igv: {
                    aplica: igvAplicable,
                    mensaje: igvAplicable ? 
                        'Debes pagar IGV (ingresos > 8 UIT)' : 
                        'No obligado a pagar IGV (ingresos ≤ 8 UIT)',
                    igv_mensual_estimado: igvMensual,
                    igv_anual_estimado: igvMensual * 12
                },
                impuesto_renta: {
                    impuesto_anual: impuestoRenta,
                    impuesto_mensual: impuestoRenta / 12,
                    tramo_tributario: tramoTributario,
                    uit_2024: UIT_2024
                },
                recomendaciones: [
                    'Este cálculo es referencial y simplificado',
                    'Consulta con un contador para casos específicos',
                    'Considera gastos deducibles adicionales',
                    'Mantén todos tus comprobantes de pago'
                ]
            }
        });
    } catch (error) {
        console.error('Error calculando SUNAT:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculando información tributaria',
            error: error.message
        });
    }
});

// ================================
// �🚫 MANEJO DE RUTAS NO ENCONTRADAS
// ================================

app.use('*', (req, res) => {
    const availableEndpoints = [
        'GET /',
        'GET /health',
        'GET /api/usuarios',
        'GET /api/ingresos',
        'POST /api/ingresos',
        'DELETE /api/ingresos/:id',
        'GET /api/gastos',
        'POST /api/gastos',
        'DELETE /api/gastos/:id',
        'GET /api/dashboard',
        'GET /api/sunat'
    ];
    
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        availableEndpoints,
        timestamp: new Date().toISOString()
    });
});

// Exportar para Vercel Functions
module.exports = app;
