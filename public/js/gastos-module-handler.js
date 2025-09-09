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
     * 🎨 RENDERIZAR GASTOS EN LA TABLA
     */
    renderGastos() {
        // Buscar tabla tanto en dashboard como en página standalone
        const tableBody = document.getElementById('gastos-table-body') || document.getElementById('gastos-tbody');
        const countElement = document.getElementById('gastos-count');
        
        if (!tableBody) {
            console.warn('⚠️ No se encontró tabla de gastos');
            return;
        }

        // Aplicar filtros
        const datosParaMostrar = this.applyCurrentFilters();
        
        // Actualizar contador
        if (countElement) {
            countElement.textContent = datosParaMostrar.length > 0 ? 
                `${datosParaMostrar.length} de ${this.gastos.length} gastos` : 
                `${this.gastos.length} gastos`;
        }

        if (datosParaMostrar.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i data-lucide="receipt" class="h-12 w-12 text-gray-300 mb-2"></i>
                            <p>No hay gastos registrados</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = datosParaMostrar.map(gasto => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(gasto.fecha)}
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium">${gasto.descripcion}</div>
                    ${gasto.notas ? `<div class="text-gray-500 text-xs mt-1">${gasto.notas}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ${this.getCategoriaIcon(gasto.categoria)} ${this.getCategoriaLabel(gasto.categoria)}
                    </span>
                    ${gasto.es_recurrente ? '<div class="text-xs text-blue-600 mt-1">🔄 Recurrente</div>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    S/ ${this.formatMoney(gasto.monto)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ${this.getMetodoIcon(gasto.metodo_pago)} ${this.getMetodoLabel(gasto.metodo_pago)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button data-action="edit" data-id="${gasto.id}" 
                            class="btn-edit text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                    </button>
                    <button data-action="delete" data-id="${gasto.id}" 
                            class="btn-delete text-red-600 hover:text-red-900">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        // Reinicializar iconos de Lucide
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }

    /**
     * 📊 ACTUALIZAR ESTADÍSTICAS
     */
    updateStats() {
        const statsContainer = document.getElementById('gastos-stats');
        if (!statsContainer) return;

        // Datos para estadísticas (usar datos filtrados si existen filtros activos)
        const datosParaStats = this.gastosFiltered.length < this.gastos.length ? this.gastosFiltered : this.gastos;
        
        // Calcular estadísticas
        const total = datosParaStats.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
        const promedio = datosParaStats.length > 0 ? total / datosParaStats.length : 0;
        const recurrentes = datosParaStats.filter(g => g.es_recurrente).length;
        
        // Calcular gastos del mes actual
        const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
        const gastosMesActual = datosParaStats.filter(g => g.fecha.startsWith(mesActual));
        const totalMesActual = gastosMesActual.reduce((sum, g) => sum + parseFloat(g.monto), 0);

        statsContainer.innerHTML = `
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="trending-down" class="h-8 w-8 text-red-600"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Total Gastos</dt>
                                <dd class="text-lg font-medium text-gray-900">S/ ${this.formatMoney(total)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="calendar" class="h-8 w-8 text-blue-600"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Este Mes</dt>
                                <dd class="text-lg font-medium text-gray-900">S/ ${this.formatMoney(totalMesActual)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="bar-chart-3" class="h-8 w-8 text-green-600"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Promedio</dt>
                                <dd class="text-lg font-medium text-gray-900">S/ ${this.formatMoney(promedio)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="repeat" class="h-8 w-8 text-purple-600"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Recurrentes</dt>
                                <dd class="text-lg font-medium text-gray-900">${recurrentes}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Reinicializar iconos
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
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
     * 📝 ABRIR MODAL PARA NUEVO GASTO
     */
    openGastoModal() {
        this.currentEditId = null;
        
        // Limpiar formulario
        const form = document.getElementById('gasto-form');
        if (form) form.reset();
        
        // Configurar fecha actual
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }

        // Asegurar que la sección de recurrencia esté oculta
        const recurrenciaSection = document.getElementById('frecuencia-container');
        const recurrenteCheckbox = document.getElementById('es_recurrente');
        
        if (recurrenciaSection && recurrenteCheckbox) {
            recurrenciaSection.classList.add('hidden');
            recurrenteCheckbox.checked = false;
        }
        
        // Actualizar título
        const modalTitle = document.getElementById('modal-title');
        const submitText = document.getElementById('submit-text');
        
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
        
        // Llenar formulario
        const campos = {
            'descripcion': gasto.descripcion || '',
            'monto': gasto.monto || '',
            'categoria': gasto.categoria || '',
            'metodo_pago': gasto.metodo_pago || '',
            'fecha': gasto.fecha || '',
            'notas': gasto.notas || ''
        };

        Object.entries(campos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = valor;
        });

        // Manejar checkbox de recurrencia
        const recurrenteCheckbox = document.getElementById('es_recurrente');
        const frecuenciaDiasInput = document.getElementById('frecuencia_dias');
        const recurrenciaSection = document.getElementById('frecuencia-container');
        
        if (recurrenteCheckbox) {
            recurrenteCheckbox.checked = !!gasto.es_recurrente;
            
            if (gasto.es_recurrente && recurrenciaSection) {
                recurrenciaSection.classList.remove('hidden');
                if (frecuenciaDiasInput) {
                    frecuenciaDiasInput.value = gasto.frecuencia_dias || '30';
                }
            }
        }
        
        // Actualizar título del modal
        const modalTitle = document.getElementById('modal-title');
        const submitText = document.getElementById('submit-text');
        
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
    setupRecurrenceToggle() {
        console.log('🔄 Configurando toggle de recurrencia para gastos...');
        
        // Buscar elementos en cada llamada (para modales dinámicos)
        const checkbox = document.getElementById('es_recurrente');
        const container = document.getElementById('frecuencia-container');
        
        console.log('🔍 Elementos encontrados:', {
            checkbox: !!checkbox,
            container: !!container
        });
        
        if (checkbox && container) {
            console.log('✅ Elementos encontrados, configurando event listener...');
            
            // Remover listeners previos para evitar duplicados
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
            
            // Agregar nuevo event listener
            newCheckbox.addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                const frecuenciaInput = document.getElementById('frecuencia_dias');
                
                console.log('🔄 Checkbox recurrencia gastos cambiado:', isChecked);
                console.log('🔍 Container classes antes:', container.className);
                
                if (isChecked) {
                    container.classList.remove('hidden');
                    console.log('✅ Sección de recurrencia gastos MOSTRADA');
                    console.log('🔍 Container classes después:', container.className);
                    
                    // Establecer valor por defecto
                    if (frecuenciaInput && !frecuenciaInput.value) {
                        frecuenciaInput.value = '30';
                        console.log('📅 Frecuencia establecida por defecto: 30 días');
                    }
                } else {
                    container.classList.add('hidden');
                    console.log('✅ Sección de recurrencia gastos OCULTADA');
                    console.log('🔍 Container classes después:', container.className);
                }
            });
            
            console.log('✅ Event listener configurado correctamente');
        } else {
            console.warn('⚠️ No se encontraron elementos:', {
                checkbox: checkbox ? 'ENCONTRADO' : 'NO ENCONTRADO',
                container: container ? 'ENCONTRADO' : 'NO ENCONTRADO'
            });
        }
    }

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
