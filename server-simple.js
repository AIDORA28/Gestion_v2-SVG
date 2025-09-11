// Servidor simple para testing del dashboard
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`📥 ${req.method} ${req.url}`);
    
    // Parse URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './dashboard.html';
    }
    
    // Security: prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(__dirname, 'public', safePath);
    
    console.log(`📂 Serving: ${fullPath}`);
    
    // Get file extension
    const extname = String(path.extname(safePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';
    
    // Try to read file
    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                console.log(`❌ 404: ${fullPath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body style="font-family: Arial, sans-serif; padding: 20px;">
                            <h1>404 - Archivo No Encontrado</h1>
                            <p>El archivo <code>${req.url}</code> no existe.</p>
                            <p><a href="/dashboard.html">← Volver al Dashboard</a></p>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                console.log(`❌ 500: ${error.code}`);
                res.writeHead(500);
                res.end(`Error del servidor: ${error.code}`);
            }
        } else {
            // Success
            console.log(`✅ 200: ${mimeType}`);
            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('🚀 SERVIDOR DE DESARROLLO INICIADO');
    console.log('==================================');
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log('');
    console.log('📱 URLs Disponibles:');
    console.log(`   🏠 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`   🔐 Login: http://localhost:${PORT}/login.html`);
    console.log(`   🎯 Landing: http://localhost:${PORT}/landing.html`);
    console.log('');
    console.log('💡 Presiona Ctrl+C para detener el servidor');
    console.log('==================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 DETENIENDO SERVIDOR...');
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
});

// Error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`❌ Error: El puerto ${PORT} ya está en uso`);
        console.log('💡 Prueba con otro puerto o detén el proceso que lo está usando');
    } else {
        console.log(`❌ Error del servidor: ${error.message}`);
    }
});
