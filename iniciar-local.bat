@echo off
cls
echo.
echo ================================================================
echo             🚀 PLANIFICAPRO - SERVIDOR LOCAL
echo ================================================================
echo.
echo 📍 Iniciando servidor en http://localhost:3001
echo 🗄️  Conectando a Supabase...
echo.
echo ================================================================
echo.

cd /d "%~dp0"
node server-local.js

pause
