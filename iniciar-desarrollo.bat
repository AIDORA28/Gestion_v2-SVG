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

REM Iniciar frontend en nueva ventana
echo [2/2] Iniciando Frontend (Puerto 3000)...
start "Frontend - Puerto 3000" cmd /k "cd frontend && pnpm run dev"

echo.
echo ========================================
echo   SISTEMA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo Backend:   http://localhost:5000/health
echo Frontend:  http://localhost:3000
echo Landing:   http://localhost:3000/landing.html
echo Test:      http://localhost:3000/login-test.html
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
