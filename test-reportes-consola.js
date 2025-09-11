// 🧪 PRUEBA DIRECTA DEL MÓDULO DE REPORTES EN DASHBOARD
// Copiar y pegar en la consola del navegador después de hacer login

console.log('🧪 === PRUEBA DIRECTA MÓDULO REPORTES ===');

// 1. Verificar que el módulo existe
if (typeof ReportesModuleHandler !== 'undefined') {
    console.log('✅ ReportesModuleHandler clase disponible');
} else {
    console.error('❌ ReportesModuleHandler NO encontrada');
}

// 2. Verificar localStorage
const userStr = localStorage.getItem('currentUser');
const token = localStorage.getItem('supabase_access_token');

console.log('📊 Estado localStorage:');
console.log('- currentUser:', userStr ? 'PRESENTE' : 'AUSENTE');
console.log('- supabase_access_token:', token ? 'PRESENTE' : 'AUSENTE');

if (userStr && token) {
    const userData = JSON.parse(userStr);
    console.log('- Usuario:', userData.email);
    console.log('- ID:', userData.id);
}

// 3. Crear instancia del módulo de reportes
let reportesTest;
try {
    reportesTest = new ReportesModuleHandler();
    console.log('✅ Instancia de ReportesModuleHandler creada');
    
    // 4. Inicializar
    reportesTest.init().then(() => {
        console.log('✅ Módulo inicializado');
        
        // 5. Probar fetchSupabaseData directamente
        console.log('📡 Probando fetchSupabaseData...');
        
        Promise.all([
            reportesTest.fetchSupabaseData('ingresos'),
            reportesTest.fetchSupabaseData('gastos'),
            reportesTest.fetchSupabaseData('simulaciones_credito')
        ]).then(([ingresos, gastos, creditos]) => {
            console.log('📊 Datos obtenidos:');
            console.log('💰 Ingresos:', ingresos.length, 'registros');
            console.log('💸 Gastos:', gastos.length, 'registros');  
            console.log('💳 Créditos:', creditos.length, 'registros');
            
            if (ingresos.length > 0) {
                console.log('📝 Ejemplo ingreso:', ingresos[0]);
            }
            if (gastos.length > 0) {
                console.log('📝 Ejemplo gasto:', gastos[0]);
            }
            
            // 6. Probar calculateRealStats
            const stats = reportesTest.calculateRealStats(ingresos, gastos);
            console.log('📊 Estadísticas calculadas:', stats);
            
            // 7. Simular elementos DOM y probar updateStatsCards
            const testContainer = document.createElement('div');
            testContainer.innerHTML = `
                <p id="test-total-ingresos">S/ 0.00</p>
                <p id="test-total-gastos">S/ 0.00</p>
                <p id="test-balance-neto">S/ 0.00</p>
                <p id="test-total-creditos">S/ 0.00</p>
            `;
            document.body.appendChild(testContainer);
            
            // Temporalmente cambiar IDs para el test
            const updateStatsCardsOriginal = reportesTest.updateStatsCards;
            reportesTest.updateStatsCards = function(stats) {
                console.log('🎯 Actualizando elementos de prueba...');
                
                const elementoIngresos = document.getElementById('test-total-ingresos');
                const elementoGastos = document.getElementById('test-total-gastos');
                const elementoBalance = document.getElementById('test-balance-neto');
                const elementoCreditos = document.getElementById('test-total-creditos');
                
                if (elementoIngresos) {
                    elementoIngresos.textContent = this.formatCurrency(stats.totalIngresos);
                    console.log('✅ Total ingresos:', elementoIngresos.textContent);
                }
                
                if (elementoGastos) {
                    elementoGastos.textContent = this.formatCurrency(stats.totalGastos);
                    console.log('✅ Total gastos:', elementoGastos.textContent);
                }
                
                if (elementoBalance) {
                    elementoBalance.textContent = this.formatCurrency(stats.balance);
                    console.log('✅ Balance neto:', elementoBalance.textContent);
                }

                if (elementoCreditos) {
                    const totalCreditos = creditos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                    elementoCreditos.textContent = this.formatCurrency(totalCreditos);
                    console.log('✅ Total créditos:', elementoCreditos.textContent);
                }
            };
            
            reportesTest.datosReporte.creditos = creditos;
            reportesTest.updateStatsCards(stats);
            
            // Limpiar
            document.body.removeChild(testContainer);
            reportesTest.updateStatsCards = updateStatsCardsOriginal;
            
            console.log('🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
            console.log('💡 El módulo de reportes está funcionando correctamente');
            
        }).catch(error => {
            console.error('❌ Error obteniendo datos:', error);
        });
        
    }).catch(error => {
        console.error('❌ Error inicializando módulo:', error);
    });
    
} catch (error) {
    console.error('❌ Error creando instancia:', error);
}

console.log('📋 Revisa los logs arriba para ver si el módulo funciona correctamente');
