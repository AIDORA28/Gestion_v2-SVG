// admin.js - Panel de administrador seguro
// Solo para desarrollador - estadísticas de la plataforma

class AdminManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.currentUser = null;
    }

    // Verificar si el usuario actual es admin
    async isAdmin() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return false;

            const { data: profile } = await this.supabase
                .from('perfiles_usuario')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            return profile?.is_admin === true;
        } catch (error) {
            console.error('Error verificando admin:', error);
            return false;
        }
    }

    // Obtener estadísticas generales de la plataforma
    async getPlataformaStats() {
        if (!(await this.isAdmin())) {
            throw new Error('🚫 Acceso denegado - Se requieren permisos de administrador');
        }

        try {
            const [usuarios, ingresos, gastos, simulaciones] = await Promise.all([
                this.supabase.from('perfiles_usuario').select('id', { count: 'exact' }),
                this.supabase.from('ingresos').select('id', { count: 'exact' }),
                this.supabase.from('gastos').select('id', { count: 'exact' }),
                this.supabase.from('simulaciones_credito').select('id', { count: 'exact' })
            ]);

            return {
                total_usuarios: usuarios.count || 0,
                total_ingresos: ingresos.count || 0,
                total_gastos: gastos.count || 0,
                total_simulaciones: simulaciones.count || 0,
                fecha_consulta: new Date().toLocaleString('es-PE')
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Obtener usuarios registrados (solo info básica, no datos financieros)
    async getUsuariosRegistrados() {
        if (!(await this.isAdmin())) {
            throw new Error('🚫 Acceso denegado - Se requieren permisos de administrador');
        }

        try {
            const { data, error } = await this.supabase
                .from('perfiles_usuario')
                .select('id, nombre, apellido, created_at, dependientes, ocupacion')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(user => ({
                ...user,
                fecha_registro: new Date(user.created_at).toLocaleDateString('es-PE'),
                familia_total: (user.dependientes || 0) + 1
            }));
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            throw error;
        }
    }

    // Generar reporte de uso de la plataforma
    async generarReporteUso() {
        if (!(await this.isAdmin())) {
            throw new Error('🚫 Acceso denegado');
        }

        try {
            const stats = await this.getPlataformaStats();
            const usuarios = await this.getUsuariosRegistrados();

            // Calcular métricas adicionales
            const usuariosConDependientes = usuarios.filter(u => u.dependientes > 0);
            const promedioFamilia = usuarios.reduce((acc, u) => acc + (u.dependientes || 0), 0) / usuarios.length;

            const reporte = {
                fecha_reporte: new Date().toLocaleString('es-PE'),
                plataforma: {
                    ...stats,
                    usuarios_con_familia: usuariosConDependientes.length,
                    promedio_dependientes: Math.round(promedioFamilia * 100) / 100,
                    tasa_adopcion_familiar: Math.round((usuariosConDependientes.length / stats.total_usuarios) * 100)
                },
                crecimiento: {
                    ultimos_7_dias: 'TODO: Implementar',
                    ultimos_30_dias: 'TODO: Implementar'
                }
            };

            return reporte;
        } catch (error) {
            console.error('Error generando reporte:', error);
            throw error;
        }
    }

    // Renderizar panel de administrador
    renderAdminPanel() {
        return `
            <div class="admin-panel container-glass slide-in-up">
                <div class="admin-header">
                    <div class="admin-title">
                        <h2>👑 Panel de Administrador</h2>
                        <p>Estadísticas generales de la plataforma</p>
                    </div>
                    <div class="admin-badge">
                        <span class="badge-admin">🛡️ Super Admin</span>
                    </div>
                </div>

                <div id="admin-stats" class="admin-stats-grid">
                    <div class="admin-card glass-effect">
                        <div class="loading-placeholder">
                            <div class="loading-spinner"></div>
                            <p>Cargando estadísticas...</p>
                        </div>
                    </div>
                </div>

                <div class="admin-actions">
                    <button class="btn-sky" onclick="adminManager.refreshStats()">
                        🔄 Actualizar Datos
                    </button>
                    <button class="btn-sky" onclick="adminManager.downloadReport()">
                        📊 Descargar Reporte
                    </button>
                </div>

                <div id="admin-users" class="admin-users-section">
                    <h3>👥 Usuarios Registrados</h3>
                    <div class="users-loading">
                        <p>Cargando lista de usuarios...</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar estadísticas
    renderStats(stats) {
        return `
            <div class="stat-card stat-usuarios glass-effect">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3>${stats.total_usuarios}</h3>
                    <p>Usuarios Registrados</p>
                    <small>Total en la plataforma</small>
                </div>
            </div>

            <div class="stat-card stat-ingresos glass-effect">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <h3>${stats.total_ingresos}</h3>
                    <p>Ingresos Registrados</p>
                    <small>Total de entradas</small>
                </div>
            </div>

            <div class="stat-card stat-gastos glass-effect">
                <div class="stat-icon">💸</div>
                <div class="stat-content">
                    <h3>${stats.total_gastos}</h3>
                    <p>Gastos Registrados</p>
                    <small>Total de salidas</small>
                </div>
            </div>

            <div class="stat-card stat-simulaciones glass-effect">
                <div class="stat-icon">🏦</div>
                <div class="stat-content">
                    <h3>${stats.total_simulaciones}</h3>
                    <p>Simulaciones de Crédito</p>
                    <small>Cálculos realizados</small>
                </div>
            </div>
        `;
    }

    // Renderizar lista de usuarios
    renderUsers(usuarios) {
        const usersList = usuarios.map(user => `
            <div class="user-card glass-effect fade-in">
                <div class="user-info">
                    <h4>${user.nombre} ${user.apellido}</h4>
                    <p class="user-meta">
                        👨‍👩‍👧‍👦 Familia: ${user.familia_total} personas
                        ${user.ocupacion ? ` | 💼 ${user.ocupacion}` : ''}
                    </p>
                    <p class="user-date">📅 Registrado: ${user.fecha_registro}</p>
                </div>
                <div class="user-stats">
                    <span class="user-dependientes">${user.dependientes || 0} dependientes</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="users-list">
                ${usersList}
            </div>
            <div class="users-summary">
                <p>📊 <strong>${usuarios.length}</strong> usuarios total</p>
                <p>👨‍👩‍👧‍👦 <strong>${usuarios.filter(u => u.dependientes > 0).length}</strong> con familia</p>
            </div>
        `;
    }

    // Cargar datos iniciales
    async loadAdminData() {
        try {
            const [stats, usuarios] = await Promise.all([
                this.getPlataformaStats(),
                this.getUsuariosRegistrados()
            ]);

            // Actualizar estadísticas
            document.getElementById('admin-stats').innerHTML = this.renderStats(stats);

            // Actualizar lista de usuarios
            document.getElementById('admin-users').innerHTML = 
                '<h3>👥 Usuarios Registrados</h3>' + this.renderUsers(usuarios);

            console.log('✅ Panel admin cargado:', { stats, usuarios: usuarios.length });
        } catch (error) {
            console.error('❌ Error cargando panel admin:', error);
            
            document.getElementById('admin-stats').innerHTML = `
                <div class="admin-error">
                    <h3>❌ Error de Permisos</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Refrescar estadísticas
    async refreshStats() {
        document.getElementById('admin-stats').innerHTML = `
            <div class="loading-placeholder">
                <div class="loading-spinner"></div>
                <p>Actualizando datos...</p>
            </div>
        `;

        await this.loadAdminData();
    }

    // Descargar reporte
    async downloadReport() {
        try {
            const reporte = await this.generarReporteUso();
            
            const dataStr = JSON.stringify(reporte, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `reporte_plataforma_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('📊 Reporte descargado');
        } catch (error) {
            console.error('❌ Error descargando reporte:', error);
            alert('Error generando reporte: ' + error.message);
        }
    }
}

// Exportar para uso global
window.AdminManager = AdminManager;
