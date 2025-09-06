// js/main.js - Bootstrap de la aplicación (equivale a React.render + App Component)

import { appState } from './app.js';
import { appRenderer } from './renderer.js';
import { componentSystem } from './components.js';
import { dataService } from './data-service.js';
import { businessActions } from './business-actions.js';
import { FormHandler } from './form-handler.js';

class AppBootstrap {
    constructor() {
        this.isInitialized = false;
        console.log('🚀 AppBootstrap inicializando...');
    }
    
    async init() {
        if (this.isInitialized) {
            console.warn('⚠️ App ya está inicializada');
            return;
        }
        
        try {
            console.log('🔗 Conectando sistemas...');
            
            // Esperar a que Supabase esté listo
            await this.waitForSupabase();
            
            // Inicializar FormHandler
            window.formHandler = new FormHandler(appState);
            console.log('📝 FormHandler inicializado');
            
            // Conectar renderer con state
            appRenderer.connectToState(appState);
            
            // Configurar acciones globales
            this.setupGlobalActions();
            
            // Configurar manejo de errores
            this.setupErrorHandling();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ Aplicación inicializada correctamente');
            console.log('📊 Estado inicial:', {
                currentView: appState.getState('currentView'),
                isAuthenticated: appState.getState('isAuthenticated'),
                isLoading: appState.getState('isLoading')
            });
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.handleBootstrapError(error);
        }
    }
    
    // Esperar a que Supabase esté disponible
    async waitForSupabase() {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (!window.supabaseClient && attempts < maxAttempts) {
            console.log(`⏳ Esperando Supabase... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.supabaseClient) {
            throw new Error('Supabase client no se cargó después de 5 segundos');
        }
        
        console.log('✅ Supabase client disponible');
    }
    
    // Configurar acciones globales (equivale a React event handlers)
    setupGlobalActions() {
        window.appActions = {
            // Navegación
            switchTab: (tabId) => {
                console.log('🔄 Cambiando a tab:', tabId);
                appState.setState('currentTab', tabId);
            },
            
            switchView: (viewName) => {
                console.log('🔄 Cambiando a vista:', viewName);
                appState.setState('currentView', viewName);
            },
            
            // Autenticación
            login: async (email, password) => {
                try {
                    appState.showGlobalLoading();
                    console.log('🔐 Intentando login para:', email);
                    
                    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password,
                    });
                    
                    if (error) {
                        console.error('❌ Error login:', error);
                        appState.setState('errors.login', error.message);
                        appState.showNotification('Error al iniciar sesión: ' + error.message, 'error');
                        return false;
                    }
                    
                    console.log('✅ Login exitoso:', data.user.email);
                    appState.showNotification('¡Bienvenido!', 'success');
                    
                    // El auth state change handler se encargará del resto
                    return true;
                    
                } catch (error) {
                    console.error('❌ Error inesperado en login:', error);
                    appState.showNotification('Error inesperado', 'error');
                    return false;
                } finally {
                    appState.hideGlobalLoading();
                }
            },
            
            register: async (userData) => {
                try {
                    appState.showGlobalLoading();
                    console.log('👤 Registrando usuario:', userData.email);
                    
                    // Validaciones básicas
                    if (userData.password !== userData.confirmPassword) {
                        appState.setState('errors.confirmPassword', 'Las contraseñas no coinciden');
                        appState.showNotification('Las contraseñas no coinciden', 'error');
                        return false;
                    }
                    
                    // Crear cuenta en Supabase Auth
                    const { data, error } = await window.supabaseClient.auth.signUp({
                        email: userData.email,
                        password: userData.password,
                    });
                    
                    if (error) {
                        console.error('❌ Error registro:', error);
                        appState.setState('errors.register', error.message);
                        appState.showNotification('Error al crear cuenta: ' + error.message, 'error');
                        return false;
                    }
                    
                    // Si el registro fue exitoso, crear perfil de usuario
                    if (data.user) {
                        try {
                            const { error: profileError } = await window.supabaseClient
                                .from('perfiles_usuario')
                                .insert([{
                                    id: data.user.id,
                                    nombre: userData.nombre,
                                    apellido: userData.apellido,
                                    dni: userData.dni,
                                    edad: parseInt(userData.edad),
                                    email: userData.email
                                }]);
                            
                            if (profileError) {
                                console.warn('⚠️ Error creando perfil:', profileError);
                                // No fallar el registro por esto
                            } else {
                                console.log('✅ Perfil creado exitosamente');
                            }
                        } catch (profileError) {
                            console.warn('⚠️ Error inesperado creando perfil:', profileError);
                        }
                    }
                    
                    console.log('✅ Registro exitoso:', data.user.email);
                    appState.showNotification('¡Cuenta creada exitosamente!', 'success');
                    
                    return true;
                    
                } catch (error) {
                    console.error('❌ Error inesperado en registro:', error);
                    appState.showNotification('Error inesperado', 'error');
                    return false;
                } finally {
                    appState.hideGlobalLoading();
                }
            },
            
            logout: async () => {
                try {
                    console.log('🚪 Cerrando sesión...');
                    const { error } = await window.supabaseClient.auth.signOut();
                    
                    if (error) {
                        console.error('❌ Error logout:', error);
                        appState.showNotification('Error al cerrar sesión', 'error');
                        return;
                    }
                    
                    console.log('✅ Sesión cerrada');
                    appState.showNotification('Sesión cerrada', 'info');
                    
                } catch (error) {
                    console.error('❌ Error inesperado en logout:', error);
                }
            },
            
            // Modales
            openModal: (modalName) => {
                appState.toggleModal(modalName, true);
            },
            
            closeModal: (modalName) => {
                appState.toggleModal(modalName, false);
            },
            
            // Forms
            updateForm: (formName, field, value) => {
                appState.setState(`forms.${formName}.${field}`, value);
            },
            
            resetForm: (formName) => {
                appState.resetForm(formName);
            },
            
            // Utilidades
            reload: () => {
                window.location.reload();
            },
            
            goHome: () => {
                const isAuthenticated = appState.getState('isAuthenticated');
                appState.setState('currentView', isAuthenticated ? 'dashboard' : 'login');
            },
            
            // ===== NUEVAS ACCIONES DE NEGOCIO =====
            
            // Ingresos
            openIngresoModal: () => {
                appState.toggleModal('addIngreso', true);
            },
            
            closeIngresoModal: () => {
                appState.toggleModal('addIngreso', false);
                appState.resetForm('ingreso');
                appState.setState('errors', {});
            },
            
            createIngreso: async (formData) => {
                const ingresoData = {
                    descripcion: formData.get('descripcion'),
                    monto: formData.get('monto'),
                    categoria: formData.get('categoria'),
                    fecha: formData.get('fecha')
                };
                
                return await window.businessActions.createIngreso(ingresoData);
            },
            
            deleteIngreso: async (id) => {
                if (confirm('¿Estás seguro de eliminar este ingreso?')) {
                    return await window.businessActions.deleteIngreso(id);
                }
                return false;
            },
            
            // Gastos
            openGastoModal: () => {
                appState.toggleModal('addGasto', true);
            },
            
            closeGastoModal: () => {
                appState.toggleModal('addGasto', false);
                appState.resetForm('gasto');
                appState.setState('errors', {});
            },
            
            createGasto: async (formData) => {
                const gastoData = {
                    descripcion: formData.get('descripcion'),
                    monto: formData.get('monto'),
                    categoria: formData.get('categoria'),
                    fecha: formData.get('fecha')
                };
                
                return await window.businessActions.createGasto(gastoData);
            },
            
            deleteGasto: async (id) => {
                if (confirm('¿Estás seguro de eliminar este gasto?')) {
                    return await window.businessActions.deleteGasto(id);
                }
                return false;
            },
            
            // Simulador
            calculateSimulation: () => {
                const form = appState.getState('forms.simulador');
                
                if (!form.monto || !form.tasa || !form.plazo) {
                    appState.showNotification('Por favor completa todos los campos', 'warning');
                    return;
                }
                
                try {
                    const resultado = window.businessActions.calcularSimulacionCredito(
                        form.monto,
                        form.tasa,
                        form.plazo
                    );
                    
                    appState.setState('forms.simulador.resultado', resultado);
                    appState.showNotification('✅ Simulación calculada', 'success');
                    
                } catch (error) {
                    console.error('Error en simulación:', error);
                    appState.showNotification('Error en la simulación: ' + error.message, 'error');
                }
            },
            
            saveSimulation: async () => {
                const resultado = appState.getState('forms.simulador.resultado');
                if (!resultado) {
                    appState.showNotification('Primero calcula la simulación', 'warning');
                    return;
                }
                
                return await window.businessActions.saveSimulacion(resultado);
            },
            
            deleteSimulation: async (id) => {
                if (confirm('¿Estás seguro de eliminar esta simulación?')) {
                    return await window.dataService.deleteSimulacion(id);
                }
                return false;
            },
            
            // Perfil
            openPerfilModal: () => {
                appState.toggleModal('editProfile', true);
            },
            
            closePerfilModal: () => {
                appState.toggleModal('editProfile', false);
            },
            
            updatePerfil: async (formData) => {
                const perfilData = {
                    nombre: formData.get('nombre'),
                    apellido: formData.get('apellido'),
                    dni: formData.get('dni'),
                    edad: parseInt(formData.get('edad')),
                    email: appState.getState('user').email
                };
                
                return await window.businessActions.updatePerfil(perfilData);
            },
            
            // Utilidades avanzadas
            exportData: async () => {
                await window.businessActions.exportData();
            },
            
            clearCache: () => {
                window.businessActions.clearCache();
            },
            
            refreshData: async () => {
                appState.showGlobalLoading();
                await window.businessActions.loadAllData();
                appState.hideGlobalLoading();
                appState.showNotification('✅ Datos actualizados', 'success');
            }
        };
        
        console.log('✅ Acciones globales configuradas');
    }
    
    // Configurar manejo de errores
    setupErrorHandling() {
        // Handler para errores de JavaScript
        window.addEventListener('error', (event) => {
            console.error('❌ Error JavaScript:', event.error);
            appState.showNotification('Error inesperado en la aplicación', 'error');
        });
        
        // Handler para promises rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promise rejection no manejada:', event.reason);
            appState.showNotification('Error de conexión o procesamiento', 'error');
            
            // Prevenir que aparezca en console (opcional)
            event.preventDefault();
        });
        
        // Handler para errores de red (fetch)
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    console.warn(`⚠️ HTTP ${response.status}:`, args[0]);
                }
                return response;
            } catch (error) {
                console.error('❌ Network error:', error);
                appState.showNotification('Error de conexión', 'error');
                throw error;
            }
        };
        
        console.log('✅ Manejo de errores configurado');
    }
    
    // Manejar errores de bootstrap
    handleBootstrapError(error) {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <div class="error-container">
                    <div class="error-card">
                        <h2>❌ Error de Inicialización</h2>
                        <p>La aplicación no pudo iniciarse correctamente.</p>
                        <details>
                            <summary>Detalles técnicos</summary>
                            <pre>${error.message}</pre>
                        </details>
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            Recargar Página
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// =====================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =====================================

console.log('🚀 Iniciando aplicación...');

// Crear instancia bootstrap
const bootstrap = new AppBootstrap();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bootstrap.init();
    });
} else {
    // DOM ya está listo
    bootstrap.init();
}

// Configurar listeners para formularios (será mejorado en el próximo módulo)
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Configurando event listeners básicos...');
    
    // Delegación de eventos para formularios dinámicos
    document.body.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formId = form.id;
        
        console.log('📝 Enviando formulario:', formId);
        
        switch (formId) {
            case 'login-form':
                await handleLoginSubmit(form);
                break;
            case 'register-form':
                await handleRegisterSubmit(form);
                break;
                
            // Nuevos formularios de negocio
            case 'ingreso-form':
                const ingresoData = {
                    descripcion: form.descripcion.value.trim(),
                    categoria: form.categoria.value,
                    monto: parseFloat(form.monto.value),
                    fecha: form.fecha.value,
                    es_recurrente: form.es_recurrente?.checked || false
                };
                await window.businessActions.createIngreso(ingresoData);
                break;
                
            case 'gasto-form':
                const gastoData = {
                    descripcion: form.descripcion.value.trim(),
                    categoria: form.categoria.value,
                    monto: parseFloat(form.monto.value),
                    fecha: form.fecha.value,
                    es_recurrente: form.es_recurrente?.checked || false,
                    metodo_pago: form.metodo_pago?.value || 'efectivo'
                };
                await window.businessActions.createGasto(gastoData);
                break;
                
            case 'perfil-form':
                const perfilData = {
                    nombre: form.nombre?.value?.trim(),
                    apellido: form.apellido?.value?.trim(),
                    telefono: form.telefono?.value?.trim() || null,
                    fecha_nacimiento: form.fecha_nacimiento?.value || null,
                    ocupacion: form.ocupacion?.value?.trim() || null,
                    salario_mensual: form.salario_mensual?.value ? parseFloat(form.salario_mensual.value) : null,
                    gastos_mensuales: form.gastos_mensuales?.value ? parseFloat(form.gastos_mensuales.value) : null
                };
                await window.businessActions.updatePerfil(perfilData);
                break;
                
            default:
                console.log('📝 Formulario no reconocido:', formId);
        }
    });
    
    // Delegación de eventos para botones dinámicos
    document.body.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        const buttonClass = e.target.className;
        
        switch (buttonId) {
            case 'switch-to-register':
                window.appActions.switchView('register');
                break;
            case 'switch-to-login':
                window.appActions.switchView('login');
                break;
            case 'logout-btn':
                window.appActions.logout();
                break;
            case 'go-home':
                window.appActions.goHome();
                break;
            case 'reload-app':
                window.appActions.reload();
                break;
            case 'quick-add-income':
                window.appActions.switchTab('ingresos');
                break;
            case 'quick-add-expense':
                window.appActions.switchTab('gastos');
                break;
            case 'quick-simulate':
                window.appActions.switchTab('simulador');
                break;
            
            // Nuevos botones de negocio
            case 'add-ingreso-btn':
            case 'add-first-ingreso':
                window.businessActions.openIngresoModal();
                break;
            case 'cancel-ingreso':
                window.businessActions.closeIngresoModal();
                break;
            case 'add-gasto-btn':
            case 'add-first-gasto':
                window.businessActions.openGastoModal();
                break;
            case 'cancel-gasto':
                window.businessActions.closeGastoModal();
                break;
            case 'calculate-simulation':
                window.businessActions.calculateSimulation();
                break;
            case 'save-simulation':
                window.businessActions.saveSimulation();
                break;
            case 'edit-profile-btn':
            case 'complete-profile-btn':
                window.businessActions.openPerfilModal();
                break;
            case 'cancel-perfil':
                window.businessActions.closePerfilModal();
                break;
            case 'export-data-btn':
                window.businessActions.exportData();
                break;
            case 'clear-cache-btn':
                window.businessActions.clearCache();
                break;
            case 'refresh-data-btn':
                window.businessActions.refreshData();
                break;
        }
        
        // Manejo de botones con clases (acciones dinámicas en tablas)
        if (e.target.classList.contains('edit-ingreso')) {
            const id = e.target.dataset.id;
            console.log('Editar ingreso:', id);
            // TODO: Implementar edición inline o modal
        }
        
        if (e.target.classList.contains('delete-ingreso')) {
            const id = e.target.dataset.id;
            window.businessActions.deleteIngreso(parseInt(id));
        }
        
        if (e.target.classList.contains('edit-gasto')) {
            const id = e.target.dataset.id;
            console.log('Editar gasto:', id);
            // TODO: Implementar edición inline o modal
        }
        
        if (e.target.classList.contains('delete-gasto')) {
            const id = e.target.dataset.id;
            window.businessActions.deleteGasto(parseInt(id));
        }
        
        if (e.target.classList.contains('delete-simulation')) {
            const id = e.target.dataset.id;
            window.businessActions.deleteSimulation(parseInt(id));
        }
        
        // Cerrar modales haciendo clic en overlay
        if (e.target.classList.contains('modal-overlay')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                if (modal.id === 'ingreso-modal') {
                    window.businessActions.closeIngresoModal();
                } else if (modal.id === 'gasto-modal') {
                    window.businessActions.closeGastoModal();
                } else if (modal.id === 'perfil-modal') {
                    window.businessActions.closePerfilModal();
                }
            }
        }
    });
    
    // Event listeners para cambios en inputs (para formularios reactivos)
    document.body.addEventListener('input', (e) => {
        const input = e.target;
        const form = input.closest('form');
        
        if (form && input.name) {
            const formName = form.id.replace('-form', '');
            window.appActions.updateForm(formName, input.name, input.value);
        }
    });
});

// Handlers para formularios
async function handleLoginSubmit(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
        appState.showNotification('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const success = await window.appActions.login(email, password);
    if (success) {
        appState.resetForm('login');
    }
}

async function handleRegisterSubmit(form) {
    const formData = new FormData(form);
    const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        dni: formData.get('dni'),
        edad: formData.get('edad')
    };
    
    // Validación básica
    const requiredFields = ['email', 'password', 'confirmPassword', 'nombre', 'apellido', 'dni', 'edad'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
        appState.showNotification('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const success = await window.appActions.register(userData);
    if (success) {
        appState.resetForm('register');
        // Cambiar a login después del registro exitoso
        setTimeout(() => {
            window.appActions.switchView('login');
        }, 2000);
    }
}

// Exportar bootstrap para debug
window.appBootstrap = bootstrap;

// Helper para debug
window.debugApp = () => {
    console.table({
        currentView: appState.getState('currentView'),
        currentTab: appState.getState('currentTab'),
        isAuthenticated: appState.getState('isAuthenticated'),
        isLoading: appState.getState('isLoading'),
        user: appState.getState('user')?.email || 'none',
        components: componentSystem.templates.size
    });
};

console.log('✅ main.js cargado - Bootstrap listo');

export { bootstrap };
