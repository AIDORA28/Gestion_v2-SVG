#!/bin/bash
# 🚀 VERCEL BUILD SCRIPT
# Este script se ejecuta automáticamente en Vercel

echo "🚀 Iniciando deployment de PLANIFICAPRO..."
echo "📁 Directorio público: public/"
echo "🌐 Archivos estáticos listos para servir"
echo "✅ No se requiere build - archivos listos"

# Verificar archivos críticos
if [ -f "public/dashboard.html" ]; then
    echo "✅ dashboard.html encontrado"
else
    echo "❌ ERROR: dashboard.html no encontrado"
    exit 1
fi

if [ -f "public/login.html" ]; then
    echo "✅ login.html encontrado"
else
    echo "❌ ERROR: login.html no encontrado"
    exit 1
fi

if [ -f "public/js/dashboard-handler.js" ]; then
    echo "✅ dashboard-handler.js encontrado"
else
    echo "❌ ERROR: dashboard-handler.js no encontrado"
    exit 1
fi

echo "🎉 Build completado exitosamente"
echo "🌍 Ready for deployment!"
