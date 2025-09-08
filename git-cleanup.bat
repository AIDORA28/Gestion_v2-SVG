@echo off
echo ================================================
echo     GIT CLEANUP Y ROLLBACK TOOL
echo     Gestion_v2-SVG - PLANIFICAPRO
echo ================================================
echo.

echo [1] Limpiar archivos no trackeados (git clean)
echo [2] Descartar cambios locales (git checkout .)
echo [3] Reset completo al último commit (git reset --hard)
echo [4] Reset al commit anterior (git reset --hard HEAD~1)
echo [5] Volver al estado remoto (git reset --hard origin/master)
echo [6] Mostrar status actual
echo [7] Mostrar historial de commits
echo [0] Salir
echo.

set /p choice="Selecciona una opcion (0-7): "

if "%choice%"=="1" (
    echo Limpiando archivos no trackeados...
    git clean -fd
    echo Archivos no trackeados eliminados.
) else if "%choice%"=="2" (
    echo Descartando cambios locales...
    git checkout .
    echo Cambios locales descartados.
) else if "%choice%"=="3" (
    echo CUIDADO: Esto eliminará TODOS los cambios locales no commiteados.
    set /p confirm="¿Estás seguro? (s/N): "
    if /i "%confirm%"=="s" (
        git reset --hard HEAD
        echo Reset completo realizado.
    ) else (
        echo Operación cancelada.
    )
) else if "%choice%"=="4" (
    echo CUIDADO: Esto volverá al commit anterior.
    set /p confirm="¿Estás seguro? (s/N): "
    if /i "%confirm%"=="s" (
        git reset --hard HEAD~1
        echo Reset al commit anterior realizado.
    ) else (
        echo Operación cancelada.
    )
) else if "%choice%"=="5" (
    echo CUIDADO: Esto sincronizará con el estado remoto.
    set /p confirm="¿Estás seguro? (s/N): "
    if /i "%confirm%"=="s" (
        git fetch origin
        git reset --hard origin/master
        echo Reset al estado remoto realizado.
    ) else (
        echo Operación cancelada.
    )
) else if "%choice%"=="6" (
    echo Estado actual del repositorio:
    git status
) else if "%choice%"=="7" (
    echo Historial de commits:
    git log --oneline -10
) else if "%choice%"=="0" (
    echo Saliendo...
    exit
) else (
    echo Opción inválida.
)

echo.
pause
