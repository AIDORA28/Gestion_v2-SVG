/**
 * 🧪 PRUEBA ESPECÍFICA DE PDF - SUGERENCIAS
 * 
 * Script para probar directamente la generación de PDF
 * sin depender del módulo completo
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 INICIANDO PRUEBA ESPECÍFICA DE PDF\n');

// Crear archivo HTML de prueba independiente
const testHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba PDF - Sugerencias</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn { 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
            margin: 10px 5px;
        }
        .btn:hover { 
            background: #2563eb; 
        }
        .btn-success { 
            background: #10b981; 
        }
        .btn-success:hover { 
            background: #059669; 
        }
        .status { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: 8px; 
            font-weight: bold;
        }
        .status.info { 
            background: #dbeafe; 
            color: #1e40af; 
        }
        .status.success { 
            background: #d1fae5; 
            color: #047857; 
        }
        .status.error { 
            background: #fee2e2; 
            color: #dc2626; 
        }
        .log { 
            background: #1f2937; 
            color: #f3f4f6; 
            padding: 15px; 
            border-radius: 8px; 
            font-family: 'Courier New', monospace; 
            font-size: 14px;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Prueba de Generación PDF</h1>
        <p>Esta página permite probar la generación de PDF independientemente del módulo de sugerencias.</p>
        
        <div id="status" class="status info">
            ℹ️ Verificando disponibilidad de jsPDF...
        </div>
        
        <div>
            <button class="btn" onclick="verificarJsPDF()">🔍 Verificar jsPDF</button>
            <button class="btn btn-success" onclick="generarPDFPrueba()">📄 Generar PDF de Prueba</button>
            <button class="btn" onclick="limpiarLog()">🧹 Limpiar Log</button>
        </div>
        
        <h3>📋 Log de Pruebas:</h3>
        <div id="log" class="log">Esperando acciones...</div>
    </div>

    <!-- jsPDF desde múltiples CDNs -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script>
        // Variables globales
        let logElement = null;
        let statusElement = null;
        
        // Inicializar cuando la página carga
        document.addEventListener('DOMContentLoaded', function() {
            logElement = document.getElementById('log');
            statusElement = document.getElementById('status');
            
            log('🚀 Página cargada, verificando jsPDF...');
            verificarJsPDF();
        });
        
        function log(mensaje) {
            const timestamp = new Date().toLocaleTimeString();
            const mensajeCompleto = \`[\${timestamp}] \${mensaje}\\n\`;
            
            if (logElement) {
                logElement.textContent += mensajeCompleto;
                logElement.scrollTop = logElement.scrollHeight;
            }
            console.log(mensaje);
        }
        
        function setStatus(mensaje, tipo = 'info') {
            if (statusElement) {
                statusElement.className = \`status \${tipo}\`;
                statusElement.textContent = mensaje;
            }
        }
        
        function limpiarLog() {
            if (logElement) {
                logElement.textContent = 'Log limpiado...\\n';
            }
        }
        
        function verificarJsPDF() {
            log('🔍 Verificando disponibilidad de jsPDF...');
            
            if (typeof window.jsPDF === 'undefined') {
                log('❌ jsPDF NO está disponible');
                setStatus('❌ jsPDF no está cargado', 'error');
                
                // Intentar cargar desde respaldo
                log('🔄 Intentando cargar jsPDF desde respaldo...');
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
                script.onload = function() {
                    log('✅ jsPDF cargado desde respaldo JSDelivr');
                    setStatus('✅ jsPDF cargado desde respaldo', 'success');
                };
                script.onerror = function() {
                    log('❌ Error cargando jsPDF desde respaldo');
                    setStatus('❌ Error cargando jsPDF desde todos los CDNs', 'error');
                };
                document.head.appendChild(script);
            } else {
                log('✅ jsPDF está disponible');
                log(\`📦 Versión: \${window.jsPDF.version || 'No detectada'}\`);
                setStatus('✅ jsPDF está disponible y listo', 'success');
            }
        }
        
        function generarPDFPrueba() {
            log('🚀 Iniciando generación de PDF de prueba...');
            
            try {
                // Verificar jsPDF
                if (typeof window.jsPDF === 'undefined') {
                    throw new Error('jsPDF no está disponible');
                }
                
                log('✅ jsPDF confirmado, creando documento...');
                const { jsPDF } = window.jsPDF;
                const doc = new jsPDF();
                
                // Configuración
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const leftMargin = 20;
                const rightMargin = pageWidth - 20;
                let yPosition = 20;
                
                // Colores
                const colors = {
                    primary: [59, 130, 246],
                    success: [34, 197, 94],
                    warning: [245, 158, 11],
                    danger: [239, 68, 68],
                    gray: [107, 114, 128],
                    dark: [17, 24, 39]
                };
                
                log('🎨 Configurando diseño del PDF...');
                
                // Header
                doc.setFillColor(...colors.primary);
                doc.rect(0, 0, pageWidth, 35, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text('PLANIFICAPRO - PRUEBA', leftMargin, 15);
                
                doc.setFontSize(14);
                doc.setFont('helvetica', 'normal');
                doc.text('Reporte de Prueba PDF', leftMargin, 25);
                
                // Fecha
                const fecha = new Date().toLocaleDateString('es-ES');
                doc.setFontSize(10);
                doc.text(fecha, rightMargin - 50, 15);
                doc.text('Generado automáticamente', rightMargin - 50, 25);
                
                yPosition = 50;
                
                // Contenido de prueba
                doc.setTextColor(...colors.dark);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('📊 DATOS DE PRUEBA', leftMargin, yPosition);
                yPosition += 15;
                
                // Métricas de ejemplo
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                
                doc.setTextColor(...colors.success);
                doc.text('INGRESOS TOTALES:', leftMargin, yPosition);
                doc.setFont('helvetica', 'bold');
                doc.text('S/ 10,731.25', leftMargin + 60, yPosition);
                yPosition += 8;
                
                doc.setTextColor(...colors.danger);
                doc.setFont('helvetica', 'normal');
                doc.text('GASTOS TOTALES:', leftMargin, yPosition);
                doc.setFont('helvetica', 'bold');
                doc.text('S/ 1,801.50', leftMargin + 60, yPosition);
                yPosition += 8;
                
                doc.setTextColor(...colors.primary);
                doc.setFont('helvetica', 'normal');
                doc.text('BALANCE:', leftMargin, yPosition);
                doc.setFont('helvetica', 'bold');
                doc.text('S/ 8,929.75', leftMargin + 60, yPosition);
                yPosition += 8;
                
                doc.setTextColor(...colors.primary);
                doc.setFont('helvetica', 'normal');
                doc.text('% AHORRO:', leftMargin, yPosition);
                doc.setFont('helvetica', 'bold');
                doc.text('83.2%', leftMargin + 60, yPosition);
                yPosition += 20;
                
                // Sugerencias de prueba
                doc.setTextColor(...colors.dark);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('💡 SUGERENCIAS DE PRUEBA', leftMargin, yPosition);
                yPosition += 15;
                
                const sugerencias = [
                    {
                        titulo: 'Excelente manejo financiero',
                        descripcion: 'Estás ahorrando 83.2% de tus ingresos. ¡Sigue así!',
                        accion: 'Considera invertir tus ahorros para hacerlos crecer.'
                    },
                    {
                        titulo: 'Optimización de gastos',
                        descripcion: 'Alimentación representa el mayor porcentaje de gastos.',
                        accion: 'Revisa si estos gastos están alineados con tus objetivos.'
                    }
                ];
                
                sugerencias.forEach((sugerencia, index) => {
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...colors.primary);
                    doc.text(\`\${index + 1}. \${sugerencia.titulo}\`, leftMargin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...colors.gray);
                    const descripcionLines = doc.splitTextToSize(sugerencia.descripcion, rightMargin - leftMargin - 10);
                    doc.text(descripcionLines, leftMargin + 5, yPosition);
                    yPosition += descripcionLines.length * 5 + 5;
                    
                    if (sugerencia.accion) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(...colors.warning);
                        doc.text('Recomendación:', leftMargin + 5, yPosition);
                        yPosition += 6;
                        
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(...colors.dark);
                        const accionLines = doc.splitTextToSize(sugerencia.accion, rightMargin - leftMargin - 15);
                        doc.text(accionLines, leftMargin + 10, yPosition);
                        yPosition += accionLines.length * 5 + 10;
                    }
                });
                
                // Footer
                doc.setDrawColor(...colors.gray);
                doc.setLineWidth(0.3);
                doc.line(leftMargin, pageHeight - 20, rightMargin, pageHeight - 20);
                
                doc.setFontSize(8);
                doc.setTextColor(...colors.gray);
                doc.setFont('helvetica', 'normal');
                doc.text('Generado por PLANIFICAPRO - Prueba de PDF', leftMargin, pageHeight - 10);
                doc.text('Página 1 de 1', rightMargin - 30, pageHeight - 10);
                
                log('✅ Documento PDF creado exitosamente');
                log('💾 Iniciando descarga...');
                
                // Guardar PDF
                const filename = \`Prueba-PDF-\${new Date().toISOString().split('T')[0]}.pdf\`;
                doc.save(filename);
                
                log(\`✅ PDF descargado como: \${filename}\`);
                setStatus(\`✅ PDF generado exitosamente: \${filename}\`, 'success');
                
            } catch (error) {
                log(\`❌ Error generando PDF: \${error.message}\`);
                log(\`📍 Stack trace: \${error.stack}\`);
                setStatus(\`❌ Error: \${error.message}\`, 'error');
            }
        }
        
        // Verificar jsPDF cuando se carga el script
        if (typeof window.jsPDF === 'undefined') {
            // Script de respaldo
            log('⚠️ jsPDF no detectado, cargando respaldo...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
            script.onload = () => {
                log('✅ jsPDF cargado desde respaldo');
                if (statusElement) setStatus('✅ jsPDF cargado desde respaldo', 'success');
            };
            script.onerror = () => {
                log('❌ Error cargando jsPDF desde respaldo');
                if (statusElement) setStatus('❌ No se pudo cargar jsPDF', 'error');
            };
            document.head.appendChild(script);
        }
    </script>
</body>
</html>
`;

// Guardar archivo de prueba
const testFilePath = path.join(__dirname, '..', 'Pruebas', 'test-pdf-standalone.html');
fs.writeFileSync(testFilePath, testHTML);

console.log('✅ Archivo de prueba creado: Pruebas/test-pdf-standalone.html');
console.log('\n📋 INSTRUCCIONES DE USO:');
console.log('1. Abre el archivo Pruebas/test-pdf-standalone.html en tu navegador');
console.log('2. Haz clic en "Verificar jsPDF" para confirmar que está cargado');
console.log('3. Haz clic en "Generar PDF de Prueba" para probar la descarga');
console.log('4. Revisa el log para ver detalles de cualquier error');
console.log('\n🎯 Este archivo es independiente y no requiere el servidor');
console.log('💡 Si funciona aquí, el problema está en el módulo principal');
console.log('\n🔍 Prueba completada - Usa el archivo HTML generado');
