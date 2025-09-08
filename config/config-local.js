/**
 * 🏠 CONFIGURACIÓN ENTORNO LOCAL - DESARROLLO
 * PostgreSQL + Laragon + desarrollo local
 */

const LOCAL_CONFIG = {
    // Configuración de Base de Datos Local (Laragon PostgreSQL)
    DATABASE: {
        HOST: '127.0.0.1',
        PORT: 5434,
        DATABASE: 'gestion_presupuesto',
        USER: 'postgres',
        PASSWORD: 'root'
    },
    
    // API Local
    API_URL: 'http://localhost:5000',
    
    // Configuración de la aplicación
    APP_NAME: 'PLANIFICAPRO',
    VERSION: '2.0.0-dev',
    ENV: 'development',
    
    // Configuración de desarrollo
    DEBUG: true,
    DETAILED_LOGS: true,
    
    // URLs del frontend
    FRONTEND_URL: 'http://localhost:3000',
    
    // Configuración de notificaciones (development)
    NOTIFICATIONS: {
        duration: 6000, // Más tiempo en desarrollo para debug
        showDebugInfo: true
    }
};

// Hacer configuración disponible globalmente
window.CONFIG = LOCAL_CONFIG;

console.log('🏠 Configuración LOCAL cargada');
console.log('🗄️ Base de datos:', `${LOCAL_CONFIG.DATABASE.HOST}:${LOCAL_CONFIG.DATABASE.PORT}`);
console.log('🌐 API URL:', LOCAL_CONFIG.API_URL);

// Export para Node.js (backend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOCAL_CONFIG;
}
