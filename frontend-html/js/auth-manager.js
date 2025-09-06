/**
 * 🔐 SISTEMA DE AUTENTICACIÓN AVANZADO V2
 * Equivale a AuthContext + useAuth + API calls en React
 */

class AuthManagerV2 {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        
        console.log('🔐 AuthManagerV2 inicializado');
    }
    
    /**
     * Inicializar AuthManager
     */
    async init() {
        try {
            // Verificar que Supabase esté disponible
            if (!window.supabaseClient) {
                console.error('❌ Supabase client no disponible');
                return false;
            }
            
            this.supabase = window.supabaseClient;
            this.initialized = true;
            
            console.log('✅ AuthManagerV2 inicializado con Supabase');
            return true;
            
        } catch (error) {
            console.error('❌ Error inicializando AuthManagerV2:', error);
            return false;
        }
    }
    
    /**
     * Login de usuario (equivale a signInWithEmailAndPassword)
     */
    static async login(email, password) {
        try {
            console.log('🔑 Iniciando login para:', email);
            
            // Verificar campos requeridos
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }
            
            // Mostrar loading
            AuthManagerV2.setLoginLoading(true);
            window.appState.setState('loading', true);
            
            // Verificar Supabase
            if (!window.supabaseClient) {
                throw new Error('Servicio de autenticación no disponible');
            }
            
            // Ejecutar login
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });
            
            if (error) {
                console.error('❌ Error en login:', error);
                throw new Error(AuthManagerV2.getErrorMessage(error));
            }
            
            console.log('✅ Login exitoso:', data.user.email);
            
            // Mostrar notificación de éxito
            window.appState.showNotification(
                `¡Bienvenido ${data.user.email}!`, 
                'success'
            );
            
            // El estado se actualizará automáticamente por el listener de auth
            // No necesitamos hacer setState manual aquí
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            
            // Mostrar error al usuario
            AuthManagerV2.showAuthError(error.message);
            
            // Limpiar loading
            window.appState.setState('loading', false);
            
        } finally {
            AuthManagerV2.setLoginLoading(false);
        }
    }
    
    /**
     * Registro de usuario (equivale a createUserWithEmailAndPassword + createProfile)
     */
    static async register(userData) {
        try {
            console.log('📝 Iniciando registro para:', userData.email);
            
            // Validar datos
            const validation = AuthManagerV2.validateRegisterData(userData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // Mostrar loading
            AuthManagerV2.setRegisterLoading(true);
            window.appState.setState('loading', true);
            
            // Verificar Supabase
            if (!window.supabaseClient) {
                throw new Error('Servicio de autenticación no disponible');
            }
            
            // Ejecutar registro en Auth
            const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                options: {
                    data: {
                        nombre: userData.nombre,
                        apellido: userData.apellido
                    }
                }
            });
            
            if (authError) {
                console.error('❌ Error en registro Auth:', authError);
                throw new Error(AuthManagerV2.getErrorMessage(authError));
            }
            
            console.log('✅ Usuario creado en Auth:', authData.user?.email);
            
            // Crear perfil de usuario si el registro fue exitoso
            if (authData.user) {
                try {
                    await AuthManagerV2.createUserProfile(authData.user.id, userData);
                    console.log('✅ Perfil de usuario creado');
                } catch (profileError) {
                    console.warn('⚠️ Error creando perfil (no crítico):', profileError);
                    // No fallar el registro por esto
                }
            }
            
            // Mostrar mensaje de éxito
            window.appState.showNotification(
                '¡Registro exitoso! Revisa tu email para confirmar tu cuenta.',
                'success',
                8000 // 8 segundos
            );
            
            // Redirigir a login después de un momento
            setTimeout(() => {
                window.appState.setState('currentView', 'login');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            
            // Mostrar error al usuario
            AuthManagerV2.showAuthError(error.message);
            
        } finally {
            AuthManagerV2.setRegisterLoading(false);
            window.appState.setState('loading', false);
        }
    }
    
    /**
     * Crear perfil de usuario en la base de datos
     */
    static async createUserProfile(userId, userData) {
        try {
            const profileData = {
                id: userId,
                nombre: userData.nombre.trim(),
                apellido: userData.apellido.trim(),
                dni: userData.dni.trim(),
                edad: parseInt(userData.edad),
                email: userData.email.trim().toLowerCase(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await window.supabaseClient
                .from('perfiles_usuario')
                .insert([profileData])
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error creando perfil:', error);
                throw error;
            }
            
            console.log('✅ Perfil creado:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Error en createUserProfile:', error);
            throw error;
        }
    }
    
    /**
     * Logout de usuario
     */
    static async logout() {
        try {
            console.log('🚪 Cerrando sesión...');
            
            if (!window.supabaseClient) {
                throw new Error('Servicio de autenticación no disponible');
            }
            
            // Ejecutar logout
            const { error } = await window.supabaseClient.auth.signOut();
            
            if (error) {
                console.error('❌ Error en logout:', error);
                // No lanzar error, intentar limpiar de todas formas
            }
            
            console.log('✅ Logout exitoso');
            
            // Mostrar notificación
            window.appState.showNotification(
                'Sesión cerrada correctamente',
                'success'
            );
            
            // El estado se limpiará automáticamente por el listener de auth
            
        } catch (error) {
            console.error('❌ Error en logout:', error);
            
            // Forzar limpieza de estado aunque haya error
            window.appState.clearUserData();
        }
    }
    
    /**
     * Verificar si el usuario está autenticado
     */
    static async checkAuthState() {
        try {
            if (!window.supabaseClient) {
                return { user: null, session: null };
            }
            
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.error('❌ Error verificando sesión:', error);
                return { user: null, session: null };
            }
            
            return {
                user: session?.user || null,
                session: session
            };
            
        } catch (error) {
            console.error('❌ Error en checkAuthState:', error);
            return { user: null, session: null };
        }
    }
    
    /**
     * Validar datos de registro
     */
    static validateRegisterData(userData) {
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email || !emailRegex.test(userData.email)) {
            return { valid: false, error: 'Email inválido' };
        }
        
        // Validar contraseña
        if (!userData.password || userData.password.length < 6) {
            return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        // Validar nombre
        if (!userData.nombre || userData.nombre.trim().length < 2) {
            return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
        }
        
        // Validar apellido
        if (!userData.apellido || userData.apellido.trim().length < 2) {
            return { valid: false, error: 'El apellido debe tener al menos 2 caracteres' };
        }
        
        // Validar DNI
        const dniRegex = /^\d{7,8}$/;
        if (!userData.dni || !dniRegex.test(userData.dni)) {
            return { valid: false, error: 'El DNI debe tener 7 u 8 dígitos' };
        }
        
        // Validar edad
        const edad = parseInt(userData.edad);
        if (!edad || edad < 18 || edad > 100) {
            return { valid: false, error: 'La edad debe estar entre 18 y 100 años' };
        }
        
        return { valid: true };
    }
    
    /**
     * Obtener mensaje de error amigable
     */
    static getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email o contraseña incorrectos',
            'User already registered': 'Este email ya está registrado',
            'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
            'Invalid email': 'Email inválido',
            'Email not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada',
            'Too many requests': 'Demasiados intentos. Intenta nuevamente en unos minutos',
            'Network error': 'Error de conexión. Verifica tu internet'
        };
        
        // Buscar mensaje específico
        for (const [key, value] of Object.entries(errorMessages)) {
            if (error.message && error.message.includes(key)) {
                return value;
            }
        }
        
        // Mensaje por defecto
        return error.message || 'Error desconocido. Intenta nuevamente';
    }
    
    /**
     * Mostrar error de autenticación en la UI
     */
    static showAuthError(message) {
        // Mostrar en notificación global
        window.appState.showNotification(message, 'error', 6000);
        
        // También mostrar en el contenedor de auth si existe
        const statusContainer = document.getElementById('auth-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status status-error">
                    <div class="status-icon">❌</div>
                    <div class="status-message">${message}</div>
                </div>
            `;
            
            // Auto-ocultar después de 8 segundos
            setTimeout(() => {
                statusContainer.innerHTML = '';
            }, 8000);
        }
    }
    
    /**
     * Mostrar éxito de autenticación
     */
    static showAuthSuccess(message) {
        window.appState.showNotification(message, 'success');
        
        const statusContainer = document.getElementById('auth-status');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status status-success">
                    <div class="status-icon">✅</div>
                    <div class="status-message">${message}</div>
                </div>
            `;
            
            setTimeout(() => {
                statusContainer.innerHTML = '';
            }, 5000);
        }
    }
    
    /**
     * Controlar loading del botón de login
     */
    static setLoginLoading(loading) {
        const btn = document.getElementById('loginBtn');
        if (!btn) return;
        
        const textSpan = btn.querySelector('.btn-text');
        const loadingSpan = btn.querySelector('.btn-loading');
        
        if (loading) {
            btn.disabled = true;
            btn.classList.add('loading');
            if (textSpan) textSpan.style.display = 'none';
            if (loadingSpan) loadingSpan.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('loading');
            if (textSpan) textSpan.style.display = 'inline-flex';
            if (loadingSpan) loadingSpan.classList.add('hidden');
        }
    }
    
    /**
     * Controlar loading del botón de registro
     */
    static setRegisterLoading(loading) {
        const btn = document.getElementById('registerBtn');
        if (!btn) return;
        
        const textSpan = btn.querySelector('.btn-text');
        const loadingSpan = btn.querySelector('.btn-loading');
        
        if (loading) {
            btn.disabled = true;
            btn.classList.add('loading');
            if (textSpan) textSpan.style.display = 'none';
            if (loadingSpan) loadingSpan.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('loading');
            if (textSpan) textSpan.style.display = 'inline-flex';
            if (loadingSpan) loadingSpan.classList.add('hidden');
        }
    }
}

// Instancia global
if (!window.AuthManagerV2) {
    window.AuthManagerV2 = AuthManagerV2;
}

console.log('🔐 AuthManagerV2 class definida');
