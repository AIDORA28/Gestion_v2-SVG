const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

// Tipos MIME
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Redirigir root al dashboard
    if (pathname === '/') {
        pathname = '/dashboard.html';
    }
    
    const filePath = path.join(__dirname, 'public', pathname);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('<h1>404 - Archivo no encontrado</h1>');
            } else {
                res.writeHead(500);
                res.end('Error del servidor');
            }
        } else {
            res.writeHead(200, {'Content-Type': mimeType});
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log('🚀 === SERVIDOR DE PRUEBA REPORTES ===');
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔗 URL directa: http://localhost:${PORT}/dashboard.html`);
    console.log('📝 Funcionalidades disponibles:');
    console.log('   ✅ Módulo de Reportes');
    console.log('   ✅ Integración con Supabase');
    console.log('   ✅ Gráficos interactivos');
    console.log('   ✅ Exportación PDF/Excel');
    console.log('');
    console.log('🎯 Para probar el módulo de reportes:');
    console.log('   1. Abre el navegador en la URL de arriba');
    console.log('   2. Inicia sesión con: joegarcia.1395@gmail.com / 123456');
    console.log('   3. Navega a la sección "Reportes"');
    console.log('');
    console.log('⏹️ Para detener el servidor: Ctrl+C');
});
