// Configuración de Supabase para el Frontend
// Este archivo debe estar en /js/supabase-config.js

// ⚠️ IMPORTANTE: Para el frontend necesitas estas variables en Vercel:
// SUPABASE_URL - La URL pública de tu proyecto Supabase
// SUPABASE_ANON_KEY - La clave pública (anon key) de Supabase

// Configuración del cliente Supabase para el frontend
const supabaseConfig = {
    url: 'https://tu-proyecto.supabase.co', // ← Cambiar por tu URL real
    anonKey: 'tu-anon-key-aqui' // ← Cambiar por tu ANON KEY real
};

// Inicializar cliente de Supabase (requiere cargar la librería primero)
let supabaseClient = null;

// Función para inicializar Supabase en el frontend
function initializeSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(
            supabaseConfig.url,
            supabaseConfig.anonKey
        );
        console.log('✅ Cliente Supabase inicializado para frontend');
        return true;
    } else {
        console.error('❌ Librería de Supabase no cargada');
        return false;
    }
}

// Funciones de ayuda para el frontend
const supabaseHelpers = {
    // Obtener usuarios
    async getUsers() {
        if (!supabaseClient) return { error: 'Cliente no inicializado' };
        
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    },
    
    // Crear usuario
    async createUser(userData) {
        if (!supabaseClient) return { error: 'Cliente no inicializado' };
        
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert([userData])
            .select()
            .single();
        
        return { data, error };
    },
    
    // Obtener ingresos
    async getIngresos(userId) {
        if (!supabaseClient) return { error: 'Cliente no inicializado' };
        
        const { data, error } = await supabaseClient
            .from('ingresos')
            .select('*')
            .eq('usuario_id', userId)
            .order('fecha', { ascending: false });
        
        return { data, error };
    },
    
    // Crear ingreso
    async createIngreso(ingresoData) {
        if (!supabaseClient) return { error: 'Cliente no inicializado' };
        
        const { data, error } = await supabaseClient
            .from('ingresos')
            .insert([ingresoData])
            .select()
            .single();
        
        return { data, error };
    },
    
    // Obtener gastos
    async getGastos(userId) {
        if (!supabaseClient) return { error: 'Cliente no inicializado' };
        
        const { data, error } = await supabaseClient
            .from('gastos')
            .select('*')
            .eq('usuario_id', userId)
            .order('fecha', { ascending: false });
        
        return { data, error };
    },
    
    // Crear gasto
    async createGasto(gastoData) {
        if (!supabaseClient) return { error: 'Cliente no inicializado' };
        
        const { data, error } = await supabaseClient
            .from('gastos')
            .insert([gastoData])
            .select()
            .single();
        
        return { data, error };
    }
};

// Exportar configuraciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabaseConfig, supabaseHelpers, initializeSupabase };
}
