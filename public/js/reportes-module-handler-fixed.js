/**
 * 📊 REPORTES MODULE HANDLER - FIXED VERSION
 * Basado exactamente en el patrón exitoso de dashboard-handler.js
 * Fecha: 10 Ene 2025
 * 
 * Funcionalidades:
 * - Análisis financiero completo
 * - Reportes de ingresos, gastos y créditos
 * - Gráficos interactivos con Chart.js
 * - Usa EXACTAMENTE el mismo patrón que dashboard-handler.js
 */

class ReportesModuleHandler {
    constructor() {
        // Usar EXACTAMENTE las mismas propiedades que el dashboard
        this.supabase = null;
        this.usuario = null;
        this.usuarioId = null;
        this.authToken = null;
        
        // URLs exactas del dashboard
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        
        this.datosReporte = {
            ingresos: [],
            gastos: [],
            creditos: []
        };
        
        this.graficos = {
            ingresosGastos: null,
            gastosCategoria: null
        };
        
        console.log('📊 ReportesModuleHandler FIXED inicializado');
    }

    /**
     * 🚀 INICIALIZAR MÓDULO - USAR PATRÓN DASHBOARD EXACTO
     */
    async init() {
        try {
            console.log('📊 Inicializando reportes con patrón dashboard...');
            
            // AUTENTICACIÓN EXACTA DEL DASHBOARD
            const userStr = localStorage.getItem('currentUser');
            const token = localStorage.getItem('supabase_access_token');
            
            if (!userStr || !token) {
                console.log('❌ No hay sesión activa');
                window.location.href = 'login.html';
                return;
            }

            try {
                const userData = JSON.parse(userStr);
                
                if (!userData.id || !userData.email) {
                    console.log('❌ Datos de usuario inválidos');
                    window.location.href = 'login.html';
                    return;
                }
                
                // USAR EXACTAMENTE LAS MISMAS PROPIEDADES QUE DASHBOARD
                this.usuario = userData;
                this.usuarioId = userData.id;
                this.authToken = token;
                
                console.log('✅ Usuario autenticado:', this.usuario.email);
                console.log('🔑 Usuario ID:', this.usuarioId);
                console.log('🔑 Token disponible:', this.authToken ? 'SÍ' : 'NO');
                
            } catch (error) {
                console.error('❌ Error procesando datos usuario:', error);
                window.location.href = 'login.html';
                return;
            }
            
            // Configurar filtros
            this.configurarFiltros();
            
            // Generar reporte inicial
            await this.generarReporte();
            
            console.log('✅ Reportes inicializados correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando reportes:', error);
            this.mostrarError('Error al cargar el módulo de reportes');
        }
    }

    /**
     * 📊 FETCH SUPABASE DATA - COPIA EXACTA DEL DASHBOARD
     */
    async fetchSupabaseData(tabla, selectFields = '*', filters = {}) {
        try {
            let url = `${this.supabaseUrl}/rest/v1/${tabla}?select=${selectFields}`;
            
            // Agregar filtro de usuario siempre
            url += `&usuario_id=eq.${this.usuarioId}`;
            
            // Agregar filtros adicionales
            Object.entries(filters).forEach(([key, value]) => {
                url += `&${key}=${value}`;
            });
            
            // Ordenar por fecha descendente
            url += '&order=fecha.desc';
            
            console.log(`📡 SUPABASE: ${tabla} ->`, url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ ${tabla}: ${data.length} registros obtenidos`);
            
            return data || [];
            
        } catch (error) {
            console.error(`❌ Error obteniendo ${tabla}:`, error);
            return [];
        }
    }

    /**
     * 🔄 FETCH LOCAL SERVER DATA - COPIA EXACTA DEL DASHBOARD
     */
    async fetchLocalServerData(endpoint) {
        try {
            console.log(`📡 LOCAL SERVER: ${endpoint}`);
            
            const response = await fetch(`/api/${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken || 'demo_token'}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Extraer datos según la estructura de respuesta
            const data = result[endpoint] || result.data || result;
            
            console.log(`✅ LOCAL SERVER ${endpoint}: ${Array.isArray(data) ? data.length : 'N/A'} registros`);
            
            return Array.isArray(data) ? data : [];
            
        } catch (error) {
            console.log(`⚠️ LOCAL SERVER ${endpoint} no disponible:`, error.message);
            return null;
        }
    }

    /**
     * ⚙️ CONFIGURAR FILTROS
     */
    configurarFiltros() {
        const periodoSelect = document.getElementById('periodo-select');
        const fechaDesde = document.getElementById('fecha-desde');
        const fechaHasta = document.getElementById('fecha-hasta');
        
        // Configurar fechas por defecto
        if (fechaDesde && fechaHasta) {
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            
            fechaDesde.value = primerDiaMes.toISOString().split('T')[0];
            fechaHasta.value = hoy.toISOString().split('T')[0];
        }
        
        // Event listeners
        if (periodoSelect) {
            periodoSelect.addEventListener('change', (e) => {
                const fechaDesdeContainer = document.getElementById('fecha-desde-container');
                const fechaHastaContainer = document.getElementById('fecha-hasta-container');
                
                if (e.target.value === 'personalizado') {
                    fechaDesdeContainer?.classList.remove('hidden');
                    fechaHastaContainer?.classList.remove('hidden');
                } else {
                    fechaDesdeContainer?.classList.add('hidden');
                    fechaHastaContainer?.classList.add('hidden');
                }
            });
        }
    }

    /**
     * 📊 GENERAR REPORTE PRINCIPAL
     */
    async generarReporte() {
        try {
            console.log('📊 Generando reporte financiero...');
            
            // Obtener fechas
            const {fechaInicio, fechaFin} = this.obtenerRangoFechas();
            
            console.log(`📅 Período: ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`);
            
            // Cargar datos usando el patrón exitoso del dashboard
            await Promise.all([
                this.cargarIngresos(fechaInicio, fechaFin),
                this.cargarGastos(fechaInicio, fechaFin),
                this.cargarCreditos(fechaInicio, fechaFin)
            ]);
            
            // Actualizar interfaz
            this.actualizarResumen();
            this.generarGraficos();
            
            console.log('✅ Reporte generado exitosamente');
            
        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            this.mostrarError('Error al generar el reporte');
        }
    }

    /**
     * 💰 CARGAR INGRESOS - USA PATRÓN DASHBOARD
     */
    async cargarIngresos(fechaInicio, fechaFin) {
        try {
            const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
            const fechaFinStr = fechaFin.toISOString().split('T')[0];
            
            console.log(`🔍 Cargando ingresos para usuario ${this.usuarioId}...`);
            
            // 1. Intentar servidor local primero (patrón dashboard)
            let data = await this.fetchLocalServerData('ingresos');
            
            if (data && data.length > 0) {
                // Filtrar por fechas
                this.datosReporte.ingresos = data.filter(ingreso => {
                    const fechaIngreso = new Date(ingreso.fecha || ingreso.fecha_transaccion);
                    return fechaIngreso >= fechaInicio && fechaIngreso <= fechaFin;
                });
                console.log(`✅ Ingresos desde servidor local: ${this.datosReporte.ingresos.length}`);
            } else {
                // 2. Fallback a Supabase directo (patrón dashboard)
                const filters = {
                    'fecha': `gte.${fechaInicioStr}`,
                    'fecha': `lte.${fechaFinStr}`
                };
                
                this.datosReporte.ingresos = await this.fetchSupabaseData('ingresos', '*', {
                    'fecha': `gte.${fechaInicioStr}`,
                    'fecha': `lte.${fechaFinStr}`
                });
                
                console.log(`✅ Ingresos desde Supabase: ${this.datosReporte.ingresos.length}`);
            }
            
            if (this.datosReporte.ingresos.length > 0) {
                const totalIngresos = this.datosReporte.ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto || 0), 0);
                console.log(`💰 Total ingresos: S/ ${totalIngresos.toFixed(2)}`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando ingresos:', error);
            this.datosReporte.ingresos = [];
        }
    }

    /**
     * 💸 CARGAR GASTOS - USA PATRÓN DASHBOARD
     */
    async cargarGastos(fechaInicio, fechaFin) {
        try {
            const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
            const fechaFinStr = fechaFin.toISOString().split('T')[0];
            
            console.log(`🔍 Cargando gastos para usuario ${this.usuarioId}...`);
            
            // 1. Intentar servidor local primero
            let data = await this.fetchLocalServerData('gastos');
            
            if (data && data.length > 0) {
                // Filtrar por fechas
                this.datosReporte.gastos = data.filter(gasto => {
                    const fechaGasto = new Date(gasto.fecha || gasto.fecha_transaccion);
                    return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
                });
                console.log(`✅ Gastos desde servidor local: ${this.datosReporte.gastos.length}`);
            } else {
                // 2. Fallback a Supabase directo
                this.datosReporte.gastos = await this.fetchSupabaseData('gastos', '*', {
                    'fecha': `gte.${fechaInicioStr}`,
                    'fecha': `lte.${fechaFinStr}`
                });
                
                console.log(`✅ Gastos desde Supabase: ${this.datosReporte.gastos.length}`);
            }
            
            if (this.datosReporte.gastos.length > 0) {
                const totalGastos = this.datosReporte.gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);
                console.log(`💸 Total gastos: S/ ${totalGastos.toFixed(2)}`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando gastos:', error);
            this.datosReporte.gastos = [];
        }
    }

    /**
     * 💳 CARGAR CRÉDITOS - USA PATRÓN DASHBOARD
     */
    async cargarCreditos(fechaInicio, fechaFin) {
        try {
            console.log(`🔍 Cargando créditos para usuario ${this.usuarioId}...`);
            
            // 1. Intentar servidor local primero
            let data = await this.fetchLocalServerData('creditos');
            
            if (data && data.length > 0) {
                this.datosReporte.creditos = data;
                console.log(`✅ Créditos desde servidor local: ${this.datosReporte.creditos.length}`);
            } else {
                // 2. Fallback a Supabase directo
                this.datosReporte.creditos = await this.fetchSupabaseData('creditos');
                console.log(`✅ Créditos desde Supabase: ${this.datosReporte.creditos.length}`);
            }
            
            if (this.datosReporte.creditos.length > 0) {
                const totalCreditos = this.datosReporte.creditos.reduce((sum, credito) => sum + parseFloat(credito.monto || 0), 0);
                console.log(`💳 Total créditos: S/ ${totalCreditos.toFixed(2)}`);
            }
            
        } catch (error) {
            console.error('❌ Error cargando créditos:', error);
            this.datosReporte.creditos = [];
        }
    }

    /**
     * 📋 ACTUALIZAR RESUMEN
     */
    actualizarResumen() {
        const totalIngresos = this.datosReporte.ingresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalGastos = this.datosReporte.gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalCreditos = this.datosReporte.creditos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const balanceNeto = totalIngresos - totalGastos;

        console.log('📊 Resumen calculado:', {
            totalIngresos,
            totalGastos,
            totalCreditos,
            balanceNeto
        });

        // Actualizar elementos del DOM
        const elementoIngresos = document.getElementById('total-ingresos');
        const elementoGastos = document.getElementById('total-gastos');
        const elementoBalance = document.getElementById('balance-neto');
        const elementoCreditos = document.getElementById('total-creditos');
        
        if (elementoIngresos) {
            elementoIngresos.textContent = `S/ ${totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            console.log('✅ Total ingresos actualizado en UI:', elementoIngresos.textContent);
        }
        
        if (elementoGastos) {
            elementoGastos.textContent = `S/ ${totalGastos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            console.log('✅ Total gastos actualizado en UI:', elementoGastos.textContent);
        }
        
        if (elementoBalance) {
            elementoBalance.textContent = `S/ ${balanceNeto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            elementoBalance.className = `text-xl font-bold ${balanceNeto >= 0 ? 'text-green-800' : 'text-red-800'}`;
            console.log('✅ Balance neto actualizado en UI:', elementoBalance.textContent);
        }

        if (elementoCreditos) {
            elementoCreditos.textContent = `S/ ${totalCreditos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            console.log('✅ Total créditos actualizado en UI:', elementoCreditos.textContent);
        }
    }

    /**
     * 📅 OBTENER RANGO DE FECHAS
     */
    obtenerRangoFechas() {
        const periodoSelect = document.getElementById('periodo-select');
        const fechaDesde = document.getElementById('fecha-desde');
        const fechaHasta = document.getElementById('fecha-hasta');
        
        const hoy = new Date();
        let fechaInicio, fechaFin;
        
        if (periodoSelect) {
            switch (periodoSelect.value) {
                case 'mes-actual':
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                    break;
                case 'mes-anterior':
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
                    fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
                    break;
                case 'trimestre':
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
                    fechaFin = hoy;
                    break;
                case 'año':
                    fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                    fechaFin = hoy;
                    break;
                case 'personalizado':
                    fechaInicio = fechaDesde && fechaDesde.value ? new Date(fechaDesde.value) : new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    fechaFin = fechaHasta && fechaHasta.value ? new Date(fechaHasta.value) : hoy;
                    break;
                default:
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    fechaFin = hoy;
            }
        } else {
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            fechaFin = hoy;
        }
        
        return { fechaInicio, fechaFin };
    }

    /**
     * 📈 GENERAR GRÁFICOS
     */
    generarGraficos() {
        this.generarGraficoIngresosGastos();
        this.generarGraficoGastosCategoria();
    }

    /**
     * 📊 GRÁFICO INGRESOS VS GASTOS
     */
    generarGraficoIngresosGastos() {
        const canvas = document.getElementById('chart-ingresos-gastos');
        if (!canvas) return;

        // Destruir gráfico anterior si existe
        if (this.graficos.ingresosGastos) {
            this.graficos.ingresosGastos.destroy();
        }

        // Agrupar por mes
        const datosPorMes = this.agruparPorMes();
        
        const ctx = canvas.getContext('2d');
        this.graficos.ingresosGastos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(datosPorMes),
                datasets: [
                    {
                        label: 'Ingresos',
                        data: Object.values(datosPorMes).map(mes => mes.ingresos),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Gastos',
                        data: Object.values(datosPorMes).map(mes => mes.gastos),
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString('es-PE');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': S/ ' + context.parsed.y.toLocaleString('es-PE', { minimumFractionDigits: 2 });
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 🥧 GRÁFICO GASTOS POR CATEGORÍA
     */
    generarGraficoGastosCategoria() {
        const canvas = document.getElementById('chart-gastos-categoria');
        if (!canvas) return;

        // Destruir gráfico anterior si existe
        if (this.graficos.gastosCategoria) {
            this.graficos.gastosCategoria.destroy();
        }

        // Agrupar gastos por categoría
        const gastosPorCategoria = {};
        this.datosReporte.gastos.forEach(gasto => {
            const categoria = gasto.categoria || 'Sin categoría';
            gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + parseFloat(gasto.monto || 0);
        });

        const ctx = canvas.getContext('2d');
        this.graficos.gastosCategoria = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(gastosPorCategoria),
                datasets: [{
                    data: Object.values(gastosPorCategoria),
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': S/ ' + context.parsed.toLocaleString('es-PE', { minimumFractionDigits: 2 });
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 📅 AGRUPAR DATOS POR MES
     */
    agruparPorMes() {
        const meses = {};
        
        // Procesar ingresos
        this.datosReporte.ingresos.forEach(ingreso => {
            const fecha = new Date(ingreso.fecha || ingreso.fecha_transaccion);
            const mesAnio = fecha.toLocaleDateString('es-PE', { year: 'numeric', month: 'short' });
            
            if (!meses[mesAnio]) {
                meses[mesAnio] = { ingresos: 0, gastos: 0 };
            }
            meses[mesAnio].ingresos += parseFloat(ingreso.monto || 0);
        });
        
        // Procesar gastos
        this.datosReporte.gastos.forEach(gasto => {
            const fecha = new Date(gasto.fecha || gasto.fecha_transaccion);
            const mesAnio = fecha.toLocaleDateString('es-PE', { year: 'numeric', month: 'short' });
            
            if (!meses[mesAnio]) {
                meses[mesAnio] = { ingresos: 0, gastos: 0 };
            }
            meses[mesAnio].gastos += parseFloat(gasto.monto || 0);
        });
        
        return meses;
    }

    /**
     * ⚠️ MOSTRAR ERROR
     */
    mostrarError(mensaje) {
        console.error('❌ Error reportes:', mensaje);
        
        // Actualizar UI con mensaje de error
        const elementoIngresos = document.getElementById('total-ingresos');
        const elementoGastos = document.getElementById('total-gastos');
        const elementoBalance = document.getElementById('balance-neto');
        
        if (elementoIngresos) elementoIngresos.textContent = 'Error';
        if (elementoGastos) elementoGastos.textContent = 'Error';
        if (elementoBalance) elementoBalance.textContent = 'Error';
    }

    /**
     * 📄 EXPORTAR REPORTE
     */
    async exportarReporte(formato) {
        console.log(`📄 Exportando reporte en formato: ${formato}`);
        // Funcionalidad de exportación pendiente
        alert(`Exportación en ${formato} en desarrollo`);
    }
}

// ✅ INSTANCIA GLOBAL
window.reportesModuleHandler = null;

// 🚀 INICIALIZACIÓN AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 DOM loaded - Preparando reportes...');
    
    // Esperar un momento para que otros scripts se carguen
    setTimeout(() => {
        window.reportesModuleHandler = new ReportesModuleHandler();
        window.reportesModuleHandler.init();
    }, 500);
});

console.log('📊 Reportes Module Handler FIXED cargado');
