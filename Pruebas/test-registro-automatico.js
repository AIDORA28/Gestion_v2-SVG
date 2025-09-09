/**
 * 🧪 TEST AUTOMÁTICO DE REGISTRO
 * Simula el registro de un usuario real con datos específicos
 * Email: test@gmail.com
 * Password: 123456
 */

class TestRegistroAutomatico {
    constructor() {
        this.supabaseUrl = 'https://lobyofpwqwqsszugdwnw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';
        
        console.log('🧪 Test Registro Automático inicializado');
    }

    /**
     * 🎯 EJECUTAR PRUEBA COMPLETA
     */
    async ejecutarPrueba() {
        console.log('🚀 Iniciando prueba de registro automático...');
        console.log('📧 Email: test@gmail.com');
        console.log('🔐 Password: 123456');
        
        try {
            // Datos del usuario de prueba
            const userData = {
                nombre: 'Usuario',
                apellido: 'Prueba',
                email: 'test@gmail.com',
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

            // Validar datos antes del registro
            const validacion = this.validarDatos(userData);
            if (!validacion.esValido) {
                throw new Error(`Validación fallida: ${validacion.error}`);
            }

            console.log('✅ Datos validados correctamente');
            
            // Ejecutar registro
            const resultado = await this.registrarUsuario(userData);
            
            if (resultado.success) {
                console.log('🎉 REGISTRO EXITOSO!');
                console.log('✅ Usuario creado en Supabase Auth');
                console.log('✅ Datos insertados en tabla usuarios');
                console.log('📝 Detalles:', resultado.data);
                
                return {
                    success: true,
                    message: 'Usuario registrado exitosamente',
                    data: resultado.data
                };
            } else {
                throw new Error(resultado.error);
            }
            
        } catch (error) {
            console.error('❌ ERROR EN REGISTRO:', error);
            return {
                success: false,
                error: error.message,
                details: error
            };
        }
    }

    /**
     * 🔍 VALIDAR DATOS DEL USUARIO
     */
    validarDatos(userData) {
        console.log('🔍 Validando datos del usuario...');
        
        // Campos requeridos
        if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
            return {
                esValido: false,
                error: 'Campos requeridos faltantes'
            };
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return {
                esValido: false,
                error: 'Email inválido'
            };
        }
        
        // Validar password
        if (userData.password.length < 6) {
            return {
                esValido: false,
                error: 'Password debe tener al menos 6 caracteres'
            };
        }
        
        return {
            esValido: true,
            message: 'Datos válidos'
        };
    }

    /**
     * 🔐 REGISTRAR USUARIO (SIMULACIÓN REAL)
     */
    async registrarUsuario(userData) {
        try {
            console.log('🔐 Paso 1: Creando usuario en Supabase Auth...');
            
            // 1. Crear usuario en Supabase Auth
            const signupResponse = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    data: {
                        nombre: userData.nombre,
                        apellido: userData.apellido
                    }
                })
            });

            if (!signupResponse.ok) {
                const errorData = await signupResponse.json();
                console.error('❌ Error en Supabase Auth:', errorData);
                throw new Error(errorData.msg || 'Error al crear cuenta en Auth');
            }

            const signupData = await signupResponse.json();
            console.log('✅ Usuario creado en Supabase Auth:', signupData.user.id);

            console.log('📝 Paso 2: Insertando datos en tabla usuarios...');
            
            // 2. Insertar en tabla usuarios
            const userInsertResponse = await fetch(`${this.supabaseUrl}/rest/v1/usuarios`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    id: signupData.user.id,
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
                })
            });

            if (!userInsertResponse.ok) {
                const errorData = await userInsertResponse.json();
                console.error('❌ Error insertando en tabla usuarios:', errorData);
                throw new Error('Error insertando datos del usuario');
            }

            const insertedUser = await userInsertResponse.json();
            console.log('✅ Usuario insertado en tabla usuarios');

            return {
                success: true,
                data: {
                    authUser: signupData.user,
                    dbUser: insertedUser[0] || insertedUser,
                    email: userData.email,
                    nombre: userData.nombre,
                    apellido: userData.apellido
                }
            };

        } catch (error) {
            console.error('💥 Error en registro:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔍 VERIFICAR SI USUARIO YA EXISTE
     */
    async verificarUsuarioExistente(email) {
        try {
            console.log(`🔍 Verificando si ${email} ya existe...`);
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/usuarios?email=eq.${email}&select=id,email,nombre`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const users = await response.json();
                if (users.length > 0) {
                    console.log('⚠️ Usuario ya existe:', users[0]);
                    return {
                        existe: true,
                        usuario: users[0]
                    };
                }
            }
            
            console.log('✅ Usuario no existe, se puede registrar');
            return { existe: false };
            
        } catch (error) {
            console.error('❌ Error verificando usuario:', error);
            return { existe: false, error: error.message };
        }
    }

    /**
     * 🧹 LIMPIAR USUARIO DE PRUEBA (para testing repetitivo)
     */
    async limpiarUsuarioPrueba(email = 'test@gmail.com') {
        try {
            console.log(`🧹 Limpiando usuario de prueba: ${email}`);
            
            // Buscar usuario
            const checkResponse = await fetch(`${this.supabaseUrl}/rest/v1/usuarios?email=eq.${email}&select=id`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (checkResponse.ok) {
                const users = await checkResponse.json();
                if (users.length > 0) {
                    // Eliminar de tabla usuarios
                    const deleteResponse = await fetch(`${this.supabaseUrl}/rest/v1/usuarios?id=eq.${users[0].id}`, {
                        method: 'DELETE',
                        headers: {
                            'apikey': this.supabaseKey,
                            'Authorization': `Bearer ${this.supabaseKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (deleteResponse.ok) {
                        console.log('✅ Usuario eliminado de tabla usuarios');
                    }
                }
            }
            
            console.log('🧹 Limpieza completada');
            
        } catch (error) {
            console.error('❌ Error en limpieza:', error);
        }
    }

    /**
     * 📊 EJECUTAR PRUEBA COMPLETA CON REPORTE
     */
    async ejecutarPruebaCompleta() {
        console.log('🧪 ==========================================');
        console.log('🧪 INICIANDO PRUEBA COMPLETA DE REGISTRO');
        console.log('🧪 ==========================================');
        
        const tiempoInicio = Date.now();
        
        try {
            // 1. Verificar si usuario ya existe
            const verificacion = await this.verificarUsuarioExistente('test@gmail.com');
            if (verificacion.existe) {
                console.log('⚠️ Usuario ya existe, eliminando para prueba limpia...');
                await this.limpiarUsuarioPrueba('test@gmail.com');
                // Esperar un poco después de limpiar
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // 2. Ejecutar registro
            const resultado = await this.ejecutarPrueba();
            
            // 3. Generar reporte
            const tiempoTotal = Date.now() - tiempoInicio;
            
            console.log('🧪 ==========================================');
            console.log('🧪 REPORTE FINAL DE PRUEBA');
            console.log('🧪 ==========================================');
            console.log(`⏱️ Tiempo total: ${tiempoTotal}ms`);
            console.log(`✅ Éxito: ${resultado.success ? 'SÍ' : 'NO'}`);
            
            if (resultado.success) {
                console.log('🎉 REGISTRO COMPLETADO EXITOSAMENTE');
                console.log('📧 Email registrado: test@gmail.com');
                console.log('👤 Usuario:', resultado.data.nombre, resultado.data.apellido);
                console.log('🆔 ID Auth:', resultado.data.authUser.id);
            } else {
                console.log('❌ ERROR EN REGISTRO:', resultado.error);
            }
            
            return resultado;
            
        } catch (error) {
            console.error('💥 ERROR CRÍTICO EN PRUEBA:', error);
            return { success: false, error: error.message };
        }
    }
}

// ================================
// 🚀 INICIALIZACIÓN Y EJECUCIÓN
// ================================

// Crear instancia global
window.testRegistro = new TestRegistroAutomatico();

// Función para ejecutar desde consola
window.probarRegistro = async function() {
    return await window.testRegistro.ejecutarPruebaCompleta();
};

// Función para limpiar usuario de prueba
window.limpiarUsuarioPrueba = async function() {
    return await window.testRegistro.limpiarUsuarioPrueba('test@gmail.com');
};

console.log('🧪 Test de Registro Automático cargado');
console.log('🚀 Para ejecutar la prueba, usa: probarRegistro()');
console.log('🧹 Para limpiar usuario de prueba, usa: limpiarUsuarioPrueba()');

// Auto-ejecutar la prueba al cargar (opcional)
// Descomenta la siguiente línea para auto-ejecutar
// setTimeout(() => window.probarRegistro(), 2000);
