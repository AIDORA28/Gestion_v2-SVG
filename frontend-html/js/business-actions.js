// js/business-actions.js - Acciones de negocio (equivale a React custom hooks + actions)

class BusinessActions {
    constructor() {
        this.loadingStates = new Map();
        console.log('💼 BusinessActions inicializado');
    }
    
    // Gestión de estados de loading por acción
    setActionLoading(actionName, isLoading) {
        this.loadingStates.set(actionName, isLoading);
        console.log(`⏳ ${actionName}: ${isLoading ? 'loading' : 'completed'}`);
    }
    
    isActionLoading(actionName) {
        return this.loadingStates.get(actionName) || false;
    }
    
    // ===== ACCIONES DE INGRESOS =====
    
    async loadIngresos() {
        const actionName = 'load-ingresos';
        
        try {
            this.setActionLoading(actionName, true);
            const user = window.appState.getState('user');
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log('📥 Cargando ingresos...');
            const ingresos = await window.dataService.getIngresos(user.id);
            
            // Actualizar estado
            window.appState.setState('data.ingresos', ingresos);
            
            console.log(`✅ ${ingresos.length} ingresos cargados`);
            return ingresos;
            
        } catch (error) {
            console.error('❌ Error cargando ingresos:', error);
            window.appState.showNotification('Error cargando ingresos: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async createIngreso(ingresoData) {
        const actionName = 'create-ingreso';
        
        try {
            this.setActionLoading(actionName, true);
            
            // Validar datos
            const validation = window.dataService.validateIngreso(ingresoData);
            if (!validation.isValid) {
                // Mostrar errores de validación
                Object.entries(validation.errors).forEach(([field, error]) => {
                    window.appState.setState(`errors.${field}`, error);
                });
                window.appState.showNotification('Por favor corrige los errores', 'warning');
                return false;
            }
            
            // Limpiar errores previos
            window.appState.setState('errors', {});
            
            console.log('💰 Creando ingreso:', ingresoData);
            const nuevoIngreso = await window.dataService.createIngreso(ingresoData);
            
            // Actualizar estado local
            const ingresosActuales = window.appState.getState('data.ingresos') || [];
            window.appState.setState('data.ingresos', [nuevoIngreso, ...ingresosActuales]);
            
            // Recargar resumen
            await this.loadResumen();
            
            // Resetear formulario y cerrar modal
            window.appState.resetForm('ingreso');
            window.appState.toggleModal('addIngreso', false);
            
            window.appState.showNotification('✅ Ingreso agregado exitosamente', 'success');
            
            console.log('✅ Ingreso creado:', nuevoIngreso);
            return true;
            
        } catch (error) {
            console.error('❌ Error creando ingreso:', error);
            window.appState.showNotification('Error creando ingreso: ' + error.message, 'error');
            return false;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async updateIngreso(id, updates) {
        const actionName = 'update-ingreso';
        
        try {
            this.setActionLoading(actionName, true);
            
            // Validar datos
            const validation = window.dataService.validateIngreso(updates);
            if (!validation.isValid) {
                Object.entries(validation.errors).forEach(([field, error]) => {
                    window.appState.setState(`errors.${field}`, error);
                });
                window.appState.showNotification('Por favor corrige los errores', 'warning');
                return false;
            }
            
            console.log('📝 Actualizando ingreso:', id, updates);
            const ingresoActualizado = await window.dataService.updateIngreso(id, updates);
            
            // Actualizar estado local
            const ingresos = window.appState.getState('data.ingresos') || [];
            const nuevosIngresos = ingresos.map(ing => 
                ing.id === id ? ingresoActualizado : ing
            );
            window.appState.setState('data.ingresos', nuevosIngresos);
            
            // Recargar resumen
            await this.loadResumen();
            
            window.appState.showNotification('✅ Ingreso actualizado', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error actualizando ingreso:', error);
            window.appState.showNotification('Error actualizando ingreso: ' + error.message, 'error');
            return false;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async deleteIngreso(id) {
        const actionName = 'delete-ingreso';
        
        try {
            this.setActionLoading(actionName, true);
            
            console.log('🗑️ Eliminando ingreso:', id);
            await window.dataService.deleteIngreso(id);
            
            // Actualizar estado local
            const ingresos = window.appState.getState('data.ingresos') || [];
            const nuevosIngresos = ingresos.filter(ing => ing.id !== id);
            window.appState.setState('data.ingresos', nuevosIngresos);
            
            // Recargar resumen
            await this.loadResumen();
            
            window.appState.showNotification('✅ Ingreso eliminado', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error eliminando ingreso:', error);
            window.appState.showNotification('Error eliminando ingreso: ' + error.message, 'error');
            return false;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    // ===== ACCIONES DE GASTOS =====
    
    async loadGastos() {
        const actionName = 'load-gastos';
        
        try {
            this.setActionLoading(actionName, true);
            const user = window.appState.getState('user');
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log('💸 Cargando gastos...');
            const gastos = await window.dataService.getGastos(user.id);
            
            // Actualizar estado
            window.appState.setState('data.gastos', gastos);
            
            console.log(`✅ ${gastos.length} gastos cargados`);
            return gastos;
            
        } catch (error) {
            console.error('❌ Error cargando gastos:', error);
            window.appState.showNotification('Error cargando gastos: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async createGasto(gastoData) {
        const actionName = 'create-gasto';
        
        try {
            this.setActionLoading(actionName, true);
            
            // Validar datos
            const validation = window.dataService.validateGasto(gastoData);
            if (!validation.isValid) {
                Object.entries(validation.errors).forEach(([field, error]) => {
                    window.appState.setState(`errors.${field}`, error);
                });
                window.appState.showNotification('Por favor corrige los errores', 'warning');
                return false;
            }
            
            window.appState.setState('errors', {});
            
            console.log('💳 Creando gasto:', gastoData);
            const nuevoGasto = await window.dataService.createGasto(gastoData);
            
            // Actualizar estado local
            const gastosActuales = window.appState.getState('data.gastos') || [];
            window.appState.setState('data.gastos', [nuevoGasto, ...gastosActuales]);
            
            // Recargar resumen
            await this.loadResumen();
            
            // Resetear formulario y cerrar modal
            window.appState.resetForm('gasto');
            window.appState.toggleModal('addGasto', false);
            
            window.appState.showNotification('✅ Gasto agregado exitosamente', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error creando gasto:', error);
            window.appState.showNotification('Error creando gasto: ' + error.message, 'error');
            return false;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async updateGasto(id, updates) {
        const actionName = 'update-gasto';
        
        try {
            this.setActionLoading(actionName, true);
            
            // Validar datos
            const validation = window.dataService.validateGasto(updates);
            if (!validation.isValid) {
                Object.entries(validation.errors).forEach(([field, error]) => {
                    window.appState.setState(`errors.${field}`, error);
                });
                window.appState.showNotification('Por favor corrige los errores', 'warning');
                return false;
            }
            
            console.log('📝 Actualizando gasto:', id, updates);
            const gastoActualizado = await window.dataService.updateGasto(id, updates);
            
            // Actualizar estado local
            const gastos = window.appState.getState('data.gastos') || [];
            const nuevosGastos = gastos.map(gasto => 
                gasto.id === id ? gastoActualizado : gasto
            );
            window.appState.setState('data.gastos', nuevosGastos);
            
            // Recargar resumen
            await this.loadResumen();
            
            window.appState.showNotification('✅ Gasto actualizado', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error actualizando gasto:', error);
            window.appState.showNotification('Error actualizando gasto: ' + error.message, 'error');
            return false;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async deleteGasto(id) {
        const actionName = 'delete-gasto';
        
        try {
            this.setActionLoading(actionName, true);
            
            console.log('🗑️ Eliminando gasto:', id);
            await window.dataService.deleteGasto(id);
            
            // Actualizar estado local
            const gastos = window.appState.getState('data.gastos') || [];
            const nuevosGastos = gastos.filter(gasto => gasto.id !== id);
            window.appState.setState('data.gastos', nuevosGastos);
            
            // Recargar resumen
            await this.loadResumen();
            
            window.appState.showNotification('✅ Gasto eliminado', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error eliminando gasto:', error);
            window.appState.showNotification('Error eliminando gasto: ' + error.message, 'error');
            return false;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    // ===== RESUMEN FINANCIERO =====
    
    async loadResumen() {
        const actionName = 'load-resumen';
        
        try {
            this.setActionLoading(actionName, true);
            const user = window.appState.getState('user');
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log('📊 Calculando resumen financiero...');
            const resumen = await window.dataService.getResumenFinanciero(user.id);
            
            // Actualizar estado
            window.appState.setState('data.resumen', resumen);
            
            console.log('✅ Resumen actualizado:', {
                balance: resumen.balanceActual,
                ingresos: resumen.totalIngresosMes,
                gastos: resumen.totalGastosMes
            });
            
            return resumen;
            
        } catch (error) {
            console.error('❌ Error cargando resumen:', error);
            window.appState.showNotification('Error cargando resumen: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    // ===== PERFIL USUARIO =====
    
    async loadPerfil() {
        const actionName = 'load-perfil';
        
        try {
            this.setActionLoading(actionName, true);
            const user = window.appState.getState('user');
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log('👤 Cargando perfil...');
            const perfil = await window.dataService.getPerfilUsuario(user.id);
            
            // Actualizar estado
            window.appState.setState('data.perfilUsuario', perfil);
            
            console.log('✅ Perfil cargado:', perfil?.nombre || 'Perfil vacío');
            return perfil;
            
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            window.appState.showNotification('Error cargando perfil: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async updatePerfil(perfilData) {
        const actionName = 'update-perfil';
        
        try {
            this.setActionLoading(actionName, true);
            const user = window.appState.getState('user');
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log('👤 Actualizando perfil...', perfilData);
            const perfilActualizado = await window.dataService.createOrUpdatePerfil(user.id, perfilData);
            
            // Actualizar estado
            window.appState.setState('data.perfilUsuario', perfilActualizado);
            
            // Cerrar modal si está abierto
            window.appState.toggleModal('editProfile', false);
            
            window.appState.showNotification('✅ Perfil actualizado', 'success');
            
            return perfilActualizado;
            
        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            window.appState.showNotification('Error actualizando perfil: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    // ===== SIMULADOR DE CRÉDITO =====
    
    calcularSimulacionCredito(monto, tasaAnual, plazoMeses) {
        try {
            const montoNumerico = parseFloat(monto);
            const tasaNumerico = parseFloat(tasaAnual);
            const plazoNumerico = parseInt(plazoMeses);
            
            if (montoNumerico <= 0 || tasaNumerico < 0 || plazoNumerico <= 0) {
                throw new Error('Los valores deben ser positivos');
            }
            
            // Calcular tasa mensual
            const tasaMensual = tasaNumerico / 100 / 12;
            
            // Fórmula de cuota fija (sistema francés)
            let cuotaMensual;
            if (tasaMensual === 0) {
                // Si no hay interés, dividir por el plazo
                cuotaMensual = montoNumerico / plazoNumerico;
            } else {
                cuotaMensual = montoNumerico * (tasaMensual * Math.pow(1 + tasaMensual, plazoNumerico)) / 
                              (Math.pow(1 + tasaMensual, plazoNumerico) - 1);
            }
            
            const totalAPagar = cuotaMensual * plazoNumerico;
            const totalIntereses = totalAPagar - montoNumerico;
            
            // Generar tabla de amortización (primeras 12 cuotas para mostrar)
            const tablaAmortizacion = [];
            let saldoPendiente = montoNumerico;
            
            for (let mes = 1; mes <= Math.min(plazoNumerico, 12); mes++) {
                const interesMes = saldoPendiente * tasaMensual;
                const capitalMes = cuotaMensual - interesMes;
                saldoPendiente -= capitalMes;
                
                tablaAmortizacion.push({
                    mes,
                    cuota: cuotaMensual,
                    capital: capitalMes,
                    interes: interesMes,
                    saldo: Math.max(0, saldoPendiente)
                });
            }
            
            return {
                monto: montoNumerico,
                tasaAnual: tasaNumerico,
                plazoMeses: plazoNumerico,
                cuotaMensual: Math.round(cuotaMensual),
                totalAPagar: Math.round(totalAPagar),
                totalIntereses: Math.round(totalIntereses),
                tablaAmortizacion,
                fecha: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error en simulación:', error);
            throw error;
        }
    }
    
    async saveSimulacion(simulacionData) {
        const actionName = 'save-simulacion';
        
        try {
            this.setActionLoading(actionName, true);
            
            console.log('💾 Guardando simulación...', simulacionData);
            const simulacionGuardada = await window.dataService.saveSimulacion(simulacionData);
            
            // Actualizar lista de simulaciones en estado
            const simulaciones = window.appState.getState('data.simulaciones') || [];
            window.appState.setState('data.simulaciones', [simulacionGuardada, ...simulaciones]);
            
            window.appState.showNotification('✅ Simulación guardada', 'success');
            
            return simulacionGuardada;
            
        } catch (error) {
            console.error('❌ Error guardando simulación:', error);
            window.appState.showNotification('Error guardando simulación: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    async loadSimulaciones() {
        const actionName = 'load-simulaciones';
        
        try {
            this.setActionLoading(actionName, true);
            const user = window.appState.getState('user');
            
            if (!user) {
                throw new Error('Usuario no autenticado');
            }
            
            console.log('💾 Cargando simulaciones...');
            const simulaciones = await window.dataService.getSimulaciones(user.id);
            
            // Actualizar estado
            window.appState.setState('data.simulaciones', simulaciones);
            
            console.log(`✅ ${simulaciones.length} simulaciones cargadas`);
            return simulaciones;
            
        } catch (error) {
            console.error('❌ Error cargando simulaciones:', error);
            window.appState.showNotification('Error cargando simulaciones: ' + error.message, 'error');
            throw error;
        } finally {
            this.setActionLoading(actionName, false);
        }
    }
    
    // ===== CARGA INICIAL COMPLETA =====
    
    async loadAllData() {
        const actionName = 'load-all-data';
        
        try {
            this.setActionLoading(actionName, true);
            window.appState.showGlobalLoading();
            
            console.log('🔄 Cargando todos los datos...');
            
            // Cargar datos en paralelo
            await Promise.all([
                this.loadPerfil().catch(e => console.warn('Perfil no disponible:', e.message)),
                this.loadIngresos().catch(e => console.warn('Error cargando ingresos:', e.message)),
                this.loadGastos().catch(e => console.warn('Error cargando gastos:', e.message)),
                this.loadSimulaciones().catch(e => console.warn('Error cargando simulaciones:', e.message))
            ]);
            
            // Cargar resumen después de tener ingresos y gastos
            await this.loadResumen().catch(e => console.warn('Error cargando resumen:', e.message));
            
            console.log('✅ Todos los datos cargados');
            
        } catch (error) {
            console.error('❌ Error en carga completa:', error);
            window.appState.showNotification('Error cargando datos: ' + error.message, 'error');
        } finally {
            this.setActionLoading(actionName, false);
            window.appState.hideGlobalLoading();
        }
    }
    
    // ===== UTILIDADES =====
    
    // Exportar datos a JSON
    async exportData() {
        try {
            const user = window.appState.getState('user');
            if (!user) throw new Error('Usuario no autenticado');
            
            const [ingresos, gastos, simulaciones, perfil] = await Promise.all([
                window.dataService.getIngresos(user.id),
                window.dataService.getGastos(user.id),
                window.dataService.getSimulaciones(user.id),
                window.dataService.getPerfilUsuario(user.id)
            ]);
            
            const exportData = {
                usuario: user.email,
                fechaExportacion: new Date().toISOString(),
                perfil,
                ingresos,
                gastos,
                simulaciones,
                resumen: window.appState.getState('data.resumen')
            };
            
            // Crear y descargar archivo
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gestion-financiera-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            window.appState.showNotification('✅ Datos exportados exitosamente', 'success');
            
        } catch (error) {
            console.error('❌ Error exportando datos:', error);
            window.appState.showNotification('Error exportando datos: ' + error.message, 'error');
        }
    }
    
    // Limpiar cache
    clearCache() {
        window.dataService.invalidateCache();
        window.appState.showNotification('✅ Cache limpiado', 'info');
    }
}

// Instancia global
const businessActions = new BusinessActions();
window.businessActions = businessActions;

console.log('✅ BusinessActions configurado');

export { businessActions };
