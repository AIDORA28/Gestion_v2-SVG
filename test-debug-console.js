const puppeteer = require('puppeteer');

async function testIngresosSystem() {
    console.log('🧪 === INICIANDO PRUEBAS AUTOMATIZADAS DEL SISTEMA DE INGRESOS ===');
    console.log('📅 Timestamp:', new Date().toLocaleString());
    console.log('');

    let browser;
    let page;

    try {
        // Inicializar Puppeteer
        console.log('🚀 Iniciando navegador...');
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1200, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        
        // Interceptar console.log del navegador
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('🔍') || text.includes('✅') || text.includes('❌') || 
                text.includes('📝') || text.includes('🔐') || text.includes('📊')) {
                console.log(`[BROWSER] ${text}`);
            }
        });
        
        // Navegar al debug console
        console.log('🌐 Navegando al debug console...');
        await page.goto('http://localhost:8080/Pruebas/debug-console.html');
        
        // Esperar a que cargue completamente
        await page.waitForSelector('#debug-output', { timeout: 10000 });
        console.log('✅ Debug console cargado');
        
        // Paso 1: Verificar autenticación
        console.log('');
        console.log('🔍 PASO 1: Verificando autenticación...');
        await page.click('button[onclick="checkAuth()"]');
        await page.waitForTimeout(2000);
        
        // Paso 2: Test conexión Supabase
        console.log('');
        console.log('🔍 PASO 2: Probando conexión Supabase...');
        await page.click('button[onclick="testSupabaseConnection()"]');
        await page.waitForTimeout(2000);
        
        // Paso 3: Inicializar sistema
        console.log('');
        console.log('🔍 PASO 3: Inicializando sistema...');
        await page.click('button[onclick="initializeSystem()"]');
        await page.waitForTimeout(3000);
        
        // Paso 4: Ejecutar diagnóstico completo
        console.log('');
        console.log('🔍 PASO 4: Ejecutando diagnóstico completo...');
        await page.click('button[onclick="runDiagnostic()"]');
        await page.waitForTimeout(3000);
        
        // Paso 5: Ejecutar prueba completa
        console.log('');
        console.log('🔍 PASO 5: Ejecutando prueba completa...');
        await page.click('button[onclick="runDebugTest()"]');
        await page.waitForTimeout(5000);
        
        // Capturar el estado de los componentes
        console.log('');
        console.log('📊 === CAPTURANDO ESTADO DEL SISTEMA ===');
        
        const statusAuth = await page.$eval('#status-auth', el => el.textContent);
        const statusSupabase = await page.$eval('#status-supabase', el => el.textContent);
        const statusTemplate = await page.$eval('#status-template', el => el.textContent);
        const statusHandler = await page.$eval('#status-handler', el => el.textContent);
        
        console.log('🔐 Autenticación:', statusAuth);
        console.log('🌐 Supabase:', statusSupabase);
        console.log('📄 Template:', statusTemplate);
        console.log('🧠 Handler:', statusHandler);
        
        // Capturar output del debug console
        console.log('');
        console.log('💻 === OUTPUT DEL DEBUG CONSOLE ===');
        const debugOutput = await page.$eval('#debug-output', el => el.textContent);
        console.log(debugOutput);
        
        // Paso 6: Probar envío manual
        console.log('');
        console.log('🔍 PASO 6: Probando envío manual...');
        await page.click('button[onclick="testFormSubmit()"]');
        await page.waitForTimeout(3000);
        
        // Evaluar funciones directamente en el navegador
        console.log('');
        console.log('🔍 PASO 7: Evaluando funciones directas...');
        
        const result = await page.evaluate(async () => {
            try {
                // Verificar si las funciones están disponibles
                const hasDebugIngresos = typeof window.debugIngresos === 'function';
                const hasDiagnosticIngresos = typeof window.diagnosticIngresos === 'function';
                const hasHandler = !!window.ingresosModuleHandler;
                
                console.log('🔍 debugIngresos disponible:', hasDebugIngresos);
                console.log('🔍 diagnosticIngresos disponible:', hasDiagnosticIngresos);
                console.log('🔍 Handler disponible:', hasHandler);
                
                let debugResult = null;
                let diagnosticResult = null;
                
                // Ejecutar diagnóstico si está disponible
                if (hasDiagnosticIngresos) {
                    try {
                        diagnosticResult = await window.diagnosticIngresos();
                        console.log('✅ Diagnóstico ejecutado:', diagnosticResult);
                    } catch (error) {
                        console.log('❌ Error en diagnóstico:', error.message);
                    }
                } else if (hasHandler && window.ingresosModuleHandler.diagnosticCheck) {
                    try {
                        diagnosticResult = await window.ingresosModuleHandler.diagnosticCheck();
                        console.log('✅ Diagnóstico (handler) ejecutado:', diagnosticResult);
                    } catch (error) {
                        console.log('❌ Error en diagnóstico (handler):', error.message);
                    }
                }
                
                // Ejecutar debug si está disponible
                if (hasDebugIngresos) {
                    try {
                        debugResult = await window.debugIngresos();
                        console.log('✅ Debug ejecutado:', debugResult);
                    } catch (error) {
                        console.log('❌ Error en debug:', error.message);
                    }
                } else if (hasHandler && window.ingresosModuleHandler.debugTest) {
                    try {
                        debugResult = await window.ingresosModuleHandler.debugTest();
                        console.log('✅ Debug (handler) ejecutado:', debugResult);
                    } catch (error) {
                        console.log('❌ Error en debug (handler):', error.message);
                    }
                }
                
                return {
                    hasDebugIngresos,
                    hasDiagnosticIngresos,
                    hasHandler,
                    debugResult,
                    diagnosticResult
                };
                
            } catch (error) {
                console.log('❌ Error en evaluación:', error.message);
                return { error: error.message };
            }
        });
        
        console.log('📋 Resultado de la evaluación:', result);
        
        // Tomar screenshot
        console.log('');
        console.log('📸 Tomando screenshot...');
        await page.screenshot({ path: 'debug-console-result.png', fullPage: true });
        
        console.log('');
        console.log('🎉 === PRUEBAS COMPLETADAS ===');
        console.log('📊 Resumen:');
        console.log('  - Navegador iniciado: ✅');
        console.log('  - Debug console cargado: ✅');
        console.log('  - Pruebas ejecutadas: ✅');
        console.log('  - Screenshot guardado: ✅');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        
        if (page) {
            // Tomar screenshot del error
            try {
                await page.screenshot({ path: 'debug-console-error.png', fullPage: true });
                console.log('📸 Screenshot de error guardado');
            } catch (screenshotError) {
                console.error('❌ Error tomando screenshot:', screenshotError);
            }
        }
        
    } finally {
        if (browser) {
            console.log('🔒 Cerrando navegador...');
            await browser.close();
        }
    }
}

// Ejecutar las pruebas
testIngresosSystem().then(() => {
    console.log('✅ Script de pruebas finalizado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
