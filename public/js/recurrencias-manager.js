// ===================================================================
// 🔄 GESTOR DE RECURRENCIAS AUTOMÁTICAS
// ===================================================================
// Descripción: Maneja recurrencias desde el frontend de PlanificaPro
// Autor: Sistema PlanificaPro
// Fecha: 2025-09-10
// ===================================================================

class RecurrenciasManager {
    constructor() {
        this.supabase = window.supabase;
        this.processingInProgress = false;
    }

    /**
     * 🤖 PROCESAR TODAS LAS RECURRENCIAS MANUALMENTE
     */
    async procesarRecurrenciasManual() {
        if (this.processingInProgress) {
            console.log('⏳ Procesamiento ya en curso...');
            return { success: false, message: 'Procesamiento ya en curso' };
        }

        this.processingInProgress = true;

        try {
            console.log('🔄 Iniciando procesamiento manual de recurrencias...');
            
            // Llamar a la función SQL que creamos
            const { data, error } = await this.supabase.rpc('procesar_todas_recurrencias');
            
            if (error) {
                console.error('❌ Error procesando recurrencias:', error);
                throw new Error(error.message);
            }

            console.log('✅ Recurrencias procesadas:', data);
            
            // Mostrar notificación al usuario
            this.mostrarNotificacion(
                `🎉 Procesamiento completado: ${data.total_procesados} transacciones creadas`,
                'success'
            );

            return {
                success: true,
                data: data,
                message: `Procesadas ${data.total_procesados} recurrencias`
            };

        } catch (error) {
            console.error('❌ Error inesperado:', error);
            this.mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
            return { success: false, error: error.message };
        } finally {
            this.processingInProgress = false;
        }
    }

    /**
     * 👀 VER RECURRENCIAS PENDIENTES
     */
    async obtenerRecurrenciasPendientes() {
        try {
            const { data, error } = await this.supabase
                .from('vista_recurrencias_pendientes')
                .select('*')
                .eq('estado', 'PENDIENTE')
                .order('proxima_fecha', { ascending: true });

            if (error) {
                console.error('❌ Error obteniendo recurrencias pendientes:', error);
                throw new Error(error.message);
            }

            console.log('📋 Recurrencias pendientes:', data);
            return data;

        } catch (error) {
            console.error('❌ Error:', error);
            return [];
        }
    }

    /**
     * 📊 OBTENER ESTADÍSTICAS DE RECURRENCIAS
     */
    async obtenerEstadisticasRecurrencias() {
        try {
            // Obtener todas las recurrencias
            const { data, error } = await this.supabase
                .from('vista_recurrencias_pendientes')
                .select('*');

            if (error) throw new Error(error.message);

            const pendientes = data.filter(item => item.estado === 'PENDIENTE');
            const programadas = data.filter(item => item.estado === 'PROGRAMADO');
            
            const ingresosPendientes = pendientes.filter(item => item.tipo === 'ingresos');
            const gastosPendientes = pendientes.filter(item => item.tipo === 'gastos');

            const stats = {
                total: data.length,
                pendientes: pendientes.length,
                programadas: programadas.length,
                ingresos_pendientes: ingresosPendientes.length,
                gastos_pendientes: gastosPendientes.length,
                monto_ingresos_pendientes: ingresosPendientes.reduce((sum, item) => sum + item.monto, 0),
                monto_gastos_pendientes: gastosPendientes.reduce((sum, item) => sum + item.monto, 0)
            };

            console.log('📊 Estadísticas de recurrencias:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }

    /**
     * 🧪 FUNCIÓN DE TESTING
     */
    async testRecurrencias() {
        try {
            console.log('🧪 Ejecutando test de recurrencias...');
            
            const { data, error } = await this.supabase.rpc('test_recurrencias');
            
            if (error) throw new Error(error.message);

            console.log('✅ Test completado:', data);
            this.mostrarNotificacion(`🧪 Test completado: ${JSON.stringify(data)}`, 'info');
            
            return data;

        } catch (error) {
            console.error('❌ Error en test:', error);
            this.mostrarNotificacion(`❌ Error en test: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * 📅 CREAR WIDGET DE RECURRENCIAS PARA EL DASHBOARD
     */
    async crearWidgetRecurrencias() {
        const stats = await this.obtenerEstadisticasRecurrencias();
        if (!stats) return;

        const widget = `
            <div class="bg-white rounded-2xl shadow-lg p-6" data-aos="fade-up">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">🔄 Recurrencias</h3>
                    <button onclick="recurrenciasManager.procesarRecurrenciasManual()" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Procesar Ahora
                    </button>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600">${stats.pendientes}</div>
                        <div class="text-xs text-gray-500">Pendientes</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${stats.programadas}</div>
                        <div class="text-xs text-gray-500">Programadas</div>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <div class="flex justify-between text-sm">
                        <span class="text-green-600">+S/ ${stats.monto_ingresos_pendientes.toFixed(2)}</span>
                        <span class="text-red-600">-S/ ${stats.monto_gastos_pendientes.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;

        return widget;
    }

    /**
     * 🔔 MOSTRAR NOTIFICACIONES
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Usar el sistema de notificaciones existente si está disponible
        if (window.showNotification) {
            window.showNotification(mensaje, tipo);
        } else {
            // Fallback simple
            console.log(`${tipo.toUpperCase()}: ${mensaje}`);
            alert(mensaje);
        }
    }

    /**
     * 🚀 INICIALIZAR MANAGER
     */
    async inicializar() {
        console.log('🚀 RecurrenciasManager inicializado');
        
        // Verificar si hay recurrencias pendientes al cargar
        const pendientes = await this.obtenerRecurrenciasPendientes();
        
        if (pendientes.length > 0) {
            console.log(`⚠️ Hay ${pendientes.length} recurrencias pendientes de procesamiento`);
            
            // Mostrar notificación discreta
            this.mostrarNotificacion(
                `📋 Tienes ${pendientes.length} transacciones recurrentes pendientes`,
                'info'
            );
        }
    }
}

// ===================================================================
// 🌟 FUNCIONES GLOBALES PARA USO EN TEMPLATES
// ===================================================================

/**
 * Procesar recurrencias desde cualquier parte del sistema
 */
window.procesarRecurrencias = async function() {
    if (!window.recurrenciasManager) {
        window.recurrenciasManager = new RecurrenciasManager();
    }
    return await window.recurrenciasManager.procesarRecurrenciasManual();
};

/**
 * Ver recurrencias pendientes
 */
window.verRecurrenciasPendientes = async function() {
    if (!window.recurrenciasManager) {
        window.recurrenciasManager = new RecurrenciasManager();
    }
    const pendientes = await window.recurrenciasManager.obtenerRecurrenciasPendientes();
    console.table(pendientes);
    return pendientes;
};

/**
 * Test de recurrencias
 */
window.testRecurrencias = async function() {
    if (!window.recurrenciasManager) {
        window.recurrenciasManager = new RecurrenciasManager();
    }
    return await window.recurrenciasManager.testRecurrencias();
};

// ===================================================================
// 🔧 AUTO-INICIALIZACIÓN
// ===================================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Esperar a que Supabase esté disponible
    if (window.supabase) {
        window.recurrenciasManager = new RecurrenciasManager();
        await window.recurrenciasManager.inicializar();
    } else {
        console.log('⚠️ Supabase no disponible, RecurrenciasManager no inicializado');
    }
});

// ===================================================================
// 📝 EJEMPLOS DE USO
// ===================================================================

/*
// En la consola del navegador:

// 1. Procesar recurrencias manualmente
await procesarRecurrencias();

// 2. Ver qué recurrencias están pendientes
await verRecurrenciasPendientes();

// 3. Hacer un test
await testRecurrencias();

// 4. Obtener estadísticas
await recurrenciasManager.obtenerEstadisticasRecurrencias();
*/
