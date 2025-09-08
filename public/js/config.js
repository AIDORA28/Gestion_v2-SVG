/**
 * 🔧 CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * SISTEMA DUAL DE ENTORNOS - CARGA AUTOMÁTICA
 */

// Importar detector de entorno
// Este script se carga antes que cualquier otro
(function() {
    // Función para cargar script dinámicamente
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Cargar detector de entorno primero
    loadScript('/config/environment-detector.js').then(() => {
        console.log('🔍 Detector de entorno cargado');
        
        // Escuchar cuando la configuración esté lista
        window.addEventListener('configLoaded', (event) => {
            const { environment, config } = event.detail;
            
            // Configuración de Notyf (igual para ambos entornos)
            const NOTYF_CONFIG = {
                duration: config.NOTIFICATIONS?.duration || 4000,
                position: { x: 'right', y: 'top' },
                types: [
                    { type: 'warning', background: 'orange', icon: '⚠️' },
                    { type: 'error', background: '#dc2626', icon: '❌' },
                    { type: 'success', background: '#16a34a', icon: '✅' },
                    { type: 'info', background: '#3b82f6', icon: 'ℹ️' }
                ]
            };

            // Agregar configuración de notificaciones al config global
            window.CONFIG.NOTYF = NOTYF_CONFIG;
            window.NOTYF_CONFIG = NOTYF_CONFIG;

            console.log(`🎯 Configuración ${environment.toUpperCase()} cargada exitosamente`);
            console.log('🔧 CONFIG disponible globalmente:', window.CONFIG);
            
            // Disparar evento de que todo está listo
            window.dispatchEvent(new CustomEvent('appConfigReady', {
                detail: { environment, config: window.CONFIG }
            }));
        });
    }).catch(error => {
        console.error('❌ Error cargando detector de entorno:', error);
        
        // Configuración de emergencia
        const fallbackConfig = {
            API_URL: window.location.hostname === 'localhost' ? 'http://localhost:5000' : '',
            APP_NAME: 'PLANIFICAPRO',
            VERSION: '2.0.0',
            ENV: 'fallback',
            ERROR_MODE: true
        };
        
        window.CONFIG = fallbackConfig;
        console.warn('⚠️ Usando configuración de emergencia');
    });
})();
