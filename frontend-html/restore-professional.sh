#!/bin/bash
# Script de restauración profesional - Gestion_v2-SVG
# Ejecutar si VS Code recupera archivos eliminados

echo "🔧 RESTAURANDO SISTEMA PROFESIONAL..."

# Eliminar archivos de prueba que VS Code podría haber recuperado
echo "🗑️ Eliminando archivos de prueba recuperados..."
files_to_remove=(
    "test-conexion-supabase.html"
    "test-conexion-completo.html" 
    "test-modulo-ingresos.html"
    "test-modulo-gastos.html"
    "test-modulo-reportes.html"
    "test-sistema.html"
    "dashboard_backup.html"
    "login-clean.html"
    "redirect.html"
    "sistema-modular.html"
    "diagnostico-completo.ps1"
    "diagnostico-supabase.ps1"
    "script-diagnostico.js"
    "script-conexion.js"
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ❌ Eliminado: $file"
    fi
done

# Verificar archivos profesionales críticos
echo "✅ Verificando archivos profesionales..."
critical_files=(
    "template-base.html"
    "css/financial-professional.css"
    "js/notifications.js"
    "js/charts.js"
    "home-profesional.html"
    "BACKUP_PROFESIONAL.md"
)

all_present=true
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ Presente: $file"
    else
        echo "  ❌ FALTANTE: $file"
        all_present=false
    fi
done

if [ "$all_present" = true ]; then
    echo "🎉 Sistema profesional íntegro y listo"
else
    echo "⚠️ ADVERTENCIA: Algunos archivos profesionales faltan"
fi

echo "📖 Consulta BACKUP_PROFESIONAL.md para más detalles"
