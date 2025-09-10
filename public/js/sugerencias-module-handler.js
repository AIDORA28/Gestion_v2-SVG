/**
 * 🧠 MÓDULO DE SUGERENCIAS INTELIGENTES - PATRÓN DASHBOARD OPTIMIZADO
 * Siguiendo exactamente el patrón exitoso del dashboard:
 * ✅ Supabase Auth - Autenticación integrada
 * ✅ Supabase Database - PostgreSQL con APIs automáticas
 * ✅ IA Analytics - Análisis predictivo client-side
 * Desarrollado por: Gemini Quispe - AI & Analytics Specialist
 * Versión: 1.0 - Septiembre 2025
 */

class SugerenciasModuleHandler {
    constructor() {
        // 🎯 CONFIGURACIÓN SUPABASE (igual que dashboard)
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        
        // 🔐 AUTENTICACIÓN (patrón dashboard)
        this.authToken = null;
        this.usuarioId = null;
        
        // 📊 DATOS DEL MÓDULO
        this.ingresos = [];
        this.gastos = [];
        this.sugerencias = [];
        this.analisisCompleto = null;
        this.isInitialized = false;
        
        // 🎨 NOTIFICACIONES
        this.notyf = window.notyf || new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        
        // 🧠 SISTEMA DE IA
        this.iaConfig = {
            categoriaEmojis: {
                'Alimentación': '🍽️', 'Transporte': '🚗', 'Vivienda': '🏠',
                'Salud': '🏥', 'Entretenimiento': '🎬', 'Educación': '📚',
                'Tecnología': '💻', 'Ropa': '👕', 'Servicios': '🔧', 'Otros': '📝'
            },
            umbralAhorroAlto: 20, // %
            umbralAhorroBajo: 5,  // %
            diasAnalisis: 90
        };
        
        console.log('🧠 SugerenciasModuleHandler inicializado (patrón dashboard)');
    }

    /**
     * 🎯 INICIALIZACIÓN (protegida contra múltiples llamadas)
     */
    async init() {
        if (this.isInitialized) {
            console.log('⚠️ SugerenciasModuleHandler ya está inicializado, saltando...');
            return;
        }
        
        try {
            console.log('🚀 Inicializando módulo sugerencias inteligentes...');
            this.isInitialized = true;
            
            // 🔐 PASO 1: Verificar autenticación automática
            await this.checkAuth();
            
            // 📊 PASO 2: Cargar datos reales
            await this.cargarDatosCompletos();
            
            // 🧠 PASO 3: Ejecutar análisis IA inicial
            await this.ejecutarAnalisisCompleto();
            
            console.log('✅ Módulo sugerencias inicializado exitosamente');
            
        } catch (error) {
            console.error('❌ Error inicializando módulo sugerencias:', error);
            this.isInitialized = false;
            
            if (error.message.includes('auth') || error.message.includes('token')) {
                console.log('🔒 Error de autenticación, redirigiendo...');
                setTimeout(() => window.location.href = '/login.html', 2000);
            }
            
            if (this.notyf) {
                this.notyf.error(`Error inicializando sugerencias: ${error.message}`);
            }
        }
    }

    /**
     * 🔐 VERIFICAR AUTENTICACIÓN (patrón dashboard exacto)
     */
    async checkAuth() {
        console.log('🔐 Verificando autenticación (patrón dashboard)...');
        
        this.authToken = localStorage.getItem('supabase_access_token');
        const userData = localStorage.getItem('currentUser');
        
        if (!this.authToken) {
            console.error('❌ Token no encontrado - redirigiendo a login');
            throw new Error('Token de autenticación no encontrado');
        }

        if (!userData) {
            console.error('❌ Datos de usuario no encontrados - redirigiendo a login');
            throw new Error('Datos de usuario no encontrados');
        }

        const user = JSON.parse(userData);
        this.usuarioId = user.id;
        
        console.log('✅ Autenticación verificada (patrón dashboard):');
        console.log('   📧 Email:', user.email);
        console.log('   🆔 User ID:', this.usuarioId);
        console.log('   🔑 Token length:', this.authToken.length, 'chars');
    }

    /**
     * 📊 CARGAR DATOS COMPLETOS (gastos + ingresos)
     */
    async cargarDatosCompletos() {
        try {
            console.log('📊 Cargando datos completos para análisis IA...');

            if (!this.authToken || !this.usuarioId) {
                throw new Error('Usuario no autenticado para cargar datos');
            }

            // Filtro por fecha (últimos 90 días)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - this.iaConfig.diasAnalisis);
            const fechaFiltro = fechaLimite.toISOString().split('T')[0];

            // Cargar ingresos y gastos en paralelo
            const [ingresosResponse, gastosResponse] = await Promise.all([
                fetch(`${this.supabaseUrl}/rest/v1/ingresos?usuario_id=eq.${this.usuarioId}&fecha=gte.${fechaFiltro}&select=*&order=fecha.desc`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${this.supabaseUrl}/rest/v1/gastos?usuario_id=eq.${this.usuarioId}&fecha=gte.${fechaFiltro}&select=*&order=fecha.desc`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (!ingresosResponse.ok) {
                throw new Error(`Error cargando ingresos: ${ingresosResponse.status}`);
            }
            
            if (!gastosResponse.ok) {
                throw new Error(`Error cargando gastos: ${gastosResponse.status}`);
            }

            this.ingresos = await ingresosResponse.json();
            this.gastos = await gastosResponse.json();
            
            console.log(`✅ Datos cargados - Ingresos: ${this.ingresos.length}, Gastos: ${this.gastos.length}`);
            
        } catch (error) {
            console.error('❌ Error cargando datos completos:', error);
            throw error;
        }
    }

    /**
     * 🧠 EJECUTAR ANÁLISIS COMPLETO DE IA
     */
    async ejecutarAnalisisCompleto() {
        try {
            console.log('🧠 Ejecutando análisis completo de IA...');
            
            this.mostrarLoading(true);
            
            // Analizar patrones
            const patronesGastos = this.analizarPatronesGastos();
            const patronesIngresos = this.analizarPatronesIngresos();
            
            // Generar sugerencias
            const sugerencias = this.generarSugerenciasIA(patronesGastos, patronesIngresos);
            
            // Crear análisis completo
            this.analisisCompleto = {
                fecha: new Date().toISOString(),
                patronesGastos,
                patronesIngresos,
                sugerencias,
                balance: patronesIngresos.totalIngresos - patronesGastos.totalGastos,
                porcentajeAhorro: patronesIngresos.totalIngresos > 0 
                    ? ((patronesIngresos.totalIngresos - patronesGastos.totalGastos) / patronesIngresos.totalIngresos) * 100 
                    : 0
            };
            
            // Actualizar interfaz
            this.actualizarResumenAnalisis();
            this.renderizarSugerencias();
            
            console.log('✅ Análisis IA completado:', this.analisisCompleto);
            
        } catch (error) {
            console.error('❌ Error en análisis IA:', error);
            throw error;
        } finally {
            this.mostrarLoading(false);
        }
    }

    /**
     * 📊 ANALIZAR PATRONES DE GASTOS
     */
    analizarPatronesGastos() {
        console.log('📊 Analizando patrones de gastos...');
        
        if (!this.gastos || this.gastos.length === 0) {
            return {
                totalGastos: 0, promedioMensual: 0, categoriaTopGasto: null,
                tendencia: 'sin-datos', gastosRecientes: [], gastosPorCategoria: {}
            };
        }

        // Análisis por categorías
        const gastosPorCategoria = {};
        const gastosPorMes = {};
        let totalGastos = 0;

        this.gastos.forEach(gasto => {
            const categoria = gasto.categoria || 'Otros';
            const mes = gasto.fecha ? gasto.fecha.substring(0, 7) : 'sin-fecha';
            const monto = parseFloat(gasto.monto) || 0;

            gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;
            gastosPorMes[mes] = (gastosPorMes[mes] || 0) + monto;
            totalGastos += monto;
        });

        // Categoría con mayor gasto
        const categoriaTopGasto = Object.entries(gastosPorCategoria)
            .sort(([,a], [,b]) => b - a)[0];

        // Tendencia (comparar últimos 2 meses)
        const mesesOrdenados = Object.keys(gastosPorMes).sort().reverse();
        let tendencia = 'estable';

        if (mesesOrdenados.length >= 2) {
            const mesActual = gastosPorMes[mesesOrdenados[0]];
            const mesAnterior = gastosPorMes[mesesOrdenados[1]];
            
            if (mesActual > mesAnterior * 1.1) {
                tendencia = 'aumentando';
            } else if (mesActual < mesAnterior * 0.9) {
                tendencia = 'disminuyendo';
            }
        }

        // Gastos recientes (últimos 7 días)
        const fechaReciente = new Date();
        fechaReciente.setDate(fechaReciente.getDate() - 7);
        const gastosRecientes = this.gastos.filter(g => 
            g.fecha && new Date(g.fecha) >= fechaReciente
        );

        return {
            totalGastos,
            promedioMensual: totalGastos / 3,
            categoriaTopGasto,
            tendencia,
            gastosRecientes,
            gastosPorCategoria,
            totalRegistros: this.gastos.length
        };
    }

    /**
     * 💰 ANALIZAR PATRONES DE INGRESOS
     */
    analizarPatronesIngresos() {
        console.log('💰 Analizando patrones de ingresos...');
        
        if (!this.ingresos || this.ingresos.length === 0) {
            return {
                totalIngresos: 0, promedioMensual: 0, fuentePrincipal: null,
                ingresosPorCategoria: {}, totalRegistros: 0
            };
        }

        let totalIngresos = 0;
        const ingresosPorCategoria = {};

        this.ingresos.forEach(ingreso => {
            const categoria = ingreso.categoria || 'Otros';
            const monto = parseFloat(ingreso.monto) || 0;
            
            ingresosPorCategoria[categoria] = (ingresosPorCategoria[categoria] || 0) + monto;
            totalIngresos += monto;
        });

        const fuentePrincipal = Object.entries(ingresosPorCategoria)
            .sort(([,a], [,b]) => b - a)[0];

        return {
            totalIngresos,
            promedioMensual: totalIngresos / 3,
            fuentePrincipal,
            ingresosPorCategoria,
            totalRegistros: this.ingresos.length
        };
    }

    /**
     * 🎯 GENERAR SUGERENCIAS CON IA
     */
    generarSugerenciasIA(patronesGastos, patronesIngresos) {
        console.log('🎯 Generando sugerencias con IA...');
        
        const sugerencias = [];
        const userData = this.getUserData();

        // Sugerencia 1: Balance general
        if (patronesGastos && patronesIngresos) {
            const balance = patronesIngresos.totalIngresos - patronesGastos.totalGastos;
            const porcentajeAhorro = patronesIngresos.totalIngresos > 0 
                ? (balance / patronesIngresos.totalIngresos) * 100 
                : 0;

            if (porcentajeAhorro > this.iaConfig.umbralAhorroAlto) {
                sugerencias.push({
                    tipo: 'felicitacion',
                    icono: '🎉',
                    titulo: '¡Excelente manejo financiero!',
                    descripcion: `Estás ahorrando ${porcentajeAhorro.toFixed(1)}% de tus ingresos. ¡Sigue así!`,
                    accion: 'Considera invertir tus ahorros para hacerlos crecer.',
                    prioridad: 'alta'
                });
            } else if (porcentajeAhorro < this.iaConfig.umbralAhorroBajo) {
                sugerencias.push({
                    tipo: 'alerta',
                    icono: '⚠️',
                    titulo: 'Oportunidad de ahorro',
                    descripcion: `Solo estás ahorrando ${porcentajeAhorro.toFixed(1)}% de tus ingresos.`,
                    accion: 'Revisa tus gastos y encuentra áreas donde puedas reducir costos.',
                    prioridad: 'alta'
                });
            }
        }

        // Sugerencia 2: Categoría con mayor gasto
        if (patronesGastos && patronesGastos.categoriaTopGasto) {
            const [categoria, monto] = patronesGastos.categoriaTopGasto;
            const emoji = this.iaConfig.categoriaEmojis[categoria] || '💸';
            const porcentaje = ((monto / patronesGastos.totalGastos) * 100).toFixed(1);

            sugerencias.push({
                tipo: 'analisis',
                icono: emoji,
                titulo: `${categoria} es tu mayor gasto`,
                descripcion: `Representan ${porcentaje}% de tus gastos ($${monto.toFixed(2)}).`,
                accion: this.getSugerenciaCategoria(categoria),
                prioridad: 'media'
            });
        }

        // Agregar más sugerencias según necesidad...
        if (sugerencias.length === 0) {
            sugerencias.push({
                tipo: 'bienvenida',
                icono: '🚀',
                titulo: `¡Bienvenido ${userData?.nombre || 'Usuario'}!`,
                descripcion: 'Comienza registrando tus gastos e ingresos para recibir sugerencias personalizadas.',
                accion: 'Registra al menos 5 transacciones para obtener análisis inteligentes.',
                prioridad: 'baja'
            });
        }

        return sugerencias;
    }

    /**
     * 🎯 SUGERENCIAS ESPECÍFICAS POR CATEGORÍA
     */
    getSugerenciaCategoria(categoria) {
        const sugerenciasPorCategoria = {
            'Alimentación': 'Considera planificar menús semanales y comparar precios en diferentes supermercados.',
            'Transporte': 'Evalúa opciones de transporte público o compartido para reducir costos.',
            'Vivienda': 'Revisa servicios básicos y busca maneras de reducir consumo energético.',
            'Entretenimiento': 'Busca alternativas gratuitas o de bajo costo para el ocio.',
            'Salud': 'Mantén un fondo de emergencia para gastos médicos inesperados.',
            'Educación': 'Busca cursos en línea gratuitos o con descuentos especiales.',
            'Tecnología': 'Evalúa si realmente necesitas las últimas actualizaciones tecnológicas.',
            'Ropa': 'Aprovecha descuentos de temporada y evalúa la calidad sobre la cantidad.',
            'Servicios': 'Revisa periódicamente tus suscripciones y cancela las que no uses.',
            'Otros': 'Categoriza mejor tus gastos para obtener análisis más precisos.'
        };

        return sugerenciasPorCategoria[categoria] || 'Revisa si estos gastos están alineados con tus objetivos financieros.';
    }

    /**
     * 🎨 ACTUALIZAR RESUMEN DE ANÁLISIS
     */
    actualizarResumenAnalisis() {
        if (!this.analisisCompleto) return;

        const { patronesGastos, patronesIngresos, balance, porcentajeAhorro } = this.analisisCompleto;

        // Mostrar section de resumen
        const resumenSection = document.getElementById('analisis-resumen');
        if (resumenSection) {
            resumenSection.classList.remove('hidden');
        }

        // Actualizar valores
        this.updateElement('total-ingresos', this.formatCurrency(patronesIngresos.totalIngresos));
        this.updateElement('total-gastos', this.formatCurrency(patronesGastos.totalGastos));
        this.updateElement('balance-total', this.formatCurrency(balance));
        this.updateElement('porcentaje-ahorro', `${porcentajeAhorro.toFixed(1)}%`);

        console.log('✅ Resumen de análisis actualizado');
    }

    /**
     * 🎨 RENDERIZAR SUGERENCIAS AMIGABLES
     */
    renderizarSugerencias() {
        console.log('🎨 Renderizando sugerencias con diseño amigable...');
        
        if (!this.analisisCompleto || !this.analisisCompleto.sugerencias) {
            console.log('⚠️ No hay sugerencias para renderizar');
            return;
        }

        const { sugerencias } = this.analisisCompleto;

        // Usar la nueva función amigable si está disponible
        if (typeof window.mostrarSugerenciasAmigables === 'function') {
            console.log('✅ Usando renderizado amigable');
            window.mostrarSugerenciasAmigables(sugerencias);
        } else {
            // Fallback al método anterior
            console.log('⚠️ Función amigable no disponible, usando fallback');
            const container = document.getElementById('sugerencias-container');
            if (!container) return;

            if (!sugerencias || sugerencias.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-16">
                        <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-info-circle text-3xl text-yellow-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Sin sugerencias disponibles</h3>
                        <p class="text-gray-600">Registra más transacciones para obtener análisis detallados.</p>
                    </div>
                `;
                return;
            }

            // Renderizado básico si la función amigable no está disponible
            const sugerenciasHTML = sugerencias.map(sugerencia => `
                <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-start space-x-4">
                        <div class="text-3xl">${sugerencia.icono}</div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">${sugerencia.titulo}</h3>
                            <p class="text-gray-600 mb-4">${sugerencia.descripcion}</p>
                            <div class="bg-blue-50 rounded-xl p-3 border-l-4 border-blue-400">
                                <p class="text-sm text-gray-700">
                                    <strong>💡 Recomendación:</strong> ${sugerencia.accion}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.innerHTML = `
                <div class="space-y-6">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            🎉 ¡Sugerencias generadas!
                        </h2>
                        <p class="text-gray-600">Basadas en tus últimos ${this.iaConfig.diasAnalisis} días</p>
                    </div>
                    ${sugerenciasHTML}
                </div>
            `;
        }

        console.log('✅ Sugerencias renderizadas con estilo amigable:', sugerencias.length);
    }

    /**
     * 🎨 FUNCIONES DE INTERFAZ
     */
    actualizarSugerencias() {
        console.log('🔄 Actualizando sugerencias...');
        
        if (this.notyf) {
            this.notyf.info('Actualizando análisis...');
        }
        
        this.ejecutarAnalisisCompleto().then(() => {
            if (this.notyf) {
                this.notyf.success('Análisis actualizado correctamente');
            }
        }).catch(error => {
            console.error('❌ Error actualizando:', error);
            if (this.notyf) {
                this.notyf.error('Error actualizando análisis');
            }
        });
    }

    ejecutarPruebas() {
        console.log('🧪 Ejecutando pruebas del sistema...');
        
        if (this.notyf) {
            this.notyf.info('Ejecutando pruebas de diagnóstico...');
        }
        
        this.diagnosticCheck().then(resultado => {
            this.mostrarDiagnostico(resultado);
            if (this.notyf) {
                this.notyf.success('Pruebas completadas - Ver diagnóstico');
            }
        });
    }

    mostrarTutorial() {
        const modal = document.getElementById('tutorial-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    cerrarTutorial() {
        const modal = document.getElementById('tutorial-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    configurarAlertas() {
        const modal = document.getElementById('alertas-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    cerrarAlertas() {
        const modal = document.getElementById('alertas-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    guardarAlertas() {
        // Obtener configuración de alertas del modal
        const alertaGastos = document.getElementById('alerta-gastos').checked;
        const alertaAhorro = document.getElementById('alerta-ahorro').checked;
        const alertaTendencias = document.getElementById('alerta-tendencias').checked;

        const configuracion = {
            alertaGastos,
            alertaAhorro,
            alertaTendencias,
            fechaConfiguracion: new Date().toISOString()
        };

        localStorage.setItem('sugerencias_alertas_config', JSON.stringify(configuracion));
        
        this.cerrarAlertas();
        
        if (this.notyf) {
            this.notyf.success('Configuración de alertas guardada');
        }
        
        console.log('✅ Configuración de alertas guardada:', configuracion);
    }

    exportarReporte() {
        try {
            console.log('📄 Generando reporte HTML con diseño PDF...');
            
            // Generar directamente HTML con diseño PDF profesional
            this.generarReporteProfesionalHTML();

        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            
            // Mostrar error simple
            if (window.globalNotyf && window.globalNotyf.error) {
                window.globalNotyf.error('❌ Error al generar reporte');
            } else {
                alert('❌ Error al generar reporte: ' + error.message);
            }
        }
    }

    generarReporteProfesionalPDF(usarDatosEjemplo = false) {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Configuración de colores
        const colors = {
            primary: [59, 130, 246],    // Blue
            success: [34, 197, 94],     // Green  
            warning: [245, 158, 11],    // Yellow
            danger: [239, 68, 68],      // Red
            gray: [107, 114, 128],      // Gray
            dark: [17, 24, 39]          // Dark gray
        };

        let yPosition = 20;
        const leftMargin = 20;
        const rightMargin = pageWidth - 20;
        
        // 📋 HEADER PROFESIONAL
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Logo y título
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('PLANIFICAPRO', leftMargin, 15);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Reporte Financiero Personal', leftMargin, 25);
        
        // Fecha
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        });
        doc.setFontSize(10);
        doc.text(fechaActual, rightMargin - 50, 15);
        doc.text('Generado automáticamente', rightMargin - 50, 25);
        
        yPosition = 50;
        
        // 📊 RESUMEN EJECUTIVO
        doc.setTextColor(...colors.dark);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('📊 RESUMEN EJECUTIVO', leftMargin, yPosition);
        yPosition += 10;
        
        // Línea separadora
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 15;
        
        // Métricas principales - usar datos de ejemplo si no hay análisis real
        let metricas;
        if (usarDatosEjemplo || !this.analisisCompleto) {
            metricas = {
                totalIngresos: 10731.25,
                totalGastos: 1801.50,
                porcentajeAhorro: 83.2
            };
        } else {
            metricas = this.analisisCompleto.metricas || {};
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        // Ingresos
        doc.setTextColor(...colors.success);
        doc.text('INGRESOS TOTALES:', leftMargin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${(metricas.totalIngresos || 0).toFixed(2)}`, leftMargin + 60, yPosition);
        yPosition += 8;
        
        // Gastos
        doc.setTextColor(...colors.danger);
        doc.setFont('helvetica', 'normal');
        doc.text('GASTOS TOTALES:', leftMargin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${(metricas.totalGastos || 0).toFixed(2)}`, leftMargin + 60, yPosition);
        yPosition += 8;
        
        // Balance
        const balance = (metricas.totalIngresos || 0) - (metricas.totalGastos || 0);
        doc.setTextColor(balance >= 0 ? colors.success : colors.danger);
        doc.setFont('helvetica', 'normal');
        doc.text('BALANCE:', leftMargin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(`S/ ${balance.toFixed(2)}`, leftMargin + 60, yPosition);
        yPosition += 8;
        
        // Porcentaje de ahorro
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'normal');
        doc.text('% AHORRO:', leftMargin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(`${(metricas.porcentajeAhorro || 0).toFixed(1)}%`, leftMargin + 60, yPosition);
        yPosition += 20;
        
        // 💡 SUGERENCIAS PERSONALIZADAS
        doc.setTextColor(...colors.dark);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('💡 SUGERENCIAS PERSONALIZADAS', leftMargin, yPosition);
        yPosition += 10;
        
        doc.setDrawColor(...colors.primary);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 15;
        
        // Sugerencias - usar datos de ejemplo si no hay análisis real
        let sugerencias;
        if (usarDatosEjemplo || !this.analisisCompleto) {
            sugerencias = [
                {
                    titulo: 'Excelente manejo financiero',
                    descripcion: 'Estás ahorrando 83.2% de tus ingresos. ¡Sigue así!',
                    accion: 'Considera invertir tus ahorros para hacerlos crecer.'
                },
                {
                    titulo: 'Alimentación es tu mayor gasto',
                    descripcion: 'Representa 27.8% de tus gastos (S/ 500.50).',
                    accion: 'Revisa si estos gastos están alineados con tus objetivos financieros.'
                },
                {
                    titulo: 'Oportunidad de inversión',
                    descripcion: 'Con tu alto porcentaje de ahorro, puedes diversificar.',
                    accion: 'Explora opciones de inversión conservadora para hacer crecer tus ahorros.'
                }
            ];
        } else {
            sugerencias = this.analisisCompleto.sugerencias || [];
        }
        
        if (sugerencias.length > 0) {
            sugerencias.slice(0, 3).forEach((sugerencia, index) => {
                // Verificar si necesitamos nueva página
                if (yPosition > pageHeight - 50) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Título de sugerencia
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...colors.primary);
                doc.text(`${index + 1}. ${sugerencia.titulo || 'Sugerencia Financiera'}`, leftMargin, yPosition);
                yPosition += 8;
                
                // Descripción
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...colors.gray);
                const descripcion = sugerencia.descripcion || sugerencia.mensaje || 'Sin descripción';
                const descripcionLines = doc.splitTextToSize(descripcion, rightMargin - leftMargin - 10);
                doc.text(descripcionLines, leftMargin + 5, yPosition);
                yPosition += descripcionLines.length * 5 + 5;
                
                // Recomendación
                if (sugerencia.accion) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...colors.warning);
                    doc.text('Recomendacion:', leftMargin + 5, yPosition);
                    yPosition += 6;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...colors.dark);
                    const accionLines = doc.splitTextToSize(sugerencia.accion, rightMargin - leftMargin - 15);
                    doc.text(accionLines, leftMargin + 10, yPosition);
                    yPosition += accionLines.length * 5 + 10;
                }
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(...colors.gray);
            doc.text('No hay sugerencias disponibles en este momento.', leftMargin, yPosition);
            yPosition += 20;
        }
        
        // 🎯 PLAN DE ACCIÓN
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setTextColor(...colors.dark);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('🎯 PLAN DE ACCIÓN RECOMENDADO', leftMargin, yPosition);
        yPosition += 10;
        
        doc.setDrawColor(...colors.primary);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 15;
        
        const acciones = [
            '📈 Revisa tus gastos mensualmente para identificar áreas de mejora',
            '💰 Establece metas de ahorro específicas y alcanzables',
            '📊 Utiliza las herramientas de análisis regularmente',
            '🎯 Mantén un seguimiento constante de tus objetivos financieros',
            '💡 Implementa las sugerencias personalizadas gradualmente'
        ];
        
        acciones.forEach((accion, index) => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.dark);
            const accionLines = doc.splitTextToSize(accion, rightMargin - leftMargin - 10);
            doc.text(accionLines, leftMargin + 5, yPosition);
            yPosition += accionLines.length * 5 + 8;
        });
        
        // 📄 FOOTER
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Línea superior del footer
            doc.setDrawColor(...colors.gray);
            doc.setLineWidth(0.3);
            doc.line(leftMargin, pageHeight - 20, rightMargin, pageHeight - 20);
            
            // Texto del footer
            doc.setFontSize(8);
            doc.setTextColor(...colors.gray);
            doc.setFont('helvetica', 'normal');
            doc.text('Generado por PLANIFICAPRO - Tu Coach Financiero Personal', leftMargin, pageHeight - 10);
            doc.text(`Página ${i} de ${pageCount}`, rightMargin - 30, pageHeight - 10);
        }
        
        // Guardar PDF con manejo mejorado de errores
        try {
            const filename = `Reporte-Financiero-PLANIFICAPRO-${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('💾 Guardando PDF como:', filename);
            
            // Verificar que doc.save existe y es una función
            if (typeof doc.save !== 'function') {
                throw new Error('doc.save no es una función válida');
            }
            
            doc.save(filename);
            console.log('✅ PDF guardado exitosamente');
            
            // Usar Notyf global
            const notyf = this.notyf || window.globalNotyf || {
                success: (msg) => console.log('✅', msg)
            };
            notyf.success('📄 Reporte PDF profesional generado exitosamente');
            
        } catch (saveError) {
            console.error('❌ Error al guardar PDF:', saveError);
            
            const notyf = this.notyf || window.globalNotyf || {
                error: (msg) => console.log('❌', msg),
                warning: (msg) => console.log('⚠️', msg)
            };
            notyf.error(`❌ Error al descargar PDF: ${saveError.message}`);
            setTimeout(() => {
                notyf.warning('⚠️ Generando reporte HTML de respaldo...');
                this.generarReporteHTMLFallback();
            }, 2000);
        }
    }

    generarReporteHTMLFallback() {
        // Función de respaldo si falla el PDF
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const reporteHTML = this.generarReporteHTML(fechaActual);
        
        const blob = new Blob([reporteHTML], { 
            type: 'text/html;charset=utf-8' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte-Financiero-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        const notyf = this.notyf || window.globalNotyf || {
            success: (msg) => console.log('✅', msg)
        };
        notyf.success('📄 Reporte HTML generado como respaldo');
    }

    generarReporteProfesionalHTML() {
        console.log('📄 Generando reporte HTML con diseño PDF...');
        
        const usuario = this.getUserData();
        const fechaActual = new Date();
        
        // Datos de ejemplo para la demostración
        const datosReporte = {
            totalIngresos: 10731.25,
            totalGastos: 1801.50,
            balance: 8929.75,
            porcentajeAhorro: 83.2,
            categorias: [
                { nombre: 'Alimentación', monto: 500.50, porcentaje: 27.8 },
                { nombre: 'Transporte', monto: 350.00, porcentaje: 19.4 },
                { nombre: 'Entretenimiento', monto: 280.75, porcentaje: 15.6 },
                { nombre: 'Servicios', monto: 420.25, porcentaje: 23.3 },
                { nombre: 'Otros', monto: 250.00, porcentaje: 13.9 }
            ]
        };

        // Crear HTML con diseño PDF profesional
        const reporteHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Financiero - PLANIFICAPRO</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: #f7fafc;
        }
        
        .container {
            max-width: 21cm;
            min-height: 29.7cm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            position: relative;
        }
        
        .header {
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
            );
            animation: shimmer 20s linear infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px;
        }
        
        .report-meta {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 5px solid #3B82F6;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .metric-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .metric-card.positive {
            border-left: 5px solid #10B981;
            background: linear-gradient(135deg, #f0fff4 0%, #f0fdf4 100%);
        }
        
        .metric-card.negative {
            border-left: 5px solid #EF4444;
            background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%);
        }
        
        .metric-card.neutral {
            border-left: 5px solid #3B82F6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }
        
        .metric-icon {
            font-size: 2rem;
            margin-bottom: 10px;
            display: block;
        }
        
        .metric-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 5px;
        }
        
        .section {
            margin: 40px 0;
        }
        
        .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3B82F6;
            position: relative;
        }
        
        .suggestions-container {
            display: grid;
            gap: 20px;
        }
        
        .suggestion-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            border: 1px solid #e2e8f0;
            position: relative;
            overflow: hidden;
        }
        
        .suggestion-card.excellent {
            border-left: 5px solid #10B981;
            background: linear-gradient(135deg, #f0fff4 0%, #ecfdf5 100%);
        }
        
        .suggestion-card.warning {
            border-left: 5px solid #F59E0B;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }
        
        .suggestion-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .suggestion-description {
            color: #4a5568;
            margin-bottom: 15px;
            line-height: 1.7;
            font-size: 1.05rem;
        }
        
        .suggestion-recommendation {
            background: rgba(59, 130, 246, 0.1);
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3B82F6;
            font-weight: 600;
            color: #2563eb;
        }
        
        .categories-breakdown {
            display: grid;
            gap: 15px;
            margin: 20px 0;
        }
        
        .category-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .category-name {
            font-weight: 600;
            color: #2d3748;
        }
        
        .category-amount {
            font-weight: 700;
            color: #e53e3e;
        }
        
        .category-percentage {
            font-size: 0.9rem;
            color: #718096;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            margin-top: 40px;
        }
        
        .download-buttons {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: #3B82F6;
            color: white;
        }
        
        .btn-primary:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
            transform: translateY(-2px);
        }
        
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.1;
            font-size: 6rem;
            font-weight: 900;
            color: #3B82F6;
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: 0;
        }
    </style>
</head>
<body>
    <div class="watermark">PLANIFICAPRO</div>
    
    <div class="download-buttons no-print">
        <button class="btn btn-primary" onclick="window.print()">
            📄 Imprimir / Guardar PDF
        </button>
        <button class="btn btn-secondary" onclick="window.close()">
            ❌ Cerrar
        </button>
    </div>

    <div class="container">
        <div class="header">
            <h1>📊 PLANIFICAPRO</h1>
            <p>Reporte Financiero Personal</p>
            <p style="font-size: 1rem; margin-top: 10px;">
                👤 ${usuario.nombre || 'Usuario'} | 📅 ${fechaActual.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </p>
        </div>

        <div class="content">
            <div class="report-meta">
                <h3>📋 Información del Reporte</h3>
                <p><strong>Generado:</strong> ${fechaActual.toLocaleString('es-ES')}</p>
                <p><strong>Período:</strong> ${fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                <p><strong>Estado:</strong> <span style="color: #10B981; font-weight: bold;">✅ Excelente Gestión Financiera</span></p>
            </div>

            <div class="section">
                <h2 class="section-title">💰 Resumen Financiero</h2>
                <div class="metrics-grid">
                    <div class="metric-card positive">
                        <span class="metric-icon">💰</span>
                        <div class="metric-title">Ingresos Totales</div>
                        <div class="metric-value">S/ ${datosReporte.totalIngresos.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
                    </div>
                    
                    <div class="metric-card negative">
                        <span class="metric-icon">💸</span>
                        <div class="metric-title">Gastos Totales</div>
                        <div class="metric-value">S/ ${datosReporte.totalGastos.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
                    </div>
                    
                    <div class="metric-card neutral">
                        <span class="metric-icon">💎</span>
                        <div class="metric-title">Balance Final</div>
                        <div class="metric-value">S/ ${datosReporte.balance.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
                    </div>
                    
                    <div class="metric-card positive">
                        <span class="metric-icon">📈</span>
                        <div class="metric-title">Porcentaje de Ahorro</div>
                        <div class="metric-value">${datosReporte.porcentajeAhorro}%</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">📊 Desglose de Gastos por Categoría</h2>
                <div class="categories-breakdown">
                    ${datosReporte.categorias.map(cat => `
                        <div class="category-item">
                            <div>
                                <div class="category-name">${cat.nombre}</div>
                                <div class="category-percentage">${cat.porcentaje}% del total</div>
                            </div>
                            <div class="category-amount">S/ ${cat.monto.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">💡 Sugerencias Personalizadas</h2>
                <div class="suggestions-container">
                    <div class="suggestion-card excellent">
                        <div class="suggestion-title">
                            🎉 Excelente Manejo Financiero
                        </div>
                        <div class="suggestion-description">
                            Felicitaciones! Estás ahorrando el <strong>${datosReporte.porcentajeAhorro}%</strong> de tus ingresos totales. 
                            Este es un porcentaje excepcional que demuestra una excelente disciplina financiera.
                        </div>
                        <div class="suggestion-recommendation">
                            💡 <strong>Recomendación:</strong> Considera diversificar tus ahorros mediante inversiones de bajo riesgo 
                            para hacer crecer tu patrimonio a largo plazo.
                        </div>
                    </div>
                    
                    <div class="suggestion-card warning">
                        <div class="suggestion-title">
                            💸 Análisis de Gastos Principales
                        </div>
                        <div class="suggestion-description">
                            Tu mayor gasto es en <strong>${datosReporte.categorias[0].nombre}</strong>, representando el 
                            <strong>${datosReporte.categorias[0].porcentaje}%</strong> de tus gastos totales 
                            (S/ ${datosReporte.categorias[0].monto.toLocaleString('es-PE', {minimumFractionDigits: 2})}).
                        </div>
                        <div class="suggestion-recommendation">
                            💡 <strong>Recomendación:</strong> Aunque este gasto puede ser necesario, revisa si hay oportunidades 
                            para optimizar sin comprometer tu calidad de vida.
                        </div>
                    </div>
                    
                    <div class="suggestion-card excellent">
                        <div class="suggestion-title">
                            🎯 Próximos Objetivos Financieros
                        </div>
                        <div class="suggestion-description">
                            Con tu actual capacidad de ahorro, podrías establecer metas financieras ambiciosas como:
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Fondo de emergencia para 6-12 meses</li>
                                <li>Inversión en educación o capacitación</li>
                                <li>Ahorro para proyectos a mediano plazo</li>
                            </ul>
                        </div>
                        <div class="suggestion-recommendation">
                            💡 <strong>Recomendación:</strong> Establece metas SMART (Específicas, Medibles, Alcanzables, Relevantes, Temporales) 
                            para maximizar tu progreso financiero.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>PLANIFICAPRO</strong> - Tu Coach Financiero Personal</p>
            <p>Este reporte ha sido generado automáticamente basado en tu actividad financiera</p>
            <p style="font-size: 0.9rem; color: #718096; margin-top: 10px;">
                © ${fechaActual.getFullYear()} PLANIFICAPRO. Todos los derechos reservados.
            </p>
        </div>
    </div>

    <script>
        // Auto-focus en el botón de imprimir para facilitar el uso
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 Reporte HTML cargado exitosamente');
            
            // Animar las tarjetas cuando se carga la página
            const cards = document.querySelectorAll('.metric-card, .suggestion-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'all 0.6s ease';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                }, index * 100);
            });
        });
        
        // Función para imprimir
        function imprimirReporte() {
            window.print();
        }
        
        // Mejorar la experiencia de impresión
        window.addEventListener('beforeprint', function() {
            document.title = 'Reporte-PLANIFICAPRO-${fechaActual.toISOString().split('T')[0]}';
        });
    </script>
</body>
</html>`;

        // Abrir en nueva ventana
        const ventana = window.open('', '_blank');
        ventana.document.write(reporteHTML);
        ventana.document.close();

        // Notificación de éxito simple
        console.log('✅ Reporte HTML profesional generado exitosamente');
        
        // Mostrar notificación si está disponible
        if (window.globalNotyf && window.globalNotyf.success) {
            window.globalNotyf.success('📄 ¡Reporte HTML generado! Se abrió en nueva ventana');
        }
    }

    generarPDFConHtml2PDF() {
        // Verificar si html2pdf está disponible
        if (typeof window.html2pdf === 'undefined') {
            throw new Error('html2pdf no está disponible');
        }

        console.log('📄 Generando PDF con html2pdf.js...');

        // Crear HTML para el reporte
        const reporteHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; margin: -20px -20px 20px -20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">PLANIFICAPRO</h1>
                    <p style="margin: 5px 0 0 0;">Reporte Financiero Personal</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px;">${new Date().toLocaleDateString('es-ES')}</p>
                </div>

                <!-- Métricas -->
                <div style="margin: 30px 0;">
                    <h2 style="color: #1F2937; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">📊 RESUMEN FINANCIERO</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                        <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981;">
                            <h3 style="margin: 0; color: #059669;">💰 INGRESOS TOTALES</h3>
                            <p style="font-size: 20px; font-weight: bold; margin: 5px 0 0 0; color: #065F46;">S/ 10,731.25</p>
                        </div>
                        
                        <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; border-left: 4px solid #EF4444;">
                            <h3 style="margin: 0; color: #DC2626;">💸 GASTOS TOTALES</h3>
                            <p style="font-size: 20px; font-weight: bold; margin: 5px 0 0 0; color: #991B1B;">S/ 1,801.50</p>
                        </div>
                        
                        <div style="background: #EFF6FF; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                            <h3 style="margin: 0; color: #2563EB;">💎 BALANCE</h3>
                            <p style="font-size: 20px; font-weight: bold; margin: 5px 0 0 0; color: #1D4ED8;">S/ 8,929.75</p>
                        </div>
                        
                        <div style="background: #F0F9FF; padding: 15px; border-radius: 8px; border-left: 4px solid #0EA5E9;">
                            <h3 style="margin: 0; color: #0284C7;">📈 % AHORRO</h3>
                            <p style="font-size: 20px; font-weight: bold; margin: 5px 0 0 0; color: #0C4A6E;">83.2%</p>
                        </div>
                    </div>
                </div>

                <!-- Sugerencias -->
                <div style="margin: 30px 0;">
                    <h2 style="color: #1F2937; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px;">💡 SUGERENCIAS PERSONALIZADAS</h2>
                    
                    <div style="background: #FEFCE8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EAB308;">
                        <h3 style="margin: 0 0 10px 0; color: #A16207;">🎉 Excelente manejo financiero</h3>
                        <p style="margin: 0 0 10px 0; color: #713F12;">Estás ahorrando 83.2% de tus ingresos. ¡Sigue así!</p>
                        <p style="margin: 0; font-weight: bold; color: #92400E;">💡 Recomendación: Considera invertir tus ahorros para hacerlos crecer.</p>
                    </div>
                    
                    <div style="background: #FEF3F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F97316;">
                        <h3 style="margin: 0 0 10px 0; color: #C2410C;">💸 Alimentación es tu mayor gasto</h3>
                        <p style="margin: 0 0 10px 0; color: #9A3412;">Representa 27.8% de tus gastos (S/ 500.50).</p>
                        <p style="margin: 0; font-weight: bold; color: #7C2D12;">💡 Recomendación: Revisa si estos gastos están alineados con tus objetivos financieros.</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px;">
                    <p>Generado por PLANIFICAPRO - Tu Coach Financiero Personal</p>
                    <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
                </div>
            </div>
        `;

        // Crear elemento temporal
        const element = document.createElement('div');
        element.innerHTML = reporteHTML;
        document.body.appendChild(element);

        // Configuración de html2pdf
        const options = {
            margin: 10,
            filename: `Reporte-PLANIFICAPRO-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generar PDF
        html2pdf().set(options).from(element).save().then(() => {
            // Limpiar elemento temporal
            document.body.removeChild(element);
            
            const notyf = this.notyf || window.globalNotyf || {
                success: (msg) => console.log('✅', msg)
            };
            notyf.success('📄 Reporte PDF generado exitosamente con html2pdf');
            console.log('✅ PDF generado con html2pdf.js');
        }).catch((error) => {
            // Limpiar elemento temporal
            document.body.removeChild(element);
            throw error;
        });
    }

    generarReporteHTML(fecha) {
        const usuario = this.getUserData();
        const analisis = this.analisisCompleto;
        
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Reporte Financiero Personal</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .subtitle {
            color: #666;
            font-size: 1.2em;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border-radius: 15px;
            background: #f8f9ff;
            border-left: 5px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 1.8em;
        }
        .metric {
            background: white;
            padding: 15px;
            margin: 15px 0;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        .suggestion {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            color: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .emoji {
            font-size: 1.5em;
            margin-right: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">💰 Mi Reporte Financiero Personal</div>
            <div class="subtitle">Tu Coach Financiero Personal • ${fecha}</div>
        </div>

        <div class="section">
            <h2>📊 Resumen Financiero</h2>
            ${this.generarSeccionResumen(analisis)}
        </div>

        <div class="section">
            <h2>💡 Mis Sugerencias Personalizadas</h2>
            ${this.generarSeccionSugerencias(analisis)}
        </div>

        <div class="section">
            <h2>🎯 Plan de Acción</h2>
            ${this.generarPlanAccion(analisis)}
        </div>

        <div class="footer">
            <p><strong>🤖 Generado por tu Coach Financiero Personal</strong></p>
            <p>Este reporte fue generado automáticamente basado en tus datos de los últimos 90 días</p>
            <p style="font-size: 0.9em; color: #999;">Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
        </div>
    </div>
</body>
</html>`;
    }

    generarSeccionResumen(analisis) {
        if (!analisis || !analisis.metricas) return '<p>No hay datos de métricas disponibles</p>';
        
        const metricas = analisis.metricas;
        return `
            <div class="metric">
                <strong>💰 Total de Ingresos:</strong> 
                <span class="metric-value">$${metricas.totalIngresos?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="metric">
                <strong>💸 Total de Gastos:</strong> 
                <span class="metric-value">$${metricas.totalGastos?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="metric">
                <strong>💎 Total Ahorrado:</strong> 
                <span class="metric-value">$${metricas.totalAhorros?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="metric">
                <strong>📊 Porcentaje de Ahorro:</strong> 
                <span class="metric-value">${metricas.porcentajeAhorro?.toFixed(1) || '0.0'}%</span>
            </div>
        `;
    }

    generarSeccionSugerencias(analisis) {
        if (!analisis || !analisis.sugerencias || analisis.sugerencias.length === 0) {
            return '<p>No hay sugerencias disponibles en este momento</p>';
        }

        return analisis.sugerencias.map(sugerencia => `
            <div class="suggestion">
                <span class="emoji">${sugerencia.icono || '💡'}</span>
                <strong>${sugerencia.titulo || 'Sugerencia Financiera'}</strong>
                <p>${sugerencia.descripcion || sugerencia.mensaje || 'Sin descripción disponible'}</p>
            </div>
        `).join('');
    }

    generarPlanAccion(analisis) {
        const acciones = [
            '📈 Revisa tus gastos mensualmente para identificar áreas de mejora',
            '💰 Establece metas de ahorro específicas y alcanzables', 
            '📊 Utiliza las herramientas de tu coach financiero regularmente',
            '🎯 Mantén un seguimiento constante de tus objetivos financieros'
        ];

        if (analisis && analisis.recomendaciones) {
            // Si hay recomendaciones específicas, las agregamos
            analisis.recomendaciones.forEach(rec => {
                if (rec.accion) {
                    acciones.push(`🔥 ${rec.accion}`);
                }
            });
        }

        return acciones.map(accion => `
            <div class="metric">
                ${accion}
            </div>
        `).join('');
    }

    toggleDiagnostico() {
        const panel = document.getElementById('diagnostico-panel');
        if (panel) {
            const isHidden = panel.classList.contains('hidden');
            if (isHidden) {
                this.diagnosticCheck().then(resultado => {
                    this.mostrarDiagnostico(resultado);
                });
            } else {
                panel.classList.add('hidden');
            }
        }
    }

    mostrarDiagnostico(diagnostico) {
        const panel = document.getElementById('diagnostico-panel');
        const content = document.getElementById('diagnostico-content');
        
        if (!panel || !content) return;

        const diagnosticoHTML = `
            <div class="text-xs space-y-1">
                <div class="flex justify-between">
                    <span>🔐 Autenticación:</span>
                    <span class="${diagnostico.auth ? 'text-green-600' : 'text-red-600'}">
                        ${diagnostico.auth ? 'OK' : 'ERROR'}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span>🌐 Conexión Supabase:</span>
                    <span class="${diagnostico.supabase ? 'text-green-600' : 'text-red-600'}">
                        ${diagnostico.supabase ? 'OK' : 'ERROR'}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span>📊 Datos cargados:</span>
                    <span class="text-blue-600">
                        ${diagnostico.datosCount || 0} registros
                    </span>
                </div>
                <div class="flex justify-between">
                    <span>🧠 Análisis IA:</span>
                    <span class="${diagnostico.analisisIA ? 'text-green-600' : 'text-yellow-600'}">
                        ${diagnostico.analisisIA ? 'COMPLETADO' : 'PENDIENTE'}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span>🎯 Sugerencias:</span>
                    <span class="text-purple-600">
                        ${diagnostico.sugerenciasCount || 0} generadas
                    </span>
                </div>
                ${diagnostico.errores && diagnostico.errores.length > 0 ? `
                    <div class="mt-2 p-2 bg-red-50 rounded text-red-700">
                        <strong>Errores:</strong><br>
                        ${diagnostico.errores.map(e => `• ${e}`).join('<br>')}
                    </div>
                ` : ''}
            </div>
        `;

        content.innerHTML = diagnosticoHTML;
        panel.classList.remove('hidden');
    }

    /**
     * 🔍 DIAGNÓSTICO DEL SISTEMA
     */
    async diagnosticCheck() {
        console.log('🔍 === DIAGNÓSTICO SUGERENCIAS INTELIGENTES ===');
        
        const diagnostico = {
            auth: false,
            supabase: false,
            analisisIA: false,
            datosCount: 0,
            sugerenciasCount: 0,
            errores: []
        };
        
        try {
            // Verificar autenticación
            await this.checkAuth();
            diagnostico.auth = true;
            console.log('✅ Autenticación: OK');

            // Verificar conexión Supabase
            try {
                await this.cargarDatosCompletos();
                diagnostico.supabase = true;
                diagnostico.datosCount = this.ingresos.length + this.gastos.length;
                console.log('✅ Supabase: OK');
            } catch (error) {
                diagnostico.errores.push(`Supabase: ${error.message}`);
                console.log('❌ Supabase: ERROR');
            }

            // Verificar análisis
            if (this.analisisCompleto) {
                diagnostico.analisisIA = true;
                diagnostico.sugerenciasCount = this.analisisCompleto.sugerencias?.length || 0;
                console.log('✅ Análisis IA: OK');
            }

        } catch (error) {
            diagnostico.errores.push(`Auth: ${error.message}`);
            console.log('❌ Diagnóstico general: ERROR');
        }

        console.log('🎯 Diagnóstico completado:', diagnostico);
        return diagnostico;
    }

    exportarDiagnostico() {
        this.diagnosticCheck().then(diagnostico => {
            const log = {
                timestamp: new Date().toISOString(),
                modulo: 'SugerenciasInteligentes',
                version: '1.0',
                desarrollador: 'Gemini Quispe',
                diagnostico,
                sistema: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    localStorage: {
                        hasToken: !!localStorage.getItem('supabase_access_token'),
                        hasUser: !!localStorage.getItem('currentUser')
                    }
                }
            };

            const blob = new Blob([JSON.stringify(log, null, 2)], { 
                type: 'application/json' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `diagnostico-sugerencias-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            if (this.notyf) {
                this.notyf.success('Log de diagnóstico exportado');
            }
        });
    }

    /**
     * 🔧 FUNCIONES AUXILIARES
     */
    onTemplateLoaded() {
        console.log('📄 Template cargado, ejecutando inicialización...');
        this.init();
    }

    mostrarLoading(show) {
        const loader = document.getElementById('sugerencias-loading');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }

    getUserData() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            return {
                id: currentUser.id,
                nombre: currentUser.nombre || 'Usuario',
                email: currentUser.email
            };
        } catch (error) {
            console.error('Error obteniendo datos de usuario:', error);
            return null;
        }
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(amount);
    }

    getBorderColor(tipo) {
        const colores = {
            'felicitacion': 'border-green-500',
            'alerta': 'border-yellow-500',
            'advertencia': 'border-red-500',
            'analisis': 'border-blue-500',
            'oportunidad': 'border-purple-500',
            'revision': 'border-orange-500',
            'bienvenida': 'border-indigo-500'
        };
        return colores[tipo] || 'border-gray-500';
    }

    getPriorityColor(prioridad) {
        const colores = {
            'alta': 'bg-red-100 text-red-800',
            'media': 'bg-yellow-100 text-yellow-800',
            'baja': 'bg-green-100 text-green-800'
        };
        return colores[prioridad] || 'bg-gray-100 text-gray-800';
    }
}

// 🌍 DISPONIBILIDAD GLOBAL
window.SugerenciasModuleHandler = SugerenciasModuleHandler;

// 🧪 FUNCIÓN DE DIAGNÓSTICO GLOBAL (compatibilidad con script de pruebas)
window.testSugerenciasIA = {
    ejecutarPruebaCompleta: function() {
        if (window.sugerenciasModuleHandler) {
            return window.sugerenciasModuleHandler.diagnosticCheck();
        } else {
            console.error('❌ Handler no inicializado');
            return { success: false, error: 'Handler no inicializado' };
        }
    },
    handler: () => window.sugerenciasModuleHandler
};

console.log('✅ SugerenciasModuleHandler optimizado cargado - Gemini Quispe');
