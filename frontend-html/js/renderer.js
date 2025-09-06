// js/renderer.js - Renderizador Principal (equivale a ReactDOM.render + Virtual DOM)

class AppRenderer {
    constructor() {
        this.currentView = null;
        this.viewCache = new Map();
        this.eventListeners = new Map();
        this.renderQueue = [];
        this.isRendering = false;
        
        console.log('🎨 AppRenderer inicializado');
    }
    
    // Conectar con AppState (equivale a conectar con Context)
    connectToState(appState) {
        this.appState = appState;
        
        // Sobrescribir el método render de AppState
        appState.render = () => this.scheduleRender();
        
        // Suscribirse a cambios importantes
        appState.subscribe('currentView', (view) => {
            console.log('🎨 Vista cambió a:', view);
            this.scheduleRender();
        });
        
        appState.subscribe('*', (path, value) => {
            // Solo re-renderizar en cambios importantes para performance
            const importantPaths = ['currentView', 'currentTab', 'isAuthenticated', 'modals', 'notifications'];
            const isImportant = importantPaths.some(p => path.startsWith(p));
            
            if (isImportant) {
                this.scheduleRender();
            }
        });
        
        console.log('🔗 Renderer conectado a AppState');
    }
    
    // Programar render (equivale a React's reconciliation)
    scheduleRender() {
        if (this.isRendering) {
            console.log('⏳ Render ya en progreso, agregando a cola');
            if (!this.renderQueue.length) {
                this.renderQueue.push(true);
            }
            return;
        }
        
        // Usar requestAnimationFrame para performance (equivale a React Fiber)
        requestAnimationFrame(() => {
            this.render();
            
            // Procesar cola si hay renders pendientes
            if (this.renderQueue.length > 0) {
                this.renderQueue = [];
                this.scheduleRender();
            }
        });
    }
    
    // Render principal (equivale a ReactDOM.render)
    async render() {
        if (!this.appState) {
            console.error('❌ AppState no conectado al renderer');
            return;
        }
        
        this.isRendering = true;
        
        try {
            const currentView = this.appState.getState('currentView');
            console.log(`🎨 Renderizando vista: ${currentView}`);
            
            // Limpiar event listeners anteriores
            this.cleanupEventListeners();
            
            // Obtener HTML de la vista
            const viewHTML = await this.renderView(currentView);
            
            // Actualizar DOM
            const appElement = document.getElementById('app');
            if (appElement) {
                appElement.innerHTML = viewHTML;
                
                // Configurar event listeners
                this.setupEventListeners();
                
                // Render de overlays globales
                this.renderGlobalOverlays();
                
                // Render de notificaciones
                this.renderNotifications();
                
                this.currentView = currentView;
                console.log('✅ Vista renderizada:', currentView);
            } else {
                console.error('❌ Elemento #app no encontrado');
            }
            
        } catch (error) {
            console.error('❌ Error en render:', error);
            this.renderErrorView(error);
        } finally {
            this.isRendering = false;
        }
    }
    
    // Renderizar vista específica
    async renderView(viewName) {
        console.log(`🎨 Generando HTML para vista: ${viewName}`);
        
        switch (viewName) {
            case 'loading':
                return this.renderLoadingView();
                
            case 'login':
                return this.renderLoginView();
                
            case 'register':
                return this.renderRegisterView();
                
            case 'dashboard':
                return this.renderDashboardView();
                
            default:
                console.warn(`⚠️ Vista desconocida: ${viewName}`);
                return this.render404View();
        }
    }
    
    // ===== VISTAS ESPECÍFICAS =====
    
    renderLoadingView() {
        return componentSystem.render('Loading', {
            message: 'Inicializando aplicación...'
        });
    }
    
    renderLoginView() {
        const loginForm = this.appState.getState('forms.login');
        const errors = this.appState.getState('errors');
        
        return componentSystem.render('Container', { className: 'auth-container' }, `
            ${componentSystem.render('Card', { title: 'Iniciar Sesión', className: 'auth-card' }, `
                <form id="login-form" class="auth-form">
                    ${componentSystem.render('FormGroup', { 
                        label: 'Email', 
                        error: errors.email || '',
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'email',
                            id: 'login-email',
                            name: 'email',
                            value: loginForm.email,
                            placeholder: 'tu@email.com',
                            required: true
                        })
                    )}
                    
                    ${componentSystem.render('FormGroup', { 
                        label: 'Contraseña', 
                        error: errors.password || '',
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'password',
                            id: 'login-password',
                            name: 'password',
                            value: loginForm.password,
                            placeholder: '••••••••',
                            required: true
                        })
                    )}
                    
                    <div class="auth-actions">
                        ${componentSystem.render('Button', { 
                            type: 'submit', 
                            variant: 'primary',
                            className: 'auth-submit'
                        }, 'Iniciar Sesión')}
                    </div>
                </form>
                
                <div class="auth-footer">
                    <p>¿No tienes cuenta?</p>
                    ${componentSystem.render('Button', { 
                        variant: 'link',
                        id: 'switch-to-register'
                    }, 'Registrarse')}
                </div>
            `)}
        `);
    }
    
    renderRegisterView() {
        const registerForm = this.appState.getState('forms.register');
        const errors = this.appState.getState('errors');
        
        return componentSystem.render('Container', { className: 'auth-container' }, `
            ${componentSystem.render('Card', { title: 'Crear Cuenta', className: 'auth-card' }, `
                <form id="register-form" class="auth-form">
                    ${componentSystem.render('Grid', { cols: 2, gap: 'sm' }, `
                        ${componentSystem.render('FormGroup', { 
                            label: 'Nombre', 
                            error: errors.nombre || '',
                            required: true 
                        }, 
                            componentSystem.render('Input', {
                                type: 'text',
                                id: 'register-nombre',
                                name: 'nombre',
                                value: registerForm.nombre,
                                placeholder: 'Juan',
                                required: true
                            })
                        )}
                        
                        ${componentSystem.render('FormGroup', { 
                            label: 'Apellido', 
                            error: errors.apellido || '',
                            required: true 
                        }, 
                            componentSystem.render('Input', {
                                type: 'text',
                                id: 'register-apellido',
                                name: 'apellido',
                                value: registerForm.apellido,
                                placeholder: 'Pérez',
                                required: true
                            })
                        )}
                    `)}
                    
                    ${componentSystem.render('Grid', { cols: 2, gap: 'sm' }, `
                        ${componentSystem.render('FormGroup', { 
                            label: 'DNI', 
                            error: errors.dni || '',
                            required: true 
                        }, 
                            componentSystem.render('Input', {
                                type: 'text',
                                id: 'register-dni',
                                name: 'dni',
                                value: registerForm.dni,
                                placeholder: '12345678',
                                required: true
                            })
                        )}
                        
                        ${componentSystem.render('FormGroup', { 
                            label: 'Edad', 
                            error: errors.edad || '',
                            required: true 
                        }, 
                            componentSystem.render('Input', {
                                type: 'number',
                                id: 'register-edad',
                                name: 'edad',
                                value: registerForm.edad,
                                placeholder: '25',
                                required: true,
                                min: '18',
                                max: '100'
                            })
                        )}
                    `)}
                    
                    ${componentSystem.render('FormGroup', { 
                        label: 'Email', 
                        error: errors.email || '',
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'email',
                            id: 'register-email',
                            name: 'email',
                            value: registerForm.email,
                            placeholder: 'tu@email.com',
                            required: true
                        })
                    )}
                    
                    ${componentSystem.render('FormGroup', { 
                        label: 'Contraseña', 
                        error: errors.password || '',
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'password',
                            id: 'register-password',
                            name: 'password',
                            value: registerForm.password,
                            placeholder: '••••••••',
                            required: true
                        })
                    )}
                    
                    ${componentSystem.render('FormGroup', { 
                        label: 'Confirmar Contraseña', 
                        error: errors.confirmPassword || '',
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'password',
                            id: 'register-confirm-password',
                            name: 'confirmPassword',
                            value: registerForm.confirmPassword,
                            placeholder: '••••••••',
                            required: true
                        })
                    )}
                    
                    <div class="auth-actions">
                        ${componentSystem.render('Button', { 
                            type: 'submit', 
                            variant: 'primary',
                            className: 'auth-submit'
                        }, 'Crear Cuenta')}
                    </div>
                </form>
                
                <div class="auth-footer">
                    <p>¿Ya tienes cuenta?</p>
                    ${componentSystem.render('Button', { 
                        variant: 'link',
                        id: 'switch-to-login'
                    }, 'Iniciar Sesión')}
                </div>
            `)}
        `);
    }
    
    renderDashboardView() {
        const currentTab = this.appState.getState('currentTab');
        const user = this.appState.getState('user');
        
        const tabs = [
            { id: 'resumen', label: 'Resumen', icon: '📊' },
            { id: 'ingresos', label: 'Ingresos', icon: '💰' },
            { id: 'gastos', label: 'Gastos', icon: '💸' },
            { id: 'simulador', label: 'Simulador', icon: '🏦' },
            { id: 'perfil', label: 'Perfil', icon: '👤' }
        ];
        
        return `
            <div class="dashboard-layout">
                <!-- Header -->
                <header class="dashboard-header">
                    <div class="header-content">
                        <h1 class="app-title">💳 Gestión Financiera</h1>
                        <div class="header-actions">
                            <span class="user-greeting">Hola, ${user?.email || 'Usuario'}</span>
                            ${componentSystem.render('Button', { 
                                variant: 'ghost',
                                id: 'logout-btn'
                            }, 'Salir 🚪')}
                        </div>
                    </div>
                </header>
                
                <!-- Navigation Tabs -->
                <nav class="dashboard-nav">
                    ${componentSystem.render('Tabs', { 
                        activeTab: currentTab,
                        tabs: tabs,
                        onTabChange: 'window.appActions.switchTab'
                    })}
                </nav>
                
                <!-- Main Content -->
                <main class="dashboard-main">
                    <div class="dashboard-content">
                        ${this.renderTabContent(currentTab)}
                    </div>
                </main>
            </div>
        `;
    }
    
    renderTabContent(tabName) {
        switch (tabName) {
            case 'resumen':
                return this.renderResumenTab();
            case 'ingresos':
                return this.renderIngresosTab();
            case 'gastos':
                return this.renderGastosTab();
            case 'simulador':
                return this.renderSimuladorTab();
            case 'perfil':
                return this.renderPerfilTab();
            default:
                return '<p>Tab no implementado</p>';
        }
    }
    
    renderResumenTab() {
        const resumen = this.appState.getState('data.resumen');
        
        return `
            <div class="resumen-tab">
                <h2>📊 Resumen Financiero</h2>
                
                ${componentSystem.render('Grid', { cols: 3, gap: 'lg' }, `
                    ${componentSystem.render('Card', { title: 'Balance Actual', className: 'summary-card balance-card' }, `
                        <div class="summary-value">$${resumen.balanceActual.toLocaleString()}</div>
                        <div class="summary-label">Balance Total</div>
                    `)}
                    
                    ${componentSystem.render('Card', { title: 'Ingresos', className: 'summary-card income-card' }, `
                        <div class="summary-value">$${resumen.totalIngresos.toLocaleString()}</div>
                        <div class="summary-label">Este Mes</div>
                    `)}
                    
                    ${componentSystem.render('Card', { title: 'Gastos', className: 'summary-card expense-card' }, `
                        <div class="summary-value">$${resumen.totalGastos.toLocaleString()}</div>
                        <div class="summary-label">Este Mes</div>
                    `)}
                `)}
                
                <div class="mt-8">
                    <h3>Acciones Rápidas</h3>
                    <div class="quick-actions">
                        ${componentSystem.render('Button', { 
                            variant: 'primary',
                            id: 'quick-add-income'
                        }, '+ Agregar Ingreso')}
                        
                        ${componentSystem.render('Button', { 
                            variant: 'secondary',
                            id: 'quick-add-expense'
                        }, '+ Agregar Gasto')}
                        
                        ${componentSystem.render('Button', { 
                            variant: 'outline',
                            id: 'quick-simulate'
                        }, '🏦 Simular Crédito')}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderIngresosTab() {
        const ingresos = this.appState.getState('data.ingresos') || [];
        const categorias = window.dataService.getCategorias().ingresos;
        const isLoading = window.businessActions.isActionLoading('load-ingresos');
        
        return `
            <div class="ingresos-tab">
                <div class="tab-header">
                    <h2>💰 Gestión de Ingresos</h2>
                    ${componentSystem.render('Button', { 
                        variant: 'primary',
                        id: 'add-ingreso-btn'
                    }, '+ Agregar Ingreso')}
                </div>
                
                ${ingresos.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">💰</div>
                        <h3>No tienes ingresos registrados</h3>
                        <p>Comienza agregando tu primer ingreso para llevar control de tus finanzas</p>
                        ${componentSystem.render('Button', { 
                            variant: 'primary',
                            id: 'add-first-ingreso'
                        }, 'Agregar Primer Ingreso')}
                    </div>
                ` : `
                    <div class="ingresos-stats">
                        ${componentSystem.render('Grid', { cols: 3, gap: 'md' }, `
                            ${componentSystem.render('Card', { className: 'stat-card' }, `
                                <div class="stat-value">${window.dataService.formatCurrency(ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0))}</div>
                                <div class="stat-label">Total Ingresos</div>
                            `)}
                            
                            ${componentSystem.render('Card', { className: 'stat-card' }, `
                                <div class="stat-value">${ingresos.length}</div>
                                <div class="stat-label">Registros</div>
                            `)}
                            
                            ${componentSystem.render('Card', { className: 'stat-card' }, `
                                <div class="stat-value">${window.dataService.formatCurrency(ingresos.length ? ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0) / ingresos.length : 0)}</div>
                                <div class="stat-label">Promedio</div>
                            `)}
                        `)}
                    </div>
                    
                    <div class="ingresos-table">
                        ${componentSystem.render('DataTable', {
                            data: ingresos,
                            columns: [
                                { key: 'fecha', label: 'Fecha', type: 'date' },
                                { key: 'descripcion', label: 'Descripción' },
                                { key: 'categoria', label: 'Categoría', render: (value) => {
                                    const cat = categorias.find(c => c.value === value);
                                    return cat ? `${cat.icon} ${cat.label}` : value;
                                }},
                                { key: 'monto', label: 'Monto', type: 'currency' },
                                { key: 'actions', label: 'Acciones', render: (value, item) => `
                                    <div class="table-actions">
                                        <button class="btn-icon edit-ingreso" data-id="${item.id}" title="Editar">✏️</button>
                                        <button class="btn-icon delete-ingreso" data-id="${item.id}" title="Eliminar">🗑️</button>
                                    </div>
                                `}
                            ],
                            className: 'ingresos-data-table'
                        })}
                    </div>
                `}
                
                ${this.renderIngresoModal()}
            </div>
        `;
    }
    
    renderGastosTab() {
        const gastos = this.appState.getState('data.gastos') || [];
        const categorias = window.dataService.getCategorias().gastos;
        
        return `
            <div class="gastos-tab">
                <div class="tab-header">
                    <h2>💸 Gestión de Gastos</h2>
                    ${componentSystem.render('Button', { 
                        variant: 'primary',
                        id: 'add-gasto-btn'
                    }, '+ Agregar Gasto')}
                </div>
                
                ${gastos.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">💸</div>
                        <h3>No tienes gastos registrados</h3>
                        <p>Comienza agregando tus gastos para llevar control de tus finanzas</p>
                        ${componentSystem.render('Button', { 
                            variant: 'primary',
                            id: 'add-first-gasto'
                        }, 'Agregar Primer Gasto')}
                    </div>
                ` : `
                    <div class="gastos-stats">
                        ${componentSystem.render('Grid', { cols: 3, gap: 'md' }, `
                            ${componentSystem.render('Card', { className: 'stat-card' }, `
                                <div class="stat-value">${window.dataService.formatCurrency(gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0))}</div>
                                <div class="stat-label">Total Gastos</div>
                            `)}
                            
                            ${componentSystem.render('Card', { className: 'stat-card' }, `
                                <div class="stat-value">${gastos.length}</div>
                                <div class="stat-label">Registros</div>
                            `)}
                            
                            ${componentSystem.render('Card', { className: 'stat-card' }, `
                                <div class="stat-value">${window.dataService.formatCurrency(gastos.length ? gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0) / gastos.length : 0)}</div>
                                <div class="stat-label">Promedio</div>
                            `)}
                        `)}
                    </div>
                    
                    <div class="gastos-table">
                        ${componentSystem.render('DataTable', {
                            data: gastos,
                            columns: [
                                { key: 'fecha', label: 'Fecha', type: 'date' },
                                { key: 'descripcion', label: 'Descripción' },
                                { key: 'categoria', label: 'Categoría', render: (value) => {
                                    const cat = categorias.find(c => c.value === value);
                                    return cat ? `${cat.icon} ${cat.label}` : value;
                                }},
                                { key: 'monto', label: 'Monto', type: 'currency' },
                                { key: 'actions', label: 'Acciones', render: (value, item) => `
                                    <div class="table-actions">
                                        <button class="btn-icon edit-gasto" data-id="${item.id}" title="Editar">✏️</button>
                                        <button class="btn-icon delete-gasto" data-id="${item.id}" title="Eliminar">🗑️</button>
                                    </div>
                                `}
                            ],
                            className: 'gastos-data-table'
                        })}
                    </div>
                `}
                
                ${this.renderGastoModal()}
            </div>
        `;
    }
    
    renderSimuladorTab() {
        const simuladorForm = this.appState.getState('forms.simulador');
        const simulaciones = this.appState.getState('data.simulaciones') || [];
        
        return `
            <div class="simulador-tab">
                <div class="tab-header">
                    <h2>🏦 Simulador de Crédito</h2>
                </div>
                
                ${componentSystem.render('Grid', { cols: 2, gap: 'lg', className: 'simulador-layout' }, `
                    <!-- Formulario de Simulación -->
                    <div class="simulador-form-section">
                        ${componentSystem.render('Card', { title: 'Nueva Simulación' }, `
                            <form id="simulador-form">
                                ${componentSystem.render('FormGroup', { 
                                    label: 'Monto del Crédito', 
                                    required: true 
                                }, 
                                    componentSystem.render('Input', {
                                        type: 'number',
                                        id: 'simulador-monto',
                                        name: 'monto',
                                        value: simuladorForm.monto,
                                        placeholder: '100000',
                                        min: '1000',
                                        step: '1000',
                                        required: true
                                    })
                                )}
                                
                                ${componentSystem.render('FormGroup', { 
                                    label: 'Tasa de Interés Anual (%)', 
                                    required: true 
                                }, 
                                    componentSystem.render('Input', {
                                        type: 'number',
                                        id: 'simulador-tasa',
                                        name: 'tasa',
                                        value: simuladorForm.tasa,
                                        placeholder: '25.5',
                                        min: '0',
                                        max: '100',
                                        step: '0.1',
                                        required: true
                                    })
                                )}
                                
                                ${componentSystem.render('FormGroup', { 
                                    label: 'Plazo (meses)', 
                                    required: true 
                                }, 
                                    componentSystem.render('Input', {
                                        type: 'number',
                                        id: 'simulador-plazo',
                                        name: 'plazo',
                                        value: simuladorForm.plazo,
                                        placeholder: '12',
                                        min: '1',
                                        max: '360',
                                        required: true
                                    })
                                )}
                                
                                <div class="simulador-actions">
                                    ${componentSystem.render('Button', { 
                                        type: 'button', 
                                        variant: 'primary',
                                        id: 'calculate-simulation'
                                    }, '🧮 Calcular')}
                                    
                                    ${simuladorForm.resultado ? componentSystem.render('Button', { 
                                        type: 'button', 
                                        variant: 'secondary',
                                        id: 'save-simulation'
                                    }, '💾 Guardar') : ''}
                                </div>
                            </form>
                        `)}
                    </div>
                    
                    <!-- Resultados -->
                    <div class="simulador-results-section">
                        ${simuladorForm.resultado ? `
                            ${componentSystem.render('Card', { title: 'Resultado de la Simulación', className: 'result-card' }, `
                                <div class="simulation-summary">
                                    <div class="result-item">
                                        <span class="result-label">Monto Solicitado:</span>
                                        <span class="result-value">${window.dataService.formatCurrency(simuladorForm.resultado.monto)}</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Cuota Mensual:</span>
                                        <span class="result-value highlight">${window.dataService.formatCurrency(simuladorForm.resultado.cuotaMensual)}</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Total a Pagar:</span>
                                        <span class="result-value">${window.dataService.formatCurrency(simuladorForm.resultado.totalAPagar)}</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Total Intereses:</span>
                                        <span class="result-value">${window.dataService.formatCurrency(simuladorForm.resultado.totalIntereses)}</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Plazo:</span>
                                        <span class="result-value">${simuladorForm.resultado.plazoMeses} meses</span>
                                    </div>
                                    <div class="result-item">
                                        <span class="result-label">Tasa:</span>
                                        <span class="result-value">${simuladorForm.resultado.tasaAnual}% anual</span>
                                    </div>
                                </div>
                                
                                ${simuladorForm.resultado.tablaAmortizacion && simuladorForm.resultado.tablaAmortizacion.length > 0 ? `
                                    <div class="amortization-preview">
                                        <h4>Vista previa de cuotas (primeras 12)</h4>
                                        <div class="amortization-table">
                                            <div class="amortization-header">
                                                <span>Mes</span>
                                                <span>Capital</span>
                                                <span>Interés</span>
                                                <span>Saldo</span>
                                            </div>
                                            ${simuladorForm.resultado.tablaAmortizacion.map(row => `
                                                <div class="amortization-row">
                                                    <span>${row.mes}</span>
                                                    <span>${window.dataService.formatCurrency(row.capital)}</span>
                                                    <span>${window.dataService.formatCurrency(row.interes)}</span>
                                                    <span>${window.dataService.formatCurrency(row.saldo)}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            `)}
                        ` : `
                            ${componentSystem.render('Card', { title: 'Instrucciones' }, `
                                <div class="instructions">
                                    <h4>¿Cómo usar el simulador?</h4>
                                    <ol>
                                        <li>Ingresa el <strong>monto</strong> que deseas solicitar</li>
                                        <li>Especifica la <strong>tasa de interés anual</strong> (puedes consultar con tu banco)</li>
                                        <li>Define el <strong>plazo en meses</strong> para pagar</li>
                                        <li>Haz clic en <strong>"Calcular"</strong> para ver los resultados</li>
                                        <li>Opcionalmente puedes <strong>guardar</strong> la simulación para consultarla más tarde</li>
                                    </ol>
                                    
                                    <div class="tips">
                                        <h4>💡 Consejos:</h4>
                                        <ul>
                                            <li>A mayor plazo, menor cuota pero más intereses totales</li>
                                            <li>Compara diferentes opciones antes de decidir</li>
                                            <li>Considera que tu cuota no supere el 30% de tus ingresos</li>
                                        </ul>
                                    </div>
                                </div>
                            `)}
                        `}
                    </div>
                `)}
                
                <!-- Historial de Simulaciones -->
                ${simulaciones.length > 0 ? `
                    <div class="simulaciones-history">
                        <h3>📋 Simulaciones Guardadas</h3>
                        
                        ${componentSystem.render('DataTable', {
                            data: simulaciones.slice(0, 10), // Mostrar últimas 10
                            columns: [
                                { key: 'fecha_simulacion', label: 'Fecha', type: 'date' },
                                { key: 'monto', label: 'Monto', type: 'currency' },
                                { key: 'tasa', label: 'Tasa', render: (value) => `${value}%` },
                                { key: 'plazo', label: 'Plazo', render: (value) => `${value} meses` },
                                { key: 'cuota_mensual', label: 'Cuota', type: 'currency' },
                                { key: 'actions', label: 'Acciones', render: (value, item) => `
                                    <button class="btn-icon delete-simulation" data-id="${item.id}" title="Eliminar">🗑️</button>
                                `}
                            ],
                            className: 'simulaciones-table'
                        })}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderPerfilTab() {
        const perfil = this.appState.getState('data.perfilUsuario');
        const user = this.appState.getState('user');
        
        return `
            <div class="perfil-tab">
                <div class="tab-header">
                    <h2>👤 Mi Perfil</h2>
                    ${componentSystem.render('Button', { 
                        variant: 'primary',
                        id: 'edit-profile-btn'
                    }, 'Editar Perfil')}
                </div>
                
                ${componentSystem.render('Grid', { cols: 2, gap: 'lg' }, `
                    <!-- Información Personal -->
                    <div class="profile-section">
                        ${componentSystem.render('Card', { title: 'Información Personal' }, `
                            ${perfil ? `
                                <div class="profile-info">
                                    <div class="profile-avatar">
                                        <div class="avatar-circle">
                                            ${(perfil.nombre ? perfil.nombre.charAt(0) : user.email.charAt(0)).toUpperCase()}
                                        </div>
                                    </div>
                                    
                                    <div class="profile-details">
                                        <div class="detail-item">
                                            <span class="detail-label">Nombre:</span>
                                            <span class="detail-value">${perfil.nombre || '-'} ${perfil.apellido || ''}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Email:</span>
                                            <span class="detail-value">${user.email}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">DNI:</span>
                                            <span class="detail-value">${perfil.dni || '-'}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Edad:</span>
                                            <span class="detail-value">${perfil.edad || '-'} años</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">Miembro desde:</span>
                                            <span class="detail-value">${window.dataService.formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="profile-empty">
                                    <div class="empty-icon">👤</div>
                                    <h3>Completa tu perfil</h3>
                                    <p>Agrega tu información personal para una mejor experiencia</p>
                                    ${componentSystem.render('Button', { 
                                        variant: 'primary',
                                        id: 'complete-profile-btn'
                                    }, 'Completar Perfil')}
                                </div>
                            `}
                        `)}
                    </div>
                    
                    <!-- Estadísticas -->
                    <div class="stats-section">
                        ${componentSystem.render('Card', { title: 'Estadísticas de Uso' }, `
                            <div class="usage-stats">
                                ${this.renderUsageStats()}
                            </div>
                        `)}
                        
                        ${componentSystem.render('Card', { title: 'Acciones Rápidas', className: 'mt-4' }, `
                            <div class="quick-profile-actions">
                                ${componentSystem.render('Button', { 
                                    variant: 'outline',
                                    id: 'export-data-btn',
                                    className: 'w-full mb-2'
                                }, '📥 Exportar Mis Datos')}
                                
                                ${componentSystem.render('Button', { 
                                    variant: 'outline',
                                    id: 'clear-cache-btn',
                                    className: 'w-full mb-2'
                                }, '🔄 Limpiar Cache')}
                                
                                ${componentSystem.render('Button', { 
                                    variant: 'ghost',
                                    id: 'change-password-btn',
                                    className: 'w-full'
                                }, '🔐 Cambiar Contraseña')}
                            </div>
                        `)}
                    </div>
                `)}
                
                ${this.renderPerfilModal()}
            </div>
        `;
    }
    
    render404View() {
        return componentSystem.render('Container', { className: 'error-container' }, `
            ${componentSystem.render('Card', { title: '404 - Página no encontrada' }, `
                <p>La página que buscas no existe.</p>
                ${componentSystem.render('Button', { 
                    variant: 'primary',
                    id: 'go-home'
                }, 'Volver al inicio')}
            `)}
        `);
    }
    
    renderErrorView(error) {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = componentSystem.render('Container', { className: 'error-container' }, `
                ${componentSystem.render('Alert', { type: 'error' }, `
                    <h3>Error inesperado</h3>
                    <p>${error.message}</p>
                    ${componentSystem.render('Button', { 
                        variant: 'primary',
                        id: 'reload-app'
                    }, 'Recargar aplicación')}
                `)}
            `);
        }
    }
    
    // ===== MODALES =====
    
    renderIngresoModal() {
        const isOpen = this.appState.getState('modals.addIngreso');
        const form = this.appState.getState('forms.ingreso');
        const categorias = window.dataService.getCategorias().ingresos;
        const errors = this.appState.getState('errors') || {};
        
        return componentSystem.render('Modal', {
            isOpen,
            title: 'Agregar Ingreso',
            id: 'ingreso-modal'
        }, `
            <form id="ingreso-form">
                ${componentSystem.render('FormGroup', { 
                    label: 'Descripción', 
                    error: errors.descripcion,
                    required: true 
                }, 
                    componentSystem.render('Input', {
                        type: 'text',
                        id: 'ingreso-descripcion',
                        name: 'descripcion',
                        value: form.descripcion,
                        placeholder: 'Ej: Salario de Enero',
                        required: true
                    })
                )}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Monto', 
                    error: errors.monto,
                    required: true 
                }, 
                    componentSystem.render('Input', {
                        type: 'number',
                        id: 'ingreso-monto',
                        name: 'monto',
                        value: form.monto,
                        placeholder: '50000',
                        min: '0',
                        step: '100',
                        required: true
                    })
                )}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Categoría', 
                    error: errors.categoria,
                    required: true 
                }, `
                    <select id="ingreso-categoria" name="categoria" class="input" required>
                        <option value="">Seleccionar categoría...</option>
                        ${categorias.map(cat => `
                            <option value="${cat.value}" ${form.categoria === cat.value ? 'selected' : ''}>
                                ${cat.label}
                            </option>
                        `).join('')}
                    </select>
                `)}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Fecha', 
                    error: errors.fecha,
                    required: true 
                }, 
                    componentSystem.render('Input', {
                        type: 'date',
                        id: 'ingreso-fecha',
                        name: 'fecha',
                        value: form.fecha,
                        required: true
                    })
                )}
                
                <div class="modal-actions">
                    ${componentSystem.render('Button', { 
                        type: 'button', 
                        variant: 'ghost',
                        id: 'cancel-ingreso'
                    }, 'Cancelar')}
                    
                    ${componentSystem.render('Button', { 
                        type: 'submit', 
                        variant: 'primary'
                    }, 'Agregar Ingreso')}
                </div>
            </form>
        `);
    }
    
    renderGastoModal() {
        const isOpen = this.appState.getState('modals.addGasto');
        const form = this.appState.getState('forms.gasto');
        const categorias = window.dataService.getCategorias().gastos;
        const errors = this.appState.getState('errors') || {};
        
        return componentSystem.render('Modal', {
            isOpen,
            title: 'Agregar Gasto',
            id: 'gasto-modal'
        }, `
            <form id="gasto-form">
                ${componentSystem.render('FormGroup', { 
                    label: 'Descripción', 
                    error: errors.descripcion,
                    required: true 
                }, 
                    componentSystem.render('Input', {
                        type: 'text',
                        id: 'gasto-descripcion',
                        name: 'descripcion',
                        value: form.descripcion,
                        placeholder: 'Ej: Compras del supermercado',
                        required: true
                    })
                )}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Monto', 
                    error: errors.monto,
                    required: true 
                }, 
                    componentSystem.render('Input', {
                        type: 'number',
                        id: 'gasto-monto',
                        name: 'monto',
                        value: form.monto,
                        placeholder: '5000',
                        min: '0',
                        step: '100',
                        required: true
                    })
                )}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Categoría', 
                    error: errors.categoria,
                    required: true 
                }, `
                    <select id="gasto-categoria" name="categoria" class="input" required>
                        <option value="">Seleccionar categoría...</option>
                        ${categorias.map(cat => `
                            <option value="${cat.value}" ${form.categoria === cat.value ? 'selected' : ''}>
                                ${cat.label}
                            </option>
                        `).join('')}
                    </select>
                `)}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Fecha', 
                    error: errors.fecha,
                    required: true 
                }, 
                    componentSystem.render('Input', {
                        type: 'date',
                        id: 'gasto-fecha',
                        name: 'fecha',
                        value: form.fecha,
                        required: true
                    })
                )}
                
                <div class="modal-actions">
                    ${componentSystem.render('Button', { 
                        type: 'button', 
                        variant: 'ghost',
                        id: 'cancel-gasto'
                    }, 'Cancelar')}
                    
                    ${componentSystem.render('Button', { 
                        type: 'submit', 
                        variant: 'primary'
                    }, 'Agregar Gasto')}
                </div>
            </form>
        `);
    }
    
    renderPerfilModal() {
        const isOpen = this.appState.getState('modals.editProfile');
        const perfil = this.appState.getState('data.perfilUsuario');
        const user = this.appState.getState('user');
        
        return componentSystem.render('Modal', {
            isOpen,
            title: 'Editar Perfil',
            id: 'perfil-modal'
        }, `
            <form id="perfil-form">
                ${componentSystem.render('Grid', { cols: 2, gap: 'sm' }, `
                    ${componentSystem.render('FormGroup', { 
                        label: 'Nombre', 
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'text',
                            id: 'perfil-nombre',
                            name: 'nombre',
                            value: perfil?.nombre || '',
                            placeholder: 'Juan',
                            required: true
                        })
                    )}
                    
                    ${componentSystem.render('FormGroup', { 
                        label: 'Apellido', 
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'text',
                            id: 'perfil-apellido',
                            name: 'apellido',
                            value: perfil?.apellido || '',
                            placeholder: 'Pérez',
                            required: true
                        })
                    )}
                `)}
                
                ${componentSystem.render('Grid', { cols: 2, gap: 'sm' }, `
                    ${componentSystem.render('FormGroup', { 
                        label: 'DNI', 
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'text',
                            id: 'perfil-dni',
                            name: 'dni',
                            value: perfil?.dni || '',
                            placeholder: '12345678',
                            required: true
                        })
                    )}
                    
                    ${componentSystem.render('FormGroup', { 
                        label: 'Edad', 
                        required: true 
                    }, 
                        componentSystem.render('Input', {
                            type: 'number',
                            id: 'perfil-edad',
                            name: 'edad',
                            value: perfil?.edad || '',
                            placeholder: '25',
                            min: '18',
                            max: '100',
                            required: true
                        })
                    )}
                `)}
                
                ${componentSystem.render('FormGroup', { 
                    label: 'Email (solo lectura)'
                }, 
                    componentSystem.render('Input', {
                        type: 'email',
                        value: user?.email || '',
                        disabled: true,
                        className: 'input-disabled'
                    })
                )}
                
                <div class="modal-actions">
                    ${componentSystem.render('Button', { 
                        type: 'button', 
                        variant: 'ghost',
                        id: 'cancel-perfil'
                    }, 'Cancelar')}
                    
                    ${componentSystem.render('Button', { 
                        type: 'submit', 
                        variant: 'primary'
                    }, 'Guardar Cambios')}
                </div>
            </form>
        `);
    }
    
    renderUsageStats() {
        const ingresos = this.appState.getState('data.ingresos') || [];
        const gastos = this.appState.getState('data.gastos') || [];
        const simulaciones = this.appState.getState('data.simulaciones') || [];
        const resumen = this.appState.getState('data.resumen');
        
        return `
            <div class="usage-stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <div class="stat-number">${ingresos.length}</div>
                        <div class="stat-label">Ingresos registrados</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">💸</div>
                    <div class="stat-info">
                        <div class="stat-number">${gastos.length}</div>
                        <div class="stat-label">Gastos registrados</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">🏦</div>
                    <div class="stat-info">
                        <div class="stat-number">${simulaciones.length}</div>
                        <div class="stat-label">Simulaciones guardadas</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-number">${resumen ? window.dataService.formatCurrency(resumen.balanceActual) : '$0'}</div>
                        <div class="stat-label">Balance actual</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Renderizar overlays globales
    renderGlobalOverlays() {
        const isLoading = this.appState.getState('isLoading');
        
        if (isLoading) {
            const overlay = componentSystem.render('Loading', {
                message: 'Procesando...'
            });
            
            // Agregar overlay al body si no existe
            let loadingOverlay = document.getElementById('global-loading');
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'global-loading';
                loadingOverlay.className = 'global-overlay';
                document.body.appendChild(loadingOverlay);
            }
            loadingOverlay.innerHTML = overlay;
        } else {
            // Remover overlay
            const loadingOverlay = document.getElementById('global-loading');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }
    }
    
    // Renderizar notificaciones
    renderNotifications() {
        const notifications = this.appState.getState('notifications') || [];
        
        let container = document.getElementById('notifications-container');
        if (!container && notifications.length > 0) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        if (container) {
            if (notifications.length === 0) {
                container.innerHTML = '';
            } else {
                container.innerHTML = notifications.map(notification =>
                    componentSystem.render('Notification', notification)
                ).join('');
            }
        }
    }
    
    // Setup de event listeners
    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        // Los event listeners específicos se configurarán en el siguiente módulo (actions.js)
    }
    
    // Limpiar event listeners
    cleanupEventListeners() {
        this.eventListeners.forEach((listener, element) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(listener.event, listener.handler);
            }
        });
        this.eventListeners.clear();
    }
}

// Instancia global del renderer
const appRenderer = new AppRenderer();
window.appRenderer = appRenderer;

console.log('✅ AppRenderer listo para conectar con AppState');

export { appRenderer };
