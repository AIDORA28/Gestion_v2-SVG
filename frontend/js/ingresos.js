/* 
💰 MÓDULO DE INGRESOS - PLANIFICAPRO
Gestión completa de ingresos financieros
*/

class IngresosManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        this.filters = {
            search: '',
            categoria: '',
            fechaDesde: '',
            fechaHasta: ''
        };
        this.editingId = null;
        
        // Configuración
        this.config = {
            apiUrl: 'http://localhost:5000',
            dateFormat: 'es-CO'
        };
        
        this.init();
    }

    // ================================
    // 🚀 INICIALIZACIÓN
    // ================================
    
    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.loadIngresos();
        console.log('✅ Módulo de Ingresos inicializado');
    }

    setupEventListeners() {
        // Formulario de ingreso
        const form = document.getElementById('ingreso-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Checkbox de recurrente
        const recurrenteCheck = document.getElementById('ingreso-recurrente');
        if (recurrenteCheck) {
            recurrenteCheck.addEventListener('change', (e) => {
                const frecuenciaContainer = document.getElementById('frecuencia-container');
                if (frecuenciaContainer) {
                    frecuenciaContainer.classList.toggle('hidden', !e.target.checked);
                }
            });
        }

        // Filtros
        const searchInput = document.getElementById('search-ingresos');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.loadIngresos();
                }, 500);
            });
        }

        // Botón de eliminar en modal de confirmación
        const confirmDeleteBtn = document.getElementById('confirm-delete-ingreso');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }
    }

    setDefaultDate() {
        const fechaInput = document.getElementById('ingreso-fecha');
        if (fechaInput) {
            const today = new Date();
            fechaInput.value = today.toISOString().split('T')[0];
        }
    }

    // ================================
    // 📊 CARGA DE DATOS
    // ================================
    
    async loadIngresos() {
        try {
            this.showLoading(true);
            
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Construir parámetros de consulta
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.itemsPerPage,
                ...this.filters
            });

            const response = await fetch(`${this.config.apiUrl}/api/ingresos?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            
            this.updateUI(data);
            this.updateSummary(data.summary);
            this.updatePagination(data.pagination);
            
        } catch (error) {
            console.error('Error cargando ingresos:', error);
            this.showNotification('Error al cargar los ingresos', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadSummary() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.config.apiUrl}/api/ingresos/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const summary = await response.json();
                this.updateSummary(summary);
            }
        } catch (error) {
            console.error('Error cargando resumen:', error);
        }
    }

    // ================================
    // 💾 OPERACIONES CRUD
    // ================================
    
    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const ingresoData = {
                descripcion: formData.get('descripcion'),
                monto: parseFloat(formData.get('monto')),
                categoria: formData.get('categoria') || null,
                fecha: formData.get('fecha') || null,
                es_recurrente: formData.get('es_recurrente') === 'on',
                frecuencia_dias: formData.get('frecuencia_dias') ? parseInt(formData.get('frecuencia_dias')) : null,
                notas: formData.get('notas') || null
            };

            // Validaciones
            if (!ingresoData.descripcion || !ingresoData.monto) {
                this.showNotification('Descripción y monto son obligatorios', 'error');
                return;
            }

            if (ingresoData.monto <= 0) {
                this.showNotification('El monto debe ser mayor a 0', 'error');
                return;
            }

            const token = localStorage.getItem('auth_token');
            const url = this.editingId 
                ? `${this.config.apiUrl}/api/ingresos/${this.editingId}`
                : `${this.config.apiUrl}/api/ingresos`;
            
            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ingresoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar');
            }

            const result = await response.json();
            
            this.showNotification(
                this.editingId ? 'Ingreso actualizado correctamente' : 'Ingreso creado correctamente',
                'success'
            );
            
            this.closeIngresoModal();
            this.loadIngresos();
            
            // Actualizar estadísticas del dashboard si está disponible
            if (window.dashboard) {
                window.dashboard.loadDashboardData();
            }
            
        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            this.showNotification(error.message || 'Error al guardar el ingreso', 'error');
        }
    }

    async deleteIngreso(id) {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.config.apiUrl}/api/ingresos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar');
            }

            this.showNotification('Ingreso eliminado correctamente', 'success');
            this.loadIngresos();
            
            // Actualizar estadísticas del dashboard
            if (window.dashboard) {
                window.dashboard.loadDashboardData();
            }
            
        } catch (error) {
            console.error('Error al eliminar ingreso:', error);
            this.showNotification(error.message || 'Error al eliminar el ingreso', 'error');
        }
    }

    // ================================
    // 🎨 ACTUALIZACIÓN DE INTERFAZ
    // ================================
    
    updateUI(data) {
        this.updateTable(data.ingresos || []);
        this.updateCards(data.ingresos || []);
    }

    updateTable(ingresos) {
        const tableBody = document.getElementById('ingresos-table-body');
        if (!tableBody) return;

        if (ingresos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <i data-lucide="inbox" class="h-8 w-8 mx-auto mb-2"></i>
                        <p>No hay ingresos registrados</p>
                        <button onclick="openAddIngresoModal()" class="mt-2 text-blue-600 hover:text-blue-800">
                            Agregar tu primer ingreso
                        </button>
                    </td>
                </tr>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        tableBody.innerHTML = ingresos.map(ingreso => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDate(ingreso.fecha)}
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="font-medium text-gray-900">${ingreso.descripcion}</span>
                        ${ingreso.notas ? `<span class="text-sm text-gray-500">${ingreso.notas}</span>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${ingreso.categoria ? `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${this.getCategoryIcon(ingreso.categoria)} ${this.formatCategory(ingreso.categoria)}
                        </span>
                    ` : '<span class="text-gray-400">Sin categoría</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-lg font-semibold text-green-600">
                        ${this.formatCurrency(ingreso.monto)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${ingreso.es_recurrente ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            <i data-lucide="repeat" class="w-3 h-3 mr-1"></i>
                            Cada ${ingreso.frecuencia_dias} días
                        </span>
                    ` : '<span class="text-gray-400">No</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="editIngreso('${ingreso.id}')" 
                                class="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="showDeleteIngresoModal('${ingreso.id}')" 
                                class="text-red-600 hover:text-red-900 transition-colors"
                                title="Eliminar">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Re-inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateCards(ingresos) {
        const cardsContainer = document.getElementById('ingresos-cards');
        if (!cardsContainer) return;

        if (ingresos.length === 0) {
            cardsContainer.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="inbox" class="h-12 w-12 mx-auto mb-4 text-gray-400"></i>
                    <p class="text-gray-500 mb-4">No hay ingresos registrados</p>
                    <button onclick="openAddIngresoModal()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Agregar Ingreso
                    </button>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        cardsContainer.innerHTML = ingresos.map(ingreso => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900">${ingreso.descripcion}</h3>
                        <p class="text-sm text-gray-500">${this.formatDate(ingreso.fecha)}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editIngreso('${ingreso.id}')" class="text-blue-600">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="showDeleteIngresoModal('${ingreso.id}')" class="text-red-600">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-between items-center mb-2">
                    <span class="text-lg font-semibold text-green-600">${this.formatCurrency(ingreso.monto)}</span>
                    ${ingreso.categoria ? `
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            ${this.getCategoryIcon(ingreso.categoria)} ${this.formatCategory(ingreso.categoria)}
                        </span>
                    ` : ''}
                </div>
                
                ${ingreso.es_recurrente ? `
                    <div class="flex items-center text-xs text-purple-600">
                        <i data-lucide="repeat" class="w-3 h-3 mr-1"></i>
                        Recurrente cada ${ingreso.frecuencia_dias} días
                    </div>
                ` : ''}
                
                ${ingreso.notas ? `
                    <p class="text-sm text-gray-600 mt-2">${ingreso.notas}</p>
                ` : ''}
            </div>
        `).join('');

        // Re-inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateSummary(summary) {
        if (!summary) return;

        // Actualizar resumen en el módulo de ingresos
        const elementos = {
            'ingresos-mes-total': summary.ingresosMes || 0,
            'ingresos-total': summary.ingresosTotal || 0,
            'ingresos-cantidad': summary.cantidadRegistros || 0
        };

        Object.entries(elementos).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'ingresos-cantidad') {
                    element.textContent = value;
                } else {
                    element.textContent = this.formatCurrency(value);
                }
            }
        });
    }

    updatePagination(pagination) {
        if (!pagination) return;

        this.totalItems = pagination.total;
        this.currentPage = pagination.page;

        // Actualizar información de paginación
        document.getElementById('pagination-start').textContent = pagination.from;
        document.getElementById('pagination-end').textContent = pagination.to;
        document.getElementById('pagination-total').textContent = pagination.total;

        // Botones de paginación
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.disabled = pagination.page <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = pagination.page >= pagination.totalPages;
        }
    }

    // ================================
    // 🎯 MODALES Y FORMULARIOS
    // ================================
    
    openAddIngresoModal() {
        this.editingId = null;
        document.getElementById('ingreso-modal-title').textContent = 'Agregar Nuevo Ingreso';
        document.getElementById('ingreso-submit-text').textContent = 'Guardar Ingreso';
        
        // Limpiar formulario
        document.getElementById('ingreso-form').reset();
        this.setDefaultDate();
        
        // Ocultar frecuencia
        document.getElementById('frecuencia-container').classList.add('hidden');
        
        // Mostrar modal
        document.getElementById('ingreso-modal').classList.remove('hidden');
        document.getElementById('ingreso-modal').classList.add('flex');
        
        // Enfocar primer campo
        setTimeout(() => {
            document.getElementById('ingreso-descripcion').focus();
        }, 100);
    }

    async editIngreso(id) {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.config.apiUrl}/api/ingresos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el ingreso');
            }

            const ingreso = await response.json();
            
            this.editingId = id;
            document.getElementById('ingreso-modal-title').textContent = 'Editar Ingreso';
            document.getElementById('ingreso-submit-text').textContent = 'Actualizar Ingreso';
            
            // Llenar formulario
            document.getElementById('ingreso-descripcion').value = ingreso.descripcion;
            document.getElementById('ingreso-monto').value = ingreso.monto;
            document.getElementById('ingreso-categoria').value = ingreso.categoria || '';
            document.getElementById('ingreso-fecha').value = ingreso.fecha;
            document.getElementById('ingreso-recurrente').checked = ingreso.es_recurrente;
            document.getElementById('ingreso-frecuencia').value = ingreso.frecuencia_dias || '';
            document.getElementById('ingreso-notas').value = ingreso.notas || '';
            
            // Mostrar/ocultar frecuencia
            const frecuenciaContainer = document.getElementById('frecuencia-container');
            frecuenciaContainer.classList.toggle('hidden', !ingreso.es_recurrente);
            
            // Mostrar modal
            document.getElementById('ingreso-modal').classList.remove('hidden');
            document.getElementById('ingreso-modal').classList.add('flex');
            
        } catch (error) {
            console.error('Error cargando ingreso:', error);
            this.showNotification('Error al cargar el ingreso', 'error');
        }
    }

    closeIngresoModal() {
        document.getElementById('ingreso-modal').classList.add('hidden');
        document.getElementById('ingreso-modal').classList.remove('flex');
        this.editingId = null;
    }

    showDeleteIngresoModal(id) {
        this.deleteId = id;
        document.getElementById('delete-ingreso-modal').classList.remove('hidden');
        document.getElementById('delete-ingreso-modal').classList.add('flex');
    }

    closeDeleteIngresoModal() {
        document.getElementById('delete-ingreso-modal').classList.add('hidden');
        document.getElementById('delete-ingreso-modal').classList.remove('flex');
        this.deleteId = null;
    }

    confirmDelete() {
        if (this.deleteId) {
            this.deleteIngreso(this.deleteId);
            this.closeDeleteIngresoModal();
        }
    }

    // ================================
    // 🔍 FILTROS Y PAGINACIÓN
    // ================================
    
    applyFilters() {
        this.filters = {
            search: document.getElementById('search-ingresos').value,
            categoria: document.getElementById('filter-categoria').value,
            fechaDesde: document.getElementById('filter-fecha-desde').value,
            fechaHasta: document.getElementById('filter-fecha-hasta').value
        };
        this.currentPage = 1;
        this.loadIngresos();
    }

    clearFilters() {
        // Limpiar inputs
        document.getElementById('search-ingresos').value = '';
        document.getElementById('filter-categoria').value = '';
        document.getElementById('filter-fecha-desde').value = '';
        document.getElementById('filter-fecha-hasta').value = '';
        
        // Resetear filtros
        this.filters = {
            search: '',
            categoria: '',
            fechaDesde: '',
            fechaHasta: ''
        };
        this.currentPage = 1;
        this.loadIngresos();
    }

    changePage(direction) {
        if (direction === 'next' && this.currentPage * this.itemsPerPage < this.totalItems) {
            this.currentPage++;
        } else if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        }
        this.loadIngresos();
    }

    // ================================
    // 📤 EXPORTACIÓN
    // ================================
    
    async exportIngresos() {
        try {
            const token = localStorage.getItem('auth_token');
            const params = new URLSearchParams({
                export: 'csv',
                ...this.filters
            });

            const response = await fetch(`${this.config.apiUrl}/api/ingresos/export?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al exportar');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ingresos_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.showNotification('Ingresos exportados correctamente', 'success');

        } catch (error) {
            console.error('Error exportando:', error);
            this.showNotification('Error al exportar los ingresos', 'error');
        }
    }

    // ================================
    // 🛠️ UTILIDADES
    // ================================
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(this.config.dateFormat, {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatCategory(category) {
        const categories = {
            'salario': 'Salario',
            'freelance': 'Freelance',
            'negocio': 'Negocio',
            'inversiones': 'Inversiones',
            'bonos': 'Bonos',
            'comisiones': 'Comisiones',
            'ventas': 'Ventas',
            'otros': 'Otros'
        };
        return categories[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'salario': '💼',
            'freelance': '💻',
            'negocio': '🏢',
            'inversiones': '📈',
            'bonos': '🎁',
            'comisiones': '💰',
            'ventas': '🛒',
            'otros': '📝'
        };
        return icons[category] || '📝';
    }

    showLoading(show) {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }

    showNotification(message, type = 'info') {
        if (window.notyf) {
            if (type === 'success') {
                window.notyf.success(message);
            } else if (type === 'error') {
                window.notyf.error(message);
            } else {
                window.notyf.open({ type: 'info', message });
            }
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// ================================
// 🌐 FUNCIONES GLOBALES
// ================================

let ingresosManager;

// Funciones globales para compatibilidad con el HTML
window.openAddIngresoModal = function() {
    if (ingresosManager) {
        ingresosManager.openAddIngresoModal();
    }
};

window.closeIngresoModal = function() {
    if (ingresosManager) {
        ingresosManager.closeIngresoModal();
    }
};

window.editIngreso = function(id) {
    if (ingresosManager) {
        ingresosManager.editIngreso(id);
    }
};

window.showDeleteIngresoModal = function(id) {
    if (ingresosManager) {
        ingresosManager.showDeleteIngresoModal(id);
    }
};

window.closeDeleteIngresoModal = function() {
    if (ingresosManager) {
        ingresosManager.closeDeleteIngresoModal();
    }
};

window.applyFilters = function() {
    if (ingresosManager) {
        ingresosManager.applyFilters();
    }
};

window.clearFilters = function() {
    if (ingresosManager) {
        ingresosManager.clearFilters();
    }
};

window.changePage = function(direction) {
    if (ingresosManager) {
        ingresosManager.changePage(direction);
    }
};

window.exportIngresos = function() {
    if (ingresosManager) {
        ingresosManager.exportIngresos();
    }
};

// Inicializar cuando se muestre la sección de ingresos
document.addEventListener('DOMContentLoaded', () => {
    // Observar cambios en la sección de ingresos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.id === 'section-ingresos' && !target.classList.contains('hidden')) {
                    if (!ingresosManager) {
                        ingresosManager = new IngresosManager();
                    }
                }
            }
        });
    });

    const ingresosSection = document.getElementById('section-ingresos');
    if (ingresosSection) {
        observer.observe(ingresosSection, { attributes: true });
        
        // Si la sección ya está visible, inicializar inmediatamente
        if (!ingresosSection.classList.contains('hidden')) {
            ingresosManager = new IngresosManager();
        }
    }
});
