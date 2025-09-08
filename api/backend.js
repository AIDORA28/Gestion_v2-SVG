// Proxy para redirigir todas las requests del API a nuestro servidor backend
const path = require('path');

// Requerir el servidor desde la carpeta backend
const server = require('../backend/server.js');

// Exportar el handler para Vercel Functions
module.exports = server;
