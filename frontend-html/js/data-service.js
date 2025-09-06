// js/data-service.js - Servicios de datos (equivale a React Query + API calls)

class DataService {
    constructor() {
        this.cache = new Map();
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();
        console.log('📊 DataService inicializado');
    }
    
    // Setup de listeners de red
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Conexión restaurada');
            window.appState.showNotification('Conexión restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ Sin conexión');
            window.appState.showNotification('Sin conexión a internet', 'warning');
        });
    }
    
    // Método base para queries con cache
    async query(key, queryFn, useCache = true) {
        try {
            // Verificar cache si está habilitado
            if (useCache && this.cache.has(key)) {
                const cached = this.cache.get(key);
                const now = Date.now();
                const cacheAge = now - cached.timestamp;
                
                // Cache válido por 5 minutos
                if (cacheAge < 5 * 60 * 1000) {
                    console.log(`💾 Cache hit: ${key}`);
                    return cached.data;
                }
            }
            
            // Verificar conexión
            if (!this.isOnline) {
                throw new Error('Sin conexión a internet');
            }
            
            // Ejecutar query
            console.log(`🔍 Ejecutando query: ${key}`);
            const data = await queryFn();
            
            // Guardar en cache
            if (useCache) {
                this.cache.set(key, {
                    data,
                    timestamp: Date.now()
                });
            }
            
            return data;
            
        } catch (error) {
            console.error(`❌ Error en query ${key}:`, error);
            
            // Intentar devolver cache aunque sea viejo si hay error
            if (useCache && this.cache.has(key)) {
                console.log(`⚠️ Usando cache viejo para: ${key}`);
                return this.cache.get(key).data;
            }
            
            throw error;
        }
    }
    
    // Invalidar cache
    invalidateCache(pattern = null) {
        if (pattern) {
            // Invalidar keys que coincidan con el patrón
            const keys = Array.from(this.cache.keys());
            keys.forEach(key => {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                    console.log(`🗑️ Cache invalidado: ${key}`);
                }
            });
        } else {
            // Invalidar todo el cache
            this.cache.clear();
            console.log('🗑️ Todo el cache invalidado');
        }
    }
    
    // ===== INGRESOS =====
    
    async getIngresos(userId) {
        return this.query(`ingresos-${userId}`, async () => {
            const { data, error } = await window.supabaseClient
                .from('ingresos')
                .select('*')
                .eq('usuario_id', userId)
                .order('fecha', { ascending: false });
                
            if (error) throw error;
            return data || [];
        });
    }
    
    async createIngreso(ingresoData) {
        const user = window.appState.getState('user');
        if (!user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await window.supabaseClient
            .from('ingresos')
            .insert([{
                ...ingresoData,
                usuario_id: user.id,
                monto: parseFloat(ingresoData.monto),
                fecha: ingresoData.fecha || new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // Invalidar cache de ingresos
        this.invalidateCache('ingresos');
        this.invalidateCache('resumen');
        
        console.log('✅ Ingreso creado:', data);
        return data;
    }
    
    async updateIngreso(id, updates) {
        const { data, error } = await window.supabaseClient
            .from('ingresos')
            .update({
                ...updates,
                monto: updates.monto ? parseFloat(updates.monto) : undefined,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        
        // Invalidar cache
        this.invalidateCache('ingresos');
        this.invalidateCache('resumen');
        
        console.log('✅ Ingreso actualizado:', data);
        return data;
    }
    
    async deleteIngreso(id) {
        const { error } = await window.supabaseClient
            .from('ingresos')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        // Invalidar cache
        this.invalidateCache('ingresos');
        this.invalidateCache('resumen');
        
        console.log('✅ Ingreso eliminado:', id);
        return true;
    }
    
    // ===== GASTOS =====
    
    async getGastos(userId) {
        return this.query(`gastos-${userId}`, async () => {
            const { data, error } = await window.supabaseClient
                .from('gastos')
                .select('*')
                .eq('usuario_id', userId)
                .order('fecha', { ascending: false });
                
            if (error) throw error;
            return data || [];
        });
    }
    
    async createGasto(gastoData) {
        const user = window.appState.getState('user');
        if (!user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await window.supabaseClient
            .from('gastos')
            .insert([{
                ...gastoData,
                usuario_id: user.id,
                monto: parseFloat(gastoData.monto),
                fecha: gastoData.fecha || new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // Invalidar cache de gastos
        this.invalidateCache('gastos');
        this.invalidateCache('resumen');
        
        console.log('✅ Gasto creado:', data);
        return data;
    }
    
    async updateGasto(id, updates) {
        const { data, error } = await window.supabaseClient
            .from('gastos')
            .update({
                ...updates,
                monto: updates.monto ? parseFloat(updates.monto) : undefined,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        
        // Invalidar cache
        this.invalidateCache('gastos');
        this.invalidateCache('resumen');
        
        console.log('✅ Gasto actualizado:', data);
        return data;
    }
    
    async deleteGasto(id) {
        const { error } = await window.supabaseClient
            .from('gastos')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        // Invalidar cache
        this.invalidateCache('gastos');
        this.invalidateCache('resumen');
        
        console.log('✅ Gasto eliminado:', id);
        return true;
    }
    
    // ===== RESUMEN FINANCIERO =====
    
    async getResumenFinanciero(userId) {
        return this.query(`resumen-${userId}`, async () => {
            // Obtener ingresos y gastos en paralelo
            const [ingresos, gastos] = await Promise.all([
                this.getIngresos(userId),
                this.getGastos(userId)
            ]);
            
            // Calcular totales
            const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
            const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
            const balanceActual = totalIngresos - totalGastos;
            
            // Calcular totales del mes actual
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const ingresosMes = ingresos.filter(ing => {
                const fecha = new Date(ing.fecha);
                return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
            });
            
            const gastosMes = gastos.filter(gasto => {
                const fecha = new Date(gasto.fecha);
                return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
            });
            
            const totalIngresosMes = ingresosMes.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
            const totalGastosMes = gastosMes.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
            
            // Categorías más usadas
            const categorias = {};
            gastos.forEach(gasto => {
                if (!categorias[gasto.categoria]) {
                    categorias[gasto.categoria] = 0;
                }
                categorias[gasto.categoria] += parseFloat(gasto.monto);
            });
            
            const categoriasOrdenadas = Object.entries(categorias)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            
            return {
                balanceActual,
                totalIngresos,
                totalGastos,
                totalIngresosMes,
                totalGastosMes,
                balanceMes: totalIngresosMes - totalGastosMes,
                cantidadIngresos: ingresos.length,
                cantidadGastos: gastos.length,
                ultimaActualizacion: new Date().toISOString(),
                topCategorias: categoriasOrdenadas,
                tendencia: this.calcularTendencia(ingresos, gastos)
            };
        });
    }
    
    // Calcular tendencia de los últimos 3 meses
    calcularTendencia(ingresos, gastos) {
        const now = new Date();
        const meses = [];
        
        // Últimos 3 meses
        for (let i = 2; i >= 0; i--) {
            const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mes = fecha.getMonth();
            const año = fecha.getFullYear();
            
            const ingresosDelMes = ingresos.filter(ing => {
                const fechaIng = new Date(ing.fecha);
                return fechaIng.getMonth() === mes && fechaIng.getFullYear() === año;
            });
            
            const gastosDelMes = gastos.filter(gasto => {
                const fechaGasto = new Date(gasto.fecha);
                return fechaGasto.getMonth() === mes && fechaGasto.getFullYear() === año;
            });
            
            const totalIngresos = ingresosDelMes.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
            const totalGastos = gastosDelMes.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
            
            meses.push({
                mes: fecha.toLocaleString('es', { month: 'short' }),
                ingresos: totalIngresos,
                gastos: totalGastos,
                balance: totalIngresos - totalGastos
            });
        }
        
        return meses;
    }
    
    // ===== PERFIL USUARIO =====
    
    async getPerfilUsuario(userId) {
        return this.query(`perfil-${userId}`, async () => {
            const { data, error } = await window.supabaseClient
                .from('perfiles_usuario')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) {
                if (error.code === 'PGRST116') {
                    // No se encontró perfil, retornar null
                    return null;
                }
                throw error;
            }
            
            return data;
        });
    }
    
    async createOrUpdatePerfil(userId, perfilData) {
        const { data, error } = await window.supabaseClient
            .from('perfiles_usuario')
            .upsert([{
                id: userId,
                ...perfilData,
                fecha_actualizacion: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // Invalidar cache del perfil
        this.invalidateCache(`perfil-${userId}`);
        
        console.log('✅ Perfil actualizado:', data);
        return data;
    }
    
    // ===== SIMULACIONES DE CRÉDITO =====
    
    async getSimulaciones(userId) {
        return this.query(`simulaciones-${userId}`, async () => {
            const { data, error } = await window.supabaseClient
                .from('simulaciones_credito')
                .select('*')
                .eq('usuario_id', userId)
                .order('fecha_simulacion', { ascending: false });
                
            if (error) throw error;
            return data || [];
        });
    }
    
    async saveSimulacion(simulacionData) {
        const user = window.appState.getState('user');
        if (!user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await window.supabaseClient
            .from('simulaciones_credito')
            .insert([{
                ...simulacionData,
                usuario_id: user.id,
                fecha_simulacion: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // Invalidar cache
        this.invalidateCache('simulaciones');
        
        console.log('✅ Simulación guardada:', data);
        return data;
    }
    
    async deleteSimulacion(id) {
        const { error } = await window.supabaseClient
            .from('simulaciones_credito')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        // Invalidar cache
        this.invalidateCache('simulaciones');
        
        console.log('✅ Simulación eliminada:', id);
        return true;
    }
    
    // ===== UTILIDADES =====
    
    // Obtener categorías disponibles
    getCategorias() {
        return {
            ingresos: [
                { value: 'salario', label: '💼 Salario', icon: '💼' },
                { value: 'freelance', label: '💻 Freelance', icon: '💻' },
                { value: 'negocio', label: '🏪 Negocio', icon: '🏪' },
                { value: 'inversion', label: '📈 Inversiones', icon: '📈' },
                { value: 'pension', label: '🏦 Pensión', icon: '🏦' },
                { value: 'alquiler', label: '🏠 Alquiler', icon: '🏠' },
                { value: 'regalo', label: '🎁 Regalo', icon: '🎁' },
                { value: 'otro', label: '📝 Otro', icon: '📝' }
            ],
            gastos: [
                { value: 'alimentacion', label: '🍽️ Alimentación', icon: '🍽️' },
                { value: 'transporte', label: '🚗 Transporte', icon: '🚗' },
                { value: 'vivienda', label: '🏠 Vivienda', icon: '🏠' },
                { value: 'salud', label: '🏥 Salud', icon: '🏥' },
                { value: 'educacion', label: '📚 Educación', icon: '📚' },
                { value: 'entretenimiento', label: '🎮 Entretenimiento', icon: '🎮' },
                { value: 'ropa', label: '👕 Ropa', icon: '👕' },
                { value: 'servicios', label: '💡 Servicios', icon: '💡' },
                { value: 'compras', label: '🛒 Compras', icon: '🛒' },
                { value: 'otro', label: '📝 Otro', icon: '📝' }
            ]
        };
    }
    
    // Formatear moneda
    formatCurrency(amount, currency = 'ARS') {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Formatear fecha
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Validar datos de entrada
    validateIngreso(data) {
        const errors = {};
        
        if (!data.descripcion?.trim()) {
            errors.descripcion = 'La descripción es requerida';
        }
        
        if (!data.monto || parseFloat(data.monto) <= 0) {
            errors.monto = 'El monto debe ser mayor a 0';
        }
        
        if (!data.categoria) {
            errors.categoria = 'La categoría es requerida';
        }
        
        if (!data.fecha) {
            errors.fecha = 'La fecha es requerida';
        }
        
        return { isValid: Object.keys(errors).length === 0, errors };
    }
    
    validateGasto(data) {
        return this.validateIngreso(data); // Misma validación
    }
    
    // Stats y analytics
    async getEstadisticasAvanzadas(userId) {
        const [ingresos, gastos] = await Promise.all([
            this.getIngresos(userId),
            this.getGastos(userId)
        ]);
        
        // Análisis por categorías
        const categoriaStats = {};
        gastos.forEach(gasto => {
            if (!categoriaStats[gasto.categoria]) {
                categoriaStats[gasto.categoria] = {
                    total: 0,
                    count: 0,
                    promedio: 0
                };
            }
            categoriaStats[gasto.categoria].total += parseFloat(gasto.monto);
            categoriaStats[gasto.categoria].count += 1;
        });
        
        Object.keys(categoriaStats).forEach(cat => {
            categoriaStats[cat].promedio = categoriaStats[cat].total / categoriaStats[cat].count;
        });
        
        // Análisis temporal (últimos 6 meses)
        const analisisTemporal = [];
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() - i);
            const mes = fecha.getMonth();
            const año = fecha.getFullYear();
            
            const ingresosDelMes = ingresos.filter(ing => {
                const fechaIng = new Date(ing.fecha);
                return fechaIng.getMonth() === mes && fechaIng.getFullYear() === año;
            });
            
            const gastosDelMes = gastos.filter(gasto => {
                const fechaGasto = new Date(gasto.fecha);
                return fechaGasto.getMonth() === mes && fechaGasto.getFullYear() === año;
            });
            
            analisisTemporal.push({
                mes: fecha.toLocaleString('es', { month: 'short', year: 'numeric' }),
                ingresos: ingresosDelMes.reduce((sum, ing) => sum + parseFloat(ing.monto), 0),
                gastos: gastosDelMes.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0)
            });
        }
        
        return {
            categoriaStats,
            analisisTemporal,
            totalTransacciones: ingresos.length + gastos.length,
            promedioIngresoMensual: ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0) / 6,
            promedioGastoMensual: gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0) / 6
        };
    }
}

// Instancia global
const dataService = new DataService();
window.dataService = dataService;

console.log('✅ DataService configurado');

export { dataService };
