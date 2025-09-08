/**
 * 🗄️ CONEXIÓN DUAL DE BASE DE DATOS
 * Maneja automáticamente PostgreSQL local y Supabase
 */

const envDetector = require('../config/environment-detector');

class DatabaseManager {
    constructor() {
        this.environment = envDetector.environment;
        this.connection = null;
        this.isSupabase = false;
    }

    async initialize() {
        try {
            if (this.environment === 'production') {
                await this.initializeSupabase();
            } else {
                await this.initializePostgreSQL();
            }
            console.log(`✅ Base de datos ${this.environment} conectada correctamente`);
        } catch (error) {
            console.error(`❌ Error conectando base de datos ${this.environment}:`, error);
            throw error;
        }
    }

    async initializeSupabase() {
        const { createClient } = require('@supabase/supabase-js');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variables de Supabase no configuradas');
        }
        
        this.connection = createClient(supabaseUrl, supabaseKey);
        this.isSupabase = true;
        
        // Verificar conexión
        const { data, error } = await this.connection
            .from('usuarios')
            .select('count')
            .limit(1);
            
        if (error && !error.message.includes('relation "usuarios" does not exist')) {
            throw error;
        }
        
        console.log('🌐 Supabase conectado:', supabaseUrl);
    }

    async initializePostgreSQL() {
        const { Pool } = require('pg');
        require('dotenv').config({ path: '.env.local' });
        
        const poolConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 5434,
            database: process.env.DB_NAME || 'gestion_presupuesto',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'root',
        };
        
        this.connection = new Pool(poolConfig);
        this.isSupabase = false;
        
        // Verificar conexión
        await this.connection.query('SELECT NOW()');
        
        console.log('🏠 PostgreSQL local conectado:', `${poolConfig.host}:${poolConfig.port}`);
    }

    // USUARIOS
    async createUser(email, token, nombre) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
                .from('usuarios')
                .insert([{ email, token, nombre }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            const result = await this.connection.query(
                'INSERT INTO usuarios (email, token, nombre) VALUES ($1, $2, $3) RETURNING *',
                [email, token, nombre]
            );
            return result.rows[0];
        }
    }

    async getUserByEmail(email) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            const result = await this.connection.query('SELECT * FROM usuarios WHERE email = $1', [email]);
            return result.rows[0];
        }
    }

    async getUserByToken(token) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
                .from('usuarios')
                .select('*')
                .eq('token', token)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            const result = await this.connection.query('SELECT * FROM usuarios WHERE token = $1', [token]);
            return result.rows[0];
        }
    }

    // INGRESOS
    async createIngreso(usuarioId, descripcion, monto, categoria, fecha, esRecurrente, frecuenciaDias, notas) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
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
            
            if (error) throw error;
            return data;
        } else {
            const result = await this.connection.query(
                `INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [usuarioId, descripcion, monto, categoria, fecha, esRecurrente, frecuenciaDias, notas]
            );
            return result.rows[0];
        }
    }

    async getIngresos(usuarioId, page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        
        if (this.isSupabase) {
            let query = this.connection
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
            
            if (error) throw error;
            
            return {
                data,
                total: count,
                page,
                limit
            };
        } else {
            let query = 'SELECT * FROM ingresos WHERE usuario_id = $1';
            let params = [usuarioId];
            let paramCount = 1;

            if (filters.search) {
                paramCount++;
                query += ` AND descripcion ILIKE $${paramCount}`;
                params.push(`%${filters.search}%`);
            }
            
            if (filters.categoria) {
                paramCount++;
                query += ` AND categoria = $${paramCount}`;
                params.push(filters.categoria);
            }

            query += ` ORDER BY fecha DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(limit, offset);

            const result = await this.connection.query(query, params);
            const countResult = await this.connection.query('SELECT COUNT(*) FROM ingresos WHERE usuario_id = $1', [usuarioId]);
            
            return {
                data: result.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                limit
            };
        }
    }

    async updateIngreso(id, usuarioId, updates) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
                .from('ingresos')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('usuario_id', usuarioId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ');
            const values = Object.values(updates);
            
            const query = `UPDATE ingresos SET ${setClause}, updated_at = NOW() WHERE id = $1 AND usuario_id = $2 RETURNING *`;
            const result = await this.connection.query(query, [id, usuarioId, ...values]);
            return result.rows[0];
        }
    }

    async deleteIngreso(id, usuarioId) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
                .from('ingresos')
                .delete()
                .eq('id', id)
                .eq('usuario_id', usuarioId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } else {
            const result = await this.connection.query('DELETE FROM ingresos WHERE id = $1 AND usuario_id = $2 RETURNING *', [id, usuarioId]);
            return result.rows[0];
        }
    }

    // ESTADÍSTICAS
    async getFinancialStats(usuarioId) {
        if (this.isSupabase) {
            const { data, error } = await this.connection
                .from('ingresos')
                .select('monto')
                .eq('usuario_id', usuarioId);
            
            if (error) throw error;
            
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
            
            return stats;
        } else {
            const result = await this.connection.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN monto > 0 THEN monto ELSE 0 END), 0) as total_ingresos,
                    COALESCE(SUM(CASE WHEN monto < 0 THEN ABS(monto) ELSE 0 END), 0) as total_gastos,
                    COALESCE(SUM(monto), 0) as balance_total,
                    COUNT(*) as total_transacciones
                FROM ingresos 
                WHERE usuario_id = $1
            `, [usuarioId]);
            return result.rows[0];
        }
    }

    // Método para obtener la conexión directa (para casos especiales)
    getConnection() {
        return this.connection;
    }

    // Verificar estado de la conexión
    async healthCheck() {
        try {
            if (this.isSupabase) {
                const { data, error } = await this.connection
                    .from('usuarios')
                    .select('count')
                    .limit(1);
                return { status: 'ok', database: 'supabase', error: null };
            } else {
                await this.connection.query('SELECT NOW()');
                return { status: 'ok', database: 'postgresql', error: null };
            }
        } catch (error) {
            return { status: 'error', database: this.isSupabase ? 'supabase' : 'postgresql', error: error.message };
        }
    }
}

module.exports = DatabaseManager;
