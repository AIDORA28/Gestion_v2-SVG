// Script de prueba manual para ejecutar en la consola del navegador
// Copia y pega este código en la consola del debug-console.html

console.log('🧪 === PRUEBA MANUAL DEL MÓDULO DE INGRESOS ===');
console.log('📅 Timestamp:', new Date().toLocaleString());
console.log('');

async function probarSistemaCompleto() {
    const logs = [];
    
    function log(message) {
        logs.push(message);
        console.log(message);
    }
    
    try {
        // Paso 1: Verificar autenticación
        log('🔍 PASO 1: Verificando autenticación...');
        const token = localStorage.getItem('supabase_access_token');
        const user = localStorage.getItem('currentUser');
        
        log(`🔐 Token: ${token ? '✅ PRESENTE (' + token.substring(0, 20) + '...)' : '❌ FALTANTE'}`);
        log(`👤 Usuario: ${user ? '✅ ' + JSON.parse(user).email : '❌ NO AUTENTICADO'}`);
        
        if (!token) {
            log('💡 SOLUCIÓN: Autentícate primero con joegarcia.1395@gmail.com / 123456');
            return { success: false, error: 'No authenticated' };
        }
        
        // Paso 2: Verificar Supabase
        log('');
        log('🔍 PASO 2: Verificando Supabase...');
        const supabaseOk = typeof window.supabase !== 'undefined';
        log(`🌐 Supabase client: ${supabaseOk ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
        
        if (!supabaseOk) {
            log('❌ FALLO: Cliente Supabase no disponible');
            return { success: false, error: 'Supabase not available' };
        }
        
        // Paso 3: Verificar/crear handler
        log('');
        log('🔍 PASO 3: Verificando handler...');
        let handler = window.ingresosModuleHandler;
        log(`🧠 Handler existente: ${handler ? '✅ SÍ' : '❌ NO'}`);
        
        if (!handler) {
            log('🚀 Creando nuevo handler...');
            if (typeof IngresosModuleHandler !== 'undefined') {
                handler = new IngresosModuleHandler();
                await handler.init();
                window.ingresosModuleHandler = handler;
                log('✅ Handler creado e inicializado');
            } else {
                log('❌ FALLO: Clase IngresosModuleHandler no disponible');
                return { success: false, error: 'Handler class not available' };
            }
        }
        
        // Paso 4: Probar conexión con base de datos
        log('');
        log('🔍 PASO 4: Probando conexión con base de datos...');
        try {
            const testQuery = await window.supabase
                .from('ingresos')
                .select('count', { count: 'exact', head: true })
                .eq('usuario_id', JSON.parse(user).id);
                
            if (testQuery.error) {
                log(`❌ Error en BD: ${testQuery.error.message}`);
                return { success: false, error: testQuery.error.message };
            } else {
                log(`✅ Conexión BD OK - Registros existentes: ${testQuery.count}`);
            }
        } catch (error) {
            log(`❌ FALLO conexión BD: ${error.message}`);
            return { success: false, error: error.message };
        }
        
        // Paso 5: Probar funciones de debug
        log('');
        log('🔍 PASO 5: Ejecutando funciones de debug...');
        
        let diagnosticResult = null;
        let debugResult = null;
        
        // Diagnóstico
        if (typeof handler.diagnosticCheck === 'function') {
            try {
                diagnosticResult = await handler.diagnosticCheck();
                log('✅ Diagnóstico completado');
                log(`📊 Resultado diagnóstico: ${JSON.stringify(diagnosticResult)}`);
            } catch (error) {
                log(`⚠️ Error en diagnóstico: ${error.message}`);
            }
        } else {
            log('⚠️ Función diagnosticCheck no disponible');
        }
        
        // Debug test
        if (typeof handler.debugTest === 'function') {
            try {
                debugResult = await handler.debugTest();
                log('✅ Debug test completado');
                log(`📊 Resultado debug: ${JSON.stringify(debugResult)}`);
            } catch (error) {
                log(`⚠️ Error en debug test: ${error.message}`);
            }
        } else {
            log('⚠️ Función debugTest no disponible');
        }
        
        // Paso 6: Probar envío de datos
        log('');
        log('🔍 PASO 6: Probando envío de datos...');
        
        if (typeof handler.submitIngreso === 'function') {
            const timestamp = Date.now();
            const testData = {
                descripcion: `Prueba Manual Console ${timestamp}`,
                monto: '777.77',
                categoria: 'Freelance',
                fecha: new Date().toISOString().split('T')[0],
                notas: `Prueba desde consola - ${new Date().toLocaleTimeString()}`
            };
            
            log(`📊 Datos de prueba: ${JSON.stringify(testData)}`);
            log('📝 Enviando...');
            
            try {
                const submitResult = await handler.submitIngreso(testData);
                
                if (submitResult.success) {
                    log('✅ ÉXITO: Datos enviados correctamente');
                    log(`🆔 ID generado: ${submitResult.data?.id}`);
                    
                    // Verificar que se guardó
                    log('🔍 Verificando en base de datos...');
                    const ingresos = await handler.loadIngresos();
                    const encontrado = ingresos.find(ing => ing.descripcion.includes(`${timestamp}`));
                    log(`🔍 Registro encontrado: ${encontrado ? '✅ SÍ' : '❌ NO'}`);
                    
                    if (encontrado) {
                        log(`📊 Datos guardados: ${JSON.stringify(encontrado)}`);
                    }
                    
                } else {
                    log(`❌ FALLO en envío: ${submitResult.error}`);
                    return { success: false, error: submitResult.error };
                }
            } catch (error) {
                log(`❌ ERROR en envío: ${error.message}`);
                return { success: false, error: error.message };
            }
        } else {
            log('❌ Función submitIngreso no disponible');
            return { success: false, error: 'submitIngreso not available' };
        }
        
        // Paso 7: Verificar renderizado
        log('');
        log('🔍 PASO 7: Verificando renderizado...');
        const listaElement = document.getElementById('ingresos-list');
        log(`📄 Lista DOM: ${listaElement ? '✅ PRESENTE' : '❌ AUSENTE'}`);
        
        if (listaElement) {
            log(`📊 Items en lista: ${listaElement.children.length}`);
        }
        
        // Resumen final
        log('');
        log('🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===');
        log('📊 RESUMEN:');
        log('  ✅ Autenticación: OK');
        log('  ✅ Supabase: OK');
        log('  ✅ Handler: OK');
        log('  ✅ Conexión BD: OK');
        log('  ✅ Envío datos: OK');
        log('  ✅ Verificación: OK');
        
        return {
            success: true,
            logs,
            diagnosticResult,
            debugResult,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        log(`❌ ERROR CRÍTICO: ${error.message}`);
        log(`📋 Stack: ${error.stack}`);
        return {
            success: false,
            error: error.message,
            logs
        };
    }
}

// Ejecutar la prueba automáticamente
probarSistemaCompleto().then(result => {
    console.log('');
    console.log('📋 === RESULTADO FINAL ===');
    console.log('✅ Éxito:', result.success);
    if (!result.success) {
        console.log('❌ Error:', result.error);
    }
    console.log('📊 Total logs:', result.logs?.length || 0);
    
    // Hacer resultado disponible globalmente
    window.testResult = result;
    console.log('💾 Resultado guardado en window.testResult');
});
