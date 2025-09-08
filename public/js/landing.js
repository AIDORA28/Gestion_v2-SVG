/**
 * 🎯 LANDING PAGE - SCRIPT LIMPIO
 * Solo funciones básicas para la página de inicio
 */

// ================================
// 🚀 INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Landing clean cargado');
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Configurar navegación suave
    setupSmoothScrolling();
    
    // Verificar estado de la API
    setTimeout(checkAPIConnection, 1000);
});

// ================================
// 🔗 NAVEGACIÓN SUAVE
// ================================

function setupSmoothScrolling() {
    // Obtener todos los enlaces de navegación
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ================================
// 🌐 VERIFICAR API
// ================================

async function checkAPIConnection() {
    const statusElement = document.getElementById('api-status');
    
    if (!statusElement) {
        console.log('⚠️ Elemento de status no encontrado');
        return;
    }
    
    // Mostrar estado "verificando"
    updateAPIStatus('checking');
    
    try {
        const API_URL = window.CONFIG?.API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateAPIStatus('online');
                console.log('✅ API conectada correctamente');
            } else {
                updateAPIStatus('offline');
                console.log('❌ API respondió pero con error');
            }
        } else {
            updateAPIStatus('offline');
            console.log('❌ API no respondió correctamente');
        }
        
    } catch (error) {
        updateAPIStatus('offline');
        console.log('💥 Error al conectar con API:', error.message);
    }
}

function updateAPIStatus(status) {
    const statusElement = document.getElementById('api-status');
    if (!statusElement) return;
    
    const statusConfig = {
        checking: {
            color: 'bg-yellow-400',
            text: 'Verificando...',
            animate: 'animate-pulse'
        },
        online: {
            color: 'bg-green-400',
            text: 'Online',
            animate: ''
        },
        offline: {
            color: 'bg-red-400',
            text: 'Offline',
            animate: 'animate-pulse'
        }
    };
    
    const config = statusConfig[status] || statusConfig.offline;
    
    statusElement.innerHTML = `
        <div class="w-2 h-2 ${config.color} rounded-full ${config.animate}"></div>
        <span class="text-white text-sm">${config.text}</span>
    `;
}

// ================================
// 🎨 EFECTOS VISUALES
// ================================

// Agregar efecto parallax simple al hero
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroSection = document.getElementById('inicio');
    
    if (heroSection) {
        const rate = scrolled * -0.5;
        heroSection.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
});

// ================================
// 📱 RESPONSIVE NAVIGATION
// ================================

function toggleMobileMenu() {
    // Implementar menú móvil si es necesario
    console.log('📱 Toggle mobile menu');
}

// ================================
// 🔍 UTILIDADES
// ================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ================================
// 🌐 FUNCIONES GLOBALES
// ================================

window.landingUtils = {
    checkAPIConnection,
    updateAPIStatus,
    scrollToSection
};

console.log('🎯 Landing clean script listo');
