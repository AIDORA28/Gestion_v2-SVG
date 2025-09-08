/**
 * 🔧 CONFIGURACIÓN PARA SERVIDOR LOCAL
 * Sobrescribe la configuración de producción para pruebas locales
 */

// Configuración del API para servidor local
window.CONFIG_LOCAL = {
    API_BASE_URL: 'http://localhost:3001',
    ENVIRONMENT: 'local',
    DEBUG: true
};

// Sobrescribir configuración si estamos en local
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.API_BASE_URL = window.CONFIG_LOCAL.API_BASE_URL;
    console.log('🔧 Configuración LOCAL activada');
    console.log('📍 API URL:', window.API_BASE_URL);
    
    // Mostrar mensaje de desarrollo
    const devBanner = document.createElement('div');
    devBanner.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
            🚀 MODO DESARROLLO LOCAL - Servidor: http://localhost:3001
        </div>
    `;
    document.body.appendChild(devBanner);
    
    // Ajustar margen del body para el banner
    document.body.style.marginTop = '35px';
}
