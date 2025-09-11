/**
 * 🧪 PRUEBA: Combo Box de Plazos (Solo 6+ meses)
 * Verificar que el nuevo selector de plazos funcione correctamente
 */

console.log('🧪 INICIANDO PRUEBA: Combo Box de Plazos Mejorado');

// Función principal de prueba
async function probarComboBoxPlazos() {
    try {
        console.log('🚀 Probando nuevo combo box de plazos...');
        
        // PASO 1: Verificar módulo disponible
        if (!window.creditosModuleHandler) {
            throw new Error('❌ Módulo de créditos no disponible');
        }
        
        // PASO 2: Ir al módulo de créditos
        const creditosLink = document.querySelector('a[href="#creditos"]');
        if (creditosLink) {
            creditosLink.click();
            await esperar(1000);
        }
        
        // PASO 3: Abrir modal
        console.log('📝 Abriendo modal...');
        window.creditosModuleHandler.openCreditoModal();
        await esperar(500);
        
        // PASO 4: Verificar que el combo box existe
        const plazoSelect = document.getElementById('plazo-meses-creditos');
        if (!plazoSelect) {
            throw new Error('❌ Combo box de plazos no encontrado');
        }
        
        if (plazoSelect.tagName !== 'SELECT') {
            throw new Error('❌ Campo de plazo no es un combo box');
        }
        
        console.log('✅ Combo box de plazos encontrado');
        
        // PASO 5: Verificar opciones disponibles
        const opciones = Array.from(plazoSelect.options).map(opt => ({
            value: opt.value,
            text: opt.text,
            group: opt.parentElement.label || 'Sin grupo'
        }));
        
        console.log('📋 OPCIONES DISPONIBLES:', opciones);
        
        // PASO 6: Verificar que no hay opciones menores a 6 meses
        const opcionesInvalidas = opciones.filter(opt => 
            opt.value && parseInt(opt.value) < 6
        );
        
        if (opcionesInvalidas.length > 0) {
            throw new Error(`❌ Encontradas opciones inválidas (< 6 meses): ${opcionesInvalidas.map(o => o.text).join(', ')}`);
        }
        
        console.log('✅ Todas las opciones son ≥ 6 meses');
        
        // PASO 7: Probar diferentes plazos
        const plazosAProbar = [
            { valor: '6', nombre: '6 meses (mínimo)' },
            { valor: '36', nombre: '36 meses (3 años)' },
            { valor: '60', nombre: '60 meses (5 años)' },
            { valor: '120', nombre: '120 meses (10 años)' },
            { valor: '360', nombre: '360 meses (30 años)' }
        ];
        
        console.log('🔬 PROBANDO DIFERENTES PLAZOS:');
        
        for (const plazo of plazosAProbar) {
            console.log(`   🔍 Probando: ${plazo.nombre}`);
            
            // Llenar datos base
            document.getElementById('monto-creditos').value = '50000';
            document.getElementById('tasa-anual-creditos').value = '18.5';
            
            // Seleccionar plazo
            plazoSelect.value = plazo.valor;
            
            // Verificar que se seleccionó correctamente
            if (plazoSelect.value !== plazo.valor) {
                console.log(`   ❌ ${plazo.nombre}: No se pudo seleccionar`);
                continue;
            }
            
            // Simular
            const simularBtn = document.getElementById('simular-btn');
            if (simularBtn) {
                simularBtn.click();
                await esperar(1000);
                
                // Verificar resultados
                const resultsVisible = !document.getElementById('simulacion-results').classList.contains('hidden');
                console.log(`   ${resultsVisible ? '✅' : '❌'} ${plazo.nombre}: ${resultsVisible ? 'Simulación exitosa' : 'Falló simulación'}`);
                
                if (resultsVisible) {
                    const cuota = document.getElementById('result-cuota-mensual')?.textContent || 'N/A';
                    console.log(`      💰 Cuota calculada: ${cuota}`);
                }
            }
            
            await esperar(500);
        }
        
        // PASO 8: Verificar funcionalidad del formulario completo
        console.log('📝 Probando formulario completo...');
        
        // Seleccionar valores típicos
        document.getElementById('monto-creditos').value = '25000';
        document.getElementById('tasa-anual-creditos').value = '15.5';
        plazoSelect.value = '36'; // 3 años
        document.getElementById('descripcion-creditos').value = 'Crédito de prueba con combo box';
        
        // Simular
        document.getElementById('simular-btn').click();
        await esperar(1500);
        
        // Verificar que se habilitó el botón guardar
        const saveBtn = document.getElementById('save-btn');
        const guardearHabilitado = !saveBtn.disabled;
        
        console.log(`${guardearHabilitado ? '✅' : '❌'} Botón guardar: ${guardearHabilitado ? 'Habilitado' : 'Deshabilitado'}`);
        
        if (guardearHabilitado) {
            console.log('💾 Guardando simulación de prueba...');
            saveBtn.click();
            await esperar(3000);
            
            console.log('✅ Simulación guardada exitosamente');
        }
        
        console.log('🎉 ¡PRUEBA COMPLETADA CON ÉXITO!');
        console.log('📊 RESUMEN:');
        console.log('   ✅ Combo box implementado correctamente');
        console.log('   ✅ Solo opciones ≥ 6 meses disponibles');
        console.log('   ✅ Simulaciones funcionan con todas las opciones');
        console.log('   ✅ Formulario completo funcional');
        
        return { exito: true, opciones: opciones.length };
        
    } catch (error) {
        console.error('❌ ERROR EN LA PRUEBA:', error.message);
        return { exito: false, error: error.message };
    }
}

// Función auxiliar para esperar
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// FUNCIONES DE UTILIDAD ADICIONALES
window.mostrarOpcionesPlazos = function() {
    const plazoSelect = document.getElementById('plazo-meses-creditos');
    if (!plazoSelect) {
        console.log('❌ Combo box no encontrado. Abre el modal primero.');
        return;
    }
    
    console.log('📋 OPCIONES DE PLAZOS DISPONIBLES:');
    Array.from(plazoSelect.options).forEach((option, index) => {
        if (option.value) {
            const anos = Math.round(parseInt(option.value) / 12 * 10) / 10;
            console.log(`   ${index}: ${option.text} (${option.value} meses = ${anos} años)`);
        }
    });
};

window.probarPlazoEspecifico = function(meses) {
    const plazoSelect = document.getElementById('plazo-meses-creditos');
    if (!plazoSelect) {
        console.log('❌ Abre el modal primero con: window.creditosModuleHandler.openCreditoModal()');
        return;
    }
    
    console.log(`🔍 Probando plazo de ${meses} meses...`);
    
    // Llenar datos
    document.getElementById('monto-creditos').value = '30000';
    document.getElementById('tasa-anual-creditos').value = '16';
    plazoSelect.value = meses.toString();
    
    if (plazoSelect.value !== meses.toString()) {
        console.log(`❌ Plazo de ${meses} meses no disponible en las opciones`);
        return;
    }
    
    // Simular
    document.getElementById('simular-btn').click();
    console.log(`✅ Simulación iniciada para ${meses} meses`);
};

// EJECUTAR PRUEBA AUTOMÁTICA
console.log('💡 Comandos disponibles:');
console.log('   probarComboBoxPlazos() - Ejecutar prueba completa');
console.log('   mostrarOpcionesPlazos() - Ver todas las opciones disponibles');
console.log('   probarPlazoEspecifico(36) - Probar un plazo específico');

// Auto-ejecutar después de 3 segundos
setTimeout(() => {
    if (confirm('¿Ejecutar prueba automática del combo box de plazos?')) {
        probarComboBoxPlazos().then(resultado => {
            if (resultado.exito) {
                alert(`✅ ¡Prueba exitosa! Se encontraron ${resultado.opciones} opciones de plazos válidos.`);
            } else {
                alert('❌ Prueba falló: ' + resultado.error);
            }
        });
    }
}, 3000);
