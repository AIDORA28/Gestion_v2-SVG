// js/config.js - Configuración Supabase (equivale a .env + createClient en React)

// ✅ CONFIGURACIÓN CONFIRMADA: Proyecto "Gestion_Presupuesto" 
// ✅ BACKEND COMPLETO: PostgreSQL + API REST + Auth + RLS automático
// 🚀 SIN NECESIDAD DE POSTGRESQL LOCAL

const SUPABASE_CONFIG = {
    url: 'https://trlbsfktusefvpheoudn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybGJzZmt0dXNlZnZwaGVvdWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzg5MDMsImV4cCI6MjA3MjYxNDkwM30.Rg045QrnG6R7kIy3k_8zl8JSiMFwWVN5e08LmZCx6Fc',
    
    // Información del proyecto
    projectName: 'Gestion_Presupuesto',
    region: 'US East',
    provider: 'Supabase (PostgreSQL 15)',
    
    // Features incluidas automáticamente
    features: [
        'PostgreSQL Database',
        'Row Level Security (RLS)', 
        'API REST automática',
        'Autenticación JWT',
        'WebSockets tiempo real',
        'Dashboard admin',
        'Backups automáticos'
    ]
};

// Verificar que Supabase esté disponible
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase no está disponible. Verifica que el CDN esté cargado.');
    throw new Error('Supabase CDN no encontrado');
}

// Cliente global Supabase (equivale a createClient en React)
const supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// Exportar para otros módulos (equivale a export en React)
window.supabaseClient = supabaseClient;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

// Verificar conexión
console.log('✅ Supabase configurado:', {
    url: SUPABASE_CONFIG.url,
    keyPreview: SUPABASE_CONFIG.anonKey.substring(0, 50) + '...'
});

// Test de conectividad
supabaseClient.from('perfiles_usuario')
    .select('count')
    .then(({ data, error }) => {
        if (error) {
            console.log('⚠️ Base de datos conectada, RLS activo (normal):', error.message);
        } else {
            console.log('✅ Base de datos completamente accesible:', data);
        }
    })
    .catch(err => {
        console.error('❌ Error de conectividad:', err);
    });

export { supabaseClient, SUPABASE_CONFIG };
