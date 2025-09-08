/**
 * 🔧 CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * Configuraciones centralizadas para PLANIFICAPRO
 */

// Configuración de API
const CONFIG = {
    API_URL: 'http://localhost:5000',
    APP_NAME: 'PLANIFICAPRO',
    VERSION: '2.0.0'
};

// Configuración de Notyf (notificaciones)
const NOTYF_CONFIG = {
    duration: 4000,
    position: { x: 'right', y: 'top' },
    types: [
        { type: 'warning', background: 'orange', icon: '⚠️' },
        { type: 'error', background: '#dc2626', icon: '❌' },
        { type: 'success', background: '#16a34a', icon: '✅' },
        { type: 'info', background: '#3b82f6', icon: 'ℹ️' }
    ]
};

// Hacer configuración disponible globalmente
window.CONFIG = CONFIG;
window.NOTYF_CONFIG = NOTYF_CONFIG;

console.log('🔧 config.js cargado - API URL:', CONFIG.API_URL);
