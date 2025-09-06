/**
 * 🎨 SISTEMA DE COMPONENTES AVANZADO V2
 * Sistema completo de componentes equivalente a React
 */

class ComponentManagerV2 {
    constructor() {
        this.container = document.getElementById('app');
        this.currentView = null;
        
        console.log('🎨 ComponentManagerV2 inicializado');
    }
    
    /**
     * Templates de componentes (equivale a JSX)
     */
    static templates = {
        // === COMPONENTE LOGIN === (equivale a LoginForm component)
        loginForm: `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1>💰 Gestión Financiera</h1>
                        <h2>Iniciar Sesión</h2>
                        <p>Accede a tu panel de control financiero</p>
                    </div>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="email">📧 Correo Electrónico</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required 
                                placeholder="tu@email.com"
                                class="form-input"
                                value="{{defaultEmail}}"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="password">🔐 Contraseña</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                placeholder="Tu contraseña"
                                class="form-input"
                                value="{{defaultPassword}}"
                            >
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full" id="loginBtn">
                            <span class="btn-text">Iniciar Sesión</span>
                            <span class="btn-loading hidden">
                                <div class="spinner"></div>
                                Iniciando...
                            </span>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>¿No tienes cuenta? 
                            <a href="#" onclick="ComponentManagerV2.showRegister()" class="auth-link">
                                Regístrate aquí
                            </a>
                        </p>
                    </div>
                </div>
                
                <!-- Status Messages -->
                <div id="auth-status" class="status-container"></div>
            </div>
        `,
        
        // === COMPONENTE REGISTER === (equivale a RegisterForm component)
        registerForm: `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1>💰 Gestión Financiera</h1>
                        <h2>Crear Cuenta</h2>
                        <p>Registra tu cuenta para comenzar</p>
                    </div>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nombre">👤 Nombre</label>
                                <input 
                                    type="text" 
                                    id="nombre" 
                                    name="nombre" 
                                    required 
                                    placeholder="Tu nombre"
                                    class="form-input"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="apellido">👥 Apellido</label>
                                <input 
                                    type="text" 
                                    id="apellido" 
                                    name="apellido" 
                                    required 
                                    placeholder="Tu apellido"
                                    class="form-input"
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="dni">🆔 DNI</label>
                                <input 
                                    type="text" 
                                    id="dni" 
                                    name="dni" 
                                    required 
                                    placeholder="12345678"
                                    class="form-input"
                                    maxlength="8"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="edad">🎂 Edad</label>
                                <input 
                                    type="number" 
                                    id="edad" 
                                    name="edad" 
                                    required 
                                    placeholder="25"
                                    class="form-input"
                                    min="18" 
                                    max="100"
                                >
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="reg-email">📧 Correo Electrónico</label>
                            <input 
                                type="email" 
                                id="reg-email" 
                                name="email" 
                                required 
                                placeholder="tu@email.com"
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="reg-password">🔐 Contraseña</label>
                            <input 
                                type="password" 
                                id="reg-password" 
                                name="password" 
                                required 
                                placeholder="Mínimo 6 caracteres"
                                class="form-input"
                                minlength="6"
                            >
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full" id="registerBtn">
                            <span class="btn-text">Crear Cuenta</span>
                            <span class="btn-loading hidden">
                                <div class="spinner"></div>
                                Creando...
                            </span>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>¿Ya tienes cuenta? 
                            <a href="#" onclick="ComponentManagerV2.showLogin()" class="auth-link">
                                Inicia sesión
                            </a>
                        </p>
                    </div>
                </div>
                
                <!-- Status Messages -->
                <div id="auth-status" class="status-container"></div>
            </div>
        `,
        
        // === COMPONENTE DASHBOARD === (equivale a Dashboard component)
        dashboard: `
            <div class="dashboard">
                <!-- Header -->
                <header class="dashboard-header">
                    <div class="container">
                        <div class="header-content">
                            <div class="header-left">
                                <h1>💰 Panel de Control</h1>
                                <p>Bienvenido, <strong>{{userName}}</strong></p>
                            </div>
                            
                            <div class="header-right">
                                <div class="user-info">
                                    <div class="balance-quick {{balanceClass}}">
                                        <span class="balance-label">Balance:</span>
                                        <span class="balance-amount">{{balanceFormatted}}</span>
                                    </div>
                                </div>
                                
                                <button onclick="AuthManagerV2.logout()" class="btn btn-secondary">
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                
                <!-- Navigation Tabs -->
                <nav class="dashboard-tabs">
                    <div class="container">
                        <div class="tabs-wrapper">
                            <button 
                                class="tab {{resumenActive}}" 
                                data-tab="resumen"
                                onclick="DashboardManagerV2.showTab('resumen')"
                            >
                                📊 Resumen
                            </button>
                            
                            <button 
                                class="tab {{ingresosActive}}" 
                                data-tab="ingresos"
                                onclick="DashboardManagerV2.showTab('ingresos')"
                            >
                                💰 Ingresos
                                <span class="tab-count">{{ingresosCount}}</span>
                            </button>
                            
                            <button 
                                class="tab {{gastosActive}}" 
                                data-tab="gastos"
                                onclick="DashboardManagerV2.showTab('gastos')"
                            >
                                💸 Gastos
                                <span class="tab-count">{{gastosCount}}</span>
                            </button>
                            
                            <button 
                                class="tab {{simuladorActive}}" 
                                data-tab="simulador"
                                onclick="DashboardManagerV2.showTab('simulador')"
                            >
                                🏦 Simulador
                                <span class="tab-count">{{simulacionesCount}}</span>
                            </button>
                        </div>
                    </div>
                </nav>
                
                <!-- Main Content -->
                <main class="dashboard-content">
                    <div class="container">
                        <div id="tab-content" class="tab-content">
                            <!-- Contenido dinámico de tabs -->
                            <div class="tab-loading">
                                <div class="spinner"></div>
                                <p>Cargando contenido...</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `,
        
        // === LOADING SPINNER ===
        loading: `
            <div class="loading-container">
                <div class="loading-content">
                    <div class="spinner-large"></div>
                    <h3>{{loadingMessage}}</h3>
                    <p>{{loadingSubtext}}</p>
                </div>
            </div>
        `,
        
        // === NOTIFICATIONS ===
        notification: `
            <div class="notification notification-{{type}}" data-id="{{id}}">
                <div class="notification-icon">{{icon}}</div>
                <div class="notification-content">
                    <div class="notification-message">{{message}}</div>
                    <div class="notification-time">{{timeAgo}}</div>
                </div>
                <button 
                    class="notification-close" 
                    onclick="ComponentManagerV2.removeNotification('{{id}}')"
                >×</button>
            </div>
        `
    };
    
    /**
     * Renderizar vista principal (equivale a ReactDOM.render)
     */
    render(state) {
        if (!this.container) {
            console.error('❌ Container #app no encontrado');
            return;
        }
        
        const { currentView, loading } = state;
        
        // Mostrar loading si es necesario
        if (loading && currentView !== 'login' && currentView !== 'register') {
            this.renderLoading();
            return;
        }
        
        // Renderizar vista según estado actual
        let content = '';
        
        switch (currentView) {
            case 'login':
                content = this.renderTemplate('loginForm', {
                    defaultEmail: 'joe@gmail.com',
                    defaultPassword: '123456'
                });
                break;
                
            case 'register':
                content = this.renderTemplate('registerForm');
                break;
                
            case 'dashboard':
                if (state.user) {
                    content = this.renderDashboard(state);
                } else {
                    // Si no hay usuario, volver a login
                    window.appState.setState('currentView', 'login');
                    return;
                }
                break;
                
            default:
                content = this.renderTemplate('loginForm', {
                    defaultEmail: 'joe@gmail.com',
                    defaultPassword: '123456'
                });
        }
        
        // Actualizar DOM solo si cambió
        if (this.currentView !== currentView) {
            this.container.innerHTML = content;
            this.currentView = currentView;
            
            // Configurar event listeners
            this.attachEventListeners(currentView, state);
        }
        
        // Renderizar notificaciones
        this.renderNotifications(state.ui?.notifications || []);
    }
    
    /**
     * Renderizar dashboard con datos dinámicos
     */
    renderDashboard(state) {
        const { user, userProfile, data, selectedTab } = state;
        const { estadisticas } = data;
        
        // Preparar datos para el template
        const userName = userProfile?.nombre || user?.email?.split('@')[0] || 'Usuario';
        const balance = estadisticas?.balanceActual || 0;
        const balanceFormatted = this.formatCurrency(balance);
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        
        // Contadores para tabs
        const ingresosCount = data.ingresos?.length || 0;
        const gastosCount = data.gastos?.length || 0;
        const simulacionesCount = data.simulaciones?.length || 0;
        
        // Estados activos de tabs
        const tabsActive = {
            resumenActive: selectedTab === 'resumen' ? 'active' : '',
            ingresosActive: selectedTab === 'ingresos' ? 'active' : '',
            gastosActive: selectedTab === 'gastos' ? 'active' : '',
            simuladorActive: selectedTab === 'simulador' ? 'active' : ''
        };
        
        return this.renderTemplate('dashboard', {
            userName,
            balanceFormatted,
            balanceClass,
            ingresosCount,
            gastosCount,
            simulacionesCount,
            ...tabsActive
        });
    }
    
    /**
     * Renderizar loading
     */
    renderLoading() {
        const content = this.renderTemplate('loading', {
            loadingMessage: 'Cargando...',
            loadingSubtext: 'Por favor espera un momento'
        });
        
        this.container.innerHTML = content;
    }
    
    /**
     * Renderizar notificaciones
     */
    renderNotifications(notifications) {
        let notificationContainer = document.getElementById('notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Renderizar cada notificación
        const notificationsHtml = notifications.map(notification => {
            const icon = this.getNotificationIcon(notification.type);
            const timeAgo = this.getTimeAgo(notification.timestamp);
            
            return this.renderTemplate('notification', {
                id: notification.id,
                type: notification.type,
                icon,
                message: notification.message,
                timeAgo
            });
        }).join('');
        
        notificationContainer.innerHTML = notificationsHtml;
    }
    
    /**
     * Renderizar template con datos (equivale a template literals en React)
     */
    renderTemplate(templateName, data = {}) {
        if (!ComponentManagerV2.templates[templateName]) {
            console.error(`❌ Template '${templateName}' no encontrado`);
            return '<div>Error: Template no encontrado</div>';
        }
        
        let html = ComponentManagerV2.templates[templateName];
        
        // Reemplazar variables {{variable}}
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, value !== null && value !== undefined ? value : '');
        });
        
        // Limpiar variables no reemplazadas
        html = html.replace(/{{\w+}}/g, '');
        
        return html;
    }
    
    /**
     * Configurar event listeners (equivale a onClick handlers)
     */
    attachEventListeners(currentView, state) {
        switch (currentView) {
            case 'login':
                this.setupLoginForm();
                break;
            case 'register':
                this.setupRegisterForm();
                break;
            case 'dashboard':
                this.setupDashboard(state);
                break;
        }
    }
    
    /**
     * Configurar formulario de login
     */
    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (window.AuthManagerV2) {
                await window.AuthManagerV2.login(email, password);
            } else {
                console.error('❌ AuthManagerV2 no disponible');
            }
        });
        
        console.log('✅ Formulario de login configurado');
    }
    
    /**
     * Configurar formulario de registro
     */
    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                dni: document.getElementById('dni').value,
                edad: parseInt(document.getElementById('edad').value)
            };
            
            if (window.AuthManagerV2) {
                await window.AuthManagerV2.register(formData);
            } else {
                console.error('❌ AuthManagerV2 no disponible');
            }
        });
        
        console.log('✅ Formulario de registro configurado');
    }
    
    /**
     * Configurar dashboard
     */
    setupDashboard(state) {
        console.log('🎯 Dashboard configurado para tab:', state.selectedTab);
        
        // Cargar contenido del tab inicial después de un pequeño delay
        setTimeout(() => {
            if (window.DashboardManagerV2) {
                window.DashboardManagerV2.showTab(state.selectedTab);
            }
        }, 100);
    }
    
    /**
     * Funciones de navegación (equivale a React Router)
     */
    static showLogin() {
        window.appState.setState('currentView', 'login');
    }
    
    static showRegister() {
        window.appState.setState('currentView', 'register');
    }
    
    static showDashboard() {
        window.appState.setState('currentView', 'dashboard');
    }
    
    /**
     * Remover notificación
     */
    static removeNotification(notificationId) {
        window.appState.removeNotification(parseInt(notificationId));
    }
    
    /**
     * Utilidades
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000);
        
        if (diff < 60) return 'Hace un momento';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
        return `Hace ${Math.floor(diff / 86400)}d`;
    }
}

// Instancia global
if (!window.ComponentManagerV2) {
    window.ComponentManagerV2 = new ComponentManagerV2();
}

console.log('🎨 ComponentManagerV2 class definida');
