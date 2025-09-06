/**
 * 🚀 AppMain V2 - Orquestador Principal de la Aplicación
 * Equivalente a: main.tsx + App.js + index.js
 * 
 * Características principales:
 * ✅ Inicialización completa del sistema
 * ✅ Configuración de Supabase
 * ✅ Orquestación de todos los managers
 * ✅ Error handling global
 * ✅ Performance tracking
 * ✅ Shortcuts de teclado
 * ✅ Service Worker registration
 * ✅ Analytics setup
 */

class AppMainV2 {
    constructor() {
        console.log('🚀 Inicializando Aplicación V2...');
        
        this.version = '2.0.0';
        this.startTime = Date.now();
        
        // Managers principales
        this.appState = null;
        this.componentManager = null;
        this.authManager = null;
        this.dataManager = null;
        this.supabaseClient = null;
        
        // Estado de inicialización
        this.initialized = false;
        this.initError = null;
        
        // Configuración
        this.config = {
            supabase: {
                url: 'https://trlbsfktusefvpheoldn.supabase.co',
                key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc'
            },
            debug: true,
            enableAnalytics: false,
            enableServiceWorker: false
        };
        
        // Auto-inicializar
        this.autoInit();
    }
    
    /**
     * Auto-inicialización cuando el DOM esté listo
     */
    autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // DOM ya está listo
            setTimeout(() => this.init(), 0);
        }
    }
    
    /**
     * Inicialización principal
     */
    async init() {
        try {
            console.log('⚡ Iniciando sistema...');
            
            // 1. Mostrar loading inicial
            this.showInitialLoading();
            
            // 2. Configurar error handlers globales
            this.setupGlobalErrorHandlers();
            
            // 3. Inicializar Supabase
            await this.initSupabase();
            
            // 4. Inicializar AppState
            await this.initAppState();
            
            // 5. Inicializar ComponentManager
            await this.initComponentManager();
            
            // 6. Inicializar DataManager
            await this.initDataManager();
            
            // 7. Inicializar AuthManager
            await this.initAuthManager();
            
            // 8. Configurar funciones globales
            this.setupGlobalFunctions();
            
            // 9. Configurar shortcuts
            this.setupKeyboardShortcuts();
            
            // 10. Configurar servicios opcionales
            await this.setupOptionalServices();
            
            // 11. Finalizar inicialización
            await this.finalizeInit();
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error crítico durante la inicialización:', error);
            this.handleInitError(error);
        }
    }
    
    /**
     * Mostrar loading inicial
     */
    showInitialLoading() {
        const app = document.getElementById('app');
        if (!app) {
            throw new Error('Elemento #app no encontrado en el DOM');
        }
        
        app.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="text-align: center; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="width: 60px; height: 60px; border: 6px solid rgba(255,255,255,0.3); border-top: 6px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 2rem;"></div>
                    <h2 style="margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 600;">🚀 Sistema de Gestión V2</h2>
                    <p style="margin: 0 0 1rem; opacity: 0.9; font-size: 1rem;">Inicializando aplicación...</p>
                    <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; margin: 0 auto; overflow: hidden;">
                        <div id="progressBar" style="width: 0%; height: 100%; background: white; border-radius: 2px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    /**
     * Actualizar barra de progreso
     */
    updateProgress(percentage, message = '') {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }
        
        if (message && this.config.debug) {
            console.log(`📊 ${percentage}% - ${message}`);
        }
    }
    
    /**
     * Configurar error handlers globales
     */
    setupGlobalErrorHandlers() {
        // Errors de JavaScript
        window.addEventListener('error', (event) => {
            console.error('💥 Error global:', event.error);
            this.handleGlobalError(event.error, 'JavaScript Error');
        });
        
        // Promise rejections no capturadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Promise rejection no capturada:', event.reason);
            this.handleGlobalError(event.reason, 'Unhandled Promise Rejection');
        });
        
        this.updateProgress(10, 'Error handlers configurados');
    }
    
    /**
     * Inicializar Supabase
     */
    async initSupabase() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase library no está cargada');
            }
            
            this.supabaseClient = window.supabase.createClient(
                this.config.supabase.url,
                this.config.supabase.key
            );
            
            // Test de conectividad
            const { error } = await this.supabaseClient.from('users').select('count', { count: 'exact' }).limit(1);
            if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe, pero conexión OK
                throw error;
            }
            
            // Hacer disponible globalmente
            window.supabaseClient = this.supabaseClient;
            
            console.log('✅ Supabase conectado');
            this.updateProgress(25, 'Supabase inicializado');
            
        } catch (error) {
            console.error('❌ Error conectando a Supabase:', error);
            throw new Error(`Error de conexión a la base de datos: ${error.message}`);
        }
    }
    
    /**
     * Inicializar AppState
     */
    async initAppState() {
        try {
            if (!window.AppState) {
                throw new Error('AppState class no está cargada');
            }
            
            this.appState = new window.AppState();
            
            // Esperar a que esté inicializado
            await new Promise((resolve, reject) => {
                if (this.appState.getState('system.initialized')) {
                    resolve();
                    return;
                }
                
                const unsubscribe = this.appState.subscribe('system.initialized', (initialized) => {
                    if (initialized) {
                        unsubscribe();
                        resolve();
                    }
                });
                
                // Timeout de seguridad
                setTimeout(() => {
                    unsubscribe();
                    reject(new Error('Timeout inicializando AppState'));
                }, 5000);
            });
            
            // Hacer disponible globalmente
            window.appState = this.appState;
            
            console.log('✅ AppState inicializado');
            this.updateProgress(40, 'Estado de aplicación listo');
            
        } catch (error) {
            console.error('❌ Error inicializando AppState:', error);
            throw new Error(`Error configurando el estado de la aplicación: ${error.message}`);
        }
    }
    
    /**
     * Inicializar ComponentManager
     */
    async initComponentManager() {
        try {
            if (!window.ComponentManagerV2) {
                throw new Error('ComponentManagerV2 class no está cargada');
            }
            
            this.componentManager = new window.ComponentManagerV2(this.appState);
            
            // Hacer disponible globalmente
            window.componentManager = this.componentManager;
            
            console.log('✅ ComponentManager inicializado');
            this.updateProgress(60, 'Sistema de componentes listo');
            
        } catch (error) {
            console.error('❌ Error inicializando ComponentManager:', error);
            throw new Error(`Error configurando los componentes: ${error.message}`);
        }
    }
    
    /**
     * Inicializar DataManager
     */
    async initDataManager() {
        try {
            if (!window.DataManager) {
                throw new Error('DataManager class no está cargada');
            }
            
            this.dataManager = new window.DataManager(this.supabaseClient, this.appState);
            
            // Hacer disponible globalmente
            window.dataManager = this.dataManager;
            
            console.log('✅ DataManager inicializado');
            this.updateProgress(70, 'Gestor de datos listo');
            
        } catch (error) {
            console.error('❌ Error inicializando DataManager:', error);
            throw new Error(`Error configurando el gestor de datos: ${error.message}`);
        }
    }
    
    /**
     * Inicializar AuthManager
     */
    async initAuthManager() {
        try {
            if (!window.AuthManagerV2) {
                throw new Error('AuthManagerV2 class no está cargada');
            }
            
            this.authManager = new window.AuthManagerV2(this.appState, this.supabaseClient);
            
            // Hacer disponible globalmente
            window.authManager = this.authManager;
            
            console.log('✅ AuthManager inicializado');
            this.updateProgress(80, 'Sistema de autenticación listo');
            
        } catch (error) {
            console.error('❌ Error inicializando AuthManager:', error);
            throw new Error(`Error configurando la autenticación: ${error.message}`);
        }
    }
    
    /**
     * Configurar funciones globales para debugging
     */
    setupGlobalFunctions() {
        // Debug helpers
        window.debug = {
            app: () => this,
            state: () => this.appState?.state,
            user: () => this.authManager?.getCurrentUser(),
            profile: () => this.authManager?.getCurrentProfile(),
            supabase: () => this.supabaseClient,
            version: this.version,
            performance: () => ({
                startTime: this.startTime,
                initTime: Date.now() - this.startTime,
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                } : 'No disponible'
            })
        };
        
        // Shortcuts para testing
        window.testLogin = () => {
            this.appState.setAuth(
                { email: 'test@sistema.com', id: 'test-id' },
                null,
                { nombre: 'Usuario Test', apellido: 'Sistema' }
            );
        };
        
        window.testLogout = () => {
            this.appState.clearAuth();
        };
        
        window.showNotification = (type, message) => {
            this.appState.addNotification(type, message);
        };
        
        this.updateProgress(85, 'Funciones globales configuradas');
    }
    
    /**
     * Configurar shortcuts de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K = Quick actions
            if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) {
                e.preventDefault();
                this.showQuickActions();
            }
            
            // Ctrl/Cmd + Shift + D = Toggle debug
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleDebugMode();
            }
            
            // Escape = Cerrar modales/notificaciones
            if (e.key === 'Escape') {
                this.appState?.clearNotifications();
            }
        });
        
        this.updateProgress(90, 'Shortcuts configurados');
    }
    
    /**
     * Configurar servicios opcionales
     */
    async setupOptionalServices() {
        try {
            // Service Worker
            if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
                await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registrado');
            }
            
            // Analytics (placeholder)
            if (this.config.enableAnalytics) {
                console.log('📊 Analytics configurado');
            }
            
            this.updateProgress(95, 'Servicios opcionales configurados');
            
        } catch (error) {
            console.warn('⚠️ Error configurando servicios opcionales:', error);
            // No es crítico, continuamos
        }
    }
    
    /**
     * Finalizar inicialización
     */
    async finalizeInit() {
        try {
            // Determinar vista inicial
            const isAuthenticated = this.authManager.isAuthenticated();
            const initialView = isAuthenticated ? 'dashboard' : 'login';
            
            this.appState.setState('ui.currentView', initialView);
            this.appState.setState('system.loading', false);
            this.appState.setLoadTime();
            
            this.initialized = true;
            
            this.updateProgress(100, 'Aplicación lista');
            
            // Mostrar stats de performance en debug
            if (this.config.debug) {
                const initTime = Date.now() - this.startTime;
                console.log(`⚡ Aplicación iniciada en ${initTime}ms`);
                console.log('🎯 Para debug usa: window.debug');
            }
            
            // Pequeño delay para mostrar el 100%
            setTimeout(() => {
                this.appState.addNotification('success', '🎉 ¡Sistema listo!', { duration: 3000 });
            }, 500);
            
        } catch (error) {
            console.error('❌ Error finalizando inicialización:', error);
            throw error;
        }
    }
    
    /**
     * Manejar errores de inicialización
     */
    handleInitError(error) {
        this.initError = error;
        
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fee2e2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="max-width: 500px; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center;">
                        <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">❌ Error de Inicialización</h1>
                        <p style="color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5;">
                            No se pudo inicializar la aplicación correctamente.
                        </p>
                        <details style="text-align: left; margin-bottom: 1.5rem;">
                            <summary style="cursor: pointer; color: #4b5563; font-weight: 500;">Ver detalles técnicos</summary>
                            <pre style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 6px; font-size: 0.875rem; overflow: auto; color: #dc2626;">${error.message}</pre>
                        </details>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                🔄 Recargar
                            </button>
                            <button onclick="localStorage.clear(); location.reload()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                🗑️ Limpiar y Recargar
                            </button>
                        </div>
                        <p style="margin-top: 1rem; font-size: 0.875rem; color: #9ca3af;">
                            Si el problema persiste, contacta al soporte técnico.
                        </p>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Manejar errores globales durante la ejecución
     */
    handleGlobalError(error, type) {
        if (this.appState && this.initialized) {
            this.appState.trackError();
            this.appState.addNotification('error', `Error del sistema: ${error.message}`, {
                persistent: true
            });
        } else {
            console.error(`💥 Error global (${type}):`, error);
        }
    }
    
    /**
     * Quick actions modal
     */
    showQuickActions() {
        if (!this.appState) return;
        
        const actions = [
            { key: 'L', label: '🔐 Toggle Login/Dashboard', action: () => this.toggleView() },
            { key: 'D', label: '🐛 Toggle Debug', action: () => this.toggleDebugMode() },
            { key: 'N', label: '🔔 Test Notification', action: () => this.testNotification() },
            { key: 'C', label: '🗑️ Clear Cache', action: () => this.appState.clearCache() },
            { key: 'R', label: '🔄 Reload App', action: () => location.reload() }
        ];
        
        console.log('⚡ Quick Actions:');
        actions.forEach(action => {
            console.log(`  ${action.key}: ${action.label}`);
        });
        
        this.appState.addNotification('info', '⚡ Quick Actions mostradas en consola', { duration: 3000 });
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        if (this.appState) {
            const currentDebug = this.appState.getState('system.debug');
            this.appState.setState('system.debug', !currentDebug);
            this.appState.addNotification('info', `🐛 Debug ${!currentDebug ? 'activado' : 'desactivado'}`);
        }
    }
    
    /**
     * Toggle entre login y dashboard (para testing)
     */
    toggleView() {
        if (!this.appState) return;
        
        const currentView = this.appState.getState('ui.currentView');
        const newView = currentView === 'login' ? 'dashboard' : 'login';
        
        if (newView === 'dashboard' && !this.authManager.isAuthenticated()) {
            // Simular login
            this.appState.setAuth(
                { email: 'test@sistema.com', id: 'test-id' },
                null,
                { nombre: 'Usuario Test', apellido: 'Sistema' }
            );
        } else if (newView === 'login') {
            this.appState.clearAuth();
        }
    }
    
    /**
     * Test de notificación
     */
    testNotification() {
        if (this.appState) {
            const types = ['success', 'error', 'warning', 'info'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            this.appState.addNotification(randomType, `🎯 Notificación de prueba (${randomType})`);
        }
    }
    
    /**
     * Getters públicos
     */
    getVersion() { return this.version; }
    getInitTime() { return this.initialized ? Date.now() - this.startTime : null; }
    isInitialized() { return this.initialized; }
    getInitError() { return this.initError; }
    
    /**
     * Cleanup al cerrar
     */
    destroy() {
        try {
            this.appState?.destroy();
            console.log('🧹 Aplicación limpiada');
        } catch (error) {
            console.error('❌ Error limpiando aplicación:', error);
        }
    }
}

// Auto-inicializar la aplicación
window.app = new AppMainV2();

// Cleanup al cerrar la ventana
window.addEventListener('beforeunload', () => {
    window.app?.destroy();
});

console.log('📦 AppMain V2 cargado - Aplicación iniciándose...');
