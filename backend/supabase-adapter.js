/**
 * 🗄️ ADAPTADOR SUPABASE PARA PRODUCCIÓN
 * Este archivo maneja la migración de PostgreSQL local a Supabase
 */

const { createClient } = require('@supabase/supabase-js');

class SupabaseAdapter {
    constructor() {
        // Configuración de Supabase desde variables de entorno
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            console.warn('⚠️ Variables de Supabase no configuradas, usando PostgreSQL local');
            this.useLocal = true;
            return;
        }
        
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.useLocal = false;
        console.log('✅ Supabase conectado:', this.supabaseUrl);
    }

    // Método para verificar si usar Supabase o PostgreSQL local
    isUsingSupabase() {
        return !this.useLocal;
    }

    // USUARIOS
    async createUser(email, token, nombre) {
        if (this.useLocal) {
            // Usar PostgreSQL local (desarrollo)
            const pool = require('./db-local-connection'); // Tu conexión actual
            const result = await pool.query(
                'INSERT INTO usuarios (email, token, nombre) VALUES ($1, $2, $3) RETURNING *',
                [email, token, nombre]
            );
            return result.rows[0];
        } else {
            // Usar Supabase (producción)
            const { data, error } = await this.supabase
                .from('usuarios')
                .insert([{ email, token, nombre }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    }

    async getUserByEmail(email) {
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
            return result.rows[0];
        } else {
            const { data, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
            return data;
        }
    }

    async getUserByToken(token) {
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            const result = await pool.query('SELECT * FROM usuarios WHERE token = $1', [token]);
            return result.rows[0];
        } else {
            const { data, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('token', token)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        }
    }

    // INGRESOS
    async createIngreso(usuarioId, descripcion, monto, categoria, fecha, esRecurrente, frecuenciaDias, notas) {
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            const result = await pool.query(
                `INSERT INTO ingresos (usuario_id, descripcion, monto, categoria, fecha, es_recurrente, frecuencia_dias, notas) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [usuarioId, descripcion, monto, categoria, fecha, esRecurrente, frecuenciaDias, notas]
            );
            return result.rows[0];
        } else {
            const { data, error } = await this.supabase
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
        }
    }

    async getIngresos(usuarioId, page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            let query = 'SELECT * FROM ingresos WHERE usuario_id = $1';
            let params = [usuarioId];
            let paramCount = 1;

            // Agregar filtros
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

            const result = await pool.query(query, params);
            
            // Contar total
            const countResult = await pool.query('SELECT COUNT(*) FROM ingresos WHERE usuario_id = $1', [usuarioId]);
            
            return {
                data: result.rows,
                total: parseInt(countResult.rows[0].count),
                page,
                limit
            };
        } else {
            let query = this.supabase
                .from('ingresos')
                .select('*', { count: 'exact' })
                .eq('usuario_id', usuarioId);

            // Agregar filtros
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
        }
    }

    async updateIngreso(id, usuarioId, updates) {
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 3}`).join(', ');
            const values = Object.values(updates);
            
            const query = `UPDATE ingresos SET ${setClause}, updated_at = NOW() WHERE id = $1 AND usuario_id = $2 RETURNING *`;
            const result = await pool.query(query, [id, usuarioId, ...values]);
            return result.rows[0];
        } else {
            const { data, error } = await this.supabase
                .from('ingresos')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('usuario_id', usuarioId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    }

    async deleteIngreso(id, usuarioId) {
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            const result = await pool.query('DELETE FROM ingresos WHERE id = $1 AND usuario_id = $2 RETURNING *', [id, usuarioId]);
            return result.rows[0];
        } else {
            const { data, error } = await this.supabase
                .from('ingresos')
                .delete()
                .eq('id', id)
                .eq('usuario_id', usuarioId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    }

    // ESTADÍSTICAS
    async getFinancialStats(usuarioId) {
        if (this.useLocal) {
            const pool = require('./db-local-connection');
            const result = await pool.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN monto > 0 THEN monto ELSE 0 END), 0) as total_ingresos,
                    COALESCE(SUM(CASE WHEN monto < 0 THEN ABS(monto) ELSE 0 END), 0) as total_gastos,
                    COALESCE(SUM(monto), 0) as balance_total,
                    COUNT(*) as total_transacciones
                FROM ingresos 
                WHERE usuario_id = $1
            `, [usuarioId]);
            return result.rows[0];
        } else {
            const { data, error } = await this.supabase
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
        }
    }
}

module.exports = SupabaseAdapter;
