// Script simple para verificar módulo de ingresos
const fs = require('fs');
const path = require('path');

console.log('🔍 === ANÁLISIS DEL MÓDULO DE INGRESOS ===');
console.log('📅 Timestamp:', new Date().toLocaleString());
console.log('');

// 1. Verificar archivos necesarios
console.log('📁 PASO 1: Verificando archivos del sistema...');

const archivosNecesarios = [
    'public/js/ingresos-module-handler.js',
    'public/modules/ingresos-template.html', 
    'public/js/supabase-config.js',
    'public/js/supabase-auth.js',
    'public/dashboard.html'
];

const archivosExistentes = [];
const archivosFaltantes = [];

archivosNecesarios.forEach(archivo => {
    const rutaCompleta = path.join(__dirname, archivo);
    if (fs.existsSync(rutaCompleta)) {
        archivosExistentes.push(archivo);
        console.log(`✅ ${archivo}`);
    } else {
        archivosFaltantes.push(archivo);
        console.log(`❌ ${archivo} - NO ENCONTRADO`);
    }
});

console.log('');
console.log(`📊 Archivos existentes: ${archivosExistentes.length}/${archivosNecesarios.length}`);

if (archivosFaltantes.length > 0) {
    console.log('⚠️ Archivos faltantes:', archivosFaltantes);
}

// 2. Analizar handler principal
console.log('');
console.log('🧠 PASO 2: Analizando handler de ingresos...');

try {
    const handlerPath = path.join(__dirname, 'public/js/ingresos-module-handler.js');
    const handlerContent = fs.readFileSync(handlerPath, 'utf8');
    
    // Verificar métodos críticos
    const metodosCriticos = [
        'handleSubmit',
        'submitIngreso', 
        'loadIngresos',
        'renderIngresos',
        'init'
    ];
    
    const metodosEncontrados = [];
    const metodosFaltantes = [];
    
    metodosCriticos.forEach(metodo => {
        if (handlerContent.includes(metodo)) {
            metodosEncontrados.push(metodo);
            console.log(`✅ Método ${metodo}: PRESENTE`);
        } else {
            metodosFaltantes.push(metodo);
            console.log(`❌ Método ${metodo}: AUSENTE`);
        }
    });
    
    // Verificar funciones de debug
    const funcionesDebug = ['debugTest', 'diagnosticCheck'];
    console.log('');
    console.log('🧪 Funciones de debug:');
    funcionesDebug.forEach(func => {
        if (handlerContent.includes(func)) {
            console.log(`✅ ${func}: PRESENTE`);
        } else {
            console.log(`❌ ${func}: AUSENTE`);
        }
    });
    
} catch (error) {
    console.log(`❌ Error leyendo handler: ${error.message}`);
}

// 3. Analizar template
console.log('');
console.log('📄 PASO 3: Analizando template HTML...');

try {
    const templatePath = path.join(__dirname, 'public/modules/ingresos-template.html');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Verificar elementos críticos
    const elementosCriticos = [
        'id="ingreso-modal"',
        'id="ingreso-form"',
        'id="descripcion"',
        'id="monto"',
        'id="categoria"',
        'id="fecha"',
        'id="ingresos-list"'
    ];
    
    console.log('🎯 Elementos del formulario:');
    elementosCriticos.forEach(elemento => {
        if (templateContent.includes(elemento)) {
            console.log(`✅ ${elemento}: PRESENTE`);
        } else {
            console.log(`❌ ${elemento}: AUSENTE`);
        }
    });
    
    // Verificar referencias a funciones
    const referenciasFunciones = [
        'ingresosModuleHandler',
        'handleSubmit',
        'closeModal'
    ];
    
    console.log('');
    console.log('🔗 Referencias a funciones:');
    referenciasFunciones.forEach(ref => {
        if (templateContent.includes(ref)) {
            console.log(`✅ ${ref}: REFERENCIADO`);
        } else {
            console.log(`❌ ${ref}: NO REFERENCIADO`);
        }
    });
    
} catch (error) {
    console.log(`❌ Error leyendo template: ${error.message}`);
}

// 4. Verificar configuración Supabase
console.log('');
console.log('🌐 PASO 4: Verificando configuración Supabase...');

try {
    const configPath = path.join(__dirname, 'public/js/supabase-config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Verificar credenciales
    if (configContent.includes('lobyofpwqwqsszugdwnw.supabase.co')) {
        console.log('✅ URL Supabase: PRESENTE');
    } else {
        console.log('❌ URL Supabase: AUSENTE');
    }
    
    if (configContent.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
        console.log('✅ API Key: PRESENTE');
    } else {
        console.log('❌ API Key: AUSENTE');
    }
    
} catch (error) {
    console.log(`❌ Error leyendo config: ${error.message}`);
}

// 5. Buscar errores comunes en el código
console.log('');
console.log('🔍 PASO 5: Buscando errores comunes...');

try {
    const handlerPath = path.join(__dirname, 'public/js/ingresos-module-handler.js');
    const handlerContent = fs.readFileSync(handlerPath, 'utf8');
    
    // Errores comunes
    const erroresComunes = [
        { patron: /console\.error/g, nombre: 'Console errors' },
        { patron: /catch\s*\(\s*error\s*\)/g, nombre: 'Error handlers' },
        { patron: /throw\s+new\s+Error/g, nombre: 'Thrown errors' },
        { patron: /undefined/g, nombre: 'Referencias undefined' },
        { patron: /null/g, nombre: 'Referencias null' }
    ];
    
    erroresComunes.forEach(({ patron, nombre }) => {
        const matches = handlerContent.match(patron);
        if (matches) {
            console.log(`⚠️ ${nombre}: ${matches.length} ocurrencias`);
        } else {
            console.log(`✅ ${nombre}: No encontrados`);
        }
    });
    
} catch (error) {
    console.log(`❌ Error analizando errores: ${error.message}`);
}

// 6. Analizar dependencias
console.log('');
console.log('🔗 PASO 6: Analizando dependencias...');

try {
    const dashboardPath = path.join(__dirname, 'public/dashboard.html');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const scripts = [
        'supabase-config.js',
        'supabase-auth.js', 
        'module-loader.js',
        'ingresos-module-handler.js',
        'dashboard-handler.js'
    ];
    
    console.log('📜 Scripts en dashboard.html:');
    scripts.forEach(script => {
        if (dashboardContent.includes(script)) {
            console.log(`✅ ${script}: INCLUIDO`);
        } else {
            console.log(`❌ ${script}: NO INCLUIDO`);
        }
    });
    
} catch (error) {
    console.log(`❌ Error analizando dashboard: ${error.message}`);
}

// 7. Resumen y diagnóstico
console.log('');
console.log('📊 === RESUMEN DEL ANÁLISIS ===');

let problemas = [];
let soluciones = [];

if (archivosFaltantes.length > 0) {
    problemas.push('Archivos faltantes');
    soluciones.push('Verificar que todos los archivos estén en su ubicación correcta');
}

console.log('');
if (problemas.length > 0) {
    console.log('❌ PROBLEMAS DETECTADOS:');
    problemas.forEach((problema, i) => {
        console.log(`   ${i + 1}. ${problema}`);
    });
    
    console.log('');
    console.log('💡 SOLUCIONES SUGERIDAS:');
    soluciones.forEach((solucion, i) => {
        console.log(`   ${i + 1}. ${solucion}`);
    });
} else {
    console.log('✅ No se detectaron problemas críticos en la estructura');
}

console.log('');
console.log('🎯 PRÓXIMOS PASOS RECOMENDADOS:');
console.log('1. Verificar autenticación del usuario');
console.log('2. Probar conexión con Supabase');
console.log('3. Ejecutar función debugTest() en el navegador');
console.log('4. Revisar console del navegador para errores JavaScript');

console.log('');
console.log('✅ Análisis completado');
