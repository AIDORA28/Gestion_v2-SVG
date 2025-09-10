/*
🔧 DIAGNÓSTICO DE BOTONES SUGERENCIAS
Script para detectar problemas con los botones "Actualizar Análisis" y "Ejecutar Pruebas"
*/

console.log('🔧 === DIAGNÓSTICO BOTONES SUGERENCIAS ===');

function diagnosticarBotones() {
    console.log('🔍 1. Verificando elementos del DOM...');
    
    // Verificar que estamos en la sección correcta
    const seccionSugerencias = document.getElementById('section-sugerencias');
    console.log('   📍 Sección sugerencias:', seccionSugerencias ? 'ENCONTRADA' : 'NO ENCONTRADA');
    
    if (seccionSugerencias) {
        console.log('   👁️  Sección visible:', !seccionSugerencias.classList.contains('hidden'));
    }
    
    // Buscar botones específicos
    const botones = {
        'Actualizar Análisis': document.querySelector('button[onclick*="actualizarSugerencias"]'),
        'Ejecutar Pruebas': document.querySelector('button[onclick*="ejecutarPruebas"]')
    };
    
    console.log('🔍 2. Verificando botones...');
    Object.entries(botones).forEach(([nombre, boton]) => {
        console.log(`   🔘 ${nombre}:`, boton ? 'ENCONTRADO' : 'NO ENCONTRADO');
        if (boton) {
            console.log(`      - Onclick:`, boton.getAttribute('onclick'));
            console.log(`      - Visible:`, boton.offsetParent !== null);
        }
    });
    
    console.log('🔍 3. Verificando handlers globales...');
    const handlers = {
        'window.sugerenciasModuleHandler': window.sugerenciasModuleHandler,
        'SugerenciasModuleHandler class': window.SugerenciasModuleHandler,
        'testSugerenciasIA': window.testSugerenciasIA,
        'testSugerenciasRapido': window.testSugerenciasRapido
    };
    
    Object.entries(handlers).forEach(([nombre, handler]) => {
        console.log(`   📦 ${nombre}:`, handler ? 'DISPONIBLE' : 'NO DISPONIBLE');
        
        if (nombre === 'window.sugerenciasModuleHandler' && handler) {
            console.log(`      - Inicializado:`, handler.isInitialized);
            console.log(`      - Tiene actualizarSugerencias:`, typeof handler.actualizarSugerencias === 'function');
            console.log(`      - Tiene ejecutarPruebas:`, typeof handler.ejecutarPruebas === 'function');
        }
    });
    
    console.log('🔍 4. Probando llamadas directas...');
    
    // Test 1: Llamada directa al handler
    if (window.sugerenciasModuleHandler) {
        try {
            console.log('   🧪 Test 1: Llamada directa actualizarSugerencias...');
            window.sugerenciasModuleHandler.actualizarSugerencias();
            console.log('   ✅ actualizarSugerencias ejecutado');
        } catch (error) {
            console.log('   ❌ Error en actualizarSugerencias:', error.message);
        }
        
        try {
            console.log('   🧪 Test 2: Llamada directa ejecutarPruebas...');
            window.sugerenciasModuleHandler.ejecutarPruebas();
            console.log('   ✅ ejecutarPruebas ejecutado');
        } catch (error) {
            console.log('   ❌ Error en ejecutarPruebas:', error.message);
        }
    } else {
        console.log('   ⚠️  No se puede probar - handler no disponible');
    }
    
    console.log('🔍 5. Estado del módulo...');
    if (window.sugerenciasModuleHandler) {
        const estado = {
            authToken: !!window.sugerenciasModuleHandler.authToken,
            usuarioId: !!window.sugerenciasModuleHandler.usuarioId,
            ingresos: window.sugerenciasModuleHandler.ingresos?.length || 0,
            gastos: window.sugerenciasModuleHandler.gastos?.length || 0,
            analisisCompleto: !!window.sugerenciasModuleHandler.analisisCompleto
        };
        
        console.log('   📊 Estado del handler:', estado);
    }
    
    console.log('🎯 === FIN DIAGNÓSTICO ===');
    
    // Recomendaciones
    console.log('💡 RECOMENDACIONES:');
    if (!seccionSugerencias) {
        console.log('   1️⃣ Navega a la sección "Sugerencias" primero');
    }
    
    if (!window.sugerenciasModuleHandler) {
        console.log('   2️⃣ El handler no está inicializado - verifica la consola por errores');
    }
    
    if (botones['Actualizar Análisis'] === null) {
        console.log('   3️⃣ Los botones no están en el DOM - verifica que el template se cargó');
    }
}

// Función para forzar inicialización
function forzarInicializacion() {
    console.log('🚀 Forzando inicialización del módulo...');
    
    if (window.SugerenciasModuleHandler && !window.sugerenciasModuleHandler) {
        try {
            window.sugerenciasModuleHandler = new window.SugerenciasModuleHandler();
            console.log('✅ Handler creado manualmente');
            return true;
        } catch (error) {
            console.log('❌ Error creando handler:', error);
            return false;
        }
    } else if (window.sugerenciasModuleHandler) {
        console.log('✅ Handler ya existe');
        return true;
    } else {
        console.log('❌ Clase SugerenciasModuleHandler no disponible');
        return false;
    }
}

// Función para simular clicks
function simularClicks() {
    console.log('🖱️ Simulando clicks en botones...');
    
    const botones = document.querySelectorAll('button[onclick*="sugerenciasModuleHandler"]');
    console.log(`   Botones encontrados: ${botones.length}`);
    
    botones.forEach((boton, index) => {
        console.log(`   Botón ${index + 1}:`, boton.textContent.trim());
        console.log(`   Onclick:`, boton.getAttribute('onclick'));
    });
}

// Exportar funciones para uso manual
window.diagnosticoSugerencias = {
    diagnosticar: diagnosticarBotones,
    forzarInit: forzarInicializacion,
    simularClicks: simularClicks,
    
    // Función todo-en-uno
    full: function() {
        diagnosticarBotones();
        console.log('\n🔧 Intentando soluciones automáticas...');
        
        if (forzarInicializacion()) {
            console.log('✅ Inicialización forzada exitosa');
            setTimeout(() => {
                console.log('🔄 Re-ejecutando diagnóstico...');
                diagnosticarBotones();
            }, 1000);
        }
    }
};

console.log('💡 Para usar: diagnosticoSugerencias.full() o diagnosticoSugerencias.diagnosticar()');

// Auto-ejecutar si estamos en la sección correcta
setTimeout(() => {
    const seccionSugerencias = document.getElementById('section-sugerencias');
    if (seccionSugerencias && !seccionSugerencias.classList.contains('hidden')) {
        console.log('🔄 Auto-ejecutando diagnóstico (estamos en sección sugerencias)...');
        diagnosticarBotones();
    }
}, 500);
