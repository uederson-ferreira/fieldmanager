#!/bin/bash

# Script para gerar ícones do FieldManager em diferentes tamanhos
# Requer: sips (macOS) ou ImageMagick

SVG_FILE="icon-fieldmanager.svg"
OUTPUT_DIR="."

echo "🎨 Gerando ícones do FieldManager..."

# Verificar se o SVG existe
if [ ! -f "$SVG_FILE" ]; then
    echo "❌ Arquivo $SVG_FILE não encontrado!"
    exit 1
fi

# Converter SVG para PNG temporário (1024x1024)
# Nota: sips não suporta SVG diretamente, então vamos criar um PNG base primeiro
# Você pode usar uma ferramenta online ou o Inkscape para converter SVG->PNG

echo "📝 Para gerar os ícones, você pode:"
echo ""
echo "Opção 1 - Usar ferramenta online:"
echo "  1. Acesse https://cloudconvert.com/svg-to-png"
echo "  2. Faça upload de icon-fieldmanager.svg"
echo "  3. Configure para 1024x1024"
echo "  4. Baixe e renomeie para icon.png"
echo ""
echo "Opção 2 - Usar Inkscape (se instalado):"
echo "  inkscape icon-fieldmanager.svg --export-filename=icon.png --export-width=1024 --export-height=1024"
echo ""
echo "Opção 3 - Usar Node.js (se tiver sharp instalado):"
echo "  node -e \"const sharp = require('sharp'); sharp('icon-fieldmanager.svg').resize(1024).toFile('icon.png')\""
echo ""

# Se já tiver o icon.png, gerar os outros tamanhos
if [ -f "icon.png" ]; then
    echo "✅ Gerando tamanhos a partir de icon.png..."
    
    # 192x192
    sips -z 192 192 icon.png --out icon-192.png 2>/dev/null && echo "✅ icon-192.png criado" || echo "⚠️  Erro ao criar icon-192.png"
    
    # 512x512
    sips -z 512 512 icon.png --out icon-512.png 2>/dev/null && echo "✅ icon-512.png criado" || echo "⚠️  Erro ao criar icon-512.png"
    
    # 180x180 (Apple Touch Icon)
    sips -z 180 180 icon.png --out apple-touch-icon.png 2>/dev/null && echo "✅ apple-touch-icon.png criado" || echo "⚠️  Erro ao criar apple-touch-icon.png"
    
    # 32x32 (favicon)
    sips -z 32 32 icon.png --out favicon-32.png 2>/dev/null && echo "✅ favicon-32.png criado" || echo "⚠️  Erro ao criar favicon-32.png"
    
    echo ""
    echo "✅ Ícones gerados com sucesso!"
else
    echo "⚠️  icon.png não encontrado. Converta o SVG primeiro."
fi

