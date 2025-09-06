// Sistema de Notificaciones Profesional para Gestión Financiera
// Wrapper inteligente para Notyf con contexto financiero

class FinancialNotifications {
    constructor() {
        // Inicializar Notyf con configuración profesional
        this.notyf = new Notyf({
            duration: 5000,
            position: { x: 'right', y: 'top' },
            dismissible: true,
            ripple: true,
            types: [
                {
                    type: 'success',
                    background: '#16a34a',
                    icon: {
                        className: 'notyf-success-icon',
                        tagName: 'span',
                        text: '✓'
                    }
                },
                {
                    type: 'error', 
                    background: '#dc2626',
                    icon: {
                        className: 'notyf-error-icon',
                        tagName: 'span',
                        text: '✕'
                    }
                },
                {
                    type: 'warning',
                    background: '#d97706',
                    icon: {
                        className: 'notyf-warning-icon',
                        tagName: 'span',
                        text: '⚠'
                    }
                },
                {
                    type: 'info',
                    background: '#3b82f6',
                    icon: {
                        className: 'notyf-info-icon',
                        tagName: 'span',
                        text: 'ℹ'
                    }
                }
            ]
        });
        
        // Log para debugging
        console.log('✅ Sistema de notificaciones financieras inicializado');
    }
    
    // ===============================
    // NOTIFICACIONES GENERALES
    // ===============================
    
    success(message, options = {}) {
        return this.notyf.success({
            message,
            duration: options.duration || 5000,
            ...options
        });
    }
    
    error(message, options = {}) {
        return this.notyf.error({
            message,
            duration: options.duration || 7000, // Errores duran más
            ...options
        });
    }
    
    warning(message, options = {}) {
        return this.notyf.open({
            type: 'warning',
            message,
            duration: options.duration || 6000,
            ...options
        });
    }
    
    info(message, options = {}) {
        return this.notyf.open({
            type: 'info',
            message,
            duration: options.duration || 4000,
            ...options
        });
    }
    
    // ===============================
    // NOTIFICACIONES FINANCIERAS ESPECÍFICAS
    // ===============================
    
    // Ingresos
    ingresoCreado(monto, descripcion = '') {
        const mensaje = `💰 Ingreso agregado: S/ ${this.formatCurrency(monto)}${descripcion ? ' - ' + descripcion : ''}`;
        return this.success(mensaje);
    }
    
    ingresoActualizado(monto, descripcion = '') {
        const mensaje = `📝 Ingreso actualizado: S/ ${this.formatCurrency(monto)}${descripcion ? ' - ' + descripcion : ''}`;
        return this.info(mensaje);
    }
    
    ingresoEliminado(monto, descripcion = '') {
        const mensaje = `🗑️ Ingreso eliminado: S/ ${this.formatCurrency(monto)}${descripcion ? ' - ' + descripcion : ''}`;
        return this.warning(mensaje);
    }
    
    // Gastos
    gastoCreado(monto, descripcion = '') {
        const mensaje = `💸 Gasto registrado: S/ ${this.formatCurrency(monto)}${descripcion ? ' - ' + descripcion : ''}`;
        return this.success(mensaje);
    }
    
    gastoActualizado(monto, descripcion = '') {
        const mensaje = `📝 Gasto actualizado: S/ ${this.formatCurrency(monto)}${descripcion ? ' - ' + descripcion : ''}`;
        return this.info(mensaje);
    }
    
    gastoEliminado(monto, descripcion = '') {
        const mensaje = `🗑️ Gasto eliminado: S/ ${this.formatCurrency(monto)}${descripcion ? ' - ' + descripcion : ''}`;
        return this.warning(mensaje);
    }
    
    // Alertas financieras
    presupuestoSuperado(categoria, limite, actual) {
        const mensaje = `⚠️ Presupuesto superado en ${categoria}: S/ ${this.formatCurrency(actual)} de S/ ${this.formatCurrency(limite)}`;
        return this.warning(mensaje, { duration: 8000 });
    }
    
    saldoBajo(saldo) {
        const mensaje = `🔴 Alerta: Saldo bajo S/ ${this.formatCurrency(saldo)}`;
        return this.error(mensaje, { duration: 10000 });
    }
    
    metaAlcanzada(meta, tipo = '') {
        const mensaje = `🎯 ¡Meta alcanzada! ${tipo ? tipo + ': ' : ''}S/ ${this.formatCurrency(meta)}`;
        return this.success(mensaje, { duration: 7000 });
    }
    
    // Crédito y simulaciones
    simulacionCreada(monto, cuota) {
        const mensaje = `🏦 Simulación creada: Préstamo S/ ${this.formatCurrency(monto)}, cuota S/ ${this.formatCurrency(cuota)}`;
        return this.info(mensaje);
    }
    
    creditoAprobado(monto) {
        const mensaje = `✅ Crédito pre-aprobado: S/ ${this.formatCurrency(monto)}`;
        return this.success(mensaje, { duration: 8000 });
    }
    
    creditoRechazado(razon = '') {
        const mensaje = `❌ Crédito no aprobado${razon ? ': ' + razon : ''}`;
        return this.error(mensaje);
    }
    
    // ===============================
    // NOTIFICACIONES DE SISTEMA
    // ===============================
    
    // Base de datos
    conexionExitosa() {
        return this.success('🔗 Conectado a la base de datos');
    }
    
    errorConexion() {
        return this.error('❌ Error de conexión. Verifique su internet', { duration: 10000 });
    }
    
    datosSincronizados() {
        return this.info('🔄 Datos sincronizados correctamente');
    }
    
    // Autenticación
    loginExitoso(usuario = '') {
        const mensaje = `👋 Bienvenido${usuario ? ', ' + usuario : ''}`;
        return this.success(mensaje);
    }
    
    logoutExitoso() {
        return this.info('👋 Sesión cerrada correctamente');
    }
    
    errorAutenticacion() {
        return this.error('🔐 Error de autenticación. Verifique sus credenciales');
    }
    
    sesionExpirada() {
        return this.warning('⏰ Su sesión ha expirado. Inicie sesión nuevamente', { duration: 8000 });
    }
    
    // Reportes
    reporteGenerado(tipo = '') {
        const mensaje = `📊 Reporte ${tipo ? tipo + ' ' : ''}generado correctamente`;
        return this.success(mensaje);
    }
    
    reporteError(tipo = '') {
        const mensaje = `❌ Error al generar reporte${tipo ? ' ' + tipo : ''}`;
        return this.error(mensaje);
    }
    
    // Backup y exportación
    datosExportados(formato = '') {
        const mensaje = `💾 Datos exportados${formato ? ' en ' + formato : ''} correctamente`;
        return this.success(mensaje);
    }
    
    backupCreado() {
        return this.success('💾 Backup creado correctamente');
    }
    
    // ===============================
    // UTILIDADES
    // ===============================
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    // Limpiar todas las notificaciones
    dismissAll() {
        this.notyf.dismissAll();
        return this.info('🧹 Notificaciones limpiadas');
    }
    
    // Notificación personalizada avanzada
    custom(config) {
        return this.notyf.open(config);
    }
    
    // Para debugging - mostrar notificaciones de prueba
    test() {
        setTimeout(() => this.success('✅ Prueba exitosa'), 500);
        setTimeout(() => this.info('ℹ️ Información de prueba'), 1000);
        setTimeout(() => this.warning('⚠️ Advertencia de prueba'), 1500);
        setTimeout(() => this.error('❌ Error de prueba'), 2000);
        setTimeout(() => this.ingresoCreado(1500, 'Salario'), 2500);
        setTimeout(() => this.gastoCreado(350, 'Supermercado'), 3000);
    }
}

// ===============================
// INICIALIZACIÓN GLOBAL
// ===============================

// Instancia global para usar en toda la aplicación
window.FinancialNotify = new FinancialNotifications();

// Alias más cortos para uso común
window.notify = window.FinancialNotify;
window.fn = window.FinancialNotify;

// Log de confirmación
console.log('✅ Notificaciones financieras profesionales disponibles globalmente');
console.log('💡 Uso: notify.success("mensaje") | notify.ingresoCreado(1500) | notify.test()');

// Export para módulos (si se usa con bundler en el futuro)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialNotifications;
}
