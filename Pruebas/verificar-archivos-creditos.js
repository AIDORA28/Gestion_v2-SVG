/**
 * 🔍 VERIFICADOR DE ARCHIVOS DEL MÓDULO CRÉDITOS
 * 
 * Este script verifica que todos los archivos necesarios para el módulo
 * de créditos estén presentes y correctamente configurados.
 * 
 * Ejecutar: node verificar-archivos-creditos.js
 */

const fs = require('fs');
const path = require('path');

// Rutas base
const BASE_PATH = path.join(__dirname, '..');
const PUBLIC_PATH = path.join(BASE_PATH, 'public');

// Archivos requeridos para el módulo créditos
const REQUIRED_FILES = {
    'Template HTML': 'public/modules/creditos-template.html',
    'Handler JavaScript': 'public/js/creditos-handler.js', 
    'Dashboard HTML': 'public/dashboard.html',
    'Dashboard Handler': 'public/js/dashboard-handler.js',
    'Module Loader': 'public/js/module-loader.js',
    'Supabase Config': 'public/js/supabase-config.js'
};

// Verificaciones específicas de contenido
const CONTENT_CHECKS = {
    'creditos-handler.js': [
        'class CreditosModuleHandler',
        'loadCreditos',
        'createCredito',
        'setupSupabase',
        'simulaciones_credito'
    ],
    'dashboard-handler.js': [
        'creditos',
        'CreditosModuleHandler',
        'initializeModule'
    ],
    'creditos-template.html': [
        'creditos-container',
        'form',
        'table',
        'modal'
    ],
    'dashboard.html': [
        'section-creditos',
        'creditos-handler.js',
        'data-section="creditos"'
    ]
};

function verificarArchivo(relativePath) {
    const fullPath = path.join(BASE_PATH, relativePath);
    const exists = fs.existsSync(fullPath);
    
    const result = {
        path: relativePath,
        exists,
        size: 0,
        readable: false,
        content: null
    };

    if (exists) {
        try {
            const stats = fs.statSync(fullPath);
            result.size = stats.size;
            result.readable = true;
            
            // Leer contenido para archivos pequeños
            if (stats.size < 1024 * 1024) { // Menos de 1MB
                result.content = fs.readFileSync(fullPath, 'utf8');
            }
        } catch (error) {
            result.readable = false;
            result.error = error.message;
        }
    }

    return result;
}

function verificarContenido(fileName, content, checksRequired) {
    const results = [];
    
    for (const check of checksRequired) {
        const found = content.includes(check);
        results.push({
            check,
            found,
            status: found ? '✅' : '❌'
        });
    }
    
    return results;
}

function analizarIntegracion() {
    console.log('🔗 ANALIZANDO INTEGRACIÓN ENTRE ARCHIVOS...\n');
    
    // Verificar que dashboard.html incluya creditos-handler.js
    const dashboardFile = verificarArchivo('public/dashboard.html');
    if (dashboardFile.exists && dashboardFile.content) {
        const includesHandler = dashboardFile.content.includes('creditos-handler.js');
        console.log(`📄 Dashboard incluye creditos-handler.js: ${includesHandler ? '✅' : '❌'}`);
        
        const hasSection = dashboardFile.content.includes('section-creditos');
        console.log(`📄 Dashboard tiene section-creditos: ${hasSection ? '✅' : '❌'}`);
    }
    
    // Verificar que dashboard-handler.js inicialice el módulo
    const dashboardHandlerFile = verificarArchivo('public/js/dashboard-handler.js');
    if (dashboardHandlerFile.exists && dashboardHandlerFile.content) {
        const initializesCreditos = dashboardHandlerFile.content.includes('CreditosModuleHandler');
        console.log(`🎮 Dashboard handler inicializa créditos: ${initializesCreditos ? '✅' : '❌'}`);
        
        const hasCase = dashboardHandlerFile.content.includes("case 'creditos':");
        console.log(`🎮 Dashboard handler tiene case creditos: ${hasCase ? '✅' : '❌'}`);
    }
    
    console.log('');
}

function verificarEstructuraDOM() {
    console.log('🏗️ VERIFICANDO ESTRUCTURA DOM REQUERIDA...\n');
    
    const dashboardFile = verificarArchivo('public/dashboard.html');
    if (dashboardFile.exists && dashboardFile.content) {
        const elementsToCheck = [
            'section-creditos',
            'creditos-module-container',
            'data-section="creditos"',
            'btn-creditos'
        ];
        
        for (const element of elementsToCheck) {
            const found = dashboardFile.content.includes(element);
            console.log(`🏷️ ${element}: ${found ? '✅' : '❌'}`);
        }
    }
    
    console.log('');
}

async function verificarConectividadSupabase() {
    console.log('🔌 VERIFICANDO CONECTIVIDAD CON SUPABASE...\n');
    
    try {
        const fetch = (await import('node-fetch')).default;
        const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        
        // Verificar endpoint de salud
        const healthResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
            }
        });
        
        console.log(`🌐 Supabase REST API: ${healthResponse.ok ? '✅ Accesible' : '❌ No accesible'}`);
        console.log(`📊 Status: ${healthResponse.status}`);
        
        // Verificar tabla simulaciones_credito
        const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito?limit=1`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
            }
        });
        
        console.log(`🗄️ Tabla simulaciones_credito: ${tableResponse.ok ? '✅ Accesible' : '❌ No accesible'}`);
        console.log(`📊 Status: ${tableResponse.status}`);
        
        if (!tableResponse.ok) {
            const errorData = await tableResponse.text();
            console.log(`❌ Error: ${errorData}`);
        }
        
    } catch (error) {
        console.log('❌ Error de conectividad:', error.message);
    }
    
    console.log('');
}

async function main() {
    console.log('🔍 VERIFICADOR COMPLETO DEL MÓDULO CRÉDITOS');
    console.log('===========================================\n');

    // 1. Verificar archivos requeridos
    console.log('1️⃣ VERIFICANDO ARCHIVOS REQUERIDOS...\n');
    
    for (const [name, relativePath] of Object.entries(REQUIRED_FILES)) {
        const result = verificarArchivo(relativePath);
        const status = result.exists ? '✅' : '❌';
        const size = result.exists ? `(${result.size} bytes)` : '';
        
        console.log(`${status} ${name}: ${relativePath} ${size}`);
        
        if (!result.exists) {
            console.log(`   ⚠️ Archivo faltante: ${relativePath}`);
        } else if (!result.readable) {
            console.log(`   ⚠️ Archivo no legible: ${result.error}`);
        }
    }
    
    console.log('');

    // 2. Verificar contenido específico
    console.log('2️⃣ VERIFICANDO CONTENIDO DE ARCHIVOS...\n');
    
    for (const [fileName, checks] of Object.entries(CONTENT_CHECKS)) {
        const filePath = Object.values(REQUIRED_FILES).find(path => path.includes(fileName));
        if (filePath) {
            const result = verificarArchivo(filePath);
            
            if (result.exists && result.content) {
                console.log(`📄 ${fileName}:`);
                const contentResults = verificarContenido(fileName, result.content, checks);
                
                for (const contentResult of contentResults) {
                    console.log(`   ${contentResult.status} ${contentResult.check}`);
                }
                console.log('');
            }
        }
    }

    // 3. Analizar integración
    analizarIntegracion();

    // 4. Verificar estructura DOM
    verificarEstructuraDOM();

    // 5. Verificar conectividad
    await verificarConectividadSupabase();

    // 6. Generar reporte de problemas
    console.log('🚨 POSIBLES PROBLEMAS DETECTADOS:');
    console.log('=================================\n');
    
    const problemas = [];
    
    // Verificar archivos faltantes
    for (const [name, relativePath] of Object.entries(REQUIRED_FILES)) {
        const result = verificarArchivo(relativePath);
        if (!result.exists) {
            problemas.push(`❌ Archivo faltante: ${name} (${relativePath})`);
        }
    }
    
    if (problemas.length === 0) {
        console.log('✅ No se detectaron problemas obvios en los archivos');
        console.log('💡 Si el módulo sigue sin funcionar, ejecuta:');
        console.log('   node simular-usuario-creditos.js');
    } else {
        problemas.forEach(problema => console.log(problema));
    }
    
    console.log('\n🏁 VERIFICACIÓN COMPLETADA');
}

// Ejecutar verificación
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { verificarArchivo, verificarContenido };
