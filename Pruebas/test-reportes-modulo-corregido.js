/**
 * 🧪 TEST REPORTES MÓDULO CORREGIDO
 * Autor: Asistente IA
 * Fecha: 10 Sep 2025
 * 
 * Propósito: Validar que el módulo de reportes funcione correctamente
 * con las mismas APIs que usa el dashboard de ingresos y gastos
 */

const https = require('https');
const http = require('http');

// ====================================
// 🔧 CONFIGURACIÓN DE PRUEBAS
// ====================================

const CONFIG = {
    // Datos del usuario de prueba
    usuario: {
        email: 'joegarcia.1395@gmail.com',
        password: '123456',
        id: 'bcc34167-c282-46dd-9b92-f4b15e7c4fcd' // ID conocido del usuario
    },
    
    // Configuración Supabase
    supabase: {
        url: 'https://lobyofpwqwqsszugdwnw.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI',
        authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzMxMjc4NjU4LCJpYXQiOjE3MzEyNzUwNTgsImlzcyI6Imh0dHBzOi8vbG9ieW9mcHdxd3Fzc3p1Z2R3bncuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImJjYzM0MTY3LWMyODItNDZkZC05YjkyLWY0YjE1ZTdjNGZjZCIsImVtYWlsIjoiam9lZ2FyY2lhLjEzOTVAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJhcGVsbGlkbyI6IkdhcmNpYSIsIm5vbWJyZSI6IkpvZSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzMxMjc1MDU4fV0sInNlc3Npb25faWQiOiI1NzVlMTdiYy0yNGUzLTQxMDAtOTliMS0zNWE0YmYyZmI1YWEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.CZo4i7QXHtNsJlNFutRkrBBJcGOdwn6n3JYhLdAAgYg'
    },
    
    // Configuración servidor local
    servidor: {
        host: 'localhost',
        puerto: 3002,
        protocolo: 'http'
    }
};

// ====================================
// 🛠️ UTILIDADES HTTP
// ====================================

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.protocol === 'https:' ? https : http;
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData,
                        rawData: data
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
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

// ====================================
// 🧪 PRUEBAS DEL MÓDULO DE REPORTES
// ====================================

class TestReportesModulo {
    constructor() {
        this.resultados = {
            servidorLocal: {},
            supabaseDirecto: {},
            comparacion: {}
        };
    }

    async ejecutarTodasLasPruebas() {
        console.log('🚀 INICIANDO PRUEBAS DEL MÓDULO DE REPORTES');
        console.log('=====================================');
        console.log(`👤 Usuario: ${CONFIG.usuario.email}`);
        console.log(`🆔 ID Usuario: ${CONFIG.usuario.id}`);
        console.log(`🌐 Servidor: ${CONFIG.servidor.protocolo}://${CONFIG.servidor.host}:${CONFIG.servidor.puerto}`);
        console.log('');

        try {
            // Paso 1: Probar servidor local
            console.log('📡 PASO 1: Probando servidor local...');
            await this.probarServidorLocal();
            console.log('');

            // Paso 2: Probar Supabase directo
            console.log('📡 PASO 2: Probando Supabase directo...');
            await this.probarSupabaseDirecto();
            console.log('');

            // Paso 3: Comparar resultados
            console.log('🔍 PASO 3: Comparando resultados...');
            this.compararResultados();
            console.log('');

            // Paso 4: Simular módulo de reportes
            console.log('📊 PASO 4: Simulando módulo de reportes...');
            await this.simularModuloReportes();
            console.log('');

            // Resumen final
            this.mostrarResumenFinal();

        } catch (error) {
            console.error('❌ ERROR GENERAL EN PRUEBAS:', error.message);
            console.error('Stack:', error.stack);
        }
    }

    async probarServidorLocal() {
        const endpoints = ['ingresos', 'gastos', 'creditos'];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Probando /api/${endpoint}...`);
                
                const options = {
                    hostname: CONFIG.servidor.host,
                    port: CONFIG.servidor.puerto,
                    path: `/api/${endpoint}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer demo_token'
                    }
                };

                const response = await makeRequest(options);
                
                if (response.statusCode === 200) {
                    const data = response.data[endpoint] || response.data.data || response.data;
                    const items = Array.isArray(data) ? data : [];
                    
                    this.resultados.servidorLocal[endpoint] = {
                        success: true,
                        cantidad: items.length,
                        datos: items,
                        total: items.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0)
                    };
                    
                    console.log(`   ✅ ${endpoint}: ${items.length} registros, Total: S/ ${this.resultados.servidorLocal[endpoint].total.toFixed(2)}`);
                    
                    if (items.length > 0) {
                        console.log(`   📝 Ejemplo: ${items[0].descripcion || items[0].tipo_credito || 'Sin descripción'} - S/ ${items[0].monto || 0}`);
                    }
                } else {
                    console.log(`   ❌ ${endpoint}: HTTP ${response.statusCode}`);
                    console.log(`   📄 Respuesta: ${response.rawData}`);
                    
                    this.resultados.servidorLocal[endpoint] = {
                        success: false,
                        error: `HTTP ${response.statusCode}`,
                        response: response.rawData
                    };
                }
                
            } catch (error) {
                console.log(`   ❌ ${endpoint}: Error de conexión - ${error.message}`);
                this.resultados.servidorLocal[endpoint] = {
                    success: false,
                    error: error.message
                };
            }
        }
    }

    async probarSupabaseDirecto() {
        const tablas = [
            { endpoint: 'ingresos', tabla: 'ingresos' },
            { endpoint: 'gastos', tabla: 'gastos' },
            { endpoint: 'creditos', tabla: 'simulaciones_credito' }
        ];
        
        for (const { endpoint, tabla } of tablas) {
            try {
                console.log(`🔍 Probando Supabase ${tabla}...`);
                
                const url = new URL(`${CONFIG.supabase.url}/rest/v1/${tabla}`);
                url.searchParams.append('usuario_id', `eq.${CONFIG.usuario.id}`);
                url.searchParams.append('select', '*');
                
                if (endpoint !== 'creditos') {
                    url.searchParams.append('order', 'fecha.desc');
                } else {
                    url.searchParams.append('order', 'created_at.desc');
                }
                
                const options = {
                    hostname: url.hostname,
                    port: 443,
                    path: url.pathname + url.search,
                    method: 'GET',
                    protocol: 'https:',
                    headers: {
                        'apikey': CONFIG.supabase.key,
                        'Authorization': `Bearer ${CONFIG.supabase.authToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    }
                };

                const response = await makeRequest(options);
                
                if (response.statusCode === 200) {
                    const items = Array.isArray(response.data) ? response.data : [];
                    
                    this.resultados.supabaseDirecto[endpoint] = {
                        success: true,
                        cantidad: items.length,
                        datos: items,
                        total: items.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0)
                    };
                    
                    console.log(`   ✅ ${endpoint}: ${items.length} registros, Total: S/ ${this.resultados.supabaseDirecto[endpoint].total.toFixed(2)}`);
                    
                    if (items.length > 0) {
                        console.log(`   📝 Ejemplo: ${items[0].descripcion || items[0].tipo_credito || 'Sin descripción'} - S/ ${items[0].monto || 0}`);
                    }
                } else {
                    console.log(`   ❌ ${endpoint}: HTTP ${response.statusCode}`);
                    console.log(`   📄 Respuesta: ${response.rawData}`);
                    
                    this.resultados.supabaseDirecto[endpoint] = {
                        success: false,
                        error: `HTTP ${response.statusCode}`,
                        response: response.rawData
                    };
                }
                
            } catch (error) {
                console.log(`   ❌ ${endpoint}: Error de conexión - ${error.message}`);
                this.resultados.supabaseDirecto[endpoint] = {
                    success: false,
                    error: error.message
                };
            }
        }
    }

    compararResultados() {
        const endpoints = ['ingresos', 'gastos', 'creditos'];
        
        console.log('📊 COMPARACIÓN DE RESULTADOS:');
        console.log('┌─────────────┬──────────────────┬──────────────────┬─────────────┐');
        console.log('│ Endpoint    │ Servidor Local   │ Supabase Directo │ Coinciden   │');
        console.log('├─────────────┼──────────────────┼──────────────────┼─────────────┤');
        
        for (const endpoint of endpoints) {
            const local = this.resultados.servidorLocal[endpoint];
            const supabase = this.resultados.supabaseDirecto[endpoint];
            
            const localOk = local && local.success;
            const supabaseOk = supabase && supabase.success;
            
            const localCantidad = localOk ? local.cantidad : 0;
            const supabaseCantidad = supabaseOk ? supabase.cantidad : 0;
            
            const localTotal = localOk ? local.total : 0;
            const supabaseTotal = supabaseOk ? supabase.total : 0;
            
            const coinciden = localCantidad === supabaseCantidad && 
                             Math.abs(localTotal - supabaseTotal) < 0.01;
            
            const localStr = localOk ? `${localCantidad} (S/${localTotal.toFixed(2)})` : 'ERROR';
            const supabaseStr = supabaseOk ? `${supabaseCantidad} (S/${supabaseTotal.toFixed(2)})` : 'ERROR';
            const coincidenStr = coinciden ? '✅ SÍ' : '❌ NO';
            
            console.log(`│ ${endpoint.padEnd(11)} │ ${localStr.padEnd(16)} │ ${supabaseStr.padEnd(16)} │ ${coincidenStr.padEnd(11)} │`);
            
            this.resultados.comparacion[endpoint] = {
                local: { ok: localOk, cantidad: localCantidad, total: localTotal },
                supabase: { ok: supabaseOk, cantidad: supabaseCantidad, total: supabaseTotal },
                coinciden
            };
        }
        
        console.log('└─────────────┴──────────────────┴──────────────────┴─────────────┘');
    }

    async simularModuloReportes() {
        console.log('🎯 Simulando flujo del módulo de reportes...');
        
        // Simular autenticación como lo hace el módulo
        console.log('🔐 1. Verificando autenticación...');
        const userStr = JSON.stringify({
            id: CONFIG.usuario.id,
            email: CONFIG.usuario.email,
            nombre: 'Joe',
            apellido: 'Garcia'
        });
        
        console.log(`   ✅ Usuario simulado: ${CONFIG.usuario.email}`);
        console.log(`   🔑 Token disponible: ${CONFIG.supabase.authToken ? 'SÍ' : 'NO'}`);
        
        // Simular carga de datos como lo hace el módulo
        console.log('📊 2. Simulando generación de reporte...');
        
        const fechaInicio = new Date(2025, 8, 1); // 1 de septiembre 2025
        const fechaFin = new Date(); // Hoy
        
        console.log(`   📅 Período: ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`);
        
        // Usar los datos que ya obtuvimos
        const ingresos = this.resultados.supabaseDirecto.ingresos?.datos || [];
        const gastos = this.resultados.supabaseDirecto.gastos?.datos || [];
        const creditos = this.resultados.supabaseDirecto.creditos?.datos || [];
        
        // Filtrar por fechas (simulando el filtro del módulo)
        const ingresosFiltrados = ingresos.filter(ingreso => {
            const fecha = new Date(ingreso.fecha);
            return fecha >= fechaInicio && fecha <= fechaFin;
        });
        
        const gastosFiltrados = gastos.filter(gasto => {
            const fecha = new Date(gasto.fecha);
            return fecha >= fechaInicio && fecha <= fechaFin;
        });
        
        // Calcular totales como lo hace el módulo
        const totalIngresos = ingresosFiltrados.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalGastos = gastosFiltrados.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const totalCreditos = creditos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
        const balanceNeto = totalIngresos - totalGastos;
        
        console.log('');
        console.log('📊 RESUMEN EJECUTIVO SIMULADO:');
        console.log('┌─────────────────────┬──────────────────┬──────────────────┐');
        console.log('│ Concepto            │ Cantidad         │ Total            │');
        console.log('├─────────────────────┼──────────────────┼──────────────────┤');
        console.log(`│ Ingresos (período)  │ ${ingresosFiltrados.length.toString().padStart(16)} │ S/ ${totalIngresos.toFixed(2).padStart(13)} │`);
        console.log(`│ Gastos (período)    │ ${gastosFiltrados.length.toString().padStart(16)} │ S/ ${totalGastos.toFixed(2).padStart(13)} │`);
        console.log(`│ Créditos (total)    │ ${creditos.length.toString().padStart(16)} │ S/ ${totalCreditos.toFixed(2).padStart(13)} │`);
        console.log('├─────────────────────┼──────────────────┼──────────────────┤');
        console.log(`│ BALANCE NETO        │                  │ S/ ${balanceNeto.toFixed(2).padStart(13)} │`);
        console.log('└─────────────────────┴──────────────────┴──────────────────┘');
        
        // Simular análisis por categorías
        console.log('');
        console.log('📊 ANÁLISIS POR CATEGORÍAS:');
        
        // Agrupar ingresos por categoría
        const ingresosPorCategoria = ingresosFiltrados.reduce((acc, ingreso) => {
            const categoria = ingreso.categoria || 'Sin categoría';
            if (!acc[categoria]) acc[categoria] = { cantidad: 0, total: 0 };
            acc[categoria].cantidad += 1;
            acc[categoria].total += parseFloat(ingreso.monto || 0);
            return acc;
        }, {});
        
        console.log('💰 Ingresos por categoría:');
        Object.entries(ingresosPorCategoria).forEach(([categoria, datos]) => {
            console.log(`   - ${categoria}: ${datos.cantidad} registros, S/ ${datos.total.toFixed(2)}`);
        });
        
        // Agrupar gastos por categoría
        const gastosPorCategoria = gastosFiltrados.reduce((acc, gasto) => {
            const categoria = gasto.categoria || 'Sin categoría';
            if (!acc[categoria]) acc[categoria] = { cantidad: 0, total: 0 };
            acc[categoria].cantidad += 1;
            acc[categoria].total += parseFloat(gasto.monto || 0);
            return acc;
        }, {});
        
        console.log('💸 Gastos por categoría:');
        Object.entries(gastosPorCategoria).forEach(([categoria, datos]) => {
            console.log(`   - ${categoria}: ${datos.cantidad} registros, S/ ${datos.total.toFixed(2)}`);
        });
        
        // Guardar resultado de la simulación
        this.resultados.simulacion = {
            periodo: { inicio: fechaInicio, fin: fechaFin },
            ingresos: { cantidad: ingresosFiltrados.length, total: totalIngresos, categorias: ingresosPorCategoria },
            gastos: { cantidad: gastosFiltrados.length, total: totalGastos, categorias: gastosPorCategoria },
            creditos: { cantidad: creditos.length, total: totalCreditos },
            balance: balanceNeto
        };
    }

    mostrarResumenFinal() {
        console.log('');
        console.log('🎯 RESUMEN FINAL DE PRUEBAS');
        console.log('==========================================');
        
        // Estado del servidor local
        const servidorLocalOk = Object.values(this.resultados.servidorLocal)
            .every(resultado => resultado.success);
        
        console.log(`🖥️  Servidor Local: ${servidorLocalOk ? '✅ FUNCIONANDO' : '❌ CON ERRORES'}`);
        
        // Estado de Supabase
        const supabaseOk = Object.values(this.resultados.supabaseDirecto)
            .every(resultado => resultado.success);
        
        console.log(`☁️  Supabase Directo: ${supabaseOk ? '✅ FUNCIONANDO' : '❌ CON ERRORES'}`);
        
        // Coherencia de datos
        const datosCoherentes = Object.values(this.resultados.comparacion)
            .every(comparacion => comparacion.coinciden);
        
        console.log(`🔍 Coherencia de Datos: ${datosCoherentes ? '✅ COHERENTES' : '⚠️ DIFERENCIAS'}`);
        
        // Recomendaciones
        console.log('');
        console.log('💡 RECOMENDACIONES:');
        
        if (servidorLocalOk && supabaseOk && datosCoherentes) {
            console.log('   ✅ El módulo de reportes debería funcionar correctamente');
            console.log('   ✅ Ambas fuentes de datos están disponibles y son coherentes');
            console.log('   🎯 El patrón servidor local + fallback Supabase es óptimo');
        } else {
            if (!servidorLocalOk) {
                console.log('   ⚠️ Problema con servidor local - usar solo Supabase directo');
            }
            if (!supabaseOk) {
                console.log('   ❌ Problema con Supabase - verificar autenticación y permisos');
            }
            if (!datosCoherentes) {
                console.log('   ⚠️ Datos inconsistentes entre fuentes - revisar sincronización');
            }
        }
        
        console.log('');
        console.log('📊 DATOS DE LA SIMULACIÓN:');
        if (this.resultados.simulacion) {
            const sim = this.resultados.simulacion;
            console.log(`   💰 Ingresos: ${sim.ingresos.cantidad} registros, S/ ${sim.ingresos.total.toFixed(2)}`);
            console.log(`   💸 Gastos: ${sim.gastos.cantidad} registros, S/ ${sim.gastos.total.toFixed(2)}`);
            console.log(`   💳 Créditos: ${sim.creditos.cantidad} registros, S/ ${sim.creditos.total.toFixed(2)}`);
            console.log(`   ⚖️ Balance: S/ ${sim.balance.toFixed(2)} ${sim.balance >= 0 ? '(Positivo)' : '(Déficit)'}`);
        }
        
        console.log('');
        console.log('🏁 PRUEBAS COMPLETADAS');
        console.log('==========================================');
    }
}

// ====================================
// 🚀 EJECUTAR PRUEBAS
// ====================================

async function main() {
    const test = new TestReportesModulo();
    await test.ejecutarTodasLasPruebas();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 ERROR FATAL:', error);
        process.exit(1);
    });
}

module.exports = TestReportesModulo;
