# 🔍 SCRIPT POWERSHELL PARA INSPECCIÓN SUPABASE
# Inspecciona directamente la base de datos usando REST API

$SUPABASE_URL = "https://lobyofpwqwqwqsszugdwnw.supabase.co"
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYnlvZnB3cXdxc3N6dWdkd253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTU4NDIsImV4cCI6MjA3Mjg5MTg0Mn0.QsZ2dIU1iPffRGtHUREQIhQ5--7_w4ANowG0rJ0AtcI"

Write-Host "🔍 INSPECCIÓN COMPLETA DE SUPABASE" -ForegroundColor Cyan
Write-Host "====================================="
Write-Host "URL: $SUPABASE_URL"
Write-Host "====================================="

# Headers para las requests
$headers = @{
    "apikey" = $SUPABASE_ANON_KEY
    "Authorization" = "Bearer $SUPABASE_ANON_KEY"
    "Content-Type" = "application/json"
}

# Lista de tablas a verificar
$expectedTables = @('usuarios', 'ingresos', 'gastos', 'perfiles_usuario', 'simulaciones_credito')

Write-Host "`n📊 INSPECCIONANDO TABLAS PRINCIPALES...`n" -ForegroundColor Yellow

foreach ($tableName in $expectedTables) {
    Write-Host "🔍 Inspeccionando tabla: $tableName" -ForegroundColor White
    
    try {
        # Intentar hacer un HEAD request para verificar existencia y contar registros
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$tableName" -Method Get -Headers $headers -TimeoutSec 10
        
        if ($response) {
            $count = $response.Count
            Write-Host "  ✅ $tableName`: EXISTE ($count registros)" -ForegroundColor Green
            
            # Si hay registros, mostrar estructura
            if ($response.Count -gt 0) {
                $firstRecord = $response[0]
                $columns = $firstRecord.PSObject.Properties.Name
                Write-Host "     Columnas: $($columns -join ', ')" -ForegroundColor Gray
                
                # Mostrar tipos de datos
                Write-Host "     Estructura:" -ForegroundColor Gray
                foreach ($column in $columns) {
                    $value = $firstRecord.$column
                    $type = if ($value -eq $null) { "null" } else { $value.GetType().Name }
                    Write-Host "       - $column`: $type" -ForegroundColor DarkGray
                }
            } else {
                Write-Host "     Tabla vacía" -ForegroundColor Gray
            }
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*404*" -or $errorMessage -like "*Not Found*") {
            Write-Host "  ❌ $tableName`: NO EXISTE" -ForegroundColor Red
        } else {
            Write-Host "  ❌ $tableName`: ERROR - $errorMessage" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "👤 INFORMACIÓN DETALLADA DE USUARIOS:" -ForegroundColor Cyan
Write-Host "======================================"

try {
    $usuarios = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/usuarios?limit=3" -Method Get -Headers $headers
    
    if ($usuarios) {
        Write-Host "✅ Usuarios encontrados: $($usuarios.Count)" -ForegroundColor Green
        
        if ($usuarios.Count -gt 0) {
            Write-Host "`n📄 Estructura completa de usuario:" -ForegroundColor Yellow
            $firstUser = $usuarios[0]
            $userColumns = $firstUser.PSObject.Properties.Name
            
            foreach ($column in $userColumns) {
                $value = $firstUser.$column
                $type = if ($value -eq $null) { "null" } else { $value.GetType().Name }
                $sample = if ($value -eq $null) { "null" } elseif ($value.ToString().Length -gt 50) { $value.ToString().Substring(0, 50) + "..." } else { $value.ToString() }
                Write-Host "   - $column`: $type = $sample" -ForegroundColor White
            }
            
            Write-Host "`n📄 Ejemplo completo:" -ForegroundColor Yellow
            $usuarios[0] | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor DarkGray
        }
    }
}
catch {
    Write-Host "❌ Error obteniendo usuarios: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 INSPECCIÓN COMPLETADA" -ForegroundColor Green
