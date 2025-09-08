#!/bin/bash

echo "================================================"
echo "     GIT STATUS & INFO - GESTION_v2-SVG"
echo "================================================"

echo -e "\n🔍 INFORMACIÓN DEL REPOSITORIO:"
echo "Repositorio: $(git remote get-url origin)"
echo "Rama actual: $(git branch --show-current)"
echo "Último commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"

echo -e "\n📊 ESTADO ACTUAL:"
git status --porcelain | head -20

echo -e "\n📈 COMMITS RECIENTES:"
git log --oneline -5

echo -e "\n🔄 ESTADO DE SINCRONIZACIÓN:"
git fetch origin &>/dev/null
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ $LOCAL = $REMOTE ]; then
    echo "✅ Sincronizado con el remoto"
elif [ $LOCAL = $BASE ]; then
    echo "⬇️  Necesita pull (hay cambios remotos)"
elif [ $REMOTE = $BASE ]; then
    echo "⬆️  Necesita push (hay cambios locales)"
else
    echo "🔄 Divergencia (necesita merge/rebase)"
fi

echo -e "\n🗂️  ARCHIVOS PRINCIPALES:"
ls -la | grep -E "(landing\.html|server\.js|package\.json|README\.md)"

echo -e "\n📦 ESPACIO UTILIZADO:"
du -sh .git
echo "Total proyecto: $(du -sh . | cut -f1)"

echo -e "\n================================================"
