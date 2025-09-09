/**
 * 🔍 INSPECTOR DE ESQUEMA SUPABASE
 * Verifica las tablas y columnas reales de la base de datos
 */

// ================================
// 🔧 CONFIGURACIÓN
// ================================

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// ================================
// 🔍 FUNCIONES DE INSPECCIÓN
// ================================

async function verificarEsquema() {
    console.log('🔍 Verificando esquema real de Supabase...');
    
    try {
        // Crear cliente Supabase
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Login como Joe para tener contexto de usuario
        console.log('🔐 Haciendo login...');
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: 'joegarcia.1395@gmail.com',
            password: '123456'
        });
        
        if (authError) {
            throw new Error(`Error de autenticación: ${authError.message}`);
        }
        
        console.log('✅ Login exitoso');
        
        // Verificar cada tabla
        const tablas = ['ingresos', 'gastos', 'creditos', 'simulaciones_credito', 'perfiles_usuario'];
        
        for (const tabla of tablas) {
            console.log(`\n📋 Verificando tabla: ${tabla}`);
            await verificarTabla(supabaseClient, tabla);
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    }
}

async function verificarTabla(client, nombreTabla) {
    try {
        // Intentar hacer un SELECT LIMIT 1 para ver la estructura
        const { data, error } = await client
            .from(nombreTabla)
            .select('*')
            .limit(1);
        
        if (error) {
            console.log(`   ❌ Tabla '${nombreTabla}' no existe o no accesible: ${error.message}`);
            return;
        }
        
        console.log(`   ✅ Tabla '${nombreTabla}' existe`);
        
        if (data && data.length > 0) {
            console.log(`   📊 Registros: ${data.length}`);
            console.log(`   🔑 Columnas encontradas:`, Object.keys(data[0]));
        } else {
            console.log(`   📊 Registros: 0 (tabla vacía)`);
            
            // Intentar insertar un registro de prueba para ver el esquema
            const testData = { test: 'test' };
            const { error: insertError } = await client
                .from(nombreTabla)
                .insert(testData);
            
            if (insertError) {
                console.log(`   🔍 Error de inserción (ayuda a conocer esquema):`, insertError.message);
            }
        }
        
    } catch (error) {
        console.log(`   💥 Error verificando tabla '${nombreTabla}':`, error.message);
    }
}

// ================================
// 🧪 INSERTAR DATOS CON ESQUEMA CORRECTO
// ================================

async function insertarDatosConEsquemaReal() {
    console.log('\n🧪 Intentando insertar datos con esquema correcto...');
    
    try {
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Login
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: 'joegarcia.1395@gmail.com',
            password: '123456'
        });
        
        if (authError) throw authError;
        
        const userId = authData.user.id;
        console.log('✅ User ID:', userId);
        
        // Intentar diferentes estructuras para ingresos
        const estructurasIngresos = [
            // Estructura 1: Campos básicos
            {
                usuario_id: userId,
                monto: 1000.00,
                descripcion: 'Prueba ingreso',
                categoria: 'Prueba'
            },
            // Estructura 2: Con fecha
            {
                usuario_id: userId,
                monto: 1000.00,
                descripcion: 'Prueba ingreso',
                categoria: 'Prueba',
                fecha: '2025-09-09'
            },
            // Estructura 3: Con created_at
            {
                usuario_id: userId,
                monto: 1000.00,
                descripcion: 'Prueba ingreso',
                categoria: 'Prueba',
                created_at: new Date().toISOString()
            }
        ];
        
        for (let i = 0; i < estructurasIngresos.length; i++) {
            console.log(`\n🧪 Probando estructura ${i + 1} para ingresos...`);
            
            const { data, error } = await supabaseClient
                .from('ingresos')
                .insert(estructurasIngresos[i])
                .select();
            
            if (error) {
                console.log(`   ❌ Estructura ${i + 1} falló:`, error.message);
            } else {
                console.log(`   ✅ Estructura ${i + 1} funcionó:`, data);
                break; // Salir del loop si funciona
            }
        }
        
    } catch (error) {
        console.error('💥 Error en inserción de prueba:', error);
    }
}

// ================================
// 🚀 EJECUTAR
// ================================

// Función global para consola
window.verificarEsquema = verificarEsquema;
window.insertarDatosConEsquemaReal = insertarDatosConEsquemaReal;

console.log('🔍 Inspector de esquema cargado');
console.log('📋 Comandos disponibles:');
console.log('   - verificarEsquema()');
console.log('   - insertarDatosConEsquemaReal()');
