// Configuración de Supabase para el Frontend
// Este archivo debe estar en /js/supabase-config.js

// ⚠️ IMPORTANTE: Para el frontend necesitas estas variables en Vercel:
// SUPABASE_URL - https://lobyofpwqwqsszugdwnw.supabase.co
// SUPABASE_ANON_KEY - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI
// SUPABASE_service_role - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k

// Configuración del cliente Supabase para el frontend
const supabaseConfig = {
    url: 'https://lobyofpwqwqsszugdwnw.supabase.co', // ← Cambiar por tu URL real
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI' // ← Cambiar por tu ANON KEY real
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
