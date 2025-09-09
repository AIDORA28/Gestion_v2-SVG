/**
 * 🎯 MANEJADOR DE EVENTOS PARA LOGIN
 * Solo eventos y lógica de UI para login.html
 */

// ================================
// 🚀 INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Login handler cargado');
    
    // 🔒 SESSION GUARD: Verificar si ya hay sesión activa
    checkExistingSession();
    
    // Inicializar Notyf
    window.notyf = new Notyf(window.CONFIG?.NOTYF_CONFIG || {
        duration: 4000,
        position: { x: 'right', y: 'top' },
        types: [
            { type: 'success', background: '#10b981', icon: false },
            { type: 'error', background: '#ef4444', icon: false },
            { type: 'warning', background: '#f59e0b', icon: false },
            { type: 'info', background: '#3b82f6', icon: false }
        ]
    });
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Configurar eventos
    setupEventListeners();
    
    // Verificar API
    setTimeout(() => {
        if (window.auth) {
            window.auth.checkAPIStatus();
        }
    }, 1000);
});

// ================================
// 🎮 CONFIGURAR EVENTOS
// ================================

function setupEventListeners() {
    // Evento del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar icono
            const icon = togglePassword.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
                lucide.createIcons();
            }
        });
    }
    
    // Eventos de input para feedback visual
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearInputError);
    });
}

// ================================
// 🔐 MANEJAR LOGIN
// ================================

async function handleLogin(event) {
    event.preventDefault();
    
    console.log('🔐 Procesando login...');
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const email = formData.get('email')?.trim();
    const password = formData.get('password')?.trim();
    
    // Validación básica
    if (!email || !password) {
        showFormError('Por favor complete todos los campos');
        return;
    }
    
    if (!isValidEmail(email)) {
        showFormError('Por favor ingrese un correo válido');
        return;
    }
    
    // Mostrar loading
    setFormLoading(true);
    
    try {
        // Llamar función de login
        if (window.auth && typeof window.auth.login === 'function') {
            const success = await window.auth.login(email, password);
            
            if (!success) {
                setFormLoading(false);
            }
            // Si success es true, la redirección se maneja en simple-auth.js
        } else {
            throw new Error('Sistema de autenticación no disponible');
        }
        
    } catch (error) {
        console.error('💥 Error en login:', error);
        showFormError('Error inesperado. Intente nuevamente.');
        setFormLoading(false);
    }
}

// ================================
// 🎨 FUNCIONES DE UI
// ================================

function setFormLoading(loading) {
    const submitBtn = document.getElementById('loginBtn');
    const loader = document.getElementById('loader');
    const form = document.getElementById('loginForm');
    
    if (loading) {
        // Deshabilitar formulario
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = true);
        }
        
        // Cambiar texto del botón
        if (submitBtn) {
            submitBtn.innerHTML = `
                <div class="custom-loader inline-block mr-2"></div>
                Iniciando sesión...
            `;
        }
        
        // Mostrar loader global
        if (loader) {
            loader.style.display = 'flex';
        }
        
    } else {
        // Habilitar formulario
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = false);
        }
        
        // Restaurar texto del botón
        if (submitBtn) {
            submitBtn.innerHTML = `
                <i data-lucide="log-in" class="inline h-5 w-5 mr-2"></i>
                Iniciar Sesión
            `;
            lucide.createIcons();
        }
        
        // Ocultar loader global
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

function showFormError(message) {
    if (window.notyf) {
        window.notyf.error(message);
    } else {
        alert('ERROR: ' + message);
    }
}

function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remover clases de error previas
    clearInputError(event);
    
    // Validar según tipo
    let isValid = true;
    let errorMessage = '';
    
    if (input.type === 'email') {
        isValid = value && isValidEmail(value);
        errorMessage = 'Correo electrónico inválido';
    } else if (input.type === 'password') {
        isValid = value.length >= 3;
        errorMessage = 'Contraseña muy corta';
    } else if (input.required) {
        isValid = value.length > 0;
        errorMessage = 'Este campo es requerido';
    }
    
    // Aplicar estilos de error
    if (!isValid) {
        input.classList.add('border-red-500', 'bg-red-50');
        input.classList.remove('border-gray-300');
        
        // Mostrar mensaje de error
        showInputError(input, errorMessage);
    }
    
    return isValid;
}

function clearInputError(event) {
    const input = event.target;
    input.classList.remove('border-red-500', 'bg-red-50');
    input.classList.add('border-gray-300');
    
    // Remover mensaje de error
    const errorElement = input.parentNode.querySelector('.input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function showInputError(input, message) {
    // Remover error previo
    const existingError = input.parentNode.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Crear nuevo mensaje de error
    const errorElement = document.createElement('div');
    errorElement.className = 'input-error text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    // Insertar después del input
    input.parentNode.appendChild(errorElement);
}

// ================================
// � SESSION GUARD
// ================================

function checkExistingSession() {
    console.log('🔒 Verificando sesión existente...');
    
    try {
        // Verificar si hay datos de sesión en localStorage
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('currentUser');
        const expiresAt = localStorage.getItem('token_expires_at');
        
        if (!token || !userStr) {
            console.log('❌ No hay sesión activa');
            return;
        }
        
        // Verificar si el token no ha expirado
        if (expiresAt) {
            const timeLeft = parseInt(expiresAt) - Date.now();
            if (timeLeft <= 0) {
                console.log('⏰ Token expirado, limpiando sesión');
                clearExpiredSession();
                return;
            }
        }
        
        // Validar datos del usuario
        const userData = JSON.parse(userStr);
        if (!userData.nombre || !userData.email) {
            console.log('❌ Datos de usuario inválidos');
            clearExpiredSession();
            return;
        }
        
        // ✅ Sesión válida encontrada - redirigir al dashboard
        console.log('✅ Sesión activa encontrada:', userData.nombre);
        
        // Mostrar mensaje informativo
        if (window.notyf) {
            window.notyf.info(`Ya tienes una sesión activa como ${userData.nombre}`);
        }
        
        // Mostrar loader mientras redirige
        setFormLoading(true);
        
        // Redireccionar al dashboard después de un momento
        setTimeout(() => {
            console.log('🔄 Redirigiendo al dashboard...');
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('💥 Error verificando sesión:', error);
        clearExpiredSession();
    }
}

function clearExpiredSession() {
    console.log('🧹 Limpiando sesión expirada/inválida');
    
    // Limpiar todos los datos de sesión
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('token_expires_at');
}

// ================================
// �🔍 UTILIDADES
// ================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================================
// 🌐 EXPORTAR FUNCIONES
// ================================

window.loginHandler = {
    handleLogin,
    setFormLoading,
    showFormError,
    validateInput,
    checkExistingSession,
    clearExpiredSession
};

console.log('🎯 Login handler listo con Session Guard');
