/**
 * 🎭 SIMULADOR COMPLETO DE USUARIO - MÓDULO CRÉDITOS
 * 
 * Este script simula completamente el comportamiento del usuario:
 * - Joe García (joegarcia.1395@gmail.com)
 * - Autenticación con Supabase
 * - Acceso al módulo de créditos
 * - Detección completa de errores
 * 
 * Ejecutar: node simular-usuario-creditos.js
 */

// Configuración de Supabase
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// Credenciales del usuario de prueba
const USER_CREDENTIALS = {
    email: 'joegarcia.1395@gmail.com',
    password: '123456'
};

// Simulador de cliente Supabase (Node.js compatible)
class SupabaseSimulator {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.currentUser = null;
        this.sessionToken = null;
    }

    // Simular autenticación
    async signInWithPassword({ email, password }) {
        console.log('🔐 Simulando autenticación...');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password.replace(/./g, '*')}`);
        
        try {
            // Simulamos una petición real a Supabase Auth
            const response = await this.makeAuthRequest('POST', '/auth/v1/token?grant_type=password', {
                email,
                password
            });
            
            if (response.access_token) {
                this.currentUser = response.user;
                this.sessionToken = response.access_token;
                
                console.log('✅ Autenticación exitosa');
                console.log(`👤 Usuario ID: ${response.user.id}`);
                console.log(`📧 Email verificado: ${response.user.email}`);
                return { data: { user: response.user, session: response }, error: null };
            } else {
                throw new Error('Credenciales inválidas');
            }
        } catch (error) {
            console.log('❌ Error de autenticación:', error.message);
            return { data: { user: null, session: null }, error };
        }
    }

    // Simular consulta a tabla
    from(table) {
        return new QueryBuilder(this, table);
    }

    // Simular petición HTTP a Supabase
    async makeAuthRequest(method, endpoint, body = null) {
        const fetch = (await import('node-fetch')).default;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.key,
                'Authorization': `Bearer ${this.key}`
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.url}${endpoint}`, options);
        return await response.json();
    }

    // Simular petición a base de datos
    async makeDBRequest(method, endpoint, body = null) {
        const fetch = (await import('node-fetch')).default;
        
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.key,
            'Prefer': 'return=representation'
        };

        if (this.sessionToken) {
            headers['Authorization'] = `Bearer ${this.sessionToken}`;
        }

        const options = { method, headers };
        
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.url}/rest/v1${endpoint}`, options);
        const data = await response.json();
        
        return {
            data: response.ok ? data : null,
            error: response.ok ? null : data,
            status: response.status
        };
    }
}

// Constructor de consultas simulado
class QueryBuilder {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this.selectFields = '*';
        this.filters = [];
        this.limitValue = null;
    }

    select(fields) {
        this.selectFields = fields;
        return this;
    }

    eq(column, value) {
        this.filters.push(`${column}=eq.${value}`);
        return this;
    }

    limit(count) {
        this.limitValue = count;
        return this;
    }

    async execute() {
        let endpoint = `/${this.table}?select=${this.selectFields}`;
        
        if (this.filters.length > 0) {
            endpoint += '&' + this.filters.join('&');
        }
        
        if (this.limitValue) {
            endpoint += `&limit=${this.limitValue}`;
        }

        return await this.client.makeDBRequest('GET', endpoint);
    }

    // Alias para compatibilidad
    then(callback) {
        return this.execute().then(callback);
    }
}

// Simulador del módulo de créditos
class CreditosModuleSimulator {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.currentUser = supabaseClient.currentUser;
    }

    async loadCreditos() {
        console.log('\n💳 SIMULANDO CARGA DEL MÓDULO CRÉDITOS...');
        
        if (!this.currentUser) {
            console.log('❌ Usuario no autenticado');
            return { success: false, error: 'Usuario no autenticado' };
        }

        try {
            console.log('🔍 Consultando tabla simulaciones_credito...');
            console.log(`👤 Usuario ID: ${this.currentUser.id}`);
            
            const response = await this.supabase
                .from('simulaciones_credito')
                .select('*')
                .eq('usuario_id', this.currentUser.id);

            console.log('📊 Respuesta de la base de datos:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${response.error ? JSON.stringify(response.error, null, 2) : 'Ninguno'}`);
            console.log(`   Datos: ${response.data ? `${response.data.length} registros` : 'Sin datos'}`);

            if (response.error) {
                console.log('❌ Error consultando créditos:', response.error);
                return { success: false, error: response.error };
            }

            if (response.data && response.data.length > 0) {
                console.log('✅ Créditos cargados exitosamente');
                console.log('\n📋 LISTA DE CRÉDITOS:');
                response.data.forEach((credito, index) => {
                    console.log(`   ${index + 1}. ID: ${credito.id}`);
                    console.log(`      Tipo: ${credito.tipo_credito}`);
                    console.log(`      Monto: $${credito.monto_solicitado}`);
                    console.log(`      Plazo: ${credito.plazo_meses} meses`);
                    console.log(`      Estado: ${credito.estado || 'N/A'}`);
                    console.log(`      Fecha: ${credito.created_at}`);
                    console.log('');
                });
                return { success: true, data: response.data };
            } else {
                console.log('⚠️ No se encontraron créditos para este usuario');
                return { success: true, data: [] };
            }

        } catch (error) {
            console.log('❌ Error inesperado:', error.message);
            return { success: false, error: error.message };
        }
    }

    async createCredito(creditoData) {
        console.log('\n💳 SIMULANDO CREACIÓN DE CRÉDITO...');
        console.log('📝 Datos del crédito:', JSON.stringify(creditoData, null, 2));

        try {
            const response = await this.supabase.makeDBRequest('POST', '/simulaciones_credito', {
                ...creditoData,
                usuario_id: this.currentUser.id,
                created_at: new Date().toISOString()
            });

            if (response.error) {
                console.log('❌ Error creando crédito:', response.error);
                return { success: false, error: response.error };
            }

            console.log('✅ Crédito creado exitosamente');
            return { success: true, data: response.data };

        } catch (error) {
            console.log('❌ Error inesperado creando crédito:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Función principal de simulación
async function simularUsuarioCreditos() {
    console.log('🎭 INICIANDO SIMULACIÓN COMPLETA DE USUARIO');
    console.log('==========================================\n');

    // 1. Inicializar cliente Supabase
    console.log('1️⃣ Inicializando cliente Supabase...');
    const supabase = new SupabaseSimulator(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente inicializado');

    // 2. Autenticar usuario
    console.log('\n2️⃣ Autenticando usuario Joe García...');
    const authResult = await supabase.signInWithPassword(USER_CREDENTIALS);
    
    if (authResult.error) {
        console.log('❌ FALLO DE AUTENTICACIÓN - SIMULACIÓN TERMINADA');
        return;
    }

    // 3. Verificar estructura de tabla
    console.log('\n3️⃣ Verificando estructura de tabla simulaciones_credito...');
    try {
        const structureCheck = await supabase.makeDBRequest('GET', '/simulaciones_credito?limit=1');
        console.log('📊 Verificación de tabla:');
        console.log(`   Status: ${structureCheck.status}`);
        console.log(`   Accesible: ${structureCheck.status === 200 ? 'SÍ' : 'NO'}`);
        
        if (structureCheck.error) {
            console.log('   Error:', JSON.stringify(structureCheck.error, null, 2));
        }
    } catch (error) {
        console.log('❌ Error verificando estructura:', error.message);
    }

    // 4. Simular módulo de créditos
    console.log('\n4️⃣ Inicializando simulador de módulo créditos...');
    const creditosModule = new CreditosModuleSimulator(supabase);

    // 5. Cargar créditos existentes
    console.log('\n5️⃣ Cargando créditos existentes...');
    const loadResult = await creditosModule.loadCreditos();

    // 6. Simular creación de nuevo crédito (opcional)
    if (loadResult.success) {
        console.log('\n6️⃣ Simulando creación de nuevo crédito...');
        const nuevoCredito = {
            tipo_credito: 'Personal',
            monto_solicitado: 50000,
            plazo_meses: 12,
            tasa_interes: 15.5,
            ingreso_mensual: 80000,
            gastos_mensuales: 30000,
            estado: 'simulacion'
        };

        const createResult = await creditosModule.createCredito(nuevoCredito);
        
        if (createResult.success) {
            console.log('✅ Crédito de prueba creado');
        }
    }

    // 7. Resumen final
    console.log('\n🏁 RESUMEN DE LA SIMULACIÓN');
    console.log('============================');
    console.log(`✅ Autenticación: ${authResult.error ? 'FALLÓ' : 'ÉXITO'}`);
    console.log(`✅ Carga de créditos: ${loadResult.success ? 'ÉXITO' : 'FALLÓ'}`);
    console.log(`📊 Créditos encontrados: ${loadResult.data ? loadResult.data.length : 0}`);
    
    if (!loadResult.success) {
        console.log('🔍 POSIBLES CAUSAS DEL PROBLEMA:');
        console.log('   - Tabla simulaciones_credito no existe');
        console.log('   - Permisos RLS bloqueando el acceso');
        console.log('   - Usuario sin créditos registrados');
        console.log('   - Error de configuración de Supabase');
    }

    console.log('\n🎭 SIMULACIÓN COMPLETADA');
}

// Manejo de errores global
process.on('unhandledRejection', (error) => {
    console.log('❌ Error no manejado:', error.message);
    process.exit(1);
});

// Ejecutar simulación
if (require.main === module) {
    simularUsuarioCreditos().catch(console.error);
}

module.exports = { simularUsuarioCreditos, SupabaseSimulator, CreditosModuleSimulator };
