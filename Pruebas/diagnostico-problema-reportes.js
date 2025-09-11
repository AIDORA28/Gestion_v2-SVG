/**
 * 🔍 DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA EN REPORTES
 * 
 * Este script simula exactamente lo que debería pasar cuando el usuario
 * hace clic en "Reportes" en el dashboard
 */

const https = require('https');

// Configuración con credenciales reales
const CONFIG = {
    usuario: {
        email: 'joegarcia.1395@gmail.com',
        password: '123456'
    },
    
    supabase: {
        url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI'
    }
};

function makeHttpsRequest(url, headers, method = 'GET', postData = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: headers
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData,
                        rawData: data
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: null,
                        rawData: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function obtenerTokenValido() {
    console.log('🔐 PASO 1: Obteniendo token válido...');
    
    const loginData = {
        email: CONFIG.usuario.email,
        password: CONFIG.usuario.password
    };
    
    const headers = {
        'apikey': CONFIG.supabase.key,
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(loginData).length
    };

    const url = `${CONFIG.supabase.url}/auth/v1/token?grant_type=password`;
    
    try {
        const response = await makeHttpsRequest(url, headers, 'POST', JSON.stringify(loginData));
        
        if (response.statusCode === 200 && response.data.access_token) {
            console.log('   ✅ Token obtenido exitosamente');
            console.log(`   🆔 User ID: ${response.data.user.id}`);
            console.log(`   🔑 Token: ${response.data.access_token.substring(0, 50)}...`);
            
            return {
                success: true,
                token: response.data.access_token,
                user: response.data.user
            };
        } else {
            console.log(`   ❌ Error HTTP ${response.statusCode}: ${response.rawData}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
        return { success: false };
    }
}

async function probarCargaDeDatos(token, userId) {
    console.log('');
    console.log('📊 PASO 2: Probando carga de datos como lo hace el módulo...');
    
    const tablas = [
        { nombre: 'ingresos', tabla: 'ingresos' },
        { nombre: 'gastos', tabla: 'gastos' },
        { nombre: 'creditos', tabla: 'simulaciones_credito' }
    ];
    
    const resultados = {};
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    for (const { nombre, tabla } of tablas) {
        console.log(`   🔍 Probando ${nombre}...`);
        
        try {
            let url = `${CONFIG.supabase.url}/rest/v1/${tabla}?usuario_id=eq.${userId}&select=*`;
            
            // Agregar filtro de fechas para ingresos y gastos (como lo hace el módulo)
            if (nombre !== 'creditos') {
                const fechaInicio = primerDiaMes.toISOString().split('T')[0];
                const fechaFin = hoy.toISOString().split('T')[0];
                url += `&fecha=gte.${fechaInicio}&fecha=lte.${fechaFin}&order=fecha.desc`;
            } else {
                url += `&order=created_at.desc`;
            }
            
            const headers = {
                'apikey': CONFIG.supabase.key,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            };

            const response = await makeHttpsRequest(url, headers);
            
            if (response.statusCode === 200) {
                const items = Array.isArray(response.data) ? response.data : [];
                const total = items.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                
                resultados[nombre] = {
                    success: true,
                    cantidad: items.length,
                    total: total,
                    datos: items
                };
                
                console.log(`      ✅ ${items.length} registros, Total: S/ ${total.toFixed(2)}`);
                
                if (items.length > 0) {
                    const ejemplo = items[0];
                    console.log(`      📝 Último: ${ejemplo.descripcion || ejemplo.tipo_credito || 'Sin descripción'} - S/ ${ejemplo.monto}`);
                    console.log(`      📅 Fecha: ${ejemplo.fecha || ejemplo.created_at}`);
                }
                
                if (items.length > 5) {
                    console.log(`      📋 Primeros 3 registros para verificar:`);
                    items.slice(0, 3).forEach((item, index) => {
                        console.log(`         ${index + 1}. ${item.descripcion || item.tipo_credito} - S/ ${item.monto} (${item.fecha || item.created_at})`);
                    });
                }
            } else {
                console.log(`      ❌ HTTP ${response.statusCode}: ${response.rawData}`);
                resultados[nombre] = { success: false, error: response.rawData };
            }
            
        } catch (error) {
            console.log(`      ❌ Error: ${error.message}`);
            resultados[nombre] = { success: false, error: error.message };
        }
    }
    
    return resultados;
}

function analizarResultados(resultados) {
    console.log('');
    console.log('🔍 PASO 3: Análisis de resultados...');
    
    console.log('');
    console.log('📋 RESUMEN COMO DEBERÍA APARECER EN EL FRONTEND:');
    console.log('┌─────────────────────┬──────────────────┬──────────────────┐');
    console.log('│ Concepto            │ Cantidad         │ Total            │');
    console.log('├─────────────────────┼──────────────────┼──────────────────┤');
    
    const ingresos = resultados.ingresos || { success: false, cantidad: 0, total: 0 };
    const gastos = resultados.gastos || { success: false, cantidad: 0, total: 0 };
    const creditos = resultados.creditos || { success: false, cantidad: 0, total: 0 };
    
    console.log(`│ Total Ingresos      │ ${ingresos.cantidad.toString().padStart(16)} │ S/ ${ingresos.total.toFixed(2).padStart(13)} │`);
    console.log(`│ Total Gastos        │ ${gastos.cantidad.toString().padStart(16)} │ S/ ${gastos.total.toFixed(2).padStart(13)} │`);
    console.log(`│ Balance Neto        │                  │ S/ ${(ingresos.total - gastos.total).toFixed(2).padStart(13)} │`);
    console.log(`│ Créditos Activos    │ ${creditos.cantidad.toString().padStart(16)} │ S/ ${creditos.total.toFixed(2).padStart(13)} │`);
    console.log('└─────────────────────┴──────────────────┴──────────────────┘');
    
    console.log('');
    console.log('🎯 DIAGNÓSTICO DEL PROBLEMA:');
    
    let problemaEncontrado = false;
    
    if (!ingresos.success) {
        console.log('   ❌ PROBLEMA: No se pueden cargar ingresos');
        console.log(`      Causa: ${ingresos.error}`);
        problemaEncontrado = true;
    } else if (ingresos.cantidad === 0) {
        console.log('   ⚠️ ADVERTENCIA: No hay ingresos en el período actual');
        console.log('      Posible causa: Filtro de fechas muy restrictivo');
    }
    
    if (!gastos.success) {
        console.log('   ❌ PROBLEMA: No se pueden cargar gastos');
        console.log(`      Causa: ${gastos.error}`);
        problemaEncontrado = true;
    } else if (gastos.cantidad === 0) {
        console.log('   ⚠️ ADVERTENCIA: No hay gastos en el período actual');
        console.log('      Posible causa: Filtro de fechas muy restrictivo');
    }
    
    if (!creditos.success) {
        console.log('   ❌ PROBLEMA: No se pueden cargar créditos');
        console.log(`      Causa: ${creditos.error}`);
        problemaEncontrado = true;
    }
    
    if (!problemaEncontrado) {
        if (ingresos.cantidad > 0 || gastos.cantidad > 0 || creditos.cantidad > 0) {
            console.log('   ✅ Los datos están disponibles en Supabase');
            console.log('   🔧 El problema está en el frontend o en la inicialización del módulo');
            console.log('');
            console.log('   💡 POSIBLES CAUSAS EN EL FRONTEND:');
            console.log('      1. El módulo no se está inicializando correctamente');
            console.log('      2. El token no se está pasando correctamente al módulo');
            console.log('      3. Los elementos DOM no existen cuando se intenta actualizar');
            console.log('      4. Hay errores de JavaScript que impiden la ejecución');
            console.log('      5. El módulo se inicializa antes de que el usuario esté autenticado');
        } else {
            console.log('   ⚠️ No hay datos en el período seleccionado (mes actual)');
            console.log('   💡 SOLUCIONES:');
            console.log('      1. Cambiar el período a "Todo el año" o "Personalizado"');
            console.log('      2. Verificar si hay datos en otros meses');
        }
    }
    
    return {
        datosDisponibles: ingresos.cantidad > 0 || gastos.cantidad > 0 || creditos.cantidad > 0,
        ingresos: ingresos,
        gastos: gastos,
        creditos: creditos
    };
}

async function verificarDatosTodoElAnio(token, userId) {
    console.log('');
    console.log('📅 PASO 4: Verificando datos de todo el año...');
    
    const hoy = new Date();
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
    const fechaInicio = inicioAnio.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];
    
    console.log(`   📅 Período ampliado: ${fechaInicio} a ${fechaFin}`);
    
    const tablas = ['ingresos', 'gastos'];
    
    for (const tabla of tablas) {
        try {
            const url = `${CONFIG.supabase.url}/rest/v1/${tabla}?usuario_id=eq.${userId}&fecha=gte.${fechaInicio}&fecha=lte.${fechaFin}&select=*&order=fecha.desc`;
            
            const headers = {
                'apikey': CONFIG.supabase.key,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await makeHttpsRequest(url, headers);
            
            if (response.statusCode === 200) {
                const items = Array.isArray(response.data) ? response.data : [];
                const total = items.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
                
                console.log(`   📊 ${tabla} (todo el año): ${items.length} registros, S/ ${total.toFixed(2)}`);
                
                if (items.length > 0) {
                    // Mostrar distribución por mes
                    const porMes = items.reduce((acc, item) => {
                        const fecha = new Date(item.fecha);
                        const mes = fecha.toLocaleDateString('es-PE', { year: 'numeric', month: 'long' });
                        if (!acc[mes]) acc[mes] = { cantidad: 0, total: 0 };
                        acc[mes].cantidad += 1;
                        acc[mes].total += parseFloat(item.monto || 0);
                        return acc;
                    }, {});
                    
                    console.log(`      📅 Distribución por mes:`);
                    Object.entries(porMes).forEach(([mes, datos]) => {
                        console.log(`         - ${mes}: ${datos.cantidad} registros, S/ ${datos.total.toFixed(2)}`);
                    });
                }
            }
        } catch (error) {
            console.log(`   ❌ Error verificando ${tabla}: ${error.message}`);
        }
    }
}

// Función principal
async function main() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE REPORTES');
    console.log('================================================');
    console.log('');
    console.log('Este diagnóstico simula exactamente lo que debería suceder');
    console.log('cuando el usuario accede a la sección de Reportes.');
    console.log('');

    try {
        // Paso 1: Obtener token válido
        const auth = await obtenerTokenValido();
        
        if (!auth.success) {
            console.log('');
            console.log('❌ PROBLEMA CRÍTICO: No se puede autenticar');
            console.log('   🔧 SOLUCIÓN: Verificar credenciales y conectividad');
            return;
        }
        
        // Paso 2: Probar carga de datos
        const resultados = await probarCargaDeDatos(auth.token, auth.user.id);
        
        // Paso 3: Analizar resultados
        const analisis = analizarResultados(resultados);
        
        // Paso 4: Si no hay datos en el mes actual, verificar todo el año
        if (!analisis.datosDisponibles) {
            await verificarDatosTodoElAnoio(auth.token, auth.user.id);
        }
        
        console.log('');
        console.log('🎯 DIAGNÓSTICO COMPLETADO');
        console.log('==========================');
        
        if (analisis.datosDisponibles) {
            console.log('✅ DATOS DISPONIBLES: El problema está en el frontend');
            console.log('🔧 SIGUIENTE PASO: Revisar inicialización del módulo de reportes');
        } else {
            console.log('⚠️ NO HAY DATOS: El filtro de fechas es muy restrictivo');
            console.log('🔧 SIGUIENTE PASO: Cambiar período o agregar datos de prueba');
        }
        
    } catch (error) {
        console.error('💥 ERROR FATAL:', error);
    }
}

if (require.main === module) {
    main();
}
