# 🚀 SETUP AUTOMÁTICO - MÓDULO 1 BACKEND

# Script de automatización para configuración inicial de Supabase
# Ejecutar en PowerShell como administrador

Write-Host "🎯 INICIANDO SETUP MÓDULO 1 - BACKEND SUPABASE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Función para log con colores
function Write-Step {
    param($message, $color = "White")
    Write-Host "⚡ $message" -ForegroundColor $color
}

# Función para log de éxito
function Write-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# Función para log de error
function Write-Error-Custom {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
}

# Función para log de warning
function Write-Warning-Custom {
    param($message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

# PASO 1: Verificar prerequisitos
Write-Step "PASO 1: Verificando prerequisitos..." "Cyan"

# Verificar PowerShell
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Error-Custom "PowerShell 5.0+ requerido"
    exit 1
} else {
    Write-Success "PowerShell OK - Version $($PSVersionTable.PSVersion)"
}

# Verificar conexión a internet
Write-Step "Verificando conexión a internet..."
try {
    $response = Invoke-WebRequest -Uri "https://google.com" -UseBasicParsing -TimeoutSec 10
    Write-Success "Conexión a internet OK"
} catch {
    Write-Error-Custom "No hay conexión a internet"
    exit 1
}

# PASO 2: Verificar que v1 funciona (metodología)
Write-Step "PASO 2: Verificando estado de v1 (Railway)..." "Cyan"
try {
    $v1Response = Invoke-WebRequest -Uri "https://gestion-presupuesto-production.up.railway.app/" -UseBasicParsing -TimeoutSec 15
    if ($v1Response.StatusCode -eq 200) {
        Write-Success "v1 Railway funcionando ✅ (Status: $($v1Response.StatusCode))"
    } else {
        Write-Warning-Custom "v1 Railway responde pero con status: $($v1Response.StatusCode)"
    }
} catch {
    Write-Warning-Custom "v1 Railway no responde - Continuamos con migración"
}

# PASO 3: Crear estructura de archivos
Write-Step "PASO 3: Creando estructura de archivos..." "Cyan"

$projectPath = Get-Location
Write-Host "📁 Directorio actual: $projectPath"

# Verificar que estamos en el directorio correcto
$expectedFiles = @("README.md", "DESARROLLO_ORDEN_BACKEND.md", "METODOLOGIA_MIGRACION.md")
$missingFiles = @()

foreach ($file in $expectedFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error-Custom "Archivos faltantes: $($missingFiles -join ', ')"
    Write-Host "🔍 Archivos en directorio actual:"
    Get-ChildItem -Name | ForEach-Object { Write-Host "   - $_" }
    Write-Host ""
    Write-Host "💡 Asegúrate de estar en: Gestion_v2-SVG\"
    exit 1
} else {
    Write-Success "Estructura de archivos OK"
}

# PASO 4: Verificar archivos del módulo 1
Write-Step "PASO 4: Verificando archivos del Módulo 1..." "Cyan"

$modulo1Files = @{
    "SETUP_SUPABASE.md" = "Documentación de setup"
    ".env.example" = "Ejemplo de credenciales"
    "test-modulo1.html" = "Test de funcionalidad"
}

foreach ($file in $modulo1Files.Keys) {
    if (Test-Path $file) {
        Write-Success "$file - $($modulo1Files[$file])"
    } else {
        Write-Error-Custom "Falta: $file - $($modulo1Files[$file])"
    }
}

# PASO 5: Test de Supabase CDN
Write-Step "PASO 5: Verificando acceso a Supabase CDN..." "Cyan"
try {
    $supabaseCDN = Invoke-WebRequest -Uri "https://unpkg.com/@supabase/supabase-js@2.38.0/dist/umd/supabase.min.js" -UseBasicParsing -TimeoutSec 10
    if ($supabaseCDN.StatusCode -eq 200) {
        Write-Success "Supabase CDN disponible"
    }
} catch {
    Write-Error-Custom "Error accediendo Supabase CDN: $($_.Exception.Message)"
}

# PASO 6: Abrir test de módulo 1
Write-Step "PASO 6: Abriendo test de Módulo 1..." "Cyan"

if (Test-Path "test-modulo1.html") {
    try {
        if (Get-Command "code" -ErrorAction SilentlyContinue) {
            Write-Step "Abriendo en VS Code..."
            Start-Process "code" -ArgumentList "test-modulo1.html"
        }
        
        Write-Step "Abriendo en navegador..."
        Start-Process "test-modulo1.html"
        Write-Success "Test HTML abierto"
        
    } catch {
        Write-Warning-Custom "No se pudo abrir automáticamente"
        Write-Host "📖 Abre manualmente: test-modulo1.html"
    }
} else {
    Write-Error-Custom "test-modulo1.html no encontrado"
}

# PASO 7: Mostrar siguientes pasos
Write-Step "PASO 7: Siguientes pasos..." "Cyan"

Write-Host ""
Write-Host "🎯 MÓDULO 1 SETUP COMPLETADO" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 TAREAS MANUALES REQUERIDAS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🌐 Crear proyecto en Supabase:"
Write-Host "   https://supabase.com/dashboard"
Write-Host ""
Write-Host "2. 🔧 Configurar proyecto:"
Write-Host "   - Nombre: 'gestion-financiera-v2'"
Write-Host "   - Región: 'East US (North Virginia)'"
Write-Host "   - Plan: Free tier"
Write-Host ""
Write-Host "3. 🔑 Obtener credenciales:"
Write-Host "   - Settings API Project URL"
Write-Host "   - Settings API anon public key"
Write-Host ""
Write-Host "4. 🧪 Probar configuración:"
Write-Host "   - Usar test-modulo1.html"
Write-Host "   - Completar todos los tests"
Write-Host ""
Write-Host "5. 📝 Crear archivo .env:"
Write-Host "   - Copiar .env.example como .env"
Write-Host "   - Completar con credenciales reales"
Write-Host ""

Write-Host "⏱️  TIEMPO ESTIMADO: 45 minutos" -ForegroundColor Magenta
Write-Host ""

Write-Host "🎯 SIGUIENTE:" -ForegroundColor Green
Write-Host "   Módulo 2: Base de Datos y Tablas"
Write-Host "   (Después de completar Módulo 1)"
Write-Host ""

# PASO 8: Verificar que el usuario leyó la metodología
Write-Host "🚨 RECORDATORIO DE METODOLOGÍA:" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host ""
Write-Host "✅ Verificamos que v1 funciona ANTES de migrar"
Write-Host "✅ Implementamos SOLO lo necesario para Módulo 1"
Write-Host "✅ Probamos cada paso antes de continuar"
Write-Host "✅ Documentamos todo para siguientes módulos"
Write-Host ""
Write-Host "❌ NO asumimos que algo funciona sin probar"
Write-Host "❌ NO copiamos código sin verificar"
Write-Host "❌ NO complicamos innecesariamente"
Write-Host ""

Write-Success "SETUP MÓDULO 1 COMPLETADO - REVISAR TAREAS MANUALES"

# Pausa para que el usuario lea
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
Read-Host
