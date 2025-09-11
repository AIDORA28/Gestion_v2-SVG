/**
 * 🧪 SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA - CRÉDITOS
 * Para testing del módulo de reportes
 * Usuario: Joe García (joegarcia.1395@gmail.com)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMxNTg0MiwiZXhwIjoyMDcyODkxODQyfQ.J87Bps9KzRg94X1Hax8XjMuTt7krJ_ySfWTbkU0p5_k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertarDatosCreditosPrueba() {
    try {
        console.log('📊 Insertando datos de créditos de prueba...');

        // Obtener usuario Joe García
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', 'joegarcia.1395@gmail.com');

        if (errorUsuarios || !usuarios.length) {
            console.error('❌ Error obteniendo usuario:', errorUsuarios);
            return;
        }

        const usuarioId = usuarios[0].id;
        console.log('✅ Usuario encontrado:', usuarioId);

        // Datos de prueba para créditos
        const creditosPrueba = [
            {
                usuario_id: usuarioId,
                descripcion: 'Préstamo Personal BCP',
                monto: 15000.00,
                estado: 'Activo',
                tasa_interes: 12.5,
                plazo_meses: 24,
                cuota_mensual: 720.50,
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                usuario_id: usuarioId,
                descripcion: 'Línea de Crédito BBVA',
                monto: 8000.00,
                estado: 'Activo',
                tasa_interes: 15.0,
                plazo_meses: 12,
                cuota_mensual: 740.30,
                created_at: '2024-03-10T14:30:00Z'
            },
            {
                usuario_id: usuarioId,
                descripcion: 'Crédito Vehicular',
                monto: 25000.00,
                estado: 'Pagado',
                tasa_interes: 10.8,
                plazo_meses: 36,
                cuota_mensual: 812.45,
                created_at: '2023-08-20T09:15:00Z'
            },
            {
                usuario_id: usuarioId,
                descripcion: 'Tarjeta de Crédito - Consumo',
                monto: 3500.00,
                estado: 'Activo',
                tasa_interes: 35.0,
                plazo_meses: 6,
                cuota_mensual: 650.20,
                created_at: '2024-08-01T16:45:00Z'
            }
        ];

        // Insertar créditos
        const { data, error } = await supabase
            .from('simulaciones_credito')
            .insert(creditosPrueba);

        if (error) {
            console.error('❌ Error insertando créditos:', error);
            return;
        }

        console.log('✅ Créditos de prueba insertados exitosamente');
        console.log(`📊 Total créditos: ${creditosPrueba.length}`);
        console.log(`💰 Total monto créditos: S/ ${creditosPrueba.reduce((sum, c) => sum + c.monto, 0).toLocaleString('es-PE')}`);

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar
insertarDatosCreditosPrueba();
