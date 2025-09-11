/**
 * 🧪 PRUEBA ESPECÍFICA: Botón "Simular Crédito"
 * Verificar que el botón funcione correctamente después de los cambios
 */

const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 INICIANDO PRUEBA: Botón Simular Crédito');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Configurar token de prueba válido
        await page.evaluateOnNewDocument(() => {
            localStorage.setItem('supabase_access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM5MjI3MzE5LCJpYXQiOjE3MzkyMjM3MTksImlzcyI6Imh0dHBzOi8vbG9ieW9mcHdxd3Fzc3p1Z2R3bncuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjNjZGM3OWVlLTBkYTItNGE3NC04ZTQ5LWM1YWJhMzc1ZTI4MCIsImVtYWlsIjoic2FudGlhZ282ODc5QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzM5MjIzNzE5fV0sInNlc3Npb25faWQiOiIxMWYyOGZiMC00N2VlLTRhZjMtOTEyNy00NTYyZTU1YTcwMzIifQ.T0f-n9J5VBJlNhvUYpz5lRBHIGRPgL7_2wAFfNxXCBw');
            localStorage.setItem('currentUser', JSON.stringify({
                id: '3cdc79ee-0da2-4a74-8e49-c5aba375e280',
                email: 'santiago6879@gmail.com'
            }));
        });
        
        console.log('🌐 Navegando a localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        // Ir al módulo de créditos
        console.log('💳 Navegando al módulo de créditos...');
        await page.click('a[href="#creditos"]');
        await page.waitForTimeout(2000);
        
        // Hacer clic en "Nueva Simulación"
        console.log('➕ Abriendo nueva simulación...');
        await page.click('button:has-text("Nueva Simulación"), button[onclick*="openCreditoModal"]');
        await page.waitForTimeout(1000);
        
        // Llenar el formulario
        console.log('📝 Llenando formulario...');
        await page.fill('#monto-creditos', '50000');
        await page.fill('#tasa-anual-creditos', '18.5');
        await page.fill('#plazo-meses-creditos', '36');
        
        // Verificar que el botón "Simular Crédito" existe
        const simularBtn = await page.$('#simular-btn');
        if (!simularBtn) {
            throw new Error('❌ Botón #simular-btn no encontrado');
        }
        console.log('✅ Botón "Simular Crédito" encontrado');
        
        // Hacer clic en "Simular Crédito"
        console.log('🔥 Haciendo clic en "Simular Crédito"...');
        await page.click('#simular-btn');
        await page.waitForTimeout(2000);
        
        // Verificar que aparecieron los resultados
        const resultsSection = await page.$('#simulacion-results');
        const isVisible = await page.evaluate(el => !el.classList.contains('hidden'), resultsSection);
        
        if (!isVisible) {
            throw new Error('❌ Los resultados de simulación no se mostraron');
        }
        
        console.log('✅ ¡Resultados de simulación mostrados correctamente!');
        
        // Verificar que el botón "Guardar" se habilitó
        const saveBtn = await page.$('#save-btn');
        const isEnabled = await page.evaluate(el => !el.disabled, saveBtn);
        
        if (!isEnabled) {
            throw new Error('❌ El botón "Guardar Simulación" no se habilitó');
        }
        
        console.log('✅ ¡Botón "Guardar Simulación" habilitado correctamente!');
        
        // Verificar valores calculados
        const cuotaMensual = await page.textContent('#result-cuota-mensual');
        const totalPagar = await page.textContent('#result-total-pagar');
        const intereses = await page.textContent('#result-intereses');
        
        console.log('📊 RESULTADOS DE LA SIMULACIÓN:');
        console.log(`   💰 Cuota Mensual: ${cuotaMensual}`);
        console.log(`   💸 Total a Pagar: ${totalPagar}`);
        console.log(`   📈 Intereses: ${intereses}`);
        
        // Probar guardar la simulación
        console.log('💾 Guardando simulación...');
        await page.click('#save-btn');
        await page.waitForTimeout(3000);
        
        console.log('✅ ¡PRUEBA EXITOSA! El botón "Simular Crédito" funciona correctamente');
        
    } catch (error) {
        console.error('❌ ERROR EN LA PRUEBA:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
})();
