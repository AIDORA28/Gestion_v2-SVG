/**
 * 🧪 SCRIPT DE VERIFICACIÓN POST-DEPLOY
 * Verificar que Supabase y Vercel estén funcionando correctamente
 */

async function verificarDeploy() {
    console.log('🧪 ===== VERIFICACIÓN POST-DEPLOY =====\n');
    
    try {
        // 1. Verificar que la página principal carga
        console.log('1. 🌐 Verificando página principal...');
        const landingResponse = await fetch(window.location.origin);
        if (landingResponse.ok) {
            console.log('✅ Página principal: OK');
        } else {
            console.log('❌ Página principal: ERROR');
        }
        
        // 2. Verificar endpoint de salud
        console.log('\n2. 🏥 Verificando API health...');
        const healthResponse = await fetch('/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ API Health: OK');
            console.log('📊 Respuesta:', healthData);
        } else {
            console.log('❌ API Health: ERROR');
        }
        
        // 3. Verificar detección de entorno
        console.log('\n3. 🔍 Verificando detección de entorno...');
        if (window.CONFIG) {
            console.log('✅ Configuración cargada');
            console.log('🎯 Entorno detectado:', window.CONFIG.ENV);
            console.log('🗄️ API URL:', window.CONFIG.API_URL || 'Vercel routes');
            
            if (window.CONFIG.ENV === 'production') {
                console.log('✅ Entorno de producción detectado correctamente');
            } else {
                console.log('⚠️ Entorno no es producción. Detectado:', window.CONFIG.ENV);
            }
        } else {
            console.log('❌ Configuración no cargada');
        }
        
        // 4. Verificar que los archivos estáticos cargan
        console.log('\n4. 📁 Verificando archivos estáticos...');
        const cssResponse = await fetch('/css/landing.css');
        if (cssResponse.ok) {
            console.log('✅ CSS: OK');
        } else {
            console.log('❌ CSS: ERROR');
        }
        
        console.log('\n🎉 ===== VERIFICACIÓN COMPLETADA =====');
        console.log('\n📋 Próximas pruebas manuales:');
        console.log('1. Registrar nuevo usuario');
        console.log('2. Iniciar sesión');
        console.log('3. Agregar un ingreso');
        console.log('4. Verificar estadísticas');
        console.log('5. Probar navegación entre módulos');
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

// Ejecutar verificación cuando la página esté lista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarDeploy);
} else {
    verificarDeploy();
}

// También disponible manualmente
window.verificarDeploy = verificarDeploy;
