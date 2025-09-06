/**
 * FormHandler mejorado - Manejo de formularios sin perder el cursor
 * Versión 2.0 - Soporte completo para perfil de usuario
 */

class FormHandler {
    constructor() {
        this.formData = new Map(); // Datos de formularios
        this.validationErrors = new Map(); // Errores por formulario
        this.isSubmitting = new Map(); // Estado de envío
        
        console.log('📝 FormHandler v2.0 inicializado');
    }
    
    // Inicializar formulario
    init(formId, initialData = {}) {
        console.log(`🚀 Inicializando formulario: ${formId}`);
        
        this.formData.set(formId, initialData);
        this.validationErrors.set(formId, {});
        this.isSubmitting.set(formId, false);
        
        this.setupFormListeners(formId);
        this.loadInitialData(formId, initialData);
        
        return this;
    }
    
    // Cargar datos iniciales sin disparar validaciones
    loadInitialData(formId, data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = document.querySelector(`#${formId} [name="${key}"]`);
            if (input && value !== undefined) {
                input.value = value;
            }
        });
    }
    
    // Configurar listeners para un formulario
    setupFormListeners(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`❌ Formulario ${formId} no encontrado`);
            return;
        }
        
        // Listener para inputs
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Remover listeners anteriores
            input.removeEventListener('input', input._formHandler);
            input.removeEventListener('blur', input._formBlurHandler);
            
            // Crear handlers específicos
            const inputHandler = (e) => {
                this.updateField(formId, input.name, input.value);
            };
            
            const blurHandler = (e) => {
                this.validateField(formId, input.name, input.value);
            };
            
            // Guardar referencia para poder remover después
            input._formHandler = inputHandler;
            input._formBlurHandler = blurHandler;
            
            // Agregar listeners
            input.addEventListener('input', inputHandler);
            input.addEventListener('blur', blurHandler);
        });
        
        // Listener para submit
        form.removeEventListener('submit', form._submitHandler);
        const submitHandler = (e) => {
            e.preventDefault();
            this.handleSubmit(formId, form);
        };
        form._submitHandler = submitHandler;
        form.addEventListener('submit', submitHandler);
        
        console.log(`📝 Listeners configurados para ${formId}`);
    }
    
    // Actualizar campo (sin validar)
    updateField(formId, fieldName, value) {
        const currentData = this.formData.get(formId) || {};
        currentData[fieldName] = value;
        this.formData.set(formId, currentData);
        
        // Solo limpiar error si existe
        const errors = this.validationErrors.get(formId) || {};
        if (errors[fieldName]) {
            this.validateField(formId, fieldName, value);
        }
    }
    
    // Validar campo individual
    validateField(formId, fieldName, value) {
        const errors = this.validationErrors.get(formId) || {};
        const rule = this.getValidationRule(fieldName);
        
        if (!rule) {
            delete errors[fieldName];
        } else {
            const error = this.validateSingleField(fieldName, value, this.getFormData(formId), rule);
            if (error) {
                errors[fieldName] = error;
            } else {
                delete errors[fieldName];
            }
        }
        
        this.validationErrors.set(formId, errors);
        this.updateFieldError(formId, fieldName, errors[fieldName] || '');
    }
    
    // Validación individual de campo
    validateSingleField(fieldName, value, allData, rule) {
        // Campo requerido
        if (rule.required && (!value || value.trim() === '')) {
            return `${this.getFieldLabel(fieldName)} es requerido`;
        }
        
        // Si no hay valor y no es requerido, no validar más
        if (!value || value.trim() === '') {
            return null;
        }
        
        // Longitud mínima
        if (rule.minLength && value.length < rule.minLength) {
            return `${this.getFieldLabel(fieldName)} debe tener al menos ${rule.minLength} caracteres`;
        }
        
        // Longitud máxima
        if (rule.maxLength && value.length > rule.maxLength) {
            return `${this.getFieldLabel(fieldName)} no puede tener más de ${rule.maxLength} caracteres`;
        }
        
        // Valor mínimo (números)
        if (rule.min !== undefined && parseFloat(value) < rule.min) {
            return `${this.getFieldLabel(fieldName)} debe ser mayor o igual a ${rule.min}`;
        }
        
        // Valor máximo (números)
        if (rule.max !== undefined && parseFloat(value) > rule.max) {
            return `${this.getFieldLabel(fieldName)} debe ser menor o igual a ${rule.max}`;
        }
        
        // Patrón regex
        if (rule.pattern && !rule.pattern.test(value)) {
            return rule.message || `${this.getFieldLabel(fieldName)} tiene formato inválido`;
        }
        
        // Campo de coincidencia
        if (rule.match && value !== allData[rule.match]) {
            return rule.message || `${this.getFieldLabel(fieldName)} no coincide`;
        }
        
        // Valores enum
        if (rule.enum && !rule.enum.includes(value)) {
            return rule.message || `${this.getFieldLabel(fieldName)} no es válido`;
        }
        
        return null;
    }
    
    // Obtener regla de validación para un campo
    getValidationRule(fieldName) {
        const rules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email debe tener formato válido'
            },
            password: {
                required: true,
                minLength: 6,
                message: 'Contraseña debe tener al menos 6 caracteres'
            },
            confirmPassword: {
                required: true,
                match: 'password',
                message: 'Las contraseñas no coinciden'
            },
            nombre: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: 'Nombre debe contener solo letras'
            },
            apellido: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: 'Apellido debe contener solo letras'
            },
            telefono: {
                pattern: /^[\+]?[0-9\s\-\(\)]+$/,
                minLength: 7,
                maxLength: 20,
                message: 'Formato de teléfono inválido'
            },
            dni: {
                pattern: /^[0-9]{7,10}$/,
                message: 'DNI debe contener entre 7 y 10 dígitos'
            },
            edad: {
                min: 18,
                max: 120,
                message: 'Edad debe estar entre 18 y 120 años'
            },
            ocupacion: {
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: 'Ocupación debe contener solo letras'
            },
            dependientes: {
                min: 0,
                max: 20,
                message: 'Número de dependientes debe estar entre 0 y 20'
            },
            estado_civil: {
                enum: ['soltero', 'casado', 'divorciado', 'viudo', 'union_libre'],
                message: 'Estado civil no válido'
            }
        };
        
        return rules[fieldName];
    }
    
    // Obtener etiqueta amigable del campo
    getFieldLabel(fieldName) {
        const labels = {
            email: 'Email',
            password: 'Contraseña',
            confirmPassword: 'Confirmación de contraseña',
            nombre: 'Nombre',
            apellido: 'Apellido',
            telefono: 'Teléfono',
            dni: 'DNI',
            edad: 'Edad',
            ocupacion: 'Ocupación',
            dependientes: 'Dependientes',
            estado_civil: 'Estado civil'
        };
        
        return labels[fieldName] || fieldName;
    }
    
    // Actualizar error visual de campo específico
    updateFieldError(formId, fieldName, errorMessage) {
        const field = document.querySelector(`#${formId} [name="${fieldName}"]`);
        if (!field) return;
        
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Buscar o crear elemento de error
        let errorDiv = formGroup.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            formGroup.appendChild(errorDiv);
        }
        
        // Actualizar contenido y clase
        errorDiv.textContent = errorMessage;
        
        if (errorMessage) {
            field.classList.add('error');
            formGroup.classList.add('has-error');
        } else {
            field.classList.remove('error');
            formGroup.classList.remove('has-error');
        }
    }
    
    // Validar formulario completo
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        const formData = this.getFormData(formId);
        const errors = {};
        let isValid = true;
        
        // Validar cada campo que tenga reglas
        const inputs = form.querySelectorAll('input[name], textarea[name], select[name]');
        inputs.forEach(input => {
            const fieldName = input.name;
            const value = formData[fieldName] || '';
            const rule = this.getValidationRule(fieldName);
            
            if (rule) {
                const error = this.validateSingleField(fieldName, value, formData, rule);
                if (error) {
                    errors[fieldName] = error;
                    isValid = false;
                }
            }
        });
        
        // Actualizar errores
        this.validationErrors.set(formId, errors);
        
        // Mostrar errores en UI
        Object.keys(errors).forEach(fieldName => {
            this.updateFieldError(formId, fieldName, errors[fieldName]);
        });
        
        console.log(`🔍 Validación ${formId}:`, isValid ? '✅ Válido' : '❌ Errores', errors);
        return isValid;
    }
    
    // Obtener datos del formulario
    getFormData(formId) {
        return { ...(this.formData.get(formId) || {}) };
    }
    
    // Manejar envío del formulario
    async handleSubmit(formId, form) {
        console.log(`📤 Enviando formulario: ${formId}`);
        
        // Validar formulario
        if (!this.validateForm(formId)) {
            console.log('❌ Formulario inválido, cancelando envío');
            return;
        }
        
        // Evitar envíos múltiples
        if (this.isSubmitting.get(formId)) {
            console.log('⏳ Ya se está enviando, ignorando...');
            return;
        }
        
        this.isSubmitting.set(formId, true);
        this.setFormLoading(formId, true);
        
        try {
            const formData = this.getFormData(formId);
            
            // Disparar evento personalizado
            const event = new CustomEvent(`form-submit-${formId}`, {
                detail: { formData, formId, success: null, error: null }
            });
            
            document.dispatchEvent(event);
            
            console.log('✅ Formulario enviado correctamente');
            
        } catch (error) {
            console.error('❌ Error enviando formulario:', error);
            
            // Disparar evento de error
            const errorEvent = new CustomEvent(`form-error-${formId}`, {
                detail: { error, formId }
            });
            document.dispatchEvent(errorEvent);
            
        } finally {
            this.isSubmitting.set(formId, false);
            this.setFormLoading(formId, false);
        }
    }
    
    // Establecer estado de carga
    setFormLoading(formId, isLoading) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? 'Procesando...' : submitBtn.dataset.originalText || 'Enviar';
            
            if (!submitBtn.dataset.originalText) {
                submitBtn.dataset.originalText = submitBtn.textContent;
            }
        }
        
        // Agregar clase de loading al formulario
        form.classList.toggle('loading', isLoading);
    }
    
    // Limpiar formulario
    reset(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
        
        this.formData.set(formId, {});
        this.validationErrors.set(formId, {});
        this.isSubmitting.set(formId, false);
        
        // Limpiar errores visuales
        const errorElements = form?.querySelectorAll('.field-error') || [];
        errorElements.forEach(el => el.textContent = '');
        
        const errorFields = form?.querySelectorAll('.error') || [];
        errorFields.forEach(el => {
            el.classList.remove('error');
            el.closest('.form-group')?.classList.remove('has-error');
        });
        
        console.log(`🧹 Formulario ${formId} limpiado`);
    }
    
    // Limpiar resources
    cleanup(formId) {
        const form = document.getElementById(formId);
        if (form) {
            // Remover todos los listeners
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.removeEventListener('input', input._formHandler);
                input.removeEventListener('blur', input._formBlurHandler);
            });
            
            form.removeEventListener('submit', form._submitHandler);
        }
        
        // Limpiar datos
        this.formData.delete(formId);
        this.validationErrors.delete(formId);
        this.isSubmitting.delete(formId);
        
        console.log(`🗑️ FormHandler ${formId} limpiado`);
    }
}

// Instancia global
window.formHandler = new FormHandler();
console.log('🎯 FormHandler v2.0 listo para usar');
