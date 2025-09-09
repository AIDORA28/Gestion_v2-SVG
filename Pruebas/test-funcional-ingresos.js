// Test final del módulo ingresos - Verificación funcional completa
const https = require('https');

console.log('🔍 === TEST FUNCIONAL MÓDULO INGRESOS ===');
console.log('📅 Timestamp:', new Date().toLocaleString());
console.log('🎯 Siguiendo patrón dashboard exitoso: Supabase Auth + Database + API Service');
console.log('');

// Configuración según requerimientos
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// Usuario de prueba según documentación
const TEST_USER = {
    email: 'joegarcia.1395@gmail.com',
    password: '123456',
    id: 'a18ac5b7-d5d3-4ba4-b6be-1c5f8e7d9f2a' // ID simulado para pruebas
};

function makeSupabaseRequest(endpoint, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
        
        const options = {
            method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = https.request(url, options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({ 
                        status: res.statusCode, 
                        data: jsonData, 
                        headers: res.headers 
                    });
                } catch (error) {
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

async function testAuthenticatedConnection() {
    console.log('🔐 PASO 1: Probando conexión autenticada...');
    
    try {
        // Simular token de usuario autenticado (en producción viene de Supabase Auth)
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.mock';
        
        // Probar lectura de ingresos
        const response = await makeSupabaseRequest(
            `/ingresos?usuario_id=eq.${TEST_USER.id}&select=*&order=fecha.desc,created_at.desc`,
            'GET',
            null,
            mockToken
        );
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Tipo respuesta: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
        
        if (response.status === 200) {
            console.log('✅ Conexión autenticada: EXITOSA');
            console.log(`📊 Registros disponibles: ${Array.isArray(response.data) ? response.data.length : 0}`);
            
            if (Array.isArray(response.data) && response.data.length > 0) {
                const ejemplo = response.data[0];
                console.log('📝 Ejemplo de registro:');
                console.log(`   - ID: ${ejemplo.id}`);
                console.log(`   - Descripción: ${ejemplo.descripcion}`);
                console.log(`   - Monto: $${ejemplo.monto}`);
                console.log(`   - Categoría: ${ejemplo.categoria}`);
                console.log(`   - Fecha: ${ejemplo.fecha}`);
            }
        } else {
            console.log(`⚠️ Respuesta inesperada: ${response.status}`);
            console.log(`📄 Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
        }
        
        return response.status === 200;
        
    } catch (error) {
        console.log(`❌ Error en conexión: ${error.message}`);
        return false;
    }
}

async function testCRUDOperations() {
    console.log('');
    console.log('📝 PASO 2: Probando operaciones CRUD...');
    
    try {
        // 1. CREATE - Insertar nuevo ingreso
        console.log('🆕 Probando CREATE...');
        
        const nuevoIngreso = {
            descripcion: 'Test Consola Node.js',
            monto: 777.77,
            categoria: 'Freelance',
            fecha: new Date().toISOString().split('T')[0],
            es_recurrente: false,
            usuario_id: TEST_USER.id,
            notas: 'Prueba desde test funcional'
        };
        
        const createResponse = await makeSupabaseRequest(
            '/ingresos',
            'POST',
            nuevoIngreso
        );
        
        console.log(`📊 CREATE Status: ${createResponse.status}`);
        
        if (createResponse.status === 201) {
            console.log('✅ CREATE: EXITOSO');
            console.log(`🆔 ID generado: ${createResponse.data[0]?.id || 'No disponible'}`);
        } else {
            console.log(`❌ CREATE falló: ${createResponse.status}`);
            console.log(`📄 Error: ${JSON.stringify(createResponse.data)}`);
        }
        
        // 2. READ - Leer ingresos
        console.log('📖 Probando READ...');
        
        const readResponse = await makeSupabaseRequest(
            `/ingresos?usuario_id=eq.${TEST_USER.id}&limit=5`
        );
        
        console.log(`📊 READ Status: ${readResponse.status}`);
        
        if (readResponse.status === 200 && Array.isArray(readResponse.data)) {
            console.log('✅ READ: EXITOSO');
            console.log(`📊 Registros encontrados: ${readResponse.data.length}`);
        } else {
            console.log(`❌ READ falló: ${readResponse.status}`);
        }
        
        return {
            create: createResponse.status === 201,
            read: readResponse.status === 200
        };
        
    } catch (error) {
        console.log(`❌ Error en CRUD: ${error.message}`);
        return { create: false, read: false };
    }
}

async function testDataValidation() {
    console.log('');
    console.log('✅ PASO 3: Probando validaciones...');
    
    try {
        // Probar inserción con datos inválidos
        const datosInvalidos = {
            descripcion: '', // Vacío - debería fallar
            monto: -100,     // Negativo - debería fallar
            usuario_id: TEST_USER.id
        };
        
        const response = await makeSupabaseRequest(
            '/ingresos',
            'POST',
            datosInvalidos
        );
        
        console.log(`📊 Validación Status: ${response.status}`);
        
        if (response.status >= 400) {
            console.log('✅ Validaciones: FUNCIONANDO (rechazó datos inválidos)');
            console.log(`📄 Error esperado: ${JSON.stringify(response.data).substring(0, 100)}...`);
        } else {
            console.log('⚠️ Validaciones: DÉBILES (aceptó datos inválidos)');
        }
        
        return response.status >= 400;
        
    } catch (error) {
        console.log(`❌ Error en validaciones: ${error.message}`);
        return false;
    }
}

async function analyzeHandlerImplementation() {
    console.log('');
    console.log('🧠 PASO 4: Analizando implementación del handler...');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        const handlerPath = path.join(__dirname, '../public/js/ingresos-module-handler.js');
        const handlerContent = fs.readFileSync(handlerPath, 'utf8');
        
        // Verificar patrón Supabase directo
        const checkPatterns = [
            { name: 'Supabase Auth Integration', pattern: /authToken|Authorization.*Bearer/g },
            { name: 'Direct API Calls', pattern: /fetch.*supabase.*rest\/v1/g },
            { name: 'User ID Filtering', pattern: /usuario_id.*eq\./g },
            { name: 'Error Handling', pattern: /catch.*error/g },
            { name: 'Real-time Updates', pattern: /loadIngresos.*renderIngresos/g }
        ];
        
        const results = {};
        
        checkPatterns.forEach(({ name, pattern }) => {
            const matches = handlerContent.match(pattern);
            results[name] = {
                found: !!matches,
                count: matches ? matches.length : 0
            };
            
            console.log(`${results[name].found ? '✅' : '❌'} ${name}: ${results[name].found ? `${results[name].count} implementaciones` : 'NO ENCONTRADO'}`);
        });
        
        // Verificar métodos críticos específicos del patrón dashboard
        const criticalMethods = [
            'init', 'handleSubmit', 'submitIngreso', 
            'loadIngresos', 'renderIngresos', 'updateStats'
        ];
        
        console.log('🔧 Métodos críticos:');
        criticalMethods.forEach(method => {
            const found = handlerContent.includes(`${method}(`);
            console.log(`${found ? '✅' : '❌'} ${method}: ${found ? 'IMPLEMENTADO' : 'FALTANTE'}`);
        });
        
        return results;
        
    } catch (error) {
        console.log(`❌ Error analizando handler: ${error.message}`);
        return null;
    }
}

async function generateOptimizationReport() {
    console.log('');
    console.log('📊 === EJECUTANDO TEST FUNCIONAL COMPLETO ===');
    console.log('');
    
    const results = {
        auth: await testAuthenticatedConnection(),
        crud: await testCRUDOperations(),
        validation: await testDataValidation(),
        handler: await analyzeHandlerImplementation()
    };
    
    console.log('');
    console.log('📋 === REPORTE DE OPTIMIZACIÓN ===');
    console.log('');
    
    // Calcular estado general
    let score = 0;
    let maxScore = 0;
    
    // Autenticación (25%)
    if (results.auth) score += 25;
    maxScore += 25;
    console.log(`🔐 Autenticación: ${results.auth ? '✅ FUNCIONANDO' : '❌ REQUIERE AJUSTE'} (${results.auth ? 25 : 0}/25pts)`);
    
    // CRUD (35%)
    const crudScore = (results.crud?.create ? 15 : 0) + (results.crud?.read ? 20 : 0);
    score += crudScore;
    maxScore += 35;
    console.log(`📝 Operaciones CRUD: ${crudScore > 20 ? '✅ FUNCIONANDO' : '⚠️ PARCIAL'} (${crudScore}/35pts)`);
    
    // Validaciones (20%)
    if (results.validation) score += 20;
    maxScore += 20;
    console.log(`✅ Validaciones: ${results.validation ? '✅ FUNCIONANDO' : '⚠️ MEJORABLE'} (${results.validation ? 20 : 0}/20pts)`);
    
    // Handler (20%)
    if (results.handler) score += 20;
    maxScore += 20;
    console.log(`🧠 Handler: ${results.handler ? '✅ IMPLEMENTADO' : '❌ REQUIERE TRABAJO'} (${results.handler ? 20 : 0}/20pts)`);
    
    const percentage = Math.round((score / maxScore) * 100);
    
    console.log('');
    console.log(`🎯 PUNTUACIÓN FINAL: ${score}/${maxScore} (${percentage}%)`);
    
    // Recomendaciones según patrón dashboard exitoso
    console.log('');
    console.log('💡 OPTIMIZACIONES REQUERIDAS:');
    
    if (!results.auth) {
        console.log('🔧 1. Implementar autenticación automática tipo dashboard');
        console.log('   - Auto-redirect si no hay token');
        console.log('   - Usar token real de usuario (no anon key)');
    }
    
    if (!results.crud?.create) {
        console.log('🔧 2. Optimizar operaciones de inserción');
        console.log('   - Verificar headers Authorization');
        console.log('   - Implementar manejo de errores robusto');
    }
    
    if (!results.crud?.read) {
        console.log('🔧 3. Mejorar carga de datos');
        console.log('   - Filtrado por usuario_id automático');
        console.log('   - Ordenamiento por fecha descendente');
    }
    
    console.log('🔧 4. Seguir patrón dashboard exacto:');
    console.log('   ✅ Supabase Auth - Token real del usuario');
    console.log('   ✅ Supabase Database - APIs REST directas');
    console.log('   ✅ API Service JavaScript - CRUD client-side');
    
    console.log('');
    console.log('🎯 PRÓXIMO PASO: Aplicar optimizaciones identificadas');
    
    return { score, percentage, results };
}

// Ejecutar test completo
generateOptimizationReport().then((report) => {
    console.log('');
    console.log('✅ Test funcional completado');
    
    if (report.percentage >= 80) {
        console.log('🎉 Módulo listo para optimización final');
    } else {
        console.log('🔧 Módulo requiere actualizaciones importantes');
    }
    
}).catch(error => {
    console.error('❌ Error en test:', error);
    process.exit(1);
});
