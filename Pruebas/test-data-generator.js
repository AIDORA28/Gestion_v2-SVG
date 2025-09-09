/**
 * 🧪 SCRIPT PARA AGREGAR DATOS DE PRUEBA
 * Agrega ingresos y gastos de ejemplo para testing
 * Usuario: joegarcia.1395@gmail.com
 */

// ================================
// 🔧 CONFIGURACIÓN
// ================================

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// ================================
// 📊 DATOS DE PRUEBA
// ================================

const DATOS_INGRESOS = [
    {
        monto: 3500.00,
        descripcion: 'Salario Quincenal',
        categoria: 'Salario',
        fecha_transaccion: '2025-09-01'
    },
    {
        monto: 500.00,
        descripcion: 'Freelance Desarrollo Web',
        categoria: 'Freelance',
        fecha_transaccion: '2025-09-05'
    },
    {
        monto: 200.00,
        descripcion: 'Venta Artículos Usados',
        categoria: 'Ventas',
        fecha_transaccion: '2025-09-07'
    },
    {
        monto: 3500.00,
        descripcion: 'Salario Quincenal',
        categoria: 'Salario',
        fecha_transaccion: '2025-08-15'
    },
    {
        monto: 750.00,
        descripcion: 'Proyecto Consultoría',
        categoria: 'Freelance',
        fecha_transaccion: '2025-08-20'
    }
];

const DATOS_GASTOS = [
    {
        monto: 800.00,
        descripcion: 'Renta Departamento',
        categoria: 'Vivienda',
        fecha_transaccion: '2025-09-01'
    },
    {
        monto: 150.00,
        descripcion: 'Supermercado Semanal',
        categoria: 'Alimentación',
        fecha_transaccion: '2025-09-02'
    },
    {
        monto: 50.00,
        descripcion: 'Gasolina',
        categoria: 'Transporte',
        fecha_transaccion: '2025-09-03'
    },
    {
        monto: 120.00,
        descripcion: 'Luz y Agua',
        categoria: 'Servicios',
        fecha_transaccion: '2025-09-05'
    },
    {
        monto: 80.00,
        descripcion: 'Internet y Teléfono',
        categoria: 'Servicios',
        fecha_transaccion: '2025-09-05'
    },
    {
        monto: 200.00,
        descripcion: 'Supermercado Mensual',
        categoria: 'Alimentación',
        fecha_transaccion: '2025-09-08'
    },
    {
        monto: 100.00,
        descripcion: 'Cine y Cena',
        categoria: 'Entretenimiento',
        fecha_transaccion: '2025-09-06'
    },
    {
        monto: 300.00,
        descripcion: 'Ropa Nueva',
        categoria: 'Vestimenta',
        fecha_transaccion: '2025-09-07'
    },
    // Datos del mes anterior
    {
        monto: 800.00,
        descripcion: 'Renta Departamento',
        categoria: 'Vivienda',
        fecha_transaccion: '2025-08-01'
    },
    {
        monto: 400.00,
        descripcion: 'Supermercado Agosto',
        categoria: 'Alimentación',
        fecha_transaccion: '2025-08-10'
    },
    {
        monto: 150.00,
        descripcion: 'Servicios Agosto',
        categoria: 'Servicios',
        fecha_transaccion: '2025-08-15'
    }
];

const DATOS_CREDITOS = [
    {
        monto: 10000.00,
        descripcion: 'Préstamo Personal Banco',
        tasa_interes: 12.5,
        plazo_meses: 24,
        fecha_inicio: '2025-01-15'
    },
    {
        monto: 5000.00,
        descripcion: 'Tarjeta de Crédito',
        tasa_interes: 18.0,
        plazo_meses: 12,
        fecha_inicio: '2025-06-01'
    }
];

// ================================
// 🚀 FUNCIÓN PRINCIPAL
// ================================

async function agregarDatosPrueba() {
    console.log('🧪 Iniciando inserción de datos de prueba...');
    
    try {
        // Crear cliente Supabase
        const { createClient } = supabase;
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Login como Joe para obtener el usuario
        console.log('🔐 Haciendo login como Joe...');
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: 'joegarcia.1395@gmail.com',
            password: '123456'
        });
        
        if (authError) {
            throw new Error(`Error de autenticación: ${authError.message}`);
        }
        
        const userId = authData.user.id;
        console.log('✅ Login exitoso. User ID:', userId);
        
        // Insertar ingresos
        console.log('💰 Insertando ingresos...');
        const ingresosConUserId = DATOS_INGRESOS.map(ingreso => ({
            ...ingreso,
            usuario_id: userId
        }));
        
        const { data: ingresosResult, error: ingresosError } = await supabaseClient
            .from('ingresos')
            .insert(ingresosConUserId);
            
        if (ingresosError) {
            console.error('❌ Error insertando ingresos:', ingresosError);
        } else {
            console.log('✅ Ingresos insertados:', DATOS_INGRESOS.length);
        }
        
        // Insertar gastos
        console.log('💸 Insertando gastos...');
        const gastosConUserId = DATOS_GASTOS.map(gasto => ({
            ...gasto,
            usuario_id: userId
        }));
        
        const { data: gastosResult, error: gastosError } = await supabaseClient
            .from('gastos')
            .insert(gastosConUserId);
            
        if (gastosError) {
            console.error('❌ Error insertando gastos:', gastosError);
        } else {
            console.log('✅ Gastos insertados:', DATOS_GASTOS.length);
        }
        
        // Insertar créditos
        console.log('💳 Insertando créditos...');
        const creditosConUserId = DATOS_CREDITOS.map(credito => ({
            ...credito,
            usuario_id: userId
        }));
        
        const { data: creditosResult, error: creditosError } = await supabaseClient
            .from('creditos')
            .insert(creditosConUserId);
            
        if (creditosError) {
            console.error('❌ Error insertando créditos:', creditosError);
        } else {
            console.log('✅ Créditos insertados:', DATOS_CREDITOS.length);
        }
        
        // Resumen
        console.log('\n🎉 ¡DATOS DE PRUEBA INSERTADOS EXITOSAMENTE!');
        console.log('📊 Resumen:');
        console.log(`   💰 Ingresos: ${DATOS_INGRESOS.length} registros`);
        console.log(`   💸 Gastos: ${DATOS_GASTOS.length} registros`);
        console.log(`   💳 Créditos: ${DATOS_CREDITOS.length} registros`);
        
        // Calcular totales
        const totalIngresos = DATOS_INGRESOS.reduce((sum, i) => sum + i.monto, 0);
        const totalGastos = DATOS_GASTOS.reduce((sum, g) => sum + g.monto, 0);
        const balance = totalIngresos - totalGastos;
        
        console.log('\n💹 Totales:');
        console.log(`   💰 Total Ingresos: $${totalIngresos.toFixed(2)}`);
        console.log(`   💸 Total Gastos: $${totalGastos.toFixed(2)}`);
        console.log(`   ⚖️ Balance: $${balance.toFixed(2)}`);
        
        console.log('\n🚀 Ahora puedes probar el dashboard con datos reales!');
        
    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

// ================================
// 🏃‍♂️ EJECUTAR
// ================================

// Solo ejecutar si está en una página web
if (typeof window !== 'undefined') {
    // Agregar botón para ejecutar desde la consola
    console.log('🧪 Script de datos de prueba cargado');
    console.log('📋 Para ejecutar, usa: agregarDatosPrueba()');
    
    // Función global
    window.agregarDatosPrueba = agregarDatosPrueba;
} else {
    // Ejecutar directamente si es Node.js
    agregarDatosPrueba();
}
