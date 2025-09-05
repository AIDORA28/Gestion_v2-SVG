# SETUP MÓDULO 1 - BACKEND SUPABASE

Write-Host "🎯 INICIANDO SETUP MÓDULO 1 - BACKEND SUPABASE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# PASO 1: Verificar prerequisitos
Write-Host "⚡ PASO 1: Verificando prerequisitos..." -ForegroundColor Cyan

if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "❌ PowerShell 5.0+ requerido" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ PowerShell OK - Version $($PSVersionTable.PSVersion)" -ForegroundColor Green
}

# PASO 2: Verificar v1 (metodología)
Write-Host "⚡ PASO 2: Verificando estado de v1 (Railway)..." -ForegroundColor Cyan
try {
    $v1Response = Invoke-WebRequest -Uri "https://gestion-presupuesto-production.up.railway.app/" -UseBasicParsing -TimeoutSec 15
    if ($v1Response.StatusCode -eq 200) {
        Write-Host "✅ v1 Railway funcionando (Status: $($v1Response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  v1 Railway responde pero con status: $($v1Response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  v1 Railway no responde - Continuamos con migración" -ForegroundColor Yellow
}

# PASO 3: Verificar estructura de archivos
Write-Host "⚡ PASO 3: Verificando archivos del módulo..." -ForegroundColor Cyan

$projectPath = Get-Location
Write-Host "📁 Directorio actual: $projectPath"

$expectedFiles = @("README.md", "DESARROLLO_ORDEN_BACKEND.md", "METODOLOGIA_MIGRACION.md")
$allFilesExist = $true

foreach ($file in $expectedFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "✅ Estructura de archivos OK" -ForegroundColor Green
} else {
    Write-Host "❌ Algunos archivos faltan" -ForegroundColor Red
}

# PASO 4: Verificar archivos del módulo 1
Write-Host "⚡ PASO 4: Verificando archivos del Módulo 1..." -ForegroundColor Cyan

$modulo1Files = @("SETUP_SUPABASE.md", ".env.example", "test-modulo1.html")
foreach ($file in $modulo1Files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta: $file" -ForegroundColor Red
    }
}

# PASO 5: Test de conectividad
Write-Host "⚡ PASO 5: Verificando acceso a Supabase CDN..." -ForegroundColor Cyan
try {
    $supabaseCDN = Invoke-WebRequest -Uri "https://unpkg.com/@supabase/supabase-js@2.38.0/dist/umd/supabase.min.js" -UseBasicParsing -TimeoutSec 10
    if ($supabaseCDN.StatusCode -eq 200) {
        Write-Host "✅ Supabase CDN disponible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error accediendo Supabase CDN" -ForegroundColor Red
}

# PASO 6: Abrir archivos
Write-Host "⚡ PASO 6: Preparando archivos..." -ForegroundColor Cyan

if (Test-Path "test-modulo1.html") {
    Write-Host "✅ test-modulo1.html listo para usar" -ForegroundColor Green
} else {
    Write-Host "❌ test-modulo1.html no encontrado" -ForegroundColor Red
}

# RESUMEN
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
Write-Host "   - Nombre: gestion-financiera-v2"
Write-Host "   - Región: East US (North Virginia)"
Write-Host "   - Plan: Free tier"
Write-Host ""
Write-Host "3. 🔑 Obtener credenciales:"
Write-Host "   - Settings API Project URL"
Write-Host "   - Settings API anon public key"
Write-Host ""
Write-Host "4. 🧪 Probar configuración:"
Write-Host "   - Abrir test-modulo1.html"
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

Write-Host "🚨 RECORDATORIO DE METODOLOGÍA:" -ForegroundColor Red
Write-Host "✅ Verificamos que v1 funciona ANTES de migrar"
Write-Host "✅ Implementamos SOLO lo necesario para Módulo 1"
Write-Host "✅ Probamos cada paso antes de continuar"
Write-Host ""

Write-Host "✅ SETUP MÓDULO 1 COMPLETADO - REVISAR TAREAS MANUALES" -ForegroundColor Green
