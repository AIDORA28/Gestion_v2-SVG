/**
 * 🧪 PRUEBA DE REGISTRO - NODE.JS
 * Ejecuta el registro directamente desde PowerShell/Terminal
 * Simula exactamente el proceso que haría un usuario en el frontend
 * 
 * USO: node Pruebas/test-registro-nodejs.js
 */

const https = require('https');

class TestRegistroNodeJS {
    constructor() {
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        
        console.log('🧪 Test de Registro Node.js inicializado');
    }

    /**
     * 🚀 EJECUTAR PRUEBA PRINCIPAL
     */
    async ejecutarPrueba() {
        console.log('🧪 ========================================');
        console.log('🧪 INICIANDO PRUEBA DE REGISTRO');
        console.log('📧 Email: test.[timestamp]@gmail.com (generado dinámicamente)');
        console.log('🔐 Password: 123456');
        console.log('🧪 ========================================');
        
        const tiempoInicio = Date.now();
        
        try {
            // Datos del usuario (simulando formulario) - Email único con timestamp
            const timestamp = Date.now();
            const testEmail = `test.${timestamp}@gmail.com`;
            
            const userData = {
                nombre: 'Usuario',
                apellido: 'Prueba',
                email: testEmail,
                password: '123456',
                dni: '12345678',
                telefono: '+1234567890',
                fecha_nacimiento: '1990-01-01',
                genero: 'otro',
                estado_civil: 'soltero',
                numero_hijos: 0,
                profesion: 'Desarrollador',
                nacionalidad: 'peruana',
                direccion: 'Calle Test 123'
            };

            console.log('📋 Datos del usuario:');
            console.log(`   Nombre: ${userData.nombre} ${userData.apellido}`);
            console.log(`   Email: ${userData.email}`);
            console.log(`   DNI: ${userData.dni}`);
            console.log(`   Teléfono: ${userData.telefono}`);

            // 1. Validar datos
            console.log('\n🔍 Validando datos...');
            const validacion = this.validarDatos(userData);
            if (!validacion.esValido) {
                throw new Error(`❌ Validación fallida: ${validacion.error}`);
            }
            console.log('✅ Datos válidos');

            // 2. Verificar si usuario ya existe
            console.log('\n🔍 Verificando si usuario ya existe...');
            const usuarioExiste = await this.verificarUsuarioExistente(userData.email);
            if (usuarioExiste.existe) {
                console.log('⚠️ Usuario ya existe, eliminando para prueba limpia...');
                await this.eliminarUsuario(userData.email);
                // Esperar un poco después de eliminar
                await this.esperar(1000);
            }
            console.log('✅ Usuario no existe, se puede registrar');

            // 3. Ejecutar registro
            console.log('\n🔐 Iniciando proceso de registro...');
            const resultado = await this.registrarUsuario(userData);
            
            // 4. Reporte final
            const tiempoTotal = Date.now() - tiempoInicio;
            console.log('\n🧪 ========================================');
            console.log('📊 REPORTE FINAL');
            console.log('🧪 ========================================');
            console.log(`⏱️ Tiempo total: ${tiempoTotal}ms`);
            
            if (resultado.success) {
                console.log('🎉 ¡REGISTRO EXITOSO!');
                console.log('✅ Usuario creado en Supabase Auth');
                console.log('✅ Datos insertados en tabla usuarios');
                console.log(`👤 Usuario: ${resultado.data.nombre} ${resultado.data.apellido}`);
                console.log(`📧 Email: ${resultado.data.email}`);
                console.log(`🆔 ID: ${resultado.data.authUser.id}`);
                
                // Verificar que se puede encontrar el usuario
                console.log('\n🔍 Verificando usuario creado...');
                const verificacion = await this.verificarUsuarioExistente(userData.email);
                if (verificacion.existe) {
                    console.log('✅ Usuario verificado correctamente en la base de datos');
                    console.log(`   ID DB: ${verificacion.usuario.id}`);
                    console.log(`   Nombre: ${verificacion.usuario.nombre}`);
                } else {
                    console.log('⚠️ Usuario no encontrado en verificación');
                }
                
            } else {
                console.log('❌ ERROR EN REGISTRO');
                console.log(`   Error: ${resultado.error}`);
            }
            
            console.log('🧪 ========================================');
            return resultado;
            
        } catch (error) {
            console.error('💥 ERROR CRÍTICO:', error.message);
            console.log('\n🧪 ========================================');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔍 VALIDAR DATOS (simulando validación del frontend)
     */
    validarDatos(userData) {
        // Campos requeridos
        if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
            return { esValido: false, error: 'Campos requeridos faltantes' };
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return { esValido: false, error: 'Email inválido' };
        }
        
        // Validar password
        if (userData.password.length < 6) {
            return { esValido: false, error: 'Password debe tener al menos 6 caracteres' };
        }
        
        return { esValido: true };
    }

    /**
     * 🔐 REGISTRAR USUARIO (simulando RegisterHandler.registerWithSupabase)
     */
    async registrarUsuario(userData) {
        try {
            console.log('🔐 Paso 1: Creando usuario en Supabase Auth...');
            
            // 1. Crear usuario en Supabase Auth
            const authData = await this.fetchSupabase('/auth/v1/signup', 'POST', {
                email: userData.email,
                password: userData.password,
                data: {
                    nombre: userData.nombre,
                    apellido: userData.apellido
                }
            });

            console.log('✅ Usuario creado en Supabase Auth');
            console.log(`   ID: ${authData.user.id}`);
            console.log(`   Email: ${authData.user.email}`);

            // Verificar si obtuvimos JWT token, si no hacer login inmediato
            let userJWT = null;
            
            if (!authData.session || !authData.session.access_token) {
                console.log('🔄 Haciendo login inmediato para obtener JWT...');
                
                // Login inmediato después del signup
                const loginData = await this.fetchSupabase('/auth/v1/token?grant_type=password', 'POST', {
                    email: userData.email,
                    password: userData.password
                });
                
                if (loginData.access_token) {
                    userJWT = loginData.access_token;
                    console.log('✅ JWT obtenido via login inmediato');
                } else {
                    console.log('⚠️ No se pudo obtener JWT, usuario creado solo en Auth');
                    return {
                        success: true,
                        data: {
                            authUser: authData.user,
                            dbUser: null,
                            email: userData.email,
                            nombre: userData.nombre,
                            apellido: userData.apellido,
                            note: 'Usuario creado en Auth solamente'
                        }
                    };
                }
            } else {
                userJWT = authData.session.access_token;
                console.log('✅ JWT obtenido directamente del signup');
            }

            console.log('\n📝 Paso 2: Insertando datos en tabla usuarios con JWT...');
            
            // 2. Insertar en tabla usuarios usando JWT del usuario
            const dbData = await this.fetchSupabaseWithJWT('/rest/v1/usuarios', 'POST', {
                id: authData.user.id,
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: userData.email,
                telefono: userData.telefono || null,
                fecha_nacimiento: userData.fecha_nacimiento || null,
                dni: userData.dni || null,
                genero: userData.genero || null,
                estado_civil: userData.estado_civil || null,
                numero_hijos: userData.numero_hijos || 0,
                profesion: userData.profesion || null,
                nacionalidad: userData.nacionalidad || null,
                direccion: userData.direccion || null,
                password_hash: 'managed_by_supabase_auth',
                email_verified: false,
                active: true
            }, userJWT, {
                'Prefer': 'return=representation'
            });

            console.log('✅ Usuario insertado en tabla usuarios');

            return {
                success: true,
                data: {
                    authUser: authData.user,
                    dbUser: Array.isArray(dbData) ? dbData[0] : dbData,
                    email: userData.email,
                    nombre: userData.nombre,
                    apellido: userData.apellido
                }
            };

        } catch (error) {
            console.error('❌ Error en registro:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔍 VERIFICAR SI USUARIO EXISTE
     */
    async verificarUsuarioExistente(email) {
        try {
            const response = await this.fetchSupabase(`/rest/v1/usuarios?email=eq.${email}&select=id,email,nombre,apellido`, 'GET');
            
            if (Array.isArray(response) && response.length > 0) {
                return {
                    existe: true,
                    usuario: response[0]
                };
            }
            
            return { existe: false };
            
        } catch (error) {
            console.error('Error verificando usuario:', error.message);
            return { existe: false, error: error.message };
        }
    }

    /**
     * 🗑️ ELIMINAR USUARIO (para testing limpio)
     */
    async eliminarUsuario(email) {
        try {
            await this.fetchSupabase(`/rest/v1/usuarios?email=eq.${email}`, 'DELETE');
            console.log('✅ Usuario eliminado para prueba limpia');
        } catch (error) {
            console.log('⚠️ Error eliminando usuario (puede no existir):', error.message);
        }
    }

    /**
     * 🌐 FETCH A SUPABASE (simulando fetch del browser)
     */
    async fetchSupabase(endpoint, method = 'GET', body = null, extraHeaders = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.supabaseUrl);
            
            const headers = {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Test Client',
                ...extraHeaders
            };

            const options = {
                method: method,
                headers: headers,
                timeout: 10000
            };

            const req = https.request(url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            const parsed = data ? JSON.parse(data) : {};
                            resolve(parsed);
                        } else {
                            const errorData = data ? JSON.parse(data) : {};
                            reject(new Error(errorData.message || errorData.msg || `HTTP ${res.statusCode}`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Error parsing response: ${parseError.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request error: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                req.write(JSON.stringify(body));
            }

            req.end();
        });
    }

    /**
     * 🎯 FETCH A SUPABASE CON JWT TOKEN (para operaciones autenticadas)
     */
    async fetchSupabaseWithJWT(endpoint, method = 'GET', body = null, jwtToken, extraHeaders = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.supabaseUrl);
            
            const headers = {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${jwtToken}`, // 🎯 USAR JWT DEL USUARIO
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Test Client',
                ...extraHeaders
            };

            const options = {
                method: method,
                headers: headers,
                timeout: 10000
            };

            const req = https.request(url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            const parsed = data ? JSON.parse(data) : {};
                            resolve(parsed);
                        } else {
                            const errorData = data ? JSON.parse(data) : {};
                            reject(new Error(errorData.message || errorData.msg || `HTTP ${res.statusCode}`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Error parsing response: ${parseError.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request error: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                req.write(JSON.stringify(body));
            }

            req.end();
        });
    }

    /**
     * ⏱️ FUNCIÓN HELPER PARA ESPERAR
     */
    async esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ================================
// 🚀 EJECUCIÓN PRINCIPAL
// ================================

async function main() {
    const test = new TestRegistroNodeJS();
    const resultado = await test.ejecutarPrueba();
    
    // Salir con código de éxito o error
    process.exit(resultado.success ? 0 : 1);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 ERROR FATAL:', error);
        process.exit(1);
    });
}

module.exports = TestRegistroNodeJS;
