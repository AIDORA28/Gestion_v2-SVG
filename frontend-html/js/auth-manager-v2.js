/**
 * 🔐 AuthManager V2 - Sistema de Autenticación Avanzado
 * Equivalente a: AuthContext + useAuth + Firebase Auth
 * 
 * Características principales:
 * ✅ Login/Register/Logout completo
 * ✅ Validaciones de seguridad
 * ✅ Manejo de errores detallado
 * ✅ Integración con Supabase
 * ✅ Profile management
 * ✅ Session persistence
 * ✅ Password validation
 * ✅ Rate limiting
 */

class AuthManagerV2 {
    constructor(appState, supabase) {
        console.log('🔐 Inicializando AuthManager V2...');
        
        this.appState = appState;
        this.supabase = supabase;
        
        // Rate limiting
        this.attempts = {
            login: [],
            register: []
        };
        
        this.maxAttempts = 5;
        this.cooldownTime = 5 * 60 * 1000; // 5 minutos
        
        this.init();
    }
    
    async init() {
        try {
            console.log('⚡ AuthManager V2 iniciando...');
            
            // Verificar sesión existente
            await this.checkExistingSession();
            
            // Configurar listeners
            this.setupAuthListeners();
            
            console.log('✅ AuthManager V2 inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando AuthManager:', error);
            this.appState.setAuthError('Error inicializando autenticación');
        }
    }
    
    /**
     * Verificar sesión existente
     */
    async checkExistingSession() {
        try {
            this.appState.setState('auth.loading', true);
            
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session?.user) {
                console.log('✅ Sesión existente encontrada');
                
                // Cargar perfil
                const profile = await this.loadUserProfile(session.user.id);
                
                this.appState.setAuth(session.user, session, profile);
                
            } else {
                console.log('ℹ️ No hay sesión activa');
                this.appState.setState('auth.loading', false);
            }
            
        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            this.appState.setState('auth.loading', false);
        }
    }
    
    /**
     * Configurar listeners de Supabase
     */
    setupAuthListeners() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`🔄 Auth event: ${event}`, session?.user?.email);
            
            switch (event) {
                case 'SIGNED_IN':
                    if (session?.user) {
                        const profile = await this.loadUserProfile(session.user.id);
                        this.appState.setAuth(session.user, session, profile);
                    }
                    break;
                    
                case 'SIGNED_OUT':
                    this.appState.clearAuth();
                    this.appState.setState('ui.currentView', 'login');
                    break;
                    
                case 'TOKEN_REFRESHED':
                    if (session?.user) {
                        this.appState.setState('auth.session', session);
                    }
                    break;
            }
        });
    }
    
    /**
     * Login de usuario
     */
    async login(email, password) {
        try {
            console.log(`🔐 Intentando login: ${email}`);
            
            // Validar rate limiting
            if (this.isRateLimited('login')) {
                throw new Error('Demasiados intentos. Intenta de nuevo en unos minutos.');
            }
            
            // Validaciones
            this.validateEmail(email);
            this.validatePassword(password);
            
            this.appState.setState('auth.loading', true);
            this.appState.setState('auth.error', null);
            
            // Intentar login
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password: password
            });
            
            if (error) {
                this.recordAttempt('login');
                throw error;
            }
            
            if (!data.user) {
                throw new Error('Error inesperado en el login');
            }
            
            console.log('✅ Login exitoso:', data.user.email);
            
            // Reset attempts on success
            this.attempts.login = [];
            
            // El listener se encargará del resto
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            
            const errorMessage = this.parseAuthError(error);
            this.appState.setAuthError(errorMessage);
            
            throw new Error(errorMessage);
        }
    }
    
    /**
     * Registro de usuario
     */
    async register(userData) {
        try {
            console.log(`📝 Intentando registro: ${userData.email}`);
            
            // Validar rate limiting
            if (this.isRateLimited('register')) {
                throw new Error('Demasiados intentos. Intenta de nuevo en unos minutos.');
            }
            
            // Validaciones
            this.validateRegistrationData(userData);
            
            this.appState.setState('auth.loading', true);
            this.appState.setState('auth.error', null);
            
            // Registrar en Supabase Auth
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: userData.email.toLowerCase().trim(),
                password: userData.password,
                options: {
                    data: {
                        nombre: userData.nombre,
                        apellido: userData.apellido
                    }
                }
            });
            
            if (authError) {
                this.recordAttempt('register');
                throw authError;
            }
            
            if (!authData.user) {
                throw new Error('Error creando la cuenta');
            }
            
            console.log('✅ Usuario registrado:', authData.user.email);
            
            // Crear perfil en la tabla users
            if (authData.user.id) {
                await this.createUserProfile(authData.user.id, {
                    email: userData.email,
                    nombre: userData.nombre,
                    apellido: userData.apellido
                });
            }
            
            // Reset attempts on success
            this.attempts.register = [];
            
            // Si necesita confirmación por email
            if (!authData.session) {
                this.appState.addNotification(
                    'info',
                    '📧 Revisa tu email para confirmar tu cuenta',
                    { duration: 8000 }
                );
                
                // Ir al login después del registro
                setTimeout(() => {
                    this.appState.setState('ui.currentView', 'login');
                }, 3000);
                
            } else {
                // Login automático
                console.log('✅ Sesión creada automáticamente');
            }
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            
            const errorMessage = this.parseAuthError(error);
            this.appState.setAuthError(errorMessage);
            
            throw new Error(errorMessage);
        }
    }
    
    /**
     * Logout de usuario
     */
    async logout() {
        try {
            console.log('🚪 Cerrando sesión...');
            
            this.appState.setState('auth.loading', true);
            
            const { error } = await this.supabase.auth.signOut();
            
            if (error) throw error;
            
            console.log('✅ Sesión cerrada');
            
            // Limpiar estado local
            this.appState.clearAuth();
            this.appState.clearCache();
            this.appState.clearNotifications();
            
            // Ir al login
            this.appState.setState('ui.currentView', 'login');
            
            this.appState.addNotification('success', '👋 Sesión cerrada correctamente');
            
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            this.appState.setAuthError('Error cerrando la sesión');
        }
    }
    
    /**
     * Cargar perfil del usuario
     */
    async loadUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                console.warn('⚠️ No se pudo cargar el perfil:', error.message);
                return null;
            }
            
            console.log('✅ Perfil cargado:', data.email);
            return data;
            
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            return null;
        }
    }
    
    /**
     * Crear perfil de usuario
     */
    async createUserProfile(userId, userData) {
        try {
            const profileData = {
                id: userId,
                email: userData.email,
                nombre: userData.nombre,
                apellido: userData.apellido,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('users')
                .insert([profileData]);
            
            if (error) {
                console.warn('⚠️ Error creando perfil:', error.message);
                return;
            }
            
            console.log('✅ Perfil creado:', userData.email);
            
        } catch (error) {
            console.error('❌ Error creando perfil:', error);
        }
    }
    
    /**
     * Validaciones
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw new Error('El email es requerido');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('El formato del email no es válido');
        }
    }
    
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('La contraseña es requerida');
        }
        
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
    }
    
    validateRegistrationData(data) {
        // Validar email y password
        this.validateEmail(data.email);
        this.validatePassword(data.password);
        
        // Validar nombre
        if (!data.nombre || data.nombre.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        // Validar apellido
        if (!data.apellido || data.apellido.trim().length < 2) {
            throw new Error('El apellido debe tener al menos 2 caracteres');
        }
        
        // Validar confirmación de contraseña
        if (data.password !== data.confirmPassword) {
            throw new Error('Las contraseñas no coinciden');
        }
        
        // Validar caracteres especiales en nombre/apellido
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!nameRegex.test(data.nombre)) {
            throw new Error('El nombre solo puede contener letras y espacios');
        }
        
        if (!nameRegex.test(data.apellido)) {
            throw new Error('El apellido solo puede contener letras y espacios');
        }
    }
    
    /**
     * Rate limiting
     */
    isRateLimited(action) {
        const now = Date.now();
        
        // Limpiar intentos antiguos
        this.attempts[action] = this.attempts[action].filter(
            attempt => now - attempt < this.cooldownTime
        );
        
        return this.attempts[action].length >= this.maxAttempts;
    }
    
    recordAttempt(action) {
        this.attempts[action].push(Date.now());
    }
    
    /**
     * Parser de errores de Supabase
     */
    parseAuthError(error) {
        if (!error) return 'Error desconocido';
        
        const message = error.message || error.toString();
        
        // Errores comunes de Supabase
        if (message.includes('Invalid login credentials')) {
            return 'Email o contraseña incorrectos';
        }
        
        if (message.includes('User already registered')) {
            return 'Este email ya está registrado';
        }
        
        if (message.includes('Password should be at least')) {
            return 'La contraseña debe tener al least 6 caracteres';
        }
        
        if (message.includes('Invalid email')) {
            return 'El formato del email no es válido';
        }
        
        if (message.includes('Email not confirmed')) {
            return 'Debes confirmar tu email antes de iniciar sesión';
        }
        
        if (message.includes('Too many requests')) {
            return 'Demasiados intentos. Intenta de nuevo más tarde';
        }
        
        if (message.includes('Network request failed')) {
            return 'Error de conexión. Verifica tu internet';
        }
        
        // Errores de validación locales
        if (message.includes('email es requerido') || 
            message.includes('contraseña es requerida') ||
            message.includes('formato del email') ||
            message.includes('contraseña debe tener') ||
            message.includes('contraseñas no coinciden') ||
            message.includes('nombre debe tener') ||
            message.includes('apellido debe tener') ||
            message.includes('solo puede contener') ||
            message.includes('Demasiados intentos')) {
            return message;
        }
        
        // Error genérico
        console.error('Error de auth no categorizado:', error);
        return 'Error de autenticación. Intenta de nuevo';
    }
    
    /**
     * Utilidades
     */
    getCurrentUser() {
        return this.appState.getState('auth.user');
    }
    
    getCurrentProfile() {
        return this.appState.getState('auth.profile');
    }
    
    isAuthenticated() {
        return this.appState.getState('auth.isAuthenticated');
    }
    
    isLoading() {
        return this.appState.getState('auth.loading');
    }
    
    getAuthError() {
        return this.appState.getState('auth.error');
    }
    
    /**
     * Reset password (futuro)
     */
    async resetPassword(email) {
        try {
            this.validateEmail(email);
            
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            
            if (error) throw error;
            
            this.appState.addNotification(
                'success',
                '📧 Te hemos enviado un link para resetear tu contraseña',
                { duration: 8000 }
            );
            
        } catch (error) {
            console.error('❌ Error reseteando contraseña:', error);
            throw new Error(this.parseAuthError(error));
        }
    }
    
    /**
     * Update profile (futuro)
     */
    async updateProfile(updates) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) throw new Error('No hay usuario autenticado');
            
            const { error } = await this.supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', currentUser.id);
            
            if (error) throw error;
            
            // Recargar perfil
            const updatedProfile = await this.loadUserProfile(currentUser.id);
            this.appState.setState('auth.profile', updatedProfile);
            
            this.appState.addNotification('success', '✅ Perfil actualizado');
            
        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            throw new Error('Error actualizando el perfil');
        }
    }
}

// Export global
window.AuthManagerV2 = AuthManagerV2;

console.log('📦 AuthManager V2 módulo cargado');
