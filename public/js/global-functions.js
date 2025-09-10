/**
 * 🌐 GLOBAL FUNCTIONS - PLANIFICAPRO
 * Funciones globales para compatibility con onclick handlers
 * Versión: 2.0 - Completa y Optimizada
 */

// ===============================
// 🎯 NAVIGATION FUNCTIONS
// ===============================

/**
 * Mostrar sección específica del dashboard
 * @param {string} section - Nombre de la sección a mostrar
 */
window.showSection = function(section) {
    if (window.dashboardHandler && window.dashboardHandler.showSection) {
        window.dashboardHandler.showSection(section);
    } else {
        console.warn(`⚠️ Dashboard handler no disponible para mostrar sección: ${section}`);
    }
};

/**
 * Mostrar configuraciones de usuario
 */
window.showUserSettings = function() {
    console.log('🔧 Mostrando configuraciones de usuario');
    // Implementar modal de configuraciones
    const notyf = window.notyf || new Notyf();
    notyf.open({
        type: 'info',
        message: '⚙️ Configuraciones de usuario próximamente disponibles'
    });
};

// ===============================
// 📊 MODAL FUNCTIONS
// ===============================

/**
 * Cerrar modal de quick add
 */
window.closeQuickAddModal = function() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('✖️ Modal quick add cerrado');
    }
};

/**
 * Cerrar modal de ingreso
 */
window.closeIngresoModal = function() {
    if (window.ingresosHandler && window.ingresosHandler.closeIngresoModal) {
        window.ingresosHandler.closeIngresoModal();
    } else {
        // Fallback directo
        const modal = document.getElementById('ingreso-modal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('✖️ Modal ingreso cerrado (fallback)');
        }
    }
};

/**
 * Cerrar modal de confirmación de eliminación de ingreso
 */
window.closeDeleteIngresoModal = function() {
    const modal = document.getElementById('delete-ingreso-modal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('✖️ Modal delete ingreso cerrado');
    }
};

/**
 * Abrir modal de ingreso
 */
window.openIngresoModal = function() {
    if (window.ingresosHandler && window.ingresosHandler.openIngresoModal) {
        window.ingresosHandler.openIngresoModal();
    } else {
        const modal = document.getElementById('ingreso-modal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('✅ Modal ingreso abierto (fallback)');
        }
    }
};

// ===============================
// 🎮 SIDEBAR FUNCTIONS
// ===============================

/**
 * Toggle del menú móvil (alias para compatibilidad)
 */
window.toggleMobileMenu = function() {
    if (window.dashboardCore && window.dashboardCore.toggleSidebar) {
        window.dashboardCore.toggleSidebar();
    } else {
        console.warn('⚠️ Dashboard core no disponible');
    }
};

/**
 * Cerrar sidebar móvil
 */
window.closeSidebar = function() {
    if (window.dashboardCore && window.dashboardCore.closeSidebar) {
        window.dashboardCore.closeSidebar();
    } else {
        console.warn('⚠️ Dashboard core no disponible');
    }
};

// ===============================
// 💰 QUICK ADD FUNCTIONS
// ===============================

/**
 * Quick add de ingreso
 */
window.quickAddIngreso = function() {
    window.openIngresoModal();
};

/**
 * Quick add de gasto
 */
window.quickAddGasto = function() {
    console.log('💸 Quick add gasto');
    const notyf = window.notyf || new Notyf();
    notyf.open({
        type: 'info',
        message: '💸 Función de gastos próximamente disponible'
    });
};

// ===============================
// 🔧 UTILITY FUNCTIONS
// ===============================

/**
 * Inicializar todas las funciones globales
 */
window.initGlobalFunctions = function() {
    console.log('🌐 Funciones globales inicializadas');
    
    // Verificar dependencias
    const dependencies = [
        { name: 'dashboardCore', obj: window.dashboardCore },
        { name: 'dashboardHandler', obj: window.dashboardHandler },
        { name: 'ingresosHandler', obj: window.ingresosHandler }
    ];
    
    dependencies.forEach(dep => {
        if (dep.obj) {
            console.log(`✅ ${dep.name} disponible`);
        } else {
            console.warn(`⚠️ ${dep.name} no disponible`);
        }
    });
};

/**
 * Manejar errores de funciones globales
 */
window.handleGlobalError = function(functionName, error) {
    console.error(`❌ Error en función global ${functionName}:`, error);
    
    const notyf = window.notyf || new Notyf();
    notyf.error(`Error en ${functionName}: ${error.message}`);
};

// ===============================
// 🚀 AUTO-INITIALIZATION
// ===============================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initGlobalFunctions);
} else {
    window.initGlobalFunctions();
}

// Exportar para debugging
window.globalFunctions = {
    showSection: window.showSection,
    showUserSettings: window.showUserSettings,
    closeQuickAddModal: window.closeQuickAddModal,
    closeIngresoModal: window.closeIngresoModal,
    closeDeleteIngresoModal: window.closeDeleteIngresoModal,
    openIngresoModal: window.openIngresoModal,
    toggleMobileMenu: window.toggleMobileMenu,
    closeSidebar: window.closeSidebar,
    quickAddIngreso: window.quickAddIngreso,
    quickAddGasto: window.quickAddGasto
};

console.log('🌐 Global Functions v2.0 cargadas correctamente');
