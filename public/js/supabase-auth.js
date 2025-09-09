/**
 * 🔐 AUTENTICACIÓN SUPABASE DIRECTO
 * Implementación completa sin backend local
 */

// ================================
// 🔧 CONFIGURACIÓN SUPABASE
// ================================

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// ================================
// 🔐 FUNCIÓN DE LOGIN SUPABASE DIRECTO
// ================================

async function loginSupabase(email, password) {
    console.log('🔐 Login con Supabase directo...');
    
    try {
        // 1. Autenticar con Supabase Auth
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!authResponse.ok) {
            const errorData = await authResponse.json();
            console.error('❌ Error autenticación:', errorData);
            throw new Error(errorData.msg || 'Credenciales incorrectas');
        }

        const authData = await authResponse.json();
        console.log('✅ Autenticación exitosa');

        // 2. Obtener datos del usuario desde tabla usuarios
        const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?email=eq.${email}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${authData.access_token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Error obteniendo datos del usuario');
        }

        const users = await userResponse.json();
        if (users.length === 0) {
            throw new Error('Usuario no encontrado en la tabla usuarios');
        }

        const userData = users[0];
        console.log('✅ Datos de usuario obtenidos');

        // 3. Guardar sesión en localStorage
        const sessionData = {
            id: userData.id,
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            telefono: userData.telefono,
            fecha_nacimiento: userData.fecha_nacimiento
        };

        localStorage.setItem('currentUser', JSON.stringify(sessionData));
        localStorage.setItem('auth_token', authData.access_token);
        localStorage.setItem('supabase_access_token', authData.access_token);
        
        // Calcular tiempo de expiración
        const expirationTime = Date.now() + (55 * 60 * 1000); // 55 minutos
        localStorage.setItem('token_expires_at', expirationTime.toString());

        console.log('💾 Sesión guardada en localStorage');

        // 4. Mostrar mensaje y redireccionar
        showMessage(`¡Bienvenido ${userData.nombre}!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

        return true;

    } catch (error) {
        console.error('💥 Error en login:', error);
        showMessage(error.message || 'Error de autenticación', 'error');
        return false;
    }
}

// ================================
// 📝 FUNCIÓN DE REGISTRO SUPABASE
// ================================

async function registerSupabase(userData) {
    console.log('📝 Registro con Supabase directo...');
    
    try {
        // 1. Crear usuario en Supabase Auth
        const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
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

        // 2. Insertar en tabla usuarios
        const userInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
                password_hash: 'managed_by_supabase_auth',
                email_verified: false,
                active: true
            })
        });

        if (!userInsertResponse.ok) {
            console.error('❌ Error insertando en tabla usuarios');
            // Continuar anyway, porque el usuario ya se creó en Auth
        } else {
            console.log('✅ Usuario insertado en tabla usuarios');
        }

        showMessage('¡Cuenta creada exitosamente! Revisa tu email para confirmar.', 'success');
        
        // Redireccionar a login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

        return true;

    } catch (error) {
        console.error('💥 Error en registro:', error);
        showMessage(error.message || 'Error al crear cuenta', 'error');
        return false;
    }
}

// ================================
// 🚪 FUNCIÓN DE LOGOUT
// ================================

function logoutSupabase() {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('token_expires_at');
    
    showMessage('Sesión cerrada correctamente', 'info');
    
    // Redireccionar
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ================================
// 🔍 VERIFICAR SESIÓN EXISTENTE
// ================================

function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('supabase_access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (currentUser && token && expiresAt) {
        const now = Date.now();
        const expiration = parseInt(expiresAt);
        
        if (now < expiration) {
            console.log('✅ Sesión válida encontrada, redirigiendo a dashboard');
            window.location.href = 'dashboard.html';
            return true;
        } else {
            console.log('⏰ Sesión expirada, limpiando localStorage');
            logoutSupabase();
        }
    }
    
    return false;
}

// ================================
// 🎨 FUNCIONES DE UI
// ================================

function showMessage(message, type = 'info') {
    if (typeof notyf !== 'undefined') {
        notyf[type](message);
    } else {
        alert(message);
    }
}

// ================================
// 🌐 OBJETO GLOBAL DE AUTENTICACIÓN
// ================================

window.supabaseAuth = {
    login: loginSupabase,
    register: registerSupabase,
    logout: logoutSupabase,
    checkSession: checkExistingSession
};

console.log('✅ Autenticación Supabase directo cargada');
