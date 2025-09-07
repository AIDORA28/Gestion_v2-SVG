@echo off
echo ========================================
echo   SISTEMA DE GESTION DE PRESUPUESTO
echo ========================================
echo.
echo Iniciando servidores de desarrollo...
echo.

REM Cambiar al directorio del proyecto
cd /d "d:\VS Code\Gestion_v1-main\Gestion_v2-SVG"

REM Iniciar backend en una nueva ventana
echo [1/2] Iniciando Backend (Puerto 5000)...
start "Backend - Puerto 5000" cmd /k "cd backend && pnpm run dev"

REM Esperar 3 segundos para que el backend se inicie
timeout /t 3 /nobreak >nul

REM Iniciar frontend en nueva ventana con configuración específica
echo [2/2] Iniciando Frontend (Puerto 3000)...
start "Frontend - Puerto 3000" cmd /k "cd frontend && npx live-server --port=3000 --open=home-profesional.html --entry-file=home-profesional.html"

echo.
echo ========================================
echo   SISTEMA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo Backend:   http://localhost:5000
echo Frontend:  http://localhost:3000
echo Página:    http://localhost:3000/home-profesional.html
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
