#!/bin/bash
# 🚀 VALIDACIÓN RÁPIDA ANTES DE VERCEL DEPLOY
# Uso: ./validate-before-deploy.sh

echo "🧪 ========================================"
echo "🔍 VALIDACIÓN RÁPIDA VERCEL"
echo "🧪 ========================================"

# 1. Verificar archivos críticos
echo -e "\n📋 1. ARCHIVOS CRÍTICOS:"
files=("vercel.json" "package.json" "api/backend.js" "public/landing.html")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTA"
        exit 1
    fi
done

# 2. Validar JSON syntax
echo -e "\n🔧 2. SINTAXIS JSON:"
if node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))" 2>/dev/null; then
    echo "✅ vercel.json válido"
else
    echo "❌ vercel.json inválido"
    exit 1
fi

if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    echo "✅ package.json válido"
else
    echo "❌ package.json inválido"
    exit 1
fi

# 3. Probar función backend
echo -e "\n🔌 3. FUNCIÓN BACKEND:"
if node test-vercel-config.js > /dev/null 2>&1; then
    echo "✅ Backend function OK"
else
    echo "❌ Backend function ERROR"
    exit 1
fi

# 4. Verificar servidor local
echo -e "\n🌐 4. SERVIDOR LOCAL:"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Servidor local corriendo"
else
    echo "⚠️  Servidor local no detectado (opcional)"
fi

echo -e "\n🎯 ========================================"
echo "✅ VALIDACIÓN COMPLETA - LISTO PARA DEPLOY"
echo "🚀 Puedes hacer deploy a Vercel con confianza"
echo "🎯 ========================================"
