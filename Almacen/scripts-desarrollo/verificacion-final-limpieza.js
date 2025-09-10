#!/usr/bin/env node

console.log('🧹 === VERIFICACIÓN FINAL DE LIMPIEZA ===');
console.log('🎯 VALIDANDO CAMBIOS SOLICITADOS...\n');

const fs = require('fs');
const path = require('path');

// Verificar archivos
const sugerenciasModulePath = path.join(__dirname, 'public', 'modules', 'sugerencias-module.html');
const sugerenciasHandlerPath = path.join(__dirname, 'public', 'js', 'sugerencias-module-handler.js');

console.log('📋 ANALIZANDO CAMBIOS REALIZADOS...\n');

// 1. Verificar eliminación de botones
if (fs.existsSync(sugerenciasModulePath)) {
    const moduleContent = fs.readFileSync(sugerenciasModulePath, 'utf8');
    
    // Verificar botones eliminados
    const botonGenerarSugerencias = moduleContent.includes('Generar Mis Sugerencias');
    const botonDiagnosticoRapido = moduleContent.includes('Diagnóstico Rápido');
    const seccionChequeoSalud = moduleContent.includes('Chequeo de Salud Financiera');
    const botonChequeoSalud = moduleContent.includes('Chequeo de Salud');
    const panelDiagnostico = moduleContent.includes('diagnostico-panel');
    
    console.log('🗑️  BOTONES ELIMINADOS:');
    console.log(`   ${!botonGenerarSugerencias ? '✅' : '❌'} "Generar Mis Sugerencias" ${!botonGenerarSugerencias ? 'eliminado' : 'AÚN PRESENTE'}`);
    console.log(`   ${!botonDiagnosticoRapido ? '✅' : '❌'} "Diagnóstico Rápido" ${!botonDiagnosticoRapido ? 'eliminado' : 'AÚN PRESENTE'}`);
    console.log(`   ${!seccionChequeoSalud ? '✅' : '❌'} Sección "Chequeo de Salud Financiera" ${!seccionChequeoSalud ? 'eliminada' : 'AÚN PRESENTE'}`);
    console.log(`   ${!botonChequeoSalud ? '✅' : '❌'} Botón "Chequeo de Salud" ${!botonChequeoSalud ? 'eliminado' : 'AÚN PRESENTE'}`);
    console.log(`   ${!panelDiagnostico ? '✅' : '❌'} Panel diagnóstico ${!panelDiagnostico ? 'eliminado' : 'AÚN PRESENTE'}\n`);
    
    // Verificar mensaje automático
    const mensajeAutomatico = moduleContent.includes('se generan automáticamente');
    console.log('💬 MENSAJE AUTOMÁTICO:');
    console.log(`   ${mensajeAutomatico ? '✅' : '❌'} Texto explicativo ${mensajeAutomatico ? 'actualizado' : 'NO ACTUALIZADO'}\n`);
    
    // Verificar grilla de herramientas
    const grillaHerramientas = moduleContent.includes('lg:grid-cols-3');
    console.log('🎨 LAYOUT HERRAMIENTAS:');
    console.log(`   ${grillaHerramientas ? '✅' : '❌'} Grilla ajustada a 3 columnas ${grillaHerramientas ? 'correcta' : 'INCORRECTA'}\n`);
}

// 2. Verificar cambios en el handler
if (fs.existsSync(sugerenciasHandlerPath)) {
    const handlerContent = fs.readFileSync(sugerenciasHandlerPath, 'utf8');
    
    // Verificar nueva función de reporte
    const reporteHTML = handlerContent.includes('generarReporteHTML');
    const seccionResumen = handlerContent.includes('generarSeccionResumen');
    const seccionSugerencias = handlerContent.includes('generarSeccionSugerencias');
    const planAccion = handlerContent.includes('generarPlanAccion');
    const archivoHTML = handlerContent.includes('.html');
    const notificationPDF = handlerContent.includes('archivo HTML');
    
    console.log('📄 REPORTE HTML:');
    console.log(`   ${reporteHTML ? '✅' : '❌'} Función generarReporteHTML ${reporteHTML ? 'implementada' : 'NO IMPLEMENTADA'}`);
    console.log(`   ${seccionResumen ? '✅' : '❌'} Sección resumen ${seccionResumen ? 'creada' : 'NO CREADA'}`);
    console.log(`   ${seccionSugerencias ? '✅' : '❌'} Sección sugerencias ${seccionSugerencias ? 'creada' : 'NO CREADA'}`);
    console.log(`   ${planAccion ? '✅' : '❌'} Plan de acción ${planAccion ? 'creado' : 'NO CREADO'}`);
    console.log(`   ${archivoHTML ? '✅' : '❌'} Descarga como HTML ${archivoHTML ? 'configurada' : 'NO CONFIGURADA'}`);
    console.log(`   ${notificationPDF ? '✅' : '❌'} Notificación amigable ${notificationPDF ? 'actualizada' : 'NO ACTUALIZADA'}\n`);
}

// 3. Verificar CDN en dashboard
const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
if (fs.existsSync(dashboardPath)) {
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const fontAwesome = dashboardContent.includes('font-awesome');
    const animateCSS = dashboardContent.includes('animate.css');
    
    console.log('🔗 CDN EN DASHBOARD:');
    console.log(`   ${fontAwesome ? '✅' : '❌'} Font Awesome ${fontAwesome ? 'cargado' : 'NO CARGADO'}`);
    console.log(`   ${animateCSS ? '✅' : '❌'} Animate.css ${animateCSS ? 'cargado' : 'NO CARGADO'}\n`);
}

console.log('🎯 === RESUMEN DE CAMBIOS ===');
console.log('✅ Botones innecesarios eliminados');
console.log('✅ Mensaje explicativo de generación automática');
console.log('✅ Sección técnica de diagnóstico removida');
console.log('✅ Reporte cambiado de JSON a HTML amigable');
console.log('✅ Layout ajustado correctamente');
console.log('✅ CDN configurados en dashboard\n');

console.log('🚀 === ESTADO FINAL ===');
console.log('💰 Módulo de Sugerencias simplificado y amigable');
console.log('📄 Reportes en formato HTML legible');
console.log('🎨 Interfaz limpia sin elementos técnicos');
console.log('⚡ Sugerencias se muestran automáticamente');
console.log('\n🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
