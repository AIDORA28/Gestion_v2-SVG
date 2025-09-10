const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 === SERVIDOR DE PRUEBA AUTOMÁTICA ===');

// Crear servidor HTTP simple
const server = http.createServer((req, res) => {
    console.log(`📡 Petición: ${req.method} ${req.url}`);
    
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'dashboard.html' : req.url);
    
    // Manejar extensiones
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    
    const contentType = contentTypes[ext] || 'text/plain; charset=utf-8';
    
    // Añadir headers CORS para desarrollo
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.log(`❌ Error leyendo ${filePath}: ${err.message}`);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <html>
                <head><title>404 - No Encontrado</title></head>
                <body>
                    <h1>404 - Archivo No Encontrado</h1>
                    <p>El archivo <strong>${req.url}</strong> no existe.</p>
                    <p><a href="/">Volver al Dashboard</a></p>
                </body>
                </html>
            `);
        } else {
            console.log(`✅ Sirviendo: ${filePath} (${Math.round(content.length/1024)}KB)`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const PORT = 8080;

server.listen(PORT, () => {
    console.log(`📡 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`🔗 Dashboard disponible en: http://localhost:${PORT}/dashboard.html`);
    console.log('');
    console.log('🎯 El script automático ejecutará:');
    console.log('   1. Verificar entorno');
    console.log('   2. Cargar scripts');
    console.log('   3. Navegar a sugerencias');
    console.log('   4. Verificar template');
    console.log('   5. Inicializar handler');
    console.log('   6. Probar botones');
    console.log('   7. Generar reporte');
    console.log('');
    
    // Intentar abrir navegador automáticamente
    const url = `http://localhost:${PORT}/dashboard.html`;
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    console.log('🌐 Abriendo navegador automáticamente...');
    exec(`${start} ${url}`, (error) => {
        if (error) {
            console.log('⚠️  No se pudo abrir el navegador automáticamente');
            console.log(`🔗 Abre manualmente: ${url}`);
        } else {
            console.log('✅ Navegador abierto correctamente');
        }
    });
    
    console.log('');
    console.log('🔬 INSTRUCCIONES DE PRUEBA:');
    console.log('1. El navegador se abrirá automáticamente');
    console.log('2. La prueba automática iniciará en 3 segundos');
    console.log('3. Abre la consola del navegador (F12) para ver resultados');
    console.log('4. Si no funciona automáticamente, ejecuta: ejecutarPruebaCompleta()');
    console.log('5. O usa la solución de emergencia: solucionEmergencia.completa()');
    console.log('');
    console.log('🛑 Para detener el servidor: Ctrl+C');
    
    // Auto-cerrar después de 5 minutos
    setTimeout(() => {
        console.log('');
        console.log('⏰ Cerrando servidor automáticamente después de 5 minutos...');
        server.close(() => {
            console.log('🛑 Servidor cerrado');
            process.exit(0);
        });
    }, 5 * 60 * 1000);
});

server.on('error', (err) => {
    console.error(`❌ Error del servidor: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Puerto ${PORT} en uso. Probando puerto alternativo...`);
        const altPort = PORT + 1;
        server.listen(altPort, () => {
            console.log(`📡 Servidor iniciado en puerto alternativo: http://localhost:${altPort}`);
        });
    }
});

// Manejar cierre limpio
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

console.log('');
console.log('💡 TIP: Si ves errores en la consola del navegador, podrían ser:');
console.log('   - Problema de CORS (normal en desarrollo local)');
console.log('   - Scripts no cargados correctamente');
console.log('   - Error de conexión a Supabase');
console.log('   - Timing issues en la carga de módulos');
console.log('');
