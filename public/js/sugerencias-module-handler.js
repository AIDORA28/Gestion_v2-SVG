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
     * 🎨 RENDERIZAR SUGERENCIAS
     */
    renderizarSugerencias() {
        const container = document.getElementById('sugerencias-container');
        if (!container || !this.analisisCompleto) return;

        const { sugerencias } = this.analisisCompleto;

        if (!sugerencias || sugerencias.length === 0) {
            container.innerHTML = `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <i data-lucide="info" class="h-8 w-8 text-yellow-600 mx-auto mb-2"></i>
                    <h3 class="text-lg font-medium text-yellow-800 mb-2">Sin sugerencias disponibles</h3>
                    <p class="text-yellow-600">Registra más transacciones para obtener análisis detallados.</p>
                </div>
            `;
            return;
        }

        const sugerenciasHTML = sugerencias.map(sugerencia => `
            <div class="bg-white rounded-lg shadow-md border-l-4 ${this.getBorderColor(sugerencia.tipo)} p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-start space-x-4">
                    <div class="text-3xl">${sugerencia.icono}</div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${sugerencia.titulo}</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getPriorityColor(sugerencia.prioridad)}">
                                ${sugerencia.prioridad || 'media'}
                            </span>
                        </div>
                        <p class="text-gray-600 mb-3">${sugerencia.descripcion}</p>
                        <div class="bg-gray-50 rounded-md p-3">
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
                <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                    <h2 class="text-2xl font-bold mb-2">🧠 Análisis Completado</h2>
                    <p class="opacity-90">
                        Se han generado ${sugerencias.length} sugerencias basadas en tus datos de los últimos ${this.iaConfig.diasAnalisis} días
                    </p>
                </div>
                <div class="space-y-4">
                    ${sugerenciasHTML}
                </div>
            </div>
        `;

        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        console.log('✅ Sugerencias renderizadas:', sugerencias.length);
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
        if (!this.analisisCompleto) {
            if (this.notyf) {
                this.notyf.warning('No hay análisis disponible para exportar');
            }
            return;
        }

        const reporte = {
            fecha: new Date().toISOString(),
            usuario: this.getUserData(),
            analisis: this.analisisCompleto,
            configuracion: {
                diasAnalisis: this.iaConfig.diasAnalisis,
                version: '1.0'
            }
        };

        const blob = new Blob([JSON.stringify(reporte, null, 2)], { 
            type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-sugerencias-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        if (this.notyf) {
            this.notyf.success('Reporte exportado correctamente');
        }
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
