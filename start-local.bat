@echo off
echo.
echo 🏠 ===================================
echo    INICIANDO ENTORNO LOCAL
echo 🏠 ===================================
echo.
echo 🔧 Entorno: DESARROLLO LOCAL
echo 🗄️ Base de datos: PostgreSQL (Laragon)
echo 🌐 Frontend: http://localhost:3000
echo 📡 Backend: http://localhost:5000
echo.

REM Copiar archivo de entorno local
copy .env.local .env

REM Instalar dependencias si es necesario
if not exist node_modules (
    echo 📦 Instalando dependencias...
    pnpm install
)

if not exist backend\node_modules (
    echo 📦 Instalando dependencias del backend...
    cd backend && pnpm install && cd ..
)

if not exist frontend\node_modules (
    echo 📦 Instalando dependencias del frontend...
    cd frontend && pnpm install && cd ..
)

echo.
echo ✅ Iniciando servidores de desarrollo...
echo.

REM Iniciar desarrollo
pnpm run dev

pause
