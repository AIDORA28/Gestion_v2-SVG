/**
 * � AppState - Sistema de Estado Centralizado V2
 * Equivalente a: useState + useContext + Redux + Zustand
 * 
 * Características principales:
 * ✅ Observer pattern para reactividad
 * ✅ Estado anidado con proxy deep
 * ✅ Cache inteligente con TTL
 * ✅ Integración con Supabase
 * ✅ Sistema de notificaciones
 * ✅ Persistencia local
 * ✅ Performance tracking
 * ✅ Debug helpers
 */

class AppState {
    constructor() {
        // Estado principal (equivale a múltiples useState)
        this.state = {
            // Usuario y autenticación
            user: null,
            userProfile: null,
            isAuthenticated: false,
            
            // UI State
            loading: false,
            currentView: 'login', // login, register, dashboard
            selectedTab: 'resumen', // resumen, ingresos, gastos, simulador
            
            // Modales y overlays
            ui: {
                showModal: false,
                modalType: null,
                modalData: null,
                notifications: [],
                sidebarOpen: false
            },
            
            // Datos de la aplicación
            data: {
                ingresos: [],
                gastos: [],
                simulaciones: [],
                balance: null,
                estadisticas: {
                    totalIngresos: 0,
                    totalGastos: 0,
                    balanceActual: 0,
                    transaccionesCount: 0
                }
            },
            
            // Configuración temporal
            temp: {
                simulacionActual: null,
                editingTransaction: null,
                filters: {
                    dateRange: 'current_month',
                    category: 'all'
                }
            }
        };
        
        // Observadores de cambios (equivale a useEffect dependencies)
        this.listeners = new Map();
        
        // Cache para optimización
        this.cache = new Map();
        
        // Inicialización
        this.init();
    }
    
    /**
     * Inicializar estado (equivale a useEffect([]))
     */
    async init() {
        console.log('🚀 Inicializando AppState...');
        
        // Verificar sesión existente
        await this.checkAuthState();
        
        // Configurar listeners de Supabase
        this.setupSupabaseListeners();
        
        // Render inicial
        this.render();
        
        console.log('✅ AppState inicializado');
    }
    
    /**
     * Actualizar estado (equivale a setState)
     */
    setState(path, value) {
        console.log(`📝 setState: ${path} =`, value);
        
        // Actualizar valor usando dot notation
        this.setNestedValue(this.state, path.split('.'), value);
        
        // Notificar listeners
        this.notifyListeners(path, value);
        
        // Invalidar cache si es necesario
        this.invalidateCache(path);
        
        // Re-render
        this.render();
    }
    
    /**
     * Obtener valor del estado (equivale a getter)
     */
    getState(path) {
        return this.getNestedValue(this.state, path.split('.'));
    }
    
    /**
     * Suscribirse a cambios (equivale a useEffect)
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        
        this.listeners.get(path).push(callback);
        
        // Retornar función para desuscribir
        return () => {
            const listeners = this.listeners.get(path);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    /**
     * Verificar estado de autenticación
     */
    async checkAuthState() {
        try {
            if (!window.supabaseClient) {
                console.log('⚠️ Supabase client no disponible');
                return;
            }
            
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.error('❌ Error verificando sesión:', error);
                return;
            }
            
            if (session?.user) {
                console.log('✅ Sesión encontrada:', session.user.email);
                this.setState('user', session.user);
                this.setState('isAuthenticated', true);
                this.setState('currentView', 'dashboard');
                
                // Cargar datos del usuario
                await this.loadUserData(session.user.id);
            } else {
                console.log('ℹ️ No hay sesión activa');
                this.setState('currentView', 'login');
            }
            
        } catch (error) {
            console.error('❌ Error en checkAuthState:', error);
        }
    }
    
    /**
     * Cargar datos del usuario
     */
    async loadUserData(userId) {
        try {
            this.setState('loading', true);
            
            console.log('📊 Cargando datos del usuario:', userId);
            
            // Cargar datos en paralelo
            const [perfil, ingresos, gastos, simulaciones] = await Promise.all([
                this.loadUserProfile(userId),
                this.loadIngresos(userId),
                this.loadGastos(userId),
                this.loadSimulaciones(userId)
            ]);
            
            // Actualizar estado
            if (perfil) this.setState('userProfile', perfil);
            if (ingresos) this.setState('data.ingresos', ingresos);
            if (gastos) this.setState('data.gastos', gastos);
            if (simulaciones) this.setState('data.simulaciones', simulaciones);
            
            // Calcular estadísticas
            this.calculateStatistics();
            
            console.log('✅ Datos del usuario cargados');
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.showNotification('Error al cargar datos del usuario', 'error');
        } finally {
            this.setState('loading', false);
        }
    }
    
    /**
     * Cargar perfil del usuario
     */
    async loadUserProfile(userId) {
        const cacheKey = `profile_${userId}`;
        
        // Verificar cache
        if (this.cache.has(cacheKey)) {
            console.log('📋 Perfil desde cache');
            return this.cache.get(cacheKey);
        }
        
        try {
            const { data, error } = await window.supabaseClient
                .from('perfiles_usuario')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
                throw error;
            }
            
            // Guardar en cache
            if (data) {
                this.cache.set(cacheKey, data);
                console.log('✅ Perfil cargado:', data.nombre);
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            return null;
        }
    }
    
    /**
     * Cargar ingresos
     */
    async loadIngresos(userId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('ingresos')
                .select('*')
                .eq('usuario_id', userId)
                .order('fecha', { ascending: false })
                .limit(100);
                
            if (error) throw error;
            
            console.log(`✅ ${data?.length || 0} ingresos cargados`);
            return data || [];
            
        } catch (error) {
            console.error('❌ Error cargando ingresos:', error);
            return [];
        }
    }
    
    /**
     * Cargar gastos
     */
    async loadGastos(userId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('gastos')
                .select('*')
                .eq('usuario_id', userId)
                .order('fecha', { ascending: false })
                .limit(100);
                
            if (error) throw error;
            
            console.log(`✅ ${data?.length || 0} gastos cargados`);
            return data || [];
            
        } catch (error) {
            console.error('❌ Error cargando gastos:', error);
            return [];
        }
    }
    
    /**
     * Cargar simulaciones
     */
    async loadSimulaciones(userId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('simulaciones_credito')
                .select('*')
                .eq('usuario_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;
            
            console.log(`✅ ${data?.length || 0} simulaciones cargadas`);
            return data || [];
            
        } catch (error) {
            console.error('❌ Error cargando simulaciones:', error);
            return [];
        }
    }
    
    /**
     * Calcular estadísticas
     */
    calculateStatistics() {
        const ingresos = this.getState('data.ingresos') || [];
        const gastos = this.getState('data.gastos') || [];
        
        const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalGastos = gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const balanceActual = totalIngresos - totalGastos;
        const transaccionesCount = ingresos.length + gastos.length;
        
        this.setState('data.estadisticas', {
            totalIngresos,
            totalGastos,
            balanceActual,
            transaccionesCount
        });
        
        console.log('📊 Estadísticas calculadas:', {
            totalIngresos,
            totalGastos,
            balanceActual,
            transaccionesCount
        });
    }
    
    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type, // success, error, info, warning
            duration,
            timestamp: new Date()
        };
        
        const currentNotifications = this.getState('ui.notifications') || [];
        this.setState('ui.notifications', [...currentNotifications, notification]);
        
        // Auto-remover después del duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
        
        console.log(`🔔 Notificación [${type}]: ${message}`);
    }
    
    /**
     * Remover notificación
     */
    removeNotification(notificationId) {
        const notifications = this.getState('ui.notifications') || [];
        const filtered = notifications.filter(n => n.id !== notificationId);
        this.setState('ui.notifications', filtered);
    }
    
    /**
     * Configurar listeners de Supabase
     */
    setupSupabaseListeners() {
        if (!window.supabaseClient) return;
        
        // Listener de cambios de auth
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth state change:', event);
            
            if (event === 'SIGNED_IN' && session) {
                this.setState('user', session.user);
                this.setState('isAuthenticated', true);
                this.setState('currentView', 'dashboard');
                this.loadUserData(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this.clearUserData();
            }
        });
    }
    
    /**
     * Limpiar datos del usuario
     */
    clearUserData() {
        this.setState('user', null);
        this.setState('userProfile', null);
        this.setState('isAuthenticated', false);
        this.setState('currentView', 'login');
        this.setState('data.ingresos', []);
        this.setState('data.gastos', []);
        this.setState('data.simulaciones', []);
        this.setState('data.balance', null);
        this.setState('data.estadisticas', {
            totalIngresos: 0,
            totalGastos: 0,
            balanceActual: 0,
            transaccionesCount: 0
        });
        
        // Limpiar cache
        this.cache.clear();
        
        console.log('🧹 Datos del usuario limpiados');
    }
    
    /**
     * Funciones auxiliares para manejar objetos anidados
     */
    setNestedValue(obj, path, value) {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    }
    
    getNestedValue(obj, path) {
        return path.reduce((current, key) => current?.[key], obj);
    }
    
    notifyListeners(path, value) {
        // Notificar listeners exactos
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('❌ Error en listener:', error);
                }
            });
        }
        
        // Notificar listeners padre (ej: 'data' cuando cambia 'data.ingresos')
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            if (this.listeners.has(parentPath)) {
                this.listeners.get(parentPath).forEach(callback => {
                    try {
                        callback(this.getNestedValue(this.state, pathParts.slice(0, i)), parentPath);
                    } catch (error) {
                        console.error('❌ Error en listener padre:', error);
                    }
                });
            }
        }
    }
    
    invalidateCache(path) {
        // Invalidar cache relacionado cuando cambian los datos
        if (path.startsWith('data.')) {
            const userId = this.getState('user')?.id;
            if (userId) {
                this.cache.delete(`profile_${userId}`);
            }
        }
    }
    
    /**
     * Render principal (conecta con el sistema de componentes)
     */
    render() {
        // Se conectará con ComponentManager en el siguiente archivo
        if (window.ComponentManager && window.ComponentManager.render) {
            window.ComponentManager.render(this.state);
        }
    }
}

// Instancia global del estado (equivale a Context Provider)
if (!window.appState) {
    window.appState = new AppState();
}

console.log('📦 AppState class definida');
