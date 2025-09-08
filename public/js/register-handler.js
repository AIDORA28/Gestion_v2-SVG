/**
 * 🎯 MANEJADOR DE EVENTOS PARA REGISTER
 * Solo eventos y lógica de UI para register.html
 */

// ================================
// 🚀 INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Register handler cargado');
    
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
    // Evento del formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
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
    
    // Validación en tiempo real
    const inputs = document.querySelectorAll('input[required], input[type="email"]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', handleInputChange);
    });
    
    // Validación especial para DNI
    const dniInput = document.getElementById('dni');
    if (dniInput) {
        dniInput.addEventListener('input', function(e) {
            // Solo números
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Validación especial para número de hijos
    const numeroHijosInput = document.getElementById('numero_hijos');
    if (numeroHijosInput) {
        numeroHijosInput.addEventListener('input', function(e) {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 0) {
                e.target.value = 0;
            } else if (value > 20) {
                e.target.value = 20;
            }
        });
    }
    
    // Validación especial para campos financieros
    const financialInputs = ['ingresos_mensuales', 'gastos_fijos'];
    financialInputs.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', function(e) {
                let value = parseFloat(e.target.value);
                if (isNaN(value) || value < 0) {
                    e.target.value = '';
                }
            });
        }
    });
}

// ================================
// 📝 MANEJAR REGISTRO
// ================================

async function handleRegister(event) {
    event.preventDefault();
    
    console.log('📝 Procesando registro...');
    
    // Obtener datos del formulario
    const formData = new FormData(event.target);
    const userData = {
        nombre: formData.get('nombre')?.trim(),
        apellido: formData.get('apellido')?.trim(),
        email: formData.get('email')?.trim(),
        password: formData.get('password')?.trim(),
        dni: formData.get('dni')?.trim() || null,
        telefono: formData.get('telefono')?.trim() || null,
        fecha_nacimiento: formData.get('fecha_nacimiento') || null,
        genero: formData.get('genero') || null,
        estado_civil: formData.get('estado_civil') || null,
        numero_hijos: parseInt(formData.get('numero_hijos')) || 0,
        profesion: formData.get('profesion')?.trim() || null,
        nacionalidad: formData.get('nacionalidad') || null,
        direccion: formData.get('direccion')?.trim() || null,
        ingresos_mensuales: parseFloat(formData.get('ingresos_mensuales')) || 0.00,
        gastos_fijos: parseFloat(formData.get('gastos_fijos')) || 0.00
    };
    
    // Validación básica
    if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
        showFormError('Por favor complete todos los campos requeridos');
        return;
    }
    
    if (!isValidEmail(userData.email)) {
        showFormError('Por favor ingrese un correo válido');
        return;
    }
    
    if (userData.password.length < 6) {
        showFormError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Verificar términos y condiciones
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        showFormError('Debe aceptar los términos y condiciones');
        return;
    }
    
    // Mostrar loading
    setFormLoading(true);
    
    try {
        // Llamar función de registro
        if (window.auth && typeof window.auth.register === 'function') {
            const success = await window.auth.register(userData);
            
            if (success) {
                // Registro exitoso
                showFormSuccess('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                
                // Redireccionar a login después de un momento
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                setFormLoading(false);
            }
        } else {
            throw new Error('Sistema de registro no disponible');
        }
        
    } catch (error) {
        console.error('💥 Error en registro:', error);
        showFormError('Error inesperado. Intente nuevamente.');
        setFormLoading(false);
    }
}

// ================================
// 🎨 FUNCIONES DE UI
// ================================

function setFormLoading(loading) {
    const submitBtn = document.getElementById('registerBtn');
    const loader = document.getElementById('loader');
    const form = document.getElementById('registerForm');
    
    if (loading) {
        // Deshabilitar formulario
        if (form) {
            const inputs = form.querySelectorAll('input, button, select');
            inputs.forEach(input => input.disabled = true);
        }
        
        // Cambiar texto del botón
        if (submitBtn) {
            submitBtn.innerHTML = `
                <div class="register-loader inline-block mr-2"></div>
                Creando cuenta...
            `;
        }
        
        // Mostrar loader global
        if (loader) {
            loader.style.display = 'flex';
        }
        
    } else {
        // Habilitar formulario
        if (form) {
            const inputs = form.querySelectorAll('input, button, select');
            inputs.forEach(input => input.disabled = false);
        }
        
        // Restaurar texto del botón
        if (submitBtn) {
            submitBtn.innerHTML = `
                <i data-lucide="user-plus" class="inline h-5 w-5 mr-2"></i>
                Crear Cuenta
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

function showFormSuccess(message) {
    if (window.notyf) {
        window.notyf.success(message);
    } else {
        alert('ÉXITO: ' + message);
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
        isValid = value.length >= 6;
        errorMessage = 'Contraseña debe tener al menos 6 caracteres';
    } else if (input.required) {
        isValid = value.length > 0;
        errorMessage = 'Este campo es requerido';
    }
    
    // Aplicar estilos de validación
    if (!isValid) {
        input.classList.add('input-error-border');
        input.classList.remove('input-success-border');
        showInputError(input, errorMessage);
    } else if (value.length > 0) {
        input.classList.add('input-success-border');
        input.classList.remove('input-error-border');
    }
    
    return isValid;
}

function handleInputChange(event) {
    const input = event.target;
    
    // Limpiar errores mientras el usuario escribe
    if (input.value.trim().length > 0) {
        clearInputError(event);
    }
}

function clearInputError(event) {
    const input = event.target;
    input.classList.remove('input-error-border');
    
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
    
    // Insertar después del input (o del div relativo si existe)
    const container = input.parentNode.classList.contains('relative') ? input.parentNode : input;
    container.parentNode.appendChild(errorElement);
}

// ================================
// 🔍 UTILIDADES
// ================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm() {
    const form = document.getElementById('registerForm');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const event = { target: input };
        if (!validateInput(event)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// ================================
// 🌐 EXPORTAR FUNCIONES
// ================================

window.registerHandler = {
    handleRegister,
    setFormLoading,
    showFormError,
    showFormSuccess,
    validateInput,
    validateForm
};

console.log('🎯 Register handler listo');
