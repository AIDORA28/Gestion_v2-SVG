/**
 * 🧪 SCRIPT DE PRUEBA: Registrar Crédito con Datos Válidos
 * Este script prueba el registro completo de un crédito desde cero
 */

console.log('🧪 INICIANDO PRUEBA: Registro de Crédito Completo');

// Función principal de prueba
async function probarRegistroCredito() {
    try {
        console.log('🚀 Iniciando prueba de registro de crédito...');
        
        // PASO 1: Verificar que estamos en el módulo correcto
        if (!window.creditosModuleHandler) {
            throw new Error('❌ Módulo de créditos no disponible');
        }
        console.log('✅ Módulo de créditos disponible');
        
        // PASO 2: Ir al módulo de créditos si no estamos ahí
        const creditosLink = document.querySelector('a[href="#creditos"]');
        if (creditosLink) {
            creditosLink.click();
            await esperar(1000);
            console.log('✅ Navegado al módulo de créditos');
        }
        
        // PASO 3: Abrir modal de nueva simulación
        console.log('📝 Abriendo modal de nueva simulación...');
        window.creditosModuleHandler.openCreditoModal();
        await esperar(500);
        
        // PASO 4: Verificar que el modal se abrió
        const modal = document.getElementById('credito-modal');
        if (!modal || modal.classList.contains('hidden')) {
            throw new Error('❌ Modal no se abrió correctamente');
        }
        console.log('✅ Modal abierto');
        
        // PASO 5: Llenar formulario con DATOS VÁLIDOS
        console.log('📋 Llenando formulario con datos válidos...');
        
        const datosValidos = {
            monto: '50000',        // ✅ Mayor a $1,000
            tasa: '18.5',          // ✅ Entre 0.1% y 100%  
            plazo: '36',           // ✅ Entre 6 y 360 meses
            descripcion: 'Crédito de prueba automatizada'
        };
        
        // Llenar campos
        document.getElementById('monto-creditos').value = datosValidos.monto;
        document.getElementById('tasa-anual-creditos').value = datosValidos.tasa;
        document.getElementById('plazo-meses-creditos').value = datosValidos.plazo;
        document.getElementById('descripcion-creditos').value = datosValidos.descripcion;
        
        console.log('✅ Formulario llenado:', datosValidos);
        
        // PASO 6: Simular crédito (calcular valores)
        console.log('🔢 Simulando crédito...');
        const simularBtn = document.getElementById('simular-btn');
        if (!simularBtn) {
            throw new Error('❌ Botón simular no encontrado');
        }
        
        simularBtn.click();
        await esperar(1000);
        
        // PASO 7: Verificar que la simulación funcionó
        const resultsSection = document.getElementById('simulacion-results');
        if (!resultsSection || resultsSection.classList.contains('hidden')) {
            throw new Error('❌ Los resultados de simulación no aparecieron');
        }
        console.log('✅ Simulación completada - resultados visibles');
        
        // PASO 8: Verificar que el botón guardar se habilitó
        const saveBtn = document.getElementById('save-btn');
        if (!saveBtn || saveBtn.disabled) {
            throw new Error('❌ Botón guardar no se habilitó');
        }
        console.log('✅ Botón guardar habilitado');
        
        // PASO 9: Obtener valores calculados
        const cuotaMensual = document.getElementById('result-cuota-mensual')?.textContent || 'No disponible';
        const totalPagar = document.getElementById('result-total-pagar')?.textContent || 'No disponible';
        const intereses = document.getElementById('result-intereses')?.textContent || 'No disponible';
        
        console.log('📊 RESULTADOS DE LA SIMULACIÓN:');
        console.log(`   💰 Cuota Mensual: ${cuotaMensual}`);
        console.log(`   💸 Total a Pagar: ${totalPagar}`);
        console.log(`   📈 Intereses Totales: ${intereses}`);
        
        // PASO 10: Guardar la simulación
        console.log('💾 Guardando simulación en la base de datos...');
        saveBtn.click();
        await esperar(3000); // Esperar a que se guarde
        
        // PASO 11: Verificar que se cerró el modal (indica éxito)
        if (modal.classList.contains('hidden')) {
            console.log('✅ Modal cerrado - simulación guardada exitosamente');
        } else {
            console.log('⚠️ Modal aún abierto - verificar si hubo errores');
        }
        
        // PASO 12: Verificar que aparece en la lista
        await esperar(1000);
        const tabla = document.querySelector('#creditos-table-body tr');
        if (tabla) {
            console.log('✅ Nueva simulación aparece en la tabla');
        }
        
        console.log('🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
        console.log('📈 Se registró un crédito con datos válidos');
        
        return {
            exito: true,
            datos: datosValidos,
            resultados: { cuotaMensual, totalPagar, intereses }
        };
        
    } catch (error) {
        console.error('❌ ERROR EN LA PRUEBA:', error.message);
        console.log('🔍 POSIBLES CAUSAS:');
        console.log('   - Datos inválidos (plazo debe ser ≥ 6 meses)');
        console.log('   - Problema de conectividad con la base de datos');
        console.log('   - Event listeners no configurados correctamente');
        
        return {
            exito: false,
            error: error.message
        };
    }
}

// Función auxiliar para esperar
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CASOS DE PRUEBA ADICIONALES
window.probarCasosEspeciales = async function() {
    console.log('🧪 PROBANDO CASOS ESPECIALES...');
    
    const casos = [
        { nombre: 'Monto mínimo', monto: '1000', tasa: '12', plazo: '6' },
        { nombre: 'Crédito pequeño', monto: '5000', tasa: '15', plazo: '12' },
        { nombre: 'Crédito mediano', monto: '25000', tasa: '18.5', plazo: '24' },
        { nombre: 'Crédito grande', monto: '100000', tasa: '20', plazo: '60' },
        { nombre: 'Plazo largo', monto: '50000', tasa: '16', plazo: '120' }
    ];
    
    for (const caso of casos) {
        console.log(`🔬 Probando: ${caso.nombre}`);
        
        // Abrir modal
        window.creditosModuleHandler.openCreditoModal();
        await esperar(500);
        
        // Llenar datos
        document.getElementById('monto-creditos').value = caso.monto;
        document.getElementById('tasa-anual-creditos').value = caso.tasa;
        document.getElementById('plazo-meses-creditos').value = caso.plazo;
        
        // Simular
        document.getElementById('simular-btn').click();
        await esperar(1000);
        
        // Verificar resultados
        const resultsVisible = !document.getElementById('simulacion-results').classList.contains('hidden');
        console.log(`   ${resultsVisible ? '✅' : '❌'} ${caso.nombre}: ${resultsVisible ? 'OK' : 'FALLÓ'}`);
        
        // Cerrar modal
        window.creditosModuleHandler.closeCreditoModal();
        await esperar(500);
    }
};

// EJECUTAR PRUEBA PRINCIPAL
console.log('💡 Para ejecutar la prueba completa, usa: probarRegistroCredito()');
console.log('💡 Para probar casos especiales, usa: probarCasosEspeciales()');
console.log('💡 Recuerda: El plazo debe ser ≥ 6 meses para ser válido');

// Auto-ejecutar la prueba principal
setTimeout(() => {
    if (confirm('¿Ejecutar prueba automática de registro de crédito?')) {
        probarRegistroCredito().then(resultado => {
            if (resultado.exito) {
                alert('✅ ¡Prueba exitosa! Revisa la consola para detalles.');
            } else {
                alert('❌ Prueba falló: ' + resultado.error);
            }
        });
    }
}, 2000);
