/**
 * 🔧 SETUP USUARIO DE PRUEBA EN NUEVA SUPABASE
 * Crear usuario demo para pruebas
 */

const https = require('https');
const crypto = require('crypto');

const SUPABASE_HOST = 'lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

console.log('🔧 CREANDO USUARIO DE PRUEBA EN NUEVA SUPABASE');
console.log('===============================================\n');

// Usuario de prueba
const testUser = {
    nombre: 'Usuario Demo',
    email: 'demo@planificapro.com',
    password: '$2b$10$K7L/8Y0Zm8hQlKlLOqKxI.b3VZtPc8tD1qY2pnRvN3qP4wW5cL8sG', // hash de "demo123"
    telefono: '123456789',
    estado_civil: 'soltero',
    token: 'demo@planificapro.com'
};

// Función para hacer request a Supabase
function supabaseRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_HOST,
            port: 443,
            path: `/rest/v1/${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const jsonData = responseData ? JSON.parse(responseData) : {};
                    resolve({ 
                        status: res.statusCode, 
                        data: jsonData,
                        headers: res.headers 
                    });
                } catch (e) {
                    resolve({ 
                        status: res.statusCode, 
                        data: responseData,
                        headers: res.headers 
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function setupTestUser() {
    try {
        console.log('1️⃣ Verificando conexión a Supabase...');
        
        // Test básico de conexión
        const healthCheck = await supabaseRequest('usuarios?select=count', 'GET');
        
        if (healthCheck.status === 200) {
            console.log('✅ Conexión exitosa a nueva Supabase');
        } else {
            console.log('❌ Error de conexión:', healthCheck.status, healthCheck.data);
            return;
        }

        console.log('\n2️⃣ Verificando si usuario demo ya existe...');
        
        // Verificar si usuario ya existe
        const checkUser = await supabaseRequest(`usuarios?email=eq.${testUser.email}`, 'GET');
        
        if (checkUser.status === 200 && checkUser.data.length > 0) {
            console.log('ℹ️  Usuario demo ya existe');
            console.log('👤 Usuario encontrado:', checkUser.data[0]);
            console.log('\n🎯 LISTO PARA USAR:');
            console.log('📧 Email: demo@planificapro.com');
            console.log('🔑 Password: demo123');
            return;
        }

        console.log('\n3️⃣ Creando usuario de prueba...');
        
        // Crear usuario
        const createUser = await supabaseRequest('usuarios', 'POST', testUser);
        
        if (createUser.status === 201) {
            console.log('✅ Usuario demo creado exitosamente!');
            console.log('👤 Datos del usuario:', createUser.data);
            
            console.log('\n4️⃣ Creando datos de ejemplo...');
            
            // Crear algunos ingresos de ejemplo
            const sampleIngresos = [
                {
                    usuario_id: createUser.data.id,
                    descripcion: 'Salario Enero',
                    monto: 3500.00,
                    categoria: 'salario',
                    fecha: '2024-01-01',
                    tipo: 'mensual'
                },
                {
                    usuario_id: createUser.data.id,
                    descripcion: 'Freelance Diseño',
                    monto: 800.00,
                    categoria: 'freelance',
                    fecha: '2024-01-15',
                    tipo: 'único'
                }
            ];

            for (const ingreso of sampleIngresos) {
                const createIngreso = await supabaseRequest('ingresos', 'POST', ingreso);
                if (createIngreso.status === 201) {
                    console.log(`✅ Ingreso creado: ${ingreso.descripcion}`);
                }
            }

            // Crear algunos gastos de ejemplo
            const sampleGastos = [
                {
                    usuario_id: createUser.data.id,
                    descripcion: 'Supermercado',
                    monto: 250.00,
                    categoria: 'alimentacion',
                    fecha: '2024-01-02',
                    tipo: 'único'
                },
                {
                    usuario_id: createUser.data.id,
                    descripcion: 'Gasolina',
                    monto: 120.00,
                    categoria: 'transporte',
                    fecha: '2024-01-03',
                    tipo: 'único'
                }
            ];

            for (const gasto of sampleGastos) {
                const createGasto = await supabaseRequest('gastos', 'POST', gasto);
                if (createGasto.status === 201) {
                    console.log(`✅ Gasto creado: ${gasto.descripcion}`);
                }
            }

        } else {
            console.log('❌ Error creando usuario:', createUser.status, createUser.data);
            return;
        }

        console.log('\n🎉 =======================================');
        console.log('🎉 SETUP COMPLETADO EXITOSAMENTE');
        console.log('🎉 =======================================');
        console.log('');
        console.log('🔐 CREDENCIALES DE PRUEBA:');
        console.log('📧 Email: demo@planificapro.com');
        console.log('🔑 Password: demo123');
        console.log('');
        console.log('🌐 URLs de prueba:');
        console.log('🏠 Login: http://localhost:3001/login.html');
        console.log('🔍 Health: http://localhost:3001/api/health');
        console.log('👥 Usuarios: http://localhost:3001/api/usuarios');

    } catch (error) {
        console.log('💥 Error durante setup:', error.message);
    }
}

// Ejecutar setup
setupTestUser();
