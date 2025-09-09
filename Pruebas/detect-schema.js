/**
 * 🔍 SCRIPT PARA DETECTAR ESTRUCTURA REAL
 * Verifica si usas auth.users o tabla usuarios personalizada
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function detectSchema() {
    console.log('🔍 DETECTANDO ESTRUCTURA REAL DE USUARIO');
    console.log('==========================================');

    try {
        // 1. Crear usuario de prueba en tabla usuarios
        console.log('📝 1. Probando tabla usuarios personalizada...');
        
        const testUser = {
            nombre: 'Test',
            apellido: 'User',
            email: 'test@planificapro.com',
            password_hash: 'test123'
        };

        const { data: newUser, error: createError } = await supabase
            .from('usuarios')
            .insert([testUser])
            .select()
            .single();

        if (createError) {
            console.log('❌ Error creando usuario:', createError.message);
            return;
        }

        console.log('✅ Usuario creado:', newUser.id);

        // 2. Probar crear ingreso con referencia a usuarios
        console.log('📝 2. Probando ingreso con referencia a usuarios...');
        
        const testIngreso = {
            usuario_id: newUser.id,
            descripcion: 'Salario de prueba',
            monto: 1000000,
            categoria: 'salario'
        };

        const { data: ingreso, error: ingresoError } = await supabase
            .from('ingresos')
            .insert([testIngreso])
            .select()
            .single();

        if (ingresoError) {
            console.log('❌ Error creando ingreso:', ingresoError.message);
            
            // Si falla, puede ser que la FK apunte a auth.users
            console.log('🔍 Posiblemente las tablas referencian auth.users...');
        } else {
            console.log('✅ Ingreso creado:', ingreso.id);
            console.log('✅ CONFIRMADO: Las tablas usan tabla usuarios personalizada');
        }

        // 3. Obtener estructura detallada
        console.log('📊 3. Estructura del usuario creado:');
        console.log(JSON.stringify(newUser, null, 2));

        // 4. Limpiar datos de prueba
        console.log('🧹 4. Limpiando datos de prueba...');
        
        if (ingreso) {
            await supabase.from('ingresos').delete().eq('id', ingreso.id);
            console.log('✅ Ingreso de prueba eliminado');
        }
        
        await supabase.from('usuarios').delete().eq('id', newUser.id);
        console.log('✅ Usuario de prueba eliminado');

        return {
            userTable: 'usuarios',
            structure: newUser,
            foreignKeyWorks: !!ingreso
        };

    } catch (error) {
        console.error('💥 Error:', error);
        return null;
    }
}

detectSchema()
    .then(result => {
        if (result) {
            console.log('\n🎉 DETECCIÓN COMPLETADA');
            console.log('========================');
            console.log('✅ Tabla de usuarios:', result.userTable);
            console.log('✅ Foreign Keys funcionan:', result.foreignKeyWorks);
            console.log('\n📊 ESTRUCTURA CONFIRMADA:');
            console.log(JSON.stringify(result.structure, null, 2));
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
