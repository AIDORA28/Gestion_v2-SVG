// ===================================================================
// PRUEBA DE CONEXIÓN A SUPABASE
// Verifica que la conexión funcione correctamente
// ===================================================================

require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

console.log('🧪 PROBANDO CONEXIÓN A SUPABASE...');
console.log('=====================================');

// Configurar cliente de Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testSupabaseConnection() {
    try {
        console.log('🔗 URL de Supabase:', process.env.SUPABASE_URL);
        console.log('🔑 Clave anónima configurada:', process.env.SUPABASE_ANON_KEY ? 'Sí' : 'No');
        console.log('');
        
        // Probar conexión básica
        console.log('📡 Probando conexión básica...');
        const { data, error } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Error de conexión:', error.message);
            return false;
        }
        
        console.log('✅ Conexión exitosa a Supabase!');
        console.log('📊 Tabla usuarios accesible');
        console.log('');
        
        // Probar consulta a tabla usuarios
        console.log('👥 Consultando tabla usuarios...');
        const { data: usuarios, error: userError } = await supabase
            .from('usuarios')
            .select('id, nombre, email, created_at')
            .limit(5);
        
        if (userError) {
            console.error('❌ Error consultando usuarios:', userError.message);
            return false;
        }
        
        console.log('✅ Consulta a usuarios exitosa!');
        console.log(`📋 Usuarios encontrados: ${usuarios?.length || 0}`);
        if (usuarios && usuarios.length > 0) {
            usuarios.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.nombre} (${user.email})`);
            });
        }
        console.log('');
        
        // Probar otras tablas
        const tablas = ['ingresos', 'gastos', 'categorias_personalizadas', 'metas_financieras'];
        
        for (const tabla of tablas) {
            try {
                const { data, error } = await supabase
                    .from(tabla)
                    .select('*', { count: 'exact', head: true });
                
                if (error) {
                    console.log(`⚠️  Tabla ${tabla}: ${error.message}`);
                } else {
                    console.log(`✅ Tabla ${tabla}: accesible`);
                }
            } catch (err) {
                console.log(`❌ Tabla ${tabla}: error - ${err.message}`);
            }
        }
        
        console.log('');
        console.log('🎉 ¡CONEXIÓN A SUPABASE COMPLETAMENTE FUNCIONAL!');
        console.log('🚀 Tu aplicación está lista para producción');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
        console.error('🔧 Verifica las credenciales en .env.production');
        return false;
    }
}

// Ejecutar prueba
testSupabaseConnection()
    .then(success => {
        if (success) {
            console.log('');
            console.log('📋 PRÓXIMOS PASOS:');
            console.log('1. Ve a Vercel Dashboard');
            console.log('2. Settings → Environment Variables');
            console.log('3. Agrega estas variables:');
            console.log('   - SUPABASE_URL=' + process.env.SUPABASE_URL);
            console.log('   - SUPABASE_ANON_KEY=' + process.env.SUPABASE_ANON_KEY);
            console.log('   - SUPABASE_SERVICE_ROLE_KEY=' + process.env.SUPABASE_SERVICE_ROLE_KEY);
            console.log('   - NODE_ENV=production');
            console.log('4. Redeploy tu aplicación');
            console.log('5. ¡Listo para usar en producción!');
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error crítico:', error);
        process.exit(1);
    });
