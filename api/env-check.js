/**
 * 🧪 ENV CHECK - Verificar variables de entorno en Vercel
 */

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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
    
    return res.status(200).json(envInfo);
};
