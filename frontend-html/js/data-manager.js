/**
 * 💾 DataManager - Gestor de Datos y CRUD Operations
 * Equivalente a: API Services + Data Layer
 * 
 * Características principales:
 * ✅ CRUD completo para todas las entidades
 * ✅ Validaciones de datos
 * ✅ Cache inteligente
 * ✅ Manejo de errores
 * ✅ Optimizaciones de queries
 * ✅ Sincronización con AppState
 */

class DataManager {
    constructor(supabase, appState) {
        console.log('💾 Inicializando DataManager...');
        
        this.supabase = supabase;
        this.appState = appState;
        
        // Cache de datos
        this.cache = new Map();
        this.lastSync = new Map();
        
        // Configuraciones
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        
        this.init();
    }
    
    async init() {
        console.log('✅ DataManager inicializado');
    }
    
    /**
     * 💰 INGRESOS - CRUD Operations
     */
    async getIngresos(userId, forceRefresh = false) {
        try {
            const cacheKey = `ingresos_${userId}`;
            
            // Check cache first
            if (!forceRefresh && this.isCacheValid(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            console.log('🔄 Cargando ingresos...');
            this.appState.setDashboardLoading('ingresos', true);
            
            const { data, error } = await this.supabase
                .from('ingresos')
                .select(`
                    id,
                    descripcion,
                    monto,
                    fecha,
                    categoria,
                    tipo,
                    usuario_id,
                    created_at,
                    updated_at
                `)
                .eq('usuario_id', userId)
                .order('fecha', { ascending: false })
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Update cache
            this.updateCache(cacheKey, data || []);
            
            // Update app state
            this.appState.setDashboardData('ingresos', data || []);
            this.appState.setDashboardLoading('ingresos', false);
            
            console.log(`✅ ${data?.length || 0} ingresos cargados`);
            return data || [];
            
        } catch (error) {
            console.error('❌ Error cargando ingresos:', error);
            this.appState.setDashboardError('ingresos', error.message);
            this.appState.setDashboardLoading('ingresos', false);
            throw error;
        }
    }
    
    async addIngreso(userId, ingresoData) {
        try {
            console.log('➕ Agregando ingreso:', ingresoData);
            
            // Validaciones
            this.validateIngresoData(ingresoData);
            
            const newIngreso = {
                ...ingresoData,
                usuario_id: userId,
                monto: parseFloat(ingresoData.monto),
                fecha: ingresoData.fecha || new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('ingresos')
                .insert([newIngreso])
                .select()
                .single();
            
            if (error) throw error;
            
            // Invalidar cache y recargar
            this.invalidateCache(`ingresos_${userId}`);
            await this.getIngresos(userId, true);
            
            // Actualizar balance
            await this.updateBalance(userId);
            
            this.appState.addNotification('success', `💰 Ingreso agregado: ${this.formatCurrency(data.monto)}`);
            console.log('✅ Ingreso agregado exitosamente');
            
            return data;
            
        } catch (error) {
            console.error('❌ Error agregando ingreso:', error);
            this.appState.addNotification('error', `Error agregando ingreso: ${error.message}`);
            throw error;
        }
    }
    
    async updateIngreso(userId, ingresoId, changes) {
        try {
            console.log(`✏️ Actualizando ingreso ${ingresoId}:`, changes);
            
            this.validateIngresoData(changes);
            
            const updateData = {
                ...changes,
                monto: parseFloat(changes.monto),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('ingresos')
                .update(updateData)
                .eq('id', ingresoId)
                .eq('usuario_id', userId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Invalidar cache y recargar
            this.invalidateCache(`ingresos_${userId}`);
            await this.getIngresos(userId, true);
            await this.updateBalance(userId);
            
            this.appState.addNotification('success', '✅ Ingreso actualizado');
            console.log('✅ Ingreso actualizado exitosamente');
            
            return data;
            
        } catch (error) {
            console.error('❌ Error actualizando ingreso:', error);
            this.appState.addNotification('error', `Error actualizando: ${error.message}`);
            throw error;
        }
    }
    
    async deleteIngreso(userId, ingresoId) {
        try {
            console.log(`🗑️ Eliminando ingreso ${ingresoId}`);
            
            const { error } = await this.supabase
                .from('ingresos')
                .delete()
                .eq('id', ingresoId)
                .eq('usuario_id', userId);
            
            if (error) throw error;
            
            // Invalidar cache y recargar
            this.invalidateCache(`ingresos_${userId}`);
            await this.getIngresos(userId, true);
            await this.updateBalance(userId);
            
            this.appState.addNotification('success', '🗑️ Ingreso eliminado');
            console.log('✅ Ingreso eliminado exitosamente');
            
        } catch (error) {
            console.error('❌ Error eliminando ingreso:', error);
            this.appState.addNotification('error', `Error eliminando: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 💸 GASTOS - CRUD Operations
     */
    async getGastos(userId, forceRefresh = false) {
        try {
            const cacheKey = `gastos_${userId}`;
            
            if (!forceRefresh && this.isCacheValid(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            console.log('🔄 Cargando gastos...');
            this.appState.setDashboardLoading('gastos', true);
            
            const { data, error } = await this.supabase
                .from('gastos')
                .select(`
                    id,
                    descripcion,
                    monto,
                    fecha,
                    categoria,
                    tipo,
                    usuario_id,
                    created_at,
                    updated_at
                `)
                .eq('usuario_id', userId)
                .order('fecha', { ascending: false })
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.updateCache(cacheKey, data || []);
            this.appState.setDashboardData('gastos', data || []);
            this.appState.setDashboardLoading('gastos', false);
            
            console.log(`✅ ${data?.length || 0} gastos cargados`);
            return data || [];
            
        } catch (error) {
            console.error('❌ Error cargando gastos:', error);
            this.appState.setDashboardError('gastos', error.message);
            this.appState.setDashboardLoading('gastos', false);
            throw error;
        }
    }
    
    async addGasto(userId, gastoData) {
        try {
            console.log('➕ Agregando gasto:', gastoData);
            
            this.validateGastoData(gastoData);
            
            const newGasto = {
                ...gastoData,
                usuario_id: userId,
                monto: parseFloat(gastoData.monto),
                fecha: gastoData.fecha || new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('gastos')
                .insert([newGasto])
                .select()
                .single();
            
            if (error) throw error;
            
            this.invalidateCache(`gastos_${userId}`);
            await this.getGastos(userId, true);
            await this.updateBalance(userId);
            
            this.appState.addNotification('success', `💸 Gasto agregado: ${this.formatCurrency(data.monto)}`);
            console.log('✅ Gasto agregado exitosamente');
            
            return data;
            
        } catch (error) {
            console.error('❌ Error agregando gasto:', error);
            this.appState.addNotification('error', `Error agregando gasto: ${error.message}`);
            throw error;
        }
    }
    
    async updateGasto(userId, gastoId, changes) {
        try {
            console.log(`✏️ Actualizando gasto ${gastoId}:`, changes);
            
            this.validateGastoData(changes);
            
            const updateData = {
                ...changes,
                monto: parseFloat(changes.monto),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('gastos')
                .update(updateData)
                .eq('id', gastoId)
                .eq('usuario_id', userId)
                .select()
                .single();
            
            if (error) throw error;
            
            this.invalidateCache(`gastos_${userId}`);
            await this.getGastos(userId, true);
            await this.updateBalance(userId);
            
            this.appState.addNotification('success', '✅ Gasto actualizado');
            console.log('✅ Gasto actualizado exitosamente');
            
            return data;
            
        } catch (error) {
            console.error('❌ Error actualizando gasto:', error);
            this.appState.addNotification('error', `Error actualizando: ${error.message}`);
            throw error;
        }
    }
    
    async deleteGasto(userId, gastoId) {
        try {
            console.log(`🗑️ Eliminando gasto ${gastoId}`);
            
            const { error } = await this.supabase
                .from('gastos')
                .delete()
                .eq('id', gastoId)
                .eq('usuario_id', userId);
            
            if (error) throw error;
            
            this.invalidateCache(`gastos_${userId}`);
            await this.getGastos(userId, true);
            await this.updateBalance(userId);
            
            this.appState.addNotification('success', '🗑️ Gasto eliminado');
            console.log('✅ Gasto eliminado exitosamente');
            
        } catch (error) {
            console.error('❌ Error eliminando gasto:', error);
            this.appState.addNotification('error', `Error eliminando: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 📊 RESUMEN Y BALANCE
     */
    async getResumen(userId, forceRefresh = false) {
        try {
            const cacheKey = `resumen_${userId}`;
            
            if (!forceRefresh && this.isCacheValid(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            console.log('🔄 Cargando resumen...');
            this.appState.setDashboardLoading('resumen', true);
            
            // Cargar datos en paralelo
            const [ingresos, gastos] = await Promise.all([
                this.getIngresos(userId, forceRefresh),
                this.getGastos(userId, forceRefresh)
            ]);
            
            // Calcular estadísticas
            const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto || 0), 0);
            const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);
            const balance = totalIngresos - totalGastos;
            
            // Transacciones recientes (últimas 10)
            const todasTransacciones = [
                ...ingresos.map(i => ({ ...i, tipo: 'ingreso' })),
                ...gastos.map(g => ({ ...g, tipo: 'gasto' }))
            ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10);
            
            // Gastos por categoría
            const gastosPorCategoria = gastos.reduce((acc, gasto) => {
                const categoria = gasto.categoria || 'Sin categoría';
                acc[categoria] = (acc[categoria] || 0) + parseFloat(gasto.monto || 0);
                return acc;
            }, {});
            
            // Ingresos por categoría
            const ingresosPorCategoria = ingresos.reduce((acc, ingreso) => {
                const categoria = ingreso.categoria || 'Sin categoría';
                acc[categoria] = (acc[categoria] || 0) + parseFloat(ingreso.monto || 0);
                return acc;
            }, {});
            
            const resumen = {
                totalIngresos,
                totalGastos,
                balance,
                transaccionesCount: ingresos.length + gastos.length,
                ingresosCount: ingresos.length,
                gastosCount: gastos.length,
                transaccionesRecientes: todasTransacciones,
                gastosPorCategoria,
                ingresosPorCategoria,
                promedioGastoMensual: totalGastos > 0 ? totalGastos / Math.max(1, gastos.length) : 0,
                promedioIngresoMensual: totalIngresos > 0 ? totalIngresos / Math.max(1, ingresos.length) : 0
            };
            
            this.updateCache(cacheKey, resumen);
            this.appState.setDashboardData('resumen', resumen);
            this.appState.setDashboardLoading('resumen', false);
            
            console.log('✅ Resumen calculado:', resumen);
            return resumen;
            
        } catch (error) {
            console.error('❌ Error cargando resumen:', error);
            this.appState.setDashboardError('resumen', error.message);
            this.appState.setDashboardLoading('resumen', false);
            throw error;
        }
    }
    
    async updateBalance(userId) {
        try {
            // Esto podría ser útil para actualizar un campo balance en la tabla users
            const resumen = await this.getResumen(userId, true);
            console.log(`💰 Balance actualizado: ${this.formatCurrency(resumen.balance)}`);
            return resumen.balance;
        } catch (error) {
            console.error('❌ Error actualizando balance:', error);
        }
    }
    
    /**
     * 🏷️ CATEGORÍAS
     */
    getCategorias() {
        // Por ahora categorías fijas, después se pueden hacer dinámicas
        return {
            ingresos: [
                'Salario',
                'Freelance',
                'Inversiones',
                'Ventas',
                'Bonos',
                'Otros'
            ],
            gastos: [
                'Alimentación',
                'Transporte',
                'Vivienda',
                'Entretenimiento',
                'Salud',
                'Educación',
                'Servicios',
                'Ropa',
                'Otros'
            ]
        };
    }
    
    /**
     * 🛠️ VALIDACIONES
     */
    validateIngresoData(data) {
        if (!data.descripcion || data.descripcion.trim().length < 3) {
            throw new Error('La descripción debe tener al menos 3 caracteres');
        }
        
        if (!data.monto || isNaN(parseFloat(data.monto)) || parseFloat(data.monto) <= 0) {
            throw new Error('El monto debe ser un número positivo');
        }
        
        if (parseFloat(data.monto) > 1000000) {
            throw new Error('El monto no puede ser mayor a 1,000,000');
        }
        
        if (data.fecha && new Date(data.fecha) > new Date()) {
            throw new Error('La fecha no puede ser futura');
        }
    }
    
    validateGastoData(data) {
        if (!data.descripcion || data.descripcion.trim().length < 3) {
            throw new Error('La descripción debe tener al menos 3 caracteres');
        }
        
        if (!data.monto || isNaN(parseFloat(data.monto)) || parseFloat(data.monto) <= 0) {
            throw new Error('El monto debe ser un número positivo');
        }
        
        if (parseFloat(data.monto) > 1000000) {
            throw new Error('El monto no puede ser mayor a 1,000,000');
        }
        
        if (data.fecha && new Date(data.fecha) > new Date()) {
            throw new Error('La fecha no puede ser futura');
        }
    }
    
    /**
     * 🔄 CACHE MANAGEMENT
     */
    isCacheValid(key) {
        if (!this.cache.has(key) || !this.lastSync.has(key)) {
            return false;
        }
        
        const lastUpdate = this.lastSync.get(key);
        return (Date.now() - lastUpdate) < this.cacheTimeout;
    }
    
    updateCache(key, data) {
        this.cache.set(key, data);
        this.lastSync.set(key, Date.now());
    }
    
    invalidateCache(key) {
        this.cache.delete(key);
        this.lastSync.delete(key);
        console.log(`🗑️ Cache invalidado: ${key}`);
    }
    
    clearAllCache() {
        this.cache.clear();
        this.lastSync.clear();
        console.log('🧹 Todo el cache limpiado');
    }
    
    /**
     * 🛠️ UTILIDADES
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * 📊 REPORTES (futuro)
     */
    async getReportes(userId) {
        try {
            const resumen = await this.getResumen(userId);
            
            return {
                balanceMensual: resumen.balance,
                tendencia: resumen.totalIngresos > resumen.totalGastos ? 'positiva' : 'negativa',
                recomendaciones: this.generarRecomendaciones(resumen)
            };
        } catch (error) {
            console.error('❌ Error generando reportes:', error);
            throw error;
        }
    }
    
    generarRecomendaciones(resumen) {
        const recomendaciones = [];
        
        if (resumen.balance < 0) {
            recomendaciones.push({
                tipo: 'warning',
                mensaje: '⚠️ Tu balance es negativo. Considera reducir gastos o aumentar ingresos.'
            });
        }
        
        if (resumen.totalGastos > resumen.totalIngresos * 0.8) {
            recomendaciones.push({
                tipo: 'info',
                mensaje: '💡 Estás gastando más del 80% de tus ingresos. Intenta ahorrar más.'
            });
        }
        
        if (resumen.balance > resumen.totalIngresos * 0.3) {
            recomendaciones.push({
                tipo: 'success',
                mensaje: '✅ ¡Excelente! Estás ahorrando más del 30% de tus ingresos.'
            });
        }
        
        return recomendaciones;
    }
}

// Export global
window.DataManager = DataManager;

console.log('📦 DataManager módulo cargado');
