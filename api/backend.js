/**
 * 🚀 VERCEL FUNCTION - API PROXY
 * Redirige todas las requests del API a nuestro servidor backend
 */

// Importar el servidor Express desde backend
const app = require('../backend/server.js');

// Exportar el handler para Vercel Functions
module.exports = app;
