/**
 * 🎯 HANDLER PARA GESTIÓN DE GASTOS
 * Maneja toda la funcionalidad de la página gastos.html
 */

class GastosHandler {
    constructor(apiService, iaService) {
        this.apiService = apiService;
        this.iaService = iaService;
        this.gastos = [];
        this.currentEditId = null;
        this.notyf = new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        this.currentUser = this.apiService.getCurrentUser();
        if (!this.currentUser) {
            console.error("Usuario no autenticado. Redirigiendo a login...");
            window.location.href = 'login.html';
            return;
        }
        this.init();
    }

    async init() {
        console.log('🎯 Inicializando GastosHandler...');
        this.setupEventListeners();
        
        // Entrenar el modelo de IA y luego cargar los gastos
        if (this.iaService) {
            await this.iaService.trainWithUserExpenses(this.currentUser.id);
        }
        
        this.loadGastos();
        this.setDefaultDate();
        this.setupFilters();
    }

    setupEventListeners() {
        // Botón agregar gasto
        const addBtn = document.getElementById('add-gasto-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openGastoModal());
        }

        // Form submit
        const form = document.getElementById('gasto-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Checkbox recurrente
        const recurrenteCheck = document.getElementById('es_recurrente');
        if (recurrenteCheck) {
            recurrenteCheck.addEventListener('change', (e) => this.toggleFrecuencia(e.target.checked));
        }

        // Filtros
        const filterCategoria = document.getElementById('filter-categoria');
        const filterMetodo = document.getElementById('filter-metodo');
        const filterMes = document.getElementById('filter-mes');
        const clearFilters = document.getElementById('clear-filters');
        
        if (filterCategoria) {
            filterCategoria.addEventListener('change', () => this.applyFilters());
        }
        if (filterMetodo) {
            filterMetodo.addEventListener('change', () => this.applyFilters());
        }
        if (filterMes) {
            filterMes.addEventListener('change', () => this.applyFilters());
        }
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // 🔥 NUEVO: Event listener para la predicción de categoría
        const descripcionInput = document.getElementById('descripcion');
        if (descripcionInput) {
            descripcionInput.addEventListener('input', (e) => this.handleDescriptionInput(e));
        }
    }

    // 🔥 NUEVO: Método para manejar la predicción en tiempo real
    handleDescriptionInput(e) {
        const description = e.target.value;
        if (description.length > 10 && this.iaService) { // Predecir después de 10 caracteres
            const predictedCategory = this.iaService.predict(description);
            if (predictedCategory) {
                const categoriaSelect = document.getElementById('categoria');
                
                // Corregir los valores del select para que coincidan con la base de datos
                const categoryMap = {
                    'Alimentación': 'alimentacion',
                    'Transporte': 'transporte',
                    'Vivienda': 'vivienda',
                    'Salud': 'salud',
                    'Ocio': 'entretenimiento', // 'Ocio' se mapea a 'entretenimiento'
                    'Educación': 'educacion',
                    'Otros': 'otros'
                };

                const selectValue = categoryMap[predictedCategory];

                if (selectValue) {
                    const optionExists = [...categoriaSelect.options].some(option => option.value === selectValue);

                    if (optionExists) {
                        // Solo actualiza si la categoría es diferente para no molestar al usuario
                        if (categoriaSelect.value !== selectValue) {
                            categoriaSelect.value = selectValue;
                            this.notyf.success({
                                message: `Sugerencia: Categoría establecida a <b>${predictedCategory}</b>`,
                                icon: '🧠'
                            });
                        }
                    } else {
                        console.warn(`El valor de categoría predicha "${selectValue}" no existe en el select.`);
                    }
                }
            }
        }
    }

    setDefaultDate() {
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
        }

        const filterMes = document.getElementById('filter-mes');
        if (filterMes) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            filterMes.value = currentMonth;
        }
    }

    setupFilters() {
        // Setup inicial de filtros
        this.applyFilters();
    }

    async loadGastos() {
        try {
            this.showLoader();
            console.log('📥 Cargando gastos...');
            
            const { success, data, error } = await this.apiService.getGastos(this.currentUser.id);
            
            if (success) {
                this.gastos = data || [];
                console.log(`✅ ${this.gastos.length} gastos cargados`);
                this.renderGastos();
                this.updateStats();
            } else {
                throw new Error(error.message || 'Error desconocido al cargar gastos');
            }
            
        } catch (error) {
            console.error('❌ Error cargando gastos:', error);
            this.notyf.error(`Error cargando gastos: ${error.message}`);
            this.gastos = [];
            this.renderGastos();
        } finally {
            this.hideLoader();
        }
    }

    renderGastos() {
        const tbody = document.getElementById('gastos-tbody');
        const noGastos = document.getElementById('no-gastos');
        const countElement = document.getElementById('gastos-count');
        
        if (!tbody) return;

        // Aplicar filtros
        const filteredGastos = this.getFilteredGastos();

        if (filteredGastos.length === 0) {
            tbody.innerHTML = '';
            if (noGastos) noGastos.classList.remove('hidden');
            if (countElement) countElement.textContent = '0 gastos';
            return;
        }

        if (noGastos) noGastos.classList.add('hidden');
        if (countElement) countElement.textContent = `${filteredGastos.length} gasto${filteredGastos.length !== 1 ? 's' : ''}`;

        tbody.innerHTML = filteredGastos.map(gasto => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(gasto.fecha)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="font-medium">${gasto.descripcion}</div>
                    ${gasto.notas ? `<div class="text-xs text-gray-500 mt-1">${gasto.notas}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ${this.getCategoriaIcon(gasto.categoria)} ${this.getCategoriaLabel(gasto.categoria)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    $${parseFloat(gasto.monto).toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${this.getMetodoIcon(gasto.metodo_pago)} ${this.getMetodoLabel(gasto.metodo_pago)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${gasto.es_recurrente ? 
                        `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <i data-lucide="repeat" class="w-3 h-3 mr-1"></i>
                            Cada ${gasto.frecuencia_dias} días
                        </span>` : 
                        '<span class="text-gray-400">No</span>'
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center space-x-2">
                        <button onclick="gastosHandler.editGasto('${gasto.id}')" 
                                class="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="gastosHandler.confirmDelete('${gasto.id}')" 
                                class="text-red-600 hover:text-red-900 transition-colors"
                                title="Eliminar">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Reinicializar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    getFilteredGastos() {
        let filtered = [...this.gastos];
        
        const categoriaFilter = document.getElementById('filter-categoria')?.value;
        const metodoFilter = document.getElementById('filter-metodo')?.value;
        const mesFilter = document.getElementById('filter-mes')?.value;
        
        if (categoriaFilter) {
            filtered = filtered.filter(gasto => gasto.categoria === categoriaFilter);
        }
        
        if (metodoFilter) {
            filtered = filtered.filter(gasto => gasto.metodo_pago === metodoFilter);
        }
        
        if (mesFilter) {
            filtered = filtered.filter(gasto => {
                const gastoMonth = new Date(gasto.fecha).toISOString().slice(0, 7);
                return gastoMonth === mesFilter;
            });
        }
        
        return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    updateStats() {
        const totalElement = document.getElementById('stat-total');
        const recurrentesElement = document.getElementById('stat-recurrentes');
        const categoriasElement = document.getElementById('stat-categorias');
        const mesActualElement = document.getElementById('stat-mes-actual');
        const totalMesElement = document.getElementById('total-gastos-mes');
        
        const total = this.gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
        const recurrentes = this.gastos.filter(gasto => gasto.es_recurrente).length;
        const categorias = new Set(this.gastos.map(gasto => gasto.categoria)).size;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const gastosMesActual = this.gastos.filter(gasto => {
            const gastoMonth = new Date(gasto.fecha).toISOString().slice(0, 7);
            return gastoMonth === currentMonth;
        });
        const totalMesActual = gastosMesActual.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
        
        if (totalElement) totalElement.textContent = `S/ ${total.toFixed(2)}`;
        if (recurrentesElement) recurrentesElement.textContent = recurrentes.toString();
        if (categoriasElement) categoriasElement.textContent = categorias.toString();
        if (mesActualElement) mesActualElement.textContent = gastosMesActual.length.toString();
        if (totalMesElement) totalMesElement.textContent = `S/ ${totalMesActual.toFixed(2)}`;
    }

    applyFilters() {
        this.renderGastos();
    }

    clearFilters() {
        const filterCategoria = document.getElementById('filter-categoria');
        const filterMetodo = document.getElementById('filter-metodo');
        const filterMes = document.getElementById('filter-mes');
        
        if (filterCategoria) filterCategoria.value = '';
        if (filterMetodo) filterMetodo.value = '';
        if (filterMes) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            filterMes.value = currentMonth;
        }
        
        this.applyFilters();
    }

    openGastoModal(gasto = null) {
        const modal = document.getElementById('gasto-modal');
        const modalTitle = document.getElementById('modal-title');
        const submitText = document.getElementById('submit-text');
        const form = document.getElementById('gasto-form');
        
        if (!modal || !form) return;
        
        this.currentEditId = gasto ? gasto.id : null;
        
        // Configurar título y botón
        if (modalTitle) {
            modalTitle.textContent = gasto ? 'Editar Gasto' : 'Nuevo Gasto';
        }
        if (submitText) {
            submitText.textContent = gasto ? 'Actualizar Gasto' : 'Guardar Gasto';
        }
        
        // Llenar formulario si es edición
        if (gasto) {
            form.descripcion.value = gasto.descripcion || '';
            form.monto.value = gasto.monto || '';
            form.categoria.value = gasto.categoria || 'otros';
            form.fecha.value = gasto.fecha || '';
            form.metodo_pago.value = gasto.metodo_pago || 'efectivo';
            form.es_recurrente.checked = gasto.es_recurrente || false;
            form.frecuencia_dias.value = gasto.frecuencia_dias || '';
            form.notas.value = gasto.notas || '';
            this.toggleFrecuencia(gasto.es_recurrente);
        } else {
            form.reset();
            this.setDefaultDate();
            this.toggleFrecuencia(false);
        }
        
        modal.classList.remove('hidden');
    }

    closeGastoModal() {
        const modal = document.getElementById('gasto-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentEditId = null;
    }

    toggleFrecuencia(show) {
        const container = document.getElementById('frecuencia-container');
        if (container) {
            if (show) {
                container.classList.remove('hidden');
                const frecuenciaSelect = document.getElementById('frecuencia_dias');
                if (frecuenciaSelect && !frecuenciaSelect.value) {
                    frecuenciaSelect.value = '30'; // Default mensual
                }
            } else {
                container.classList.add('hidden');
                const frecuenciaSelect = document.getElementById('frecuencia_dias');
                if (frecuenciaSelect) frecuenciaSelect.value = '';
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            descripcion: formData.get('descripcion'),
            monto: parseFloat(formData.get('monto')),
            categoria: formData.get('categoria'),
            fecha: formData.get('fecha'),
            metodo_pago: formData.get('metodo_pago'),
            es_recurrente: formData.get('es_recurrente') === 'on',
            frecuencia_dias: formData.get('frecuencia_dias') ? parseInt(formData.get('frecuencia_dias')) : null,
            notas: formData.get('notas') || null,
            user_id: this.currentUser.id // Asegurarse de enviar el user_id
        };
        
        // Validaciones
        if (!data.descripcion || !data.monto) {
            this.notyf.error('Descripción y monto son requeridos');
            return;
        }
        
        if (data.monto <= 0) {
            this.notyf.error('El monto debe ser mayor a 0');
            return;
        }
        
        try {
            this.showLoader();
            
            let result;
            if (this.currentEditId) {
                // Actualizar
                result = await this.apiService.updateGasto(this.currentEditId, data);
            } else {
                // Crear
                result = await this.apiService.createGasto(data);
            }
            
            if (result.success) {
                this.notyf.success(this.currentEditId ? 'Gasto actualizado' : 'Gasto creado');
                this.closeGastoModal();
                this.loadGastos(); // Recargar lista
            } else {
                throw new Error(result.error.message || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error guardando gasto:', error);
            this.notyf.error(`Error guardando gasto: ${error.message}`);
        } finally {
            this.hideLoader();
        }
    }

    editGasto(id) {
        const gasto = this.gastos.find(g => g.id === id);
        if (gasto) {
            this.openGastoModal(gasto);
        }
    }

    confirmDelete(id) {
        this.currentDeleteId = id;
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        const confirmBtn = document.getElementById('confirm-delete');
        if (confirmBtn) {
            confirmBtn.onclick = () => this.deleteGasto(id);
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.classList.add('hidden');
        this.currentDeleteId = null;
    }

    async deleteGasto(id) {
        try {
            this.showLoader();
            
            const result = await this.apiService.deleteGasto(id);
            
            if (result.success) {
                this.notyf.success('Gasto eliminado exitosamente');
                this.closeDeleteModal();
                this.loadGastos(); // Recargar lista
            } else {
                throw new Error(result.error.message || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando gasto:', error);
            this.notyf.error(`Error eliminando gasto: ${error.message}`);
        } finally {
            this.hideLoader();
        }
    }

    // Utilities
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getCategoriaIcon(categoria) {
        const icons = {
            alimentacion: '🍽️',
            transporte: '🚗',
            vivienda: '🏠',
            salud: '🏥',
            entretenimiento: '🎬',
            educacion: '📚',
            otros: '📝'
        };
        return icons[categoria] || '📝';
    }

    getCategoriaLabel(categoria) {
        const labels = {
            alimentacion: 'Alimentación',
            transporte: 'Transporte',
            vivienda: 'Vivienda',
            salud: 'Salud',
            entretenimiento: 'Entretenimiento',
            educacion: 'Educación',
            otros: 'Otros'
        };
        return labels[categoria] || 'Otros';
    }

    getMetodoIcon(metodo) {
        const icons = {
            efectivo: '💵',
            tarjeta_debito: '💳',
            tarjeta_credito: '💰',
            transferencia: '🏦',
            otros: '📝'
        };
        return icons[metodo] || '📝';
    }

    getMetodoLabel(metodo) {
        const labels = {
            efectivo: 'Efectivo',
            tarjeta_debito: 'T. Débito',
            tarjeta_credito: 'T. Crédito',
            transferencia: 'Transferencia',
            otros: 'Otros'
        };
        return labels[metodo] || 'Otros';
    }

    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
    }
}

// Funciones globales para los botones
function openGastoModal() {
    if (window.gastosHandler) {
        window.gastosHandler.openGastoModal();
    }
}

function closeGastoModal() {
    if (window.gastosHandler) {
        window.gastosHandler.closeGastoModal();
    }
}

function closeDeleteModal() {
    if (window.gastosHandler) {
        window.gastosHandler.closeDeleteModal();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, esperando servicios...');
    
    // Esperar a que los servicios estén listos
    setTimeout(() => {
        const apiService = window.getAPIService();
        const iaService = window.getIAService();

        if (apiService && iaService) {
            console.log('✅ Servicios API e IA listos. Inicializando GastosHandler...');
            window.gastosHandler = new GastosHandler(apiService, iaService);
        } else {
            console.error('❌ No se pudieron inicializar los servicios. API o IA no están disponibles.');
            if (!apiService) console.error('APIService no encontrado.');
            if (!iaService) console.error('IAService no encontrado.');
        }
    }, 500); // Dar un margen para que se carguen los otros scripts
});
