/*
🔐 SIMPLE AUTH - Archivo de Autenticación Básico
Este archivo proporciona funciones de autenticación básicas
para evitar errores de referencias faltantes
*/

console.log('🔐 Simple Auth cargado');

// Funciones básicas de autenticación
window.simpleAuth = {
    // Token de usuario actual
    currentToken: null,
    
    // ID de usuario actual  
    currentUserId: null,
    
    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return this.currentToken !== null;
    },
    
    // Obtener token actual
    getToken() {
        return this.currentToken || localStorage.getItem('auth_token');
    },
    
    // Obtener ID de usuario actual
    getUserId() {
        return this.currentUserId || localStorage.getItem('user_id');
    },
    
    // Establecer autenticación
    setAuth(token, userId) {
        this.currentToken = token;
        this.currentUserId = userId;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', userId);
    },
    
    // Limpiar autenticación
    clearAuth() {
        this.currentToken = null;
        this.currentUserId = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
    },
    
    // Verificar autenticación desde localStorage
    checkStoredAuth() {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        
        if (token && userId) {
            this.currentToken = token;
            this.currentUserId = userId;
            return true;
        }
        return false;
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    window.simpleAuth.checkStoredAuth();
    console.log('🔐 Simple Auth inicializado');
});

// Compatibilidad con el resto del sistema
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.simpleAuth;
}
