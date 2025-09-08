/**
 * 🔐 AUTENTICACIÓN SIMPLE Y LIMPIA
 * Solo funciones de login sin clases ni complicaciones
 */

// ================================
// 🔧 CONFIGURACIÓN
// ================================

const API_BASE_URL = window.CONFIG?.API_URL || 'http://localhost:5000';

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
            
            // Guardar en localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Guardar email como "token" para compatibilidad con dashboard
            localStorage.setItem('auth_token', user.email);
            
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
        const response = await fetch(`${API_BASE_URL}/health`);
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
// 🚀 INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Auth system cargado');
    
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
    showMessage
};

console.log('🔐 Sistema de autenticación simple cargado');
