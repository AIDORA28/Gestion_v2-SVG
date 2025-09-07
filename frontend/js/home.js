/**
 * 🏠 FUNCIONALIDAD PÁGINA HOME
 * Landing page profesional con CDN y PostgreSQL
 */

// ================================
// 🎯 CONTROLADOR DE HOME
// ================================

class HomeController {
    constructor() {
        this.isLoading = false;
        this.apiStatus = 'checking';
        
        this.init();
    }

    async init() {
        console.log('🏠 Inicializando Home Controller...');
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Verificar si el usuario ya está autenticado
        this.checkAuthStatus();
        
        // Verificar estado de la API
        await this.checkApiStatus();
        
        // Inicializar animaciones
        this.initAnimations();
        
        console.log('✅ Home Controller listo');
    }

    // ===== EVENTOS =====

    setupEventListeners() {
        // Botones principales
        const btnIngresar = document.getElementById('btn-ingresar');
        const btnRegistro = document.getElementById('btn-registro');
        const btnProbar = document.getElementById('btn-probar');

        if (btnIngresar) {
            btnIngresar.addEventListener('click', () => this.goToLogin());
        }

        if (btnRegistro) {
            btnRegistro.addEventListener('click', () => this.goToRegister());
        }

        if (btnProbar) {
            btnProbar.addEventListener('click', () => this.showDemo());
        }

        // Enlaces de navegación
        this.setupNavigationLinks();
        
        // Smooth scrolling para enlaces internos
        this.setupSmoothScrolling();
    }

    setupNavigationLinks() {
        const navLinks = document.querySelectorAll('[data-action]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = link.getAttribute('data-action');
                this.handleNavigation(action);
            });
        });
    }

    setupSmoothScrolling() {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ===== NAVEGACIÓN =====

    handleNavigation(action) {
        switch(action) {
            case 'login':
                this.goToLogin();
                break;
            case 'register':
                this.goToRegister();
                break;
            case 'demo':
                this.showDemo();
                break;
            case 'features':
                this.scrollToSection('caracteristicas');
                break;
            case 'pricing':
                this.scrollToSection('precios');
                break;
            case 'contact':
                this.scrollToSection('contacto');
                break;
            default:
                console.log('Acción no reconocida:', action);
        }
    }

    goToLogin() {
        console.log('🔑 Redirigiendo a Login...');
        window.location.href = '/auth.html';
    }

    goToRegister() {
        console.log('📝 Redirigiendo a Registro...');
        window.location.href = '/auth.html#register';
    }

    showDemo() {
        UTILS.showNotification('Demo no disponible temporalmente', 'info');
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // ===== AUTENTICACIÓN =====

    checkAuthStatus() {
        if (window.AUTH_MANAGER && window.AUTH_MANAGER.isLoggedIn()) {
            console.log('👤 Usuario autenticado detectado');
            this.showAuthenticatedState();
        } else {
            console.log('🔓 Usuario no autenticado');
            this.showGuestState();
        }
    }

    showAuthenticatedState() {
        // Cambiar botones si el usuario está autenticado
        const btnIngresar = document.getElementById('btn-ingresar');
        const btnRegistro = document.getElementById('btn-registro');
        
        if (btnIngresar) {
            btnIngresar.innerHTML = `
                <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                Ir al Dashboard
            `;
            btnIngresar.onclick = () => window.location.href = '/dashboard.html';
        }

        if (btnRegistro) {
            btnRegistro.innerHTML = `
                <i data-lucide="log-out" class="w-5 h-5"></i>
                Cerrar Sesión
            `;
            btnRegistro.onclick = () => window.AUTH_MANAGER.logout();
        }

        // Actualizar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    showGuestState() {
        // Mantener estado por defecto para invitados
        console.log('🎯 Interfaz configurada para visitantes');
    }

    // ===== ESTADO DE API =====

    async checkApiStatus() {
        const statusIndicator = document.getElementById('api-status');
        
        try {
            console.log('🔍 Verificando estado de la API...');
            
            if (statusIndicator) {
                statusIndicator.className = 'px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800';
                statusIndicator.textContent = 'Verificando...';
            }

            // Verificar health check
            const health = await window.API_CLIENT.healthCheck();
            
            if (health && health.success) {
                this.apiStatus = 'online';
                console.log('✅ API Online:', health);
                
                if (statusIndicator) {
                    statusIndicator.className = 'px-3 py-1 rounded-full text-sm bg-green-100 text-green-800';
                    statusIndicator.textContent = 'Sistema Online';
                }
                
                UTILS.showNotification('Sistema conectado correctamente', 'success');
            } else {
                throw new Error('Health check failed');
            }

        } catch (error) {
            this.apiStatus = 'offline';
            console.log('❌ API Offline:', error.message);
            
            if (statusIndicator) {
                statusIndicator.className = 'px-3 py-1 rounded-full text-sm bg-red-100 text-red-800';
                statusIndicator.textContent = 'Sistema Offline';
            }

            // No mostrar error en modo desarrollo
            if (window.location.hostname === 'localhost') {
                console.log('🚧 Modo desarrollo - API puede estar iniciándose...');
            }
        }
    }

    // ===== ANIMACIONES =====

    initAnimations() {
        // Animación de entrada para elementos con fade-in
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar elementos con animación
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));

        // Animación del hero
        this.animateHero();
    }

    animateHero() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');

        setTimeout(() => {
            if (heroTitle) {
                heroTitle.classList.add('animate__animated', 'animate__fadeInDown');
            }
        }, 200);

        setTimeout(() => {
            if (heroSubtitle) {
                heroSubtitle.classList.add('animate__animated', 'animate__fadeInUp');
            }
        }, 400);

        setTimeout(() => {
            if (heroButtons) {
                heroButtons.classList.add('animate__animated', 'animate__fadeInUp');
            }
        }, 600);
    }

    // ===== UTILIDADES =====

    getApiStatus() {
        return this.apiStatus;
    }

    isSystemOnline() {
        return this.apiStatus === 'online';
    }
}

// ================================
// 🎨 EFECTOS VISUALES ADICIONALES
// ================================

class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallax();
        this.setupGlassEffects();
        this.setupHoverEffects();
    }

    setupParallax() {
        // Efecto parallax simple para el hero
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.hero-bg');
            
            if (parallax) {
                const speed = 0.5;
                parallax.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });
    }

    setupGlassEffects() {
        // Mejorar efectos glass en hover
        const glassElements = document.querySelectorAll('.glass-effect');
        
        glassElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.backdropFilter = 'blur(20px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.backdropFilter = 'blur(10px)';
            });
        });
    }

    setupHoverEffects() {
        // Efectos de hover para tarjetas de características
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// ================================
// 🚀 INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Iniciando página Home...');
    
    // Inicializar controlador principal
    window.homeController = new HomeController();
    
    // Inicializar efectos visuales
    window.visualEffects = new VisualEffects();
    
    // Inicializar iconos de Lucide después de cargar
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            console.log('✨ Iconos Lucide inicializados');
        }
    }, 100);
    
    console.log('✅ Home página completamente cargada');
});

// ================================
// 🔗 EXPORTAR PARA USO GLOBAL
// ================================

window.HOME_CONTROLLER = window.homeController;
