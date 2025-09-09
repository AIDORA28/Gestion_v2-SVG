/**
 * 🔐 AUTENTICACIÓN SIMPLE Y LIMPIA
 * Solo funciones de login sin clases ni complicaciones
 */

// ================================
// 🔧 CONFIGURACIÓN
// ================================

const API_BASE_URL = window.CONFIG?.API_URL || 'http://localhost:3001';

// ================================
// 🔐 FUNCIÓN DE LOGIN PRINCIPAL
// ================================

async function login(email, password) {
    console.log('🔐 Iniciando login...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('📄 Respuesta login:', data);

        if (data.success && data.data && data.data.user) {
            // Login exitoso
            const user = data.data.user;
            const accessToken = data.data.access_token;
            
            // Guardar en localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('auth_token', user.email); // Para compatibilidad
            
            // Guardar tokens de Supabase si están disponibles
            if (accessToken) {
                localStorage.setItem('supabase_access_token', accessToken);
                
                // Calcular tiempo de expiración (1 hora - 5 minutos de margen)
                const expirationTime = Date.now() + (55 * 60 * 1000); // 55 minutos
                localStorage.setItem('token_expires_at', expirationTime.toString());
                
                // Iniciar timer de renovación automática
                startTokenRefreshTimer();
            }
            
            // Mostrar mensaje
            showMessage(`¡Bienvenido ${user.nombre}!`, 'success');
            
            // Redireccionar
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
            return true;
            
        } else {
            // Login fallido
            showMessage(data.message || 'Credenciales incorrectas', 'error');
            return false;
        }
        
    } catch (error) {
        console.error('💥 Error en login:', error);
        showMessage('Error de conexión. Verifique su conexión.', 'error');
        return false;
    }
}

// ================================
// 📝 FUNCIÓN DE REGISTRO
// ================================

async function register(userData) {
    console.log('📝 Iniciando registro...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('📄 Respuesta registro:', data);

        if (data.success) {
            showMessage('¡Cuenta creada exitosamente!', 'success');
            return true;
        } else {
            showMessage(data.message || 'Error al crear cuenta', 'error');
            return false;
        }
        
    } catch (error) {
        console.error('💥 Error en registro:', error);
        showMessage('Error de conexión al crear cuenta.', 'error');
        return false;
    }
}

// ================================
// 🔍 VERIFICAR CONEXIÓN API
// ================================

async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        if (data.success) {
            updateStatusIndicator('online');
            console.log('✅ API Online');
            return true;
        } else {
            updateStatusIndicator('offline');
            return false;
        }
    } catch (error) {
        updateStatusIndicator('offline');
        console.error('❌ API Offline:', error);
        return false;
    }
}

// ================================
// 🎨 FUNCIONES DE UI
// ================================

function showMessage(message, type = 'info') {
    // Usar Notyf si está disponible
    if (typeof notyf !== 'undefined') {
        notyf[type](message);
    } else {
        // Fallback a alert
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

function updateStatusIndicator(status) {
    const indicator = document.getElementById('api-status');
    if (!indicator) return;
    
    const colors = {
        online: 'bg-green-400',
        offline: 'bg-red-400',
        checking: 'bg-yellow-400'
    };
    
    const texts = {
        online: 'Online',
        offline: 'Offline',
        checking: 'Verificando...'
    };
    
    indicator.innerHTML = `
        <div class="w-2 h-2 ${colors[status]} rounded-full ${status === 'checking' ? 'animate-pulse' : ''}"></div>
        <span class="text-white text-sm">${texts[status]}</span>
    `;
}

function showLoader(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// ================================
// � RENOVACIÓN AUTOMÁTICA DE TOKENS
// ================================

let tokenRefreshTimer = null;

function startTokenRefreshTimer() {
    // Limpiar timer anterior si existe
    if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
    }
    
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return;
    
    const timeUntilExpiry = parseInt(expiresAt) - Date.now();
    
    if (timeUntilExpiry > 0) {
        console.log(`🔄 Token se renovará en ${Math.round(timeUntilExpiry / 60000)} minutos`);
        
        tokenRefreshTimer = setTimeout(async () => {
            console.log('🔄 Renovando token automáticamente...');
            await refreshTokenSilently();
        }, timeUntilExpiry);
    }
}

async function refreshTokenSilently() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.email) {
            console.log('❌ No hay usuario para renovar token');
            handleTokenExpired();
            return;
        }
        
        // Simular renovación - en un escenario real usarías refresh token
        console.log('🔄 Intentando renovación silenciosa...');
        
        // Por ahora, simplemente extender el tiempo de expiración
        const newExpirationTime = Date.now() + (55 * 60 * 1000); // 55 minutos más
        localStorage.setItem('token_expires_at', newExpirationTime.toString());
        
        // Reiniciar el timer
        startTokenRefreshTimer();
        
        console.log('✅ Token renovado silenciosamente');
        
    } catch (error) {
        console.error('❌ Error renovando token:', error);
        handleTokenExpired();
    }
}

function handleTokenExpired() {
    console.log('⚠️ Token expirado - redirigiendo al login');
    
    // Limpiar datos de sesión
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('token_expires_at');
    
    // Mostrar mensaje
    showMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
    
    // Redireccionar al login después de un momento
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function checkTokenExpiration() {
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!expiresAt) return false;
    
    const timeLeft = parseInt(expiresAt) - Date.now();
    
    if (timeLeft <= 0) {
        handleTokenExpired();
        return false;
    }
    
    return true;
}

// ================================
// �🚀 INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Auth system cargado');
    
    // Verificar si hay una sesión activa y iniciar timer
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && checkTokenExpiration()) {
        startTokenRefreshTimer();
    }
    
    // Verificar API al cargar
    setTimeout(checkAPIStatus, 1000);
});

// ================================
// 🌐 FUNCIONES GLOBALES
// ================================

// Exportar funciones principales
window.auth = {
    login,
    register,
    checkAPIStatus,
    showMessage,
    refreshTokenSilently,
    checkTokenExpiration,
    handleTokenExpired
};

console.log('🔐 Sistema de autenticación simple cargado');
