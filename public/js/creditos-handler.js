/**
 * 🎯 HANDLER PREMIUM PARA GESTIÓN DE CRÉDITOS
 * Maneja toda la funcionalidad del módulo de simulación de créditos
 * Integración completa con Supabase y diseño premium CDN
 */

class CreditosModuleHandler {
    constructor() {
        this.creditos = [];
        this.filteredCreditos = [];
        this.currentEditId = null;
        this.isLoading = false;
        this.supabaseClient = null;
        
        // Configuración de notificaciones premium
        this.notyf = new Notyf({
            duration: 4000,
            position: { x: 'right', y: 'top' },
            types: [
                {
                    type: 'success',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    icon: {
                        className: 'fas fa-check-circle',
                        tagName: 'i',
                        color: 'white'
                    }
                },
                {
                    type: 'error',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    icon: {
                        className: 'fas fa-exclamation-triangle',
                        tagName: 'i',
                        color: 'white'
                    }
                },
                {
                    type: 'warning',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    icon: {
                        className: 'fas fa-exclamation-circle',
                        tagName: 'i',
                        color: 'white'
                    }
                },
                {
                    type: 'info',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    icon: {
                        className: 'fas fa-info-circle',
                        tagName: 'i',
                        color: 'white'
                    }
                }
            ]
        });

        this.init();
    }

    async init() {
        console.log('🎯 Inicializando CreditosModuleHandler Premium...');
        
        try {
            // Configurar Supabase
            await this.setupSupabase();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar datos iniciales
            await this.loadCreditos();
            
            // Configurar filtros
            this.setupFilters();
            
            // Inicializar animaciones AOS si está disponible
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true
                });
            }
            
            console.log('✅ CreditosModuleHandler inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando CreditosModuleHandler:', error);
            this.showError('Error al inicializar el módulo de créditos');
        }
    }

    async setupSupabase() {
        try {
            // 🎯 USAR EL MISMO PATRÓN QUE INGRESOS (que funciona)
            this.supabaseConfig = window.supabaseConfig || {
                url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
                key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
            };
            this.supabaseUrl = this.supabaseConfig.url;
            this.supabaseKey = this.supabaseConfig.key;
            
            // Obtener token y usuario del localStorage (como ingresos)
            this.authToken = localStorage.getItem('supabase_access_token');
            const userData = localStorage.getItem('currentUser');
            
            if (!this.authToken) {
                throw new Error('Token de autenticación no encontrado');
            }
            
            if (userData) {
                const user = JSON.parse(userData);
                this.usuarioId = user.id;
                console.log('✅ Supabase configurado con token real del usuario');
            } else {
                throw new Error('Datos de usuario no encontrados');
            }
        } catch (error) {
            console.error('❌ Error configurando Supabase:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Event listeners se configurarán cuando el template se cargue
        console.log('🎧 Configurando event listeners...');
        
        // Configurar después de que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEventListeners());
        } else {
            this.bindEventListeners();
        }
        
        // También configurar después de un pequeño delay para asegurar que el template se haya cargado
        setTimeout(() => {
            this.bindEventListeners();
        }, 1000);
    }

    bindEventListeners() {
        console.log('🔗 Configurando event listeners principales...');
        
        // NOTA: Los event listeners del modal (form y botón simular) se configuran
        // en bindModalEventListeners() cuando se abre el modal
        
        // Filtros
        const filterMonto = document.getElementById('filter-monto-creditos');
        const filterPlazo = document.getElementById('filter-plazo-creditos');
        const filterFecha = document.getElementById('filter-fecha-creditos');
        
        if (filterMonto) filterMonto.addEventListener('change', () => this.applyFilters());
        if (filterPlazo) filterPlazo.addEventListener('change', () => this.applyFilters());
        if (filterFecha) filterFecha.addEventListener('change', () => this.applyFilters());

        // Botón limpiar filtros
        const clearFilters = document.getElementById('clear-filters-creditos');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // Botón exportar
        const exportBtn = document.getElementById('export-creditos');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportFiltered());
        }

        console.log('✅ Event listeners principales configurados');
    }

    async loadCreditos() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoader();
            
            console.log('📥 Cargando simulaciones de crédito...');
            
            // 🎯 USAR EL MISMO PATRÓN QUE INGRESOS (fetch directo)
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/simulaciones_credito?usuario_id=eq.${this.usuarioId}&select=*&order=created_at.desc`, 
                {
                    method: 'GET',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.authToken}`, // 🔑 TOKEN REAL
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('❌ Token expirado - redirigiendo a login');
                    window.location.href = '/auth.html';
                    return;
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.creditos = data || [];
            this.filteredCreditos = [...this.creditos];
            
            console.log(`✅ ${this.creditos.length} simulaciones cargadas`);
            
            this.renderCreditos();
            this.updateStats();
            this.updateFilters();
            
            // Mostrar indicador de estado
            this.showTableStatus();
            
        } catch (error) {
            console.error('❌ Error cargando créditos:', error);
            this.showError('Error al cargar las simulaciones de crédito');
        } finally {
            this.isLoading = false;
            this.hideLoader();
        }
    }

    renderCreditos() {
        const tbody = document.getElementById('creditos-table-body');
        const noCreditos = document.getElementById('no-creditos');
        const creditosCount = document.getElementById('creditos-count');
        
        if (!tbody) return;
        
        // Actualizar contador
        if (creditosCount) {
            const count = this.filteredCreditos.length;
            creditosCount.innerHTML = `
                <i class="fas fa-calculator mr-2 text-purple-500"></i>
                ${count} ${count === 1 ? 'simulación' : 'simulaciones'}
            `;
        }
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (this.filteredCreditos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center justify-center space-y-4">
                            <i class="fas fa-calculator text-6xl text-gray-300"></i>
                            <h3 class="text-lg font-medium text-gray-900">No hay simulaciones</h3>
                            <p class="text-gray-500">No se encontraron simulaciones con los filtros actuales</p>
                            <button onclick="window.creditosModuleHandler.clearFilters()" 
                                    class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                                <i class="fas fa-broom mr-2"></i>Limpiar filtros
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Renderizar filas con efectos premium
        this.filteredCreditos.forEach((credito, index) => {
            const row = this.createCreditoRow(credito, index);
            tbody.appendChild(row);
            
            // Animación de entrada escalonada
            setTimeout(() => {
                row.classList.add('animate-fadeIn');
            }, index * 50);
        });
    }

    createCreditoRow(credito, index) {
        const row = document.createElement('tr');
        row.className = 'group simulacion-row hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer';
        row.style.opacity = '0';
        
        // Calcular valores derivados
        const cuotaMensual = this.calcularCuotaMensual(credito.monto, credito.tasa_anual, credito.plazo_meses);
        const totalPagar = cuotaMensual * credito.plazo_meses;
        
        // Formatear fecha
        const fecha = new Date(credito.created_at || credito.fecha_simulacion).toLocaleDateString('es-ES');
        
        // Determinar clase de tasa según el valor
        let tasaClass = 'tasa-media';
        if (credito.tasa_anual <= 15) tasaClass = 'tasa-baja';
        else if (credito.tasa_anual >= 25) tasaClass = 'tasa-alta';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-calendar-alt text-purple-500"></i>
                    <span class="font-medium">${fecha}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-dollar-sign text-green-500"></i>
                    <span class="font-bold monto-credito">$${credito.monto.toLocaleString('es-ES')}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-percent text-blue-500"></i>
                    <span class="font-semibold ${tasaClass}">${credito.tasa_anual}%</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-clock text-orange-500"></i>
                    <span class="font-medium">${credito.plazo_meses} meses</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-money-bill text-yellow-500"></i>
                    <span class="font-bold cuota-mensual">$${cuotaMensual.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-receipt text-red-500"></i>
                    <span class="font-bold total-pagar">$${totalPagar.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                    <button onclick="window.creditosModuleHandler.editCredito('${credito.id}')" 
                            class="group/btn text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-all duration-200"
                            title="Editar simulación">
                        <i class="fas fa-edit group-hover/btn:animate-pulse"></i>
                    </button>
                    <button onclick="window.creditosModuleHandler.deleteCredito('${credito.id}')" 
                            class="group/btn text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-all duration-200"
                            title="Eliminar simulación">
                        <i class="fas fa-trash group-hover/btn:animate-bounce"></i>
                    </button>
                    <button onclick="window.creditosModuleHandler.duplicateCredito('${credito.id}')" 
                            class="group/btn text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-100 transition-all duration-200"
                            title="Duplicar simulación">
                        <i class="fas fa-copy group-hover/btn:animate-pulse"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    calcularCuotaMensual(monto, tasaAnual, plazoMeses) {
        const tasaMensual = tasaAnual / 100 / 12;
        
        if (tasaMensual === 0) {
            return monto / plazoMeses;
        }
        
        const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                     (Math.pow(1 + tasaMensual, plazoMeses) - 1);
        
        return cuota;
    }

    updateStats() {
        if (this.creditos.length === 0) {
            this.renderEmptyStats();
            return;
        }
        
        const stats = this.calculateStats();
        this.renderStats(stats);
    }

    calculateStats() {
        const total = this.creditos.length;
        const montoPromedio = this.creditos.length > 0 
            ? this.creditos.reduce((sum, c) => sum + c.monto, 0) / this.creditos.length 
            : 0;
        const tasaPromedio = this.creditos.length > 0
            ? this.creditos.reduce((sum, c) => sum + c.tasa_anual, 0) / this.creditos.length
            : 0;
        const plazoPromedio = this.creditos.length > 0
            ? Math.round(this.creditos.reduce((sum, c) => sum + c.plazo_meses, 0) / this.creditos.length)
            : 0;
        
        return {
            total,
            montoPromedio,
            tasaPromedio,
            plazoPromedio
        };
    }

    renderStats(stats) {
        const statsContainer = document.getElementById('creditos-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <!-- Total Simulaciones -->
            <div class="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 shadow-lg border border-purple-200 transform hover:scale-105 transition-all duration-200" data-aos="fade-up" data-aos-delay="100">
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <p class="text-sm font-medium text-purple-700">Total Simulaciones</p>
                        <p class="text-3xl font-bold text-purple-900">${stats.total}</p>
                        <p class="text-xs text-purple-600">
                            <i class="fas fa-calculator mr-1"></i>
                            Simulaciones creadas
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-list text-white text-xl animate-pulse"></i>
                    </div>
                </div>
            </div>

            <!-- Monto Promedio -->
            <div class="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 shadow-lg border border-green-200 transform hover:scale-105 transition-all duration-200" data-aos="fade-up" data-aos-delay="200">
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <p class="text-sm font-medium text-green-700">Monto Promedio</p>
                        <p class="text-3xl font-bold text-green-900">$${stats.montoPromedio.toLocaleString('es-ES', {maximumFractionDigits: 0})}</p>
                        <p class="text-xs text-green-600">
                            <i class="fas fa-chart-line mr-1"></i>
                            Promedio de créditos
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-dollar-sign text-white text-xl animate-money-float"></i>
                    </div>
                </div>
            </div>

            <!-- Tasa Promedio -->
            <div class="bg-gradient-to-br from-blue-100 to-sky-100 rounded-2xl p-6 shadow-lg border border-blue-200 transform hover:scale-105 transition-all duration-200" data-aos="fade-up" data-aos-delay="300">
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <p class="text-sm font-medium text-blue-700">Tasa Promedio</p>
                        <p class="text-3xl font-bold text-blue-900">${stats.tasaPromedio.toFixed(1)}%</p>
                        <p class="text-xs text-blue-600">
                            <i class="fas fa-percentage mr-1"></i>
                            Tasa anual promedio
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-percent text-white text-xl animate-pulse"></i>
                    </div>
                </div>
            </div>

            <!-- Plazo Promedio -->
            <div class="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6 shadow-lg border border-orange-200 transform hover:scale-105 transition-all duration-200" data-aos="fade-up" data-aos-delay="400">
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <p class="text-sm font-medium text-orange-700">Plazo Promedio</p>
                        <p class="text-3xl font-bold text-orange-900">${stats.plazoPromedio} <span class="text-lg">meses</span></p>
                        <p class="text-xs text-orange-600">
                            <i class="fas fa-clock mr-1"></i>
                            Duración promedio
                        </p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-calendar-alt text-white text-xl animate-pulse"></i>
                    </div>
                </div>
            </div>
        `;
        
        // Reinicializar AOS para las nuevas estadísticas
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    renderEmptyStats() {
        const statsContainer = document.getElementById('creditos-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="col-span-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
                <i class="fas fa-calculator text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No hay simulaciones aún</h3>
                <p class="text-gray-600 mb-4">Crea tu primera simulación para ver las estadísticas</p>
                <button onclick="window.creditosModuleHandler.openCreditoModal()" 
                        class="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                    <i class="fas fa-plus mr-2"></i>Primera Simulación
                </button>
            </div>
        `;
    }

    // Modal y formulario
    openCreditoModal(creditoId = null) {
        const modal = document.getElementById('credito-modal');
        const form = document.getElementById('credito-form');
        const title = document.getElementById('modal-title-text-creditos');
        const submitText = document.getElementById('submit-text-creditos');
        const resultsSection = document.getElementById('simulacion-results');
        const saveBtn = document.getElementById('save-btn');
        
        if (!modal || !form) return;
        
        this.currentEditId = creditoId;
        
        // Configurar modal según el modo
        if (creditoId) {
            const credito = this.creditos.find(c => c.id === creditoId);
            if (credito) {
                title.textContent = 'Editar Simulación de Crédito';
                submitText.textContent = 'Actualizar Simulación';
                this.fillForm(credito);
                
                // Simular automáticamente si editamos
                setTimeout(() => {
                    this.simularCredito();
                }, 100);
            }
        } else {
            title.textContent = 'Nueva Simulación de Crédito';
            submitText.textContent = 'Guardar Simulación';
            form.reset();
            
            // Ocultar resultados
            if (resultsSection) {
                resultsSection.classList.add('hidden');
            }
            
            // Deshabilitar botón de guardar
            if (saveBtn) {
                saveBtn.disabled = true;
            }
        }
        
        modal.classList.remove('hidden');
        
        // 🎯 CONFIGURAR EVENT LISTENERS DEL MODAL (aquí es donde deben ir)
        this.bindModalEventListeners();
        
        // Enfocar primer campo
        const firstInput = document.getElementById('monto-creditos');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    closeCreditoModal() {
        const modal = document.getElementById('credito-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.currentEditId = null;
        
        // Limpiar formulario
        const form = document.getElementById('credito-form');
        if (form) {
            form.reset();
        }
        
        // Ocultar resultados
        const resultsSection = document.getElementById('simulacion-results');
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
    }

    // 🎯 CONFIGURAR EVENT LISTENERS DEL MODAL (solución principal)
    bindModalEventListeners() {
        console.log('🔗 Configurando event listeners del modal...');
        
        // Form submit - solo configurar si no está ya configurado
        const form = document.getElementById('credito-form');
        if (form && !form.hasAttribute('data-events-configured')) {
            form.setAttribute('data-events-configured', 'true');
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            console.log('✅ Form listener configurado');
        }

        // Botón simular - solo configurar si no está ya configurado
        const simularBtn = document.getElementById('simular-btn');
        if (simularBtn && !simularBtn.hasAttribute('data-events-configured')) {
            simularBtn.setAttribute('data-events-configured', 'true');
            simularBtn.addEventListener('click', () => {
                console.log('🔥 Botón simular clickeado!');
                this.simularCredito();
            });
            console.log('✅ Botón simular listener configurado');
        }
        
        console.log('✅ Event listeners del modal configurados correctamente');
    }

    fillForm(credito) {
        const fields = [
            'monto-creditos',
            'tasa-anual-creditos', 
            'plazo-meses-creditos',
            'descripcion-creditos'
        ];
        
        const mappings = {
            'monto-creditos': credito.monto,
            'tasa-anual-creditos': credito.tasa_anual,
            'plazo-meses-creditos': credito.plazo_meses,
            'descripcion-creditos': credito.tipo_credito || ''
        };
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && mappings[fieldId] !== undefined) {
                field.value = mappings[fieldId];
            }
        });
    }

    simularCredito() {
        const monto = parseFloat(document.getElementById('monto-creditos')?.value || 0);
        const tasaAnual = parseFloat(document.getElementById('tasa-anual-creditos')?.value || 0);
        const plazoMeses = parseInt(document.getElementById('plazo-meses-creditos')?.value || 0);
        
        if (!monto || !tasaAnual || !plazoMeses) {
            this.showWarning('Por favor completa todos los campos requeridos');
            return;
        }
        
        if (monto < 1000) {
            this.showWarning('El monto mínimo es $1,000');
            return;
        }
        
        if (tasaAnual <= 0 || tasaAnual > 100) {
            this.showWarning('La tasa debe estar entre 0.1% y 100%');
            return;
        }
        
        if (plazoMeses < 6 || plazoMeses > 360) {
            this.showWarning('Por favor selecciona un plazo válido de la lista (mínimo 6 meses)');
            return;
        }
        
        try {
            // Calcular resultados
            const cuotaMensual = this.calcularCuotaMensual(monto, tasaAnual, plazoMeses);
            const totalPagar = cuotaMensual * plazoMeses;
            const interesesTotales = totalPagar - monto;
            const tasaMensual = tasaAnual / 12;
            const relacionInteres = (interesesTotales / monto) * 100;
            
            // Mostrar resultados con formato premium
            this.displaySimulationResults({
                cuotaMensual,
                totalPagar,
                interesesTotales,
                tasaMensual,
                relacionInteres
            });
            
            // Habilitar botón de guardar
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                saveBtn.disabled = false;
            }
            
            this.showInfo('✨ Simulación completada correctamente');
            
        } catch (error) {
            console.error('Error en simulación:', error);
            this.showError('Error al realizar la simulación');
        }
    }

    displaySimulationResults(results) {
        const elements = {
            'result-cuota-mensual': `$${results.cuotaMensual.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            'result-total-pagar': `$${results.totalPagar.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            'result-intereses': `$${results.interesesTotales.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            'result-tasa-mensual': `${results.tasaMensual.toFixed(2)}%`,
            'result-ahorro': `$${results.interesesTotales.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            'result-relacion': `${results.relacionInteres.toFixed(1)}%`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Animación de actualización
                element.style.transform = 'scale(1.1)';
                element.style.transition = 'transform 0.2s ease-in-out';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        });
        
        // Mostrar sección de resultados con animación
        const resultsSection = document.getElementById('simulacion-results');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.classList.add('animate-fadeIn');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
            const formData = this.getFormData();
            
            if (!this.validateFormData(formData)) {
                return;
            }
            
            // Simular antes de guardar si no se ha hecho
            if (!document.getElementById('simulacion-results') || document.getElementById('simulacion-results').classList.contains('hidden')) {
                this.simularCredito();
                await new Promise(resolve => setTimeout(resolve, 500)); // Esperar a que se muestren los resultados
            }
            
            if (this.currentEditId) {
                await this.updateCredito(this.currentEditId, formData);
            } else {
                await this.createCredito(formData);
            }
            
        } catch (error) {
            console.error('Error en submit:', error);
            this.showError('Error al procesar la simulación');
        } finally {
            this.isLoading = false;
        }
    }

    getFormData() {
        const monto = parseFloat(document.getElementById('monto-creditos')?.value || 0);
        const tasaAnual = parseFloat(document.getElementById('tasa-anual-creditos')?.value || 0);
        const plazoMeses = parseInt(document.getElementById('plazo-meses-creditos')?.value || 0);
        
        // Calcular valores automáticos
        const cuotaMensual = this.calcularCuotaMensual(monto, tasaAnual, plazoMeses);
        const totalPagar = cuotaMensual * plazoMeses;
        const totalIntereses = totalPagar - monto;
        
        return {
            monto: monto,
            tasa_anual: tasaAnual,
            plazo_meses: plazoMeses,
            tipo_credito: document.getElementById('descripcion-creditos')?.value?.trim() || 'Simulación de crédito',
            cuota_mensual: cuotaMensual,
            total_intereses: totalIntereses,
            total_pagar: totalPagar,
            resultado: 'pendiente',
            guardada: true
        };
    }

    validateFormData(data) {
        if (!data.monto || data.monto < 1000) {
            this.showError('El monto debe ser mayor a $1,000');
            return false;
        }
        
        if (!data.tasa_anual || data.tasa_anual <= 0 || data.tasa_anual > 100) {
            this.showError('La tasa debe estar entre 0.1% y 100%');
            return false;
        }
        
        if (!data.plazo_meses || data.plazo_meses < 6 || data.plazo_meses > 360) {
            this.showError('Por favor selecciona un plazo válido de la lista (mínimo 6 meses)');
            return false;
        }
        
        return true;
    }

    async createCredito(data) {
        try {
            console.log('💾 Creando nueva simulación...', data);
            
            // 🎯 USAR EL MISMO PATRÓN QUE INGRESOS (fetch directo)
            const supabaseData = {
                usuario_id: this.usuarioId,
                ...data
            };
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/simulaciones_credito`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(supabaseData)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('❌ Token expirado - redirigiendo a login');
                    window.location.href = '/auth.html';
                    return;
                }
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            
            if (result && result.length > 0) {
                this.creditos.unshift(result[0]);
                this.applyFilters();
                this.updateStats();
                
                this.closeCreditoModal();
                this.showSuccess('✨ Simulación guardada correctamente');
            } else {
                throw new Error('No se recibió respuesta válida del servidor');
            }
            
            console.log('✅ Simulación creada:', result);
            
        } catch (error) {
            console.error('❌ Error creando simulación:', error);
            this.showError('Error al guardar la simulación: ' + (error.message || 'Error desconocido'));
        }
    }

    async updateCredito(id, data) {
        try {
            console.log('🔄 Actualizando simulación...', id, data);
            
            const { data: result, error } = await this.supabaseClient
                .from('simulaciones_credito')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            
            if (error) {
                throw error;
            }
            
            // Actualizar en el array local
            const index = this.creditos.findIndex(c => c.id === id);
            if (index !== -1) {
                this.creditos[index] = result;
            }
            
            this.applyFilters();
            this.updateStats();
            
            this.closeCreditoModal();
            this.showSuccess('✨ Simulación actualizada correctamente');
            
            console.log('✅ Simulación actualizada:', result);
            
        } catch (error) {
            console.error('❌ Error actualizando simulación:', error);
            this.showError('Error al actualizar la simulación: ' + (error.message || 'Error desconocido'));
        }
    }

    async deleteCredito(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta simulación?')) {
            return;
        }
        
        try {
            console.log('🗑️ Eliminando simulación...', id);
            
            const { error } = await this.supabaseClient
                .from('simulaciones_credito')
                .delete()
                .eq('id', id);
            
            if (error) {
                throw error;
            }
            
            // Remover del array local
            this.creditos = this.creditos.filter(c => c.id !== id);
            this.applyFilters();
            this.updateStats();
            
            this.showSuccess('🗑️ Simulación eliminada correctamente');
            
            console.log('✅ Simulación eliminada');
            
        } catch (error) {
            console.error('❌ Error eliminando simulación:', error);
            this.showError('Error al eliminar la simulación: ' + (error.message || 'Error desconocido'));
        }
    }

    editCredito(id) {
        this.openCreditoModal(id);
    }

    duplicateCredito(id) {
        const credito = this.creditos.find(c => c.id === id);
        if (!credito) return;
        
        this.openCreditoModal();
        
        // Llenar formulario con datos del crédito a duplicar
        setTimeout(() => {
            this.fillForm({
                ...credito,
                descripcion: `Copia de: ${credito.descripcion || 'Simulación'}`
            });
            
            // Simular automáticamente
            this.simularCredito();
        }, 100);
        
        this.showInfo('📋 Simulación duplicada, puedes modificar los valores');
    }

    // Filtros
    setupFilters() {
        this.updateFilters();
        this.applyFilters();
    }

    updateFilters() {
        // Los filtros ya están definidos en el template
        // Aquí podríamos agregar lógica adicional si fuera necesario
    }

    applyFilters() {
        let filtered = [...this.creditos];
        
        // Filtro por monto
        const filterMonto = document.getElementById('filter-monto-creditos')?.value;
        if (filterMonto) {
            filtered = filtered.filter(credito => {
                const monto = credito.monto;
                switch (filterMonto) {
                    case '0-10000':
                        return monto >= 0 && monto <= 10000;
                    case '10000-50000':
                        return monto > 10000 && monto <= 50000;
                    case '50000-100000':
                        return monto > 50000 && monto <= 100000;
                    case '100000+':
                        return monto > 100000;
                    default:
                        return true;
                }
            });
        }
        
        // Filtro por plazo
        const filterPlazo = document.getElementById('filter-plazo-creditos')?.value;
        if (filterPlazo) {
            filtered = filtered.filter(credito => {
                const plazo = credito.plazo_meses;
                switch (filterPlazo) {
                    case '1-12':
                        return plazo >= 1 && plazo <= 12;
                    case '13-24':
                        return plazo >= 13 && plazo <= 24;
                    case '25-36':
                        return plazo >= 25 && plazo <= 36;
                    case '37+':
                        return plazo >= 37;
                    default:
                        return true;
                }
            });
        }
        
        // Filtro por fecha
        const filterFecha = document.getElementById('filter-fecha-creditos')?.value;
        if (filterFecha) {
            filtered = filtered.filter(credito => {
                const creditoFecha = new Date(credito.created_at || credito.fecha_simulacion);
                const creditoMes = creditoFecha.getFullYear() + '-' + String(creditoFecha.getMonth() + 1).padStart(2, '0');
                return creditoMes === filterFecha;
            });
        }
        
        this.filteredCreditos = filtered;
        this.renderCreditos();
        
        // Mostrar/ocultar badge de filtros activos
        const badge = document.getElementById('active-filters-badge-creditos');
        const hasActiveFilters = filterMonto || filterPlazo || filterFecha;
        
        if (badge) {
            if (hasActiveFilters) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    clearFilters() {
        // Limpiar selectores
        const filters = [
            'filter-monto-creditos',
            'filter-plazo-creditos',
            'filter-fecha-creditos'
        ];
        
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.value = '';
            }
        });
        
        // Aplicar filtros (sin filtros = mostrar todo)
        this.applyFilters();
        
        this.showInfo('🧹 Filtros limpiados');
    }

    // Exportar
    exportFiltered() {
        if (this.filteredCreditos.length === 0) {
            this.showWarning('No hay simulaciones para exportar');
            return;
        }
        
        try {
            const csvData = this.generateCSV(this.filteredCreditos);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `simulaciones_credito_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('📁 Simulaciones exportadas correctamente');
            
        } catch (error) {
            console.error('Error exportando:', error);
            this.showError('Error al exportar las simulaciones');
        }
    }

    generateCSV(data) {
        const headers = [
            'Fecha',
            'Monto',
            'Tasa Anual (%)',
            'Plazo (meses)',
            'Cuota Mensual',
            'Total a Pagar',
            'Intereses Totales',
            'Descripción'
        ];
        
        const csvRows = [headers.join(',')];
        
        data.forEach(credito => {
            const cuotaMensual = this.calcularCuotaMensual(credito.monto, credito.tasa_anual, credito.plazo_meses);
            const totalPagar = cuotaMensual * credito.plazo_meses;
            const interesesTotales = totalPagar - credito.monto;
            
            const row = [
                new Date(credito.created_at || credito.fecha_simulacion).toLocaleDateString('es-ES'),
                credito.monto,
                credito.tasa_anual,
                credito.plazo_meses,
                cuotaMensual.toFixed(2),
                totalPagar.toFixed(2),
                interesesTotales.toFixed(2),
                `"${(credito.descripcion || '').replace(/"/g, '""')}"`
            ];
            
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    // Utilidades UI
    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('hidden');
        }
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    showTableStatus() {
        const status = document.getElementById('table-status-creditos');
        if (status) {
            status.classList.remove('hidden');
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
        }
    }

    // Notificaciones premium
    showSuccess(message) {
        this.notyf.success(message);
    }

    showError(message) {
        this.notyf.error(message);
    }

    showWarning(message) {
        this.notyf.open({
            type: 'warning',
            message: message
        });
    }

    showInfo(message) {
        this.notyf.open({
            type: 'info',
            message: message
        });
    }
    
    // Método público para reinicializar event listeners
    reinitializeEventListeners() {
        console.log('🔄 Reinicializando event listeners...');
        this.bindEventListeners();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.creditosModuleHandler = new CreditosModuleHandler();
    });
} else {
    window.creditosModuleHandler = new CreditosModuleHandler();
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CreditosModuleHandler;
}
