/**
 * 🎨 ComponentManager V2 - Sistema de Componentes y Templates
 * Equivalente a: React Components + JSX + Template Engine
 * 
 * Características principales:
 * ✅ Sistema de templates con variables
 * ✅ Renderizado dinámico y reactivo  
 * ✅ Event handling automático
 * ✅ Loading states y error handling
 * ✅ Notificaciones integradas
 * ✅ Validación de formularios
 * ✅ Componentes reutilizables
 */

class ComponentManagerV2 {
    constructor(appState) {
        console.log('🎨 Inicializando ComponentManager V2...');
        
        this.appState = appState;
        this.templates = new Map();
        this.renderedComponents = new Map();
        this.eventListeners = new Map();
        
        this.init();
    }
    
    async init() {
        try {
            // Registrar templates
            this.registerTemplates();
            
            // Configurar auto-render en cambios de estado
            this.setupReactivity();
            
            console.log('✅ ComponentManager V2 inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando ComponentManager:', error);
        }
    }
    
    /**
     * Registrar todos los templates
     */
    registerTemplates() {
        // Login Template
        this.templates.set('login', {
            html: `
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h1>🔐 Iniciar Sesión</h1>
                            <h2>Sistema de Gestión</h2>
                            <p>Ingresa tus credenciales para continuar</p>
                        </div>
                        
                        <form id="loginForm" class="auth-form">
                            <div class="form-group">
                                <label for="email">📧 Correo electrónico</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email"
                                    class="form-input" 
                                    placeholder="tu@email.com"
                                    required
                                    autocomplete="email"
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="password">🔒 Contraseña</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password"
                                    class="form-input" 
                                    placeholder="Tu contraseña"
                                    required
                                    autocomplete="current-password"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                class="btn btn-primary btn-full"
                                data-loading-text="Iniciando sesión..."
                            >
                                <span class="btn-text">🚀 Iniciar Sesión</span>
                            </button>
                        </form>
                        
                        <div id="authStatus" class="status-container"></div>
                        
                        <div class="auth-footer">
                            <p>¿No tienes cuenta? 
                                <a href="#" class="auth-link" data-action="showRegister">
                                    Regístrate aquí
                                </a>
                            </p>
                            <p>
                                <a href="#" class="auth-link" data-action="showDemo">
                                    🎯 Ver Demo
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'submit #loginForm': 'handleLogin',
                'click [data-action="showRegister"]': 'showRegister',
                'click [data-action="showDemo"]': 'showDemo'
            }
        });
        
        // Register Template
        this.templates.set('register', {
            html: `
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h1>📝 Crear Cuenta</h1>
                            <h2>Sistema de Gestión</h2>
                            <p>Completa tus datos para comenzar</p>
                        </div>
                        
                        <form id="registerForm" class="auth-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nombre">👤 Nombre</label>
                                    <input 
                                        type="text" 
                                        id="nombre" 
                                        name="nombre"
                                        class="form-input" 
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="apellido">👥 Apellido</label>
                                    <input 
                                        type="text" 
                                        id="apellido" 
                                        name="apellido"
                                        class="form-input" 
                                        placeholder="Tu apellido"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">📧 Correo electrónico</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email"
                                    class="form-input" 
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="password">🔒 Contraseña</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password"
                                    class="form-input" 
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minlength="6"
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="confirmPassword">🔐 Confirmar Contraseña</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword"
                                    class="form-input" 
                                    placeholder="Repite tu contraseña"
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                class="btn btn-primary btn-full"
                                data-loading-text="Creando cuenta..."
                            >
                                <span class="btn-text">✨ Crear Cuenta</span>
                            </button>
                        </form>
                        
                        <div id="authStatus" class="status-container"></div>
                        
                        <div class="auth-footer">
                            <p>¿Ya tienes cuenta? 
                                <a href="#" class="auth-link" data-action="showLogin">
                                    Inicia sesión
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'submit #registerForm': 'handleRegister',
                'click [data-action="showLogin"]': 'showLogin'
            }
        });
        
        // Dashboard Template
        this.templates.set('dashboard', {
            html: `
                <div class="dashboard">
                    <!-- Header -->
                    <div class="dashboard-header">
                        <div class="container">
                            <div class="header-content">
                                <div class="header-left">
                                    <h1>💼 Panel de Control</h1>
                                    <p>Bienvenido, <strong>{{user.nombre}}</strong></p>
                                </div>
                                <div class="header-right">
                                    <div class="balance-quick {{balanceClass}}">
                                        <span class="balance-label">Balance Actual</span>
                                        <span class="balance-amount">{{balance}}</span>
                                    </div>
                                    <button class="btn btn-secondary" data-action="logout">
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tabs -->
                    <div class="dashboard-tabs">
                        <div class="container">
                            <div class="tabs-wrapper">
                                <button class="tab {{activeClass.resumen}}" data-tab="resumen">
                                    📊 Resumen
                                    <span class="tab-count">{{counts.resumen}}</span>
                                </button>
                                <button class="tab {{activeClass.ingresos}}" data-tab="ingresos">
                                    💰 Ingresos
                                    <span class="tab-count">{{counts.ingresos}}</span>
                                </button>
                                <button class="tab {{activeClass.gastos}}" data-tab="gastos">
                                    💸 Gastos
                                    <span class="tab-count">{{counts.gastos}}</span>
                                </button>
                                <button class="tab {{activeClass.categorias}}" data-tab="categorias">
                                    🏷️ Categorías
                                    <span class="tab-count">{{counts.categorias}}</span>
                                </button>
                                <button class="tab {{activeClass.reportes}}" data-tab="reportes">
                                    📈 Reportes
                                    <span class="tab-count">{{counts.reportes}}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <div class="container">
                            <div id="tabContent" class="tab-content">
                                {{tabContent}}
                            </div>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'click [data-action="logout"]': 'handleLogout',
                'click [data-tab]': 'handleTabChange'
            }
        });
        
        // Tab Content Templates
        this.templates.set('tab-loading', {
            html: `
                <div class="tab-loading">
                    <div class="spinner-large"></div>
                    <h3>Cargando {{tabName}}...</h3>
                    <p>Por favor espera un momento</p>
                </div>
            `
        });
        
        this.templates.set('tab-resumen', {
            html: `
                <div class="resumen-content">
                    <div class="resumen-header">
                        <h2>📊 Resumen General</h2>
                        <button class="btn btn-secondary" data-action="refreshResumen">
                            🔄 Actualizar
                        </button>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <h3>Total Ingresos</h3>
                                <p class="stat-value positive">{{stats.totalIngresos}}</p>
                                <span class="stat-count">{{stats.ingresosCount}} transacciones</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💸</div>
                            <div class="stat-info">
                                <h3>Total Gastos</h3>
                                <p class="stat-value negative">{{stats.totalGastos}}</p>
                                <span class="stat-count">{{stats.gastosCount}} transacciones</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💯</div>
                            <div class="stat-info">
                                <h3>Balance Actual</h3>
                                <p class="stat-value {{balanceClass}}">{{stats.balance}}</p>
                                <span class="stat-trend {{trendClass}}">{{trendText}}</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-info">
                                <h3>Transacciones</h3>
                                <p class="stat-value">{{stats.transaccionesCount}}</p>
                                <span class="stat-count">Este mes</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="resumen-sections">
                        <div class="recent-transactions">
                            <h3>📋 Transacciones Recientes</h3>
                            <div class="transactions-list">
                                {{recentTransactions}}
                            </div>
                        </div>
                        
                        <div class="categories-overview">
                            <h3>🏷️ Gastos por Categoría</h3>
                            <div class="categories-chart">
                                {{categoriesChart}}
                            </div>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'click [data-action="refreshResumen"]': 'refreshResumen'
            }
        });
        
        // Tab Ingresos Template
        this.templates.set('tab-ingresos', {
            html: `
                <div class="ingresos-content">
                    <div class="section-header">
                        <h2>💰 Gestión de Ingresos</h2>
                        <button class="btn btn-primary" data-action="showAddIngresoForm">
                            ➕ Agregar Ingreso
                        </button>
                    </div>
                    
                    <!-- Formulario Agregar/Editar -->
                    <div id="ingresoFormContainer" class="form-container hidden">
                        <div class="card">
                            <div class="card-header">
                                <h3 id="ingresoFormTitle">➕ Nuevo Ingreso</h3>
                                <button class="btn btn-secondary" data-action="cancelIngresoForm">
                                    ✖️ Cancelar
                                </button>
                            </div>
                            <form id="ingresoForm" class="form-grid">
                                <div class="form-group">
                                    <label for="ingreso-descripcion">📝 Descripción</label>
                                    <input 
                                        type="text" 
                                        id="ingreso-descripcion" 
                                        name="descripcion"
                                        class="form-input" 
                                        placeholder="Ej: Salario enero, Freelance proyecto X"
                                        required
                                        maxlength="100"
                                    />
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="ingreso-monto">💰 Monto</label>
                                        <input 
                                            type="number" 
                                            id="ingreso-monto" 
                                            name="monto"
                                            class="form-input" 
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0.01"
                                            max="1000000"
                                            required
                                        />
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="ingreso-fecha">📅 Fecha</label>
                                        <input 
                                            type="date" 
                                            id="ingreso-fecha" 
                                            name="fecha"
                                            class="form-input" 
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="ingreso-categoria">🏷️ Categoría</label>
                                    <select id="ingreso-categoria" name="categoria" class="form-input" required>
                                        <option value="">Seleccionar categoría...</option>
                                        {{ingresoCategorias}}
                                    </select>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <span class="btn-text">💾 Guardar Ingreso</span>
                                    </button>
                                    <button type="button" class="btn btn-secondary" data-action="cancelIngresoForm">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Lista de Ingresos -->
                    <div class="ingresos-list">
                        <div class="list-header">
                            <h3>📋 Mis Ingresos</h3>
                            <div class="list-actions">
                                <input type="text" id="ingresosSearch" class="form-input" placeholder="🔍 Buscar ingresos..." />
                                <select id="ingresosFilter" class="form-input">
                                    <option value="">Todas las categorías</option>
                                    {{ingresoCategorias}}
                                </select>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>📝 Descripción</th>
                                        <th>💰 Monto</th>
                                        <th>📅 Fecha</th>
                                        <th>🏷️ Categoría</th>
                                        <th>⚙️ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="ingresosTableBody">
                                    {{ingresosRows}}
                                </tbody>
                            </table>
                        </div>
                        
                        <div id="ingresosEmpty" class="empty-state hidden">
                            <div class="empty-icon">💰</div>
                            <h3>No hay ingresos registrados</h3>
                            <p>Comienza agregando tu primer ingreso</p>
                            <button class="btn btn-primary" data-action="showAddIngresoForm">
                                ➕ Agregar Primer Ingreso
                            </button>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'click [data-action="showAddIngresoForm"]': 'showAddIngresoForm',
                'click [data-action="cancelIngresoForm"]': 'cancelIngresoForm',
                'submit #ingresoForm': 'handleIngresoForm',
                'click [data-action="editIngreso"]': 'editIngreso',
                'click [data-action="deleteIngreso"]': 'deleteIngreso',
                'input #ingresosSearch': 'filterIngresos',
                'change #ingresosFilter': 'filterIngresos'
            }
        });
        
        // Tab Gastos Template
        this.templates.set('tab-gastos', {
            html: `
                <div class="gastos-content">
                    <div class="section-header">
                        <h2>💸 Gestión de Gastos</h2>
                        <button class="btn btn-primary" data-action="showAddGastoForm">
                            ➕ Agregar Gasto
                        </button>
                    </div>
                    
                    <!-- Formulario Agregar/Editar -->
                    <div id="gastoFormContainer" class="form-container hidden">
                        <div class="card">
                            <div class="card-header">
                                <h3 id="gastoFormTitle">➕ Nuevo Gasto</h3>
                                <button class="btn btn-secondary" data-action="cancelGastoForm">
                                    ✖️ Cancelar
                                </button>
                            </div>
                            <form id="gastoForm" class="form-grid">
                                <div class="form-group">
                                    <label for="gasto-descripcion">📝 Descripción</label>
                                    <input 
                                        type="text" 
                                        id="gasto-descripcion" 
                                        name="descripcion"
                                        class="form-input" 
                                        placeholder="Ej: Supermercado, Gasolina, Restaurante"
                                        required
                                        maxlength="100"
                                    />
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="gasto-monto">💰 Monto</label>
                                        <input 
                                            type="number" 
                                            id="gasto-monto" 
                                            name="monto"
                                            class="form-input" 
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0.01"
                                            max="1000000"
                                            required
                                        />
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="gasto-fecha">📅 Fecha</label>
                                        <input 
                                            type="date" 
                                            id="gasto-fecha" 
                                            name="fecha"
                                            class="form-input" 
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="gasto-categoria">🏷️ Categoría</label>
                                    <select id="gasto-categoria" name="categoria" class="form-input" required>
                                        <option value="">Seleccionar categoría...</option>
                                        {{gastoCategorias}}
                                    </select>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <span class="btn-text">💾 Guardar Gasto</span>
                                    </button>
                                    <button type="button" class="btn btn-secondary" data-action="cancelGastoForm">
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Lista de Gastos -->
                    <div class="gastos-list">
                        <div class="list-header">
                            <h3>📋 Mis Gastos</h3>
                            <div class="list-actions">
                                <input type="text" id="gastosSearch" class="form-input" placeholder="🔍 Buscar gastos..." />
                                <select id="gastosFilter" class="form-input">
                                    <option value="">Todas las categorías</option>
                                    {{gastoCategorias}}
                                </select>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>📝 Descripción</th>
                                        <th>💰 Monto</th>
                                        <th>📅 Fecha</th>
                                        <th>🏷️ Categoría</th>
                                        <th>⚙️ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="gastosTableBody">
                                    {{gastosRows}}
                                </tbody>
                            </table>
                        </div>
                        
                        <div id="gastosEmpty" class="empty-state hidden">
                            <div class="empty-icon">💸</div>
                            <h3>No hay gastos registrados</h3>
                            <p>Comienza agregando tu primer gasto</p>
                            <button class="btn btn-primary" data-action="showAddGastoForm">
                                ➕ Agregar Primer Gasto
                            </button>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'click [data-action="showAddGastoForm"]': 'showAddGastoForm',
                'click [data-action="cancelGastoForm"]': 'cancelGastoForm',
                'submit #gastoForm': 'handleGastoForm',
                'click [data-action="editGasto"]': 'editGasto',
                'click [data-action="deleteGasto"]': 'deleteGasto',
                'input #gastosSearch': 'filterGastos',
                'change #gastosFilter': 'filterGastos'
            }
        });
        
        // Tab Categorías Template
        this.templates.set('tab-categorias', {
            html: `
                <div class="categorias-content">
                    <div class="section-header">
                        <h2>🏷️ Gestión de Categorías</h2>
                    </div>
                    
                    <div class="categorias-sections">
                        <div class="card">
                            <h3>💰 Categorías de Ingresos</h3>
                            <div class="categories-list">
                                {{ingresoCategoriasList}}
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3>💸 Categorías de Gastos</h3>
                            <div class="categories-list">
                                {{gastoCategoriasList}}
                            </div>
                        </div>
                    </div>
                    
                    <div class="categorias-stats">
                        <h3>📊 Estadísticas por Categoría</h3>
                        <div class="stats-tables">
                            <div class="card">
                                <h4>💰 Ingresos por Categoría</h4>
                                <div class="category-stats">
                                    {{ingresosStats}}
                                </div>
                            </div>
                            
                            <div class="card">
                                <h4>💸 Gastos por Categoría</h4>
                                <div class="category-stats">
                                    {{gastosStats}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
        
        // Tab Reportes Template
        this.templates.set('tab-reportes', {
            html: `
                <div class="reportes-content">
                    <div class="section-header">
                        <h2>📈 Reportes y Análisis</h2>
                        <div class="report-actions">
                            <button class="btn btn-secondary" data-action="exportData">
                                📊 Exportar Datos
                            </button>
                            <button class="btn btn-primary" data-action="generateReport">
                                📈 Generar Reporte
                            </button>
                        </div>
                    </div>
                    
                    <div class="reportes-grid">
                        <div class="card">
                            <h3>📊 Balance Mensual</h3>
                            <div class="balance-chart">
                                <div class="balance-display {{balanceClass}}">
                                    <span class="balance-amount">{{balance}}</span>
                                    <span class="balance-trend {{trendClass}}">{{trendText}}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3>💡 Recomendaciones</h3>
                            <div class="recommendations">
                                {{recommendations}}
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3>📈 Tendencias</h3>
                            <div class="trends">
                                <div class="trend-item">
                                    <span class="trend-label">Ahorro promedio:</span>
                                    <span class="trend-value">{{averageSavings}}</span>
                                </div>
                                <div class="trend-item">
                                    <span class="trend-label">Gasto promedio:</span>
                                    <span class="trend-value">{{averageExpense}}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3>🎯 Objetivos</h3>
                            <div class="goals">
                                <p>🚧 Funcionalidad en desarrollo...</p>
                                <p>Próximamente podrás establecer metas de ahorro</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            events: {
                'click [data-action="exportData"]': 'exportData',
                'click [data-action="generateReport"]': 'generateReport'
            }
        });
        
        // Notification Template
        this.templates.set('notification', {
            html: `
                <div class="notification notification-{{type}}" data-id="{{id}}">
                    <div class="notification-content">
                        <div class="notification-message">{{message}}</div>
                        <div class="notification-time">{{time}}</div>
                    </div>
                    <button class="notification-close" data-action="closeNotification" data-id="{{id}}">
                        ✕
                    </button>
                </div>
            `,
            events: {
                'click [data-action="closeNotification"]': 'closeNotification'
            }
        });
        
        console.log(`📚 ${this.templates.size} templates registrados`);
    }
    
    /**
     * Configurar reactividad automática
     */
    setupReactivity() {
        // Escuchar cambios en currentView
        this.appState.subscribe('ui.currentView', (view) => {
            this.renderView(view);
        });
        
        // Escuchar cambios en activeTab
        this.appState.subscribe('dashboard.activeTab', (tab) => {
            this.renderDashboardTab(tab);
        });
        
        // Escuchar cambios en notificaciones
        this.appState.subscribe('ui.notifications', (notifications) => {
            this.renderNotifications(notifications);
        });
        
        // Escuchar cambios en auth
        this.appState.subscribe('auth', (authState) => {
            if (authState.isAuthenticated) {
                this.appState.setState('ui.currentView', 'dashboard');
            } else if (authState.user === null && !authState.loading) {
                this.appState.setState('ui.currentView', 'login');
            }
        });
    }
    
    /**
     * Renderizar vista principal
     */
    async renderView(view) {
        try {
            const container = document.getElementById('app');
            if (!container) {
                console.error('❌ Contenedor #app no encontrado');
                return;
            }
            
            console.log(`🎨 Renderizando vista: ${view}`);
            
            const template = this.templates.get(view);
            if (!template) {
                console.error(`❌ Template '${view}' no encontrado`);
                return;
            }
            
            // Preparar variables para el template
            const variables = this.prepareTemplateVariables(view);
            
            // Procesar template
            const html = this.processTemplate(template.html, variables);
            
            // Limpiar listeners anteriores
            this.clearEventListeners();
            
            // Render
            container.innerHTML = html;
            
            // Configurar eventos
            this.setupEvents(template.events || {});
            
            // Post-render hooks
            await this.onPostRender(view);
            
        } catch (error) {
            console.error('❌ Error renderizando vista:', error);
            this.renderError(error);
        }
    }
    
    /**
     * Preparar variables para templates
     */
    prepareTemplateVariables(view) {
        const state = this.appState.getState();
        
        const baseVars = {
            user: state.auth.profile || state.auth.user || {},
            loading: state.system.loading,
            error: state.system.error
        };
        
        switch (view) {
            case 'dashboard':
                const resumen = state.dashboard.data.resumen || {};
                const balance = resumen.balance || 0;
                
                return {
                    ...baseVars,
                    balance: this.formatCurrency(balance),
                    balanceClass: balance >= 0 ? 'positive' : 'negative',
                    activeClass: this.getDashboardActiveClasses(),
                    counts: {
                        resumen: resumen.transaccionesCount || '0',
                        ingresos: resumen.ingresosCount || '0',
                        gastos: resumen.gastosCount || '0',
                        categorias: '2',
                        reportes: '1'
                    },
                    tabContent: this.getDashboardTabContent()
                };
                
            default:
                return baseVars;
        }
    }
    
    /**
     * Preparar variables específicas para cada tab
     */
    prepareTabVariables(tab) {
        const state = this.appState.getState();
        const resumen = state.dashboard.data.resumen || {};
        const ingresos = state.dashboard.data.ingresos || [];
        const gastos = state.dashboard.data.gastos || [];
        
        // Get categories
        const categorias = window.dataManager ? window.dataManager.getCategorias() : {
            ingresos: ['Salario', 'Freelance', 'Otros'],
            gastos: ['Alimentación', 'Transporte', 'Otros']
        };
        
        switch (tab) {
            case 'resumen':
                return {
                    stats: {
                        totalIngresos: this.formatCurrency(resumen.totalIngresos || 0),
                        totalGastos: this.formatCurrency(resumen.totalGastos || 0),
                        balance: this.formatCurrency(resumen.balance || 0),
                        transaccionesCount: resumen.transaccionesCount || 0,
                        ingresosCount: resumen.ingresosCount || 0,
                        gastosCount: resumen.gastosCount || 0
                    },
                    balanceClass: (resumen.balance || 0) >= 0 ? 'positive' : 'negative',
                    trendClass: (resumen.balance || 0) >= 0 ? 'positive' : 'negative',
                    trendText: (resumen.balance || 0) >= 0 ? '📈 Positivo' : '📉 Negativo',
                    recentTransactions: this.renderRecentTransactions(resumen.transaccionesRecientes || []),
                    categoriesChart: this.renderCategoriesChart(resumen.gastosPorCategoria || {})
                };
                
            case 'ingresos':
                return {
                    ingresoCategorias: this.renderCategoriesOptions(categorias.ingresos),
                    ingresosRows: this.renderIngresosRows(ingresos)
                };
                
            case 'gastos':
                return {
                    gastoCategorias: this.renderCategoriesOptions(categorias.gastos),
                    gastosRows: this.renderGastosRows(gastos)
                };
                
            case 'categorias':
                return {
                    ingresoCategoriasList: this.renderCategoriesList(categorias.ingresos),
                    gastoCategoriasList: this.renderCategoriesList(categorias.gastos),
                    ingresosStats: this.renderCategoryStats(resumen.ingresosPorCategoria || {}),
                    gastosStats: this.renderCategoryStats(resumen.gastosPorCategoria || {})
                };
                
            case 'reportes':
                const reportes = state.dashboard.data.reportes || {};
                return {
                    balance: this.formatCurrency(resumen.balance || 0),
                    balanceClass: (resumen.balance || 0) >= 0 ? 'positive' : 'negative',
                    trendClass: (resumen.balance || 0) >= 0 ? 'positive' : 'negative',
                    trendText: (resumen.balance || 0) >= 0 ? '📈 Tendencia positiva' : '📉 Necesita atención',
                    recommendations: this.renderRecommendations(reportes.recomendaciones || []),
                    averageSavings: this.formatCurrency(resumen.balance || 0),
                    averageExpense: this.formatCurrency(resumen.promedioGastoMensual || 0)
                };
                
            default:
                return {};
        }
    }
    
    /**
     * Render helpers
     */
    renderRecentTransactions(transactions) {
        if (!transactions.length) {
            return '<p class="empty-message">No hay transacciones recientes</p>';
        }
        
        return transactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="transaction-icon">${t.tipo === 'ingreso' ? '💰' : '💸'}</span>
                    <div class="transaction-details">
                        <span class="transaction-desc">${t.descripcion}</span>
                        <span class="transaction-date">${this.formatDate(t.fecha)}</span>
                    </div>
                </div>
                <div class="transaction-amount ${t.tipo === 'ingreso' ? 'positive' : 'negative'}">
                    ${t.tipo === 'ingreso' ? '+' : '-'}${this.formatCurrency(Math.abs(t.monto))}
                </div>
            </div>
        `).join('');
    }
    
    renderCategoriesChart(categories) {
        const entries = Object.entries(categories);
        if (!entries.length) {
            return '<p class="empty-message">No hay datos de categorías</p>';
        }
        
        const total = entries.reduce((sum, [_, amount]) => sum + amount, 0);
        
        return entries.map(([category, amount]) => {
            const percentage = total > 0 ? (amount / total * 100).toFixed(1) : 0;
            return `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-name">${category}</span>
                        <span class="category-amount">${this.formatCurrency(amount)}</span>
                    </div>
                    <div class="category-bar">
                        <div class="category-progress" style="width: ${percentage}%"></div>
                    </div>
                    <span class="category-percentage">${percentage}%</span>
                </div>
            `;
        }).join('');
    }
    
    renderCategoriesOptions(categories) {
        return categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
    
    renderIngresosRows(ingresos) {
        if (!ingresos.length) {
            return '<tr><td colspan="5" class="empty-row">No hay ingresos registrados</td></tr>';
        }
        
        return ingresos.map(ingreso => `
            <tr>
                <td>${ingreso.descripcion}</td>
                <td class="amount positive">${this.formatCurrency(ingreso.monto)}</td>
                <td>${this.formatDate(ingreso.fecha)}</td>
                <td><span class="category-tag">${ingreso.categoria || 'Sin categoría'}</span></td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-action="editIngreso" data-id="${ingreso.id}" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" data-action="deleteIngreso" data-id="${ingreso.id}" title="Eliminar">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderGastosRows(gastos) {
        if (!gastos.length) {
            return '<tr><td colspan="5" class="empty-row">No hay gastos registrados</td></tr>';
        }
        
        return gastos.map(gasto => `
            <tr>
                <td>${gasto.descripcion}</td>
                <td class="amount negative">${this.formatCurrency(gasto.monto)}</td>
                <td>${this.formatDate(gasto.fecha)}</td>
                <td><span class="category-tag">${gasto.categoria || 'Sin categoría'}</span></td>
                <td class="actions">
                    <button class="btn-icon btn-edit" data-action="editGasto" data-id="${gasto.id}" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" data-action="deleteGasto" data-id="${gasto.id}" title="Eliminar">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderCategoriesList(categories) {
        return categories.map(cat => `
            <div class="category-item">
                <span class="category-icon">🏷️</span>
                <span class="category-name">${cat}</span>
            </div>
        `).join('');
    }
    
    renderCategoryStats(stats) {
        const entries = Object.entries(stats);
        if (!entries.length) {
            return '<p class="empty-message">No hay datos disponibles</p>';
        }
        
        return entries.map(([category, amount]) => `
            <div class="stat-row">
                <span class="stat-label">${category}</span>
                <span class="stat-value">${this.formatCurrency(amount)}</span>
            </div>
        `).join('');
    }
    
    renderRecommendations(recommendations) {
        if (!recommendations.length) {
            return '<p class="empty-message">No hay recomendaciones disponibles</p>';
        }
        
        return recommendations.map(rec => `
            <div class="recommendation ${rec.tipo}">
                <span class="rec-message">${rec.mensaje}</span>
            </div>
        `).join('');
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Procesar template con variables
     */
    processTemplate(html, variables) {
        return html.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
            const keys = path.split('.');
            let value = variables;
            
            for (const key of keys) {
                value = value?.[key];
                if (value === undefined) break;
            }
            
            return value !== undefined ? value : match;
        });
    }
    
    /**
     * Configurar event listeners
     */
    setupEvents(events) {
        for (const [selector, handler] of Object.entries(events)) {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                const eventType = selector.split(' ')[0]; // 'click', 'submit', etc.
                const actualSelector = selector.substring(eventType.length + 1);
                
                const listenerFn = (e) => {
                    if (this[handler]) {
                        this[handler](e);
                    } else {
                        console.warn(`⚠️ Handler '${handler}' no encontrado`);
                    }
                };
                
                element.addEventListener(eventType, listenerFn);
                
                // Guardar para cleanup
                const key = `${element.id || actualSelector}_${eventType}`;
                this.eventListeners.set(key, { element, event: eventType, listener: listenerFn });
            });
        }
    }
    
    /**
     * Limpiar event listeners
     */
    clearEventListeners() {
        for (const [key, { element, event, listener }] of this.eventListeners.entries()) {
            if (element && listener) {
                element.removeEventListener(event, listener);
            }
        }
        this.eventListeners.clear();
    }
    
    /**
     * Event Handlers
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        this.setButtonLoading(e.target.querySelector('button[type="submit"]'), true);
        
        try {
            // Usar AuthManager
            if (window.AuthManagerV2) {
                await window.AuthManagerV2.login(email, password);
            } else {
                throw new Error('AuthManager no disponible');
            }
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showAuthStatus('error', error.message);
        } finally {
            this.setButtonLoading(e.target.querySelector('button[type="submit"]'), false);
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido')
        };
        
        // Validaciones
        if (data.password !== data.confirmPassword) {
            this.showAuthStatus('error', 'Las contraseñas no coinciden');
            return;
        }
        
        this.setButtonLoading(e.target.querySelector('button[type="submit"]'), true);
        
        try {
            if (window.AuthManagerV2) {
                await window.AuthManagerV2.register(data);
            } else {
                throw new Error('AuthManager no disponible');
            }
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showAuthStatus('error', error.message);
        } finally {
            this.setButtonLoading(e.target.querySelector('button[type="submit"]'), false);
        }
    }
    
    showLogin(e) {
        e?.preventDefault();
        this.appState.setState('ui.currentView', 'login');
    }
    
    showRegister(e) {
        e?.preventDefault();
        this.appState.setState('ui.currentView', 'register');
    }
    
    showDemo(e) {
        e?.preventDefault();
        // Simulaar login demo
        this.appState.setAuth(
            { email: 'demo@sistema.com' },
            null,
            { nombre: 'Usuario Demo', apellido: 'Sistema' }
        );
    }
    
    async handleLogout(e) {
        e.preventDefault();
        
        try {
            if (window.AuthManagerV2) {
                await window.AuthManagerV2.logout();
            } else {
                this.appState.clearAuth();
            }
        } catch (error) {
            console.error('❌ Error en logout:', error);
        }
    }
    
    handleTabChange(e) {
        const tab = e.target.dataset.tab;
        if (tab) {
            this.appState.setState('dashboard.activeTab', tab);
        }
    }
    
    closeNotification(e) {
        const id = e.target.dataset.id;
        if (id) {
            this.appState.removeNotification(id);
        }
    }
    
    /**
     * 📊 RESUMEN Handlers
     */
    async refreshResumen(e) {
        e?.preventDefault();
        
        try {
            if (window.dataManager) {
                const user = this.appState.getState('auth.user');
                if (user) {
                    await window.dataManager.getResumen(user.id, true);
                    this.appState.addNotification('success', '🔄 Resumen actualizado');
                }
            }
        } catch (error) {
            console.error('❌ Error refrescando resumen:', error);
        }
    }
    
    /**
     * 💰 INGRESOS Handlers
     */
    showAddIngresoForm(e) {
        e?.preventDefault();
        
        const container = document.getElementById('ingresoFormContainer');
        const title = document.getElementById('ingresoFormTitle');
        const form = document.getElementById('ingresoForm');
        
        if (container && title && form) {
            // Reset form
            form.reset();
            form.removeAttribute('data-editing-id');
            
            // Set today's date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('ingreso-fecha').value = today;
            
            // Update UI
            title.textContent = '➕ Nuevo Ingreso';
            container.classList.remove('hidden');
            
            // Focus first input
            setTimeout(() => {
                document.getElementById('ingreso-descripcion')?.focus();
            }, 100);
        }
    }
    
    cancelIngresoForm(e) {
        e?.preventDefault();
        
        const container = document.getElementById('ingresoFormContainer');
        const form = document.getElementById('ingresoForm');
        
        if (container && form) {
            container.classList.add('hidden');
            form.reset();
            form.removeAttribute('data-editing-id');
        }
    }
    
    async handleIngresoForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const isEditing = form.hasAttribute('data-editing-id');
        const editingId = form.getAttribute('data-editing-id');
        
        const ingresoData = {
            descripcion: formData.get('descripcion'),
            monto: formData.get('monto'),
            fecha: formData.get('fecha'),
            categoria: formData.get('categoria')
        };
        
        this.setButtonLoading(form.querySelector('button[type="submit"]'), true);
        
        try {
            const user = this.appState.getState('auth.user');
            if (!user || !window.dataManager) {
                throw new Error('Usuario no autenticado o DataManager no disponible');
            }
            
            if (isEditing && editingId) {
                await window.dataManager.updateIngreso(user.id, editingId, ingresoData);
            } else {
                await window.dataManager.addIngreso(user.id, ingresoData);
            }
            
            // Hide form and refresh data
            this.cancelIngresoForm();
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('❌ Error guardando ingreso:', error);
            this.appState.addNotification('error', error.message);
        } finally {
            this.setButtonLoading(form.querySelector('button[type="submit"]'), false);
        }
    }
    
    async editIngreso(e) {
        e.preventDefault();
        
        const ingresoId = e.target.dataset.id;
        if (!ingresoId) return;
        
        try {
            const ingresos = this.appState.getDashboardData('ingresos') || [];
            const ingreso = ingresos.find(i => i.id === ingresoId);
            
            if (!ingreso) {
                throw new Error('Ingreso no encontrado');
            }
            
            // Fill form with data
            const form = document.getElementById('ingresoForm');
            const title = document.getElementById('ingresoFormTitle');
            const container = document.getElementById('ingresoFormContainer');
            
            if (form && title && container) {
                document.getElementById('ingreso-descripcion').value = ingreso.descripcion || '';
                document.getElementById('ingreso-monto').value = ingreso.monto || '';
                document.getElementById('ingreso-fecha').value = ingreso.fecha || '';
                document.getElementById('ingreso-categoria').value = ingreso.categoria || '';
                
                form.setAttribute('data-editing-id', ingresoId);
                title.textContent = '✏️ Editar Ingreso';
                container.classList.remove('hidden');
                
                // Focus first input
                setTimeout(() => {
                    document.getElementById('ingreso-descripcion')?.focus();
                }, 100);
            }
            
        } catch (error) {
            console.error('❌ Error editando ingreso:', error);
            this.appState.addNotification('error', error.message);
        }
    }
    
    async deleteIngreso(e) {
        e.preventDefault();
        
        const ingresoId = e.target.dataset.id;
        if (!ingresoId) return;
        
        if (!confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
            return;
        }
        
        try {
            const user = this.appState.getState('auth.user');
            if (!user || !window.dataManager) {
                throw new Error('Usuario no autenticado');
            }
            
            await window.dataManager.deleteIngreso(user.id, ingresoId);
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('❌ Error eliminando ingreso:', error);
            this.appState.addNotification('error', error.message);
        }
    }
    
    filterIngresos(e) {
        const searchTerm = document.getElementById('ingresosSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('ingresosFilter')?.value || '';
        
        const rows = document.querySelectorAll('#ingresosTableBody tr');
        
        rows.forEach(row => {
            const descripcion = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
            const categoria = row.querySelector('td:nth-child(4)')?.textContent || '';
            
            const matchesSearch = descripcion.includes(searchTerm);
            const matchesCategory = !categoryFilter || categoria === categoryFilter;
            
            row.style.display = matchesSearch && matchesCategory ? '' : 'none';
        });
    }
    
    /**
     * 💸 GASTOS Handlers
     */
    showAddGastoForm(e) {
        e?.preventDefault();
        
        const container = document.getElementById('gastoFormContainer');
        const title = document.getElementById('gastoFormTitle');
        const form = document.getElementById('gastoForm');
        
        if (container && title && form) {
            form.reset();
            form.removeAttribute('data-editing-id');
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('gasto-fecha').value = today;
            
            title.textContent = '➕ Nuevo Gasto';
            container.classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('gasto-descripcion')?.focus();
            }, 100);
        }
    }
    
    cancelGastoForm(e) {
        e?.preventDefault();
        
        const container = document.getElementById('gastoFormContainer');
        const form = document.getElementById('gastoForm');
        
        if (container && form) {
            container.classList.add('hidden');
            form.reset();
            form.removeAttribute('data-editing-id');
        }
    }
    
    async handleGastoForm(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const isEditing = form.hasAttribute('data-editing-id');
        const editingId = form.getAttribute('data-editing-id');
        
        const gastoData = {
            descripcion: formData.get('descripcion'),
            monto: formData.get('monto'),
            fecha: formData.get('fecha'),
            categoria: formData.get('categoria')
        };
        
        this.setButtonLoading(form.querySelector('button[type="submit"]'), true);
        
        try {
            const user = this.appState.getState('auth.user');
            if (!user || !window.dataManager) {
                throw new Error('Usuario no autenticado o DataManager no disponible');
            }
            
            if (isEditing && editingId) {
                await window.dataManager.updateGasto(user.id, editingId, gastoData);
            } else {
                await window.dataManager.addGasto(user.id, gastoData);
            }
            
            this.cancelGastoForm();
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('❌ Error guardando gasto:', error);
            this.appState.addNotification('error', error.message);
        } finally {
            this.setButtonLoading(form.querySelector('button[type="submit"]'), false);
        }
    }
    
    async editGasto(e) {
        e.preventDefault();
        
        const gastoId = e.target.dataset.id;
        if (!gastoId) return;
        
        try {
            const gastos = this.appState.getDashboardData('gastos') || [];
            const gasto = gastos.find(g => g.id === gastoId);
            
            if (!gasto) {
                throw new Error('Gasto no encontrado');
            }
            
            const form = document.getElementById('gastoForm');
            const title = document.getElementById('gastoFormTitle');
            const container = document.getElementById('gastoFormContainer');
            
            if (form && title && container) {
                document.getElementById('gasto-descripcion').value = gasto.descripcion || '';
                document.getElementById('gasto-monto').value = gasto.monto || '';
                document.getElementById('gasto-fecha').value = gasto.fecha || '';
                document.getElementById('gasto-categoria').value = gasto.categoria || '';
                
                form.setAttribute('data-editing-id', gastoId);
                title.textContent = '✏️ Editar Gasto';
                container.classList.remove('hidden');
                
                setTimeout(() => {
                    document.getElementById('gasto-descripcion')?.focus();
                }, 100);
            }
            
        } catch (error) {
            console.error('❌ Error editando gasto:', error);
            this.appState.addNotification('error', error.message);
        }
    }
    
    async deleteGasto(e) {
        e.preventDefault();
        
        const gastoId = e.target.dataset.id;
        if (!gastoId) return;
        
        if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            return;
        }
        
        try {
            const user = this.appState.getState('auth.user');
            if (!user || !window.dataManager) {
                throw new Error('Usuario no autenticado');
            }
            
            await window.dataManager.deleteGasto(user.id, gastoId);
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('❌ Error eliminando gasto:', error);
            this.appState.addNotification('error', error.message);
        }
    }
    
    filterGastos(e) {
        const searchTerm = document.getElementById('gastosSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('gastosFilter')?.value || '';
        
        const rows = document.querySelectorAll('#gastosTableBody tr');
        
        rows.forEach(row => {
            const descripcion = row.querySelector('td:first-child')?.textContent.toLowerCase() || '';
            const categoria = row.querySelector('td:nth-child(4)')?.textContent || '';
            
            const matchesSearch = descripcion.includes(searchTerm);
            const matchesCategory = !categoryFilter || categoria === categoryFilter;
            
            row.style.display = matchesSearch && matchesCategory ? '' : 'none';
        });
    }
    
    /**
     * 📊 REPORTES Handlers
     */
    async exportData(e) {
        e?.preventDefault();
        
        try {
            const user = this.appState.getState('auth.user');
            if (!user) return;
            
            const ingresos = this.appState.getDashboardData('ingresos') || [];
            const gastos = this.appState.getDashboardData('gastos') || [];
            
            const data = {
                usuario: user.email,
                fecha_exportacion: new Date().toISOString(),
                ingresos: ingresos,
                gastos: gastos,
                resumen: this.appState.getDashboardData('resumen')
            };
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `gestion-financiera-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.appState.addNotification('success', '📊 Datos exportados correctamente');
            
        } catch (error) {
            console.error('❌ Error exportando datos:', error);
            this.appState.addNotification('error', 'Error exportando datos');
        }
    }
    
    async generateReport(e) {
        e?.preventDefault();
        
        try {
            const user = this.appState.getState('auth.user');
            if (!user || !window.dataManager) return;
            
            const reportes = await window.dataManager.getReportes(user.id);
            console.log('📈 Reporte generado:', reportes);
            
            this.appState.setDashboardData('reportes', reportes);
            this.appState.addNotification('success', '📈 Reporte generado');
            
            // Re-render reportes tab
            const activeTab = this.appState.getState('dashboard.activeTab');
            if (activeTab === 'reportes') {
                this.renderDashboardTab('reportes');
            }
            
        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            this.appState.addNotification('error', 'Error generando reporte');
        }
    }
    
    /**
     * Utilidades UI
     */
    setButtonLoading(button, loading) {
        if (!button) return;
        
        if (loading) {
            const loadingText = button.dataset.loadingText || 'Cargando...';
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<div class="btn-loading"><div class="spinner"></div>${loadingText}</div>`;
            button.disabled = true;
        } else {
            button.innerHTML = button.dataset.originalText || button.innerHTML;
            button.disabled = false;
        }
    }
    
    showAuthStatus(type, message) {
        const container = document.getElementById('authStatus');
        if (!container) return;
        
        const statusClass = type === 'error' ? 'status-error' : 'status-success';
        const icon = type === 'error' ? '❌' : '✅';
        
        container.innerHTML = `
            <div class="status ${statusClass}">
                <span class="status-icon">${icon}</span>
                ${message}
            </div>
        `;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                container.innerHTML = '';
            }, 3000);
        }
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
    
    getDashboardActiveClasses() {
        const activeTab = this.appState.getState('dashboard.activeTab');
        return {
            resumen: activeTab === 'resumen' ? 'active' : '',
            ingresos: activeTab === 'ingresos' ? 'active' : '',
            gastos: activeTab === 'gastos' ? 'active' : '',
            categorias: activeTab === 'categorias' ? 'active' : '',
            reportes: activeTab === 'reportes' ? 'active' : ''
        };
    }
    
    getDashboardTabContent() {
        const activeTab = this.appState.getState('dashboard.activeTab');
        const loading = this.appState.getState(`dashboard.loading.${activeTab}`);
        
        if (loading) {
            return this.processTemplate(
                this.templates.get('tab-loading').html,
                { tabName: activeTab }
            );
        }
        
        // Get template for active tab
        const template = this.templates.get(`tab-${activeTab}`);
        if (template) {
            const variables = this.prepareTabVariables(activeTab);
            return this.processTemplate(template.html, variables);
        }
        
        // Fallback for unknown tabs
        return `<div class="tab-placeholder">
            <h3>🚧 ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <p>Esta sección está en desarrollo...</p>
        </div>`;
    }
    
    async onPostRender(view) {
        // Hook para acciones post-render
        switch (view) {
            case 'login':
                // Focus en primer input
                setTimeout(() => {
                    const emailInput = document.getElementById('email');
                    if (emailInput) emailInput.focus();
                }, 100);
                break;
                
            case 'dashboard':
                // Cargar datos inicial
                this.loadDashboardData();
                break;
        }
    }
    
    async loadDashboardData() {
        const user = this.appState.getState('auth.user');
        if (!user || !window.dataManager) {
            console.warn('⚠️ Usuario no autenticado o DataManager no disponible');
            return;
        }
        
        const activeTab = this.appState.getState('dashboard.activeTab');
        
        try {
            // Cargar datos según el tab activo
            switch (activeTab) {
                case 'resumen':
                    await window.dataManager.getResumen(user.id);
                    break;
                    
                case 'ingresos':
                    await window.dataManager.getIngresos(user.id);
                    break;
                    
                case 'gastos':
                    await window.dataManager.getGastos(user.id);
                    break;
                    
                case 'reportes':
                    await window.dataManager.getReportes(user.id);
                    break;
                    
                default:
                    // Para resumen siempre cargar datos básicos
                    await window.dataManager.getResumen(user.id);
                    break;
            }
            
            // Re-render del tab actual
            this.renderDashboardTab(activeTab);
            
        } catch (error) {
            console.error('❌ Error cargando datos del dashboard:', error);
            this.appState.addNotification('error', 'Error cargando datos');
        }
    }
    
    renderError(error) {
        const container = document.getElementById('app');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc;">
                    <div style="text-align: center; max-width: 400px; padding: 2rem;">
                        <h1 style="color: #dc2626; margin-bottom: 1rem;">❌ Error</h1>
                        <p style="color: #6b7280; margin-bottom: 1.5rem;">${error.message}</p>
                        <button onclick="location.reload()" class="btn btn-primary">
                            🔄 Recargar Página
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    renderNotifications(notifications) {
        let container = document.querySelector('.notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.innerHTML = notifications.map(notification => {
            const template = this.templates.get('notification');
            return this.processTemplate(template.html, {
                ...notification,
                time: new Date(notification.timestamp).toLocaleTimeString()
            });
        }).join('');
        
        // Setup notification events
        this.setupEvents(this.templates.get('notification').events || {});
    }
    
    /**
     * Renderizar tab específico del dashboard
     */
    async renderDashboardTab(tab) {
        const tabContent = document.getElementById('tabContent');
        if (!tabContent) return;
        
        // Actualizar clases de tabs
        document.querySelectorAll('.tab').forEach(tabEl => {
            tabEl.classList.toggle('active', tabEl.dataset.tab === tab);
        });
        
        // Renderizar contenido
        tabContent.innerHTML = this.getDashboardTabContent();
    }
}

// Export global
window.ComponentManagerV2 = ComponentManagerV2;

console.log('📦 ComponentManager V2 módulo cargado');
