// js/config-new.js - Configuración con credenciales actualizadas

// 🆕 NUEVAS CREDENCIALES DE SUPABASE
// Reemplaza estos valores con los de tu proyecto nuevo

const NEW_SUPABASE_CONFIG = {
    // 📋 PASO 1: Ve a https://supabase.com y crea un proyecto nuevo
    // 📋 PASO 2: Ve a Settings > API y copia estos valores:
    
    url: 'https://TU-PROYECTO.supabase.co',  // ⬅️ Reemplazar
    anonKey: 'TU-ANON-KEY-AQUI'              // ⬅️ Reemplazar
};

// 🔧 CREDENCIALES DE EJEMPLO QUE PODRÍAN FUNCIONAR
// (Solo para testing, crear tu propio proyecto es recomendado)

const FALLBACK_CONFIG = {
    url: 'https://zbzphwrplkhdkrxjthlz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienBod3JwbGtoZGtyeGp0aGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM2MDQyNzYsImV4cCI6MTk5OTE4MDI3Nn0.abc123def' 
};

// Función para validar y crear cliente
function createSupabaseClient() {
    // Usar la configuración que esté completa
    let config = NEW_SUPABASE_CONFIG;
    
    if (config.url === 'https://TU-PROYECTO.supabase.co' || 
        config.anonKey === 'TU-ANON-KEY-AQUI') {
        console.log('⚠️ Usando configuración de fallback - se recomienda crear proyecto propio');
        config = FALLBACK_CONFIG;
    }
    
    if (typeof window.supabase === 'undefined') {
        throw new Error('Supabase CDN no está disponible');
    }
    
    const client = window.supabase.createClient(config.url, config.anonKey);
    console.log('✅ Cliente Supabase creado con:', { url: config.url });
    
    return client;
}

// Exportar configuración
window.createSupabaseClient = createSupabaseClient;

export { NEW_SUPABASE_CONFIG, FALLBACK_CONFIG, createSupabaseClient };
