/**
 * 🧾 SUNAT MODULE HANDLER - CALCULADORA TRIBUTARIA PREMIUM
 * Maneja todas las calculadoras tributarias del Perú
 */

class SunatModuleHandler {
    constructor() {
        console.log('🧾 Inicializando SunatModuleHandler...');
        
        // 📊 CONFIGURACIÓN TRIBUTARIA PERÚ 2024
        this.config = {
            igv: 18,                    // IGV 18%
            uitAnual: 4950,             // UIT 2024: S/ 4,950
            uitMensual: 412.50,         // UIT mensual: S/ 412.50
            renta4ta: 8,                // Retención 4ta categoría: 8%
            bonificacionGrat: 9,        // Bonificación gratificación: 9%
            
            // Escalas Renta 5ta Categoría (anual)
            escalasRenta5ta: [
                { desde: 0, hasta: 5, tasa: 0 },           // 0% hasta 5 UIT
                { desde: 5, hasta: 20, tasa: 8 },          // 8% de 5 a 20 UIT
                { desde: 20, hasta: 35, tasa: 14 },        // 14% de 20 a 35 UIT
                { desde: 35, hasta: 45, tasa: 17 },        // 17% de 35 a 45 UIT
                { desde: 45, hasta: Infinity, tasa: 30 }   // 30% más de 45 UIT
            ]
        };
        
        // 🗂️ HISTORIAL DE CÁLCULOS
        this.historial = this.loadHistorial();
        
        // 🎨 NOTIFICACIONES
        this.notyf = window.notyf || new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' }
        });
        
        console.log('✅ SunatModuleHandler inicializado correctamente');
    }

    /**
     * 🚀 INICIALIZACIÓN PRINCIPAL
     */
    async init() {
        try {
            console.log('🚀 Inicializando módulo SUNAT...');
            
            // Cargar configuración guardada
            this.loadConfig();
            
            // Renderizar historial
            this.renderHistorial();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ Módulo SUNAT inicializado exitosamente');
            
        } catch (error) {
            console.error('❌ Error inicializando módulo SUNAT:', error);
            this.showError('Error al inicializar el módulo SUNAT');
        }
    }

    /**
     * 🔢 CALCULADORA IGV
     */
    calcularIGV() {
        try {
            const baseInput = document.getElementById('igv-base');
            const base = parseFloat(baseInput.value) || 0;
            
            if (base <= 0) {
                this.showWarning('Ingresa un monto base válido');
                baseInput.focus();
                return;
            }
            
            const igvPorcentaje = this.config.igv;
            const igvMonto = base * (igvPorcentaje / 100);
            const total = base + igvMonto;
            
            // Mostrar resultados
            document.getElementById('igv-base-result').textContent = this.formatMoney(base);
            document.getElementById('igv-impuesto-result').textContent = this.formatMoney(igvMonto);
            document.getElementById('igv-total-result').textContent = this.formatMoney(total);
            document.getElementById('igv-resultado').classList.remove('hidden');
            document.getElementById('igv-resultado').classList.add('resultado-animado');
            
            // Agregar al historial
            this.addToHistorial('IGV', {
                tipo: 'IGV',
                base: base,
                porcentaje: igvPorcentaje,
                impuesto: igvMonto,
                total: total,
                detalle: `Base: S/ ${this.formatMoney(base)} + IGV (${igvPorcentaje}%): S/ ${this.formatMoney(igvMonto)} = S/ ${this.formatMoney(total)}`
            });
            
            this.showSuccess(`IGV calculado: S/ ${this.formatMoney(igvMonto)}`);
            
        } catch (error) {
            console.error('Error calculando IGV:', error);
            this.showError('Error al calcular el IGV');
        }
    }

    /**
     * 👨‍💼 CALCULADORA RENTA 5TA CATEGORÍA
     */
    calcularRenta5ta() {
        try {
            const sueldoInput = document.getElementById('renta5-sueldo');
            const sueldoMensual = parseFloat(sueldoInput.value) || 0;
            
            if (sueldoMensual <= 0) {
                this.showWarning('Ingresa un sueldo válido');
                sueldoInput.focus();
                return;
            }
            
            const sueldoAnual = sueldoMensual * 12;
            const uitAnual = this.config.uitAnual;
            const sueldoEnUIT = sueldoAnual / uitAnual;
            
            // Calcular impuesto según escala
            let impuestoAnual = 0;
            let sueldoRestante = sueldoEnUIT;
            
            for (const escala of this.config.escalasRenta5ta) {
                if (sueldoRestante <= 0) break;
                
                const rangoBase = Math.max(0, escala.desde);
                const rangoTope = escala.hasta;
                const rangoAplicable = Math.min(sueldoRestante, rangoTope - rangoBase);
                
                if (rangoAplicable > 0 && sueldoEnUIT > escala.desde) {
                    const montoGravado = Math.min(rangoAplicable, sueldoEnUIT - escala.desde) * uitAnual;
                    impuestoAnual += montoGravado * (escala.tasa / 100);
                }
            }
            
            const impuestoMensual = impuestoAnual / 12;
            const sueldoNeto = sueldoMensual - impuestoMensual;
            
            // Mostrar resultados
            document.getElementById('renta5-bruto-result').textContent = this.formatMoney(sueldoMensual);
            document.getElementById('renta5-uit-result').textContent = this.formatMoney(this.config.uitMensual);
            document.getElementById('renta5-impuesto-result').textContent = this.formatMoney(impuestoMensual);
            document.getElementById('renta5-neto-result').textContent = this.formatMoney(sueldoNeto);
            document.getElementById('renta5-resultado').classList.remove('hidden');
            document.getElementById('renta5-resultado').classList.add('resultado-animado');
            
            // Agregar al historial
            this.addToHistorial('Renta 5ta', {
                tipo: 'Renta 5ta Categoría',
                sueldoBruto: sueldoMensual,
                impuesto: impuestoMensual,
                sueldoNeto: sueldoNeto,
                sueldoEnUIT: sueldoEnUIT.toFixed(2),
                detalle: `Sueldo: S/ ${this.formatMoney(sueldoMensual)} - Renta: S/ ${this.formatMoney(impuestoMensual)} = S/ ${this.formatMoney(sueldoNeto)} (${sueldoEnUIT.toFixed(2)} UIT)`
            });
            
            this.showSuccess(`Renta 5ta calculada: S/ ${this.formatMoney(impuestoMensual)}`);
            
        } catch (error) {
            console.error('Error calculando Renta 5ta:', error);
            this.showError('Error al calcular la Renta 5ta Categoría');
        }
    }

    /**
     * 💼 CALCULADORA RENTA 4TA CATEGORÍA
     */
    calcularRenta4ta() {
        try {
            const honorariosInput = document.getElementById('renta4-honorarios');
            const honorarios = parseFloat(honorariosInput.value) || 0;
            
            if (honorarios <= 0) {
                this.showWarning('Ingresa un monto de honorarios válido');
                honorariosInput.focus();
                return;
            }
            
            const porcentajeRetencion = this.config.renta4ta;
            const retencion = honorarios * (porcentajeRetencion / 100);
            const aCobrar = honorarios - retencion;
            
            // Mostrar resultados
            document.getElementById('renta4-honorarios-result').textContent = this.formatMoney(honorarios);
            document.getElementById('renta4-retencion-result').textContent = this.formatMoney(retencion);
            document.getElementById('renta4-neto-result').textContent = this.formatMoney(aCobrar);
            document.getElementById('renta4-resultado').classList.remove('hidden');
            document.getElementById('renta4-resultado').classList.add('resultado-animado');
            
            // Agregar al historial
            this.addToHistorial('Renta 4ta', {
                tipo: 'Renta 4ta Categoría',
                honorarios: honorarios,
                retencion: retencion,
                aCobrar: aCobrar,
                porcentaje: porcentajeRetencion,
                detalle: `Honorarios: S/ ${this.formatMoney(honorarios)} - Retención (${porcentajeRetencion}%): S/ ${this.formatMoney(retencion)} = S/ ${this.formatMoney(aCobrar)}`
            });
            
            this.showSuccess(`Retención 4ta calculada: S/ ${this.formatMoney(retencion)}`);
            
        } catch (error) {
            console.error('Error calculando Renta 4ta:', error);
            this.showError('Error al calcular la Renta 4ta Categoría');
        }
    }

    /**
     * 🎁 CALCULADORA GRATIFICACIONES
     */
    calcularGratificacion() {
        try {
            const sueldoInput = document.getElementById('grat-sueldo');
            const mesesSelect = document.getElementById('grat-meses');
            
            const sueldo = parseFloat(sueldoInput.value) || 0;
            const meses = parseInt(mesesSelect.value) || 6;
            
            if (sueldo <= 0) {
                this.showWarning('Ingresa un sueldo básico válido');
                sueldoInput.focus();
                return;
            }
            
            // Cálculo de gratificación
            const gratificacion = (sueldo * meses) / 6; // Proporcional a 6 meses
            const bonificacion = gratificacion * (this.config.bonificacionGrat / 100);
            const totalBruto = gratificacion + bonificacion;
            
            // Mostrar resultados
            document.getElementById('grat-bruto-result').textContent = this.formatMoney(gratificacion);
            document.getElementById('grat-bonif-result').textContent = this.formatMoney(bonificacion);
            document.getElementById('grat-total-result').textContent = this.formatMoney(totalBruto);
            document.getElementById('grat-resultado').classList.remove('hidden');
            document.getElementById('grat-resultado').classList.add('resultado-animado');
            
            // Agregar al historial
            this.addToHistorial('Gratificación', {
                tipo: 'Gratificación',
                sueldo: sueldo,
                meses: meses,
                gratificacion: gratificacion,
                bonificacion: bonificacion,
                total: totalBruto,
                detalle: `${meses} meses: S/ ${this.formatMoney(gratificacion)} + Bonif. (${this.config.bonificacionGrat}%): S/ ${this.formatMoney(bonificacion)} = S/ ${this.formatMoney(totalBruto)}`
            });
            
            this.showSuccess(`Gratificación calculada: S/ ${this.formatMoney(totalBruto)}`);
            
        } catch (error) {
            console.error('Error calculando gratificación:', error);
            this.showError('Error al calcular la gratificación');
        }
    }

    /**
     * ⚙️ ACTUALIZAR CONFIGURACIÓN
     */
    updateConfig() {
        try {
            const newConfig = {
                igv: parseFloat(document.getElementById('config-igv').value) || 18,
                uitAnual: parseFloat(document.getElementById('config-uit').value) || 4950,
                renta4ta: parseFloat(document.getElementById('config-renta4').value) || 8,
                bonificacionGrat: parseFloat(document.getElementById('config-bonif').value) || 9
            };
            
            // Validaciones
            if (newConfig.igv < 0 || newConfig.igv > 30) {
                this.showError('El IGV debe estar entre 0% y 30%');
                return;
            }
            
            if (newConfig.uitAnual < 1000 || newConfig.uitAnual > 10000) {
                this.showError('La UIT debe estar entre S/ 1,000 y S/ 10,000');
                return;
            }
            
            // Actualizar configuración
            this.config = { ...this.config, ...newConfig };
            this.config.uitMensual = this.config.uitAnual / 12;
            
            // Guardar en localStorage
            this.saveConfig();
            
            this.showSuccess('✅ Configuración actualizada correctamente');
            
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            this.showError('Error al actualizar la configuración');
        }
    }

    /**
     * 📝 GESTIÓN DE HISTORIAL
     */
    addToHistorial(tipo, datos) {
        const registro = {
            id: this.generateId(),
            tipo: tipo,
            timestamp: new Date(),
            datos: datos
        };
        
        this.historial.unshift(registro);
        
        // Mantener solo los últimos 50 registros
        if (this.historial.length > 50) {
            this.historial = this.historial.slice(0, 50);
        }
        
        this.saveHistorial();
        this.renderHistorial();
    }

    renderHistorial() {
        const container = document.getElementById('sunat-historial');
        if (!container) return;
        
        if (this.historial.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-calculator text-4xl text-gray-300 mb-4"></i>
                    <p>No hay cálculos realizados aún</p>
                    <p class="text-sm">Usa las calculadoras de arriba para empezar</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.historial.map(registro => `
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center">
                        <span class="inline-block w-3 h-3 rounded-full ${this.getTipoColor(registro.tipo)} mr-2"></span>
                        <span class="font-medium text-gray-900">${registro.tipo}</span>
                    </div>
                    <span class="text-xs text-gray-500">${this.formatDateTime(registro.timestamp)}</span>
                </div>
                <p class="text-sm text-gray-600">${registro.datos.detalle}</p>
                <div class="flex justify-end mt-2">
                    <button onclick="window.sunatModuleHandler.deleteHistorialItem('${registro.id}')" 
                            class="text-xs text-red-500 hover:text-red-700 transition-colors duration-200">
                        <i class="fas fa-trash mr-1"></i>Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
            this.historial = [];
            this.saveHistorial();
            this.renderHistorial();
            this.showSuccess('Historial limpiado correctamente');
        }
    }

    deleteHistorialItem(id) {
        this.historial = this.historial.filter(item => item.id !== id);
        this.saveHistorial();
        this.renderHistorial();
        this.showSuccess('Registro eliminado');
    }

    /**
     * 🔧 UTILIDADES
     */
    formatMoney(amount) {
        return new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    getTipoColor(tipo) {
        const colors = {
            'IGV': 'bg-blue-500',
            'Renta 5ta': 'bg-green-500',
            'Renta 4ta': 'bg-purple-500',
            'Gratificación': 'bg-yellow-500'
        };
        return colors[tipo] || 'bg-gray-500';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 💾 PERSISTENCIA
     */
    saveConfig() {
        localStorage.setItem('sunat_config', JSON.stringify(this.config));
    }

    loadConfig() {
        const saved = localStorage.getItem('sunat_config');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
            
            // Actualizar inputs
            document.getElementById('config-igv').value = this.config.igv;
            document.getElementById('config-uit').value = this.config.uitAnual;
            document.getElementById('config-renta4').value = this.config.renta4ta;
            document.getElementById('config-bonif').value = this.config.bonificacionGrat;
        }
    }

    saveHistorial() {
        localStorage.setItem('sunat_historial', JSON.stringify(this.historial));
    }

    loadHistorial() {
        const saved = localStorage.getItem('sunat_historial');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * 🎛️ EVENT LISTENERS
     */
    setupEventListeners() {
        // Event listeners para Enter en inputs
        const inputs = ['igv-base', 'renta5-sueldo', 'renta4-honorarios', 'grat-sueldo'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        // Disparar el cálculo correspondiente
                        const calculatorMap = {
                            'igv-base': () => this.calcularIGV(),
                            'renta5-sueldo': () => this.calcularRenta5ta(),
                            'renta4-honorarios': () => this.calcularRenta4ta(),
                            'grat-sueldo': () => this.calcularGratificacion()
                        };
                        calculatorMap[inputId]?.();
                    }
                });
            }
        });
    }

    /**
     * 🎨 NOTIFICACIONES
     */
    showSuccess(message) {
        if (this.notyf) {
            this.notyf.success(message);
        } else {
            console.log('✅', message);
        }
    }

    showError(message) {
        if (this.notyf) {
            this.notyf.error(message);
        } else {
            console.error('❌', message);
        }
    }

    showWarning(message) {
        if (this.notyf) {
            this.notyf.open({
                type: 'warning',
                message: message,
                background: '#f59e0b'
            });
        } else {
            console.warn('⚠️', message);
        }
    }

    showInfo(message) {
        if (this.notyf) {
            this.notyf.open({
                type: 'info',
                message: message,
                background: '#3b82f6'
            });
        } else {
            console.info('ℹ️', message);
        }
    }
}

// 🌍 INICIALIZACIÓN GLOBAL
window.sunatModuleHandler = new SunatModuleHandler();

console.log('🧾 SunatModuleHandler cargado y disponible globalmente');
