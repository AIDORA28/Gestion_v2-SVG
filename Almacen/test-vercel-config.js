/**
 * 🧪 VALIDADOR VERCEL - Simula el entorno de Vercel localmente
 * Uso: node test-vercel-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 ========================================');
console.log('🔍 VALIDADOR DE CONFIGURACIÓN VERCEL');
console.log('🧪 ========================================');

// 1. Validar archivos necesarios
const requiredFiles = [
    'vercel.json',
    'package.json',
    'api/backend.js',
    'public/landing.html',
    'public/dashboard.html',
    'public/login.html'
];

console.log('\n📋 1. VALIDANDO ARCHIVOS REQUERIDOS:');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n❌ ERROR: Faltan archivos requeridos');
    process.exit(1);
}

// 2. Validar vercel.json
console.log('\n🔧 2. VALIDANDO VERCEL.JSON:');
try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    // Validar estructura
    const hasBuilds = vercelConfig.builds && Array.isArray(vercelConfig.builds);
    const hasRoutes = vercelConfig.routes && Array.isArray(vercelConfig.routes);
    
    console.log(`${hasBuilds ? '✅' : '❌'} Configuración builds`);
    console.log(`${hasRoutes ? '✅' : '❌'} Configuración routes`);
    
    if (hasRoutes) {
        const apiRoute = vercelConfig.routes.find(r => r.src.includes('/api/'));
        const homeRoute = vercelConfig.routes.find(r => r.src === '/');
        
        console.log(`${apiRoute ? '✅' : '❌'} Ruta API configurada`);
        console.log(`${homeRoute ? '✅' : '❌'} Ruta home configurada`);
    }
    
} catch (error) {
    console.log('❌ ERROR: vercel.json inválido:', error.message);
    process.exit(1);
}

// 3. Validar package.json
console.log('\n📦 3. VALIDANDO PACKAGE.JSON:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const hasName = packageJson.name;
    const hasScripts = packageJson.scripts;
    const hasMinimalDeps = Object.keys(packageJson.dependencies || {}).length <= 5;
    
    console.log(`${hasName ? '✅' : '❌'} Nombre del proyecto`);
    console.log(`${hasScripts ? '✅' : '❌'} Scripts definidos`);
    console.log(`${hasMinimalDeps ? '✅' : '❌'} Dependencias mínimas (${Object.keys(packageJson.dependencies || {}).length})`);
    
} catch (error) {
    console.log('❌ ERROR: package.json inválido:', error.message);
    process.exit(1);
}

// 4. Probar API backend localmente
console.log('\n🔌 4. PROBANDO API BACKEND:');
try {
    // Simular request a la función
    process.env.SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
    
    const backendFunction = require('../api/backend.js');
    
    // Simular req y res
    const mockReq = {
        url: '/api/health',
        method: 'GET',
        headers: {}
    };
    
    let responseStatus = null;
    let responseData = null;
    
    const mockRes = {
        status: (code) => {
            responseStatus = code;
            return mockRes;
        },
        json: (data) => {
            responseData = data;
            return mockRes;
        },
        setHeader: () => mockRes,
        end: () => mockRes
    };
    
    // Ejecutar función
    backendFunction(mockReq, mockRes).then(() => {
        console.log(`${responseStatus === 200 ? '✅' : '❌'} API Health Check (${responseStatus})`);
        if (responseData) {
            console.log(`${responseData.success ? '✅' : '❌'} Respuesta válida`);
        }
        
        // 5. Validar variables de entorno
        console.log('\n🌍 5. VALIDANDO VARIABLES DE ENTORNO:');
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        console.log(`${supabaseUrl ? '✅' : '❌'} SUPABASE_URL`);
        console.log(`${supabaseKey ? '✅' : '❌'} SUPABASE_ANON_KEY`);
        console.log(`${supabaseUrl && supabaseUrl.startsWith('https://') ? '✅' : '❌'} URL válida`);
        console.log(`${supabaseKey && supabaseKey.startsWith('eyJ') ? '✅' : '❌'} Key válida`);
        
        // Resultado final
        console.log('\n🎯 ========================================');
        if (responseStatus === 200 && responseData && responseData.success) {
            console.log('✅ CONFIGURACIÓN VÁLIDA PARA VERCEL');
            console.log('🚀 Puedes hacer deploy con confianza');
        } else {
            console.log('❌ CONFIGURACIÓN TIENE PROBLEMAS');
            console.log('🔧 Revisa los errores antes de hacer deploy');
        }
        console.log('🎯 ========================================');
        
    }).catch(error => {
        console.log('❌ ERROR: No se pudo probar la API:', error.message);
        console.log('🔧 Revisa api/backend.js');
    });
    
} catch (error) {
    console.log('❌ ERROR: No se pudo cargar api/backend.js:', error.message);
}
