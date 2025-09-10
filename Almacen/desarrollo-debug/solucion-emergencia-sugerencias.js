/*
🚨 SOLUCIÓN INMEDIATA PARA BOTONES SUGERENCIAS
Script de emergencia para diagnosticar y solucionar problemas
*/

console.log('🚨 === SOLUCIÓN INMEDIATA BOTONES SUGERENCIAS ===');

// Función de diagnóstico inmediato
function diagnosticoInmediato() {
    console.log('🔍 1. Verificando estado actual...');
    
    // ¿Dónde estamos?
    const seccionActual = document.querySelector('.section-content:not(.hidden)');
    const esSugerencias = seccionActual && seccionActual.id === 'section-sugerencias';
    
    console.log('📍 Sección actual:', seccionActual?.id || 'NINGUNA');
    console.log('🧠 ¿Estamos en sugerencias?', esSugerencias);
    
    // ¿Qué hay disponible?
    const disponibles = {
        'SugerenciasModuleHandler (clase)': !!window.SugerenciasModuleHandler,
        'sugerenciasModuleHandler (instancia)': !!window.sugerenciasModuleHandler,
        'testBotonesSugerencias': !!window.testBotonesSugerencias,
        'testSugerenciasIA': !!window.testSugerenciasIA,
        'diagnosticoSugerencias': !!window.diagnosticoSugerencias
    };
    
    console.log('📦 Elementos disponibles:');
    Object.entries(disponibles).forEach(([nombre, disponible]) => {
        console.log(`   ${disponible ? '✅' : '❌'} ${nombre}`);
    });
    
    // Si no estamos en sugerencias, navegar
    if (!esSugerencias) {
        console.log('🚀 Navegando a sección sugerencias...');
        if (window.showSection) {
            window.showSection('sugerencias');
            console.log('✅ Navegación ejecutada - espera 2 segundos y ejecuta nuevamente');
            return false;
        } else {
            console.log('❌ Función showSection no disponible');
        }
    }
    
    return esSugerencias;
}

// Función para crear handler manualmente si no existe
function crearHandlerManual() {
    console.log('🔧 Creando handler manualmente...');
    
    if (window.SugerenciasModuleHandler && !window.sugerenciasModuleHandler) {
        try {
            window.sugerenciasModuleHandler = new window.SugerenciasModuleHandler();
            console.log('✅ Handler creado exitosamente');
            
            // Intentar inicializar
            if (window.sugerenciasModuleHandler.init) {
                window.sugerenciasModuleHandler.init().then(() => {
                    console.log('✅ Handler inicializado');
                }).catch(error => {
                    console.log('⚠️ Error inicializando handler:', error.message);
                });
            }
            
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

// Función para probar botones directamente
function probarBotonesDirectamente() {
    console.log('🖱️ Probando botones directamente...');
    
    // Buscar botones en el DOM
    const botones = {
        actualizar: document.getElementById('btn-actualizar-analisis'),
        pruebas: document.getElementById('btn-ejecutar-pruebas'),
        diagnostico: document.querySelector('button[onclick*="diagnosticoSugerencias"]')
    };
    
    console.log('🔍 Botones encontrados:');
    Object.entries(botones).forEach(([nombre, boton]) => {
        console.log(`   ${boton ? '✅' : '❌'} ${nombre}:`, boton?.textContent?.trim() || 'NO ENCONTRADO');
    });
    
    // Intentar ejecutar funciones directamente
    if (window.sugerenciasModuleHandler) {
        console.log('🧪 Probando funciones del handler...');
        
        try {
            console.log('   📊 Probando actualizarSugerencias...');
            if (typeof window.sugerenciasModuleHandler.actualizarSugerencias === 'function') {
                window.sugerenciasModuleHandler.actualizarSugerencias();
                console.log('   ✅ actualizarSugerencias ejecutado');
            } else {
                console.log('   ❌ actualizarSugerencias no es función');
            }
        } catch (error) {
            console.log('   ❌ Error en actualizarSugerencias:', error.message);
        }
        
        try {
            console.log('   🧪 Probando ejecutarPruebas...');
            if (typeof window.sugerenciasModuleHandler.ejecutarPruebas === 'function') {
                window.sugerenciasModuleHandler.ejecutarPruebas();
                console.log('   ✅ ejecutarPruebas ejecutado');
            } else {
                console.log('   ❌ ejecutarPruebas no es función');
            }
        } catch (error) {
            console.log('   ❌ Error en ejecutarPruebas:', error.message);
        }
    }
}

// Función para forzar carga del template
function forzarCargaTemplate() {
    console.log('📄 Forzando carga del template...');
    
    const seccionSugerencias = document.getElementById('section-sugerencias');
    if (!seccionSugerencias) {
        console.log('❌ Sección sugerencias no existe en el DOM');
        return false;
    }
    
    // Verificar si el template ya está cargado
    const yaEstaTemplate = seccionSugerencias.querySelector('#btn-actualizar-analisis');
    if (yaEstaTemplate) {
        console.log('✅ Template ya está cargado');
        return true;
    }
    
    // Intentar cargar template manualmente
    if (window.moduleLoader && window.moduleLoader.loadTemplate) {
        console.log('🔄 Cargando template con moduleLoader...');
        
        window.moduleLoader.loadTemplate('sugerencias').then(html => {
            seccionSugerencias.innerHTML = html;
            console.log('✅ Template cargado manualmente');
            
            // Reinicializar iconos
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Ejecutar scripts del template
            const scripts = seccionSugerencias.querySelectorAll('script');
            scripts.forEach(script => {
                try {
                    eval(script.textContent);
                } catch (error) {
                    console.log('⚠️ Error ejecutando script del template:', error);
                }
            });
            
        }).catch(error => {
            console.log('❌ Error cargando template:', error);
        });
        
        return true;
    } else {
        console.log('❌ moduleLoader no disponible');
        return false;
    }
}

// Función todo-en-uno SUPER ROBUSTA
function solucionCompleta() {
    console.log('🚀 === EJECUTANDO SOLUCIÓN COMPLETA ===');
    
    // Paso 1: Diagnóstico
    const enSugerencias = diagnosticoInmediato();
    
    if (!enSugerencias) {
        console.log('⏳ Esperando navegación a sugerencias...');
        setTimeout(() => {
            console.log('🔄 Reintentando después de navegación...');
            solucionCompleta();
        }, 2000);
        return;
    }
    
    // Paso 2: Asegurar que el template esté cargado
    setTimeout(() => {
        forzarCargaTemplate();
        
        // Paso 3: Crear handler si no existe
        setTimeout(() => {
            crearHandlerManual();
            
            // Paso 4: Probar botones
            setTimeout(() => {
                probarBotonesDirectamente();
                
                console.log('🎯 === SOLUCIÓN COMPLETADA ===');
                console.log('💡 Si aún hay problemas, ejecuta: solucionEmergencia.manual()');
                
            }, 1000);
        }, 1000);
    }, 1000);
}

// Función manual para casos extremos
function emergenciaManual() {
    console.log('🆘 === MODO EMERGENCIA MANUAL ===');
    
    // Crear todas las funciones manualmente
    window.testBotonesSugerencias = {
        actualizar: function() {
            console.log('🔄 Ejecutando actualizar manual...');
            if (window.sugerenciasModuleHandler && window.sugerenciasModuleHandler.actualizarSugerencias) {
                window.sugerenciasModuleHandler.actualizarSugerencias();
            } else {
                alert('❌ Handler no disponible - ejecuta solucionEmergencia.completa() primero');
            }
        },
        
        pruebas: function() {
            console.log('🧪 Ejecutando pruebas manual...');
            if (window.sugerenciasModuleHandler && window.sugerenciasModuleHandler.ejecutarPruebas) {
                window.sugerenciasModuleHandler.ejecutarPruebas();
            } else {
                alert('❌ Handler no disponible - ejecuta solucionEmergencia.completa() primero');
            }
        }
    };
    
    window.testSugerenciasRapido = {
        completo: function() {
            console.log('🧪 Test rápido manual...');
            if (window.testSugerenciasIA && window.testSugerenciasIA.ejecutarPruebaCompleta) {
                return window.testSugerenciasIA.ejecutarPruebaCompleta();
            } else {
                console.log('❌ testSugerenciasIA no disponible');
                return false;
            }
        }
    };
    
    console.log('✅ Funciones de emergencia creadas');
    console.log('💡 Ahora puedes usar:');
    console.log('   testBotonesSugerencias.actualizar()');
    console.log('   testBotonesSugerencias.pruebas()');
    console.log('   testSugerenciasRapido.completo()');
}

// Exportar todas las funciones
window.solucionEmergencia = {
    completa: solucionCompleta,
    diagnostico: diagnosticoInmediato,
    crearHandler: crearHandlerManual,
    probarBotones: probarBotonesDirectamente,
    forzarTemplate: forzarCargaTemplate,
    manual: emergenciaManual
};

console.log('💡 === INSTRUCCIONES DE USO ===');
console.log('1️⃣ Ejecuta: solucionEmergencia.completa()');
console.log('2️⃣ Si no funciona: solucionEmergencia.manual()');
console.log('3️⃣ Luego ya puedes usar los tests normales');

// Auto-ejecutar si estamos en sugerencias
setTimeout(() => {
    const seccionSugerencias = document.getElementById('section-sugerencias');
    if (seccionSugerencias && !seccionSugerencias.classList.contains('hidden')) {
        console.log('🚀 Auto-ejecutando solución (detectada sección sugerencias)...');
        solucionCompleta();
    } else {
        console.log('⏳ Para auto-ejecutar, navega a sección "Sugerencias" primero');
    }
}, 1000);
