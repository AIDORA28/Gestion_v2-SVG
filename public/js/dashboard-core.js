/**
 * 🎛️ DASHBOARD CORE - Sistema Central de Dashboard
 * Manejo optimizado de sidebar, iconos y funcionalidades core
 * Versión: 2.0 - Optimizada y Modular
 */

class DashboardCore {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.sidebarToggle = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initElements();
        this.initLucideIcons();
        this.bindEvents();
        this.handleResize();
        this.isInitialized = true;
        
        console.log('✅ Dashboard Core inicializado correctamente');
    }

    initElements() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (!this.sidebar || !this.overlay) {
            console.warn('⚠️ Elementos del sidebar no encontrados');
        }
        
        if (!this.sidebarToggle) {
            console.warn('⚠️ Botón toggle del sidebar no encontrado');
        }
    }

    initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('✅ Iconos Lucide inicializados');
        } else {
            console.warn('⚠️ Lucide no está disponible');
        }
    }

    bindEvents() {
        // Toggle sidebar
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }

        // Cerrar sidebar al hacer click en overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }

        // Manejar redimensionamiento
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleSidebar() {
        if (!this.sidebar || !this.overlay) return;

        const isHidden = this.sidebar.classList.contains('-translate-x-full');
        
        if (isHidden) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }

    openSidebar() {
        if (!this.sidebar || !this.overlay) return;

        this.sidebar.classList.remove('-translate-x-full');
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Sidebar abierto');
    }

    closeSidebar() {
        if (!this.sidebar || !this.overlay) return;

        this.sidebar.classList.add('-translate-x-full');
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
        
        console.log('❌ Sidebar cerrado');
    }

    handleResize() {
        // En desktop (lg breakpoint = 1024px), asegurar que el sidebar esté visible
        if (window.innerWidth >= 1024) {
            if (this.sidebar && this.overlay) {
                this.sidebar.classList.remove('-translate-x-full');
                this.overlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    }

    // Método público para reinicializar iconos
    refreshIcons() {
        this.initLucideIcons();
    }

    // Método público para verificar estado
    getStatus() {
        return {
            initialized: this.isInitialized,
            sidebar: !!this.sidebar,
            overlay: !!this.overlay,
            toggle: !!this.sidebarToggle
        };
    }
}

// Inicializar Dashboard Core
window.dashboardCore = new DashboardCore();

// Exponer funciones globales para compatibilidad
window.toggleMobileMenu = () => window.dashboardCore.toggleSidebar();
window.closeSidebar = () => window.dashboardCore.closeSidebar();
