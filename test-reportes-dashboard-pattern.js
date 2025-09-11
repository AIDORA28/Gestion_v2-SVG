// 🧪 Test directo del módulo de reportes con patrón dashboard
// Ejecutar en consola del navegador después de login

async function testReportesConDashboard() {
    console.log('🧪 === TEST REPORTES CON PATRÓN DASHBOARD ===');
    
    // 1. Verificar autenticación
    const userStr = localStorage.getItem('currentUser');
    const token = localStorage.getItem('supabase_access_token');
    
    if (!userStr || !token) {
        console.error('❌ No hay sesión activa');
        return;
    }
    
    const userData = JSON.parse(userStr);
    console.log('✅ Usuario:', userData.email, 'ID:', userData.id);
    
    // 2. Crear instancia del módulo
    const reportes = new ReportesModuleHandler();
    await reportes.init();
    
    console.log('✅ Módulo inicializado');
    
    // 3. Probar fetchSupabaseData directamente
    console.log('📡 Probando fetchSupabaseData...');
    
    const ingresos = await reportes.fetchSupabaseData('ingresos');
    const gastos = await reportes.fetchSupabaseData('gastos');
    const creditos = await reportes.fetchSupabaseData('simulaciones_credito');
    
    console.log('📊 Datos obtenidos:');
    console.log('💰 Ingresos:', ingresos.length);
    console.log('💸 Gastos:', gastos.length);
    console.log('💳 Créditos:', creditos.length);
    
    // 4. Calcular estadísticas
    const stats = reportes.calculateRealStats(ingresos, gastos);
    console.log('📊 Estadísticas:', stats);
    
    // 5. Simular elementos DOM para probar updateStatsCards
    const container = document.createElement('div');
    container.innerHTML = `
        <p id="total-ingresos">S/ 0.00</p>
        <p id="total-gastos">S/ 0.00</p>
        <p id="balance-neto">S/ 0.00</p>
        <p id="total-creditos">S/ 0.00</p>
    `;
    document.body.appendChild(container);
    
    // 6. Probar actualización de UI
    reportes.datosReporte.creditos = creditos;
    reportes.updateStatsCards(stats);
    
    console.log('🖥️ Elementos actualizados:');
    console.log('💰 Total ingresos:', document.getElementById('total-ingresos').textContent);
    console.log('💸 Total gastos:', document.getElementById('total-gastos').textContent);
    console.log('⚖️ Balance neto:', document.getElementById('balance-neto').textContent);
    console.log('💳 Total créditos:', document.getElementById('total-creditos').textContent);
    
    // 7. Limpiar
    document.body.removeChild(container);
    
    console.log('✅ Test completado exitosamente');
    return { reportes, stats, ingresos, gastos, creditos };
}

// Ejecutar test
console.log('📋 Para probar, hacer login en dashboard y ejecutar: testReportesConDashboard()');
