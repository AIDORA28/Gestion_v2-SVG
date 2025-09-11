/**
 * 🔍 SCRIPT DE VERIFICACIÓN RÁPIDA
 * Verificar que el CreditosModuleHandler esté funcionando
 */

console.log('🔍 VERIFICACIÓN DEL MÓDULO DE CRÉDITOS');

// 1. Verificar que el handler existe
if (window.creditosModuleHandler) {
    console.log('✅ creditosModuleHandler existe');
    
    // 2. Verificar métodos clave
    const metodosRequeridos = ['init', 'openCreditoModal', 'simularCredito', 'bindModalEventListeners'];
    metodosRequeridos.forEach(metodo => {
        if (typeof window.creditosModuleHandler[metodo] === 'function') {
            console.log(`✅ Método ${metodo} disponible`);
        } else {
            console.log(`❌ Método ${metodo} NO disponible`);
        }
    });
    
    // 3. Verificar configuración
    const handler = window.creditosModuleHandler;
    console.log('📊 Estado del handler:', {
        isLoading: handler.isLoading,
        currentEditId: handler.currentEditId,
        creditos: handler.creditos ? handler.creditos.length : 'undefined',
        supabaseUrl: handler.supabaseUrl ? 'configurado' : 'no configurado'
    });
    
} else {
    console.log('❌ creditosModuleHandler NO existe');
}

// 4. Verificar elementos DOM
const elementosRequeridos = {
    'credito-modal': 'Modal de créditos',
    'credito-form': 'Formulario de créditos',
    'simular-btn': 'Botón simular',
    'save-btn': 'Botón guardar'
};

console.log('🔍 Verificando elementos DOM:');
Object.entries(elementosRequeridos).forEach(([id, descripcion]) => {
    const elemento = document.getElementById(id);
    if (elemento) {
        console.log(`✅ ${descripcion} (${id}) encontrado`);
    } else {
        console.log(`❌ ${descripcion} (${id}) NO encontrado`);
    }
});

// 5. Función para probar el botón simular
window.testSimularCredito = function() {
    console.log('🧪 PROBANDO BOTÓN SIMULAR...');
    
    // Verificar que el modal esté abierto
    const modal = document.getElementById('credito-modal');
    if (!modal || modal.classList.contains('hidden')) {
        console.log('❌ El modal no está abierto. Usa: window.creditosModuleHandler.openCreditoModal()');
        return;
    }
    
    // Llenar campos de prueba
    document.getElementById('monto-creditos').value = '50000';
    document.getElementById('tasa-anual-creditos').value = '18.5';
    document.getElementById('plazo-meses-creditos').value = '36';
    
    console.log('📝 Campos llenados con valores de prueba');
    
    // Simular clic en el botón
    const simularBtn = document.getElementById('simular-btn');
    if (simularBtn) {
        console.log('🔥 Haciendo clic en botón simular...');
        simularBtn.click();
    } else {
        console.log('❌ Botón simular no encontrado');
    }
};

console.log('💡 Usa testSimularCredito() para probar automáticamente');
console.log('💡 Usa window.creditosModuleHandler.openCreditoModal() para abrir el modal');
