/**
 * 🔧 DEBUG: Diagnosticar problema de módulo créditos
 * Ejecutar en consola del navegador
 */

async function debugCreditosModule() {
    console.log('🔍 INICIANDO DEBUG DEL MÓDULO CRÉDITOS...\n');
    
    // 1. Verificar si Supabase está disponible
    console.log('1️⃣ Verificando Supabase...');
    if (typeof supabase !== 'undefined') {
        console.log('✅ Supabase disponible');
    } else {
        console.log('❌ Supabase NO disponible');
        return;
    }
    
    // 2. Verificar autenticación
    console.log('\n2️⃣ Verificando autenticación...');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
        console.log('✅ Usuario autenticado:', user.email);
    } else {
        console.log('❌ Usuario NO autenticado:', error);
        return;
    }
    
    // 3. Verificar si existe el template
    console.log('\n3️⃣ Verificando template...');
    try {
        const response = await fetch('./modules/creditos-template.html');
        if (response.ok) {
            const html = await response.text();
            console.log('✅ Template cargado:', html.length, 'caracteres');
        } else {
            console.log('❌ Error cargando template:', response.status);
        }
    } catch (error) {
        console.log('❌ Error de red cargando template:', error);
    }
    
    // 4. Verificar si CreditosModuleHandler existe
    console.log('\n4️⃣ Verificando CreditosModuleHandler...');
    if (typeof CreditosModuleHandler !== 'undefined') {
        console.log('✅ CreditosModuleHandler disponible');
        
        // Intentar crear instancia
        try {
            const handler = new CreditosModuleHandler();
            console.log('✅ Instancia creada correctamente');
            
            // Verificar métodos
            if (handler.loadCreditos) {
                console.log('✅ Método loadCreditos disponible');
            } else {
                console.log('❌ Método loadCreditos NO disponible');
            }
        } catch (error) {
            console.log('❌ Error creando instancia:', error);
        }
    } else {
        console.log('❌ CreditosModuleHandler NO disponible');
    }
    
    // 5. Verificar tabla simulaciones_credito
    console.log('\n5️⃣ Verificando tabla simulaciones_credito...');
    try {
        const { data, error } = await supabase
            .from('simulaciones_credito')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log('❌ Error consultando tabla:', error);
        } else {
            console.log('✅ Tabla accesible. Registros:', data?.length || 0);
        }
    } catch (error) {
        console.log('❌ Error general consultando tabla:', error);
    }
    
    // 6. Verificar elementos DOM
    console.log('\n6️⃣ Verificando elementos DOM...');
    const section = document.getElementById('section-creditos');
    if (section) {
        console.log('✅ section-creditos encontrado');
        console.log('🔍 Contenido actual:', section.innerHTML.substring(0, 200) + '...');
    } else {
        console.log('❌ section-creditos NO encontrado');
    }
    
    console.log('\n🏁 DEBUG COMPLETADO');
}

// Ejecutar debug
debugCreditosModule();
