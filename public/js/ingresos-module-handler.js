/**
 * 💰 MÓDULO DE INGRESOS - PATRÓN DASHBOARD OPTIMIZADO
 * Siguiendo exactamente el patrón exitoso del dashboard:
 * ✅ Supabase Auth - Autenticación integrada
 * ✅ Supabase Database - PostgreSQL con APIs automáticas
 * ✅ API Service JavaScript - CRUD completo client-side
 * Versión: 3.0 - Septiembre 2025
 */

class IngresosModuleHandler {
    constructor() {
        // 🎯 CONFIGURACIÓN SUPABASE (igual que dashboard)
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        
        // 🔐 AUTENTICACIÓN (patrón dashboard)
        this.authToken = null;
        this.usuarioId = null;
        
        // 📊 DATOS DEL MÓDULO
        this.ingresos = [];
        this.ingresosFiltered = [];
        this.currentEditId = null;
        
        // 🔍 FILTROS
        this.filters = {
            categoria: '',
            año: '',
            mes: ''
        };
        
        // 🎨 NOTIFICACIONES
        this.notyf = window.notyf || new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        
        console.log('💰 IngresosModuleHandler inicializado (patrón dashboard)');
    }

    /**
     * 🎯 INICIALIZACIÓN (patrón dashboard exacto)
     */
    async init() {
        try {
            console.log('🚀 Inicializando módulo ingresos (patrón dashboard)...');
            
            // 🔐 PASO 1: Verificar autenticación automática
            await this.checkAuth();
            
            // 📊 PASO 2: Cargar datos reales
            await this.loadIngresos();
            
            // 🎨 PASO 3: Configurar interfaz
            this.setupFormEvents();
            this.setupFilters();
            
            console.log('✅ Módulo ingresos inicializado exitosamente (patrón dashboard)');
            
        } catch (error) {
            console.error('❌ Error inicializando módulo ingresos:', error);
            
            // 🎯 PATRÓN DASHBOARD: Auto-redirect en errores de auth
            if (error.message.includes('auth') || error.message.includes('token')) {
                console.log('🔄 Redirigiendo a login...');
                window.location.href = '/auth.html';
            }
            
            if (this.notyf) {
                this.notyf.error('Error inicializando módulo de ingresos');
            }
        }
    }

    /**
     * 🔐 VERIFICAR AUTENTICACIÓN (patrón dashboard exacto)
     */
    async checkAuth() {
        console.log('🔐 Verificando autenticación (patrón dashboard)...');
        
        // Obtener token y usuario (igual que dashboard)
        this.authToken = localStorage.getItem('supabase_access_token');
        const userData = localStorage.getItem('currentUser');
        
        if (!this.authToken) {
            console.error('❌ Token no encontrado - redirigiendo a login');
            window.location.href = '/auth.html';
            throw new Error('Token de autenticación no encontrado');
        }

        if (!userData) {
            console.error('❌ Datos de usuario no encontrados - redirigiendo a login');
            window.location.href = '/auth.html';
            throw new Error('Datos de usuario no encontrados');
        }

        const user = JSON.parse(userData);
        this.usuarioId = user.id;
        
        console.log('✅ Autenticación verificada (patrón dashboard):');
        console.log('   📧 Email:', user.email);
        console.log('   🆔 User ID:', this.usuarioId);
        console.log('   🔑 Token length:', this.authToken.length, 'chars');
    }

    /**
     * 📊 CARGAR INGRESOS (patrón dashboard con token real)
     */
    async loadIngresos() {
        try {
            console.log('📊 Cargando ingresos (patrón dashboard con token real)...');

            if (!this.authToken || !this.usuarioId) {
                throw new Error('Usuario no autenticado');
            }

            // 🎯 PATRÓN DASHBOARD: Usar token real del usuario (NO anon key)
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/ingresos?usuario_id=eq.${this.usuarioId}&select=*&order=fecha.desc,created_at.desc`, 
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
                if (response.status === 401) {
                    console.error('❌ Token expirado - redirigiendo a login');
                    window.location.href = '/auth.html';
                    return;
                }
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            this.ingresos = Array.isArray(data) ? data : [];
            this.ingresosFiltered = [...this.ingresos]; // Inicializar filtrados
            
            console.log(`✅ Ingresos cargados (patrón dashboard): ${this.ingresos.length} registros`);
            
            // 🎨 Renderizar en interfaz
            this.applyFilters();
            this.updateStats();

        } catch (error) {
            console.error('❌ Error cargando ingresos:', error);
            
            if (error.message.includes('auth') || error.message.includes('401')) {
                window.location.href = '/auth.html';
            }
            
            if (this.notyf) {
                this.notyf.error('Error cargando ingresos');
            }
        }
    }

    /**
     * 📝 ENVIAR INGRESO (patrón dashboard con token real)
     */
    async submitIngreso(data) {
        console.log('📝 submitIngreso (patrón dashboard con token real):', data);
        
        try {
            // Validaciones básicas
            if (!data.descripcion?.trim()) {
                throw new Error('La descripción es requerida');
            }
            
            if (!data.monto || parseFloat(data.monto) <= 0) {
                throw new Error('El monto debe ser mayor a 0');
            }
            
            // Verificar autenticación
            if (!this.authToken || !this.usuarioId) {
                console.error('❌ Usuario no autenticado en submitIngreso');
                window.location.href = '/auth.html';
                throw new Error('Usuario no autenticado');
            }
            
            // Preparar datos
            const supabaseData = {
                descripcion: data.descripcion.trim(),
                monto: parseFloat(data.monto),
                categoria: data.categoria || 'Otros',
                fecha: data.fecha || new Date().toISOString().split('T')[0],
                es_recurrente: data.es_recurrente || false,
                frecuencia_dias: data.es_recurrente ? (data.frecuencia_dias || 30) : null,
                notas: data.notas?.trim() || null,
                usuario_id: this.usuarioId
            };
            
            // 🔄 DETERMINAR SI ES EDICIÓN O CREACIÓN
            const isEdit = !!this.currentEditId;
            const method = isEdit ? 'PATCH' : 'POST';
            const url = isEdit ? 
                `${this.supabaseUrl}/rest/v1/ingresos?id=eq.${this.currentEditId}` : 
                `${this.supabaseUrl}/rest/v1/ingresos`;
            
            console.log(`🚀 ${isEdit ? 'Actualizando' : 'Creando'} en Supabase (token real):`, supabaseData);
            
            // 🎯 PATRÓN DASHBOARD: Usar token real del usuario
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.authToken}`, // 🔑 TOKEN REAL
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(supabaseData)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('❌ Token expirado en submitIngreso');
                    window.location.href = '/auth.html';
                    return { success: false, error: 'Sesión expirada' };
                }
                
                const errorText = await response.text();
                console.error('❌ Error en respuesta:', response.status, errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            const result = await response.json();
            const operacion = isEdit ? 'actualizado' : 'creado';
            console.log(`✅ Ingreso ${operacion} exitosamente (patrón dashboard):`, result);
            
            // 🔄 Recargar datos y actualizar interfaz (patrón dashboard)
            await this.loadIngresos();
            
            // Limpiar ID de edición
            this.currentEditId = null;
            
            if (this.notyf) {
                this.notyf.success(`Ingreso ${operacion} exitosamente`);
            }
            
            return { success: true, data: result[0] || result };
            
        } catch (error) {
            console.error('❌ Error en submitIngreso:', error);
            
            if (this.notyf) {
                this.notyf.error(error.message || 'Error al agregar ingreso');
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎨 RENDERIZAR INGRESOS (interfaz optimizada - tabla)
     */
    renderIngresos() {
        const tbody = document.getElementById('ingresos-tbody');
        const noIngresosDiv = document.getElementById('no-ingresos');
        const countSpan = document.getElementById('ingresos-count');
        
        if (!tbody) {
            console.warn('⚠️ Contenedor ingresos-tbody no encontrado');
            return;
        }

        // Usar datos filtrados si existen, sino usar todos
        const datosParaMostrar = this.ingresosFiltered.length >= 0 ? this.ingresosFiltered : this.ingresos;
        
        // Actualizar contador
        if (countSpan) {
            const totalText = datosParaMostrar.length !== this.ingresos.length ? 
                `${datosParaMostrar.length} de ${this.ingresos.length} ingresos` : 
                `${this.ingresos.length} ingresos`;
            countSpan.textContent = totalText;
        }

        if (datosParaMostrar.length === 0) {
            tbody.innerHTML = '';
            if (noIngresosDiv) {
                noIngresosDiv.classList.remove('hidden');
            }
            return;
        }

        // Ocultar mensaje de vacío
        if (noIngresosDiv) {
            noIngresosDiv.classList.add('hidden');
        }

        // Generar filas de tabla
        tbody.innerHTML = datosParaMostrar.map(ingreso => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(ingreso.fecha)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="font-medium">${ingreso.descripcion}</div>
                    ${ingreso.notas ? `<div class="text-gray-500 text-xs mt-1">${ingreso.notas}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${ingreso.categoria || 'otros'}
                    </span>
                    ${ingreso.es_recurrente ? '<div class="text-xs text-blue-600 mt-1">🔄 Recurrente</div>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $${this.formatMoney(ingreso.monto)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="window.ingresosModuleHandler.editIngreso('${ingreso.id}')" 
                            class="text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                    </button>
                    <button onclick="window.ingresosModuleHandler.deleteIngreso('${ingreso.id}')" 
                            class="text-red-600 hover:text-red-900">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * 📊 ACTUALIZAR ESTADÍSTICAS (patrón dashboard)
     */
    updateStats() {
        const statsContainer = document.getElementById('ingresos-stats');
        if (!statsContainer) return;

        // Usar datos filtrados o todos si no hay filtros
        const datosParaStats = this.ingresosFiltered.length >= 0 ? this.ingresosFiltered : this.ingresos;
        
        const total = datosParaStats.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto), 0);
        const promedio = datosParaStats.length > 0 ? total / datosParaStats.length : 0;
        const recurrentes = datosParaStats.filter(ingreso => ingreso.es_recurrente).length;

        statsContainer.innerHTML = `
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="dollar-sign" class="h-6 w-6 text-green-600"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Total Ingresos</dt>
                                <dd class="text-lg font-medium text-gray-900">$${this.formatMoney(total)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="trending-up" class="h-6 w-6 text-blue-600"></i>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Promedio</dt>
                                <dd class="text-lg font-medium text-gray-900">$${this.formatMoney(promedio)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i data-lucide="repeat" class="h-6 w-6 text-purple-600"></i>
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

        // Inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * 📝 MANEJAR ENVÍO DE FORMULARIO (patrón dashboard)
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        console.log('📝 handleSubmit activado (patrón dashboard)');
        
        try {
            const formData = new FormData(event.target);
            
            const data = {
                descripcion: formData.get('descripcion')?.trim(),
                monto: formData.get('monto'),
                categoria: formData.get('categoria'),
                fecha: formData.get('fecha'),
                es_recurrente: formData.get('es_recurrente') === 'on',
                tipo_recurrencia: formData.get('tipo_recurrencia'),
                notas: formData.get('notas')?.trim()
            };
            
            console.log('📊 Datos del formulario:', data);
            
            // Enviar usando patrón dashboard
            const result = await this.submitIngreso(data);
            
            if (result.success) {
                console.log('✅ Formulario enviado exitosamente (patrón dashboard)');
                
                // Limpiar formulario
                event.target.reset();
                
                // Cerrar modal si existe
                this.closeIngresoModal();
                
            } else {
                console.error('❌ Error en envío de formulario:', result.error);
            }
            
        } catch (error) {
            console.error('❌ Error en handleSubmit:', error);
            
            if (this.notyf) {
                this.notyf.error('Error al procesar formulario');
            }
        }
    }

    /**
     * 🎨 CONFIGURAR EVENTOS DEL FORMULARIO
     */
    setupFormEvents() {
        const form = document.getElementById('ingreso-form');
        if (form) {
            // Remover event listeners previos
            form.removeEventListener('submit', this.handleSubmit.bind(this));
            
            // Agregar event listener
            form.addEventListener('submit', this.handleSubmit.bind(this));
            
            console.log('✅ Event listeners configurados (patrón dashboard)');
        }
    }

    /**
     * 🎨 ABRIR MODAL (mejorado con recurrencia)
     */
    openIngresoModal() {
        const modal = document.getElementById('ingreso-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Reinicializar elementos del modal
            setTimeout(() => {
                // Configurar fecha actual
                const fechaInput = document.getElementById('fecha');
                if (fechaInput && !fechaInput.value) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaInput.value = today;
                }
                
                // Reconfigurar checkbox de recurrencia
                if (typeof window.handleRecurrenceChange === 'function') {
                    const checkbox = document.getElementById('es_recurrente');
                    const container = document.getElementById('frecuencia-container');
                    
                    if (checkbox && container) {
                        // Asegurar que esté oculto inicialmente
                        container.classList.add('hidden');
                        checkbox.checked = false;
                        
                        // Remover y reagregar event listener
                        checkbox.removeEventListener('change', window.handleRecurrenceChange);
                        checkbox.addEventListener('change', window.handleRecurrenceChange);
                        
                        console.log('✅ Modal abierto - recurrencia configurada');
                    }
                }
                
                // Enfocar primer campo
                const firstInput = modal.querySelector('input[type="text"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }

    /**
     * 🎨 CERRAR MODAL (con limpieza completa)
     */
    closeIngresoModal() {
        const modal = document.getElementById('ingreso-modal');
        if (modal) {
            modal.classList.add('hidden');
            
            // Limpiar formulario
            const form = document.getElementById('ingreso-form');
            if (form) {
                form.reset();
            }
            
            // Resetear título del modal
            const modalTitle = document.getElementById('ingreso-modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Agregar Ingreso';
            }
            
            // Limpiar ID de edición
            this.currentEditId = null;
            
            // Ocultar sección de recurrencia
            const frecuenciaContainer = document.getElementById('frecuencia-container');
            if (frecuenciaContainer) {
                frecuenciaContainer.classList.add('hidden');
            }
            
            console.log('✅ Modal cerrado y limpiado');
        }
    }

    /**
     * ✏️ EDITAR INGRESO (implementación completa)
     */
    async editIngreso(id) {
        console.log('✏️ Editando ingreso:', id);
        
        try {
            // Buscar el ingreso por ID
            const ingreso = this.ingresos.find(ing => ing.id === id);
            
            if (!ingreso) {
                console.error('❌ Ingreso no encontrado:', id);
                if (this.notyf) {
                    this.notyf.error('Ingreso no encontrado');
                }
                return;
            }
            
            console.log('📄 Datos del ingreso a editar:', ingreso);
            
            // Abrir modal
            this.openIngresoModal();
            
            // Esperar a que el modal esté completamente abierto
            setTimeout(() => {
                // Cambiar título del modal
                const modalTitle = document.getElementById('ingreso-modal-title');
                if (modalTitle) {
                    modalTitle.textContent = 'Editar Ingreso';
                }
                
                // Llenar formulario con datos existentes
                const form = document.getElementById('ingreso-form');
                if (form) {
                    // Campos básicos
                    const descripcionInput = document.getElementById('descripcion');
                    const montoInput = document.getElementById('monto');
                    const categoriaInput = document.getElementById('categoria');
                    const fechaInput = document.getElementById('fecha');
                    const notasInput = document.getElementById('notas');
                    
                    if (descripcionInput) descripcionInput.value = ingreso.descripcion || '';
                    if (montoInput) montoInput.value = ingreso.monto || '';
                    if (categoriaInput) categoriaInput.value = ingreso.categoria || '';
                    if (fechaInput) fechaInput.value = ingreso.fecha || '';
                    if (notasInput) notasInput.value = ingreso.notas || '';
                    
                    // Checkbox de recurrencia
                    const recurrenteCheckbox = document.getElementById('es_recurrente');
                    const frecuenciaContainer = document.getElementById('frecuencia-container');
                    const frecuenciaInput = document.getElementById('frecuencia_dias');
                    
                    if (recurrenteCheckbox) {
                        recurrenteCheckbox.checked = ingreso.es_recurrente || false;
                        
                        // Mostrar/ocultar sección de frecuencia
                        if (frecuenciaContainer) {
                            if (ingreso.es_recurrente) {
                                frecuenciaContainer.classList.remove('hidden');
                                if (frecuenciaInput) {
                                    frecuenciaInput.value = ingreso.frecuencia_dias || 30;
                                }
                            } else {
                                frecuenciaContainer.classList.add('hidden');
                            }
                        }
                    }
                    
                    // Guardar ID para actualización
                    this.currentEditId = id;
                    
                    console.log('✅ Formulario llenado para edición');
                }
            }, 150);
            
        } catch (error) {
            console.error('❌ Error al editar ingreso:', error);
            if (this.notyf) {
                this.notyf.error('Error al cargar datos para edición');
            }
        }
    }

    /**
     * 🗑️ ELIMINAR INGRESO
     */
    async deleteIngreso(id) {
        console.log('🗑️ Eliminando ingreso:', id);
        
        if (!confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/ingresos?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                if (this.notyf) {
                    this.notyf.success('Ingreso eliminado');
                }
                
                await this.loadIngresos();
            } else {
                throw new Error('Error eliminando ingreso');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando ingreso:', error);
            
            if (this.notyf) {
                this.notyf.error('Error al eliminar ingreso');
            }
        }
    }

    /**
     * 💰 FORMATEAR DINERO
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
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * 🧪 DEBUG TEST (funciones de prueba)
     */
    async debugTest() {
        console.log('🧪 === DEBUG TEST INGRESOS (PATRÓN DASHBOARD) ===');
        
        const testData = {
            descripcion: 'Test Debug Optimizado',
            monto: '888.88',
            categoria: 'Freelance',
            fecha: new Date().toISOString().split('T')[0],
            notas: 'Prueba con patrón dashboard optimizado'
        };
        
        try {
            const result = await this.submitIngreso(testData);
            console.log('✅ Debug test completado:', result);
            return result;
        } catch (error) {
            console.error('❌ Error en debug test:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔍 CONFIGURAR FILTROS
     */
    setupFilters() {
        console.log('🔍 Configurando sistema de filtros...');
        
        // Llenar categorías dinámicamente
        this.populateCategories();
        
        // Llenar años dinámicamente
        this.populateYears();
        
        console.log('✅ Filtros configurados');
    }
    
    /**
     * 📋 LLENAR CATEGORÍAS
     */
    populateCategories() {
        const categoriaSelect = document.getElementById('filter-categoria');
        if (!categoriaSelect) return;
        
        // Obtener categorías únicas de los ingresos
        const categorias = [...new Set(this.ingresos.map(ing => ing.categoria || 'otros'))];
        
        // Categorías predefinidas con iconos
        const categoriasConIconos = {
            'Salario': '💼 Salario',
            'Freelance': '💻 Freelance', 
            'Negocio': '🏪 Negocio',
            'Inversiones': '📈 Inversiones',
            'Ventas': '🛒 Ventas',
            'Comisiones': '🤝 Comisiones',
            'Bonificaciones': '🎁 Bonificaciones',
            'Alquiler': '🏠 Alquiler',
            'Intereses': '💰 Intereses',
            'Dividendos': '📊 Dividendos',
            'Pensión': '👴 Pensión',
            'Subsidios': '🏛️ Subsidios',
            'Regalos': '🎉 Regalos',
            'Préstamos': '🏦 Préstamos',
            'otros': '📦 Otros'
        };
        
        // Limpiar opciones existentes (excepto "Todas")
        categoriaSelect.innerHTML = '<option value="">Todas las categorías</option>';
        
        // Agregar categorías encontradas
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoriasConIconos[categoria] || categoria;
            categoriaSelect.appendChild(option);
        });
    }
    
    /**
     * 📅 LLENAR AÑOS
     */
    populateYears() {
        const añoSelect = document.getElementById('filter-año');
        if (!añoSelect) return;
        
        // Obtener años únicos de los ingresos
        const años = [...new Set(this.ingresos.map(ing => new Date(ing.fecha).getFullYear()))];
        años.sort((a, b) => b - a); // Más reciente primero
        
        // Limpiar opciones existentes
        añoSelect.innerHTML = '<option value="">Todos los años</option>';
        
        // Agregar años encontrados
        años.forEach(año => {
            const option = document.createElement('option');
            option.value = año;
            option.textContent = año;
            añoSelect.appendChild(option);
        });
    }
    
    /**
     * 🔍 APLICAR FILTROS
     */
    applyFilters() {
        console.log('🔍 Aplicando filtros...');
        
        // Obtener valores de filtros
        const categoriaFilter = document.getElementById('filter-categoria')?.value || '';
        const añoFilter = document.getElementById('filter-año')?.value || '';
        const mesFilter = document.getElementById('filter-mes')?.value || '';
        
        // Actualizar estado de filtros
        this.filters = {
            categoria: categoriaFilter,
            año: añoFilter,
            mes: mesFilter
        };
        
        // Aplicar filtros
        this.ingresosFiltered = this.ingresos.filter(ingreso => {
            // Filtro por categoría
            if (categoriaFilter && ingreso.categoria !== categoriaFilter) {
                return false;
            }
            
            // Filtro por año
            if (añoFilter) {
                const ingresoAño = new Date(ingreso.fecha).getFullYear().toString();
                if (ingresoAño !== añoFilter) {
                    return false;
                }
            }
            
            // Filtro por mes
            if (mesFilter) {
                const ingresoMes = String(new Date(ingreso.fecha).getMonth() + 1).padStart(2, '0');
                if (ingresoMes !== mesFilter) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log(`✅ Filtros aplicados: ${this.ingresosFiltered.length}/${this.ingresos.length} ingresos`);
        
        // Renderizar resultados filtrados
        this.renderIngresos();
        this.updateStats();
    }
    
    /**
     * 🧹 LIMPIAR FILTROS
     */
    clearFilters() {
        console.log('🧹 Limpiando filtros...');
        
        // Limpiar selects
        const categoriaSelect = document.getElementById('filter-categoria');
        const añoSelect = document.getElementById('filter-año');
        const mesSelect = document.getElementById('filter-mes');
        
        if (categoriaSelect) categoriaSelect.value = '';
        if (añoSelect) añoSelect.value = '';
        if (mesSelect) mesSelect.value = '';
        
        // Resetear filtros
        this.filters = {
            categoria: '',
            año: '',
            mes: ''
        };
        
        // Mostrar todos los ingresos
        this.ingresosFiltered = [...this.ingresos];
        
        console.log('✅ Filtros limpiados');
        
        // Rerenderizar
        this.renderIngresos();
        this.updateStats();
        
        if (this.notyf) {
            this.notyf.success('Filtros limpiados');
        }
    }
    
    /**
     * 📤 EXPORTAR DATOS FILTRADOS (CSV limpio)
     */
    exportFiltered() {
        console.log('📤 Exportando datos filtrados...');
        
        const dataToExport = this.ingresosFiltered.length > 0 ? this.ingresosFiltered : this.ingresos;
        
        // Función para limpiar texto y evitar caracteres problemáticos
        const cleanText = (text) => {
            if (!text) return '';
            return String(text)
                .replace(/"/g, '""') // Escapar comillas dobles
                .replace(/[\r\n]/g, ' ') // Reemplazar saltos de línea con espacios
                .trim();
        };
        
        // Crear CSV con codificación UTF-8 y BOM
        const headers = ['Fecha', 'Descripcion', 'Categoria', 'Monto', 'Recurrente', 'Notas'];
        const csvRows = dataToExport.map(ingreso => [
            ingreso.fecha || '',
            cleanText(ingreso.descripcion),
            cleanText(ingreso.categoria || 'otros'),
            ingreso.monto || 0,
            ingreso.es_recurrente ? 'Si' : 'No',
            cleanText(ingreso.notas)
        ]);
        
        // Construir CSV
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\r\n');
        
        // Agregar BOM para UTF-8 (ayuda con caracteres especiales)
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        
        // Descargar archivo
        const blob = new Blob([csvWithBOM], { 
            type: 'text/csv;charset=utf-8' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ingresos_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        if (this.notyf) {
            this.notyf.success(`Exportados ${dataToExport.length} ingresos`);
        }
        
        console.log(`✅ Exportados ${dataToExport.length} ingresos con codificación mejorada`);
    }

    /**
     * 🔍 DIAGNÓSTICO DEL SISTEMA
     */
    async diagnosticCheck() {
        console.log('🔍 === DIAGNÓSTICO INGRESOS (PATRÓN DASHBOARD) ===');
        
        const status = {
            auth: false,
            supabase: false,
            template: false,
            form: false
        };
        
        try {
            // Verificar autenticación
            status.auth = !!(this.authToken && this.usuarioId);
            console.log(status.auth ? '✅ Auth: OK' : '❌ Auth: FALLO');
            
            // Verificar Supabase
            try {
                const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
                    headers: { 'apikey': this.supabaseKey }
                });
                status.supabase = response.ok;
                console.log(status.supabase ? '✅ Supabase: OK' : '❌ Supabase: FALLO');
            } catch (error) {
                console.log('❌ Supabase: FALLO -', error.message);
            }
            
            // Verificar template
            const modal = document.getElementById('ingreso-modal');
            const form = document.getElementById('ingreso-form');
            status.template = !!(modal && form);
            console.log(status.template ? '✅ Template: OK' : '❌ Template: FALLO');
            
            // Verificar form
            if (form) {
                const fields = ['descripcion', 'monto', 'categoria', 'fecha'];
                const missingFields = fields.filter(field => !document.getElementById(field));
                status.form = missingFields.length === 0;
                
                if (status.form) {
                    console.log('✅ Formulario: OK');
                } else {
                    console.log('❌ Formulario: FALTAN CAMPOS -', missingFields);
                }
            }
            
            console.log('📊 Estado general:', status);
            return status;
            
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
            return status;
        }
    }
}

// 🌍 DISPONIBILIDAD GLOBAL
window.IngresosModuleHandler = IngresosModuleHandler;

// 🧪 FUNCIONES DE DEBUG GLOBALES
window.debugIngresos = function() {
    if (window.ingresosModuleHandler) {
        return window.ingresosModuleHandler.debugTest();
    } else {
        console.error('❌ Handler no inicializado');
        return { success: false, error: 'Handler no inicializado' };
    }
};

window.diagnosticIngresos = function() {
    if (window.ingresosModuleHandler) {
        return window.ingresosModuleHandler.diagnosticCheck();
    } else {
        console.error('❌ Handler no inicializado');
        return { success: false, error: 'Handler no inicializado' };
    }
};

console.log('✅ IngresosModuleHandler (patrón dashboard) cargado y disponible globalmente');
