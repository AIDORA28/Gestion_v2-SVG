const express = require('express');
const path = require('path');
const app = express();
const port = 3000

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

// RUTA RAÍZ - SIEMPRE VA A LANDING.HTML 
app.get('/', (req, res) => {
    console.log('🏠 Sirviendo landing.html');
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// Rutas específicas redirigen al landing
app.get('/home', (req, res) => {
    console.log('🏠 Redirigiendo /home a landing');
    res.redirect('/');
});

app.get('/index', (req, res) => {
    console.log('🏠 Redirigiendo /index a landing');
    res.redirect('/');
});

app.get('/index.html', (req, res) => {
    console.log('🏠 Redirigiendo /index.html a landing');
    res.redirect('/');
});

// Ruta específica para landing
app.get('/landing.html', (req, res) => {
    console.log('🏠 Sirviendo landing.html directamente');
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// Para archivos HTML en backup-referencias
app.get('/backup-referencias/*.html', (req, res) => {
    const fileName = path.basename(req.path);
    const filePath = path.join(__dirname, 'backup-referencias', fileName);
    console.log(`� Sirviendo desde backup: ${fileName}`);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log(`❌ Archivo no encontrado en backup: ${fileName}, redirigiendo a landing`);
            res.redirect('/');
        }
    });
});

// Rutas específicas para nuestras páginas
app.get('/login.html', (req, res) => {
    console.log('🔐 Sirviendo login.html');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
    console.log('📝 Sirviendo register.html');
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Para cualquier otro archivo .html, redirigir a landing
app.get('*.html', (req, res) => {
    const fileName = path.basename(req.path);
    console.log(`📄 Archivo HTML solicitado: ${fileName} - Redirigiendo a landing`);
    res.redirect('/');
});

// Para rutas que no son HTML, redirigir a landing
app.get('*', (req, res) => {
    console.log(`❓ Ruta desconocida: ${req.path}, redirigiendo a landing`);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`\n🌐 ===================================`);
    console.log(`   FRONTEND - GESTIÓN PRESUPUESTO`);
    console.log(`🌐 ===================================`);
    console.log(`📱 Servidor: http://localhost:${port}`);
    console.log(`🏠 Página Principal: http://localhost:${port} (landing.html)`);
    console.log(`📂 Landing directo: http://localhost:${port}/landing.html`);
    console.log(`� Referencias: http://localhost:${port}/backup-referencias/`);
    console.log(`📂 Directorio: ${__dirname}`);
    console.log(`🌐 ===================================\n`);
});
