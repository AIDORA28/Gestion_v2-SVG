/* 
💼 DASHBOARD HANDLER - GESTIÓN FINANCIERA PROFESIONAL
Funcionalidad completa para el dashboard de PLANIFICAPRO
*/

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.charts = {};
        this.isLoading = false;
        this.sidebarOpen = false;
        
        // Configuración de la aplicación
        this.config = {
            apiUrl: 'http://localhost:5000',
            refreshInterval: 30000, // 30 segundos
            chartColors: {
                primary: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
                purple: '#8b5cf6'
            }
        };
        
        this.init();
    }

    // ================================
    // 🚀 INICIALIZACIÓN
    // ================================
    
    async init() {
        try {
            // Verificar autenticación
            await this.checkAuth();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar datos iniciales
            await this.loadDashboardData();
            
            // Configurar actualización automática
            this.setupAutoRefresh();
            
            console.log('✅ Dashboard inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar dashboard:', error);
            this.handleError('Error al cargar el dashboard');
        }
    }

    // ================================
    // 🔐 AUTENTICACIÓN
    // ================================
    
    async checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('❌ No token found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        try {
            console.log('🔍 Verificando token:', token.substring(0, 10) + '...');
            
            const response = await fetch(`${this.config.apiUrl}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Respuesta de verificación:', response.status);

            if (!response.ok) {
                throw new Error(`Token inválido: ${response.status}`);
            }

            this.currentUser = await response.json();
            console.log('✅ Usuario autenticado:', this.currentUser.nombre);
            this.updateUserInfo();
            
        } catch (error) {
            console.error('❌ Error de autenticación:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('currentUser');
            
            // Pequeño delay antes de redirigir para evitar loops
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            const userNameElement = document.getElementById('user-name');
            const userEmailElement = document.getElementById('user-email');
            
            if (userNameElement) {
                userNameElement.textContent = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
            }
            
            if (userEmailElement) {
                userEmailElement.textContent = this.currentUser.email;
            }
        }
    }

    // ================================
    // 🎯 EVENT LISTENERS
    // ================================
    
    setupEventListeners() {
        // Botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Toggle sidebar en móvil
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }

        // Cerrar sidebar con overlay
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Navegación del sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Obtener el onclick attribute para la sección
                const onclickAttr = item.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes('showSection')) {
                    const match = onclickAttr.match(/showSection\('([^']+)'\)/);
                    if (match) {
                        this.navigateToSection(match[1]);
                    }
                }
            });
        });

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeSidebar();
            }
        });

        // Event listener para cerrar modal haciendo clic en el overlay
        const quickAddModal = document.getElementById('quick-add-modal');
        if (quickAddModal) {
            quickAddModal.addEventListener('click', (e) => {
                // Si se hace clic en el overlay (no en el contenido del modal)
                if (e.target === quickAddModal) {
                    this.closeAllModals();
                }
            });
        }
    }

    // ================================
    // 📊 CARGA DE DATOS
    // ================================
    
    async loadDashboardData() {
        this.showLoading(true);
        
        try {
            // Cargar datos en paralelo
            const [stats, transactions, chartData] = await Promise.all([
                this.loadFinancialStats(),
                this.loadRecentTransactions(),
                this.loadChartData()
            ]);

            // Actualizar interfaz
            this.updateStatsCards(stats);
            this.updateTransactionTable(transactions);
            this.updateCharts(chartData);
            
            console.log('📊 Datos del dashboard cargados');
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.handleError('Error al cargar los datos financieros');
        } finally {
            this.showLoading(false);
        }
    }

    async loadFinancialStats() {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${this.config.apiUrl}/api/financial/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }

        return await response.json();
    }

    async loadRecentTransactions() {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${this.config.apiUrl}/api/transactions/recent?limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar transacciones');
        }

        return await response.json();
    }

    async loadChartData() {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${this.config.apiUrl}/api/analytics/charts`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos de gráficos');
        }

        return await response.json();
    }

    // ================================
    // 🎨 ACTUALIZACIÓN DE INTERFAZ
    // ================================
    
    updateStatsCards(stats) {
        // Balance Total
        const balanceElement = document.getElementById('balance-total');
        if (balanceElement && stats.balance !== undefined) {
            balanceElement.textContent = this.formatCurrency(stats.balance);
            balanceElement.className = stats.balance >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
        }

        // Ingresos del mes
        const incomeElement = document.getElementById('ingresos-mes');
        if (incomeElement && stats.income !== undefined) {
            incomeElement.textContent = this.formatCurrency(stats.income);
        }

        // Gastos del mes
        const expenseElement = document.getElementById('gastos-mes');
        if (expenseElement && stats.expenses !== undefined) {
            expenseElement.textContent = this.formatCurrency(stats.expenses);
        }

        // Ahorro del mes
        const savingsElement = document.getElementById('ahorro-proyectado');
        if (savingsElement && stats.savings !== undefined) {
            savingsElement.textContent = this.formatCurrency(stats.savings);
        }
    }

    updateTransactionTable(transactions) {
        const tableBody = document.getElementById('recent-transactions');
        if (!tableBody) return;

        if (!transactions || transactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                        <i data-lucide="inbox" class="h-8 w-8 mx-auto mb-2"></i>
                        <p>No hay transacciones recientes</p>
                    </td>
                </tr>
            `;
            // Re-inicializar iconos
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }

        tableBody.innerHTML = transactions.map(transaction => `
            <tr class="transaction-row">
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${this.formatDate(transaction.fecha)}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <i data-lucide="${this.getTransactionIcon(transaction.tipo)}" class="w-5 h-5 mr-3 text-gray-500"></i>
                        <span class="font-medium">${transaction.descripcion}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${transaction.categoria}
                </td>
                <td class="px-6 py-4">
                    <span class="${transaction.tipo === 'ingreso' ? 'amount-positive' : 'amount-negative'}">
                        ${transaction.tipo === 'ingreso' ? '+' : '-'}${this.formatCurrency(Math.abs(transaction.monto))}
                    </span>
                </td>
            </tr>
        `).join('');
        
        // Re-inicializar iconos después de actualizar el contenido
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // ================================
    // 📈 GRÁFICOS CON CHART.JS
    // ================================
    
    updateCharts(chartData) {
        // Gráfico de Ingresos vs Gastos
        this.createIncomeExpenseChart(chartData.monthlyFlow);
        
        // Gráfico de Categorías
        this.createCategoryChart(chartData.categoryBreakdown);
        
        // Gráfico de Tendencia
        this.createTrendChart(chartData.yearlyTrend);
    }

    createIncomeExpenseChart(data) {
        const ctx = document.getElementById('incomeExpensesChart');
        if (!ctx) return;

        // Destruir gráfico existente
        if (this.charts.incomeExpense) {
            this.charts.incomeExpense.destroy();
        }

        this.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: data.income || [5000, 6000, 5500, 7000, 6500, 8000],
                        backgroundColor: this.config.chartColors.success,
                        borderColor: this.config.chartColors.success,
                        borderWidth: 1
                    },
                    {
                        label: 'Gastos',
                        data: data.expenses || [3000, 3500, 4000, 3800, 4200, 4500],
                        backgroundColor: this.config.chartColors.danger,
                        borderColor: this.config.chartColors.danger,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    createCategoryChart(data) {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || ['Alimentación', 'Transporte', 'Entretenimiento', 'Servicios', 'Otros'],
                datasets: [{
                    data: data.amounts || [1200, 800, 400, 600, 300],
                    backgroundColor: [
                        this.config.chartColors.primary,
                        this.config.chartColors.success,
                        this.config.chartColors.warning,
                        this.config.chartColors.danger,
                        this.config.chartColors.purple
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    createTrendChart(data) {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Balance',
                    data: data.balance || [2000, 2500, 1500, 3200, 2300, 3500],
                    borderColor: this.config.chartColors.primary,
                    backgroundColor: this.config.chartColors.primary + '20',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    // ================================
    // 🎯 NAVEGACIÓN Y MODALES
    // ================================
    
    toggleSidebar() {
        console.log('🔄 Toggle sidebar llamado');
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        console.log('📱 Sidebar element:', sidebar);
        console.log('🌫️ Overlay element:', overlay);
        console.log('🔄 Sidebar open:', this.sidebarOpen);
        
        if (sidebar && overlay) {
            if (this.sidebarOpen) {
                console.log('✅ Mostrando sidebar');
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                // Añadir clase de body para prevenir scroll
                document.body.classList.add('overflow-hidden');
            } else {
                console.log('❌ Ocultando sidebar');
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        } else {
            console.error('❌ No se encontraron elementos sidebar o overlay');
        }
    }

    closeSidebar() {
        console.log('❌ Cerrando sidebar');
        this.sidebarOpen = false;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }

    navigateToSection(section) {
        console.log(`🧭 Navegando a sección: ${section}`);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.section-content').forEach(sectionElement => {
            sectionElement.classList.add('hidden');
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log(`✅ Sección ${section} mostrada`);
        } else {
            console.error(`❌ Sección ${section} no encontrada`);
        }
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Buscar y marcar como activo el enlace correspondiente
        const activeNavItem = document.querySelector(`[onclick*="showSection('${section}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
            console.log(`✅ Navegación actualizada para ${section}`);
        }
        
        // Cerrar sidebar en móvil
        if (window.innerWidth < 1024) {
            this.closeSidebar();
        }
        
        // Cargar módulos dinámicamente
        this.loadModule(section);
        
        console.log(`📍 Navegación completada: ${section}`);
    }

    async loadModule(moduleName) {
        try {
            const targetSection = document.getElementById(`section-${moduleName}`);
            if (!targetSection) return;

            // Solo cargar si es un módulo que debe ser cargado dinámicamente
            const dynamicModules = ['ingresos', 'gastos', 'creditos', 'reportes'];
            
            if (dynamicModules.includes(moduleName)) {
                // Verificar si ya está cargado
                if (targetSection.getAttribute('data-loaded') === 'true') {
                    console.log(`� Módulo ${moduleName} ya está cargado`);
                    // Inicializar el módulo si es necesario
                    this.initializeModule(moduleName);
                    return;
                }

                console.log(`🔄 Cargando módulo: ${moduleName}`);
                
                try {
                    const response = await fetch(`modules/${moduleName}-module.html`);
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                    
                    const moduleHtml = await response.text();
                    targetSection.innerHTML = moduleHtml;
                    targetSection.setAttribute('data-loaded', 'true');
                    
                    console.log(`✅ Módulo ${moduleName} cargado exitosamente`);
                    
                    // Re-inicializar iconos de Lucide
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                    
                    // Inicializar el módulo específico
                    this.initializeModule(moduleName);
                    
                } catch (error) {
                    console.error(`❌ Error cargando módulo ${moduleName}:`, error);
                    targetSection.innerHTML = `
                        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div class="bg-white rounded-lg shadow-lg border border-red-200 p-8 text-center">
                                <div class="text-red-500 mb-4">
                                    <i data-lucide="alert-circle" class="h-12 w-12 mx-auto"></i>
                                </div>
                                <h2 class="text-xl font-bold text-gray-900 mb-2">Error al cargar el módulo</h2>
                                <p class="text-gray-600 mb-4">No se pudo cargar el módulo de ${moduleName}</p>
                                <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    Recargar página
                                </button>
                            </div>
                        </div>
                    `;
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            } else {
                // Para módulos estáticos (como dashboard), solo inicializar
                this.initializeModule(moduleName);
            }
            
        } catch (error) {
            console.error(`❌ Error general en loadModule:`, error);
        }
    }

    initializeModule(moduleName) {
        try {
            switch (moduleName) {
                case 'ingresos':
                    if (!window.ingresosManager) {
                        console.log('� Inicializando IngresosManager...');
                        // El script ya está cargado, solo crear la instancia
                        setTimeout(() => {
                            if (typeof IngresosManager !== 'undefined') {
                                window.ingresosManager = new IngresosManager();
                            } else {
                                console.error('❌ IngresosManager no está disponible');
                            }
                        }, 100);
                    } else {
                        console.log('✅ IngresosManager ya está inicializado');
                        // Recargar datos
                        window.ingresosManager.loadIngresos();
                    }
                    break;
                    
                case 'dashboard':
                    // El dashboard ya está inicializado en el constructor
                    break;
                    
                default:
                    console.log(`📝 Módulo ${moduleName} sin inicialización específica`);
            }
        } catch (error) {
            console.error(`❌ Error inicializando módulo ${moduleName}:`, error);
        }
    }

    openQuickAddModal() {
        const modal = document.getElementById('quick-add-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Enfocar el primer campo
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    closeAllModals() {
        // Cerrar modal de Quick Add
        const quickAddModal = document.getElementById('quick-add-modal');
        if (quickAddModal) {
            quickAddModal.classList.add('hidden');
            quickAddModal.classList.remove('flex');
        }
        
        // Cerrar cualquier otro modal que pueda existir
        document.querySelectorAll('[id$="-modal"]').forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    }

    // ================================
    // 🔄 UTILIDADES Y HELPERS
    // ================================
    
    async refreshDashboard() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('animate-spin');
        }
        
        try {
            await this.loadDashboardData();
            this.showNotification('Dashboard actualizado', 'success');
        } catch (error) {
            this.handleError('Error al actualizar');
        } finally {
            if (refreshBtn) {
                refreshBtn.classList.remove('animate-spin');
            }
        }
    }

    setupAutoRefresh() {
        setInterval(() => {
            if (!this.isLoading) {
                this.loadDashboardData();
            }
        }, this.config.refreshInterval);
    }

    showLoading(show) {
        this.isLoading = show;
        const loader = document.getElementById('dashboard-loader');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short'
        });
    }

    getTransactionIcon(type) {
        const icons = {
            'ingreso': 'trending-up',
            'gasto': 'trending-down',
            'transferencia': 'shuffle'
        };
        return icons[type] || 'circle';
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

    handleError(message) {
        console.error(message);
        this.showNotification(message, 'error');
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// ================================
// 🚀 INICIALIZACIÓN GLOBAL
// ================================

// Instancia global del dashboard
let dashboard;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardManager();
    // Exportar para uso global después de la inicialización
    window.dashboard = dashboard;
});

// Función global de logout para compatibilidad
window.logout = function() {
    if (window.dashboard) {
        window.dashboard.logout();
    } else {
        // Fallback si el dashboard no está inicializado
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
};

// Funciones globales para navegación
window.showSection = function(section) {
    if (window.dashboard) {
        window.dashboard.navigateToSection(section);
    }
};

window.showQuickAddModal = function() {
    if (window.dashboard) {
        window.dashboard.openQuickAddModal();
    }
};

window.closeQuickAddModal = function() {
    if (window.dashboard) {
        window.dashboard.closeAllModals();
    }
};

window.showUserSettings = function() {
    if (window.dashboard) {
        console.log('Configuración de usuario - Funcionalidad pendiente');
        window.dashboard.showNotification('Configuración próximamente', 'info');
    }
};

// Función de debugging para el menú móvil
window.toggleMobileMenu = function() {
    console.log('🔄 toggleMobileMenu llamado');
    if (window.dashboard) {
        window.dashboard.toggleSidebar();
    } else {
        console.log('⚠️ Dashboard no disponible, usando fallback');
        // Fallback manual
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        console.log('📱 Fallback - Sidebar:', sidebar);
        console.log('🌫️ Fallback - Overlay:', overlay);
        
        if (sidebar && overlay) {
            const isHidden = sidebar.classList.contains('-translate-x-full');
            console.log('🔍 Sidebar hidden:', isHidden);
            
            if (isHidden) {
                console.log('✅ Fallback - Mostrando sidebar');
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
            } else {
                console.log('❌ Fallback - Ocultando sidebar');
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        } else {
            console.error('❌ Fallback - No se encontraron elementos');
        }
    }
};
