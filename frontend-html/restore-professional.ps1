# Script de restauración para PowerShell - Gestion_v2-SVG
# Ejecutar si VS Code recupera archivos eliminados

Write-Host "🔧 RESTAURANDO SISTEMA PROFESIONAL..." -ForegroundColor Cyan

# Eliminar archivos de prueba que VS Code podría haber recuperado
Write-Host "🗑️ Eliminando archivos de prueba recuperados..." -ForegroundColor Yellow

$filesToRemove = @(
    "test-conexion-supabase.html",
    "test-conexion-completo.html", 
    "test-modulo-ingresos.html",
    "test-modulo-gastos.html",
    "test-modulo-reportes.html",
    "test-sistema.html",
    "dashboard_backup.html",
    "login-clean.html",
    "redirect.html",
    "sistema-modular.html",
    "diagnostico-completo.ps1",
    "diagnostico-supabase.ps1",
    "script-diagnostico.js",
    "script-conexion.js"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ❌ Eliminado: $file" -ForegroundColor Red
    }
}

# Verificar archivos profesionales críticos
Write-Host "✅ Verificando archivos profesionales..." -ForegroundColor Green

$criticalFiles = @(
    "template-base.html",
    "css/financial-professional.css",
    "js/notifications.js", 
    "js/charts.js",
    "home-profesional.html",
    "BACKUP_PROFESIONAL.md"
)

$allPresent = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ Presente: $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FALTANTE: $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if ($allPresent) {
    Write-Host "🎉 Sistema profesional íntegro y listo" -ForegroundColor Green
} else {
    Write-Host "⚠️ ADVERTENCIA: Algunos archivos profesionales faltan" -ForegroundColor Yellow
}

Write-Host "📖 Consulta BACKUP_PROFESIONAL.md para más detalles" -ForegroundColor Cyan

# Mostrar resumen del progreso
Write-Host "`n📊 RESUMEN DEL PROGRESO:" -ForegroundColor Magenta
Write-Host "  - Stack profesional: Tailwind + Chart.js + Notyf + Lucide + Flatpickr" -ForegroundColor White
Write-Host "  - Backend: Supabase (https://trlbsfktusefvpheoudn.supabase.co)" -ForegroundColor White  
Write-Host "  - Template base profesional creado" -ForegroundColor White
Write-Host "  - Sistemas de notificaciones y gráficos implementados" -ForegroundColor White
Write-Host "  - Landing page profesional funcional" -ForegroundColor White
