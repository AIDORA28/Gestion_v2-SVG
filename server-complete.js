/**
 * 🚀 SERVIDOR COMPLETO - PLANIFICAPRO
 * Todas las APIs para: Ingresos, Gastos, Créditos, Reportes, Sugerencias, SUNAT, Tributario
 * Puerto: http://localhost:3001
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

// Configuración de Supabase
const SUPABASE_URL = 'https://lobyofpwqwqsszugdwnw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4NTQ3MjksImV4cCI6MjA0MTQzMDcyOX0.HeL70R3tF7z4Rq2nF7TcjtM4MXDTKLTFt7Yz2k6RCKU';

// ================================
// 🛠️ UTILIDADES HTTP
// ================================

async function supabaseRequest(endpoint, method = 'GET', body = null, authToken = null) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lobyofpwqwqsszugdwnw.supabase.co',
            port: 443,
            path: `/rest/v1/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': authToken ? `Bearer ${authToken}` : `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            }
        };

        if (body && method !== 'GET') {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ data: jsonData, status: res.statusCode, headers: res.headers });
                } catch (e) {
                    resolve({ data: data, status: res.statusCode, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (body && method !== 'GET') {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

async function supabaseAuth(endpoint, method = 'POST', body = null) {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'lobyofpwqwqsszugdwnw.supabase.co',
            port: 443,
            path: `/auth/v1/${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY
            }
        };

        if (body) {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({ data: jsonData, status: res.statusCode, headers: res.headers });
                } catch (e) {
                    resolve({ data: data, status: res.statusCode, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

function getUserIdFromToken(token) {
    try {
        if (!token) return null;
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload.sub;
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
}

function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'text/plain';
}

// ================================
// 📊 API ENDPOINTS - INGRESOS
// ================================

async function handleIngresos(req, res, method, urlParts) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        switch (method) {
            case 'GET':
                if (urlParts.length > 2) {
                    // GET /api/ingresos/:id
                    const ingresoId = urlParts[2];
                    const response = await supabaseRequest(
                        `ingresos?id=eq.${ingresoId}&usuario_id=eq.${userId}`,
                        'GET',
                        null,
                        token
                    );
                    
                    if (response.data && response.data.length > 0) {
                        sendResponse(res, 200, response.data[0]);
                    } else {
                        sendResponse(res, 404, { error: 'Ingreso no encontrado' });
                    }
                } else {
                    // GET /api/ingresos - Lista con filtros y paginación
                    const query = url.parse(req.url, true).query;
                    const page = parseInt(query.page) || 1;
                    const limit = parseInt(query.limit) || 10;
                    const offset = (page - 1) * limit;
                    
                    let filters = [`usuario_id=eq.${userId}`];
                    
                    if (query.categoria && query.categoria !== '') {
                        filters.push(`categoria=eq.${query.categoria}`);
                    }
                    
                    if (query.search && query.search !== '') {
                        filters.push(`descripcion=ilike.*${query.search}*`);
                    }
                    
                    if (query.fechaDesde && query.fechaDesde !== '') {
                        filters.push(`fecha=gte.${query.fechaDesde}`);
                    }
                    
                    if (query.fechaHasta && query.fechaHasta !== '') {
                        filters.push(`fecha=lte.${query.fechaHasta}`);
                    }

                    const endpoint = `ingresos?${filters.join('&')}&order=fecha.desc&limit=${limit}&offset=${offset}`;
                    const response = await supabaseRequest(endpoint, 'GET', null, token);
                    
                    // Contar total para paginación
                    const countEndpoint = `ingresos?${filters.join('&')}&select=count`;
                    const countResponse = await supabaseRequest(countEndpoint, 'GET', null, token);
                    const total = countResponse.data ? countResponse.data.length : 0;
                    
                    sendResponse(res, 200, {
                        ingresos: response.data || [],
                        pagination: {
                            page,
                            limit,
                            total,
                            totalPages: Math.ceil(total / limit),
                            from: offset + 1,
                            to: Math.min(offset + limit, total)
                        }
                    });
                }
                break;

            case 'POST':
                // POST /api/ingresos - Crear nuevo ingreso
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    try {
                        const ingresoData = JSON.parse(body);
                        
                        // Validaciones
                        if (!ingresoData.descripcion || !ingresoData.monto) {
                            return sendResponse(res, 400, { error: 'Descripción y monto son requeridos' });
                        }
                        
                        if (ingresoData.monto <= 0) {
                            return sendResponse(res, 400, { error: 'El monto debe ser mayor a 0' });
                        }
                        
                        // Preparar datos
                        const newIngreso = {
                            usuario_id: userId,
                            descripcion: ingresoData.descripcion,
                            monto: parseFloat(ingresoData.monto),
                            categoria: ingresoData.categoria || 'otros',
                            fecha: ingresoData.fecha || new Date().toISOString().split('T')[0],
                            es_recurrente: ingresoData.es_recurrente || false,
                            frecuencia_dias: ingresoData.frecuencia_dias || null,
                            notas: ingresoData.notas || null
                        };
                        
                        const response = await supabaseRequest('ingresos', 'POST', newIngreso, token);
                        
                        if (response.status === 201) {
                            sendResponse(res, 201, { success: true, data: response.data[0] });
                        } else {
                            sendResponse(res, 400, { error: 'Error al crear ingreso', details: response.data });
                        }
                    } catch (error) {
                        sendResponse(res, 400, { error: 'JSON inválido' });
                    }
                });
                break;

            case 'PUT':
                // PUT /api/ingresos/:id - Actualizar ingreso
                if (urlParts.length > 2) {
                    const ingresoId = urlParts[2];
                    let body = '';
                    req.on('data', chunk => body += chunk.toString());
                    req.on('end', async () => {
                        try {
                            const ingresoData = JSON.parse(body);
                            
                            // Preparar datos de actualización
                            const updateData = {
                                descripcion: ingresoData.descripcion,
                                monto: parseFloat(ingresoData.monto),
                                categoria: ingresoData.categoria,
                                fecha: ingresoData.fecha,
                                es_recurrente: ingresoData.es_recurrente || false,
                                frecuencia_dias: ingresoData.frecuencia_dias || null,
                                notas: ingresoData.notas || null
                            };
                            
                            const response = await supabaseRequest(
                                `ingresos?id=eq.${ingresoId}&usuario_id=eq.${userId}`,
                                'PATCH',
                                updateData,
                                token
                            );
                            
                            if (response.status === 200) {
                                sendResponse(res, 200, { success: true, data: response.data[0] });
                            } else {
                                sendResponse(res, 404, { error: 'Ingreso no encontrado' });
                            }
                        } catch (error) {
                            sendResponse(res, 400, { error: 'JSON inválido' });
                        }
                    });
                } else {
                    sendResponse(res, 400, { error: 'ID requerido' });
                }
                break;

            case 'DELETE':
                // DELETE /api/ingresos/:id - Eliminar ingreso
                if (urlParts.length > 2) {
                    const ingresoId = urlParts[2];
                    const response = await supabaseRequest(
                        `ingresos?id=eq.${ingresoId}&usuario_id=eq.${userId}`,
                        'DELETE',
                        null,
                        token
                    );
                    
                    if (response.status === 204) {
                        sendResponse(res, 200, { success: true, message: 'Ingreso eliminado' });
                    } else {
                        sendResponse(res, 404, { error: 'Ingreso no encontrado' });
                    }
                } else {
                    sendResponse(res, 400, { error: 'ID requerido' });
                }
                break;

            default:
                sendResponse(res, 405, { error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('Error en handleIngresos:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 💸 API ENDPOINTS - GASTOS
// ================================

async function handleGastos(req, res, method, urlParts) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        switch (method) {
            case 'GET':
                if (urlParts.length > 2) {
                    // GET /api/gastos/:id
                    const gastoId = urlParts[2];
                    const response = await supabaseRequest(
                        `gastos?id=eq.${gastoId}&usuario_id=eq.${userId}`,
                        'GET',
                        null,
                        token
                    );
                    
                    if (response.data && response.data.length > 0) {
                        sendResponse(res, 200, response.data[0]);
                    } else {
                        sendResponse(res, 404, { error: 'Gasto no encontrado' });
                    }
                } else {
                    // GET /api/gastos - Lista con filtros
                    const query = url.parse(req.url, true).query;
                    const page = parseInt(query.page) || 1;
                    const limit = parseInt(query.limit) || 10;
                    const offset = (page - 1) * limit;
                    
                    let filters = [`usuario_id=eq.${userId}`];
                    
                    if (query.categoria && query.categoria !== '') {
                        filters.push(`categoria=eq.${query.categoria}`);
                    }
                    
                    if (query.metodo_pago && query.metodo_pago !== '') {
                        filters.push(`metodo_pago=eq.${query.metodo_pago}`);
                    }
                    
                    if (query.search && query.search !== '') {
                        filters.push(`descripcion=ilike.*${query.search}*`);
                    }

                    const endpoint = `gastos?${filters.join('&')}&order=fecha.desc&limit=${limit}&offset=${offset}`;
                    const response = await supabaseRequest(endpoint, 'GET', null, token);
                    
                    sendResponse(res, 200, {
                        gastos: response.data || [],
                        pagination: { page, limit, total: response.data?.length || 0 }
                    });
                }
                break;

            case 'POST':
                // POST /api/gastos - Crear nuevo gasto
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    try {
                        const gastoData = JSON.parse(body);
                        
                        const newGasto = {
                            usuario_id: userId,
                            descripcion: gastoData.descripcion,
                            monto: parseFloat(gastoData.monto),
                            categoria: gastoData.categoria || 'otros',
                            fecha: gastoData.fecha || new Date().toISOString().split('T')[0],
                            metodo_pago: gastoData.metodo_pago || 'efectivo',
                            es_recurrente: gastoData.es_recurrente || false,
                            frecuencia_dias: gastoData.frecuencia_dias || null,
                            notas: gastoData.notas || null
                        };
                        
                        const response = await supabaseRequest('gastos', 'POST', newGasto, token);
                        
                        if (response.status === 201) {
                            sendResponse(res, 201, { success: true, data: response.data[0] });
                        } else {
                            sendResponse(res, 400, { error: 'Error al crear gasto', details: response.data });
                        }
                    } catch (error) {
                        sendResponse(res, 400, { error: 'JSON inválido' });
                    }
                });
                break;

            case 'PUT':
                // PUT /api/gastos/:id - Actualizar gasto
                if (urlParts.length > 2) {
                    const gastoId = urlParts[2];
                    let body = '';
                    req.on('data', chunk => body += chunk.toString());
                    req.on('end', async () => {
                        try {
                            const gastoData = JSON.parse(body);
                            
                            const updateData = {
                                descripcion: gastoData.descripcion,
                                monto: parseFloat(gastoData.monto),
                                categoria: gastoData.categoria,
                                fecha: gastoData.fecha,
                                metodo_pago: gastoData.metodo_pago,
                                es_recurrente: gastoData.es_recurrente || false,
                                frecuencia_dias: gastoData.frecuencia_dias || null,
                                notas: gastoData.notas || null
                            };
                            
                            const response = await supabaseRequest(
                                `gastos?id=eq.${gastoId}&usuario_id=eq.${userId}`,
                                'PATCH',
                                updateData,
                                token
                            );
                            
                            if (response.status === 200) {
                                sendResponse(res, 200, { success: true, data: response.data[0] });
                            } else {
                                sendResponse(res, 404, { error: 'Gasto no encontrado' });
                            }
                        } catch (error) {
                            sendResponse(res, 400, { error: 'JSON inválido' });
                        }
                    });
                } else {
                    sendResponse(res, 400, { error: 'ID requerido' });
                }
                break;

            case 'DELETE':
                // DELETE /api/gastos/:id
                if (urlParts.length > 2) {
                    const gastoId = urlParts[2];
                    const response = await supabaseRequest(
                        `gastos?id=eq.${gastoId}&usuario_id=eq.${userId}`,
                        'DELETE',
                        null,
                        token
                    );
                    
                    if (response.status === 204) {
                        sendResponse(res, 200, { success: true, message: 'Gasto eliminado' });
                    } else {
                        sendResponse(res, 404, { error: 'Gasto no encontrado' });
                    }
                } else {
                    sendResponse(res, 400, { error: 'ID requerido' });
                }
                break;

            default:
                sendResponse(res, 405, { error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('Error en handleGastos:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 💳 API ENDPOINTS - CRÉDITOS
// ================================

async function handleCreditos(req, res, method, urlParts) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        switch (method) {
            case 'GET':
                // GET /api/creditos - Lista de simulaciones
                const response = await supabaseRequest(
                    `simulaciones_credito?usuario_id=eq.${userId}&order=created_at.desc`,
                    'GET',
                    null,
                    token
                );
                
                sendResponse(res, 200, { creditos: response.data || [] });
                break;

            case 'POST':
                // POST /api/creditos - Crear simulación de crédito
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    try {
                        const creditoData = JSON.parse(body);
                        
                        // Cálculos de crédito
                        const monto = parseFloat(creditoData.monto);
                        const plazoMeses = parseInt(creditoData.plazo_meses);
                        const tasaAnual = parseFloat(creditoData.tasa_anual);
                        const tasaMensual = tasaAnual / 100 / 12;
                        
                        // Fórmula de cuota mensual
                        const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                                           (Math.pow(1 + tasaMensual, plazoMeses) - 1);
                        
                        const totalPagar = cuotaMensual * plazoMeses;
                        const totalIntereses = totalPagar - monto;
                        
                        const newCredito = {
                            usuario_id: userId,
                            tipo_credito: creditoData.tipo_credito || 'personal',
                            monto: monto,
                            plazo_meses: plazoMeses,
                            tasa_anual: tasaAnual,
                            cuota_mensual: Math.round(cuotaMensual * 100) / 100,
                            total_intereses: Math.round(totalIntereses * 100) / 100,
                            total_pagar: Math.round(totalPagar * 100) / 100,
                            resultado: {
                                detalles: {
                                    monto_solicitado: monto,
                                    plazo_meses: plazoMeses,
                                    tasa_anual: tasaAnual,
                                    tasa_mensual: Math.round(tasaMensual * 10000) / 100,
                                    cuota_mensual: Math.round(cuotaMensual * 100) / 100,
                                    total_intereses: Math.round(totalIntereses * 100) / 100,
                                    total_pagar: Math.round(totalPagar * 100) / 100
                                }
                            },
                            guardada: creditoData.guardada || false
                        };
                        
                        const response = await supabaseRequest('simulaciones_credito', 'POST', newCredito, token);
                        
                        if (response.status === 201) {
                            sendResponse(res, 201, { success: true, data: response.data[0] });
                        } else {
                            sendResponse(res, 400, { error: 'Error al crear simulación', details: response.data });
                        }
                    } catch (error) {
                        sendResponse(res, 400, { error: 'JSON inválido o cálculo erróneo' });
                    }
                });
                break;

            case 'DELETE':
                // DELETE /api/creditos/:id
                if (urlParts.length > 2) {
                    const creditoId = urlParts[2];
                    const response = await supabaseRequest(
                        `simulaciones_credito?id=eq.${creditoId}&usuario_id=eq.${userId}`,
                        'DELETE',
                        null,
                        token
                    );
                    
                    if (response.status === 204) {
                        sendResponse(res, 200, { success: true, message: 'Simulación eliminada' });
                    } else {
                        sendResponse(res, 404, { error: 'Simulación no encontrada' });
                    }
                } else {
                    sendResponse(res, 400, { error: 'ID requerido' });
                }
                break;

            default:
                sendResponse(res, 405, { error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('Error en handleCreditos:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 📊 API ENDPOINTS - REPORTES
// ================================

async function handleReportes(req, res, method, urlParts) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        if (method === 'GET') {
            const query = url.parse(req.url, true).query;
            const tipoReporte = query.tipo || 'resumen';
            const fechaDesde = query.fecha_desde || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const fechaHasta = query.fecha_hasta || new Date().toISOString().split('T')[0];

            switch (tipoReporte) {
                case 'resumen':
                    // Obtener ingresos y gastos del período
                    const [ingresosRes, gastosRes] = await Promise.all([
                        supabaseRequest(
                            `ingresos?usuario_id=eq.${userId}&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}`,
                            'GET', null, token
                        ),
                        supabaseRequest(
                            `gastos?usuario_id=eq.${userId}&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}`,
                            'GET', null, token
                        )
                    ]);

                    const ingresos = ingresosRes.data || [];
                    const gastos = gastosRes.data || [];

                    const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
                    const totalGastos = gastos.reduce((sum, gas) => sum + parseFloat(gas.monto), 0);
                    const balance = totalIngresos - totalGastos;

                    // Agrupar por categorías
                    const ingresosPorCategoria = {};
                    const gastosPorCategoria = {};

                    ingresos.forEach(ing => {
                        const cat = ing.categoria || 'otros';
                        ingresosPorCategoria[cat] = (ingresosPorCategoria[cat] || 0) + parseFloat(ing.monto);
                    });

                    gastos.forEach(gas => {
                        const cat = gas.categoria || 'otros';
                        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + parseFloat(gas.monto);
                    });

                    sendResponse(res, 200, {
                        periodo: { desde: fechaDesde, hasta: fechaHasta },
                        resumen: {
                            total_ingresos: Math.round(totalIngresos * 100) / 100,
                            total_gastos: Math.round(totalGastos * 100) / 100,
                            balance: Math.round(balance * 100) / 100,
                            cantidad_ingresos: ingresos.length,
                            cantidad_gastos: gastos.length
                        },
                        categorias: {
                            ingresos: ingresosPorCategoria,
                            gastos: gastosPorCategoria
                        }
                    });
                    break;

                case 'mensual':
                    // Reporte mensual con tendencias
                    const mesActual = new Date().getMonth();
                    const añoActual = new Date().getFullYear();
                    
                    const reporteMensual = [];
                    
                    for (let i = 0; i < 12; i++) {
                        const fecha = new Date(añoActual, i, 1);
                        const primerDia = fecha.toISOString().split('T')[0];
                        const ultimoDia = new Date(añoActual, i + 1, 0).toISOString().split('T')[0];
                        
                        const [ingMes, gasMes] = await Promise.all([
                            supabaseRequest(
                                `ingresos?usuario_id=eq.${userId}&fecha=gte.${primerDia}&fecha=lte.${ultimoDia}`,
                                'GET', null, token
                            ),
                            supabaseRequest(
                                `gastos?usuario_id=eq.${userId}&fecha=gte.${primerDia}&fecha=lte.${ultimoDia}`,
                                'GET', null, token
                            )
                        ]);

                        const totalIngMes = (ingMes.data || []).reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
                        const totalGasMes = (gasMes.data || []).reduce((sum, gas) => sum + parseFloat(gas.monto), 0);

                        reporteMensual.push({
                            mes: i + 1,
                            nombre_mes: fecha.toLocaleDateString('es-ES', { month: 'long' }),
                            ingresos: Math.round(totalIngMes * 100) / 100,
                            gastos: Math.round(totalGasMes * 100) / 100,
                            balance: Math.round((totalIngMes - totalGasMes) * 100) / 100
                        });
                    }

                    sendResponse(res, 200, {
                        año: añoActual,
                        reporte_mensual: reporteMensual
                    });
                    break;

                default:
                    sendResponse(res, 400, { error: 'Tipo de reporte no válido' });
            }
        } else {
            sendResponse(res, 405, { error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('Error en handleReportes:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 💡 API ENDPOINTS - SUGERENCIAS
// ================================

async function handleSugerencias(req, res, method, urlParts) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        if (method === 'GET') {
            // Obtener datos del último mes para generar sugerencias
            const fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const fechaHasta = new Date().toISOString().split('T')[0];

            const [ingresosRes, gastosRes] = await Promise.all([
                supabaseRequest(
                    `ingresos?usuario_id=eq.${userId}&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}`,
                    'GET', null, token
                ),
                supabaseRequest(
                    `gastos?usuario_id=eq.${userId}&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}`,
                    'GET', null, token
                )
            ]);

            const ingresos = ingresosRes.data || [];
            const gastos = gastosRes.data || [];

            const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
            const totalGastos = gastos.reduce((sum, gas) => sum + parseFloat(gas.monto), 0);
            const tasaAhorro = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;

            // Generar sugerencias basadas en el análisis
            const sugerencias = [];

            // Sugerencia de ahorro
            if (tasaAhorro < 10) {
                sugerencias.push({
                    tipo: 'ahorro',
                    prioridad: 'alta',
                    titulo: 'Mejora tu tasa de ahorro',
                    descripcion: `Tu tasa de ahorro actual es ${Math.round(tasaAhorro)}%. Se recomienda ahorrar al menos 10-20% de tus ingresos.`,
                    accion: 'Revisa tus gastos y identifica áreas donde puedas reducir costos'
                });
            }

            // Análisis de gastos por categoría
            const gastosPorCategoria = {};
            gastos.forEach(gas => {
                const cat = gas.categoria || 'otros';
                gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + parseFloat(gas.monto);
            });

            // Sugerencia si gastos de entretenimiento son muy altos
            const gastoEntretenimiento = gastosPorCategoria['entretenimiento'] || 0;
            if (gastoEntretenimiento > totalIngresos * 0.15) {
                sugerencias.push({
                    tipo: 'gasto',
                    prioridad: 'media',
                    titulo: 'Reduce gastos de entretenimiento',
                    descripcion: `Estás gastando ${Math.round((gastoEntretenimiento/totalIngresos)*100)}% de tus ingresos en entretenimiento.`,
                    accion: 'Considera reducir salidas y buscar alternativas más económicas'
                });
            }

            // Sugerencia de ingresos adicionales
            if (totalIngresos < totalGastos) {
                sugerencias.push({
                    tipo: 'ingreso',
                    prioridad: 'alta',
                    titulo: 'Considera ingresos adicionales',
                    descripcion: 'Tus gastos superan tus ingresos. Es importante equilibrar tu situación financiera.',
                    accion: 'Explora oportunidades de trabajo freelance o ingresos pasivos'
                });
            }

            // Sugerencia de emergencia
            const ahorroEstimado = totalIngresos - totalGastos;
            const fondoEmergencia = ahorroEstimado * 6; // 6 meses de gastos
            
            sugerencias.push({
                tipo: 'emergencia',
                prioridad: 'media',
                titulo: 'Fondo de emergencia',
                descripcion: `Se recomienda tener un fondo de emergencia de $${Math.round(fondoEmergencia)}`,
                accion: 'Destina una parte de tus ahorros a crear un fondo de emergencia'
            });

            sendResponse(res, 200, {
                analisis: {
                    total_ingresos: Math.round(totalIngresos * 100) / 100,
                    total_gastos: Math.round(totalGastos * 100) / 100,
                    tasa_ahorro: Math.round(tasaAhorro * 100) / 100,
                    gastos_por_categoria: gastosPorCategoria
                },
                sugerencias: sugerencias
            });
        } else {
            sendResponse(res, 405, { error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('Error en handleSugerencias:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 🏛️ API ENDPOINTS - SUNAT/TRIBUTARIO
// ================================

async function handleTributario(req, res, method, urlParts) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        if (method === 'GET') {
            const query = url.parse(req.url, true).query;
            const año = parseInt(query.año) || new Date().getFullYear();

            // Obtener ingresos del año para cálculos tributarios
            const fechaDesde = `${año}-01-01`;
            const fechaHasta = `${año}-12-31`;

            const ingresosRes = await supabaseRequest(
                `ingresos?usuario_id=eq.${userId}&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}`,
                'GET', null, token
            );

            const ingresos = ingresosRes.data || [];
            const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);

            // Cálculos tributarios básicos (Perú)
            const uit = 5150; // UIT 2024 (esto debería ser configurable)
            let impuestoRenta = 0;
            let categoria = '';

            // Cálculo simplificado del impuesto a la renta de 4ta categoría
            if (totalIngresos <= uit * 7) {
                impuestoRenta = 0;
                categoria = 'No gravado';
            } else {
                const baseImponible = totalIngresos - (uit * 7);
                if (baseImponible <= uit * 12) {
                    impuestoRenta = baseImponible * 0.08;
                    categoria = '4ta categoría - 8%';
                } else if (baseImponible <= uit * 27) {
                    impuestoRenta = (uit * 12 * 0.08) + ((baseImponible - uit * 12) * 0.14);
                    categoria = '4ta categoría - 14%';
                } else if (baseImponible <= uit * 54) {
                    impuestoRenta = (uit * 12 * 0.08) + (uit * 15 * 0.14) + ((baseImponible - uit * 27) * 0.17);
                    categoria = '4ta categoría - 17%';
                } else {
                    impuestoRenta = (uit * 12 * 0.08) + (uit * 15 * 0.14) + (uit * 27 * 0.17) + ((baseImponible - uit * 54) * 0.30);
                    categoria = '4ta categoría - 30%';
                }
            }

            // Ingresos mensuales para determinar si debe hacer pagos a cuenta
            const ingresosMensuales = [];
            for (let mes = 1; mes <= 12; mes++) {
                const fechaMesDesde = `${año}-${mes.toString().padStart(2, '0')}-01`;
                const fechaMesHasta = new Date(año, mes, 0).toISOString().split('T')[0];
                
                const ingresosMes = ingresos.filter(ing => 
                    ing.fecha >= fechaMesDesde && ing.fecha <= fechaMesHasta
                );
                
                const totalMes = ingresosMes.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
                
                ingresosMensuales.push({
                    mes,
                    nombre_mes: new Date(año, mes - 1).toLocaleDateString('es-ES', { month: 'long' }),
                    ingresos: Math.round(totalMes * 100) / 100,
                    debe_declarar: totalMes > (uit * 7 / 12)
                });
            }

            sendResponse(res, 200, {
                año,
                resumen_tributario: {
                    total_ingresos_anuales: Math.round(totalIngresos * 100) / 100,
                    uit_vigente: uit,
                    categoria_tributaria: categoria,
                    impuesto_renta_estimado: Math.round(impuestoRenta * 100) / 100,
                    debe_presentar_declaracion: totalIngresos > uit * 7
                },
                ingresos_mensuales: ingresosMensuales,
                recomendaciones: [
                    {
                        tipo: 'declaracion',
                        mensaje: totalIngresos > uit * 7 
                            ? 'Debes presentar declaración anual de renta'
                            : 'No estás obligado a presentar declaración anual'
                    },
                    {
                        tipo: 'pagos_cuenta',
                        mensaje: 'Revisa si debes hacer pagos a cuenta mensuales'
                    },
                    {
                        tipo: 'deducibles',
                        mensaje: 'Considera gastos deducibles como donaciones y gastos médicos'
                    }
                ]
            });
        } else {
            sendResponse(res, 405, { error: 'Método no permitido' });
        }
    } catch (error) {
        console.error('Error en handleTributario:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 🔐 API ENDPOINTS - AUTENTICACIÓN
// ================================

async function handleLogin(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
        try {
            const { email, password } = JSON.parse(body);
            console.log('🔐 Intentando login con Supabase Auth para:', email);

            const response = await supabaseAuth('token?grant_type=password', 'POST', {
                email,
                password
            });

            console.log('📊 Respuesta de Supabase Auth:', response);

            if (response.data && response.data.access_token) {
                sendResponse(res, 200, {
                    success: true,
                    data: response.data
                });
            } else {
                sendResponse(res, 401, {
                    success: false,
                    message: response.data?.msg || 'Credenciales incorrectas'
                });
            }
        } catch (error) {
            console.error('Error en login:', error);
            sendResponse(res, 500, { error: 'Error interno del servidor' });
        }
    });
}

async function handleUser(req, res) {
    const token = getTokenFromRequest(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
        return sendResponse(res, 401, { error: 'Token inválido' });
    }

    try {
        // Obtener información del perfil del usuario
        const response = await supabaseRequest(
            `perfiles_usuario?id=eq.${userId}`,
            'GET',
            null,
            token
        );

        if (response.data && response.data.length > 0) {
            sendResponse(res, 200, response.data[0]);
        } else {
            // Si no existe perfil, crear uno básico
            const newProfile = {
                id: userId,
                nombre: 'Usuario',
                apellido: '',
                email: ''
            };

            const createResponse = await supabaseRequest('perfiles_usuario', 'POST', newProfile, token);
            
            if (createResponse.status === 201) {
                sendResponse(res, 200, createResponse.data[0]);
            } else {
                sendResponse(res, 404, { error: 'Usuario no encontrado' });
            }
        }
    } catch (error) {
        console.error('Error en handleUser:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
}

// ================================
// 🌐 SERVIDOR PRINCIPAL
// ================================

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${method} ${pathname}`);

    try {
        const urlParts = pathname.split('/').filter(part => part);

        // API Routes
        if (urlParts[0] === 'api') {
            const endpoint = urlParts[1];

            switch (endpoint) {
                case 'login':
                    if (method === 'POST') {
                        await handleLogin(req, res);
                    } else {
                        sendResponse(res, 405, { error: 'Método no permitido' });
                    }
                    break;

                case 'user':
                    if (method === 'GET') {
                        await handleUser(req, res);
                    } else {
                        sendResponse(res, 405, { error: 'Método no permitido' });
                    }
                    break;

                case 'health':
                    sendResponse(res, 200, { 
                        success: true, 
                        message: 'Servidor funcionando correctamente',
                        timestamp: new Date().toISOString()
                    });
                    break;

                case 'ingresos':
                    await handleIngresos(req, res, method, urlParts);
                    break;

                case 'gastos':
                    await handleGastos(req, res, method, urlParts);
                    break;

                case 'creditos':
                    await handleCreditos(req, res, method, urlParts);
                    break;

                case 'reportes':
                    await handleReportes(req, res, method, urlParts);
                    break;

                case 'sugerencias':
                    await handleSugerencias(req, res, method, urlParts);
                    break;

                case 'tributario':
                    await handleTributario(req, res, method, urlParts);
                    break;

                default:
                    sendResponse(res, 404, { error: 'Endpoint no encontrado' });
            }
            return;
        }

        // Static file serving from public directory
        const publicPath = path.join(__dirname, 'public');
        let filePath;

        if (pathname === '/' || pathname === '/index.html') {
            filePath = path.join(publicPath, 'index.html');
        } else if (pathname === '/health') {
            filePath = path.join(publicPath, 'index.html'); // Landing page
        } else {
            filePath = path.join(publicPath, pathname);
        }

        // Security check - ensure file is within public directory
        const resolvedPath = path.resolve(filePath);
        const publicResolved = path.resolve(publicPath);
        
        if (!resolvedPath.startsWith(publicResolved)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
                return;
            }

            const mimeType = getMimeType(filePath);
            res.writeHead(200, { 'Content-Type': mimeType });
            fs.createReadStream(filePath).pipe(res);
        });

    } catch (error) {
        console.error('Error en servidor:', error);
        sendResponse(res, 500, { error: 'Error interno del servidor' });
    }
});

server.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log('🌟 PLANIFICAPRO - SERVIDOR COMPLETO ACTIVO');
    console.log('🚀 ========================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🗄️  Supabase: ${SUPABASE_URL}`);
    console.log('📋 Endpoints disponibles:');
    console.log('   🔐 POST /api/login (autenticación)');
    console.log('   👤 GET  /api/user (usuario actual)');
    console.log('   ❤️  GET  /api/health (test conexión)');
    console.log('   💰 /api/ingresos (GET, POST, PUT, DELETE)');
    console.log('   💸 /api/gastos (GET, POST, PUT, DELETE)');
    console.log('   💳 /api/creditos (GET, POST, DELETE)');
    console.log('   📊 /api/reportes (GET - resumen, mensual)');
    console.log('   💡 /api/sugerencias (GET)');
    console.log('   🏛️  /api/tributario (GET)');
    console.log('🚀 ========================================');
    console.log('💡 Tip: Abre http://localhost:3001/api/health para probar');
});
