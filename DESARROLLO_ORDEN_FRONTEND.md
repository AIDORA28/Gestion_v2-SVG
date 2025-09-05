# 🎨 DESARROLLO MODULAR FRONTEND

## 📋 **Stack Tecnológico Equivalente a v1**

### **Comparación: React + Create React App → HTML5 + Vanilla JS**
```
v1 (React Complejo):              v2 (HTML Simplificado):
React Components       →          HTML5 + JavaScript Classes
useState/useEffect     →          Vanilla State Management
React Router           →          History API / Simple Navigation  
axios HTTP client     →          Supabase Client (incluye HTTP)
Tailwind + shadcn/ui   →          CSS3 + Variables CSS
Package.json deps      →          CDN + Módulos ES6
npm build/serve        →          Live Server / Static hosting
```

## 🎯 **MÓDULOS DE DESARROLLO FRONTEND**

### **MÓDULO 1: ESTRUCTURA BASE Y CONFIGURACIÓN** ⏱️ (45 min)

#### **1.1 Crear Estructura de Archivos (15 min)**
```
frontend/
├── index.html              # Página principal (login/registro)
├── dashboard.html          # Dashboard después del login  
├── css/
│   ├── main.css           # Estilos base (equivale a App.css)
│   ├── components.css     # Componentes UI (equivale a shadcn)
│   └── responsive.css     # Media queries (equivale a Tailwind responsive)
├── js/
│   ├── config.js          # Configuración Supabase (equivale a .env)
│   ├── app.js             # App principal + estado (equivale a App.js)
│   ├── auth.js            # Autenticación (equivale a AuthContext)
│   ├── dashboard.js       # Lógica dashboard (equivale a Dashboard component)
│   └── components.js      # Componentes reutilizables
└── assets/
    ├── icons/             # Iconos SVG
    └── images/            # Imágenes
```

#### **1.2 Configurar index.html Base (15 min)**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión Financiera v2</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <div id="app">
        <!-- Contenedor principal (equivale a React root) -->
    </div>
    
    <!-- Supabase Client (equivale a npm install @supabase/supabase-js) -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <!-- Scripts modulares (equivale a import statements) -->
    <script type="module" src="js/config.js"></script>
    <script type="module" src="js/app.js"></script>
    <script type="module" src="js/auth.js"></script>
</body>
</html>
```

#### **1.3 Configurar Supabase Client (15 min)**
```javascript
// js/config.js (equivale a .env + createClient)
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key-aqui'
};

// Cliente global (equivale a createClient en React)
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// Exportar para otros módulos
window.supabaseClient = supabase;
```

---

### **MÓDULO 2: SISTEMA DE ESTADO Y COMPONENTES** ⏱️ (60 min)

#### **2.1 State Management Central (20 min)**
```javascript
// js/app.js (equivale a useState/useContext en React)
class AppState {
    constructor() {
        this.state = {
            user: null,                    // Usuario actual (equivale a useAuth)
            loading: false,                // Estados de carga
            currentView: 'login',          // Vista actual (equivale a React Router)
            data: {
                ingresos: [],              // Lista ingresos (equivale a useState([]))
                gastos: [],                // Lista gastos
                balance: null,             // Balance calculado
                simulaciones: []           // Simulaciones guardadas
            },
            ui: {
                showModal: false,          // Modales (equivale a useState modal)
                selectedTab: 'resumen',    // Tab activa
                notifications: []          // Notificaciones (equivale a toast)
            }
        };
        
        // Observadores (equivale a useEffect dependencies)
        this.listeners = new Map();
        this.init();
    }
    
    // Equivale a setState en React
    setState(path, value) {
        this.setNestedState(this.state, path.split('.'), value);
        this.notifyListeners(path, value);
        this.render();
    }
    
    // Equivale a useEffect
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
    }
    
    // Inicialización (equivale a useEffect([]))
    async init() {
        await this.checkAuthState();
        this.render();
    }
    
    async checkAuthState() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            this.setState('user', session.user);
            this.setState('currentView', 'dashboard');
        }
    }
}

// Instancia global (equivale a Context Provider)
const appState = new AppState();
```

#### **2.2 Sistema de Templates/Componentes (25 min)**
```javascript
// js/components.js (equivale a React Components)
class ComponentManager {
    // Templates (equivale a JSX)
    static templates = {
        // Equivale a LoginForm component
        loginForm: `
            <div class="auth-container">
                <div class="auth-card">
                    <h2>Iniciar Sesión</h2>
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label>Contraseña</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <span id="login-text">Ingresar</span>
                            <span id="login-spinner" class="spinner hidden">...</span>
                        </button>
                    </form>
                    <p class="auth-switch">
                        ¿No tienes cuenta? 
                        <a href="#" onclick="ComponentManager.showRegister()">Regístrate</a>
                    </p>
                </div>
            </div>
        `,
        
        // Equivale a RegisterForm component  
        registerForm: `
            <div class="auth-container">
                <div class="auth-card">
                    <h2>Crear Cuenta</h2>
                    <form id="registerForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nombre</label>
                                <input type="text" id="nombre" required>
                            </div>
                            <div class="form-group">
                                <label>Apellido</label>
                                <input type="text" id="apellido" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label>Contraseña</label>
                            <input type="password" id="password" required>
                        </div>
                        <div class="form-group">
                            <label>DNI</label>
                            <input type="text" id="dni">
                        </div>
                        <div class="form-group">
                            <label>Edad</label>
                            <input type="number" id="edad" min="18" max="120">
                        </div>
                        <button type="submit" class="btn btn-primary">Crear Cuenta</button>
                    </form>
                    <p class="auth-switch">
                        ¿Ya tienes cuenta? 
                        <a href="#" onclick="ComponentManager.showLogin()">Inicia Sesión</a>
                    </p>
                </div>
            </div>
        `,
        
        // Equivale a Dashboard component
        dashboard: `
            <div class="dashboard">
                <header class="dashboard-header">
                    <div class="header-content">
                        <h1>💰 Mi Dashboard Financiero</h1>
                        <div class="header-actions">
                            <span class="user-info">{{userName}}</span>
                            <button id="logoutBtn" class="btn btn-secondary">Cerrar Sesión</button>
                        </div>
                    </div>
                </header>
                
                <nav class="dashboard-tabs">
                    <button class="tab active" data-tab="resumen">📊 Resumen</button>
                    <button class="tab" data-tab="ingresos">💵 Ingresos</button>
                    <button class="tab" data-tab="gastos">� Gastos</button>
                    <button class="tab" data-tab="simulador">🏦 Simulador</button>
                </nav>
                
                <main class="dashboard-content">
                    <div id="tab-content" class="tab-content">
                        <!-- Contenido dinámico según tab activa -->
                    </div>
                </main>
            </div>
        `
    };
    
    // Renderizar template (equivale a render() en React)
    static render(templateName, data = {}) {
        let html = this.templates[templateName];
        
        // Reemplazar variables {{variable}} (equivale a props)
        Object.entries(data).forEach(([key, value]) => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        
        return html;
    }
    
    // Métodos de navegación (equivale a React Router)
    static showLogin() {
        appState.setState('currentView', 'login');
    }
    
    static showRegister() {
        appState.setState('currentView', 'register');
    }
    
    static showDashboard() {
        appState.setState('currentView', 'dashboard');
    }
}
```

#### **2.3 Renderizador Principal (15 min)**
```javascript
// js/app.js - continuación (equivale a ReactDOM.render)
class AppRenderer {
    constructor() {
        this.container = document.getElementById('app');
    }
    
    // Renderizar según estado actual (equivale a conditional rendering)
    render(state) {
        const { currentView, user } = state;
        
        let content = '';
        
        switch(currentView) {
            case 'login':
                content = ComponentManager.render('loginForm');
                break;
                
            case 'register':
                content = ComponentManager.render('registerForm');
                break;
                
            case 'dashboard':
                if (user) {
                    content = ComponentManager.render('dashboard', {
                        userName: user.email
                    });
                } else {
                    content = ComponentManager.render('loginForm');
                }
                break;
                
            default:
                content = ComponentManager.render('loginForm');
        }
        
        this.container.innerHTML = content;
        this.attachEventListeners(currentView);
    }
    
    // Eventos (equivale a onClick handlers)
    attachEventListeners(view) {
        switch(view) {
            case 'login':
                this.setupLoginForm();
                break;
            case 'register':
                this.setupRegisterForm();
                break;
            case 'dashboard':
                this.setupDashboard();
                break;
        }
    }
}

// Instancia global del renderizador
const renderer = new AppRenderer();

// Conectar estado con renderizador (equivale a useState effect)
appState.render = () => renderer.render(appState.state);
```

### **MÓDULO 3: AUTENTICACIÓN** ⏱️ (45 min)

#### **3.1 Implementar Login (15 min)**
```javascript
// js/auth.js (equivale a AuthContext + useAuth)
class AuthManager {
    static async login(email, password) {
        try {
            // Mostrar loading (equivale a setLoading(true))
            appState.setState('loading', true);
            
            // Supabase login (equivale a axios.post('/login'))
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Actualizar estado (equivale a setUser(data.user))
            appState.setState('user', data.user);
            appState.setState('currentView', 'dashboard');
            
            // Cargar datos del usuario
            await this.loadUserProfile(data.user.id);
            
            this.showSuccess('¡Bienvenido!');
            
        } catch (error) {
            this.showError('Error al iniciar sesión: ' + error.message);
        } finally {
            appState.setState('loading', false);
        }
    }
    
    static async loadUserProfile(userId) {
        // Cargar perfil del usuario (equivale a useEffect fetch)
        const { data: perfil } = await supabaseClient
            .from('perfiles_usuario')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (perfil) {
            appState.setState('userProfile', perfil);
        }
    }
}

// Setup del formulario de login (equivale a onSubmit handler)
class AppRenderer {
    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            await AuthManager.login(email, password);
        });
    }
}
```

#### **3.2 Implementar Registro (15 min)**
```javascript
// js/auth.js - continuación
class AuthManager {
    static async register(userData) {
        try {
            appState.setState('loading', true);
            
            // Registro en Supabase Auth (equivale a createUserWithEmailAndPassword)
            const { data, error } = await supabaseClient.auth.signUp({
                email: userData.email,
                password: userData.password
            });
            
            if (error) throw error;
            
            // Crear perfil del usuario (equivale a axios.post('/users'))
            if (data.user) {
                await this.createUserProfile(data.user.id, userData);
            }
            
            this.showSuccess('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
            appState.setState('currentView', 'login');
            
        } catch (error) {
            this.showError('Error al registrarse: ' + error.message);
        } finally {
            appState.setState('loading', false);
        }
    }
    
    static async createUserProfile(userId, userData) {
        const { error } = await supabaseClient
            .from('perfiles_usuario')
            .insert({
                id: userId,
                nombre: userData.nombre,
                apellido: userData.apellido,
                dni: userData.dni,
                edad: userData.edad
            });
            
        if (error) throw error;
    }
}

// Setup del formulario de registro
class AppRenderer {
    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                dni: document.getElementById('dni').value,
                edad: parseInt(document.getElementById('edad').value)
            };
            
            await AuthManager.register(formData);
        });
    }
}
```

#### **3.3 Implementar Logout y Persistencia (15 min)**
```javascript
// js/auth.js - continuación
class AuthManager {
    static async logout() {
        try {
            await supabaseClient.auth.signOut();
            
            // Limpiar estado (equivale a resetear todos los useState)
            appState.setState('user', null);
            appState.setState('userProfile', null);
            appState.setState('data.ingresos', []);
            appState.setState('data.gastos', []);
            appState.setState('data.balance', null);
            appState.setState('currentView', 'login');
            
            this.showSuccess('Sesión cerrada correctamente');
            
        } catch (error) {
            this.showError('Error al cerrar sesión');
        }
    }
    
    static showSuccess(message) {
        // Mostrar notificación (equivale a toast.success)
        appState.setState('ui.notifications', [
            ...appState.state.ui.notifications,
            { type: 'success', message, id: Date.now() }
        ]);
    }
    
    static showError(message) {
        // Mostrar error (equivale a toast.error)
        appState.setState('ui.notifications', [
            ...appState.state.ui.notifications,
            { type: 'error', message, id: Date.now() }
        ]);
    }
}

// Setup del dashboard - logout button
class AppRenderer {
    setupDashboard() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', AuthManager.logout);
        }
        
        // Setup tabs del dashboard
        this.setupDashboardTabs();
        
        // Cargar datos iniciales
        this.loadDashboardData();
    }
}
```

---

### **MÓDULO 4: DASHBOARD Y TABS** ⏱️ (75 min)

#### **4.1 Sistema de Tabs (20 min)**
```javascript
// js/dashboard.js (equivale a useState para tab activa)
class DashboardManager {
    static init() {
        this.setupTabs();
        this.showTab('resumen'); // Tab inicial
    }
    
    static setupTabs() {
        // Equivale a onClick handlers en React
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });
    }
    
    static async showTab(tabName) {
        // Actualizar tabs activos (equivale a className conditional)
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Actualizar estado
        appState.setState('ui.selectedTab', tabName);
        
        // Renderizar contenido (equivale a conditional rendering)
        const content = document.getElementById('tab-content');
        
        switch(tabName) {
            case 'resumen':
                content.innerHTML = await this.renderResumen();
                break;
            case 'ingresos':
                content.innerHTML = this.renderIngresos();
                this.setupIngresosForm();
                break;
            case 'gastos':
                content.innerHTML = this.renderGastos();
                this.setupGastosForm();
                break;
            case 'simulador':
                content.innerHTML = this.renderSimulador();
                this.setupSimuladorForm();
                break;
        }
    }
}
```

#### **4.2 Tab Resumen (20 min)**
```javascript
// js/dashboard.js - continuación (equivale a Dashboard component)
class DashboardManager {
    static async renderResumen() {
        // Obtener datos (equivale a useEffect + useState)
        const balance = await this.getBalanceActual();
        const { ingresos, gastos } = await this.getTransaccionesRecientes();
        
        return `
            <div class="resumen-container">
                <div class="resumen-cards">
                    <div class="card balance-card ${balance >= 0 ? 'positive' : 'negative'}">
                        <div class="card-header">
                            <h3>💰 Balance Actual</h3>
                        </div>
                        <div class="card-content">
                            <div class="balance-amount">
                                $${balance.toLocaleString('es-CO')}
                            </div>
                            <small class="balance-status">
                                ${balance >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
                            </small>
                        </div>
                    </div>
                    
                    <div class="card income-card">
                        <div class="card-header">
                            <h3>📈 Ingresos del Mes</h3>
                        </div>
                        <div class="card-content">
                            <div class="amount positive">
                                $${ingresos.total.toLocaleString('es-CO')}
                            </div>
                            <small>${ingresos.count} transacciones</small>
                        </div>
                    </div>
                    
                    <div class="card expense-card">
                        <div class="card-header">
                            <h3>📉 Gastos del Mes</h3>
                        </div>
                        <div class="card-content">
                            <div class="amount negative">
                                $${gastos.total.toLocaleString('es-CO')}
                            </div>
                            <small>${gastos.count} transacciones</small>
                        </div>
                    </div>
                </div>
                
                <div class="recent-transactions">
                    <h3>📋 Transacciones Recientes</h3>
                    <div class="transactions-list">
                        ${this.renderTransactionsList(ingresos.items, gastos.items)}
                    </div>
                </div>
            </div>
        `;
    }
    
    static async getBalanceActual() {
        const userId = appState.state.user.id;
        
        // Llamar función del backend (equivale a API call)
        const { data } = await supabaseClient.rpc('calcular_balance_mensual', {
            p_usuario_id: userId,
            p_year: new Date().getFullYear(),
            p_month: new Date().getMonth() + 1
        });
        
        return data ? data.balance : 0;
    }
    
    static async getTransaccionesRecientes() {
        const userId = appState.state.user.id;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        // Obtener ingresos del mes (equivale a axios.get)
        const { data: ingresos } = await supabaseClient
            .from('ingresos')
            .select('*')
            .eq('usuario_id', userId)
            .gte('fecha', currentMonth + '-01')
            .lte('fecha', currentMonth + '-31')
            .order('fecha', { ascending: false });
            
        // Obtener gastos del mes
        const { data: gastos } = await supabaseClient
            .from('gastos')
            .select('*')
            .eq('usuario_id', userId)
            .gte('fecha', currentMonth + '-01')
            .lte('fecha', currentMonth + '-31')
            .order('fecha', { ascending: false });
        
        return {
            ingresos: {
                items: ingresos || [],
                total: (ingresos || []).reduce((sum, item) => sum + parseFloat(item.monto), 0),
                count: (ingresos || []).length
            },
            gastos: {
                items: gastos || [],
                total: (gastos || []).reduce((sum, item) => sum + parseFloat(item.monto), 0),
                count: (gastos || []).length
            }
        };
    }
}
```

#### **4.3 Tab Ingresos (35 min)**
```javascript
// js/dashboard.js - Tab Ingresos (equivale a IncomeComponent)
class DashboardManager {
    static renderIngresos() {
        const ingresos = appState.state.data.ingresos;
        
        return `
            <div class="ingresos-container">
                <!-- Formulario agregar ingreso -->
                <div class="card">
                    <div class="card-header">
                        <h3>➕ Agregar Ingreso</h3>
                    </div>
                    <div class="card-content">
                        <form id="ingresosForm" class="transaction-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Descripción</label>
                                    <input type="text" id="ingreso-descripcion" required 
                                           placeholder="Ej: Salario, Freelance, etc.">
                                </div>
                                <div class="form-group">
                                    <label>Monto</label>
                                    <input type="number" id="ingreso-monto" required min="0" step="0.01"
                                           placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Categoría</label>
                                    <select id="ingreso-categoria">
                                        <option value="salario">💼 Salario</option>
                                        <option value="freelance">💻 Freelance</option>
                                        <option value="inversiones">📈 Inversiones</option>
                                        <option value="negocio">🏪 Negocio</option>
                                        <option value="otros">📝 Otros</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Fecha</label>
                                    <input type="date" id="ingreso-fecha" 
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success">
                                💰 Agregar Ingreso
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Lista de ingresos -->
                <div class="card">
                    <div class="card-header">
                        <h3>📊 Mis Ingresos</h3>
                        <div class="card-actions">
                            <button class="btn btn-secondary" onclick="DashboardManager.loadIngresos()">
                                🔄 Actualizar
                            </button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div id="ingresos-list" class="transactions-table">
                            ${this.renderIngresosTable(ingresos)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static renderIngresosTable(ingresos) {
        if (!ingresos || ingresos.length === 0) {
            return '<p class="empty-state">No hay ingresos registrados aún. ¡Agrega tu primer ingreso!</p>';
        }
        
        return `
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>📅 Fecha</th>
                        <th>📝 Descripción</th>
                        <th>🏷️ Categoría</th>
                        <th>💰 Monto</th>
                        <th>⚙️ Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${ingresos.map(ingreso => `
                        <tr>
                            <td>${new Date(ingreso.fecha).toLocaleDateString('es-CO')}</td>
                            <td>${ingreso.descripcion}</td>
                            <td><span class="category-tag">${ingreso.categoria}</span></td>
                            <td class="amount positive">$${parseFloat(ingreso.monto).toLocaleString('es-CO')}</td>
                            <td class="actions">
                                <button class="btn-icon" onclick="DashboardManager.editIngreso('${ingreso.id}')">
                                    ✏️
                                </button>
                                <button class="btn-icon delete" onclick="DashboardManager.deleteIngreso('${ingreso.id}')">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    static setupIngresosForm() {
        const form = document.getElementById('ingresosForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const ingresoData = {
                usuario_id: appState.state.user.id,
                descripcion: document.getElementById('ingreso-descripcion').value,
                monto: parseFloat(document.getElementById('ingreso-monto').value),
                categoria: document.getElementById('ingreso-categoria').value,
                fecha: document.getElementById('ingreso-fecha').value
            };
            
            await this.addIngreso(ingresoData);
        });
    }
    
    static async addIngreso(ingresoData) {
        try {
            appState.setState('loading', true);
            
            // Insertar en Supabase (equivale a axios.post)
            const { data, error } = await supabaseClient
                .from('ingresos')
                .insert([ingresoData])
                .select();
                
            if (error) throw error;
            
            // Actualizar estado local (equivale a setState)
            const currentIngresos = appState.state.data.ingresos;
            appState.setState('data.ingresos', [data[0], ...currentIngresos]);
            
            // Limpiar formulario
            document.getElementById('ingresosForm').reset();
            document.getElementById('ingreso-fecha').value = new Date().toISOString().split('T')[0];
            
            AuthManager.showSuccess('💰 Ingreso agregado correctamente');
            
            // Actualizar vista
            this.refreshResumenData();
            
        } catch (error) {
            AuthManager.showError('Error al agregar ingreso: ' + error.message);
        } finally {
            appState.setState('loading', false);
        }
    }
}
```

### **MÓDULO 5: CRUD GASTOS Y SIMULADOR** ⏱️ (60 min)

#### **5.1 Tab Gastos - CRUD Completo (30 min)**
```javascript
// js/dashboard.js - Tab Gastos (equivale a ExpenseComponent)
class DashboardManager {
    static renderGastos() {
        const gastos = appState.state.data.gastos;
        
        return `
            <div class="gastos-container">
                <!-- Formulario agregar gasto -->
                <div class="card">
                    <div class="card-header">
                        <h3>💸 Agregar Gasto</h3>
                    </div>
                    <div class="card-content">
                        <form id="gastosForm" class="transaction-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Descripción</label>
                                    <input type="text" id="gasto-descripcion" required 
                                           placeholder="Ej: Supermercado, Gasolina, etc.">
                                </div>
                                <div class="form-group">
                                    <label>Monto</label>
                                    <input type="number" id="gasto-monto" required min="0" step="0.01"
                                           placeholder="0.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Categoría</label>
                                    <select id="gasto-categoria">
                                        <option value="alimentacion">🍔 Alimentación</option>
                                        <option value="transporte">🚗 Transporte</option>
                                        <option value="vivienda">🏠 Vivienda</option>
                                        <option value="salud">⚕️ Salud</option>
                                        <option value="entretenimiento">🎮 Entretenimiento</option>
                                        <option value="otros">📝 Otros</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Fecha</label>
                                    <input type="date" id="gasto-fecha" 
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-danger">
                                💸 Agregar Gasto
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Lista de gastos -->
                <div class="card">
                    <div class="card-header">
                        <h3>📊 Mis Gastos</h3>
                    </div>
                    <div class="card-content">
                        <div id="gastos-list">
                            ${this.renderGastosTable(gastos)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static renderGastosTable(gastos) {
        if (!gastos || gastos.length === 0) {
            return '<p class="empty-state">No hay gastos registrados aún.</p>';
        }
        
        return `
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>📅 Fecha</th>
                        <th>📝 Descripción</th>
                        <th>🏷️ Categoría</th>
                        <th>💰 Monto</th>
                        <th>⚙️ Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${gastos.map(gasto => `
                        <tr>
                            <td>${new Date(gasto.fecha).toLocaleDateString('es-CO')}</td>
                            <td>${gasto.descripcion}</td>
                            <td><span class="category-tag">${gasto.categoria}</span></td>
                            <td class="amount negative">$${parseFloat(gasto.monto).toLocaleString('es-CO')}</td>
                            <td class="actions">
                                <button class="btn-icon" onclick="DashboardManager.editGasto('${gasto.id}')">✏️</button>
                                <button class="btn-icon delete" onclick="DashboardManager.deleteGasto('${gasto.id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    static setupGastosForm() {
        const form = document.getElementById('gastosForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const gastoData = {
                usuario_id: appState.state.user.id,
                descripcion: document.getElementById('gasto-descripcion').value,
                monto: parseFloat(document.getElementById('gasto-monto').value),
                categoria: document.getElementById('gasto-categoria').value,
                fecha: document.getElementById('gasto-fecha').value
            };
            
            await this.addGasto(gastoData);
        });
    }
    
    static async addGasto(gastoData) {
        try {
            const { data, error } = await supabaseClient
                .from('gastos')
                .insert([gastoData])
                .select();
                
            if (error) throw error;
            
            // Actualizar estado
            const currentGastos = appState.state.data.gastos;
            appState.setState('data.gastos', [data[0], ...currentGastos]);
            
            // Limpiar formulario
            document.getElementById('gastosForm').reset();
            document.getElementById('gasto-fecha').value = new Date().toISOString().split('T')[0];
            
            AuthManager.showSuccess('💸 Gasto agregado correctamente');
            this.refreshResumenData();
            
        } catch (error) {
            AuthManager.showError('Error al agregar gasto: ' + error.message);
        }
    }
}
```

#### **5.2 Tab Simulador de Crédito (30 min)**
```javascript
// js/dashboard.js - Simulador (equivale a CreditSimulator component)
class DashboardManager {
    static renderSimulador() {
        return `
            <div class="simulador-container">
                <!-- Formulario simulación -->
                <div class="card">
                    <div class="card-header">
                        <h3>🏦 Simulador de Crédito</h3>
                    </div>
                    <div class="card-content">
                        <form id="simuladorForm" class="simulator-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nombre de la Simulación</label>
                                    <input type="text" id="sim-nombre" required 
                                           placeholder="Ej: Casa nueva, Carro, etc.">
                                </div>
                                <div class="form-group">
                                    <label>Monto del Préstamo</label>
                                    <input type="number" id="sim-monto" required min="1000" step="1000"
                                           placeholder="100000">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tasa de Interés Anual (%)</label>
                                    <input type="number" id="sim-tasa" required min="1" max="50" step="0.1"
                                           placeholder="12.5">
                                </div>
                                <div class="form-group">
                                    <label>Plazo (meses)</label>
                                    <input type="number" id="sim-plazo" required min="1" max="480"
                                           placeholder="24">
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" 
                                        onclick="DashboardManager.calcularSimulacion()">
                                    🧮 Calcular
                                </button>
                                <button type="submit" class="btn btn-primary" id="guardar-simulacion" disabled>
                                    💾 Guardar Simulación
                                </button>
                            </div>
                        </form>
                        
                        <!-- Resultados de la simulación -->
                        <div id="resultados-simulacion" class="simulation-results hidden">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                </div>
                
                <!-- Simulaciones guardadas -->
                <div class="card">
                    <div class="card-header">
                        <h3>📋 Simulaciones Guardadas</h3>
                    </div>
                    <div class="card-content">
                        <div id="simulaciones-list">
                            ${this.renderSimulacionesTable(appState.state.data.simulaciones)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static async calcularSimulacion() {
        const monto = parseFloat(document.getElementById('sim-monto').value);
        const tasa = parseFloat(document.getElementById('sim-tasa').value);
        const plazo = parseInt(document.getElementById('sim-plazo').value);
        
        if (!monto || !tasa || !plazo) {
            AuthManager.showError('Por favor completa todos los campos');
            return;
        }
        
        try {
            // Llamar función del backend (equivale a API call)
            const { data, error } = await supabaseClient.rpc('calcular_credito', {
                p_monto: monto,
                p_tasa_anual: tasa,
                p_plazo_meses: plazo
            });
            
            if (error) throw error;
            
            // Mostrar resultados
            this.mostrarResultadosSimulacion(data);
            
            // Habilitar botón guardar
            document.getElementById('guardar-simulacion').disabled = false;
            
        } catch (error) {
            AuthManager.showError('Error en el cálculo: ' + error.message);
        }
    }
    
    static mostrarResultadosSimulacion(resultados) {
        const container = document.getElementById('resultados-simulacion');
        
        container.innerHTML = `
            <div class="results-grid">
                <div class="result-card">
                    <div class="result-label">💰 Cuota Mensual</div>
                    <div class="result-value primary">
                        $${resultados.cuota_mensual.toLocaleString('es-CO')}
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-label">📊 Total a Pagar</div>
                    <div class="result-value">
                        $${resultados.total_pagar.toLocaleString('es-CO')}
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-label">📈 Total Intereses</div>
                    <div class="result-value secondary">
                        $${resultados.total_intereses.toLocaleString('es-CO')}
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="result-label">📊 % de Intereses</div>
                    <div class="result-value">
                        ${((resultados.total_intereses / (resultados.total_pagar - resultados.total_intereses)) * 100).toFixed(2)}%
                    </div>
                </div>
            </div>
        `;
        
        container.classList.remove('hidden');
        
        // Guardar resultados temporalmente
        appState.setState('temp.simulacionActual', {
            monto_prestamo: parseFloat(document.getElementById('sim-monto').value),
            tasa_interes: parseFloat(document.getElementById('sim-tasa').value),
            plazo_meses: parseInt(document.getElementById('sim-plazo').value),
            ...resultados
        });
    }
    
    static setupSimuladorForm() {
        const form = document.getElementById('simuladorForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const simulacionData = {
                usuario_id: appState.state.user.id,
                nombre_simulacion: document.getElementById('sim-nombre').value,
                ...appState.state.temp.simulacionActual
            };
            
            await this.guardarSimulacion(simulacionData);
        });
    }
    
    static async guardarSimulacion(simulacionData) {
        try {
            const { data, error } = await supabaseClient
                .from('simulaciones_credito')
                .insert([simulacionData])
                .select();
                
            if (error) throw error;
            
            // Actualizar estado
            const currentSimulaciones = appState.state.data.simulaciones;
            appState.setState('data.simulaciones', [data[0], ...currentSimulaciones]);
            
            AuthManager.showSuccess('💾 Simulación guardada correctamente');
            
            // Limpiar formulario
            document.getElementById('simuladorForm').reset();
            document.getElementById('resultados-simulacion').classList.add('hidden');
            document.getElementById('guardar-simulacion').disabled = true;
            
        } catch (error) {
            AuthManager.showError('Error al guardar simulación: ' + error.message);
        }
    }
}
```

---

### **MÓDULO 6: ESTILOS CSS Y RESPONSIVE** ⏱️ (45 min)

#### **6.1 CSS Base y Variables (15 min)**
```css
/* css/main.css (equivale a App.css + Tailwind base) */
:root {
    /* Colores principales */
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --secondary: #64748b;
    --success: #059669;
    --danger: #dc2626;
    --warning: #d97706;
    
    /* Backgrounds */
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-accent: #f1f5f9;
    
    /* Text */
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    
    /* Layout */
    --border-radius: 8px;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --transition: all 0.2s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    line-height: 1.6;
}

#app {
    min-height: 100vh;
}
```

#### **6.2 Componentes CSS (20 min)**
```css
/* css/components.css (equivale a shadcn/ui components) */

/* Botones */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
    font-size: 0.875rem;
}

.btn-primary {
    background: var(--primary);
    color: white;
}

.btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
}

.btn-success {
    background: var(--success);
    color: white;
}

.btn-danger {
    background: var(--danger);
    color: white;
}

.btn-secondary {
    background: var(--secondary);
    color: white;
}

/* Cards */
.card {
    background: var(--bg-primary);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    border: 1px solid #e2e8f0;
    margin-bottom: 1rem;
}

.card-header {
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
    margin: 0;
    color: var(--text-primary);
}

/* Formularios */
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

/* Tablas */
.transactions-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

.transactions-table th,
.transactions-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.transactions-table th {
    background: var(--bg-accent);
    font-weight: 600;
    color: var(--text-primary);
}

/* Amounts */
.amount {
    font-weight: 600;
    font-size: 1.1rem;
}

.amount.positive {
    color: var(--success);
}

.amount.negative {
    color: var(--danger);
}

/* Dashboard específico */
.dashboard {
    min-height: 100vh;
    background: var(--bg-secondary);
}

.dashboard-header {
    background: var(--bg-primary);
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 0;
}

.dashboard-tabs {
    display: flex;
    background: var(--bg-primary);
    border-bottom: 1px solid #e2e8f0;
    padding: 0 1rem;
}

.tab {
    padding: 1rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: var(--transition);
}

.tab.active {
    border-bottom-color: var(--primary);
    color: var(--primary);
    font-weight: 600;
}

.dashboard-content {
    padding: 2rem;
}

/* Resumen cards */
.resumen-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.balance-card {
    text-align: center;
}

.balance-amount {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0.5rem 0;
}

.balance-card.positive .balance-amount {
    color: var(--success);
}

.balance-card.negative .balance-amount {
    color: var(--danger);
}
```

#### **6.3 Responsive Design (10 min)**
```css
/* css/responsive.css (equivale a Tailwind responsive) */

/* Mobile First - Base styles for mobile */
@media (max-width: 768px) {
    .dashboard-tabs {
        flex-wrap: wrap;
        padding: 0.5rem;
    }
    
    .tab {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
    }
    
    .resumen-cards {
        grid-template-columns: 1fr;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .dashboard-content {
        padding: 1rem;
    }
    
    .card {
        padding: 1rem;
    }
    
    .transactions-table {
        font-size: 0.875rem;
    }
    
    .transactions-table th,
    .transactions-table td {
        padding: 0.5rem 0.25rem;
    }
    
    /* Ocultar columnas menos importantes en móvil */
    .transactions-table th:nth-child(3),
    .transactions-table td:nth-child(3) {
        display: none;
    }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
    .resumen-cards {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .dashboard-content {
        padding: 1.5rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .dashboard-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    .resumen-cards {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

---

### **MÓDULO 7: CARGA DE DATOS Y OPTIMIZACIÓN** ⏱️ (30 min)

#### **7.1 Carga Inicial de Datos (15 min)**
```javascript
// js/dashboard.js - Data Loading (equivale a useEffect data fetching)
class DashboardManager {
    static async loadDashboardData() {
        try {
            appState.setState('loading', true);
            
            const userId = appState.state.user.id;
            
            // Cargar todos los datos en paralelo (equivale a Promise.all)
            const [ingresosRes, gastosRes, simulacionesRes] = await Promise.all([
                supabaseClient
                    .from('ingresos')
                    .select('*')
                    .eq('usuario_id', userId)
                    .order('fecha', { ascending: false })
                    .limit(50),
                    
                supabaseClient
                    .from('gastos')
                    .select('*')
                    .eq('usuario_id', userId)
                    .order('fecha', { ascending: false })
                    .limit(50),
                    
                supabaseClient
                    .from('simulaciones_credito')
                    .select('*')
                    .eq('usuario_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(20)
            ]);
            
            // Actualizar estado con los datos
            appState.setState('data.ingresos', ingresosRes.data || []);
            appState.setState('data.gastos', gastosRes.data || []);
            appState.setState('data.simulaciones', simulacionesRes.data || []);
            
        } catch (error) {
            AuthManager.showError('Error al cargar datos: ' + error.message);
        } finally {
            appState.setState('loading', false);
        }
    }
    
    static async refreshResumenData() {
        // Actualizar solo los datos del resumen (optimización)
        if (appState.state.ui.selectedTab === 'resumen') {
            const content = document.getElementById('tab-content');
            if (content) {
                content.innerHTML = await this.renderResumen();
            }
        }
    }
}
```

#### **7.2 Optimizaciones y Loading States (15 min)**
```javascript
// js/app.js - Loading states (equivale a loading spinners en React)
class AppState {
    render() {
        // Mostrar loading global si es necesario
        if (this.state.loading) {
            this.showGlobalLoading();
        } else {
            this.hideGlobalLoading();
        }
        
        // Llamar al renderizador principal
        if (renderer) {
            renderer.render(this.state);
        }
    }
    
    showGlobalLoading() {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `
                <div class="loading-overlay">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Cargando...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }
    
    hideGlobalLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// CSS para loading
/* Agregar a components.css */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    background: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## 📊 **RESUMEN DE MÓDULOS FRONTEND**

| Módulo | Funcionalidad | Tiempo | Equivalencia React v1 |
|--------|---------------|--------|------------------------|
| **1** | Estructura Base | 45 min | Create React App setup |
| **2** | Estado + Componentes | 60 min | useState + Components |
| **3** | Autenticación | 45 min | AuthContext + useAuth |
| **4** | Dashboard + Tabs | 75 min | Dashboard + Tab components |
| **5** | CRUD + Simulador | 60 min | CRUD components + API |
| **6** | Estilos CSS | 45 min | Tailwind + shadcn/ui |
| **7** | Optimización | 30 min | useEffect + Performance |

### **⏱️ TIEMPO TOTAL: 6 horas**

---

## 🚀 **Ventajas vs v1 React + CRA**

### **✅ HTML + Vanilla JS (v2) Ventajas:**
- 🟢 **Carga rápida**: Sin bundle, sin dependencies
- 🟢 **Simple debugging**: F12 directo, sin source maps
- 🟢 **Deploy instantáneo**: Solo archivos estáticos
- 🟢 **Compatible everywhere**: No transpiling necesario
- 🟢 **Tamaño mínimo**: ~20KB vs 2MB+ bundle React
- 🟢 **Control total**: Sin abstracciones, código directo

### **❌ v1 (React + CRA) Problemas:**
- 🔴 Bundle size gigante (2MB+)
- 🔴 Build process complejo
- 🔴 Dependency hell (node_modules)
- 🔴 Hot reload issues
- 🔴 Debugging complejo con source maps

---

## 🎯 **Resultado Final:**
Una aplicación **funcionalmente idéntica** a la v1 pero con:
- ✅ **Menor complejidad**: HTML puro vs React
- ✅ **Mejor performance**: Sin framework overhead
- ✅ **Deploy más simple**: Archivos estáticos vs build process
- ✅ **Misma funcionalidad**: Login, CRUD, Dashboard, Simulador

#### **1.1 Configuración inicial**
```
frontend/
├── index.html              # Página principal (login/registro)
├── dashboard.html          # Panel principal
├── css/
│   ├── main.css           # Estilos principales
│   ├── components.css     # Componentes reutilizables
│   └── responsive.css     # Media queries
├── js/
│   ├── app.js            # Configuración principal
│   ├── auth.js           # Autenticación
│   ├── dashboard.js      # Lógica del dashboard
│   ├── components.js     # Componentes reutilizables
│   └── utils.js          # Funciones auxiliares
└── assets/
    ├── icons/            # Iconos SVG
    └── images/           # Imágenes
```

#### **1.2 index.html - Estructura base**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión Financiera v2</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <div id="app">
        <!-- Contenedor principal dinámico -->
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/app.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/utils.js"></script>
</body>
</html>
```

### **Fase 2: Sistema de Componentes (60 min)**

#### **2.1 Sistema de Templates**
```javascript
// js/components.js
class ComponentManager {
    static templates = {
        loginForm: `
            <div class="auth-container">
                <form id="loginForm" class="auth-form">
                    <h2>Iniciar Sesión</h2>
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Contraseña" required>
                    <button type="submit">Ingresar</button>
                    <p>¿No tienes cuenta? <a href="#" onclick="showRegister()">Regístrate</a></p>
                </form>
            </div>
        `,
        
        dashboard: `
            <div class="dashboard">
                <header class="dashboard-header">
                    <h1>Mi Dashboard Financiero</h1>
                    <button id="logoutBtn">Cerrar Sesión</button>
                </header>
                
                <div class="dashboard-tabs">
                    <button class="tab active" data-tab="resumen">Resumen</button>
                    <button class="tab" data-tab="ingresos">Ingresos</button>
                    <button class="tab" data-tab="gastos">Gastos</button>
                    <button class="tab" data-tab="simulador">Simulador</button>
                </div>
                
                <div id="tab-content" class="tab-content">
                    <!-- Contenido dinámico -->
                </div>
            </div>
        `
    };
    
    static render(template, data = {}) {
        let html = this.templates[template];
        
        // Reemplazar variables {{variable}}
        for (const [key, value] of Object.entries(data)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        
        return html;
    }
}
```

#### **2.2 Sistema de Estado**
```javascript
// js/app.js
class AppState {
    constructor() {
        this.user = null;
        this.currentTab = 'resumen';
        this.data = {
            ingresos: [],
            gastos: [],
            balance: null
        };
        this.listeners = {};
    }
    
    setState(key, value) {
        this.data[key] = value;
        this.notifyListeners(key, value);
    }
    
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }
    
    notifyListeners(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    }
}

const appState = new AppState();
```

### **Fase 3: Autenticación (45 min)**

#### **3.1 Configuración Supabase**
```javascript
// js/app.js - Configuración
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

#### **3.2 Sistema de autenticación**
```javascript
// js/auth.js
class AuthManager {
    static async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            appState.user = data.user;
            this.redirectToDashboard();
            
        } catch (error) {
            this.showError('Error al iniciar sesión: ' + error.message);
        }
    }
    
    static async register(email, password, userData) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            // Crear perfil de usuario
            await this.createUserProfile(data.user.id, userData);
            
            this.showMessage('¡Registro exitoso! Revisa tu email para confirmar.');
            
        } catch (error) {
            this.showError('Error al registrarse: ' + error.message);
        }
    }
    
    static async logout() {
        await supabase.auth.signOut();
        appState.user = null;
        this.redirectToLogin();
    }
    
    static redirectToDashboard() {
        document.getElementById('app').innerHTML = ComponentManager.render('dashboard');
        DashboardManager.init();
    }
    
    static redirectToLogin() {
        document.getElementById('app').innerHTML = ComponentManager.render('loginForm');
        this.setupLoginForm();
    }
}
```

### **Fase 4: Dashboard y CRUD (90 min)**

#### **4.1 Manager del Dashboard**
```javascript
// js/dashboard.js
class DashboardManager {
    static init() {
        this.setupTabs();
        this.setupLogout();
        this.loadInitialData();
        this.showTab('resumen');
    }
    
    static setupTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });
    }
    
    static async showTab(tabName) {
        // Actualizar tabs activos
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Renderizar contenido
        const content = document.getElementById('tab-content');
        
        switch(tabName) {
            case 'resumen':
                content.innerHTML = await this.renderResumen();
                break;
            case 'ingresos':
                content.innerHTML = this.renderIngresos();
                this.setupIngresosForm();
                break;
            case 'gastos':
                content.innerHTML = this.renderGastos();
                this.setupGastosForm();
                break;
            case 'simulador':
                content.innerHTML = this.renderSimulador();
                this.setupSimuladorForm();
                break;
        }
        
        appState.currentTab = tabName;
    }
    
    static async renderResumen() {
        const balance = await this.getBalanceActual();
        const ingresos = await this.getIngresosRecientes();
        const gastos = await this.getGastosRecientes();
        
        return `
            <div class="resumen-cards">
                <div class="card balance-card">
                    <h3>Balance Actual</h3>
                    <div class="balance-amount ${balance >= 0 ? 'positive' : 'negative'}">
                        $${balance.toLocaleString()}
                    </div>
                </div>
                
                <div class="card">
                    <h3>Ingresos del Mes</h3>
                    <div class="amount positive">$${ingresos.total.toLocaleString()}</div>
                    <small>${ingresos.count} transacciones</small>
                </div>
                
                <div class="card">
                    <h3>Gastos del Mes</h3>
                    <div class="amount negative">$${gastos.total.toLocaleString()}</div>
                    <small>${gastos.count} transacciones</small>
                </div>
            </div>
            
            <div class="recent-transactions">
                <h3>Transacciones Recientes</h3>
                <div id="recent-list">
                    ${this.renderRecentTransactions(ingresos.items, gastos.items)}
                </div>
            </div>
        `;
    }
}
```

#### **4.2 CRUD Operations**
```javascript
// js/dashboard.js - Continúa...
class DataManager {
    static async getIngresos() {
        const { data, error } = await supabase
            .from('ingresos')
            .select('*')
            .eq('usuario_id', appState.user.id)
            .order('fecha', { ascending: false });
            
        if (error) throw error;
        return data;
    }
    
    static async addIngreso(ingreso) {
        const { data, error } = await supabase
            .from('ingresos')
            .insert([{
                ...ingreso,
                usuario_id: appState.user.id
            }]);
            
        if (error) throw error;
        
        // Actualizar estado local
        await this.refreshData();
    }
    
    static async updateIngreso(id, changes) {
        const { data, error } = await supabase
            .from('ingresos')
            .update(changes)
            .eq('id', id)
            .eq('usuario_id', appState.user.id);
            
        if (error) throw error;
        await this.refreshData();
    }
    
    static async deleteIngreso(id) {
        const { data, error } = await supabase
            .from('ingresos')
            .delete()
            .eq('id', id)
            .eq('usuario_id', appState.user.id);
            
        if (error) throw error;
        await this.refreshData();
    }
}
```

### **Fase 5: Estilos y Responsividad (60 min)**

#### **5.1 CSS Variables y Base**
```css
/* css/main.css */
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #059669;
    --error-color: #dc2626;
    --warning-color: #d97706;
    
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    
    --border-radius: 8px;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}
```

#### **5.2 Componentes CSS**
```css
/* css/components.css */
.card {
    background: var(--bg-primary);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    border: 1px solid #e2e8f0;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

### **Fase 6: Funcionalidades Avanzadas (45 min)**

#### **6.1 Simulador de Crédito**
```javascript
// js/dashboard.js - Simulador
class CreditSimulator {
    static calculate(monto, tasa, plazo) {
        const tasaMensual = tasa / 100 / 12;
        const cuotaMensual = (monto * tasaMensual * Math.pow(1 + tasaMensual, plazo)) / 
                           (Math.pow(1 + tasaMensual, plazo) - 1);
        const totalPagar = cuotaMensual * plazo;
        const totalIntereses = totalPagar - monto;
        
        return {
            cuotaMensual: Math.round(cuotaMensual),
            totalIntereses: Math.round(totalIntereses),
            totalPagar: Math.round(totalPagar)
        };
    }
    
    static renderTable(monto, tasa, plazo) {
        const tasaMensual = tasa / 100 / 12;
        const cuotaMensual = this.calculate(monto, tasa, plazo).cuotaMensual;
        let saldo = monto;
        
        let html = `
            <table class="amortization-table">
                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>Cuota</th>
                        <th>Interés</th>
                        <th>Capital</th>
                        <th>Saldo</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        for (let i = 1; i <= plazo; i++) {
            const interes = saldo * tasaMensual;
            const capital = cuotaMensual - interes;
            saldo -= capital;
            
            html += `
                <tr>
                    <td>${i}</td>
                    <td>$${cuotaMensual.toLocaleString()}</td>
                    <td>$${Math.round(interes).toLocaleString()}</td>
                    <td>$${Math.round(capital).toLocaleString()}</td>
                    <td>$${Math.round(saldo).toLocaleString()}</td>
                </tr>
            `;
        }
        
        html += `</tbody></table>`;
        return html;
    }
}
```

### **Fase 7: PWA y Optimización (30 min)**

#### **7.1 Service Worker**
```javascript
// sw.js
const CACHE_NAME = 'gestion-financiera-v1';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/css/components.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/dashboard.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
```

## 🎯 **Características Principales**

### **✅ Completamente Funcional**
- ✅ Autenticación completa (login/register/logout)
- ✅ Dashboard interactivo con tabs
- ✅ CRUD completo para ingresos y gastos
- ✅ Simulador de crédito avanzado
- ✅ Resumen financiero en tiempo real
- ✅ Responsive design

### **✅ Arquitectura Modular**
- ✅ Componentes reutilizables
- ✅ Estado centralizado
- ✅ Separación de responsabilidades
- ✅ Fácil mantenimiento

### **✅ UX/UI Profesional**
- ✅ Diseño limpio y moderno
- ✅ Transiciones suaves
- ✅ Feedback visual
- ✅ Accesibilidad

## 📊 **Tiempo Total Estimado: 5.5 horas**

### **Desglose por Fases:**
1. **Estructura Base**: 45 min
2. **Componentes**: 60 min  
3. **Autenticación**: 45 min
4. **Dashboard/CRUD**: 90 min
5. **Estilos**: 60 min
6. **Funcionalidades**: 45 min
7. **PWA**: 30 min

---

**🎯 Siguiente:** Ver `METODOLOGIA_DESARROLLO.md`
