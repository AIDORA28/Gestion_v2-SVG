/*
🧠 SISTEMA DE SUGERENCIAS INTELIGENTES - GEMINI QUISPE
Análisis predictivo y recomendaciones personalizadas basadas en datos reales
*/

class SugerenciasInteligentes {
    constructor() {
        this.supabaseConfig = {
            url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
        };
        
        this.categoriaEmojis = {
            'Alimentación': '🍽️',
            'Transporte': '🚗',
            'Vivienda': '🏠',
            'Salud': '🏥',
            'Entretenimiento': '🎬',
            'Educación': '📚',
            'Tecnología': '💻',
            'Ropa': '👕',
            'Servicios': '🔧',
            'Otros': '📝'
        };

        console.log('🧠 Sistema de Sugerencias Inteligentes inicializado - Gemini Quispe');
    }

    // 🔑 Obtener datos del usuario logueado
    getUserData() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const token = localStorage.getItem('supabase_access_token');
            return {
                id: currentUser.id,
                nombre: currentUser.nombre || 'Usuario',
                token: token
            };
        } catch (error) {
            console.error('Error obteniendo datos de usuario:', error);
            return null;
        }
    }

    // 🌐 Consultar datos desde Supabase
    async querySupabase(table, filters = '') {
        const userData = this.getUserData();
        if (!userData || !userData.token) {
            throw new Error('Usuario no autenticado');
        }

        const url = `${this.supabaseConfig.url}/rest/v1/${table}?usuario_id=eq.${userData.id}${filters}&order=created_at.desc`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': this.supabaseConfig.anonKey,
                'Authorization': `Bearer ${userData.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error consultando ${table}: ${response.status}`);
        }

        return await response.json();
    }

    // 📊 Análisis de patrones de gastos
    async analizarPatronesGastos() {
        try {
            console.log('🔍 Analizando patrones de gastos...');
            
            // Obtener gastos de los últimos 90 días
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 90);
            const fechaFiltro = fechaLimite.toISOString().split('T')[0];
            
            const gastos = await this.querySupabase('gastos', `&fecha=gte.${fechaFiltro}`);
            
            if (!gastos || gastos.length === 0) {
                return {
                    totalGastos: 0,
                    promedioMensual: 0,
                    categoriaTopGasto: null,
                    tendencia: 'sin-datos',
                    gastosRecientes: []
                };
            }

            // Análisis por categorías
            const gastosPorCategoria = {};
            const gastosPorMes = {};
            let totalGastos = 0;

            gastos.forEach(gasto => {
                const categoria = gasto.categoria || 'Otros';
                const mes = gasto.fecha ? gasto.fecha.substring(0, 7) : 'sin-fecha';
                const monto = parseFloat(gasto.monto) || 0;

                // Por categoría
                gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;
                
                // Por mes
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
            const gastosRecientes = gastos.filter(g => 
                g.fecha && new Date(g.fecha) >= fechaReciente
            );

            return {
                totalGastos,
                promedioMensual: totalGastos / 3, // 90 días = ~3 meses
                categoriaTopGasto,
                tendencia,
                gastosRecientes,
                gastosPorCategoria,
                totalRegistros: gastos.length
            };

        } catch (error) {
            console.error('Error analizando patrones:', error);
            return null;
        }
    }

    // 💰 Análisis de ingresos
    async analizarPatronesIngresos() {
        try {
            console.log('🔍 Analizando patrones de ingresos...');
            
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 90);
            const fechaFiltro = fechaLimite.toISOString().split('T')[0];
            
            const ingresos = await this.querySupabase('ingresos', `&fecha=gte.${fechaFiltro}`);
            
            if (!ingresos || ingresos.length === 0) {
                return {
                    totalIngresos: 0,
                    promedioMensual: 0,
                    fuentePrincipal: null,
                    tendencia: 'sin-datos'
                };
            }

            let totalIngresos = 0;
            const ingresosPorCategoria = {};

            ingresos.forEach(ingreso => {
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
                totalRegistros: ingresos.length
            };

        } catch (error) {
            console.error('Error analizando ingresos:', error);
            return null;
        }
    }

    // 🎯 Generar sugerencias personalizadas
    async generarSugerencias() {
        try {
            console.log('🧠 Generando sugerencias inteligentes...');
            
            const [patronesGastos, patronesIngresos] = await Promise.all([
                this.analizarPatronesGastos(),
                this.analizarPatronesIngresos()
            ]);

            const sugerencias = [];
            const userData = this.getUserData();

            // Sugerencia 1: Balance general
            if (patronesGastos && patronesIngresos) {
                const balance = patronesIngresos.totalIngresos - patronesGastos.totalGastos;
                const porcentajeAhorro = patronesIngresos.totalIngresos > 0 
                    ? (balance / patronesIngresos.totalIngresos) * 100 
                    : 0;

                if (porcentajeAhorro > 20) {
                    sugerencias.push({
                        tipo: 'felicitacion',
                        icono: '🎉',
                        titulo: '¡Excelente manejo financiero!',
                        descripcion: `Estás ahorrando ${porcentajeAhorro.toFixed(1)}% de tus ingresos. ¡Sigue así!`,
                        accion: 'Considera invertir tus ahorros para hacerlos crecer.'
                    });
                } else if (porcentajeAhorro < 5) {
                    sugerencias.push({
                        tipo: 'alerta',
                        icono: '⚠️',
                        titulo: 'Oportunidad de ahorro',
                        descripcion: `Solo estás ahorrando ${porcentajeAhorro.toFixed(1)}% de tus ingresos.`,
                        accion: 'Revisa tus gastos y encuentra áreas donde puedas reducir costos.'
                    });
                }
            }

            // Sugerencia 2: Categoría con mayor gasto
            if (patronesGastos && patronesGastos.categoriaTopGasto) {
                const [categoria, monto] = patronesGastos.categoriaTopGasto;
                const emoji = this.categoriaEmojis[categoria] || '💸';
                const porcentaje = ((monto / patronesGastos.totalGastos) * 100).toFixed(1);

                sugerencias.push({
                    tipo: 'analisis',
                    icono: emoji,
                    titulo: `${categoria} es tu mayor gasto`,
                    descripcion: `Representan ${porcentaje}% de tus gastos ($${monto.toFixed(2)}).`,
                    accion: this.getSugerenciaCategoria(categoria)
                });
            }

            // Sugerencia 3: Tendencia de gastos
            if (patronesGastos && patronesGastos.tendencia) {
                if (patronesGastos.tendencia === 'aumentando') {
                    sugerencias.push({
                        tipo: 'advertencia',
                        icono: '📈',
                        titulo: 'Tus gastos están aumentando',
                        descripcion: 'Se detectó un incremento en tus gastos mensuales.',
                        accion: 'Revisa tus gastos recientes y establece un presupuesto mensual.'
                    });
                } else if (patronesGastos.tendencia === 'disminuyendo') {
                    sugerencias.push({
                        tipo: 'felicitacion',
                        icono: '📉',
                        titulo: '¡Reduciendo gastos exitosamente!',
                        descripcion: 'Has logrado disminuir tus gastos mensuales.',
                        accion: 'Mantén estos buenos hábitos y considera aumentar tus ahorros.'
                    });
                }
            }

            // Sugerencia 4: Gastos recientes inusuales
            if (patronesGastos && patronesGastos.gastosRecientes.length > 0) {
                const gastoAlto = patronesGastos.gastosRecientes.find(g => 
                    g.monto > (patronesGastos.promedioMensual / 10)
                );

                if (gastoAlto) {
                    sugerencias.push({
                        tipo: 'revision',
                        icono: '🔍',
                        titulo: 'Gasto reciente significativo',
                        descripcion: `Se registró un gasto de $${gastoAlto.monto} en ${gastoAlto.categoria || 'Otros'}.`,
                        accion: 'Verifica si este gasto está dentro de tu presupuesto mensual.'
                    });
                }
            }

            // Sugerencia 5: Diversificación de ingresos
            if (patronesIngresos && patronesIngresos.fuentePrincipal) {
                const [fuente, monto] = patronesIngresos.fuentePrincipal;
                const porcentaje = ((monto / patronesIngresos.totalIngresos) * 100);

                if (porcentaje > 80) {
                    sugerencias.push({
                        tipo: 'oportunidad',
                        icono: '💡',
                        titulo: 'Diversifica tus ingresos',
                        descripcion: `${porcentaje.toFixed(1)}% de tus ingresos vienen de ${fuente}.`,
                        accion: 'Considera desarrollar fuentes adicionales de ingresos para mayor estabilidad.'
                    });
                }
            }

            // Sugerencia por defecto si no hay datos suficientes
            if (sugerencias.length === 0) {
                sugerencias.push({
                    tipo: 'bienvenida',
                    icono: '🚀',
                    titulo: `¡Bienvenido ${userData?.nombre || 'Usuario'}!`,
                    descripcion: 'Comienza registrando tus gastos e ingresos para recibir sugerencias personalizadas.',
                    accion: 'Registra al menos 5 transacciones para obtener análisis inteligentes.'
                });
            }

            return sugerencias;

        } catch (error) {
            console.error('Error generando sugerencias:', error);
            return [{
                tipo: 'error',
                icono: '⚠️',
                titulo: 'Error cargando sugerencias',
                descripcion: 'No se pudieron cargar las sugerencias inteligentes.',
                accion: 'Verifica tu conexión e intenta nuevamente.'
            }];
        }
    }

    // 🎯 Sugerencias específicas por categoría
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

    // 🎨 Renderizar sugerencias en el dashboard
    async renderizarSugerencias(containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Contenedor de sugerencias no encontrado');
                return;
            }

            // Mostrar loading
            container.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="ml-3 text-gray-600">Analizando tus datos...</span>
                </div>
            `;

            const sugerencias = await this.generarSugerencias();
            
            // Renderizar sugerencias
            const sugerenciasHTML = sugerencias.map(sugerencia => `
                <div class="bg-white rounded-lg shadow-md border-l-4 ${this.getBorderColor(sugerencia.tipo)} p-6 hover:shadow-lg transition-shadow">
                    <div class="flex items-start space-x-4">
                        <div class="text-3xl">${sugerencia.icono}</div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">${sugerencia.titulo}</h3>
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
                        <h2 class="text-2xl font-bold mb-2">🧠 Sugerencias Inteligentes</h2>
                        <p class="opacity-90">Análisis personalizado basado en tus datos financieros</p>
                    </div>
                    <div class="space-y-4">
                        ${sugerenciasHTML}
                    </div>
                    <div class="text-center">
                        <button onclick="window.sugerenciasIA.renderizarSugerencias('sugerencias-container')" 
                                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            🔄 Actualizar Sugerencias
                        </button>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error renderizando sugerencias:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div class="text-red-600 text-4xl mb-4">⚠️</div>
                        <h3 class="text-lg font-semibold text-red-800 mb-2">Error cargando sugerencias</h3>
                        <p class="text-red-600">No se pudieron cargar las sugerencias inteligentes. Verifica tu conexión.</p>
                    </div>
                `;
            }
        }
    }

    // 🎨 Obtener color de borde según tipo de sugerencia
    getBorderColor(tipo) {
        const colores = {
            'felicitacion': 'border-green-500',
            'alerta': 'border-yellow-500',
            'advertencia': 'border-red-500',
            'analisis': 'border-blue-500',
            'oportunidad': 'border-purple-500',
            'revision': 'border-orange-500',
            'bienvenida': 'border-indigo-500',
            'error': 'border-red-500'
        };
        return colores[tipo] || 'border-gray-500';
    }
}

// Instancia global
window.sugerenciasIA = new SugerenciasInteligentes();

// Auto-inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧠 Sistema de Sugerencias Inteligentes listo - Gemini Quispe');
});
