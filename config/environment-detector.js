/**
 * 🔍 DETECTOR AUTOMÁTICO DE ENTORNO
 * Carga la configuración correcta según el entorno
 */

class EnvironmentDetector {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = null;
    }

    detectEnvironment() {
        // Detectar entorno desde diferentes fuentes
        
        // 1. Variable de entorno NODE_ENV (backend)
        if (typeof process !== 'undefined' && process.env) {
            if (process.env.NODE_ENV === 'production') return 'production';
            if (process.env.NODE_ENV === 'development') return 'local';
        }
        
        // 2. Detectar desde hostname (frontend)
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            
            // Producción: Vercel domains
            if (hostname.includes('vercel.app') || 
                hostname.includes('netlify.app') || 
                !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
                return 'production';
            }
            
            // Local: localhost o 127.0.0.1
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return 'local';
            }
        }
        
        // 3. Detectar desde puerto (backend)
        if (typeof process !== 'undefined' && process.env.PORT) {
            // Vercel usa puerto dinámico
            if (process.env.VERCEL || process.env.VERCEL_ENV) {
                return 'production';
            }
        }
        
        // Por defecto: local para desarrollo
        return 'local';
    }

    async loadConfig() {
        try {
            if (this.environment === 'production') {
                // Cargar configuración de producción
                if (typeof window !== 'undefined') {
                    // Frontend: cargar script dinámicamente
                    await this.loadScript('/config/config-production.js');
                } else {
                    // Backend: require directo
                    this.config = require('./config-production.js');
                }
                console.log('🌐 Configuración PRODUCCIÓN cargada');
            } else {
                // Cargar configuración local
                if (typeof window !== 'undefined') {
                    // Frontend: cargar script dinámicamente
                    await this.loadScript('/config/config-local.js');
                } else {
                    // Backend: require directo
                    this.config = require('./config-local.js');
                }
                console.log('🏠 Configuración LOCAL cargada');
            }
            
            // Agregar información del entorno detectado
            if (typeof window !== 'undefined' && window.CONFIG) {
                window.CONFIG.DETECTED_ENV = this.environment;
                window.CONFIG.AUTO_DETECTED = true;
            }
            
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            // Fallback a configuración básica
            this.loadFallbackConfig();
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    loadFallbackConfig() {
        const fallbackConfig = {
            API_URL: this.environment === 'production' ? '' : 'http://localhost:5000',
            APP_NAME: 'PLANIFICAPRO',
            VERSION: '2.0.0',
            ENV: this.environment,
            DETECTED_ENV: this.environment,
            FALLBACK_MODE: true
        };
        
        if (typeof window !== 'undefined') {
            window.CONFIG = fallbackConfig;
        }
        
        this.config = fallbackConfig;
        console.warn('⚠️ Usando configuración de emergencia');
    }

    getConfig() {
        return this.config || window.CONFIG;
    }

    isProduction() {
        return this.environment === 'production';
    }

    isLocal() {
        return this.environment === 'local';
    }
}

// Inicializar detector automáticamente
const envDetector = new EnvironmentDetector();

// Para frontend: cargar configuración inmediatamente
if (typeof window !== 'undefined') {
    envDetector.loadConfig().then(() => {
        console.log(`🎯 Entorno detectado: ${envDetector.environment.toUpperCase()}`);
        
        // Disparar evento personalizado cuando la configuración esté lista
        window.dispatchEvent(new CustomEvent('configLoaded', { 
            detail: { 
                environment: envDetector.environment,
                config: window.CONFIG 
            }
        }));
    });
}

// Export para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = envDetector;
}

// Hacer detector disponible globalmente
if (typeof window !== 'undefined') {
    window.EnvironmentDetector = envDetector;
}
