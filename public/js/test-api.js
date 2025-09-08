/**
 * 🧪 TEST API ENDPOINTS EN PRODUCCIÓN
 * Verifica que todos los endpoints funcionen correctamente
 */

// Configuración para test en producción
const CONFIG_TEST = {
    // Usar el dominio actual si estamos en producción
    API_URL: window.location.hostname === 'localhost' ? 'http://localhost:5000' : '',
    
    endpoints: [
        '/health',
        '/api/ingresos',
        '/auth/login'
    ]
};

// Función para testear endpoint
async function testEndpoint(endpoint) {
    const url = CONFIG_TEST.API_URL + endpoint;
    
    try {
        console.log(`🧪 Testing: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Success:`, data);
            return { success: true, data, status: response.status };
        } else {
            const errorText = await response.text();
            console.log(`❌ Error:`, errorText);
            return { success: false, error: errorText, status: response.status };
        }
        
    } catch (error) {
        console.log(`💥 Network Error:`, error.message);
        return { success: false, error: error.message, status: 0 };
    }
}

// Función para testear todos los endpoints
async function runAllTests() {
    console.log('🚀 Iniciando tests de API...\n');
    
    const results = [];
    
    for (const endpoint of CONFIG_TEST.endpoints) {
        const result = await testEndpoint(endpoint);
        results.push({ endpoint, ...result });
        console.log('─'.repeat(50));
    }
    
    console.log('\n📊 RESUMEN DE TESTS:');
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.endpoint} (${result.status})`);
    });
    
    return results;
}

// Auto-ejecutar si estamos en una página web
if (typeof window !== 'undefined') {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
}

// Exportar para uso manual
window.apiTest = {
    testEndpoint,
    runAllTests,
    config: CONFIG_TEST
};
