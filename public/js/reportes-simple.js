/**
 * 📊 REPORTES SIMPLE - Solo reutiliza datos del dashboard
 * Autor: Asistente
 * Fecha: 10 Sep 2025
 * 
 * SIMPLE: Solo toma datos existentes del dashboard y los muestra
 */

class ReportesSimple {
    constructor() {
        console.log('📊 ReportesSimple inicializado');
    }

    /**
     * 🚀 INICIALIZAR - Súper simple
     */
    init() {
        console.log('📊 Inicializando reportes simple...');
        this.configurarFiltros();
        this.generarReporte();
    }

    /**
     * ⚙️ CONFIGURAR FILTROS BÁSICOS
     */
    configurarFiltros() {
        const periodoSelect = document.getElementById('periodo-select');
        if (periodoSelect) {
            periodoSelect.addEventListener('change', () => {
                this.generarReporte();
            });
        }

        // Configurar fechas por defecto
        const fechaDesde = document.getElementById('fecha-desde');
        const fechaHasta = document.getElementById('fecha-hasta');
        
        if (fechaDesde && fechaHasta) {
            const hoy = new Date();
            const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            
            fechaDesde.value = primerDiaMes.toISOString().split('T')[0];
            fechaHasta.value = hoy.toISOString().split('T')[0];
        }
    }

    /**
     * 📊 GENERAR REPORTE - Reutiliza datos del dashboard
     */
    async generarReporte() {
        console.log('📊 Generando reporte simple...');

        try {
            // Si el dashboard ya tiene datos, los reutilizamos
            if (window.dashboardHandler && window.dashboardHandler.datosActuales) {
                console.log('✅ Reutilizando datos del dashboard');
                this.mostrarDatos(window.dashboardHandler.datosActuales);
                return;
            }

            // Si no, obtenemos datos básicos
            await this.obtenerDatosBasicos();

        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            this.mostrarError();
        }
    }

    /**
     * 📡 OBTENER DATOS BÁSICOS - Usando APIs reales
     */
    async obtenerDatosBasicos() {
        console.log('📡 Obteniendo datos de APIs reales...');

        try {
            // URLs de las APIs que funcionan
            const baseUrl = 'http://localhost:3002';
            
            const [ingresosRes, gastosRes, creditosRes] = await Promise.all([
                fetch(`${baseUrl}/api/ingresos`).catch(() => null),
                fetch(`${baseUrl}/api/gastos`).catch(() => null),
                fetch(`${baseUrl}/api/creditos`).catch(() => null)
            ]);

            // Procesar respuestas
            const ingresos = ingresosRes && ingresosRes.ok ? await ingresosRes.json() : [];
            const gastos = gastosRes && gastosRes.ok ? await gastosRes.json() : [];
            const creditos = creditosRes && creditosRes.ok ? await creditosRes.json() : [];

            console.log('📊 Datos obtenidos:', {
                ingresos: ingresos.length,
                gastos: gastos.length,
                creditos: creditos.length
            });

            const datosCompletos = {
                ingresos: ingresos || [],
                gastos: gastos || [],
                creditos: creditos || []
            };

            this.mostrarDatos(datosCompletos);

        } catch (error) {
            console.error('❌ Error obteniendo datos:', error);
            
            // Datos de respaldo si falla
            const datosRespaldo = {
                ingresos: [
                    { descripcion: 'Datos no disponibles', monto: 0, fecha: new Date().toISOString().split('T')[0] }
                ],
                gastos: [
                    { descripcion: 'Datos no disponibles', monto: 0, fecha: new Date().toISOString().split('T')[0] }
                ],
                creditos: [
                    { descripcion: 'Datos no disponibles', monto: 0, tasa: 0 }
                ]
            };

            this.mostrarDatos(datosRespaldo);
        }
    }

    /**
     * 📊 MOSTRAR DATOS - Simple y directo
     */
    mostrarDatos(datos) {
        console.log('📊 Mostrando datos en reportes...');

        // Calcular totales
        const totalIngresos = datos.ingresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalGastos = datos.gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalCreditos = datos.creditos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const balance = totalIngresos - totalGastos;

        console.log('💰 Totales calculados:', {
            ingresos: totalIngresos,
            gastos: totalGastos,
            creditos: totalCreditos,
            balance: balance
        });

        // Actualizar UI
        this.actualizarTarjetas(totalIngresos, totalGastos, totalCreditos, balance);
        this.mostrarTablas(datos);
        
        // Ocultar loading y mostrar éxito
        this.ocultarLoading();
        this.mostrarExito();
    }

    /**
     * 🎯 ACTUALIZAR TARJETAS - Directo
     */
    actualizarTarjetas(ingresos, gastos, creditos, balance) {
        const formatear = (monto) => `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

        // Actualizar elementos
        const elementos = [
            { id: 'total-ingresos', valor: formatear(ingresos) },
            { id: 'total-gastos', valor: formatear(gastos) },
            { id: 'total-creditos', valor: formatear(creditos) },
            { id: 'balance-neto', valor: formatear(balance) }
        ];

        elementos.forEach(elem => {
            const elemento = document.getElementById(elem.id);
            if (elemento) {
                elemento.textContent = elem.valor;
                console.log(`✅ ${elem.id}: ${elem.valor}`);
            }
        });

        // Color del balance
        const balanceElement = document.getElementById('balance-neto');
        if (balanceElement) {
            balanceElement.className = `text-xl font-bold ${balance >= 0 ? 'text-green-800' : 'text-red-800'}`;
        }
    }

    /**
     * 📋 MOSTRAR TABLAS - Llenar tablas con datos
     */
    mostrarTablas(datos) {
        console.log('📋 Llenando tablas con datos...');
        
        this.llenarTablaIngresos(datos.ingresos || []);
        this.llenarTablaGastos(datos.gastos || []);
        this.llenarTablaCreditos(datos.creditos || []);
    }

    /**
     * 💚 LLENAR TABLA INGRESOS
     */
    llenarTablaIngresos(ingresos) {
        const tbody = document.getElementById('ingresos-body');
        if (!tbody) return;

        if (ingresos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" class="px-3 py-4 text-center text-gray-500">
                        No hay ingresos registrados
                    </td>
                </tr>
            `;
            return;
        }

        const filas = ingresos.map(ingreso => {
            const monto = parseFloat(ingreso.monto || 0);
            const montoFormateado = `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            
            return `
                <tr class="border-b border-gray-100 hover:bg-green-50">
                    <td class="px-3 py-2 text-gray-800">${ingreso.descripcion || 'Sin descripción'}</td>
                    <td class="px-3 py-2 text-right font-medium text-green-700">${montoFormateado}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = filas;
        console.log(`✅ Tabla ingresos llenada con ${ingresos.length} elementos`);
    }

    /**
     * ❤️ LLENAR TABLA GASTOS
     */
    llenarTablaGastos(gastos) {
        const tbody = document.getElementById('gastos-body');
        if (!tbody) return;

        if (gastos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" class="px-3 py-4 text-center text-gray-500">
                        No hay gastos registrados
                    </td>
                </tr>
            `;
            return;
        }

        const filas = gastos.map(gasto => {
            const monto = parseFloat(gasto.monto || 0);
            const montoFormateado = `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            
            return `
                <tr class="border-b border-gray-100 hover:bg-red-50">
                    <td class="px-3 py-2 text-gray-800">${gasto.descripcion || 'Sin descripción'}</td>
                    <td class="px-3 py-2 text-right font-medium text-red-700">${montoFormateado}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = filas;
        console.log(`✅ Tabla gastos llenada con ${gastos.length} elementos`);
    }

    /**
     * 💙 LLENAR TABLA CRÉDITOS
     */
    llenarTablaCreditos(creditos) {
        const tbody = document.getElementById('creditos-body');
        if (!tbody) return;

        if (creditos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" class="px-3 py-4 text-center text-gray-500">
                        No hay créditos registrados
                    </td>
                </tr>
            `;
            return;
        }

        const filas = creditos.map(credito => {
            const monto = parseFloat(credito.monto || 0);
            const montoFormateado = `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            
            return `
                <tr class="border-b border-gray-100 hover:bg-blue-50">
                    <td class="px-3 py-2 text-gray-800">${credito.descripcion || 'Sin descripción'}</td>
                    <td class="px-3 py-2 text-right font-medium text-blue-700">${montoFormateado}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = filas;
        console.log(`✅ Tabla créditos llenada con ${creditos.length} elementos`);
    }

    /**
     * ⚠️ MOSTRAR ERROR
     */
    mostrarError() {
        console.log('❌ Error cargando datos - mostrando valores por defecto');
        
        const elementos = ['total-ingresos', 'total-gastos', 'total-creditos', 'balance-neto'];
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = 'S/ 0.00';
            }
        });
        
        this.ocultarLoading();
    }

    /**
     * 🔄 OCULTAR LOADING
     */
    ocultarLoading() {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }

    /**
     * ✅ MOSTRAR ÉXITO
     */
    mostrarExito() {
        const successState = document.getElementById('success-state');
        if (successState) {
            successState.classList.remove('hidden');
            
            // Ocultar después de 3 segundos
            setTimeout(() => {
                successState.classList.add('hidden');
            }, 3000);
        }
    }
}

// ✅ INSTANCIA GLOBAL SIMPLE
window.reportesSimple = null;

// 🚀 AUTO-INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 DOM cargado - inicializando reportes simple...');
    
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        window.reportesSimple = new ReportesSimple();
        window.reportesSimple.init();
    }, 1000);
});

console.log('📊 ReportesSimple cargado - VERSIÓN SIMPLE');
