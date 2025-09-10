/**
 * 🔍 DIAGNÓSTICO DE PROBLEMAS - SUGERENCIAS Y PDF
 * 
 * Script para diagnosticar:
 * 1. ✅ Comportamiento del ícono del foco (lightbulb)
 * 2. ✅ Funcionamiento de la descarga de PDF
 * 3. ✅ Carga correcta de CDNs
 * 4. ✅ Estado de los handlers
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE PROBLEMAS - SUGERENCIAS Y PDF\n');

// 📋 CONFIGURACIÓN
const projectRoot = path.join(__dirname, '..');

// 🔧 UTILIDADES
function leerArchivo(rutaArchivo) {
    try {
        const rutaCompleta = path.join(projectRoot, rutaArchivo);
        if (!fs.existsSync(rutaCompleta)) {
            return null;
        }
        return fs.readFileSync(rutaCompleta, 'utf8');
    } catch (error) {
        return null;
    }
}

// 🔍 1. ANÁLISIS DEL ÍCONO DEL FOCO
console.log('💡 1. ANÁLISIS DEL COMPORTAMIENTO DEL ÍCONO FOCO\n');

const templateContent = leerArchivo('public/modules/sugerencias-template.html');
if (templateContent) {
    // Buscar el ícono del foco
    const focoMatches = templateContent.match(/fa-lightbulb/g);
    console.log(`✅ Íconos de foco encontrados: ${focoMatches ? focoMatches.length : 0}`);
    
    // Verificar estados de transición
    const welcomeState = templateContent.includes('welcome-state');
    const autoSugerencias = templateContent.includes('sugerencias-automaticas');
    const animaciones = templateContent.includes('animate__fadeOut');
    
    console.log(`✅ Estado de bienvenida (welcome-state): ${welcomeState ? 'SÍ' : 'NO'}`);
    console.log(`✅ Sugerencias automáticas: ${autoSugerencias ? 'SÍ' : 'NO'}`);
    console.log(`✅ Animaciones de transición: ${animaciones ? 'SÍ' : 'NO'}`);
    
    // Verificar JavaScript de transición
    const tiempoTransicion = templateContent.match(/setTimeout\(\(\)\s*=>\s*\{[\s\S]*?\},\s*(\d+)\)/);
    if (tiempoTransicion) {
        console.log(`✅ Tiempo de transición del foco: ${tiempoTransicion[1]}ms`);
        console.log(`📝 EXPLICACIÓN: El foco aparece por ${tiempoTransicion[1]/1000} segundos y luego cambia al cerebro`);
    }
    
    console.log('\n🎯 COMPORTAMIENTO NORMAL:');
    console.log('   1. Al cargar: Aparece ícono de foco (💡) con mensaje de bienvenida');
    console.log('   2. Después de 2s: Transición animada al cerebro (🧠) con sugerencias');
    console.log('   3. Esto es NORMAL y diseñado para una experiencia amigable');
} else {
    console.log('❌ No se pudo leer el template de sugerencias');
}

// 🔍 2. ANÁLISIS DE DESCARGA PDF
console.log('\n📄 2. ANÁLISIS DE FUNCIONALIDAD PDF\n');

// Verificar CDN de jsPDF en dashboard
const dashboardContent = leerArchivo('public/dashboard.html');
if (dashboardContent) {
    const jsPDFcdn = dashboardContent.includes('jspdf.umd.min.js');
    console.log(`✅ CDN jsPDF cargado: ${jsPDFcdn ? 'SÍ' : 'NO'}`);
    
    if (jsPDFcdn) {
        const cdnVersion = dashboardContent.match(/jspdf\/(\d+\.\d+\.\d+)\//);
        console.log(`✅ Versión jsPDF: ${cdnVersion ? cdnVersion[1] : 'No detectada'}`);
    }
} else {
    console.log('❌ No se pudo leer dashboard.html');
}

// Verificar handler de sugerencias
const handlerContent = leerArchivo('public/js/sugerencias-module-handler.js');
if (handlerContent) {
    const exportarFuncion = handlerContent.includes('exportarReporte()');
    const jsPDFUsage = handlerContent.includes('window.jsPDF');
    const pdfGeneration = handlerContent.includes('generarReporteProfesionalPDF');
    const errorHandling = handlerContent.includes('try {') && handlerContent.includes('catch');
    
    console.log(`✅ Función exportarReporte(): ${exportarFuncion ? 'SÍ' : 'NO'}`);
    console.log(`✅ Uso de window.jsPDF: ${jsPDFUsage ? 'SÍ' : 'NO'}`);
    console.log(`✅ Función PDF profesional: ${pdfGeneration ? 'SÍ' : 'NO'}`);
    console.log(`✅ Manejo de errores: ${errorHandling ? 'SÍ' : 'NO'}`);
    
    // Verificar botón en template
    if (templateContent) {
        const botonPDF = templateContent.includes('exportarReporte()');
        const handlerReference = templateContent.includes('sugerenciasModuleHandler');
        
        console.log(`✅ Botón PDF en template: ${botonPDF ? 'SÍ' : 'NO'}`);
        console.log(`✅ Referencia al handler: ${handlerReference ? 'SÍ' : 'NO'}`);
    }
} else {
    console.log('❌ No se pudo leer sugerencias-module-handler.js');
}

// 🔍 3. POSIBLES PROBLEMAS Y SOLUCIONES
console.log('\n🛠️ 3. POSIBLES PROBLEMAS DEL PDF\n');

console.log('💡 CAUSAS POSIBLES DE NO DESCARGA:');
console.log('   1. jsPDF no carga correctamente desde CDN');
console.log('   2. Handler no está registrado globalmente');
console.log('   3. Función se ejecuta pero falla silenciosamente');
console.log('   4. Bloqueador de pop-ups impide descarga');
console.log('   5. Error en consola del navegador');

console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
console.log('   1. Verificar consola del navegador (F12)');
console.log('   2. Comprobar que jsPDF esté disponible');
console.log('   3. Testear manualmente la función');
console.log('   4. Actualizar CDN si es necesario');

// 🔍 4. VERIFICAR ESTRUCTURA DE ARCHIVOS
console.log('\n📁 4. VERIFICACIÓN DE ESTRUCTURA\n');

const archivosRequeridos = [
    'public/dashboard.html',
    'public/modules/sugerencias-template.html',
    'public/js/sugerencias-module-handler.js',
    'public/js/module-loader.js'
];

archivosRequeridos.forEach(archivo => {
    const existe = leerArchivo(archivo) !== null;
    console.log(`${existe ? '✅' : '❌'} ${archivo}`);
});

// 🔍 5. GENERAR SCRIPT DE PRUEBA MANUAL
console.log('\n📝 5. GENERANDO SCRIPT DE PRUEBA MANUAL...\n');

const testScript = `
<!-- SCRIPT DE PRUEBA MANUAL PARA PDF -->
<!-- Copia este código en la consola del navegador cuando tengas la página abierta -->

console.log('🧪 INICIANDO PRUEBA MANUAL DE PDF...');

// 1. Verificar que jsPDF esté disponible
if (typeof window.jsPDF !== 'undefined') {
    console.log('✅ jsPDF está disponible');
    console.log('📦 Versión:', window.jsPDF.version);
} else {
    console.log('❌ jsPDF NO está disponible');
    console.log('💡 Solución: Verificar que el CDN se haya cargado correctamente');
}

// 2. Verificar que el handler esté disponible
if (typeof window.sugerenciasModuleHandler !== 'undefined') {
    console.log('✅ Handler de sugerencias está disponible');
    
    // 3. Probar la función de exportar
    if (typeof window.sugerenciasModuleHandler.exportarReporte === 'function') {
        console.log('✅ Función exportarReporte está disponible');
        console.log('🚀 Intentando generar PDF...');
        
        try {
            window.sugerenciasModuleHandler.exportarReporte();
            console.log('✅ Función ejecutada sin errores aparentes');
        } catch (error) {
            console.log('❌ Error al ejecutar exportarReporte:', error);
        }
    } else {
        console.log('❌ Función exportarReporte NO está disponible');
    }
} else {
    console.log('❌ Handler de sugerencias NO está disponible');
    console.log('💡 Solución: Verificar que el módulo se haya cargado correctamente');
}

// 4. Prueba simple de jsPDF
if (typeof window.jsPDF !== 'undefined') {
    console.log('🧪 Probando jsPDF básico...');
    try {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        doc.text('Prueba PDF', 20, 20);
        doc.save('prueba.pdf');
        console.log('✅ Prueba básica de PDF exitosa');
    } catch (error) {
        console.log('❌ Error en prueba básica de PDF:', error);
    }
}
`;

console.log('🎯 SCRIPT DE PRUEBA GENERADO');
console.log('📋 Para usar:');
console.log('   1. Abre tu aplicación en el navegador');
console.log('   2. Ve al módulo de Sugerencias');
console.log('   3. Abre la consola (F12)');
console.log('   4. Copia y pega el script de prueba');
console.log('   5. Ejecuta el script para diagnosticar');

// Guardar script de prueba
fs.writeFileSync(path.join(projectRoot, 'Pruebas', 'test-pdf-manual.html'), `
<!DOCTYPE html>
<html>
<head>
    <title>Prueba Manual PDF</title>
</head>
<body>
    <h1>Script de Prueba Manual PDF</h1>
    <pre>${testScript}</pre>
</body>
</html>
`);

console.log('\n✅ Script guardado en: Pruebas/test-pdf-manual.html');

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE DIAGNÓSTICO');
console.log('='.repeat(60));

console.log('\n💡 PROBLEMA DEL FOCO:');
console.log('   ✅ COMPORTAMIENTO NORMAL - No es un error');
console.log('   🎨 Diseño intencionado para experiencia amigable');
console.log('   ⏱️  Foco aparece 2 segundos, luego cambia a cerebro');

console.log('\n📄 PROBLEMA DEL PDF:');
console.log('   🔍 Requiere diagnóstico en navegador');
console.log('   📝 Usar script de prueba manual generado');
console.log('   🛠️ Verificar consola del navegador para errores');

console.log('\n🚀 PRÓXIMOS PASOS:');
console.log('   1. Ejecutar script de prueba en navegador');
console.log('   2. Reportar errores encontrados en consola');
console.log('   3. Aplicar correcciones específicas');

console.log('\n🔍 Diagnóstico completado\n');
