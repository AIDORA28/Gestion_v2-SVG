/**
 * Módulo para cargar templates de módulos dinámicamente
 */
class ModuleLoader {
    constructor() {
        this.templateCache = new Map();
    }

    /**
     * Carga un template HTML desde un archivo
     */
    async loadTemplate(moduleName) {
        try {
            // Si ya está en caché, devolverlo
            if (this.templateCache.has(moduleName)) {
                return this.templateCache.get(moduleName);
            }

            const response = await fetch(`./modules/${moduleName}-template.html`);
            if (!response.ok) {
                throw new Error(`No se pudo cargar el template ${moduleName}: ${response.status}`);
            }

            const html = await response.text();
            
            // Guardar en caché
            this.templateCache.set(moduleName, html);
            
            return html;
        } catch (error) {
            console.error(`Error cargando template ${moduleName}:`, error);
            return this.getErrorTemplate(moduleName);
        }
    }

    /**
     * Obtiene un template de error por defecto
     */
    getErrorTemplate(moduleName) {
        return `
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <i data-lucide="alert-circle" class="w-6 h-6 text-red-600"></i>
                    </div>
                    <h2 class="text-xl font-bold text-red-900 mb-2">Error al cargar módulo</h2>
                    <p class="text-red-700">No se pudo cargar el módulo "${moduleName}"</p>
                    <button onclick="location.reload()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Recargar página
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene un template de módulo en desarrollo
     */
    getDevelopmentTemplate(moduleName) {
        const moduleIcon = this.getModuleIcon(moduleName);
        const moduleTitle = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
        
        return `
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                    <div class="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-4">
                        <span class="text-2xl">${moduleIcon}</span>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">${moduleTitle}</h2>
                    <p class="text-gray-600 mb-6">Este módulo está en desarrollo</p>
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p class="text-sm text-blue-800">
                            🚧 Próximamente disponible con todas las funcionalidades
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el icono apropiado para cada módulo
     */
    getModuleIcon(moduleName) {
        const icons = {
            'ingresos': '💰',
            'gastos': '💸',
            'reportes': '📊',
            'presupuesto': '📋',
            'configuracion': '⚙️',
            'perfil': '👤',
            'ayuda': '❓'
        };
        return icons[moduleName] || '📦';
    }

    /**
     * Limpia la caché de templates
     */
    clearCache() {
        this.templateCache.clear();
    }
}

// Crear instancia global
window.moduleLoader = new ModuleLoader();
