/**
 * 🧪 TEST ENDPOINT - Solo para verificar Supabase
 */

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log('🧪 TEST: Iniciando test de Supabase...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔍 Environment check:');
    console.log('- SUPABASE_URL exists:', !!supabaseUrl);
    console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({
            success: false,
            error: 'Environment variables missing',
            debug: {
                SUPABASE_URL: !!supabaseUrl,
                SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey
            }
        });
    }

    try {
        // Crear cliente Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        console.log('✅ Supabase client created');
        
        // Test simple query
        const { data, error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.log('❌ Supabase query error:', error);
            return res.status(500).json({
                success: false,
                error: 'Supabase query failed',
                details: error.message,
                supabaseError: error
            });
        }

        console.log('✅ Supabase query successful');
        
        return res.json({
            success: true,
            message: '🎉 Supabase connection working!',
            timestamp: new Date().toISOString(),
            environment: {
                SUPABASE_URL: supabaseUrl.substring(0, 30) + '...',
                NODE_ENV: process.env.NODE_ENV || 'not-set'
            },
            queryResult: 'success'
        });
        
    } catch (error) {
        console.log('💥 Unexpected error:', error);
        return res.status(500).json({
            success: false,
            error: 'Unexpected error',
            message: error.message,
            stack: error.stack
        });
    }
};
