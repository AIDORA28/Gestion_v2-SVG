// js/app.js - Sistema de Estado Central (equivale a useState/useContext en React)

class AppState {
    constructor() {
        // Estado global de la aplicación (equivale a useState)
        this.state = {
            // Usuario y autenticación
            user: null,                    // Usuario autenticado actual
            isAuthenticated: false,        // Estado de autenticación
            isLoading: false,             // Loading global
            
            // Navegación y vistas
            currentView: 'loading',       // vista actual: 'loading', 'login', 'register', 'dashboard'
            currentTab: 'resumen',        // tab activo en dashboard
            
            // Datos de la aplicación
            data: {
                perfilUsuario: null,      // Perfil del usuario
                ingresos: [],             // Lista de ingresos
                gastos: [],               // Lista de gastos
                simulaciones: [],         // Simulaciones de crédito
                resumen: {                // Resumen financiero
                    balanceActual: 0,
                    totalIngresos: 0,
                    totalGastos: 0,
                    ultimaActualizacion: null
                }
            },
            
            // UI State
            modals: {
                addIngreso: false,
                addGasto: false,
                editProfile: false,
                confirmDelete: false
            },
            
            // Notificaciones
            notifications: [],
            
            // Error handling
            errors: {},
            
            // Form states
            forms: {
                login: { email: '', password: '' },
                register: { 
                    email: '', 
                    password: '', 
                    confirmPassword: '',
                    nombre: '',
                    apellido: '',
                    dni: '',
                    edad: ''
                },
                ingreso: {
                    descripcion: '',
                    monto: '',
                    categoria: 'salario',
                    fecha: new Date().toISOString().split('T')[0]
                },
                gasto: {
                    descripcion: '',
                    monto: '',
                    categoria: 'alimentacion',
                    fecha: new Date().toISOString().split('T')[0]
                },
                simulador: {
                    monto: '',
                    tasa: '',
                    plazo: '',
                    resultado: null
                }
            }
        };
        
        // Sistema de listeners (equivale a useEffect dependencies)
        this.listeners = new Map();
        
        // Referencias a elementos DOM
        this.refs = {
            app: null,
            loadingOverlay: null
        };
        
        // Inicializar
        this.init();
    }
    
    // Equivale a setState en React
    setState(path, value) {
        console.log(`🔄 State update: ${path} =`, value);
        
        if (path.includes('.')) {
            // Para paths anidados como 'data.ingresos' o 'forms.login.email'
            const keys = path.split('.');
            let current = this.state;
            
            // Navegar hasta el penúltimo nivel
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            // Asignar el valor
            current[keys[keys.length - 1]] = value;
        } else {
            // Para paths simples como 'currentView'
            this.state[path] = value;
        }
        
        // Notificar a listeners y re-renderizar
        this.notifyListeners(path, value);
        this.render();
    }
    
    // Obtener valor del estado
    getState(path) {
        if (!path) return this.state;
        
        if (path.includes('.')) {
            const keys = path.split('.');
            let current = this.state;
            
            for (const key of keys) {
                if (current === null || current === undefined) {
                    return undefined;
                }
                current = current[key];
            }
            
            return current;
        } else {
            return this.state[path];
        }
    }
    
    // Equivale a useEffect - suscribirse a cambios de estado
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
        
        console.log(`📡 Suscripción creada para: ${path}`);
        
        // Retornar función de cleanup
        return () => {
            const callbacks = this.listeners.get(path);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                    console.log(`🔌 Suscripción eliminada para: ${path}`);
                }
            }
        };
    }
    
    // Notificar a listeners (equivale a useEffect triggers)
    notifyListeners(path, value) {
        // Notificar listeners específicos del path
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(value, this.state);
                } catch (error) {
                    console.error(`❌ Error en listener para ${path}:`, error);
                }
            });
        }
        
        // Notificar listeners genéricos
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback(path, value, this.state);
                } catch (error) {
                    console.error(`❌ Error en listener global:`, error);
                }
            });
        }
    }
    
    // Inicialización (equivale a useEffect([]))
    async init() {
        console.log('🚀 Inicializando AppState...');
        
        // Obtener referencias DOM
        this.refs.app = document.getElementById('app');
        
        // Verificar autenticación existente
        await this.checkAuthState();
        
        // Setup de listeners globales
        this.setupGlobalListeners();
        
        // Renderizar vista inicial
        this.render();
        
        console.log('✅ AppState inicializado');
    }
    
    // Verificar estado de autenticación al iniciar
    async checkAuthState() {
        console.log('🔍 Verificando estado de autenticación...');
        
        try {
            this.setState('isLoading', true);
            
            if (!window.supabaseClient) {
                console.log('⚠️ Supabase client no disponible aún');
                // Redirigir a página de auth dedicada
                window.location.href = 'auth.html';
                return;
            }
            
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.log('❌ Error verificando sesión:', error);
                window.location.href = 'auth.html';
                return;
            }
            
            if (session?.user) {
                console.log('✅ Sesión activa encontrada:', session.user.email);
                this.setState('user', session.user);
                this.setState('isAuthenticated', true);
                await this.loadUserProfile(session.user.id);
                this.setState('currentView', 'dashboard');
            } else {
                console.log('ℹ️ No hay sesión activa');
                window.location.href = 'auth.html';
            }
        } catch (error) {
            console.error('❌ Error en checkAuthState:', error);
            window.location.href = 'auth.html';
        } finally {
            this.setState('isLoading', false);
        }
    }
    
    // Cargar perfil del usuario
    async loadUserProfile(userId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('perfiles_usuario')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) {
                console.log('⚠️ Perfil no encontrado, usuario nuevo:', error.message);
                return;
            }
            
            if (data) {
                console.log('✅ Perfil cargado:', data);
                this.setState('data.perfilUsuario', data);
            }
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
        }
    }
    
    // Setup de listeners globales
    setupGlobalListeners() {
        // Listener para cambios de autenticación de Supabase
        if (window.supabaseClient) {
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                console.log('🔐 Auth state change:', event, session?.user?.email);
                
                if (event === 'SIGNED_IN' && session?.user) {
                    this.setState('user', session.user);
                    this.setState('isAuthenticated', true);
                    this.loadUserProfile(session.user.id);
                    this.setState('currentView', 'dashboard');
                } else if (event === 'SIGNED_OUT') {
                    this.setState('user', null);
                    this.setState('isAuthenticated', false);
                    this.setState('data', {
                        perfilUsuario: null,
                        ingresos: [],
                        gastos: [],
                        simulaciones: [],
                        resumen: {
                            balanceActual: 0,
                            totalIngresos: 0,
                            totalGastos: 0,
                            ultimaActualizacion: null
                        }
                    });
                    this.setState('currentView', 'login');
                }
            });
        }
        
        // Listener para errores globales
        window.addEventListener('error', (event) => {
            console.error('❌ Error global:', event.error);
            this.showNotification('Error inesperado', 'error');
        });
        
        // Listener para errores de promesas no capturadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promise rejection no manejada:', event.reason);
            this.showNotification('Error de conexión', 'error');
        });
    }
    
    // Sistema de notificaciones
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        
        const currentNotifications = this.getState('notifications') || [];
        this.setState('notifications', [...currentNotifications, notification]);
        
        // Auto-remove después de duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
        
        console.log(`📢 Notificación (${type}): ${message}`);
    }
    
    // Remover notificación
    removeNotification(id) {
        const currentNotifications = this.getState('notifications') || [];
        const filtered = currentNotifications.filter(n => n.id !== id);
        this.setState('notifications', filtered);
    }
    
    // Mostrar/ocultar loading global
    showGlobalLoading() {
        this.setState('isLoading', true);
        console.log('⏳ Loading global activado');
    }
    
    hideGlobalLoading() {
        this.setState('isLoading', false);
        console.log('✅ Loading global desactivado');
    }
    
    // Toggle modal
    toggleModal(modalName, show = null) {
        const currentState = this.getState(`modals.${modalName}`);
        const newState = show !== null ? show : !currentState;
        this.setState(`modals.${modalName}`, newState);
        console.log(`🏠 Modal ${modalName}: ${newState ? 'abierto' : 'cerrado'}`);
    }
    
    // Reset formulario
    resetForm(formName) {
        const defaultForms = {
            login: { email: '', password: '' },
            register: { 
                email: '', 
                password: '', 
                confirmPassword: '',
                nombre: '',
                apellido: '',
                dni: '',
                edad: ''
            },
            ingreso: {
                descripcion: '',
                monto: '',
                categoria: 'salario',
                fecha: new Date().toISOString().split('T')[0]
            },
            gasto: {
                descripcion: '',
                monto: '',
                categoria: 'alimentacion',
                fecha: new Date().toISOString().split('T')[0]
            },
            simulador: {
                monto: '',
                tasa: '',
                plazo: '',
                resultado: null
            }
        };
        
        if (defaultForms[formName]) {
            this.setState(`forms.${formName}`, { ...defaultForms[formName] });
            console.log(`📝 Formulario ${formName} reseteado`);
        }
    }
    
    // Método para render (será implementado por el renderer)
    render() {
        // Este método será sobrescrito por AppRenderer
        console.log('🎨 Render solicitado - currentView:', this.getState('currentView'));
    }
    
    // Debug method
    debugState() {
        console.table({
            currentView: this.getState('currentView'),
            currentTab: this.getState('currentTab'),
            isAuthenticated: this.getState('isAuthenticated'),
            isLoading: this.getState('isLoading'),
            user: this.getState('user')?.email || 'none'
        });
    }
}

// Crear instancia global del estado (equivale a Context Provider)
console.log('🏗️ Creando AppState global...');
const appState = new AppState();

// Exportar para otros módulos
window.appState = appState;

// Debug helper global
window.debugApp = () => appState.debugState();

export { appState };
