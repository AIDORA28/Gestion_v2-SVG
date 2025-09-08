/**
 * 🧪 ULTRA SIMPLE TEST - Just Environment Variables
 */

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    return res.status(200).json({
        success: true,
        message: '🚀 Vercel Function Working!',
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_SUPABASE_URL: !!process.env.SUPABASE_URL,
            HAS_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            URL_PREFIX: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) : 'not-set'
        },
        test: 'ultra-simple'
    });
};
