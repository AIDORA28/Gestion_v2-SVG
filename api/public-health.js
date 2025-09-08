/**
 * 🌐 PUBLIC API ENDPOINT - NO OIDC REQUIRED
 * Endpoint público que funciona sin autenticación OIDC
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

module.exports = async (req, res) => {
    // Configurar headers CORS y públicos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Manejar OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Health check de la base de datos
        const { data, error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                status: 'unhealthy',
                message: 'Database connection failed',
                error: error.message,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            status: 'healthy',
            message: '🚀 PLANIFICAPRO API funcionando correctamente',
            database: 'connected',
            supabase: 'operational',
            tables_accessible: true,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '2.0.1'
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({
            success: false,
            status: 'error',
            message: 'Unexpected server error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
