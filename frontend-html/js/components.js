// js/components.js - Sistema de Templates/Componentes (equivale a React Components + JSX)

class ComponentSystem {
    constructor() {
        this.templates = new Map();
        this.registeredComponents = new Map();
        console.log('🧩 Component System inicializado');
    }
    
    // Registrar un template (equivale a React.Component)
    register(name, template, styles = '') {
        if (typeof template !== 'function') {
            console.error(`❌ Template ${name} debe ser una función`);
            return;
        }
        
        this.templates.set(name, template);
        
        // Si hay estilos, agregarlos al documento
        if (styles) {
            this.addStyles(name, styles);
        }
        
        console.log(`✅ Componente ${name} registrado`);
    }
    
    // Renderizar un componente (equivale a <Component prop={value} />)
    render(name, props = {}, children = '') {
        const template = this.templates.get(name);
        
        if (!template) {
            console.error(`❌ Componente ${name} no encontrado`);
            return '<div>Component not found</div>';
        }
        
        try {
            return template(props, children);
        } catch (error) {
            console.error(`❌ Error renderizando ${name}:`, error);
            return '<div>Error rendering component</div>';
        }
    }
    
    // Agregar estilos de componente
    addStyles(componentName, styles) {
        const styleId = `component-styles-${componentName}`;
        
        // Remover estilos previos si existen
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Crear nuevo elemento style
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    // Crear elementos con eventos (equivale a JSX con onClick, onChange, etc.)
    createElement(tag, props = {}, children = '') {
        const attributes = [];
        const eventHandlers = {};
        
        // Separar props en attributes y event handlers
        Object.entries(props).forEach(([key, value]) => {
            if (key.startsWith('on')) {
                // Event handler (onClick -> click, onChange -> change)
                const eventName = key.substring(2).toLowerCase();
                eventHandlers[eventName] = value;
            } else if (key === 'className') {
                attributes.push(`class="${value}"`);
            } else if (key === 'htmlFor') {
                attributes.push(`for="${value}"`);
            } else {
                attributes.push(`${key}="${value}"`);
            }
        });
        
        const attributeString = attributes.join(' ');
        const html = `<${tag} ${attributeString}>${children}</${tag}>`;
        
        // Si hay event handlers, necesitamos retornar info adicional
        if (Object.keys(eventHandlers).length > 0) {
            return {
                html,
                events: eventHandlers,
                selector: props.id ? `#${props.id}` : null
            };
        }
        
        return html;
    }
}

// Instancia global del sistema de componentes
const componentSystem = new ComponentSystem();
window.componentSystem = componentSystem;

// ============================================
// COMPONENTES BASE (equivale a React Components)
// ============================================

// Loading Component
componentSystem.register('Loading', (props) => {
    const { message = 'Cargando...' } = props;
    return `
        <div class="loading-overlay">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        </div>
    `;
});

// Button Component
componentSystem.register('Button', (props, children) => {
    const { 
        variant = 'primary', 
        size = 'md', 
        disabled = false, 
        type = 'button',
        className = '',
        id = '',
        onClick = null 
    } = props;
    
    const classes = `btn btn-${variant} btn-${size} ${className}`;
    const disabledAttr = disabled ? 'disabled' : '';
    const onClickAttr = onClick ? `onclick="${onClick}"` : '';
    const idAttr = id ? `id="${id}"` : '';
    
    return `
        <button type="${type}" class="${classes}" ${disabledAttr} ${onClickAttr} ${idAttr}>
            ${children}
        </button>
    `;
});

// Input Component
componentSystem.register('Input', (props) => {
    const { 
        type = 'text', 
        placeholder = '', 
        value = '', 
        name = '', 
        id = '', 
        required = false,
        className = '',
        onChange = null
    } = props;
    
    const classes = `input ${className}`;
    const requiredAttr = required ? 'required' : '';
    const onChangeAttr = onChange ? `onchange="${onChange}"` : '';
    const idAttr = id ? `id="${id}"` : '';
    
    return `
        <input 
            type="${type}" 
            class="${classes}" 
            placeholder="${placeholder}" 
            value="${value}" 
            name="${name}"
            ${idAttr}
            ${requiredAttr} 
            ${onChangeAttr}
        />
    `;
});

// Card Component
componentSystem.register('Card', (props, children) => {
    const { className = '', title = '' } = props;
    const classes = `card ${className}`;
    
    const titleHTML = title ? `<div class="card-header"><h3 class="card-title">${title}</h3></div>` : '';
    
    return `
        <div class="${classes}">
            ${titleHTML}
            <div class="card-content">
                ${children}
            </div>
        </div>
    `;
});

// Modal Component
componentSystem.register('Modal', (props, children) => {
    const { 
        isOpen = false, 
        title = '', 
        onClose = '',
        className = '',
        id = ''
    } = props;
    
    const modalClass = `modal ${isOpen ? 'modal-open' : ''} ${className}`;
    const idAttr = id ? `id="${id}"` : '';
    const onCloseAttr = onClose ? `onclick="${onClose}"` : '';
    
    return `
        <div class="${modalClass}" ${idAttr}>
            <div class="modal-overlay" ${onCloseAttr}></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" ${onCloseAttr}>×</button>
                </div>
                <div class="modal-body">
                    ${children}
                </div>
            </div>
        </div>
    `;
});

// Form Group Component
componentSystem.register('FormGroup', (props, children) => {
    const { label = '', error = '', required = false, className = '' } = props;
    const classes = `form-group ${error ? 'form-group-error' : ''} ${className}`;
    const requiredMark = required ? '<span class="required">*</span>' : '';
    
    return `
        <div class="${classes}">
            ${label ? `<label class="form-label">${label}${requiredMark}</label>` : ''}
            ${children}
            ${error ? `<span class="form-error">${error}</span>` : ''}
        </div>
    `;
});

// Alert Component
componentSystem.register('Alert', (props, children) => {
    const { type = 'info', dismissible = false, className = '' } = props;
    const classes = `alert alert-${type} ${className}`;
    
    const dismissButton = dismissible ? `
        <button class="alert-dismiss" onclick="this.parentElement.remove()">×</button>
    ` : '';
    
    return `
        <div class="${classes}">
            ${children}
            ${dismissButton}
        </div>
    `;
});

// Notification Component
componentSystem.register('Notification', (props) => {
    const { id, message, type = 'info', timestamp } = props;
    
    const typeIcons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const icon = typeIcons[type] || 'ℹ️';
    const time = timestamp ? new Date(timestamp).toLocaleTimeString() : '';
    
    return `
        <div class="notification notification-${type}" data-id="${id}">
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <span class="notification-time">${time}</span>
            </div>
            <button class="notification-close" onclick="window.appState.removeNotification(${id})">×</button>
        </div>
    `;
});

// Tab Component
componentSystem.register('Tabs', (props, children) => {
    const { activeTab, tabs = [], onTabChange = '' } = props;
    
    const tabHeaders = tabs.map(tab => `
        <button 
            class="tab-button ${activeTab === tab.id ? 'tab-active' : ''}"
            onclick="${onTabChange}('${tab.id}')"
        >
            ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
            ${tab.label}
        </button>
    `).join('');
    
    return `
        <div class="tabs">
            <div class="tab-headers">
                ${tabHeaders}
            </div>
            <div class="tab-content">
                ${children}
            </div>
        </div>
    `;
});

// DataTable Component
componentSystem.register('DataTable', (props) => {
    const { 
        data = [], 
        columns = [], 
        emptyMessage = 'No hay datos disponibles',
        className = '' 
    } = props;
    
    if (!data.length) {
        return `
            <div class="data-table-empty ${className}">
                <p>${emptyMessage}</p>
            </div>
        `;
    }
    
    const headers = columns.map(col => `
        <th class="table-header">${col.label}</th>
    `).join('');
    
    const rows = data.map(item => {
        const cells = columns.map(col => {
            let value = item[col.key];
            
            // Formatear valor según tipo de columna
            if (col.type === 'currency') {
                value = `$${parseFloat(value).toLocaleString()}`;
            } else if (col.type === 'date') {
                value = new Date(value).toLocaleDateString();
            } else if (col.render && typeof col.render === 'function') {
                value = col.render(value, item);
            }
            
            return `<td class="table-cell">${value}</td>`;
        }).join('');
        
        return `<tr class="table-row">${cells}</tr>`;
    }).join('');
    
    return `
        <div class="table-container ${className}">
            <table class="data-table">
                <thead>
                    <tr class="table-header-row">
                        ${headers}
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
});

// Layout Components
componentSystem.register('Container', (props, children) => {
    const { className = '' } = props;
    return `<div class="container ${className}">${children}</div>`;
});

componentSystem.register('Grid', (props, children) => {
    const { cols = 1, gap = 'md', className = '' } = props;
    const classes = `grid grid-cols-${cols} gap-${gap} ${className}`;
    return `<div class="${classes}">${children}</div>`;
});

componentSystem.register('Flex', (props, children) => {
    const { 
        direction = 'row', 
        justify = 'start', 
        align = 'start', 
        gap = 'md',
        className = '' 
    } = props;
    
    const classes = `flex flex-${direction} justify-${justify} items-${align} gap-${gap} ${className}`;
    return `<div class="${classes}">${children}</div>`;
});

// Utility functions para componentes
const ComponentUtils = {
    // Renderizar lista de componentes
    renderList(items, componentName, propMapper = item => item) {
        return items.map((item, index) => {
            const props = typeof propMapper === 'function' ? propMapper(item, index) : item;
            return componentSystem.render(componentName, props);
        }).join('');
    },
    
    // Conditional rendering
    renderIf(condition, html) {
        return condition ? html : '';
    },
    
    // Render con fallback
    renderWithFallback(html, fallback = '') {
        return html || fallback;
    },
    
    // Escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Generar ID único
    generateId(prefix = 'component') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Exportar
window.ComponentUtils = ComponentUtils;

console.log('✅ Sistema de componentes configurado con', componentSystem.templates.size, 'componentes');

export { componentSystem, ComponentUtils };
