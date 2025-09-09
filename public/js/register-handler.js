/**
 * 📝 REGISTER HANDLER - PATRÓN SUPABASE MODERNO
 * ✅ Supabase Auth - Autenticación integrada
 * ✅ Supabase Database - PostgreSQL con APIs automáticas
 * ✅ API Service JavaScript - CRUD completo client-side
 * Siguiendo el patrón exacto de login y dashboard
 */

class RegisterHandler {
    constructor() {
        // 🎯 CONFIGURACIÓN SUPABASE (patrón moderno)
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        
        // 🎨 UI Components
        this.notyf = null;
        
        console.log('📝 RegisterHandler moderno inicializado');
    }

    /**
     * 🚀 INICIALIZACIÓN
     */
    init() {
        console.log('🚀 Inicializando RegisterHandler...');
        
        // Inicializar Notyf
        this.notyf = new Notyf({
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
        this.setupEventListeners();
        
        console.log('✅ RegisterHandler listo');
    }

    /**
     * 🎮 CONFIGURAR EVENTOS
     */
    setupEventListeners() {
        // Evento del formulario de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
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
            input.addEventListener('blur', (e) => this.validateInput(e));
            input.addEventListener('input', (e) => this.handleInputChange(e));
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
    }

    /**
     * 📝 MANEJAR REGISTRO (patrón Supabase moderno)
     */
    async handleRegister(event) {
        event.preventDefault();
        
        console.log('📝 Procesando registro con Supabase directo...');
        
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
            direccion: formData.get('direccion')?.trim() || null
        };
        
        // Validación básica
        if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
            this.showFormError('Por favor complete todos los campos requeridos');
            return;
        }
        
        if (!this.isValidEmail(userData.email)) {
            this.showFormError('Por favor ingrese un correo válido');
            return;
        }
        
        if (userData.password.length < 6) {
            this.showFormError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        // Verificar términos y condiciones
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            this.showFormError('Debe aceptar los términos y condiciones');
            return;
        }
        
        // Mostrar loading
        this.setFormLoading(true);
        
        try {
            // 🎯 REGISTRO DIRECTO CON SUPABASE (patrón moderno)
            const success = await this.registerWithSupabase(userData);
            
            if (success) {
                // Registro exitoso
                this.showFormSuccess('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                
                // Redireccionar a login después de un momento
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.setFormLoading(false);
            }
            
        } catch (error) {
            console.error('💥 Error en registro:', error);
            this.showFormError(error.message || 'Error inesperado. Intente nuevamente.');
            this.setFormLoading(false);
        }
    }

    /**
     * 🔐 REGISTRO DIRECTO CON SUPABASE (patrón dashboard)
     */
    async registerWithSupabase(userData) {
        try {
            // 📝 PASO 1: CREAR USUARIO EN AUTH
            this.updateLoadingMessage('Creando cuenta...');
            console.log('🔐 Creando usuario en Supabase Auth...');
            
            const signupResponse = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    data: {
                        nombre: userData.nombre,
                        apellido: userData.apellido
                    }
                })
            });

            if (!signupResponse.ok) {
                const errorData = await signupResponse.json();
                throw new Error(errorData.msg || 'Error al crear cuenta');
            }

            const signupData = await signupResponse.json();
            console.log('✅ Usuario creado en Supabase Auth');

            // 📝 PASO 2: OBTENER JWT TOKEN
            this.updateLoadingMessage('Obteniendo permisos...');
            let userJWT = null;
            
            if (!signupData.session || !signupData.session.access_token) {
                console.log('🔄 Haciendo login inmediato para obtener JWT...');
                
                // Login inmediato después del signup
                const loginResponse = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: userData.email,
                        password: userData.password
                    })
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    userJWT = loginData.access_token;
                    console.log('✅ JWT obtenido via login inmediato');
                } else {
                    console.log('⚠️ No se pudo obtener JWT, usuario creado solo en Auth');
                    return true; // Usuario creado en Auth, suficiente
                }
            } else {
                userJWT = signupData.session.access_token;
                console.log('✅ JWT obtenido directamente del signup');
            }

            // 📝 PASO 3: GUARDAR DATOS EN BASE DE DATOS
            this.updateLoadingMessage('Guardando información...');
            const userInsertResponse = await fetch(`${this.supabaseUrl}/rest/v1/usuarios`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${userJWT}`, // 🎯 USAR JWT DEL USUARIO
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    id: signupData.user.id,
                    nombre: userData.nombre,
                    apellido: userData.apellido,
                    email: userData.email,
                    telefono: userData.telefono || null,
                    fecha_nacimiento: userData.fecha_nacimiento || null,
                    dni: userData.dni || null,
                    genero: userData.genero || null,
                    estado_civil: userData.estado_civil || null,
                    numero_hijos: userData.numero_hijos || 0,
                    profesion: userData.profesion || null,
                    nacionalidad: userData.nacionalidad || null,
                    direccion: userData.direccion || null,
                    password_hash: 'managed_by_supabase_auth',
                    email_verified: false,
                    active: true
                })
            });

            if (!userInsertResponse.ok) {
                const errorData = await userInsertResponse.json();
                console.error('❌ Error insertando en tabla usuarios:', errorData);
                throw new Error(`Error guardando datos: ${errorData.message || 'Error desconocido'}`);
            } else {
                console.log('✅ Usuario insertado en tabla usuarios');
            }

            // 📝 PASO 4: COMPLETADO
            this.updateLoadingMessage('¡Registro completado!');

            return true;

        } catch (error) {
            console.error('💥 Error en registro Supabase:', error);
            throw error;
        }
    }

    /**
     * 🎨 FUNCIONES DE UI
     */
    setFormLoading(loading) {
        const submitBtn = document.getElementById('registerBtn');
        const loader = document.getElementById('loader');
        const form = document.getElementById('registerForm');
        
        if (loading) {
            // Deshabilitar formulario
            if (form) {
                const inputs = form.querySelectorAll('input, button, select');
                inputs.forEach(input => input.disabled = true);
            }
            
            // Cambiar texto del botón - mensaje inicial
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <div class="register-loader inline-block mr-2"></div>
                    Iniciando registro...
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

    /**
     * 🔄 ACTUALIZAR MENSAJE DE CARGA
     */
    updateLoadingMessage(message) {
        const submitBtn = document.getElementById('registerBtn');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <div class="register-loader inline-block mr-2"></div>
                ${message}
            `;
        }
        console.log(`🔄 ${message}`);
    }

    showFormError(message) {
        if (this.notyf) {
            this.notyf.error(message);
        } else {
            alert('ERROR: ' + message);
        }
    }

    showFormSuccess(message) {
        if (this.notyf) {
            this.notyf.success(message);
        } else {
            alert('ÉXITO: ' + message);
        }
    }

    validateInput(event) {
        const input = event.target;
        const value = input.value.trim();
        
        // Remover clases de error previas
        this.clearInputError(event);
        
        // Validar según tipo
        let isValid = true;
        let errorMessage = '';
        
        if (input.type === 'email') {
            isValid = value && this.isValidEmail(value);
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
            this.showInputError(input, errorMessage);
        } else if (value.length > 0) {
            input.classList.add('input-success-border');
            input.classList.remove('input-error-border');
        }
        
        return isValid;
    }

    handleInputChange(event) {
        const input = event.target;
        
        // Limpiar errores mientras el usuario escribe
        if (input.value.trim().length > 0) {
            this.clearInputError(event);
        }
    }

    clearInputError(event) {
        const input = event.target;
        input.classList.remove('input-error-border');
        
        // Remover mensaje de error
        const errorElement = input.parentNode.querySelector('.input-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showInputError(input, message) {
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

    /**
     * 🔍 UTILIDADES
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateForm() {
        const form = document.getElementById('registerForm');
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const event = { target: input };
            if (!this.validateInput(event)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
}

// ================================
// 🚀 INICIALIZACIÓN GLOBAL
// ================================

let registerHandler;

document.addEventListener('DOMContentLoaded', function() {
    registerHandler = new RegisterHandler();
    registerHandler.init();
    
    // Hacer disponible globalmente para compatibilidad
    window.registerHandler = registerHandler;
});

console.log('✅ Register handler moderno cargado');
