/*
🔥 API SERVICE - CRUD AUTOMÁTICO CON SUPABASE
Todas las operaciones CRUD listas para usar
*/

class APIService {
    constructor() {
        // Usar la configuración global de Supabase
        if (window.SUPABASE_CONFIG) {
            this.supabaseUrl = window.SUPABASE_CONFIG.url;
            this.supabaseKey = window.SUPABASE_CONFIG.anonKey;
        } else {
            // Fallback con la configuración correcta
            this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
            this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        }
        
        // Inicializar cliente Supabase
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        console.log('🔥 APIService inicializado con Supabase directo');
        console.log('🔑 URL:', this.supabaseUrl);
        console.log('🔑 Key:', this.supabaseKey.substring(0, 50) + '...');
    }

    // ================================
    // 🔐 AUTENTICACIÓN
    // ================================
    
    async login(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            return {
                success: true,
                user: data.user,
                session: data.session
            };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }

    async logout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) console.error('Error en logout:', error);
        return !error;
    }

    // ================================
    // 💰 MÓDULO INGRESOS - CRUD COMPLETO
    // ================================
    
    async getIngresos(userId = null, filters = {}) {
        try {
            let query = this.supabase
                .from('ingresos')
                .select(`
                    *,
                    perfiles_usuario!inner (
                        id,
                        nombre,
                        apellido
                    )
                `);
            
            // Filtro por usuario si se especifica
            if (userId) {
                query = query.eq('usuario_id', userId);
            }
            
            // Filtros adicionales
            if (filters.fechaDesde) {
                query = query.gte('fecha', filters.fechaDesde);
            }
            if (filters.fechaHasta) {
                query = query.lte('fecha', filters.fechaHasta);
            }
            if (filters.categoria) {
                query = query.eq('categoria', filters.categoria);
            }
            
            // Ordenar por fecha descendente
            query = query.order('fecha', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Error obteniendo ingresos:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async createIngreso(ingresoData) {
        try {
            const { data, error } = await this.supabase
                .from('ingresos')
                .insert([{
                    usuario_id: ingresoData.usuario_id,
                    monto: parseFloat(ingresoData.monto),
                    descripcion: ingresoData.descripcion,
                    categoria: ingresoData.categoria,
                    fecha: ingresoData.fecha,
                    recurrente: ingresoData.recurrente || false,
                    frecuencia_recurrencia: ingresoData.frecuencia_recurrencia || null,
                    metodo_pago: ingresoData.metodo_pago || 'efectivo'
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error creando ingreso:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateIngreso(id, ingresoData) {
        try {
            const { data, error } = await this.supabase
                .from('ingresos')
                .update({
                    monto: parseFloat(ingresoData.monto),
                    descripcion: ingresoData.descripcion,
                    categoria: ingresoData.categoria,
                    fecha: ingresoData.fecha,
                    recurrente: ingresoData.recurrente,
                    frecuencia_recurrencia: ingresoData.frecuencia_recurrencia,
                    metodo_pago: ingresoData.metodo_pago,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error actualizando ingreso:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteIngreso(id) {
        try {
            const { error } = await this.supabase
                .from('ingresos')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error eliminando ingreso:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ================================
    // 💸 MÓDULO GASTOS - CRUD COMPLETO
    // ================================
    
    async getGastos(userId = null, filters = {}) {
        try {
            let query = this.supabase
                .from('gastos')
                .select(`
                    *,
                    perfiles_usuario!inner (
                        id,
                        nombre,
                        apellido
                    )
                `);
            
            if (userId) {
                query = query.eq('usuario_id', userId);
            }
            
            if (filters.fechaDesde) {
                query = query.gte('fecha', filters.fechaDesde);
            }
            if (filters.fechaHasta) {
                query = query.lte('fecha', filters.fechaHasta);
            }
            if (filters.categoria) {
                query = query.eq('categoria', filters.categoria);
            }
            
            query = query.order('fecha', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Error obteniendo gastos:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async createGasto(gastoData) {
        try {
            const { data, error } = await this.supabase
                .from('gastos')
                .insert([{
                    usuario_id: gastoData.usuario_id,
                    monto: parseFloat(gastoData.monto),
                    descripcion: gastoData.descripcion,
                    categoria: gastoData.categoria,
                    subcategoria: gastoData.subcategoria || null,
                    fecha: gastoData.fecha,
                    metodo_pago: gastoData.metodo_pago || 'efectivo',
                    es_necesario: gastoData.es_necesario || true
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error creando gasto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateGasto(id, gastoData) {
        try {
            const { data, error } = await this.supabase
                .from('gastos')
                .update({
                    monto: parseFloat(gastoData.monto),
                    descripcion: gastoData.descripcion,
                    categoria: gastoData.categoria,
                    subcategoria: gastoData.subcategoria,
                    fecha: gastoData.fecha,
                    metodo_pago: gastoData.metodo_pago,
                    es_necesario: gastoData.es_necesario,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error actualizando gasto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteGasto(id) {
        try {
            const { error } = await this.supabase
                .from('gastos')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error eliminando gasto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ================================
    // 💳 MÓDULO CRÉDITOS - CRUD COMPLETO  
    // ================================
    
    async getCreditos(userId = null) {
        try {
            let query = this.supabase
                .from('simulaciones_credito')
                .select(`
                    *,
                    perfiles_usuario!inner (
                        id,
                        nombre,
                        apellido
                    )
                `);
            
            if (userId) {
                query = query.eq('usuario_id', userId);
            }
            
            query = query.order('created_at', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Error obteniendo créditos:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async createCredito(creditoData) {
        try {
            const { data, error } = await this.supabase
                .from('simulaciones_credito')
                .insert([{
                    usuario_id: creditoData.usuario_id,
                    tipo_credito: creditoData.tipo_credito,
                    monto_solicitado: parseFloat(creditoData.monto_solicitado),
                    plazo_meses: parseInt(creditoData.plazo_meses),
                    tasa_interes: parseFloat(creditoData.tasa_interes),
                    cuota_mensual: parseFloat(creditoData.cuota_mensual),
                    total_intereses: parseFloat(creditoData.total_intereses),
                    total_pagar: parseFloat(creditoData.total_pagar),
                    ingresos_mensuales: parseFloat(creditoData.ingresos_mensuales),
                    gastos_mensuales: parseFloat(creditoData.gastos_mensuales),
                    capacidad_pago: parseFloat(creditoData.capacidad_pago),
                    recomendacion: creditoData.recomendacion || null
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error creando crédito:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ================================
    // 📊 MÓDULO REPORTES - DATOS ANALÍTICOS
    // ================================
    
    async getDashboardStats(userId) {
        try {
            // Obtener estadísticas del mes actual
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            
            // Ingresos del mes
            const { data: ingresos } = await this.supabase
                .from('ingresos')
                .select('monto')
                .eq('usuario_id', userId)
                .gte('fecha', `${currentMonth}-01`)
                .lt('fecha', `${currentMonth}-32`);
            
            // Gastos del mes
            const { data: gastos } = await this.supabase
                .from('gastos')
                .select('monto')
                .eq('usuario_id', userId)
                .gte('fecha', `${currentMonth}-01`)
                .lt('fecha', `${currentMonth}-32`);
            
            // Calcular totales
            const totalIngresos = ingresos?.reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const totalGastos = gastos?.reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const balance = totalIngresos - totalGastos;
            const ahorro = balance > 0 ? balance : 0;
            
            return {
                success: true,
                data: {
                    balance,
                    income: totalIngresos,
                    expenses: totalGastos,
                    savings: ahorro
                }
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    balance: 0,
                    income: 0,
                    expenses: 0,
                    savings: 0
                }
            };
        }
    }

    async getChartData(userId, type = 'monthly') {
        try {
            const currentYear = new Date().getFullYear();
            
            if (type === 'monthly') {
                // Datos mensuales del año actual
                const { data: ingresos } = await this.supabase
                    .from('ingresos')
                    .select('monto, fecha')
                    .eq('usuario_id', userId)
                    .gte('fecha', `${currentYear}-01-01`)
                    .lt('fecha', `${currentYear + 1}-01-01`)
                    .order('fecha');
                
                const { data: gastos } = await this.supabase
                    .from('gastos')
                    .select('monto, fecha')
                    .eq('usuario_id', userId)
                    .gte('fecha', `${currentYear}-01-01`)
                    .lt('fecha', `${currentYear + 1}-01-01`)
                    .order('fecha');
                
                // Procesar datos por mes
                const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const ingresosMonthly = new Array(12).fill(0);
                const gastosMonthly = new Array(12).fill(0);
                
                ingresos?.forEach(item => {
                    const mes = new Date(item.fecha).getMonth();
                    ingresosMonthly[mes] += parseFloat(item.monto);
                });
                
                gastos?.forEach(item => {
                    const mes = new Date(item.fecha).getMonth();
                    gastosMonthly[mes] += parseFloat(item.monto);
                });
                
                return {
                    success: true,
                    data: {
                        monthlyFlow: {
                            labels: meses,
                            income: ingresosMonthly,
                            expenses: gastosMonthly
                        }
                    }
                };
            }
            
            return {
                success: true,
                data: {}
            };
        } catch (error) {
            console.error('Error obteniendo datos de gráficos:', error);
            return {
                success: false,
                error: error.message,
                data: {}
            };
        }
    }

    // ================================
    // 🛠️ UTILIDADES
    // ================================
    
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('perfiles_usuario')
                .select('count')
                .limit(1);
            
            return {
                success: !error,
                message: error ? error.message : 'Conexión exitosa'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// ================================
// 🚀 INSTANCIA GLOBAL
// ================================

// Crear instancia global cuando se cargue Supabase
window.apiService = null;

// Inicializar cuando Supabase esté disponible
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que supabase-config.js se haya cargado
    setTimeout(() => {
        if (window.supabase) {
            window.apiService = new APIService();
            console.log('🔥 APIService global creado');
        } else {
            console.warn('⚠️ Supabase no está disponible. Verifica que esté cargado.');
        }
    }, 100);
});

// Función de utilidad para obtener el servicio
window.getAPIService = function() {
    if (!window.apiService) {
        if (window.supabase) {
            window.apiService = new APIService();
            console.log('🔥 APIService creado via getAPIService()');
        } else {
            console.error('❌ No se puede crear APIService: Supabase no disponible');
            return null;
        }
    }
    return window.apiService;
};

console.log('📦 API Service cargado - CRUD completo disponible');
