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
    // 🔐 AUTENTICACIÓN - DASHBOARD GUARD
    // ================================
    
    async checkAuth() {
        console.log('🔒 Dashboard Guard: Verificando sesión...');
        
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('currentUser');
        const expiresAt = localStorage.getItem('token_expires_at');
        
        // Verificación 1: Datos básicos de sesión
        if (!token || !userStr) {
            console.log('❌ Dashboard Guard: No hay token o usuario');
            this.redirectToLogin('No hay sesión activa');
            return;
        }

        // Verificación 2: Validez del token por tiempo
        if (expiresAt) {
            const timeLeft = parseInt(expiresAt) - Date.now();
            if (timeLeft <= 0) {
                console.log('⏰ Dashboard Guard: Token expirado');
                this.clearSessionAndRedirect('Tu sesión ha expirado');
                return;
            }
        }

        try {
            // Verificación 3: Integridad de datos de usuario
            const userData = JSON.parse(userStr);
            
            if (!userData.nombre || !userData.email || !userData.id) {
                console.log('❌ Dashboard Guard: Datos de usuario inválidos');
                this.clearSessionAndRedirect('Datos de sesión inválidos');
                return;
            }
            
            // ✅ Sesión válida
            this.currentUser = userData;
            console.log('✅ Dashboard Guard: Sesión válida para', this.currentUser.nombre);
            this.updateUserInfo();
            
            // Iniciar monitoreo continuo de sesión
            this.startSessionMonitoring();
            
        } catch (error) {
            console.error('❌ Dashboard Guard: Error procesando datos de usuario:', error);
            this.clearSessionAndRedirect('Error en datos de sesión');
        }
    }
    
    // Función mejorada para limpiar sesión y redirigir
    clearSessionAndRedirect(reason) {
        console.log('🧹 Dashboard Guard: Limpiando sesión -', reason);
        
        // Limpiar todos los datos de sesión
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser'); 
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('token_expires_at');
        
        // Mostrar mensaje si es posible
        if (window.notyf) {
            window.notyf.warning(reason);
        }
        
        // Redirigir después de un momento
        setTimeout(() => {
            window.location.replace('login.html'); // replace para evitar history
        }, 1000);
    }
    
    // Función simple para redirección
    redirectToLogin(reason) {
        console.log('🔄 Dashboard Guard: Redirigiendo -', reason);
        
        if (window.notyf) {
            window.notyf.info(reason);
        }
        
        setTimeout(() => {
            window.location.replace('login.html');
        }, 500);
    }
    
    // Monitoreo continuo de sesión
    startSessionMonitoring() {
        // Verificar sesión cada 2 minutos
        setInterval(() => {
            const expiresAt = localStorage.getItem('token_expires_at');
            if (expiresAt) {
                const timeLeft = parseInt(expiresAt) - Date.now();
                if (timeLeft <= 0) {
                    this.clearSessionAndRedirect('Sesión expirada automáticamente');
                }
            }
        }, 2 * 60 * 1000); // 2 minutos
        
        console.log('👁️ Dashboard Guard: Monitoreo de sesión iniciado');
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
        // 🔒 DASHBOARD GUARD: Verificar sesión cuando la página se enfoca
        window.addEventListener('focus', () => {
            console.log('👁️ Dashboard Guard: Página enfocada, verificando sesión...');
            this.checkAuth();
        });
        
        // 🔒 DASHBOARD GUARD: Verificar sesión en eventos de navegación
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                console.log('🔄 Dashboard Guard: Página restaurada desde cache, verificando sesión...');
                this.checkAuth();
            }
        });
        
        // 🔒 DASHBOARD GUARD: Verificar sesión en visibilitychange
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👀 Dashboard Guard: Página visible, verificando sesión...');
                this.checkAuth();
            }
        });

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
            console.log('📊 Cargando datos reales del dashboard desde Supabase...');
            
            // Verificar que el API Service esté disponible
            if (!window.getAPIService) {
                throw new Error('API Service no disponible');
            }
            
            const apiService = window.getAPIService();
            
            // Cargar datos reales en paralelo
            const [ingresos, gastos, creditos] = await Promise.all([
                apiService.getIngresos(),
                apiService.getGastos(), 
                apiService.getCreditos()
            ]);

            // Calcular estadísticas reales
            const stats = this.calculateRealStats(ingresos, gastos, creditos);
            
            // Obtener transacciones recientes (combinadas)
            const recentTransactions = this.getRecentTransactions(ingresos, gastos);
            
            // Preparar datos para gráficos
            const chartData = this.prepareChartData(ingresos, gastos);

            // Actualizar interfaz con datos reales
            this.updateStatsCards(stats);
            this.updateTransactionTable(recentTransactions);
            this.updateCharts(chartData);
            
            console.log('✅ Datos reales del dashboard cargados exitosamente');
            console.log('📈 Ingresos:', ingresos.length, 'registros');
            console.log('📉 Gastos:', gastos.length, 'registros');
            console.log('💳 Créditos:', creditos.length, 'registros');
            
        } catch (error) {
            console.error('❌ Error cargando datos reales:', error);
            this.handleError('Error al cargar los datos financieros reales');
        } finally {
            this.showLoading(false);
        }
    }

    // ================================
    // 📊 PROCESAMIENTO DE DATOS REALES
    // ================================
    
    calculateRealStats(ingresos, gastos, creditos) {
        console.log('📊 Calculando estadísticas reales...');
        
        // Calcular totales
        const totalIngresos = ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.monto || 0), 0);
        const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);
        const totalCreditos = creditos.reduce((sum, credito) => sum + parseFloat(credito.monto || 0), 0);
        
        // Calcular balance
        const balance = totalIngresos - totalGastos;
        
        console.log('💰 Total Ingresos:', totalIngresos);
        console.log('💸 Total Gastos:', totalGastos);
        console.log('💳 Total Créditos:', totalCreditos);
        console.log('⚖️ Balance:', balance);
        
        return {
            totalIngresos: totalIngresos.toFixed(2),
            totalGastos: totalGastos.toFixed(2),
            totalCreditos: totalCreditos.toFixed(2),
            balance: balance.toFixed(2),
            // Métricas adicionales
            countIngresos: ingresos.length,
            countGastos: gastos.length,
            countCreditos: creditos.length,
            // Variaciones (mock por ahora, después se puede calcular vs mes anterior)
            variacionIngresos: '+12.5%',
            variacionGastos: '-8.3%',
            variacionBalance: balance >= 0 ? '+15.2%' : '-15.2%'
        };
    }
    
    getRecentTransactions(ingresos, gastos) {
        console.log('📋 Obteniendo transacciones recientes...');
        
        // Combinar ingresos y gastos con tipo
        const allTransactions = [
            ...ingresos.map(ingreso => ({
                ...ingreso,
                tipo: 'ingreso',
                icono: 'trending-up',
                color: 'text-green-600'
            })),
            ...gastos.map(gasto => ({
                ...gasto,
                tipo: 'gasto',
                icono: 'trending-down', 
                color: 'text-red-600'
            }))
        ];
        
        // Ordenar por fecha (más recientes primero)
        allTransactions.sort((a, b) => {
            const dateA = new Date(a.fecha_transaccion || a.fecha || a.created_at);
            const dateB = new Date(b.fecha_transaccion || b.fecha || b.created_at);
            return dateB - dateA;
        });
        
        // Tomar solo las 10 más recientes
        const recent = allTransactions.slice(0, 10);
        
        console.log('📋 Transacciones recientes:', recent.length);
        return recent;
    }
    
    prepareChartData(ingresos, gastos) {
        console.log('📈 Preparando datos para gráficos...');
        
        // Datos para gráfico de ingresos vs gastos por mes
        const monthlyData = this.aggregateByMonth(ingresos, gastos);
        
        // Datos para gráfico de categorías de gastos
        const categoryData = this.aggregateGastosByCategory(gastos);
        
        return {
            monthly: monthlyData,
            categories: categoryData
        };
    }
    
    aggregateByMonth(ingresos, gastos) {
        const months = {};
        
        // Procesar ingresos
        ingresos.forEach(ingreso => {
            const date = new Date(ingreso.fecha_transaccion || ingreso.fecha || ingreso.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = { ingresos: 0, gastos: 0 };
            }
            months[monthKey].ingresos += parseFloat(ingreso.monto || 0);
        });
        
        // Procesar gastos
        gastos.forEach(gasto => {
            const date = new Date(gasto.fecha_transaccion || gasto.fecha || gasto.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = { ingresos: 0, gastos: 0 };
            }
            months[monthKey].gastos += parseFloat(gasto.monto || 0);
        });
        
        // Convertir a arrays para gráficos
        const sortedMonths = Object.keys(months).sort();
        return {
            labels: sortedMonths.map(month => {
                const [year, monthNum] = month.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
            }),
            ingresos: sortedMonths.map(month => months[month].ingresos),
            gastos: sortedMonths.map(month => months[month].gastos)
        };
    }
    
    aggregateGastosByCategory(gastos) {
        const categories = {};
        
        gastos.forEach(gasto => {
            const categoria = gasto.categoria || 'Sin categoría';
            if (!categories[categoria]) {
                categories[categoria] = 0;
            }
            categories[categoria] += parseFloat(gasto.monto || 0);
        });
        
        return {
            labels: Object.keys(categories),
            data: Object.values(categories)
        };
    }

    // ================================
    // 🎨 ACTUALIZACIÓN DE INTERFAZ
    // ================================
    
    updateStatsCards(stats) {
        console.log('💳 Actualizando tarjetas con datos reales:', stats);
        
        // Balance Total
        const balanceElement = document.getElementById('balance-total');
        if (balanceElement && stats.balance !== undefined) {
            balanceElement.textContent = this.formatCurrency(stats.balance);
            balanceElement.className = parseFloat(stats.balance) >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
        }

        // Ingresos del mes  
        const incomeElement = document.getElementById('ingresos-mes');
        if (incomeElement && stats.totalIngresos !== undefined) {
            incomeElement.textContent = this.formatCurrency(stats.totalIngresos);
        }

        // Gastos del mes
        const expenseElement = document.getElementById('gastos-mes');
        if (expenseElement && stats.totalGastos !== undefined) {
            expenseElement.textContent = this.formatCurrency(stats.totalGastos);
        }

        // Créditos/Préstamos
        const creditsElement = document.getElementById('total-creditos') || document.getElementById('ahorro-proyectado');
        if (creditsElement && stats.totalCreditos !== undefined) {
            creditsElement.textContent = this.formatCurrency(stats.totalCreditos);
        }
        
        // Actualizar contadores si existen
        const countIngresosElement = document.getElementById('count-ingresos');
        if (countIngresosElement && stats.countIngresos !== undefined) {
            countIngresosElement.textContent = stats.countIngresos;
        }
        
        const countGastosElement = document.getElementById('count-gastos');
        if (countGastosElement && stats.countGastos !== undefined) {
            countGastosElement.textContent = stats.countGastos;
        }
        
        const countCreditosElement = document.getElementById('count-creditos');
        if (countCreditosElement && stats.countCreditos !== undefined) {
            countCreditosElement.textContent = stats.countCreditos;
        }
        
        console.log('✅ Tarjetas actualizadas con datos reales');
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

        console.log('📋 Actualizando tabla con transacciones reales:', transactions.length);
        
        tableBody.innerHTML = transactions.map(transaction => `
            <tr class="transaction-row hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${this.formatDate(transaction.fecha_transaccion || transaction.fecha || transaction.created_at)}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <i data-lucide="${transaction.icono || this.getTransactionIcon(transaction.tipo)}" class="w-5 h-5 mr-3 ${transaction.color || 'text-gray-500'}"></i>
                        <div>
                            <span class="font-medium">${transaction.descripcion || transaction.concepto || 'Sin descripción'}</span>
                            ${transaction.categoria ? `<br><span class="text-xs text-gray-400">${transaction.categoria}</span>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${transaction.categoria || 'Sin categoría'}
                </td>
                <td class="px-6 py-4">
                    <span class="${transaction.tipo === 'ingreso' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}">
                        ${transaction.tipo === 'ingreso' ? '+' : '-'}${this.formatCurrency(Math.abs(parseFloat(transaction.monto || 0)))}
                    </span>
                </td>
            </tr>
        `).join('');
        
        // Re-inicializar iconos después de actualizar el contenido
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('✅ Tabla de transacciones actualizada con datos reales');
    }

    // ================================
    // 📈 GRÁFICOS CON CHART.JS
    // ================================
    
    updateCharts(chartData) {
        console.log('📈 Actualizando gráficos con datos reales:', chartData);
        
        // Gráfico de Ingresos vs Gastos mensuales
        if (chartData.monthly) {
            this.createIncomeExpenseChart(chartData.monthly);
        }
        
        // Gráfico de Categorías de gastos
        if (chartData.categories) {
            this.createCategoryChart(chartData.categories);
        }
        
        console.log('✅ Gráficos actualizados con datos reales');
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
                labels: data.labels || ['Sin datos'],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: data.ingresos || [0],
                        backgroundColor: this.config.chartColors.success,
                        borderColor: this.config.chartColors.success,
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Gastos',
                        data: data.gastos || [0],
                        backgroundColor: this.config.chartColors.danger,
                        borderColor: this.config.chartColors.danger,
                        borderWidth: 1,
                        borderRadius: 4
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
                labels: data.labels && data.labels.length > 0 ? data.labels : ['Sin datos'],
                datasets: [{
                    data: data.data && data.data.length > 0 ? data.data : [1],
                    backgroundColor: [
                        this.config.chartColors.primary,
                        this.config.chartColors.success,
                        this.config.chartColors.warning,
                        this.config.chartColors.danger,
                        this.config.chartColors.purple,
                        '#6366f1', // indigo
                        '#f59e0b', // amber
                        '#84cc16', // lime
                        '#06b6d4', // cyan
                        '#a855f7'  // violet
                    ].slice(0, data.labels?.length || 1),
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
            const dynamicModules = ['ingresos', 'gastos', 'creditos', 'reportes', 'sugerencias'];
            
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
                    
                case 'sugerencias':
                    if (!window.sugerenciasModuleHandler) {
                        console.log('🧠 Inicializando SugerenciasModuleHandler...');
                        // El script ya está cargado, solo crear la instancia
                        setTimeout(() => {
                            if (typeof SugerenciasModuleHandler !== 'undefined') {
                                window.sugerenciasModuleHandler = new SugerenciasModuleHandler();
                                window.sugerenciasModuleHandler.init().catch(error => {
                                    console.error('❌ Error inicializando sugerencias:', error);
                                });
                            } else {
                                console.error('❌ SugerenciasModuleHandler no está disponible');
                            }
                        }, 500); // Tiempo suficiente para que el template se cargue
                    } else {
                        console.log('✅ SugerenciasModuleHandler ya está inicializado');
                        // Ejecutar análisis si es necesario
                        if (typeof window.sugerenciasModuleHandler.onTemplateLoaded === 'function') {
                            window.sugerenciasModuleHandler.onTemplateLoaded();
                        }
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
        // 🚨 DESHABILITADO - Causaba redirección cada 30 segundos
        // Joe Guillermo reportó que el dashboard se cierra cada 2-5 segundos
        // Causa: loadDashboardData() ejecuta verificaciones que pueden redirigir
        
        console.log('⚠️  Auto-refresh deshabilitado para evitar redirecciones');
        console.log('💡 Los datos se actualizarán manualmente o al navegar entre secciones');
        
        // OPCIONAL: Solo verificación de token muy ocasional (15 minutos)
        // setInterval(() => {
        //     console.log('🔍 Verificación de sesión opcional...');
        //     const token = localStorage.getItem('auth_token');
        //     if (!token) {
        //         console.log('⚠️  No hay token, pero no redirigiendo automáticamente');
        //     }
        // }, 15 * 60 * 1000); // 15 minutos
    }

    showLoading(show) {
        this.isLoading = show;
        const loader = document.getElementById('dashboard-loader');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
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
        console.log('🚪 Dashboard Guard: Ejecutando logout completo...');
        
        // Limpiar TODOS los datos de sesión
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('token_expires_at');
        
        // Limpiar cualquier otro dato relacionado con la sesión
        localStorage.removeItem('lastActivity');
        
        // Mostrar mensaje de confirmación
        if (window.notyf) {
            window.notyf.success('Sesión cerrada correctamente');
        }
        
        // Usar replace en lugar de href para evitar history
        setTimeout(() => {
            window.location.replace('login.html');
        }, 500);
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
        console.log('🚪 Logout fallback: Limpiando sesión...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('supabase_access_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('lastActivity');
        
        setTimeout(() => {
            window.location.replace('login.html');
        }, 300);
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
