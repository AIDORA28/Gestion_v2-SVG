// Script de prueba Node.js para módulo de ingresos - SIN navegador
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 === ANÁLISIS Y PRUEBA DEL MÓDULO DE INGRESOS ===');
console.log('📅 Timestamp:', new Date().toLocaleString());
console.log('🎯 Objetivo: Verificar sistema sin navegador, solo por consola');
console.log('');

// Configuración Supabase desde documentación
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI';

// Función para hacer peticiones HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function analizarEstructuraArchivos() {
    console.log('📁 PASO 1: Analizando estructura de archivos...');
    
    const archivosEsenciales = [
        '../public/js/ingresos-module-handler.js',
        '../public/modules/ingresos-template.html',
        '../public/js/supabase-config.js',
        '../public/js/supabase-auth.js',
        '../public/dashboard.html'
    ];
    
    const resultado = {
        existentes: [],
        faltantes: [],
        tamaños: {}
    };
    
    for (const archivo of archivosEsenciales) {
        const rutaCompleta = path.join(__dirname, archivo);
        
        try {
            const stats = fs.statSync(rutaCompleta);
            resultado.existentes.push(archivo);
            resultado.tamaños[archivo] = `${Math.round(stats.size / 1024)}KB`;
            console.log(`✅ ${archivo} (${resultado.tamaños[archivo]})`);
        } catch (error) {
            resultado.faltantes.push(archivo);
            console.log(`❌ ${archivo} - NO ENCONTRADO`);
        }
    }
    
    console.log(`📊 Archivos: ${resultado.existentes.length}/${archivosEsenciales.length} encontrados`);
    
    return resultado;
}

async function analizarHandlerJS() {
    console.log('');
    console.log('🧠 PASO 2: Analizando handler JavaScript...');
    
    try {
        const handlerPath = path.join(__dirname, '../public/js/ingresos-module-handler.js');
        const contenido = fs.readFileSync(handlerPath, 'utf8');
        
        // Análisis de métodos críticos
        const metodos = [
            'constructor',
            'init',
            'handleSubmit',
            'submitIngreso',
            'loadIngresos',
            'renderIngresos',
            'debugTest',
            'diagnosticCheck'
        ];
        
        const metodosEncontrados = {};
        
        metodos.forEach(metodo => {
            // Buscar diferentes patrones de métodos
            const patrones = [
                new RegExp(`${metodo}\\s*\\(`, 'g'),
                new RegExp(`async\\s+${metodo}\\s*\\(`, 'g'),
                new RegExp(`${metodo}\\s*:`, 'g')
            ];
            
            let encontrado = false;
            patrones.forEach(patron => {
                if (patron.test(contenido)) {
                    encontrado = true;
                }
            });
            
            metodosEncontrados[metodo] = encontrado;
            console.log(`${encontrado ? '✅' : '❌'} Método ${metodo}: ${encontrado ? 'PRESENTE' : 'AUSENTE'}`);
        });
        
        // Análisis de configuración Supabase
        const tieneSupabaseConfig = contenido.includes('supabaseUrl') && contenido.includes('supabaseKey');
        console.log(`${tieneSupabaseConfig ? '✅' : '❌'} Configuración Supabase: ${tieneSupabaseConfig ? 'PRESENTE' : 'AUSENTE'}`);
        
        // Análisis de manejo de errores
        const manejoErrores = (contenido.match(/catch\s*\(/g) || []).length;
        console.log(`📊 Bloques try-catch: ${manejoErrores}`);
        
        return {
            metodos: metodosEncontrados,
            tieneSupabaseConfig,
            manejoErrores,
            tamaño: `${Math.round(contenido.length / 1024)}KB`
        };
        
    } catch (error) {
        console.log(`❌ Error leyendo handler: ${error.message}`);
        return null;
    }
}

async function probarConexionSupabase() {
    console.log('');
    console.log('🌐 PASO 3: Probando conexión con Supabase...');
    
    try {
        // Probar endpoint base
        console.log('🔍 Probando endpoint base...');
        const baseResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Status: ${baseResponse.status}`);
        console.log(`📊 Respuesta: ${typeof baseResponse.data === 'object' ? 'JSON válido' : 'Texto plano'}`);
        
        if (baseResponse.status === 200) {
            console.log('✅ Conexión con Supabase: EXITOSA');
        } else {
            console.log(`⚠️ Conexión con respuesta: ${baseResponse.status}`);
        }
        
        // Probar tabla ingresos (sin datos, solo estructura)
        console.log('🔍 Probando acceso a tabla ingresos...');
        const ingresosResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/ingresos?limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📊 Tabla ingresos - Status: ${ingresosResponse.status}`);
        
        if (ingresosResponse.status === 200) {
            console.log('✅ Acceso a tabla ingresos: EXITOSO');
            if (Array.isArray(ingresosResponse.data)) {
                console.log(`📋 Registros encontrados: ${ingresosResponse.data.length}`);
            }
        } else {
            console.log(`❌ Error accediendo a tabla ingresos: ${ingresosResponse.status}`);
        }
        
        return {
            conexionBase: baseResponse.status === 200,
            tablaIngresos: ingresosResponse.status === 200,
            totalRegistros: Array.isArray(ingresosResponse.data) ? ingresosResponse.data.length : 0
        };
        
    } catch (error) {
        console.log(`❌ Error en conexión Supabase: ${error.message}`);
        return null;
    }
}

async function analizarTemplateHTML() {
    console.log('');
    console.log('📄 PASO 4: Analizando template HTML...');
    
    try {
        const templatePath = path.join(__dirname, '../public/modules/ingresos-template.html');
        const contenido = fs.readFileSync(templatePath, 'utf8');
        
        // Elementos críticos del formulario
        const elementos = [
            'id="ingreso-modal"',
            'id="ingreso-form"',
            'id="descripcion"',
            'id="monto"',
            'id="categoria"',
            'id="fecha"',
            'id="ingresos-list"'
        ];
        
        const elementosEncontrados = {};
        
        elementos.forEach(elemento => {
            const encontrado = contenido.includes(elemento);
            elementosEncontrados[elemento] = encontrado;
            console.log(`${encontrado ? '✅' : '❌'} ${elemento}: ${encontrado ? 'PRESENTE' : 'AUSENTE'}`);
        });
        
        // Referencias a funciones JavaScript
        const referencias = [
            'ingresosModuleHandler',
            'handleSubmit',
            'addEventListener'
        ];
        
        console.log('🔗 Referencias JavaScript:');
        referencias.forEach(ref => {
            const encontrado = contenido.includes(ref);
            console.log(`${encontrado ? '✅' : '❌'} ${ref}: ${encontrado ? 'REFERENCIADO' : 'NO REFERENCIADO'}`);
        });
        
        return {
            elementos: elementosEncontrados,
            tamaño: `${Math.round(contenido.length / 1024)}KB`,
            lineas: contenido.split('\n').length
        };
        
    } catch (error) {
        console.log(`❌ Error leyendo template: ${error.message}`);
        return null;
    }
}

async function verificarDependencias() {
    console.log('');
    console.log('🔗 PASO 5: Verificando dependencias en dashboard.html...');
    
    try {
        const dashboardPath = path.join(__dirname, '../public/dashboard.html');
        const contenido = fs.readFileSync(dashboardPath, 'utf8');
        
        const scripts = [
            'supabase-config.js',
            'supabase-auth.js',
            'module-loader.js',
            'ingresos-module-handler.js',
            'dashboard-handler.js'
        ];
        
        const dependencias = {};
        
        scripts.forEach(script => {
            const encontrado = contenido.includes(script);
            dependencias[script] = encontrado;
            console.log(`${encontrado ? '✅' : '❌'} ${script}: ${encontrado ? 'INCLUIDO' : 'NO INCLUIDO'}`);
        });
        
        // Verificar CDNs externos
        const cdns = [
            'tailwindcss.com',
            'supabase.co',
            'lucide',
            'notyf'
        ];
        
        console.log('🌐 CDNs externos:');
        cdns.forEach(cdn => {
            const encontrado = contenido.includes(cdn);
            console.log(`${encontrado ? '✅' : '❌'} ${cdn}: ${encontrado ? 'INCLUIDO' : 'NO INCLUIDO'}`);
        });
        
        return dependencias;
        
    } catch (error) {
        console.log(`❌ Error leyendo dashboard: ${error.message}`);
        return null;
    }
}

async function generarReporte() {
    console.log('');
    console.log('📊 === EJECUTANDO ANÁLISIS COMPLETO ===');
    console.log('');
    
    const resultados = {
        archivos: await analizarEstructuraArchivos(),
        handler: await analizarHandlerJS(),
        supabase: await probarConexionSupabase(),
        template: await analizarTemplateHTML(),
        dependencias: await verificarDependencias()
    };
    
    console.log('');
    console.log('📋 === REPORTE FINAL ===');
    console.log('');
    
    // Calcular puntuación general
    let puntos = 0;
    let total = 0;
    
    // Archivos (20%)
    if (resultados.archivos) {
        const archivosPuntos = resultados.archivos.existentes.length / 5 * 20;
        puntos += archivosPuntos;
        console.log(`📁 Archivos: ${resultados.archivos.existentes.length}/5 (${Math.round(archivosPuntos)}pts)`);
    }
    total += 20;
    
    // Handler (30%)
    if (resultados.handler) {
        const metodosOK = Object.values(resultados.handler.metodos).filter(Boolean).length;
        const handlerPuntos = metodosOK / 8 * 30;
        puntos += handlerPuntos;
        console.log(`🧠 Handler: ${metodosOK}/8 métodos (${Math.round(handlerPuntos)}pts)`);
    }
    total += 30;
    
    // Supabase (25%)
    if (resultados.supabase) {
        const supabasePuntos = (resultados.supabase.conexionBase ? 15 : 0) + (resultados.supabase.tablaIngresos ? 10 : 0);
        puntos += supabasePuntos;
        console.log(`🌐 Supabase: ${resultados.supabase.conexionBase ? 'Conectado' : 'Error'} (${supabasePuntos}pts)`);
    }
    total += 25;
    
    // Template (25%)
    if (resultados.template) {
        const elementosOK = Object.values(resultados.template.elementos).filter(Boolean).length;
        const templatePuntos = elementosOK / 7 * 25;
        puntos += templatePuntos;
        console.log(`📄 Template: ${elementosOK}/7 elementos (${Math.round(templatePuntos)}pts)`);
    }
    total += 25;
    
    const porcentaje = Math.round((puntos / total) * 100);
    
    console.log('');
    console.log(`🎯 PUNTUACIÓN TOTAL: ${Math.round(puntos)}/${total} (${porcentaje}%)`);
    
    // Estado general
    if (porcentaje >= 90) {
        console.log('🎉 ESTADO: EXCELENTE - Sistema listo para producción');
    } else if (porcentaje >= 70) {
        console.log('✅ ESTADO: BUENO - Funcional con mejoras menores');
    } else if (porcentaje >= 50) {
        console.log('⚠️ ESTADO: REGULAR - Necesita correcciones');
    } else {
        console.log('❌ ESTADO: CRÍTICO - Requiere trabajo significativo');
    }
    
    // Recomendaciones
    console.log('');
    console.log('💡 RECOMENDACIONES:');
    
    if (resultados.archivos && resultados.archivos.faltantes.length > 0) {
        console.log('- Verificar archivos faltantes:', resultados.archivos.faltantes.join(', '));
    }
    
    if (resultados.handler && !resultados.handler.tieneSupabaseConfig) {
        console.log('- Configurar conexión Supabase en handler');
    }
    
    if (resultados.supabase && !resultados.supabase.conexionBase) {
        console.log('- Verificar credenciales de Supabase');
    }
    
    console.log('- Probar funcionalidad en navegador: http://localhost:8080/public/dashboard.html');
    console.log('- Usuario de prueba: joegarcia.1395@gmail.com / 123456');
    
    console.log('');
    console.log('✅ Análisis completado - Todos los datos guardados en consola');
}

// Ejecutar análisis
generarReporte().catch(error => {
    console.error('❌ Error en análisis:', error);
    process.exit(1);
});
