/**
 * 🔍 VERIFICADOR DE ESTRUCTURA REAL DE TABLA
 * 
 * Este script obtiene la estructura exacta de la tabla simulaciones_credito
 * para saber qué campos existen realmente.
 */

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

async function verificarEstructuraTabla() {
    console.log('🔍 VERIFICANDO ESTRUCTURA REAL DE simulaciones_credito');
    console.log('===================================================\n');

    try {
        // Obtener un registro completo para ver todos los campos
        const response = await fetch(`${SUPABASE_URL}/rest/v1/simulaciones_credito?limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data && data.length > 0) {
                const record = data[0];
                console.log('📊 CAMPOS DISPONIBLES EN LA TABLA:');
                console.log('==================================\n');
                
                Object.keys(record).forEach((field, index) => {
                    const value = record[field];
                    const type = typeof value;
                    console.log(`${index + 1}. ${field} (${type}): ${value}`);
                });
                
                console.log('\n🎯 CAMPOS IMPORTANTES PARA EL FRONTEND:');
                console.log('======================================');
                
                const importantFields = [
                    'id',
                    'usuario_id', 
                    'tipo_credito',
                    'monto_solicitado',
                    'plazo_meses',
                    'tasa_interes',
                    'ingreso_mensual',
                    'gastos_mensuales',
                    'estado',
                    'created_at',
                    'updated_at'
                ];
                
                importantFields.forEach(field => {
                    const exists = record.hasOwnProperty(field);
                    const status = exists ? '✅' : '❌';
                    const value = exists ? record[field] : 'NO EXISTE';
                    console.log(`${status} ${field}: ${value}`);
                });

            } else {
                console.log('⚠️ No hay registros en la tabla para analizar estructura');
            }
            
        } else {
            console.log('❌ Error obteniendo datos:', response.status);
            const errorText = await response.text();
            console.log('   Detalle:', errorText);
        }

    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
    }
}

if (require.main === module) {
    verificarEstructuraTabla();
}
