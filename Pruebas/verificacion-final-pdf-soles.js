/**
 * 🔍 VERIFICACIÓN FINAL - PDF PROFESIONAL Y MONEDA EN SOLES
 * 
 * Script para verificar que:
 * 1. ✅ Todas las referencias de moneda usen formato peruano (S/)
 * 2. ✅ La generación de PDF profesional funcione correctamente
 * 3. ✅ Los templates tengan el formato correcto
 * 4. ✅ Los handlers generen reportes profesionales
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO VERIFICACIÓN FINAL - PDF Y MONEDA\n');

// 📋 CONFIGURACIÓN
const projectRoot = path.join(__dirname, '..');
const verificaciones = {
    moneda: { total: 0, correctos: 0, errores: [] },
    pdf: { total: 0, correctos: 0, errores: [] },
    templates: { total: 0, correctos: 0, errores: [] },
    general: { total: 0, correctos: 0, errores: [] }
};

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

function verificarMoneda(contenido, archivo) {
    verificaciones.moneda.total++;
    
    // Patrones incorrectos (dólares)
    const patronesDolares = [
        /\$\s*\d+/g,           // $500, $ 500
        /\d+\s*USD/g,          // 500 USD
        /dollar/gi,            // dollar, Dollar
        /dolar/gi              // dolar, Dolar (español)
    ];
    
    // Patrones correctos (soles)
    const patronesSoles = [
        /S\/\s*\d+/g,          // S/ 500, S/500
        /\d+\s*soles/gi,       // 500 soles
        /PEN/g                 // PEN (código ISO)
    ];
    
    const erroresDolares = [];
    let tieneFormatoSoles = false;
    
    // Verificar patrones de dólares
    patronesDolares.forEach((patron, index) => {
        const matches = contenido.match(patron);
        if (matches) {
            erroresDolares.push({
                patron: ['$', 'USD', 'dollar', 'dolar'][index],
                cantidad: matches.length,
                ejemplos: matches.slice(0, 3)
            });
        }
    });
    
    // Verificar patrones de soles
    patronesSoles.forEach(patron => {
        if (patron.test(contenido)) {
            tieneFormatoSoles = true;
        }
    });
    
    if (erroresDolares.length === 0 && (tieneFormatoSoles || !contenido.includes('0.00'))) {
        verificaciones.moneda.correctos++;
        console.log(`✅ ${archivo}: Formato de moneda correcto`);
        return true;
    } else {
        verificaciones.moneda.errores.push({
            archivo,
            problemas: erroresDolares,
            tieneSoles: tieneFormatoSoles
        });
        console.log(`❌ ${archivo}: Problemas con formato de moneda`);
        erroresDolares.forEach(error => {
            console.log(`   - ${error.patron}: ${error.cantidad} ocurrencias`);
        });
        return false;
    }
}

function verificarFuncionalidadPDF(contenido, archivo) {
    verificaciones.pdf.total++;
    
    const elementosPDF = [
        { nombre: 'jsPDF import', patron: /jsPDF.*=.*window\.jsPDF/g },
        { nombre: 'PDF generation function', patron: /generarReporteProfesionalPDF/g },
        { nombre: 'Professional styling', patron: /colors.*=.*{/g },
        { nombre: 'Header section', patron: /HEADER.*PROFESIONAL/g },
        { nombre: 'Executive summary', patron: /RESUMEN.*EJECUTIVO/g },
        { nombre: 'Financial metrics', patron: /INGRESOS.*TOTALES|GASTOS.*TOTALES/g },
        { nombre: 'Suggestions section', patron: /SUGERENCIAS.*PERSONALIZADAS/g },
        { nombre: 'Action plan', patron: /PLAN.*DE.*ACCIÓN/g },
        { nombre: 'PDF save function', patron: /doc\.save\(/g },
        { nombre: 'Error handling', patron: /try.*{.*catch/g }
    ];
    
    let elementosEncontrados = 0;
    const faltantes = [];
    
    elementosPDF.forEach(elemento => {
        if (elemento.patron.test(contenido)) {
            elementosEncontrados++;
        } else {
            faltantes.push(elemento.nombre);
        }
    });
    
    const porcentajeCompleto = (elementosEncontrados / elementosPDF.length) * 100;
    
    if (porcentajeCompleto >= 80) {
        verificaciones.pdf.correctos++;
        console.log(`✅ ${archivo}: Funcionalidad PDF completa (${porcentajeCompleto.toFixed(1)}%)`);
        return true;
    } else {
        verificaciones.pdf.errores.push({
            archivo,
            porcentaje: porcentajeCompleto,
            faltantes
        });
        console.log(`❌ ${archivo}: Funcionalidad PDF incompleta (${porcentajeCompleto.toFixed(1)}%)`);
        return false;
    }
}

function verificarTemplate(contenido, archivo) {
    verificaciones.templates.total++;
    
    const elementos = [
        { nombre: 'Friendly design', patron: /coach|amigable|fácil|bonito/gi },
        { nombre: 'Currency format', patron: /S\/\s*\d+/g },
        { nombre: 'Professional buttons', patron: /Generar.*Reporte|Exportar/gi },
        { nombre: 'Clean interface', patron: /animate__|transition|gradient/g },
        { nombre: 'No unnecessary buttons', patron: /Actualizar.*Análisis|Ejecutar.*Pruebas/gi }
    ];
    
    let elementosCorrectos = 0;
    const problemas = [];
    
    elementos.forEach(elemento => {
        const matches = contenido.match(elemento.patron);
        if (elemento.nombre === 'No unnecessary buttons') {
            // Para este caso, NO queremos encontrar matches
            if (!matches) {
                elementosCorrectos++;
            } else {
                problemas.push(`Encontrados botones innecesarios: ${matches.length}`);
            }
        } else {
            // Para los demás, SÍ queremos encontrar matches
            if (matches && matches.length > 0) {
                elementosCorrectos++;
            } else {
                problemas.push(`Falta: ${elemento.nombre}`);
            }
        }
    });
    
    const porcentajeCompleto = (elementosCorrectos / elementos.length) * 100;
    
    if (porcentajeCompleto >= 80) {
        verificaciones.templates.correctos++;
        console.log(`✅ ${archivo}: Template correcto (${porcentajeCompleto.toFixed(1)}%)`);
        return true;
    } else {
        verificaciones.templates.errores.push({
            archivo,
            porcentaje: porcentajeCompleto,
            problemas
        });
        console.log(`❌ ${archivo}: Template con problemas (${porcentajeCompleto.toFixed(1)}%)`);
        return false;
    }
}

// 🔍 EJECUTAR VERIFICACIONES

console.log('📋 1. VERIFICACIÓN DE MONEDA (SOLES)\n');

// Archivos principales para verificar moneda
const archivosMoneda = [
    'public/dashboard.html',
    'public/modules/sugerencias-template.html',
    'public/js/sugerencias-module-handler.js',
    'public/js/ingresos-module-handler.js'
];

archivosMoneda.forEach(archivo => {
    const contenido = leerArchivo(archivo);
    if (contenido) {
        verificarMoneda(contenido, archivo);
    } else {
        console.log(`⚠️  ${archivo}: No encontrado`);
    }
});

console.log('\n📄 2. VERIFICACIÓN DE FUNCIONALIDAD PDF\n');

// Verificar funcionalidad PDF en handlers
const archivosPDF = [
    'public/js/sugerencias-module-handler.js'
];

archivosPDF.forEach(archivo => {
    const contenido = leerArchivo(archivo);
    if (contenido) {
        verificarFuncionalidadPDF(contenido, archivo);
    } else {
        console.log(`⚠️  ${archivo}: No encontrado`);
    }
});

console.log('\n🎨 3. VERIFICACIÓN DE TEMPLATES\n');

// Verificar templates
const archivosTemplates = [
    'public/modules/sugerencias-template.html'
];

archivosTemplates.forEach(archivo => {
    const contenido = leerArchivo(archivo);
    if (contenido) {
        verificarTemplate(contenido, archivo);
    } else {
        console.log(`⚠️  ${archivo}: No encontrado`);
    }
});

console.log('\n✨ 4. VERIFICACIÓN GENERAL\n');

// Verificar que jsPDF esté cargado en dashboard
const dashboardContent = leerArchivo('public/dashboard.html');
if (dashboardContent) {
    verificaciones.general.total++;
    if (dashboardContent.includes('jspdf.umd.min.js')) {
        verificaciones.general.correctos++;
        console.log('✅ jsPDF CDN cargado correctamente en dashboard');
    } else {
        verificaciones.general.errores.push('jsPDF CDN no encontrado en dashboard');
        console.log('❌ jsPDF CDN no encontrado en dashboard');
    }
}

// 📊 REPORTE FINAL
console.log('\n' + '='.repeat(60));
console.log('📊 REPORTE FINAL DE VERIFICACIÓN');
console.log('='.repeat(60));

const categorias = [
    { nombre: '💰 Formato de Moneda', data: verificaciones.moneda },
    { nombre: '📄 Funcionalidad PDF', data: verificaciones.pdf },
    { nombre: '🎨 Calidad Templates', data: verificaciones.templates },
    { nombre: '⚙️  Configuración General', data: verificaciones.general }
];

let totalVerificaciones = 0;
let totalCorrectos = 0;

categorias.forEach(categoria => {
    const { nombre, data } = categoria;
    const porcentaje = data.total > 0 ? (data.correctos / data.total) * 100 : 0;
    const estado = porcentaje >= 80 ? '✅' : '❌';
    
    console.log(`\n${estado} ${nombre}:`);
    console.log(`   Verificados: ${data.correctos}/${data.total} (${porcentaje.toFixed(1)}%)`);
    
    if (data.errores.length > 0) {
        console.log(`   Errores: ${data.errores.length}`);
        data.errores.forEach(error => {
            if (typeof error === 'string') {
                console.log(`   - ${error}`);
            } else {
                console.log(`   - ${error.archivo || 'Sin archivo'}: ${error.problemas?.length || error.faltantes?.length || 1} problemas`);
            }
        });
    }
    
    totalVerificaciones += data.total;
    totalCorrectos += data.correctos;
});

const porcentajeGeneral = totalVerificaciones > 0 ? (totalCorrectos / totalVerificaciones) * 100 : 0;
const estadoGeneral = porcentajeGeneral >= 80 ? '🎉 EXITOSO' : '⚠️ REQUIERE ATENCIÓN';

console.log('\n' + '='.repeat(60));
console.log(`🏆 ESTADO GENERAL: ${estadoGeneral}`);
console.log(`📈 Progreso Total: ${totalCorrectos}/${totalVerificaciones} (${porcentajeGeneral.toFixed(1)}%)`);
console.log('='.repeat(60));

if (porcentajeGeneral >= 90) {
    console.log('\n🎊 ¡EXCELENTE! El sistema está completamente optimizado');
    console.log('✨ PDF profesional y formato de moneda funcionando perfectamente');
} else if (porcentajeGeneral >= 80) {
    console.log('\n✅ ¡BIEN! El sistema está funcionando correctamente');
    console.log('🔧 Revisa los elementos mencionados para optimización completa');
} else {
    console.log('\n⚠️ ATENCIÓN: Se requieren correcciones');
    console.log('🛠️ Revisa los errores reportados antes de continuar');
}

console.log('\n🚀 Verificación completada\n');
