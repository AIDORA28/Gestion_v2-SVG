/**
 * 🔍 DIAGNÓSTICO RÁPIDO - NOTIFICACIÓN PDF
 * 
 * Script para revisar el estado actual de notificaciones PDF
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO RÁPIDO - NOTIFICACIÓN PDF\n');

const projectRoot = path.join(__dirname, '..');

function leerArchivo(rutaArchivo) {
    try {
        const rutaCompleta = path.join(projectRoot, rutaArchivo);
        return fs.readFileSync(rutaCompleta, 'utf8');
    } catch (error) {
        return null;
    }
}

// 1. Verificar notificaciones en el handler
console.log('📱 1. NOTIFICACIONES EN EL HANDLER:\n');

const handlerContent = leerArchivo('public/js/sugerencias-module-handler.js');
if (handlerContent) {
    const notificaciones = [
        { patron: /notyf\.info\('([^']+)'/g, tipo: 'INFO (Azul)' },
        { patron: /notyf\.success\('([^']+)'/g, tipo: 'SUCCESS (Verde)' },
        { patron: /notyf\.warning\('([^']+)'/g, tipo: 'WARNING (Naranja)' },
        { patron: /notyf\.error\('([^']+)'/g, tipo: 'ERROR (Rojo)' }
    ];
    
    notificaciones.forEach(({ patron, tipo }) => {
        let match;
        while ((match = patron.exec(handlerContent)) !== null) {
            if (match[1].toLowerCase().includes('pdf') || match[1].toLowerCase().includes('reporte')) {
                console.log(`${tipo}: "${match[1]}"`);
            }
        }
    });
}

// 2. Estados posibles
console.log('\n🎯 2. ESTADOS POSIBLES DE LA NOTIFICACIÓN:\n');

console.log('Si ves: "📄 Generando reporte PDF profesional..."');
console.log('   🔄 Estado: Procesando');
console.log('   ⏱️  Duración: Temporal (2-3 segundos)');
console.log('   🎨 Color: Azul (info)');
console.log('   ❓ Problema: Si no desaparece, hay error en la generación');

console.log('\nSi ves: "📄 Reporte PDF profesional generado exitosamente"');
console.log('   ✅ Estado: Completado');
console.log('   ⏱️  Duración: 4-5 segundos');
console.log('   🎨 Color: Verde (success)');
console.log('   📁 Resultado: PDF debería haberse descargado');

console.log('\nSi ves: "Error: [mensaje]"');
console.log('   ❌ Estado: Error');
console.log('   ⏱️  Duración: Hasta cerrar manualmente');
console.log('   🎨 Color: Rojo (error)');
console.log('   🛠️  Acción: Revisar consola del navegador');

console.log('\nSi ves: "Generando reporte HTML de respaldo..."');
console.log('   ⚠️  Estado: Fallback');
console.log('   ⏱️  Duración: Temporal');
console.log('   🎨 Color: Naranja (warning)');
console.log('   📝 Resultado: Se descarga HTML en lugar de PDF');

// 3. Verificar configuración de Notyf
console.log('\n⚙️ 3. CONFIGURACIÓN DE NOTIFICACIONES:\n');

const dashboardContent = leerArchivo('public/dashboard.html');
if (dashboardContent) {
    const tieneNotyf = dashboardContent.includes('notyf.min.js');
    console.log(`✅ Notyf cargado: ${tieneNotyf ? 'SÍ' : 'NO'}`);
    
    if (tieneNotyf) {
        // Buscar configuración de notyf
        const configMatch = dashboardContent.match(/new\s+Notyf\s*\(\s*\{([^}]+)\}/);
        if (configMatch) {
            console.log('⚙️ Configuración encontrada:', configMatch[1].trim());
        } else {
            console.log('⚙️ Usando configuración por defecto');
        }
    }
}

// 4. Soluciones recomendadas
console.log('\n🛠️ 4. SOLUCIONES SEGÚN EL TIPO DE NOTIFICACIÓN:\n');

console.log('📄 Si la notificación dice "Generando..." y NO desaparece:');
console.log('   1. Abre la consola del navegador (F12)');
console.log('   2. Busca errores en la consola');
console.log('   3. Verifica que jsPDF esté cargado');
console.log('   4. Recarga la página e intenta de nuevo');

console.log('\n✅ Si dice "generado exitosamente" pero NO se descarga:');
console.log('   1. Verifica que no tengas bloqueador de pop-ups');
console.log('   2. Revisa la carpeta de Descargas');
console.log('   3. Intenta con otro navegador');
console.log('   4. Verifica permisos de descarga');

console.log('\n❌ Si aparece un error:');
console.log('   1. Copia el mensaje de error exacto');
console.log('   2. Abre la consola y busca detalles');
console.log('   3. Usa el archivo test-pdf-standalone.html para probar');
console.log('   4. Reporta el error específico');

// 5. Crear script de prueba rápida
console.log('\n🧪 5. CREANDO SCRIPT DE PRUEBA RÁPIDA...\n');

const quickTest = `
<!DOCTYPE html>
<html>
<head>
    <title>Prueba Rápida Notificaciones PDF</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css">
    <script src="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin: 5px; cursor: pointer; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <h1>🧪 Prueba Rápida de Notificaciones PDF</h1>
    
    <button class="btn" onclick="mostrarInfo()">📄 Mostrar "Generando PDF..."</button>
    <button class="btn" onclick="mostrarSuccess()">✅ Mostrar "PDF generado exitosamente"</button>
    <button class="btn" onclick="mostrarError()">❌ Mostrar "Error PDF"</button>
    <button class="btn" onclick="probarPDF()">🚀 Probar PDF Real</button>
    
    <script>
        const notyf = new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        
        function mostrarInfo() {
            notyf.info('📄 Generando reporte PDF profesional...');
        }
        
        function mostrarSuccess() {
            notyf.success('📄 Reporte PDF profesional generado exitosamente');
        }
        
        function mostrarError() {
            notyf.error('❌ Error: jsPDF no está cargado');
        }
        
        function probarPDF() {
            try {
                notyf.info('📄 Generando reporte PDF profesional...');
                
                setTimeout(() => {
                    if (typeof window.jsPDF === 'undefined') {
                        notyf.error('❌ Error: jsPDF no está cargado');
                        return;
                    }
                    
                    const { jsPDF } = window.jsPDF;
                    const doc = new jsPDF();
                    doc.text('Prueba rápida PDF', 20, 20);
                    doc.save('prueba-rapida.pdf');
                    
                    notyf.success('📄 Reporte PDF profesional generado exitosamente');
                }, 1000);
                
            } catch (error) {
                notyf.error(\`❌ Error: \${error.message}\`);
            }
        }
    </script>
</body>
</html>
`;

const quickTestPath = path.join(projectRoot, 'Pruebas', 'test-notificaciones-pdf.html');
fs.writeFileSync(quickTestPath, quickTest);

console.log('✅ Archivo de prueba creado: Pruebas/test-notificaciones-pdf.html');

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN');
console.log('='.repeat(60));

console.log('\n❓ PREGUNTA ESPECÍFICA:');
console.log('¿Qué mensaje EXACTO aparece en tu notificación?');
console.log('📝 Opciones:');
console.log('   A) "📄 Generando reporte PDF profesional..."');
console.log('   B) "📄 Reporte PDF profesional generado exitosamente"');
console.log('   C) Un mensaje de error');
console.log('   D) Otro mensaje');

console.log('\n🎯 ACCIÓN RECOMENDADA:');
console.log('1. Abre Pruebas/test-notificaciones-pdf.html');
console.log('2. Prueba los diferentes tipos de notificación');
console.log('3. Compara con lo que ves en tu aplicación');
console.log('4. Reporta el mensaje exacto que aparece');

console.log('\n🔍 Diagnóstico completado\n');
