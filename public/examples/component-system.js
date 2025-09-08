// Ejemplo de sistema de componentes simple con JavaScript Vanilla

class ComponentSystem {
    static components = {};

    // Registrar componente
    static register(name, template, script = null) {
        this.components[name] = { template, script };
    }

    // Renderizar componente
    static render(name, props = {}) {
        const component = this.components[name];
        if (!component) return '';

        let html = component.template;
        
        // Reemplazar props
        Object.keys(props).forEach(key => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), props[key]);
        });

        return html;
    }
}

// Ejemplo de uso:
ComponentSystem.register('navbar', `
    <nav class="fixed top-0 left-0 right-0 z-40 glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-3">
                    <i data-lucide="{{icon}}" class="h-8 w-8 text-white"></i>
                    <span class="text-white font-bold text-xl">{{title}}</span>
                </div>
                {{status}}
            </div>
        </div>
    </nav>
`);

// Uso:
document.getElementById('nav-container').innerHTML = ComponentSystem.render('navbar', {
    icon: 'dollar-sign',
    title: 'FinanzasPro',
    status: '<div>Status</div>'
});
