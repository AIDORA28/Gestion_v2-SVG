/**
 * 🎯 HANDLER PARA GESTIÓN DE GASTOS
 * Maneja toda la funcionalidad de la página gastos.html
 */

class GastosHandler {
    constructor() {
        this.gastos = [];
        this.currentEditId = null;
        this.notyf = new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        this.init();
    }

    init() {
        console.log('🎯 Inicializando GastosHandler...');
        this.setupEventListeners();
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
            
            const response = await fetch(`${API_BASE_URL}/gastos`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.gastos = result.data || [];
                console.log(`✅ ${this.gastos.length} gastos cargados`);
                this.renderGastos();
                this.updateStats();
            } else {
                throw new Error(result.message || 'Error desconocido');
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
        
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (recurrentesElement) recurrentesElement.textContent = recurrentes.toString();
        if (categoriasElement) categoriasElement.textContent = categorias.toString();
        if (mesActualElement) mesActualElement.textContent = gastosMesActual.length.toString();
        if (totalMesElement) totalMesElement.textContent = `$${totalMesActual.toFixed(2)}`;
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
            notas: formData.get('notas') || null
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
            
            let response;
            if (this.currentEditId) {
                // Actualizar
                response = await fetch(`${API_BASE_URL}/gastos/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // Crear
                response = await fetch(`${API_BASE_URL}/gastos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.notyf.success(result.message || (this.currentEditId ? 'Gasto actualizado' : 'Gasto creado'));
                this.closeGastoModal();
                this.loadGastos(); // Recargar lista
            } else {
                throw new Error(result.message || 'Error desconocido');
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
            
            const response = await fetch(`${API_BASE_URL}/gastos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.notyf.success('Gasto eliminado exitosamente');
                this.closeDeleteModal();
                this.loadGastos(); // Recargar lista
            } else {
                throw new Error(result.message || 'Error desconocido');
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
    console.log('🚀 DOM cargado, inicializando GastosHandler...');
    window.gastosHandler = new GastosHandler();
});
