// API endpoint independiente para test de Supabase en Vercel
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('🧪 Test de Supabase en Vercel...');
        
        // Verificar variables de entorno
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        console.log('Variables:', {
            url: supabaseUrl ? 'OK' : 'MISSING',
            key: supabaseKey ? 'OK' : 'MISSING',
            nodeEnv: process.env.NODE_ENV,
            vercel: process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV
        });

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                success: false,
                error: 'Variables de Supabase no configuradas',
                debug: {
                    supabaseUrl: supabaseUrl ? 'Configurada' : 'Faltante',
                    supabaseKey: supabaseKey ? 'Configurada' : 'Faltante',
                    environment: process.env.NODE_ENV || 'undefined',
                    vercel: process.env.VERCEL || 'undefined'
                }
            });
        }

        // Crear cliente de Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Test de conexión
        const { data, error, count } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error de Supabase:', error);
            return res.status(500).json({
                success: false,
                error: 'Error conectando a Supabase',
                details: error.message
            });
        }

        // Éxito
        res.json({
            success: true,
            status: 'healthy',
            database: 'Supabase connected ✅',
            message: 'Conexión exitosa a Supabase',
            tables: {
                usuarios: count !== null ? `${count} registros` : 'accessible'
            },
            timestamp: new Date().toISOString(),
            environment: {
                nodeEnv: process.env.NODE_ENV,
                vercel: process.env.VERCEL,
                vercelEnv: process.env.VERCEL_ENV
            }
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};
