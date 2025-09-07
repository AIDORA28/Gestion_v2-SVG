/**
 * 🔐 AUTENTICACIÓN PARA SISTEMA POSTGRESQL
 * Sin Supabase - Solo PostgreSQL + Node.js Backend
 */

// ================================
// 🛡️ MANAGER DE AUTENTICACIÓN
// ================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authKey = 'budget_auth_session';
        this.userKey = 'budget_user_data';
        
        // Inicializar desde localStorage
        this.loadSession();
        
        console.log('🔐 AuthManager PostgreSQL inicializado');
    }

    // ===== GESTIÓN DE SESIÓN =====

    loadSession() {
        try {
            const authData = localStorage.getItem(this.authKey);
            const userData = localStorage.getItem(this.userKey);
            
            if (authData && userData) {
                const authInfo = JSON.parse(authData);
                const userInfo = JSON.parse(userData);
                
                // Verificar si la sesión no ha expirado (24 horas)
                const now = Date.now();
                const sessionAge = now - authInfo.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas
                
                if (sessionAge < maxAge) {
                    this.isAuthenticated = true;
                    this.currentUser = userInfo;
                    console.log('✅ Sesión recuperada:', userInfo.email);
                } else {
                    this.clearSession();
                    console.log('⏰ Sesión expirada');
                }
            }
        } catch (error) {
            console.error('❌ Error cargando sesión:', error);
            this.clearSession();
        }
    }

    saveSession(userData) {
        try {
            const authData = {
                timestamp: Date.now(),
                isAuthenticated: true
            };
            
            localStorage.setItem(this.authKey, JSON.stringify(authData));
            localStorage.setItem(this.userKey, JSON.stringify(userData));
            
            this.isAuthenticated = true;
            this.currentUser = userData;
            
            console.log('✅ Sesión guardada:', userData.email);
        } catch (error) {
            console.error('❌ Error guardando sesión:', error);
        }
    }

    clearSession() {
        localStorage.removeItem(this.authKey);
        localStorage.removeItem(this.userKey);
        this.isAuthenticated = false;
        this.currentUser = null;
        console.log('🗑️ Sesión eliminada');
    }

    // ===== REGISTRO =====

    async register(formData) {
        try {
            UTILS.showLoading(true);
            
            console.log('📝 Iniciando registro...', formData.email);
            
            // Validar datos
            if (!this.validateRegistrationData(formData)) {
                throw new Error('Datos de registro inválidos');
            }

            // Preparar datos para API
            const userData = {
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password,
                telefono: formData.telefono || null,
                fecha_nacimiento: formData.fecha_nacimiento || null,
                genero: formData.genero || null,
                estado_civil: formData.estado_civil || 'soltero',
                ingresos_mensuales: parseFloat(formData.ingresos_mensuales || 0),
                gastos_fijos: parseFloat(formData.gastos_fijos || 0),
                objetivo_ahorro: formData.objetivo_ahorro || null
            };

            // Llamar a la API
            const result = await API_CLIENT.crearUsuario(userData);
            
            if (result.success && result.user) {
                // Guardar sesión
                this.saveSession(result.user);
                
                UTILS.showNotification('¡Registro exitoso! Bienvenido(a)', 'success');
                
                // Redirigir al dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
                
                return { success: true, user: result.user };
            } else {
                throw new Error(result.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('❌ Error en registro:', error);
            UTILS.showNotification(error.message || 'Error en el registro', 'error');
            throw error;
        } finally {
            UTILS.showLoading(false);
        }
    }

    // ===== LOGIN =====

    async login(email, password) {
        try {
            UTILS.showLoading(true);
            
            console.log('🔑 Iniciando login...', email);
            
            // Validar formato de email
            if (!UTILS.isValidEmail(email)) {
                throw new Error('Formato de email inválido');
            }

            if (!password || password.length < 4) {
                throw new Error('Contraseña debe tener al menos 4 caracteres');
            }

            // Llamar a la API (puedes implementar endpoint de login)
            // Por ahora, simulamos buscando usuario por email
            const usuarios = await API_CLIENT.getUsuarios();
            const usuario = usuarios.data.find(u => u.email === email);
            
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            // NOTA: En producción, la validación de contraseña debe ser en el backend
            // Aquí simulas la validación (implementar bcrypt en backend)
            
            // Simular login exitoso (implementar validación real en backend)
            this.saveSession(usuario);
            
            UTILS.showNotification('¡Login exitoso! Bienvenido(a)', 'success');
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1500);
            
            return { success: true, user: usuario };

        } catch (error) {
            console.error('❌ Error en login:', error);
            UTILS.showNotification(error.message || 'Error en el login', 'error');
            throw error;
        } finally {
            UTILS.showLoading(false);
        }
    }

    // ===== LOGOUT =====

    logout() {
        try {
            this.clearSession();
            UTILS.showNotification('Sesión cerrada correctamente', 'info');
            
            // Redirigir al home
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error en logout:', error);
        }
    }

    // ===== VALIDACIONES =====

    validateRegistrationData(data) {
        const errors = [];

        // Nombre requerido
        if (!data.nombre || data.nombre.trim().length < 2) {
            errors.push('Nombre debe tener al menos 2 caracteres');
        }

        // Email requerido y válido
        if (!data.email || !UTILS.isValidEmail(data.email)) {
            errors.push('Email requerido y válido');
        }

        // Contraseña requerida
        if (!data.password || data.password.length < 6) {
            errors.push('Contraseña debe tener al menos 6 caracteres');
        }

        // Confirmar contraseña
        if (data.password !== data.confirm_password) {
            errors.push('Las contraseñas no coinciden');
        }

        // Mostrar errores si existen
        if (errors.length > 0) {
            UTILS.showNotification(errors[0], 'error');
            return false;
        }

        return true;
    }

    // ===== PROTECCIÓN DE PÁGINAS =====

    requireAuth(redirectTo = '/auth.html') {
        if (!this.isAuthenticated) {
            console.log('🚫 Acceso denegado - Login requerido');
            UTILS.showNotification('Debes iniciar sesión', 'warning');
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    requireGuest(redirectTo = '/dashboard.html') {
        if (this.isAuthenticated) {
            console.log('🔄 Usuario autenticado - Redirigiendo a dashboard');
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    // ===== GETTERS =====

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }
}

// ================================
// 🚀 INICIALIZACIÓN GLOBAL
// ================================

// Crear instancia global
const authManager = new AuthManager();

// Hacer disponible globalmente
window.AUTH_MANAGER = authManager;

// Funciones globales para compatibilidad
window.requireAuth = () => authManager.requireAuth();
window.requireGuest = () => authManager.requireGuest();
window.getCurrentUser = () => authManager.getCurrentUser();
window.isLoggedIn = () => authManager.isLoggedIn();

console.log('🔐 Sistema de autenticación PostgreSQL listo');
