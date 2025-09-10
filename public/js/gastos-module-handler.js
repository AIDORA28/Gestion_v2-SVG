/**
 * 💸 GASTOS MODULE HANDLER 
 * Claude García - Handler para el módulo de gastos integrado al dashboard
 */

class GastosModuleHandler {
    constructor() {
        console.log('🚀 Inicializando GastosModuleHandler...');
        
        // Configuración
        this.supabaseUrl = SUPABASE_CONFIG.url;
        this.supabaseKey = SUPABASE_CONFIG.anonKey;
        this.authToken = null;
        this.usuarioId = null;
        
        // Estado
        this.gastos = [];
        this.gastosFiltered = [];
        this.currentEditId = null;
        
        // Inicializar
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Configurando módulo de gastos...');
            
            // Autenticar usuario
            const authSuccess = await this.authenticateUser();
            if (!authSuccess) {
                console.error('❌ Falló la autenticación');
                return;
            }
            
            // Cargar gastos
            await this.loadGastos();
            
            // Configurar eventos
            this.setupEvents();
            
            // Configurar filtros
            this.setupFilters();
            
            console.log('✅ GastosModuleHandler inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando GastosModuleHandler:', error);
        }
    }

    /**
     * 🔐 AUTENTICACIÓN DE USUARIO (igual que ingresos)
     */
    async authenticateUser() {
        try {
            console.log('🔐 Autenticando usuario para gastos...');
            
            // Obtener token de Supabase (igual que ingresos)
            this.authToken = localStorage.getItem('supabase_access_token');
            const userData = localStorage.getItem('currentUser');
            
            if (!this.authToken) {
                console.error('❌ No hay token de acceso disponible');
                window.location.href = 'login.html';
                return false;
            }
            
            if (!userData) {
                console.error('❌ No hay datos de usuario disponibles');
                window.location.href = 'login.html';
                return false;
            }
            
            const user = JSON.parse(userData);
            this.usuarioId = user.id;
            
            // Logs de verificación
            console.log('✅ Autenticación exitosa para gastos:');
            console.log('   👤 Usuario:', user.nombre, user.apellido);
            console.log('   🆔 User ID:', this.usuarioId);
            console.log('   🔑 Token length:', this.authToken.length, 'chars');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en autenticación de gastos:', error);
            window.location.href = 'login.html';
            return false;
        }
    }

    /**
     * 📊 CARGAR GASTOS DESDE SUPABASE
     */
    async loadGastos() {
        try {
            console.log('📡 Cargando gastos desde Supabase...');
            
            // Verificar autenticación antes de hacer la consulta
            if (!this.authToken || !this.usuarioId) {
                console.error('❌ No hay autenticación para cargar gastos');
                return;
            }
            
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/gastos?usuario_id=eq.${this.usuarioId}&select=*&order=fecha.desc,created_at.desc`, 
                {
                    method: 'GET',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.authToken}`, // 🔑 TOKEN REAL
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            this.gastos = await response.json();
            this.gastosFiltered = [...this.gastos];
            
            console.log(`✅ Gastos cargados (patrón dashboard): ${this.gastos.length} registros`);
            
            this.renderGastos();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error cargando gastos:', error);
        }
    }

    /**
     * 💾 ENVIAR GASTO A SUPABASE
     */
    async submitGasto(data) {
        try {
            const isEdit = !!this.currentEditId;
            const operacion = isEdit ? 'actualizado' : 'creado';
            
            // Verificar autenticación
            if (!this.authToken || !this.usuarioId) {
                throw new Error('No hay autenticación disponible');
            }
            
            // Validaciones
            if (!data.descripcion?.trim()) {
                throw new Error('La descripción es requerida');
            }
            
            if (!data.monto || parseFloat(data.monto) <= 0) {
                throw new Error('El monto debe ser mayor a 0');
            }

            // Preparar datos para Supabase
            const supabaseData = {
                usuario_id: this.usuarioId,
                descripcion: data.descripcion.trim(),
                monto: parseFloat(data.monto),
                categoria: data.categoria || 'otros',
                metodo_pago: data.metodo_pago || 'efectivo',
                fecha: data.fecha || new Date().toISOString().split('T')[0],
                es_recurrente: data.es_recurrente || false,
                frecuencia_dias: data.es_recurrente ? (parseInt(data.frecuencia_dias) || 30) : null,
                notas: data.notas?.trim() || null
            };

            const url = isEdit ? 
                `${this.supabaseUrl}/rest/v1/gastos?id=eq.${this.currentEditId}` : 
                `${this.supabaseUrl}/rest/v1/gastos`;

            console.log(`🚀 ${isEdit ? 'Actualizando' : 'Creando'} en Supabase (token real):`, supabaseData);

            const response = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.authToken}`, // 🔑 TOKEN REAL
                    'Content-Type': 'application/json',
                    'Prefer': isEdit ? 'return=minimal' : 'return=representation'
                },
                body: JSON.stringify(supabaseData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error de Supabase:', errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = isEdit ? supabaseData : await response.json();
            console.log(`✅ Gasto ${operacion} exitosamente (patrón dashboard):`, result);

            // Recargar datos y cerrar modal
            await this.loadGastos();
            this.closeGastoModal();
            
            // Notificar al dashboard padre si existe
            if (window.dashboardHandler && typeof window.dashboardHandler.updateStats === 'function') {
                window.dashboardHandler.updateStats();
            }
            
        } catch (error) {
            console.error(`❌ Error al ${this.currentEditId ? 'actualizar' : 'crear'} gasto:`, error);
            alert(error.message);
        }
    }

    /**
     * 🎨 RENDERIZAR GASTOS EN LA TABLA (VERSIÓN PREMIUM CDN)
     */
    renderGastos() {
        console.log('🎨 Renderizando gastos con diseño premium...');
        
        // Buscar tabla tanto en dashboard como en página standalone
        const tableBody = document.getElementById('gastos-table-body') || document.getElementById('gastos-tbody');
        const countElement = document.getElementById('gastos-count');
        
        if (!tableBody) {
            console.warn('⚠️ No se encontró tabla de gastos');
            return;
        }

        // Aplicar filtros
        const datosParaMostrar = this.applyCurrentFilters();
        
        // Actualizar contador con animación
        if (countElement) {
            const texto = datosParaMostrar.length > 0 ? 
                `${datosParaMostrar.length} de ${this.gastos.length} gastos` : 
                `${this.gastos.length} gastos`;
            
            countElement.innerHTML = `
                <i class="fas fa-calculator mr-2 text-red-500"></i>
                <span class="animate-pulse">${texto}</span>
            `;
        }

        // Ocultar loading row si existe
        const loadingRow = document.getElementById('loading-row');
        if (loadingRow) {
            loadingRow.style.display = 'none';
        }

        if (datosParaMostrar.length === 0) {
            tableBody.innerHTML = `
                <tr class="animate-fadeIn">
                    <td colspan="6" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center space-y-4">
                            <div class="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-receipt text-red-400 text-2xl"></i>
                            </div>
                            <div class="text-gray-500">
                                <p class="text-lg font-medium">No hay gastos registrados</p>
                                <p class="text-sm text-gray-400 mt-1">Comienza agregando tu primer gasto</p>
                            </div>
                            <button onclick="window.gastosModuleHandler && window.gastosModuleHandler.openGastoModal()" 
                                    class="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                                <i class="fas fa-plus mr-2"></i>
                                Agregar Primer Gasto
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Renderizar filas con efectos premium
        tableBody.innerHTML = datosParaMostrar.map((gasto, index) => {
            const categoryIcon = this.getCategoriaIcon(gasto.categoria);
            const categoryName = this.getCategoriaLabel(gasto.categoria);
            const methodIcon = this.getMetodoIcon(gasto.metodo_pago);
            const methodName = this.getMetodoLabel(gasto.metodo_pago);
            
            return `
                <tr class="group hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 animate-fadeIn border-b border-gray-50" 
                    style="animation-delay: ${index * 0.1}s;">
                    <!-- Fecha -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:shadow-md transition-all duration-200">
                                <i class="fas fa-calendar-day text-blue-600 text-sm"></i>
                            </div>
                            <div>
                                <div class="text-sm font-semibold text-gray-900">${this.formatDate(gasto.fecha)}</div>
                                <div class="text-xs text-gray-500">${this.getRelativeDate(gasto.fecha)}</div>
                            </div>
                        </div>
                    </td>
                    
                    <!-- Descripción -->
                    <td class="px-6 py-4">
                        <div class="max-w-xs">
                            <div class="font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">${gasto.descripcion}</div>
                            ${gasto.notas ? `<div class="text-gray-500 text-xs mt-1 line-clamp-2">${gasto.notas}</div>` : ''}
                            ${gasto.es_recurrente ? `
                                <div class="flex items-center mt-2 text-xs">
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <i class="fas fa-sync-alt mr-1 animate-spin-slow"></i>
                                        Cada ${gasto.frecuencia_dias || 30} días
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </td>
                    
                    <!-- Categoría -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 shadow-sm group-hover:shadow-md transition-all duration-200">
                                <span class="text-base mr-2">${categoryIcon}</span>
                                ${categoryName}
                            </span>
                        </div>
                    </td>
                    
                    <!-- Monto -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                            <div class="text-lg font-bold text-red-600 animate-money-float">
                                <i class="fas fa-minus-circle text-sm mr-1"></i>
                                S/ ${this.formatMoney(gasto.monto)}
                            </div>
                        </div>
                    </td>
                    
                    <!-- Método de Pago -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm group-hover:shadow-md transition-all duration-200">
                            <span class="text-base mr-2">${methodIcon}</span>
                            ${methodName}
                        </span>
                    </td>
                    
                    <!-- Acciones -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                            <!-- Botón Editar -->
                            <button data-action="edit" data-id="${gasto.id}" 
                                    class="group/btn relative inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                                <i class="fas fa-edit mr-1 group-hover/btn:animate-bounce"></i>
                                Editar
                                <div class="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
                            </button>
                            
                            <!-- Botón Eliminar -->
                            <button data-action="delete" data-id="${gasto.id}" 
                                    class="group/btn relative inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                                <i class="fas fa-trash-alt mr-1 group-hover/btn:animate-bounce"></i>
                                Eliminar
                                <div class="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Actualizar indicador de estado
        const tableStatus = document.getElementById('table-status');
        if (tableStatus) {
            tableStatus.classList.remove('hidden');
            setTimeout(() => {
                tableStatus.classList.add('hidden');
            }, 3000);
        }

        console.log(`✅ Renderizados ${datosParaMostrar.length} gastos con efectos premium`);
    }



    /**
     * 📅 OBTENER FECHA RELATIVA
     */
    getRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    }

    /**
     * 📊 ACTUALIZAR ESTADÍSTICAS (VERSIÓN PREMIUM CDN)
     */
    updateStats() {
        console.log('📊 Actualizando estadísticas premium de gastos...');
        
        const statsContainer = document.getElementById('gastos-stats');
        if (!statsContainer) return;

        // Datos para estadísticas (usar datos filtrados si existen filtros activos)
        const datosParaStats = this.gastosFiltered.length < this.gastos.length ? this.gastosFiltered : this.gastos;
        
        // Calcular estadísticas avanzadas
        const total = datosParaStats.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
        const promedio = datosParaStats.length > 0 ? total / datosParaStats.length : 0;
        const recurrentes = datosParaStats.filter(g => g.es_recurrente).length;
        
        // Calcular gastos del mes actual
        const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
        const gastosMesActual = datosParaStats.filter(g => g.fecha.startsWith(mesActual));
        const totalMesActual = gastosMesActual.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        
        // Calcular categoría con más gastos
        const categorias = {};
        datosParaStats.forEach(g => {
            categorias[g.categoria] = (categorias[g.categoria] || 0) + parseFloat(g.monto);
        });
        const topCategoria = Object.entries(categorias).sort(([,a], [,b]) => b - a)[0];

        // Generar estadísticas premium con animaciones
        statsContainer.innerHTML = `
            <!-- Total Gastos -->
            <div class="group relative bg-gradient-to-br from-red-50 to-pink-50 overflow-hidden shadow-xl rounded-2xl border border-red-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="100">
                <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <i class="fas fa-chart-line-down h-6 w-6 text-white"></i>
                        </div>
                        <div class="flex items-center space-x-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
                            <i class="fas fa-arrow-down h-3 w-3"></i>
                            <span>Gastos</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Total Gastos</p>
                        <p class="text-3xl font-bold text-gray-900 animate-money-float">S/ ${this.formatMoney(total)}</p>
                        <p class="text-xs text-gray-500 mt-2">Egresos registrados</p>
                    </div>
                    <div class="mt-4">
                        <div class="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Impacto financiero</span>
                            <span class="text-red-600 font-medium">-${((total / (total + 10000)) * 100).toFixed(1)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000" style="width: ${Math.min((total / 5000) * 100, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gastos del Mes -->
            <div class="group relative bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden shadow-xl rounded-2xl border border-orange-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
                <div class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <i class="fas fa-calendar-alt h-6 w-6 text-white"></i>
                        </div>
                        <div class="flex items-center space-x-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs font-medium">
                            <i class="fas fa-calendar-check h-3 w-3"></i>
                            <span>Mes actual</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Gastos del Mes</p>
                        <p class="text-3xl font-bold text-gray-900 animate-money-float">S/ ${this.formatMoney(totalMesActual)}</p>
                        <p class="text-xs text-gray-500 mt-2">${gastosMesActual.length} transacciones</p>
                    </div>
                    <div class="mt-4">
                        <div class="text-xs text-gray-500 mb-2">
                            <i class="fas fa-chart-bar mr-1"></i>
                            Promedio diario: S/ ${this.formatMoney(totalMesActual / new Date().getDate())}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Promedio por Gasto -->
            <div class="group relative bg-gradient-to-br from-purple-50 to-indigo-50 overflow-hidden shadow-xl rounded-2xl border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="300">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <i class="fas fa-calculator h-6 w-6 text-white"></i>
                        </div>
                        <div class="flex items-center space-x-1 text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                            <i class="fas fa-equals h-3 w-3"></i>
                            <span>Promedio</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-600 mb-1">Promedio por Gasto</p>
                        <p class="text-3xl font-bold text-gray-900 animate-money-float">S/ ${this.formatMoney(promedio)}</p>
                        <p class="text-xs text-gray-500 mt-2">Por transacción</p>
                    </div>
                    ${topCategoria ? `
                        <div class="mt-4">
                            <div class="text-xs text-gray-500 mb-1">Categoría top:</div>
                            <div class="inline-flex items-center text-xs font-medium text-purple-600">
                                <span class="mr-1">${this.getCategoriaIcon(topCategoria[0])}</span>
                                ${this.getCategoriaLabel(topCategoria[0])}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${datosParaStats.length >= 3 ? `
                <!-- Gastos Recurrentes -->
                <div class="group relative bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden shadow-xl rounded-2xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" data-aos="fade-up" data-aos-delay="400">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                                <i class="fas fa-sync-alt h-6 w-6 text-white animate-spin-slow"></i>
                            </div>
                            <div class="flex items-center space-x-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">
                                <i class="fas fa-repeat h-3 w-3"></i>
                                <span>Automático</span>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-600 mb-1">Gastos Recurrentes</p>
                            <p class="text-3xl font-bold text-gray-900">${recurrentes}</p>
                            <p class="text-xs text-gray-500 mt-2">Gastos automáticos</p>
                        </div>
                        <div class="mt-4">
                            <div class="text-xs text-gray-500">
                                <i class="fas fa-percentage mr-1"></i>
                                ${((recurrentes / datosParaStats.length) * 100).toFixed(1)}% del total
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;

        console.log('✅ Estadísticas premium actualizadas');
    }

    /**
     * ⚙️ CONFIGURAR EVENTOS
     */
    setupEvents() {
        // Delegación de eventos para botones dinámicos (dashboard y página standalone)
        const tableBody = document.getElementById('gastos-table-body') || document.getElementById('gastos-tbody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const button = e.target.closest('[data-action]');
                if (!button) return;

                const action = button.dataset.action;
                const gastoId = button.dataset.id;

                if (action === 'edit') {
                    this.editGasto(gastoId);
                } else if (action === 'delete') {
                    this.confirmDelete(gastoId);
                }
            });
        }

        // Botón agregar gasto (página standalone)
        const addBtn = document.getElementById('add-gasto-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openGastoModal());
        }

        // 🔄 CONFIGURAR CHECKBOX DE RECURRENCIA (EXACTO COMO INGRESOS)
        const form = document.getElementById('gasto-form');
        if (form) {
            // Evitar configurar eventos múltiples veces
            if (form.getAttribute('data-events-configured') === 'true') {
                return;
            }
            
            // Marcar que ya tiene eventos configurados
            form.setAttribute('data-events-configured', 'true');
            
            // 🔄 CONFIGURAR CHECKBOX DE RECURRENCIA (SOPORTE DUAL)
            // Buscar checkbox (página standalone o dashboard)
            const checkbox = document.getElementById('es_recurrente') || 
                            document.getElementById('es-recurrente-gastos');
            
            if (checkbox) {
                // Agregar event listener directo
                checkbox.addEventListener('change', (event) => {
                    // Buscar container (página standalone o dashboard)
                    const container = document.getElementById('frecuencia-container') || 
                                    document.getElementById('recurrencia-section-gastos');
                    // Buscar input (página standalone o dashboard)
                    const frecuenciaInput = document.getElementById('frecuencia_dias') || 
                                          document.getElementById('frecuencia-dias-gastos');
                    
                    console.log('🔄 Checkbox recurrencia cambiado:', event.target.checked);
                    console.log('🔍 Container encontrado:', !!container);
                    console.log('🔍 Input encontrado:', !!frecuenciaInput);
                    
                    if (container) {
                        if (event.target.checked) {
                            container.classList.remove('hidden');
                            console.log('✅ Sección de recurrencia MOSTRADA');
                            
                            // Establecer valor por defecto
                            if (frecuenciaInput && !frecuenciaInput.value) {
                                frecuenciaInput.value = 30;
                            }
                        } else {
                            container.classList.add('hidden');
                            console.log('✅ Sección de recurrencia OCULTADA');
                        }
                    } else {
                        console.log('⚠️ Container de recurrencia no encontrado');
                    }
                });
                
                console.log('✅ Event listener de recurrencia configurado para:', checkbox.id);
            } else {
                console.log('⚠️ Checkbox de recurrencia no encontrado');
            }
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // 🔒 Prevenir doble envío
                if (e.target.dataset.submitting === 'true') {
                    console.log('⚠️ Formulario ya enviándose, ignorando...');
                    return;
                }
                
                e.target.dataset.submitting = 'true';
                
                try {
                    const formData = new FormData(form);
                    const data = {
                        descripcion: formData.get('descripcion'),
                        monto: formData.get('monto'),
                        categoria: formData.get('categoria'),
                        metodo_pago: formData.get('metodo_pago'),
                        fecha: formData.get('fecha'),
                        es_recurrente: formData.get('es_recurrente') === 'on',
                        frecuencia_dias: formData.get('frecuencia_dias'),
                        notas: formData.get('notas')
                    };
                    
                    await this.submitGasto(data);
                } finally {
                    // 🔓 Limpiar flag de envío
                    e.target.dataset.submitting = 'false';
                }
            });
        }
    }

    /**
     * 🔍 CONFIGURAR FILTROS
     */
    setupFilters() {
        // Poblar años disponibles
        this.populateYears();
        
        // Poblar categorías
        this.populateCategories();
        
        // Event listeners para filtros (dashboard y página standalone)
        const filters = [
            'filter-categoria-gastos', 'filter-año-gastos', 'filter-mes-gastos', // Dashboard
            'filter-categoria', 'filter-metodo', 'filter-mes' // Página standalone
        ];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.renderGastos());
            }
        });

        // 📤 Botón exportar
        const exportBtn = document.getElementById('export-gastos');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportFiltered());
        }

        // 🧹 Botón limpiar filtros
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    populateYears() {
        const yearSelect = document.getElementById('filter-año-gastos') || 
                          document.getElementById('filter-año');
        if (!yearSelect) return;

        const years = [...new Set(this.gastos.map(g => new Date(g.fecha).getFullYear()))].sort((a, b) => b - a);
        
        yearSelect.innerHTML = '<option value="">📅 Todos los años</option>' +
            years.map(year => `<option value="${year}">${year}</option>`).join('');
    }

    populateCategories() {
        const categorySelect = document.getElementById('filter-categoria-gastos') || 
                              document.getElementById('filter-categoria');
        if (!categorySelect) return;

        // Lista completa de categorías con iconos
        const categorias = [
            { value: '', text: '🔍 Todas las categorías' },
            { value: 'alimentacion', text: '🍽️ Alimentación' },
            { value: 'transporte', text: '🚗 Transporte' },
            { value: 'servicios', text: '⚡ Servicios' },
            { value: 'entretenimiento', text: '🎬 Entretenimiento' },
            { value: 'salud', text: '🏥 Salud' },
            { value: 'educacion', text: '📚 Educación' },
            { value: 'ropa', text: '👕 Ropa y Accesorios' },
            { value: 'hogar', text: '🏠 Hogar' },
            { value: 'tecnologia', text: '💻 Tecnología' },
            { value: 'viajes', text: '✈️ Viajes' },
            { value: 'regalos', text: '🎁 Regalos' },
            { value: 'seguros', text: '🛡️ Seguros' },
            { value: 'impuestos', text: '🏛️ Impuestos' },
            { value: 'prestamos', text: '🏦 Préstamos' },
            { value: 'otros', text: '📦 Otros' }
        ];

        categorySelect.innerHTML = categorias.map(cat => 
            `<option value="${cat.value}">${cat.text}</option>`
        ).join('');
    }

    /**
     * 🔍 APLICAR FILTROS ACTUALES
     */
    applyCurrentFilters() {
        let filtered = [...this.gastos];

        // Buscar filtros tanto en dashboard como en página standalone
        const categoria = document.getElementById('filter-categoria-gastos')?.value || 
                         document.getElementById('filter-categoria')?.value;
        const año = document.getElementById('filter-año-gastos')?.value || 
                   document.getElementById('filter-año')?.value;
        const mes = document.getElementById('filter-mes-gastos')?.value || 
                   document.getElementById('filter-mes')?.value;

        if (categoria) {
            filtered = filtered.filter(g => g.categoria === categoria);
        }

        if (año) {
            filtered = filtered.filter(g => new Date(g.fecha).getFullYear().toString() === año);
        }

        if (mes) {
            filtered = filtered.filter(g => g.fecha.split('-')[1] === mes);
        }

        this.gastosFiltered = filtered;
        return filtered;
    }

    /**
     * 🎯 APLICAR FILTROS (FUNCIÓN PÚBLICA PARA TEMPLATE)
     */
    applyFilters() {
        console.log('🎯 Aplicando filtros de gastos...');
        
        // Aplicar filtros y actualizar vista
        this.applyCurrentFilters();
        this.renderGastos();
        this.updateStats();
        
        // Actualizar indicador de filtros activos
        this.updateActiveFiltersIndicator();
        
        console.log(`✅ Filtros aplicados - Mostrando ${this.gastosFiltered.length} de ${this.gastos.length} gastos`);
    }

    /**
     * 🏷️ ACTUALIZAR INDICADOR DE FILTROS ACTIVOS
     */
    updateActiveFiltersIndicator() {
        const badge = document.getElementById('active-filters-badge');
        if (!badge) return;
        
        const hasActiveFilters = this.gastosFiltered.length < this.gastos.length;
        
        if (hasActiveFilters) {
            badge.classList.remove('hidden');
            badge.innerHTML = `
                <i class="fas fa-check-circle mr-1"></i>
                ${this.gastosFiltered.length} resultados
            `;
        } else {
            badge.classList.add('hidden');
        }
    }

    /**
     * 📝 ABRIR MODAL PARA NUEVO GASTO
     */
    openGastoModal() {
        this.currentEditId = null;
        
        // Limpiar formulario
        const form = document.getElementById('gasto-form');
        if (form) form.reset();
        
        // Configurar fecha actual con ID correcto
        const fechaInput = document.getElementById('fecha-gastos');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }

        // Asegurar que la sección de recurrencia esté oculta con IDs correctos
        const recurrenciaSection = document.getElementById('recurrencia-section-gastos');
        const recurrenteCheckbox = document.getElementById('es-recurrente-gastos');
        
        if (recurrenciaSection && recurrenteCheckbox) {
            recurrenciaSection.classList.add('hidden');
            recurrenteCheckbox.checked = false;
        }
        
        // Actualizar título con IDs correctos
        const modalTitle = document.getElementById('modal-title-gastos');
        const submitText = document.getElementById('submit-text-gastos');
        
        if (modalTitle) modalTitle.textContent = 'Agregar Gasto';
        if (submitText) submitText.textContent = 'Guardar Gasto';
        
        // Mostrar modal
        const modal = document.getElementById('gasto-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // El checkbox ya está configurado mediante setupEvents
        }
    }

    /**
     * ✏️ EDITAR GASTO EXISTENTE
     */
    editGasto(gastoId) {
        const gasto = this.gastos.find(g => g.id === gastoId);
        if (!gasto) return;

        this.currentEditId = gastoId;
        
        // Llenar formulario con IDs correctos del template
        const campos = {
            'descripcion-gastos': gasto.descripcion || '',
            'monto-gastos': gasto.monto || '',
            'categoria-gastos': gasto.categoria || '',
            'metodo-pago-gastos': gasto.metodo_pago || '',
            'fecha-gastos': gasto.fecha || '',
            'notas-gastos': gasto.notas || ''
        };

        Object.entries(campos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = valor;
        });

        // Manejar checkbox de recurrencia con IDs correctos
        const recurrenteCheckbox = document.getElementById('es-recurrente-gastos');
        const frecuenciaDiasInput = document.getElementById('frecuencia-dias-gastos');
        const recurrenciaSection = document.getElementById('recurrencia-section-gastos');
        
        if (recurrenteCheckbox) {
            recurrenteCheckbox.checked = !!gasto.es_recurrente;
            
            if (gasto.es_recurrente && recurrenciaSection) {
                recurrenciaSection.classList.remove('hidden');
                if (frecuenciaDiasInput) {
                    frecuenciaDiasInput.value = gasto.frecuencia_dias || '30';
                }
            }
        }
        
        // Actualizar título del modal con IDs correctos
        const modalTitle = document.getElementById('modal-title-gastos');
        const submitText = document.getElementById('submit-text-gastos');
        
        if (modalTitle) modalTitle.textContent = 'Editar Gasto';
        if (submitText) submitText.textContent = 'Actualizar Gasto';
        
        // Mostrar modal
        const modal = document.getElementById('gasto-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // El checkbox ya está configurado mediante setupEvents
        }
    }

    /**
     * ❌ CERRAR MODAL
     */
    closeGastoModal() {
        const modal = document.getElementById('gasto-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentEditId = null;
    }

    /**
     * 🗑️ CONFIRMAR ELIMINACIÓN
     */
    confirmDelete(gastoId) {
        const gasto = this.gastos.find(g => g.id === gastoId);
        if (!gasto) return;

        if (confirm(`¿Estás seguro de eliminar el gasto "${gasto.descripcion}"?`)) {
            this.deleteGasto(gastoId);
        }
    }

    /**
     * 🗑️ ELIMINAR GASTO
     */
    async deleteGasto(gastoId) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/gastos?id=eq.${gastoId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.authToken}`, // 🔑 TOKEN REAL
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            console.log('✅ Gasto eliminado exitosamente');
            
            // Recargar datos
            await this.loadGastos();
            
            // Notificar al dashboard padre
            if (window.dashboardHandler && typeof window.dashboardHandler.updateStats === 'function') {
                window.dashboardHandler.updateStats();
            }
            
        } catch (error) {
            console.error('❌ Error eliminando gasto:', error);
            alert('Error al eliminar el gasto. Inténtalo de nuevo.');
        }
    }

    /**
     * � CONFIGURAR TOGGLE DE RECURRENCIA
     */
    // Función setupRecurrenceToggle removida - funcionalidad integrada en setupEvents()

    /**
     * �💰 FORMATEAR DINERO
     */
    formatMoney(amount) {
        return new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * 📅 FORMATEAR FECHA
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    /**
     * 🏷️ OBTENER ICONO DE CATEGORÍA
     */
    getCategoriaIcon(categoria) {
        const iconos = {
            'alimentacion': '🍽️',
            'transporte': '🚗',
            'servicios': '⚡',
            'entretenimiento': '🎬',
            'salud': '🏥',
            'educacion': '📚',
            'ropa': '👕',
            'hogar': '🏠',
            'tecnologia': '💻',
            'viajes': '✈️',
            'regalos': '🎁',
            'seguros': '🛡️',
            'impuestos': '🏛️',
            'prestamos': '🏦',
            'otros': '📦'
        };
        return iconos[categoria] || '📦';
    }

    /**
     * 🏷️ OBTENER LABEL DE CATEGORÍA
     */
    getCategoriaLabel(categoria) {
        const labels = {
            'alimentacion': 'Alimentación',
            'transporte': 'Transporte',
            'servicios': 'Servicios',
            'entretenimiento': 'Entretenimiento',
            'salud': 'Salud',
            'educacion': 'Educación',
            'ropa': 'Ropa y Accesorios',
            'hogar': 'Hogar',
            'tecnologia': 'Tecnología',
            'viajes': 'Viajes',
            'regalos': 'Regalos',
            'seguros': 'Seguros',
            'impuestos': 'Impuestos',
            'prestamos': 'Préstamos',
            'otros': 'Otros'
        };
        return labels[categoria] || 'Otros';
    }

    /**
     * 💳 OBTENER ICONO DE MÉTODO DE PAGO
     */
    getMetodoIcon(metodo) {
        const iconos = {
            'efectivo': '💵',
            'tarjeta_credito': '💳',
            'tarjeta_debito': '💳',
            'transferencia': '🏦',
            'paypal': '🎯',
            'criptomonedas': '₿',
            'cheque': '💰',
            'otros': '📦'
        };
        return iconos[metodo] || '📦';
    }

    /**
     * 💳 OBTENER LABEL DE MÉTODO DE PAGO
     */
    getMetodoLabel(metodo) {
        const labels = {
            'efectivo': 'Efectivo',
            'tarjeta_credito': 'Tarjeta de Crédito',
            'tarjeta_debito': 'Tarjeta de Débito',
            'transferencia': 'Transferencia',
            'paypal': 'PayPal',
            'criptomonedas': 'Criptomonedas',
            'cheque': 'Cheque',
            'otros': 'Otros'
        };
        return labels[metodo] || 'Otros';
    }

    /**
     * 📤 EXPORTAR GASTOS A CSV
     */
    exportToCSV() {
        const headers = ['Fecha', 'Descripcion', 'Categoria', 'Monto', 'Metodo_Pago', 'Recurrente', 'Notas'];
        const csvContent = [
            headers.join(','),
            ...this.gastosFiltered.map(gasto => [
                gasto.fecha || '',
                `"${(gasto.descripcion || '').replace(/"/g, '""')}"`,
                gasto.categoria || '',
                gasto.monto || 0,
                gasto.metodo_pago || '',
                gasto.es_recurrente ? 'Si' : 'No',
                `"${(gasto.notas || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `gastos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 🧹 LIMPIAR FILTROS
     */
    clearFilters() {
        console.log('🧹 Limpiando filtros...');
        
        // Filtros del dashboard y página standalone
        const filterIds = [
            'filter-categoria', 'filter-metodo', 'filter-mes',
            'filter-categoria-gastos', 'filter-metodo-gastos', 
            'filter-mes-gastos', 'filter-año-gastos'
        ];
        
        filterIds.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.value = '';
            }
        });
        
        // Re-renderizar sin filtros
        this.renderGastos();
        
        if (this.notyf) {
            this.notyf.success('Filtros limpiados');
        }
        
        console.log('✅ Filtros limpiados');
    }

    /**
     * 📤 EXPORTAR DATOS FILTRADOS (CSV limpio)
     */
    exportFiltered() {
        console.log('📤 Exportando datos filtrados...');
        
        const dataToExport = this.gastosFiltered.length > 0 ? this.gastosFiltered : this.gastos;
        
        if (dataToExport.length === 0) {
            if (this.notyf) {
                this.notyf.error('No hay gastos para exportar');
            }
            return;
        }

        // Headers del CSV mejorados
        const headers = [
            'Fecha', 'Descripción', 'Monto (S/)', 'Categoría', 
            'Método de Pago', 'Es Recurrente', 'Frecuencia (días)', 'Notas'
        ];

        // Mapear datos con codificación adecuada
        const csvRows = dataToExport.map(gasto => [
            gasto.fecha || '',
            `"${(gasto.descripcion || '').replace(/"/g, '""')}"`,
            (gasto.monto || 0).toFixed(2),
            this.getCategoryName(gasto.categoria || ''),
            this.getMethodName(gasto.metodo_pago || ''),
            gasto.es_recurrente ? 'Sí' : 'No',
            gasto.es_recurrente ? (gasto.frecuencia_dias || '') : '',
            `"${(gasto.notas || '').replace(/"/g, '""')}"`
        ]);

        // Crear CSV con codificación UTF-8 y BOM
        const csvContent = '\ufeff' + [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `gastos_filtrados_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (this.notyf) {
            this.notyf.success(`Exportados ${dataToExport.length} gastos`);
        }
        
        console.log(`✅ Exportados ${dataToExport.length} gastos con codificación mejorada`);
    }

    // Métodos auxiliares para exportación
    getCategoryName(categoria) {
        const categories = {
            'alimentacion': '🍽️ Alimentación',
            'transporte': '🚗 Transporte', 
            'vivienda': '🏠 Vivienda',
            'salud': '🏥 Salud',
            'entretenimiento': '🎬 Entretenimiento',
            'educacion': '📚 Educación',
            'otros': '📝 Otros'
        };
        return categories[categoria] || categoria;
    }

    getMethodName(metodo) {
        const methods = {
            'efectivo': '💵 Efectivo',
            'tarjeta_debito': '💳 Tarjeta Débito',
            'tarjeta_credito': '💰 Tarjeta Crédito',
            'transferencia': '🏦 Transferencia',
            'otros': '📝 Otros'
        };
        return methods[metodo] || metodo;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar si hay elementos de gastos presentes (dashboard o página standalone)
    const hasGastosElements = document.getElementById('gastos-table-body') || document.getElementById('gastos-tbody');
    
    if (hasGastosElements) {
        console.log('🎯 Inicializando GastosModuleHandler (estructura unificada)...');
        window.gastosModuleHandler = new GastosModuleHandler();
        
        // Exportar funciones globales para compatibilidad
        window.openGastoModal = () => window.gastosModuleHandler.openGastoModal();
        window.closeGastoModal = () => window.gastosModuleHandler.closeGastoModal();
    } else {
        console.log('🎯 No se encontraron elementos de gastos - no inicializando');
    }
});
