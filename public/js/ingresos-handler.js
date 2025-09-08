/**
 * 🎯 HANDLER PARA GESTIÓN DE INGRESOS
 * Maneja toda la funcionalidad de la página ingresos.html
 */

class IngresosHandler {
    constructor() {
        this.ingresos = [];
        this.currentEditId = null;
        this.notyf = new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        this.init();
    }

    init() {
        console.log('🎯 Inicializando IngresosHandler...');
        this.setupEventListeners();
        this.loadIngresos();
        this.setDefaultDate();
        this.setupFilters();
    }

    setupEventListeners() {
        // Botón agregar ingreso
        const addBtn = document.getElementById('add-ingreso-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openIngresoModal());
        }

        // Form submit
        const form = document.getElementById('ingreso-form');
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
        const filterMes = document.getElementById('filter-mes');
        const clearFilters = document.getElementById('clear-filters');
        
        if (filterCategoria) {
            filterCategoria.addEventListener('change', () => this.applyFilters());
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

    async loadIngresos() {
        try {
            this.showLoader();
            console.log('📥 Cargando ingresos...');
            
            const response = await fetch(`${API_BASE_URL}/ingresos`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.ingresos = result.data || [];
                console.log(`✅ ${this.ingresos.length} ingresos cargados`);
                this.renderIngresos();
                this.updateStats();
            } else {
                throw new Error(result.message || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error cargando ingresos:', error);
            this.notyf.error(`Error cargando ingresos: ${error.message}`);
            this.ingresos = [];
            this.renderIngresos();
        } finally {
            this.hideLoader();
        }
    }

    renderIngresos() {
        const tbody = document.getElementById('ingresos-tbody');
        const noIngresos = document.getElementById('no-ingresos');
        const countElement = document.getElementById('ingresos-count');
        
        if (!tbody) return;

        // Aplicar filtros
        const filteredIngresos = this.getFilteredIngresos();

        if (filteredIngresos.length === 0) {
            tbody.innerHTML = '';
            if (noIngresos) noIngresos.classList.remove('hidden');
            if (countElement) countElement.textContent = '0 ingresos';
            return;
        }

        if (noIngresos) noIngresos.classList.add('hidden');
        if (countElement) countElement.textContent = `${filteredIngresos.length} ingreso${filteredIngresos.length !== 1 ? 's' : ''}`;

        tbody.innerHTML = filteredIngresos.map(ingreso => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(ingreso.fecha)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="font-medium">${ingreso.descripcion}</div>
                    ${ingreso.notas ? `<div class="text-xs text-gray-500 mt-1">${ingreso.notas}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${this.getCategoriaIcon(ingreso.categoria)} ${this.getCategoriaLabel(ingreso.categoria)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    $${parseFloat(ingreso.monto).toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${ingreso.es_recurrente ? 
                        `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <i data-lucide="repeat" class="w-3 h-3 mr-1"></i>
                            Cada ${ingreso.frecuencia_dias} días
                        </span>` : 
                        '<span class="text-gray-400">No</span>'
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center space-x-2">
                        <button onclick="ingresosHandler.editIngreso('${ingreso.id}')" 
                                class="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="ingresosHandler.confirmDelete('${ingreso.id}')" 
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

    getFilteredIngresos() {
        let filtered = [...this.ingresos];
        
        const categoriaFilter = document.getElementById('filter-categoria')?.value;
        const mesFilter = document.getElementById('filter-mes')?.value;
        
        if (categoriaFilter) {
            filtered = filtered.filter(ingreso => ingreso.categoria === categoriaFilter);
        }
        
        if (mesFilter) {
            filtered = filtered.filter(ingreso => {
                const ingresoMonth = new Date(ingreso.fecha).toISOString().slice(0, 7);
                return ingresoMonth === mesFilter;
            });
        }
        
        return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    updateStats() {
        const totalElement = document.getElementById('stat-total');
        const recurrentesElement = document.getElementById('stat-recurrentes');
        const categoriasElement = document.getElementById('stat-categorias');
        const mesActualElement = document.getElementById('stat-mes-actual');
        const totalMesElement = document.getElementById('total-ingresos-mes');
        
        const total = this.ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto), 0);
        const recurrentes = this.ingresos.filter(ingreso => ingreso.es_recurrente).length;
        const categorias = new Set(this.ingresos.map(ingreso => ingreso.categoria)).size;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const ingresosMesActual = this.ingresos.filter(ingreso => {
            const ingresoMonth = new Date(ingreso.fecha).toISOString().slice(0, 7);
            return ingresoMonth === currentMonth;
        });
        const totalMesActual = ingresosMesActual.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto), 0);
        
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
        if (recurrentesElement) recurrentesElement.textContent = recurrentes.toString();
        if (categoriasElement) categoriasElement.textContent = categorias.toString();
        if (mesActualElement) mesActualElement.textContent = ingresosMesActual.length.toString();
        if (totalMesElement) totalMesElement.textContent = `$${totalMesActual.toFixed(2)}`;
    }

    applyFilters() {
        this.renderIngresos();
    }

    clearFilters() {
        const filterCategoria = document.getElementById('filter-categoria');
        const filterMes = document.getElementById('filter-mes');
        
        if (filterCategoria) filterCategoria.value = '';
        if (filterMes) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            filterMes.value = currentMonth;
        }
        
        this.applyFilters();
    }

    openIngresoModal(ingreso = null) {
        const modal = document.getElementById('ingreso-modal');
        const modalTitle = document.getElementById('modal-title');
        const submitText = document.getElementById('submit-text');
        const form = document.getElementById('ingreso-form');
        
        if (!modal || !form) return;
        
        this.currentEditId = ingreso ? ingreso.id : null;
        
        // Configurar título y botón
        if (modalTitle) {
            modalTitle.textContent = ingreso ? 'Editar Ingreso' : 'Nuevo Ingreso';
        }
        if (submitText) {
            submitText.textContent = ingreso ? 'Actualizar Ingreso' : 'Guardar Ingreso';
        }
        
        // Llenar formulario si es edición
        if (ingreso) {
            form.descripcion.value = ingreso.descripcion || '';
            form.monto.value = ingreso.monto || '';
            form.categoria.value = ingreso.categoria || 'otros';
            form.fecha.value = ingreso.fecha || '';
            form.es_recurrente.checked = ingreso.es_recurrente || false;
            form.frecuencia_dias.value = ingreso.frecuencia_dias || '';
            form.notas.value = ingreso.notas || '';
            this.toggleFrecuencia(ingreso.es_recurrente);
        } else {
            form.reset();
            this.setDefaultDate();
            this.toggleFrecuencia(false);
        }
        
        modal.classList.remove('hidden');
    }

    closeIngresoModal() {
        const modal = document.getElementById('ingreso-modal');
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
                response = await fetch(`${API_BASE_URL}/ingresos/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // Crear
                response = await fetch(`${API_BASE_URL}/ingresos`, {
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
                this.notyf.success(result.message || (this.currentEditId ? 'Ingreso actualizado' : 'Ingreso creado'));
                this.closeIngresoModal();
                this.loadIngresos(); // Recargar lista
            } else {
                throw new Error(result.message || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error guardando ingreso:', error);
            this.notyf.error(`Error guardando ingreso: ${error.message}`);
        } finally {
            this.hideLoader();
        }
    }

    editIngreso(id) {
        const ingreso = this.ingresos.find(i => i.id === id);
        if (ingreso) {
            this.openIngresoModal(ingreso);
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
            confirmBtn.onclick = () => this.deleteIngreso(id);
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.classList.add('hidden');
        this.currentDeleteId = null;
    }

    async deleteIngreso(id) {
        try {
            this.showLoader();
            
            const response = await fetch(`${API_BASE_URL}/ingresos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.notyf.success('Ingreso eliminado exitosamente');
                this.closeDeleteModal();
                this.loadIngresos(); // Recargar lista
            } else {
                throw new Error(result.message || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error eliminando ingreso:', error);
            this.notyf.error(`Error eliminando ingreso: ${error.message}`);
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
            salario: '💼',
            freelance: '💻',
            negocio: '🏢',
            inversiones: '📈',
            otros: '📝'
        };
        return icons[categoria] || '📝';
    }

    getCategoriaLabel(categoria) {
        const labels = {
            salario: 'Salario',
            freelance: 'Freelance',
            negocio: 'Negocio',
            inversiones: 'Inversiones',
            otros: 'Otros'
        };
        return labels[categoria] || 'Otros';
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
function openIngresoModal() {
    if (window.ingresosHandler) {
        window.ingresosHandler.openIngresoModal();
    }
}

function closeIngresoModal() {
    if (window.ingresosHandler) {
        window.ingresosHandler.closeIngresoModal();
    }
}

function closeDeleteModal() {
    if (window.ingresosHandler) {
        window.ingresosHandler.closeDeleteModal();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando IngresosHandler...');
    window.ingresosHandler = new IngresosHandler();
});
