const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (obtenida de los archivos del proyecto)
const supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('🔍 Inspeccionando el esquema de la base de datos de Supabase...');

    try {
        // Consulta para obtener todas las tablas y sus columnas del esquema 'public'
        const { data, error } = await supabase
            .rpc('get_schema_details'); // Usamos una función RPC para obtener los detalles

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            console.log('No se encontraron tablas en el esquema "public".');
            return;
        }

        // Procesar y mostrar los resultados
        const schema = {};
        data.forEach(col => {
            if (!schema[col.table_name]) {
                schema[col.table_name] = [];
            }
            schema[col.table_name].push(`  ${col.column_name} (${col.data_type})`);
        });

        console.log('\n--- ESQUEMA DE LA BASE DE DATOS ---');
        for (const table in schema) {
            console.log(`\n📄 Tabla: ${table}`);
            schema[table].forEach(columnInfo => {
                console.log(columnInfo);
            });
        }
        console.log('\n---------------------------------');
        console.log('\n✅ Inspección completada.');

    } catch (error) {
        console.error('❌ Error al inspeccionar el esquema:', error.message);
    }
}

// Creamos la función RPC en Supabase para obtener el esquema
async function createRpcFunction() {
    console.log('🔧 Creando función RPC en Supabase para obtener el esquema...');
    const { error } = await supabase
        .rpc('sql', {
            query: `
                CREATE OR REPLACE FUNCTION get_schema_details()
                RETURNS TABLE(table_name text, column_name text, data_type text) AS $$
                BEGIN
                    RETURN QUERY
                    SELECT
                        c.table_name::text,
                        c.column_name::text,
                        c.data_type::text
                    FROM
                        information_schema.columns c
                    WHERE
                        c.table_schema = 'public'
                    ORDER BY
                        c.table_name,
                        c.ordinal_position;
                END;
                $$ LANGUAGE plpgsql;
            `
        });

    if (error) {
        console.warn('⚠️  No se pudo crear la función RPC (puede que ya exista):', error.message);
    } else {
        console.log('✅ Función RPC creada/actualizada.');
    }
}

async function main() {
    await createRpcFunction();
    await inspectSchema();
}

main();
