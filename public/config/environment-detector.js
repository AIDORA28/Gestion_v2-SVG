/**
 * 🔍 DETECTOR DE ENTORNO AUTOMÁTICO
 * Detecta si estamos en desarrollo o producción y carga la configuración apropiada
 */

(function() {
    // Detectar entorno basado en hostname
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    console.log(`🌍 Hostname detectado: ${hostname}`);
    console.log(`🎯 Entorno: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

    // Configuraciones por entorno
    const ENVIRONMENTS = {
        development: {
            API_URL: 'http://localhost:5000',
            FRONTEND_URL: 'http://localhost:3000',
            DATABASE_TYPE: 'postgresql-local',
            DEBUG: true,
            ENV: 'development'
        },
        production: {
            API_URL: '', // Mismo dominio (Vercel Functions)
            FRONTEND_URL: window.location.origin,
            DATABASE_TYPE: 'supabase-cloud',
            DEBUG: false,
            ENV: 'production'
        }
    };

    // Configuración base común
    const BASE_CONFIG = {
        APP_NAME: 'PLANIFICAPRO',
        VERSION: '2.0.1',
        NOTIFICATIONS: {
            duration: 4000,
            position: 'top-right'
        },
        ENDPOINTS: {
            HEALTH: '/health',
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            INGRESOS: '/api/ingresos',
            GASTOS: '/api/gastos',
            CATEGORIAS: '/api/categorias',
            METAS: '/api/metas',
            CREDITO: '/api/simulacion-credito',
            REPORTES: '/api/reportes'
        }
    };

    // Seleccionar configuración según entorno
    const environment = isProduction ? 'production' : 'development';
    const envConfig = ENVIRONMENTS[environment];
    
    // Configuración final
    const finalConfig = {
        ...BASE_CONFIG,
        ...envConfig,
        ENVIRONMENT: environment,
        IS_PRODUCTION: isProduction,
        IS_DEVELOPMENT: !isProduction
    };

    // Hacer disponible globalmente
    window.CONFIG = finalConfig;
    window.ENV = environment;
    window.IS_PRODUCTION = isProduction;

    // Log de configuración
    console.log('🔧 Configuración cargada:');
    console.log('📡 API_URL:', finalConfig.API_URL);
    console.log('🌐 FRONTEND_URL:', finalConfig.FRONTEND_URL);
    console.log('🗄️ DATABASE_TYPE:', finalConfig.DATABASE_TYPE);
    console.log('🐛 DEBUG:', finalConfig.DEBUG);
    
    // Disparar evento de configuración lista
    window.dispatchEvent(new CustomEvent('configLoaded', {
        detail: {
            environment,
            config: finalConfig
        }
    }));

    // Función helper para hacer requests a la API
    window.apiRequest = async function(endpoint, options = {}) {
        const url = finalConfig.API_URL + endpoint;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            console.log(`📡 API Request: ${finalOptions.method || 'GET'} ${url}`);
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ API Response:', data);
            return data;
            
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    };

    console.log('✅ Environment detector inicializado correctamente');
})();
