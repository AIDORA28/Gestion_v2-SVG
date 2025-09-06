/**
 * 🚀 APLICACIÓN PRINCIPAL V2
 * Equivale a App.js + main.tsx en React
 * Conecta todos los sistemas: Estado + Componentes + Auth
 */

class AppV2 {
    constructor() {
        this.initialized = false;
        this.supabaseClient = null;
        
        console.log('🚀 AppV2 constructor ejecutado');
    }
    
    /**
     * Inicializar aplicación completa
     */
    async init() {
        try {
            console.log('🔄 Iniciando AppV2...');
            
            // 1. Verificar DOM
            if (document.readyState === 'loading') {
                console.log('⏳ Esperando DOM...');
                await this.waitForDOM();
            }
            
            // 2. Inicializar Supabase
            await this.initSupabase();
            
            // 3. Conectar AppState con ComponentManager
            this.connectStateToComponents();
            
            // 4. Configurar listeners globales
            this.setupGlobalListeners();
            
            // 5. Inicializar AppState (esto disparará el render inicial)
            if (window.appState && !window.appState.initialized) {
                await window.appState.init();
            }
            
            this.initialized = true;
            console.log('✅ AppV2 inicializada completamente');
            
        } catch (error) {
            console.error('❌ Error inicializando AppV2:', error);
        }
    }
    
    /**
     * Esperar a que el DOM esté listo
     */
    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    /**
     * Inicializar Supabase
     */
    async initSupabase() {
        try {
            console.log('🔄 Inicializando Supabase...');
            
            // Esperar a que el script de Supabase se cargue
            let attempts = 0;
            while (typeof window.supabase === 'undefined' && attempts < 20) {
                console.log(`⏳ Esperando Supabase... intento ${attempts + 1}`);
                await new Promise(resolve => setTimeout(resolve, 250));
                attempts++;
            }
            
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase no se cargó después de 5 segundos');
            }
            
            // Configuración de Supabase
            const SUPABASE_URL = 'https://trlbsfktusefvpheoudn.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc';
            
            // Crear cliente
            this.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Hacer disponible globalmente
            window.supabaseClient = this.supabaseClient;
            
            console.log('✅ Supabase inicializado');
            
            // Test de conexión
            const { data, error } = await this.supabaseClient.auth.getSession();
            if (error) {
                console.warn('⚠️ Warning al verificar sesión inicial:', error);
            } else {
                console.log('🔗 Conexión con Supabase verificada');
            }
            
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            throw error;
        }
    }
    
    /**
     * Conectar AppState con ComponentManager
     */
    connectStateToComponents() {
        console.log('🔗 Conectando Estado con Componentes...');
        
        // Sobrescribir el método render de AppState para usar ComponentManagerV2
        if (window.appState) {
            window.appState.render = function() {
                if (window.ComponentManagerV2) {
                    window.ComponentManagerV2.render(this.state);
                }
            };
            
            console.log('✅ Estado conectado con ComponentManagerV2');
        } else {
            console.error('❌ AppState no disponible');
        }
    }
    
    /**
     * Configurar listeners globales
     */
    setupGlobalListeners() {
        console.log('👂 Configurando listeners globales...');
        
        // Error handler global
        window.addEventListener('error', (event) => {
            console.error('🚨 Error global:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Promise rechazada:', event.reason);
            this.handleGlobalError(event.reason);
        });
        
        // Network status
        window.addEventListener('online', () => {
            console.log('🌐 Conexión restaurada');
            if (window.appState) {
                window.appState.showNotification('Conexión a Internet restaurada', 'success');
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('📵 Sin conexión');
            if (window.appState) {
                window.appState.showNotification('Sin conexión a Internet', 'warning', 10000);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
        
        console.log('✅ Listeners globales configurados');
    }
    
    /**
     * Manejar errores globales
     */
    handleGlobalError(error) {
        // No mostrar errores menores
        if (error && error.message) {
            const ignoredErrors = [
                'ResizeObserver loop limit exceeded',
                'Non-Error promise rejection captured',
                'Loading chunk'
            ];
            
            if (ignoredErrors.some(ignored => error.message.includes(ignored))) {
                return;
            }
        }
        
        // Mostrar notificación para errores importantes
        if (window.appState) {
            window.appState.showNotification(
                'Ha ocurrido un error inesperado. Por favor, recarga la página.',
                'error',
                8000
            );
        }
    }
    
    /**
     * Manejar shortcuts de teclado
     */
    handleKeyboardShortcuts(event) {
        // Solo procesar si no estamos en un input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const state = window.appState?.state;
        if (!state) return;
        
        // Shortcuts solo en dashboard
        if (state.currentView !== 'dashboard') return;
        
        // Cambiar tabs con números
        if (event.key >= '1' && event.key <= '4') {
            event.preventDefault();
            
            const tabs = ['resumen', 'ingresos', 'gastos', 'simulador'];
            const tabIndex = parseInt(event.key) - 1;
            
            if (tabs[tabIndex] && window.DashboardManagerV2) {
                window.DashboardManagerV2.showTab(tabs[tabIndex]);
            }
        }
        
        // ESC para cerrar modales
        if (event.key === 'Escape') {
            if (state.ui?.showModal) {
                window.appState.setState('ui.showModal', false);
            }
        }
    }
    
    /**
     * Obtener información del sistema
     */
    getSystemInfo() {
        return {
            initialized: this.initialized,
            supabaseConnected: !!this.supabaseClient,
            currentView: window.appState?.state?.currentView,
            userAuthenticated: window.appState?.state?.isAuthenticated,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 🎯 PUNTO DE ENTRADA PRINCIPAL
 */
async function initializeApp() {
    try {
        console.log('🚀 === INICIANDO APLICACIÓN ===');
        
        // Crear instancia de la aplicación
        const app = new AppV2();
        
        // Hacer disponible globalmente para debugging
        window.app = app;
        
        // Inicializar
        await app.init();
        
        console.log('🎉 === APLICACIÓN LISTA ===');
        
        // Mostrar información del sistema en consola
        console.table(app.getSystemInfo());
        
    } catch (error) {
        console.error('💥 Error fatal inicializando aplicación:', error);
        
        // Mostrar error al usuario
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="
                    padding: 2rem; 
                    text-align: center; 
                    background: #fee2e2; 
                    color: #991b1b; 
                    border-radius: 8px; 
                    margin: 2rem;
                    font-family: Arial, sans-serif;
                ">
                    <h2>❌ Error al cargar la aplicación</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" style="
                        padding: 0.75rem 1.5rem;
                        background: #dc2626;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 1rem;
                        margin-top: 1rem;
                    ">
                        🔄 Recargar Página
                    </button>
                </div>
            `;
        }
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // Si el DOM ya está listo, inicializar inmediatamente
    initializeApp();
}

console.log('📦 AppV2 definida - esperando inicialización');
