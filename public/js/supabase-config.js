/**
 * 🚀 CONFIGURACIÓN SUPABASE - SISTEMA PLANIFICAPRO
 * Configuración unificada para conexión con Supabase
 */

// ✅ CONFIGURACIÓN PRINCIPAL
const SUPABASE_CONFIG = {
    url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
};

// ✅ CLIENTE SUPABASE GLOBAL
let supabaseClient = null;

// ✅ INICIALIZAR CLIENTE
function initializeSupabase() {
    try {
        if (typeof supabase !== 'undefined') {
            supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            console.log('✅ Supabase client inicializado correctamente');
            return supabaseClient;
        } else {
            console.error('❌ Librería Supabase no cargada');
            return null;
        }
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return null;
    }
}

// ✅ OBTENER CLIENTE
function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = initializeSupabase();
    }
    return supabaseClient;
}

// ✅ FUNCIONES HELPER PARA USUARIOS
const SupabaseHelper = {
    // Crear usuario
    async createUser(email, token, nombre) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('usuarios')
            .insert([{ email, token, nombre }])
            .select()
            .single();
        
        return { data, error };
    },

    // Obtener usuario por email
    async getUserByEmail(email) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();
        
        return { data, error };
    },

    // Obtener usuario por token
    async getUserByToken(token) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('usuarios')
            .select('*')
            .eq('token', token)
            .single();
        
        return { data, error };
    },

    // Crear ingreso
    async createIngreso(usuarioId, descripcion, monto, categoria, fecha, esRecurrente = false, frecuenciaDias = null, notas = '') {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('ingresos')
            .insert([{
                usuario_id: usuarioId,
                descripcion,
                monto,
                categoria,
                fecha,
                es_recurrente: esRecurrente,
                frecuencia_dias: frecuenciaDias,
                notas
            }])
            .select()
            .single();
        
        return { data, error };
    },

    // Obtener ingresos de usuario
    async getIngresos(usuarioId, page = 1, limit = 10, filters = {}) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const offset = (page - 1) * limit;
        
        let query = client
            .from('ingresos')
            .select('*', { count: 'exact' })
            .eq('usuario_id', usuarioId);

        if (filters.search) {
            query = query.ilike('descripcion', `%${filters.search}%`);
        }
        
        if (filters.categoria) {
            query = query.eq('categoria', filters.categoria);
        }

        const { data, error, count } = await query
            .order('fecha', { ascending: false })
            .range(offset, offset + limit - 1);
        
        return {
            data,
            error,
            total: count,
            page,
            limit
        };
    },

    // Actualizar ingreso
    async updateIngreso(id, usuarioId, updates) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('ingresos')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('usuario_id', usuarioId)
            .select()
            .single();
        
        return { data, error };
    },

    // Eliminar ingreso
    async deleteIngreso(id, usuarioId) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('ingresos')
            .delete()
            .eq('id', id)
            .eq('usuario_id', usuarioId)
            .select()
            .single();
        
        return { data, error };
    },

    // Obtener estadísticas financieras
    async getFinancialStats(usuarioId) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Cliente no disponible' };
        
        const { data, error } = await client
            .from('ingresos')
            .select('monto')
            .eq('usuario_id', usuarioId);
        
        if (error) return { error };
        
        const stats = data.reduce((acc, curr) => {
            const monto = parseFloat(curr.monto);
            if (monto > 0) {
                acc.total_ingresos += monto;
            } else {
                acc.total_gastos += Math.abs(monto);
            }
            acc.balance_total += monto;
            acc.total_transacciones++;
            return acc;
        }, {
            total_ingresos: 0,
            total_gastos: 0,
            balance_total: 0,
            total_transacciones: 0
        });
        
        return { data: stats, error: null };
    },

    // Verificar conexión
    async testConnection() {
        const client = getSupabaseClient();
        if (!client) return { success: false, error: 'Cliente no disponible' };
        
        try {
            const { data, error } = await client
                .from('usuarios')
                .select('count')
                .limit(1);
            
            return { success: !error, error: error?.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ✅ INICIALIZAR AL CARGAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Inicializando configuración Supabase...');
    initializeSupabase();
});

// ✅ EXPORTAR PARA USO GLOBAL
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.SupabaseHelper = SupabaseHelper;
window.getSupabaseClient = getSupabaseClient;

console.log('📋 supabase-config.js cargado correctamente');
