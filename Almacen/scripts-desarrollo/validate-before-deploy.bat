@echo off
REM 🚀 VALIDACIÓN RÁPIDA ANTES DE VERCEL DEPLOY (Windows)
REM Uso: validate-before-deploy.bat

echo.
echo 🧪 ========================================
echo 🔍 VALIDACIÓN RÁPIDA VERCEL
echo 🧪 ========================================

REM 1. Verificar archivos críticos
echo.
echo 📋 1. ARCHIVOS CRÍTICOS:

if exist "vercel.json" (
    echo ✅ vercel.json
) else (
    echo ❌ vercel.json - FALTA
    exit /b 1
)

if exist "package.json" (
    echo ✅ package.json
) else (
    echo ❌ package.json - FALTA
    exit /b 1
)

if exist "api\backend.js" (
    echo ✅ api\backend.js
) else (
    echo ❌ api\backend.js - FALTA
    exit /b 1
)

if exist "public\landing.html" (
    echo ✅ public\landing.html
) else (
    echo ❌ public\landing.html - FALTA
    exit /b 1
)

REM 2. Validar JSON syntax
echo.
echo 🔧 2. SINTAXIS JSON:

node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ vercel.json válido
) else (
    echo ❌ vercel.json inválido
    exit /b 1
)

node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ package.json válido
) else (
    echo ❌ package.json inválido
    exit /b 1
)

REM 3. Probar función backend
echo.
echo 🔌 3. FUNCIÓN BACKEND:

node test-vercel-config.js >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend function OK
) else (
    echo ❌ Backend function ERROR
    exit /b 1
)

REM 4. Verificar servidor local (opcional)
echo.
echo 🌐 4. SERVIDOR LOCAL:

curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Servidor local corriendo
) else (
    echo ⚠️  Servidor local no detectado ^(opcional^)
)

echo.
echo 🎯 ========================================
echo ✅ VALIDACIÓN COMPLETA - LISTO PARA DEPLOY
echo 🚀 Puedes hacer deploy a Vercel con confianza
echo 🎯 ========================================

pause
