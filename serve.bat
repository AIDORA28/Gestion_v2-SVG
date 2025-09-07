@echo off
echo Iniciando sistema de gestión de presupuesto...
echo.

REM Cambiar al directorio del proyecto
cd /d "d:\VS Code\Gestion_v1-main\Gestion_v2-SVG"

REM Crear un script temporal para iniciar ambos servidores
echo @echo off > temp_start.bat
echo echo Backend iniciando en puerto 5000... >> temp_start.bat
echo cd backend >> temp_start.bat
echo start "Backend" cmd /k "pnpm run dev" >> temp_start.bat
echo timeout /t 2 /nobreak ^>nul >> temp_start.bat
echo echo Frontend iniciando en puerto 3000... >> temp_start.bat
echo cd ../frontend >> temp_start.bat
echo npx live-server --port=3000 --open=home-profesional.html --entry-file=home-profesional.html >> temp_start.bat

call temp_start.bat
del temp_start.bat
