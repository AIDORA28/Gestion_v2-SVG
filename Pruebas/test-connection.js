/**
 * ✅ TEST DE CONEXIÓN SUPABASE
 * Archivo simple para verificar conectividad
 */

const https = require('https');

const SUPABASE_HOST = 'lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

console.log('🔍 Testing Supabase connection...');

const options = {
    hostname: SUPABASE_HOST,
    port: 443,
    path: '/rest/v1/usuarios?select=count',
    method: 'GET',
    headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
    }
};

const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('📊 Response:', data || 'Empty response (OK)');
        console.log('🎉 Supabase connection working!');
    });
});

req.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
});

req.end();
