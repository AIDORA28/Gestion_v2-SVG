#!/usr/bin/env node
// 🧪 SIMULADOR COMPLETO DE ENTORNO VERCEL LOCAL
// Simula exactamente como Vercel manejará las rutas

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// 🌐 Simulador de entorno Vercel
class VercelSimulator {
    constructor() {
        this.config = this.loadVercelConfig();
        this.routes = this.parseRoutes();
        this.staticFiles = this.loadStaticFiles();
    }

    loadVercelConfig() {
        try {
            const configPath = path.join(process.cwd(), 'vercel.json');
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log('✅ Configuración Vercel cargada');
            return config;
        } catch (error) {
            console.error('❌ Error cargando vercel.json:', error.message);
            return null;
        }
    }

    parseRoutes() {
        if (!this.config || !this.config.routes) return [];
        
        console.log('\n📋 RUTAS CONFIGURADAS:');
        this.config.routes.forEach((route, index) => {
            console.log(`${index + 1}. ${route.src} → ${route.dest || route.use}`);
        });
        
        return this.config.routes;
    }

    loadStaticFiles() {
        const publicDir = path.join(process.cwd(), 'public');
        const files = new Set();
        
        if (fs.existsSync(publicDir)) {
            this.scanDirectory(publicDir, files, '');
        }
        
        console.log(`\n📁 Archivos estáticos encontrados: ${files.size}`);
        return files;
    }

    scanDirectory(dir, files, relativePath) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        entries.forEach(entry => {
            const fullPath = path.join(dir, entry.name);
            const relativeFilePath = path.join(relativePath, entry.name).replace(/\\/g, '/');
            
            if (entry.isDirectory()) {
                this.scanDirectory(fullPath, files, relativeFilePath);
            } else {
                files.add('/' + relativeFilePath);
            }
        });
    }

    // 🔍 Simular manejo de request
    simulateRequest(pathname) {
        console.log(`\n🔄 SIMULANDO REQUEST: ${pathname}`);
        
        // 1. Verificar archivos estáticos exactos
        if (this.staticFiles.has(pathname)) {
            console.log(`✅ ESTÁTICO DIRECTO: ${pathname}`);
            return { type: 'static', file: pathname };
        }

        // 2. Verificar rutas configuradas
        for (const route of this.routes) {
            const regex = new RegExp(route.src);
            if (regex.test(pathname)) {
                console.log(`✅ RUTA MATCH: ${route.src} → ${route.dest || route.use}`);
                
                if (route.dest) {
                    // Verificar si es una función API
                    if (route.dest.includes('/api/')) {
                        return { type: 'function', function: route.dest };
                    }
                    return { type: 'redirect', dest: route.dest };
                } else if (route.use) {
                    return { type: 'function', function: route.use };
                }
            }
        }

        // 3. Fallback por defecto
        console.log(`⚠️  SIN MATCH: ${pathname} → /landing.html (fallback)`);
        return { type: 'fallback', file: '/landing.html' };
    }

    // 🧪 Probar URLs críticos
    testCriticalPaths() {
        console.log('\n🧪 PROBANDO RUTAS CRÍTICAS:');
        console.log('=' + '='.repeat(50));

        const testPaths = [
            '/',                    // Landing
            '/login.html',         // Login page
            '/dashboard.html',     // Dashboard
            '/api/health',         // Health check
            '/api/login',          // Login API
            '/api/usuarios',       // Users API
            '/css/global.css',     // CSS file
            '/js/supabase-auth.js', // JS file
            '/nonexistent.html'    // 404 test
        ];

        const results = {};
        
        testPaths.forEach(testPath => {
            const result = this.simulateRequest(testPath);
            results[testPath] = result;
        });

        return results;
    }

    // 📊 Generar reporte completo
    generateReport() {
        console.log('\n📊 REPORTE VERCEL SIMULATOR');
        console.log('=' + '='.repeat(50));
        
        const results = this.testCriticalPaths();
        
        console.log('\n✅ RESUMEN DE RESULTADOS:');
        
        let staticCount = 0, functionCount = 0, redirectCount = 0, fallbackCount = 0;
        
        Object.entries(results).forEach(([path, result]) => {
            switch (result.type) {
                case 'static': staticCount++; break;
                case 'function': functionCount++; break;
                case 'redirect': redirectCount++; break;
                case 'fallback': fallbackCount++; break;
            }
        });
        
        console.log(`📄 Archivos estáticos: ${staticCount}`);
        console.log(`⚙️  Funciones serverless: ${functionCount}`);
        console.log(`🔄 Redirects: ${redirectCount}`);
        console.log(`🔀 Fallbacks: ${fallbackCount}`);
        
        // Verificar problemas potenciales
        console.log('\n🔍 ANÁLISIS DE PROBLEMAS:');
        
        if (functionCount === 0) {
            console.log('⚠️  No hay funciones serverless configuradas');
        }
        
        if (fallbackCount > 2) {
            console.log('⚠️  Muchos fallbacks - revisar configuración de rutas');
        }
        
        if (!this.staticFiles.has('/landing.html')) {
            console.log('❌ CRÍTICO: /landing.html no existe');
        }
        
        if (!fs.existsSync('api/backend.js')) {
            console.log('❌ CRÍTICO: api/backend.js no existe');
        }
        
        console.log('\n🎯 READY FOR DEPLOY?');
        const readyForDeploy = 
            this.staticFiles.has('/landing.html') && 
            fs.existsSync('api/backend.js') && 
            functionCount > 0;
            
        if (readyForDeploy) {
            console.log('✅ SÍ - CONFIGURACIÓN VÁLIDA PARA DEPLOY');
        } else {
            console.log('❌ NO - REVISAR PROBLEMAS ARRIBA');
        }
        
        return readyForDeploy;
    }
}

// 🚀 Ejecutar simulación
console.log('🚀 VERCEL ENVIRONMENT SIMULATOR');
console.log('=' + '='.repeat(50));

const simulator = new VercelSimulator();
const isReady = simulator.generateReport();

process.exit(isReady ? 0 : 1);
