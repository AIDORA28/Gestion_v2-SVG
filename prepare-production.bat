@echo off
echo.
echo 🌐 ===================================
echo    PREPARANDO PARA PRODUCCIÓN
echo 🌐 ===================================
echo.
echo 🔧 Entorno: PRODUCCIÓN
echo 🗄️ Base de datos: Supabase
echo 🌐 Deploy: Vercel
echo 📤 Repository: GitHub
echo.

echo 📋 Checklist de deploy:
echo ✅ Código funcionando localmente
echo ✅ Configuración dual implementada
echo ✅ Variables de entorno configuradas
echo.

echo 🚀 Pasos para deploy:
echo.
echo 1. Crear proyecto Supabase:
echo    - Ir a https://supabase.com
echo    - Create new project
echo    - Ejecutar SQL de configuración
echo.
echo 2. Configurar Vercel:
echo    - Ir a https://vercel.com
echo    - Import repository
echo    - Agregar variables de entorno
echo.
echo 3. Variables a configurar en Vercel:
echo    - SUPABASE_URL
echo    - SUPABASE_ANON_KEY
echo    - NODE_ENV=production
echo.

set /p continuar="¿Deseas subir cambios a GitHub ahora? (y/n): "
if /i "%continuar%"=="y" (
    echo.
    echo 📤 Subiendo cambios a GitHub...
    git add .
    git commit -m "🔧 Configuración dual de entornos implementada"
    git push origin master
    echo.
    echo ✅ Cambios subidos a GitHub
    echo 🌐 Ahora puedes hacer deploy en Vercel
) else (
    echo.
    echo ℹ️ Recuerda subir los cambios cuando estés listo:
    echo    git add .
    echo    git commit -m "Tu mensaje"
    echo    git push origin master
)

echo.
echo 📖 Consulta DEPLOY_GUIA.md para instrucciones detalladas
echo.
pause
