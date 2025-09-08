/**
 * 🧪 SIMPLE SUPABASE TEST - Direct Vercel Function
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

    try {
        console.log('🔍 Simple Test Starting...');
        
        // Obtener variables de entorno
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        console.log('Environment Variables:');
        console.log('- SUPABASE_URL present:', !!supabaseUrl);
        console.log('- SERVICE_KEY present:', !!supabaseServiceKey);
        
        if (!supabaseUrl || !supabaseServiceKey) {
            return res.status(500).json({
                success: false,
                error: 'Environment variables not configured',
                debug: {
                    url: !!supabaseUrl,
                    key: !!supabaseServiceKey
                }
            });
        }

        // Crear cliente Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        console.log('✅ Supabase client created');
        
        // Test básico
        const { data, error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Query error:', error);
            return res.status(500).json({
                success: false,
                error: 'Database query failed',
                details: error.message
            });
        }

        console.log('✅ Query successful');
        
        return res.status(200).json({
            success: true,
            message: '🎉 SUPABASE CONNECTION SUCCESS!',
            timestamp: new Date().toISOString(),
            test: 'simple-direct-function'
        });
        
    } catch (error) {
        console.error('💥 Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
