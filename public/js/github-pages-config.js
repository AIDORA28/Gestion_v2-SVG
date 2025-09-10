/**
 * 🚀 CONFIGURACIÓN PARA GITHUB PAGES
 * 
 * Este archivo optimiza la aplicación para funcionar en GitHub Pages
 * con Supabase como backend
 */

// 🌐 Configuración para GitHub Pages
const GITHUB_PAGES_CONFIG = {
    // Detectar si estamos en GitHub Pages
    isGitHubPages: window.location.hostname.includes('github.io'),
    
    // CDNs optimizados para GitHub Pages
    cdns: {
        jsPDF: [
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
            'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
        ],
        notyf: [
            'https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/notyf/3.10.1/notyf.min.js'
        ]
    },
    
    // Configuración de Supabase (se mantiene igual)
    supabase: {
        // Tu configuración actual de Supabase funciona perfecto con GitHub Pages
        compatible: true
    }
};

// 🔧 Funciones de utilidad para GitHub Pages
const GitHubPagesUtils = {
    
    // Verificar disponibilidad de librerías
    checkLibrary: function(libraryName, globalVar) {
        return new Promise((resolve, reject) => {
            const maxAttempts = 10;
            let attempts = 0;
            
            const check = () => {
                attempts++;
                if (typeof window[globalVar] !== 'undefined') {
                    console.log(`✅ ${libraryName} cargado correctamente`);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.error(`❌ ${libraryName} no se pudo cargar después de ${maxAttempts} intentos`);
                    reject(new Error(`${libraryName} no disponible`));
                } else {
                    console.log(`⏳ Esperando ${libraryName}... (${attempts}/${maxAttempts})`);
                    setTimeout(check, 500);
                }
            };
            
            check();
        });
    },
    
    // Cargar script dinámicamente
    loadScript: function(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                console.log(`✅ Script cargado: ${url}`);
                resolve();
            };
            
            script.onerror = () => {
                console.warn(`⚠️ Error cargando: ${url}`);
                reject(new Error(`Failed to load ${url}`));
            };
            
            document.head.appendChild(script);
        });
    },
    
    // Verificar conexión a Supabase
    checkSupabaseConnection: async function() {
        try {
            if (typeof window.supabase !== 'undefined' && window.supabase.auth) {
                console.log('✅ Supabase conectado correctamente');
                return true;
            } else {
                console.warn('⚠️ Supabase no está disponible');
                return false;
            }
        } catch (error) {
            console.error('❌ Error verificando Supabase:', error);
            return false;
        }
    },
    
    // Función mejorada para generar PDF en GitHub Pages
    generatePDFForGitHubPages: async function(data = null) {
        try {
            // Verificar que jsPDF esté disponible
            await this.checkLibrary('jsPDF', 'jsPDF');
            
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            // Datos de ejemplo si no se proporcionan datos reales
            const pdfData = data || {
                ingresos: 10731.25,
                gastos: 1801.50,
                balance: 8929.75,
                ahorro: 83.2,
                sugerencias: [
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
                ]
            };
            
            // Generar PDF con diseño profesional
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            let yPos = 20;
            
            // Header
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, pageWidth, 35, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('PLANIFICAPRO', 20, 15);
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('Reporte Financiero Personal', 20, 25);
            
            const fecha = new Date().toLocaleDateString('es-ES');
            doc.setFontSize(10);
            doc.text(fecha, pageWidth - 70, 15);
            doc.text('GitHub Pages + Supabase', pageWidth - 70, 25);
            
            yPos = 50;
            
            // Contenido
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('📊 RESUMEN FINANCIERO', 20, yPos);
            yPos += 15;
            
            // Métricas
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            
            doc.setTextColor(34, 197, 94);
            doc.text('INGRESOS TOTALES:', 20, yPos);
            doc.setFont('helvetica', 'bold');
            doc.text(`S/ ${pdfData.ingresos.toFixed(2)}`, 80, yPos);
            yPos += 8;
            
            doc.setTextColor(239, 68, 68);
            doc.setFont('helvetica', 'normal');
            doc.text('GASTOS TOTALES:', 20, yPos);
            doc.setFont('helvetica', 'bold');
            doc.text(`S/ ${pdfData.gastos.toFixed(2)}`, 80, yPos);
            yPos += 8;
            
            doc.setTextColor(59, 130, 246);
            doc.setFont('helvetica', 'normal');
            doc.text('BALANCE:', 20, yPos);
            doc.setFont('helvetica', 'bold');
            doc.text(`S/ ${pdfData.balance.toFixed(2)}`, 80, yPos);
            yPos += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.text('% AHORRO:', 20, yPos);
            doc.setFont('helvetica', 'bold');
            doc.text(`${pdfData.ahorro.toFixed(1)}%`, 80, yPos);
            yPos += 20;
            
            // Sugerencias
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('💡 SUGERENCIAS PERSONALIZADAS', 20, yPos);
            yPos += 15;
            
            pdfData.sugerencias.forEach((sugerencia, index) => {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(59, 130, 246);
                doc.text(`${index + 1}. ${sugerencia.titulo}`, 20, yPos);
                yPos += 8;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(107, 114, 128);
                const descripcionLines = doc.splitTextToSize(sugerencia.descripcion, pageWidth - 40);
                doc.text(descripcionLines, 25, yPos);
                yPos += descripcionLines.length * 5 + 3;
                
                if (sugerencia.accion) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(245, 158, 11);
                    doc.text('Recomendación:', 25, yPos);
                    yPos += 5;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(0, 0, 0);
                    const accionLines = doc.splitTextToSize(sugerencia.accion, pageWidth - 50);
                    doc.text(accionLines, 30, yPos);
                    yPos += accionLines.length * 5 + 10;
                }
            });
            
            // Footer
            doc.setDrawColor(107, 114, 128);
            doc.setLineWidth(0.3);
            doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
            
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.setFont('helvetica', 'normal');
            doc.text('Generado por PLANIFICAPRO - GitHub Pages + Supabase', 20, pageHeight - 10);
            doc.text('Página 1 de 1', pageWidth - 40, pageHeight - 10);
            
            // Guardar
            const filename = `Reporte-PLANIFICAPRO-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            console.log('✅ PDF generado exitosamente para GitHub Pages');
            return true;
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            throw error;
        }
    }
};

// 🚀 Inicializar para GitHub Pages
if (GITHUB_PAGES_CONFIG.isGitHubPages) {
    console.log('🌐 Detectado GitHub Pages - Optimizando configuración...');
    
    // Verificar librerías esenciales
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            console.log('🔍 Verificando dependencias para GitHub Pages...');
            
            // Verificar jsPDF
            await GitHubPagesUtils.checkLibrary('jsPDF', 'jsPDF');
            
            // Verificar Notyf
            await GitHubPagesUtils.checkLibrary('Notyf', 'Notyf');
            
            // Verificar Supabase
            await GitHubPagesUtils.checkSupabaseConnection();
            
            console.log('✅ Todas las dependencias verificadas para GitHub Pages');
            
            // Hacer disponible globalmente la función de PDF
            window.generatePDFForGitHubPages = GitHubPagesUtils.generatePDFForGitHubPages.bind(GitHubPagesUtils);
            
        } catch (error) {
            console.error('❌ Error inicializando GitHub Pages:', error);
        }
    });
}

// Exportar para uso global
window.GitHubPagesUtils = GitHubPagesUtils;
window.GITHUB_PAGES_CONFIG = GITHUB_PAGES_CONFIG;

console.log('📄 GitHub Pages configuration loaded successfully');
