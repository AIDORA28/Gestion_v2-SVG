/**
 * 🧪 SCRIPT DE CONSOLA - PRUEBA DE REGISTRO
 * Simula el registro exacto como si el usuario llenara el formulario
 * Ejecutable directamente desde la consola del navegador
 * 
 * USO:
 * 1. Abrir register.html en el navegador
 * 2. Abrir consola (F12)
 * 3. Pegar este script y ejecutar
 * 4. Llamar: await testRegistroConsola()
 */

async function testRegistroConsola() {
    console.log('🧪 ========================================');
    console.log('🧪 INICIANDO PRUEBA DE REGISTRO POR CONSOLA');
    console.log('📧 Email: test@gmail.com');
    console.log('🔐 Password: 123456');
    console.log('🧪 ========================================');
    
    try {
        // Verificar que estamos en la página de registro
        if (!document.getElementById('registerForm')) {
            throw new Error('❌ No se encontró el formulario de registro. ¿Estás en register.html?');
        }
        
        // Verificar que RegisterHandler está disponible
        if (!window.registerHandler) {
            throw new Error('❌ RegisterHandler no está disponible. Verifica que los scripts estén cargados.');
        }
        
        console.log('✅ Formulario de registro encontrado');
        console.log('✅ RegisterHandler disponible');
        
        // 1. LLENAR FORMULARIO AUTOMÁTICAMENTE
        console.log('📝 Llenando formulario con datos de prueba...');
        llenarFormulario();
        
        // 2. SIMULAR ENVÍO DEL FORMULARIO
        console.log('🚀 Simulando envío del formulario...');
        const resultado = await simularRegistro();
        
        // 3. MOSTRAR RESULTADO
        if (resultado.success) {
            console.log('🎉 ¡REGISTRO EXITOSO!');
            console.log('✅ Usuario registrado correctamente');
            console.log('📧 Email:', resultado.email);
            console.log('👤 Nombre:', resultado.nombre);
            
            return {
                success: true,
                message: 'Registro completado exitosamente',
                data: resultado
            };
        } else {
            console.log('❌ ERROR EN REGISTRO:', resultado.error);
            return {
                success: false,
                error: resultado.error
            };
        }
        
    } catch (error) {
        console.error('💥 ERROR CRÍTICO:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 📝 LLENAR FORMULARIO CON DATOS DE PRUEBA
 */
function llenarFormulario() {
    const datos = {
        nombre: 'Usuario',
        apellido: 'Prueba',
        email: 'test@gmail.com',
        password: '123456',
        dni: '12345678',
        telefono: '+1234567890',
        fecha_nacimiento: '1990-01-01',
        genero: 'otro',
        estado_civil: 'soltero',
        numero_hijos: '0',
        profesion: 'Desarrollador',
        nacionalidad: 'peruana',
        direccion: 'Calle Test 123'
    };
    
    // Llenar cada campo
    Object.keys(datos).forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = datos[campo];
            console.log(`✓ ${campo}: ${datos[campo]}`);
        } else {
            console.warn(`⚠️ Campo no encontrado: ${campo}`);
        }
    });
    
    // Aceptar términos y condiciones
    const terms = document.getElementById('terms');
    if (terms) {
        terms.checked = true;
        console.log('✓ Términos y condiciones aceptados');
    }
    
    console.log('✅ Formulario llenado completamente');
}

/**
 * 🚀 SIMULAR REGISTRO (igual que hacer clic en el botón)
 */
async function simularRegistro() {
    try {
        console.log('🔄 Creando evento de envío de formulario...');
        
        // Obtener el formulario
        const form = document.getElementById('registerForm');
        if (!form) {
            throw new Error('Formulario no encontrado');
        }
        
        // Crear evento de submit (igual que cuando el usuario hace clic)
        const evento = new Event('submit', {
            bubbles: true,
            cancelable: true
        });
        
        // Crear FormData con los datos actuales del formulario
        const formData = new FormData(form);
        const userData = {
            nombre: formData.get('nombre')?.trim(),
            apellido: formData.get('apellido')?.trim(),
            email: formData.get('email')?.trim(),
            password: formData.get('password')?.trim(),
            dni: formData.get('dni')?.trim() || null,
            telefono: formData.get('telefono')?.trim() || null,
            fecha_nacimiento: formData.get('fecha_nacimiento') || null,
            genero: formData.get('genero') || null,
            estado_civil: formData.get('estado_civil') || null,
            numero_hijos: parseInt(formData.get('numero_hijos')) || 0,
            profesion: formData.get('profesion')?.trim() || null,
            nacionalidad: formData.get('nacionalidad') || null,
            direccion: formData.get('direccion')?.trim() || null
        };
        
        console.log('📋 Datos a registrar:', userData);
        
        // Llamar directamente al método de registro del handler
        // (simulando exactamente lo que hace el formulario)
        const handler = window.registerHandler;
        
        console.log('🔐 Ejecutando registro con Supabase...');
        const resultado = await handler.registerWithSupabase(userData);
        
        if (resultado) {
            return {
                success: true,
                email: userData.email,
                nombre: userData.nombre,
                apellido: userData.apellido,
                message: 'Usuario registrado exitosamente'
            };
        } else {
            throw new Error('Error en el proceso de registro');
        }
        
    } catch (error) {
        console.error('❌ Error en simulación:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 🔍 VERIFICAR ESTADO DEL SISTEMA
 */
function verificarSistema() {
    console.log('🔍 VERIFICANDO ESTADO DEL SISTEMA...');
    
    const verificaciones = {
        formulario: !!document.getElementById('registerForm'),
        handler: !!window.registerHandler,
        supabase: !!window.supabase,
        notyf: !!window.Notyf
    };
    
    console.log('📋 Estado del sistema:');
    Object.keys(verificaciones).forEach(key => {
        const estado = verificaciones[key] ? '✅' : '❌';
        console.log(`  ${estado} ${key}: ${verificaciones[key] ? 'OK' : 'NO DISPONIBLE'}`);
    });
    
    return verificaciones;
}

/**
 * 🧹 LIMPIAR FORMULARIO
 */
function limpiarFormulario() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.reset();
        console.log('🧹 Formulario limpiado');
    }
}

/**
 * 📊 PRUEBA COMPLETA CON REPORTE
 */
async function pruebaCompleta() {
    console.log('🧪 ==========================================');
    console.log('🧪 PRUEBA COMPLETA DE REGISTRO');
    console.log('🧪 ==========================================');
    
    const inicio = Date.now();
    
    try {
        // 1. Verificar sistema
        const sistema = verificarSistema();
        if (!sistema.formulario || !sistema.handler) {
            throw new Error('Sistema no está listo para la prueba');
        }
        
        // 2. Ejecutar prueba
        const resultado = await testRegistroConsola();
        
        // 3. Reporte final
        const tiempo = Date.now() - inicio;
        console.log('🧪 ==========================================');
        console.log('📊 REPORTE FINAL');
        console.log(`⏱️ Tiempo: ${tiempo}ms`);
        console.log(`✅ Éxito: ${resultado.success ? 'SÍ' : 'NO'}`);
        if (!resultado.success) {
            console.log(`❌ Error: ${resultado.error}`);
        }
        console.log('🧪 ==========================================');
        
        return resultado;
        
    } catch (error) {
        console.error('💥 ERROR EN PRUEBA COMPLETA:', error);
        return { success: false, error: error.message };
    }
}

// ================================
// 🚀 FUNCIONES DISPONIBLES EN CONSOLA
// ================================

console.log('🧪 ==========================================');
console.log('🧪 SCRIPT DE PRUEBA DE REGISTRO CARGADO');
console.log('🧪 ==========================================');
console.log('📋 Funciones disponibles:');
console.log('  • testRegistroConsola() - Prueba básica');
console.log('  • pruebaCompleta() - Prueba con reporte');
console.log('  • verificarSistema() - Ver estado');
console.log('  • limpiarFormulario() - Limpiar campos');
console.log('🧪 ==========================================');
console.log('🚀 Para ejecutar: await testRegistroConsola()');
console.log('📧 Email de prueba: test@gmail.com');
console.log('🔐 Password de prueba: 123456');
console.log('🧪 ==========================================');

// Hacer funciones disponibles globalmente
window.testRegistroConsola = testRegistroConsola;
window.pruebaCompleta = pruebaCompleta;
window.verificarSistema = verificarSistema;
window.limpiarFormulario = limpiarFormulario;
