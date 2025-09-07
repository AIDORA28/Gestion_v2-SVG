@echo off
echo 🚀 INICIANDO SISTEMA GESTIÓN PRESUPUESTO
echo.
echo 📡 Iniciando Backend (Puerto 5000)...
cd backend
start "Backend API" cmd /k "pnpm run dev"
cd ..

echo 🌐 Iniciando Frontend (Puerto 3000)...
cd frontend
start "Frontend" cmd /k "npx live-server --port=3000 --open=home-profesional.html"
cd ..

echo.
echo ✅ Sistema iniciado:
echo    - Backend:  http://localhost:5000
echo    - Frontend: http://localhost:3000
echo.
pause
