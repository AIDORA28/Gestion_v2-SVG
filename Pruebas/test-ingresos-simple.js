// Script para probar el módulo de ingresos usando Puppeteer de forma simple
const puppeteer = require('puppeteer');

async function probarModuloIngresos() {
    console.log('🧪 === PRUEBA RÁPIDA DEL MÓDULO DE INGRESOS ===');
    console.log('📅 Timestamp:', new Date().toLocaleString());
    console.log('');

    let browser;
    let page;

    try {
        console.log('🚀 Iniciando navegador...');
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1200, height: 800 }
        });
        
        page = await browser.newPage();

        // Interceptar errores JavaScript
        page.on('pageerror', error => {
            console.log('❌ [ERROR JS]', error.message);
        });

        // Interceptar console del navegador
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('📝') || text.includes('✅') || text.includes('❌') || 
                text.includes('🔐') || text.includes('📊') || text.includes('🌐')) {
                console.log(`[BROWSER] ${text}`);
            }
        });

        console.log('🌐 Navegando al debug console...');
        await page.goto('http://localhost:8080/Pruebas/debug-console.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        console.log('⏱️ Esperando que cargue...');
        await page.waitForTimeout(3000);

        console.log('🔧 Ejecutando diagnóstico automático...');
        
        // Ejecutar las funciones de debug directamente en el navegador
        const resultado = await page.evaluate(async () => {
            const logs = [];
            
            // Función helper para logging
            function log(message) {
                logs.push(message);
                console.log(message);
            }
            
            try {
                log('🔍 Iniciando diagnóstico automático...');
                
                // 1. Verificar autenticación
                log('🔐 Verificando autenticación...');
                const token = localStorage.getItem('supabase_access_token');
                const user = localStorage.getItem('currentUser');
                log(`Token: ${token ? '✅ PRESENTE' : '❌ FALTANTE'}`);
                log(`Usuario: ${user ? JSON.parse(user).email : '❌ NO AUTENTICADO'}`);
                
                // 2. Verificar si Supabase está disponible
                log('🌐 Verificando Supabase...');
                const supabaseDisponible = typeof window.supabase !== 'undefined';
                log(`Supabase: ${supabaseDisponible ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
                
                // 3. Verificar handler
                log('🧠 Verificando handler...');
                const handlerDisponible = !!window.ingresosModuleHandler;
                log(`Handler: ${handlerDisponible ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`);
                
                // 4. Si no hay handler, intentar crear uno
                if (!handlerDisponible && typeof IngresosModuleHandler !== 'undefined') {
                    log('🚀 Creando handler...');
                    try {
                        window.ingresosModuleHandler = new IngresosModuleHandler();
                        await window.ingresosModuleHandler.init();
                        log('✅ Handler creado exitosamente');
                    } catch (error) {
                        log(`❌ Error creando handler: ${error.message}`);
                    }
                }
                
                // 5. Probar funciones de debug si están disponibles
                let debugResult = null;
                let diagnosticResult = null;
                
                if (window.ingresosModuleHandler) {
                    log('🧪 Ejecutando diagnóstico...');
                    try {
                        if (typeof window.ingresosModuleHandler.diagnosticCheck === 'function') {
                            diagnosticResult = await window.ingresosModuleHandler.diagnosticCheck();
                            log('✅ Diagnóstico completado');
                        } else {
                            log('⚠️ Función diagnosticCheck no disponible');
                        }
                    } catch (error) {
                        log(`❌ Error en diagnóstico: ${error.message}`);
                    }
                    
                    log('🚀 Ejecutando prueba de debug...');
                    try {
                        if (typeof window.ingresosModuleHandler.debugTest === 'function') {
                            debugResult = await window.ingresosModuleHandler.debugTest();
                            log('✅ Debug test completado');
                        } else {
                            log('⚠️ Función debugTest no disponible');
                        }
                    } catch (error) {
                        log(`❌ Error en debug test: ${error.message}`);
                    }
                } else {
                    log('❌ No se pudo inicializar el handler');
                }
                
                // 6. Probar envío manual si el handler está disponible
                if (window.ingresosModuleHandler && typeof window.ingresosModuleHandler.submitIngreso === 'function') {
                    log('📝 Probando envío manual...');
                    try {
                        const testData = {
                            descripcion: 'Prueba Automática Console',
                            monto: '555.55',
                            categoria: 'Freelance',
                            fecha: new Date().toISOString().split('T')[0],
                            notas: 'Prueba desde script automatizado'
                        };
                        
                        const submitResult = await window.ingresosModuleHandler.submitIngreso(testData);
                        log(`📊 Resultado envío: ${submitResult.success ? '✅ ÉXITO' : '❌ FALLO'}`);
                        
                        if (!submitResult.success) {
                            log(`❌ Error: ${submitResult.error}`);
                        }
                    } catch (error) {
                        log(`❌ Error en envío manual: ${error.message}`);
                    }
                }
                
                return {
                    logs,
                    token: !!token,
                    user: !!user,
                    supabase: supabaseDisponible,
                    handler: !!window.ingresosModuleHandler,
                    diagnosticResult,
                    debugResult
                };
                
            } catch (error) {
                log(`❌ Error general: ${error.message}`);
                return {
                    logs,
                    error: error.message
                };
            }
        });

        // Mostrar resultados
        console.log('');
        console.log('📊 === RESULTADOS ===');
        resultado.logs.forEach(log => console.log(log));
        
        console.log('');
        console.log('📋 === RESUMEN ===');
        console.log('🔐 Token:', resultado.token ? '✅' : '❌');
        console.log('👤 Usuario:', resultado.user ? '✅' : '❌');
        console.log('🌐 Supabase:', resultado.supabase ? '✅' : '❌');
        console.log('🧠 Handler:', resultado.handler ? '✅' : '❌');
        
        if (resultado.diagnosticResult) {
            console.log('🔍 Diagnóstico:', resultado.diagnosticResult);
        }
        
        if (resultado.debugResult) {
            console.log('🧪 Debug Result:', resultado.debugResult);
        }
        
        // Tomar screenshot final
        console.log('📸 Tomando screenshot...');
        await page.screenshot({ path: 'test-result.png', fullPage: true });
        
        // Esperar un poco para que el usuario vea el resultado
        console.log('⏱️ Manteniendo navegador abierto 10 segundos para inspección...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        if (browser) {
            console.log('🔒 Cerrando navegador...');
            await browser.close();
        }
    }
}

// Solo ejecutar si Puppeteer está disponible
(async () => {
    try {
        await probarModuloIngresos();
        console.log('✅ Prueba completada');
    } catch (error) {
        if (error.message.includes('puppeteer')) {
            console.log('⚠️ Puppeteer no disponible, instala con: npm install puppeteer');
            console.log('💡 Alternativamente, abre manualmente: http://localhost:8080/Pruebas/debug-console.html');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
})();
