# 🎨 Ícones do FieldManager

## Arquivos Necessários

Para gerar os ícones PNG a partir do SVG, você pode usar uma das opções abaixo:

### Opção 1: Usar ferramenta online (Recomendado)

1. Acesse: https://cloudconvert.com/svg-to-png
2. Faça upload do arquivo `icon-fieldmanager.svg`
3. Configure:
   - **Width**: 1024px
   - **Height**: 1024px
4. Baixe e renomeie para `icon.png`
5. Repita para outros tamanhos:
   - 192x192 → `icon-192.png`
   - 512x512 → `icon-512.png`
   - 180x180 → `apple-touch-icon.png`

### Opção 2: Usar Inkscape (se instalado)

```bash
# Converter para 1024x1024
inkscape icon-fieldmanager.svg --export-filename=icon.png --export-width=1024 --export-height=1024

# Converter para 192x192
inkscape icon-fieldmanager.svg --export-filename=icon-192.png --export-width=192 --export-height=192

# Converter para 512x512
inkscape icon-fieldmanager.svg --export-filename=icon-512.png --export-width=512 --export-height=512

# Converter para 180x180 (Apple Touch Icon)
inkscape icon-fieldmanager.svg --export-filename=apple-touch-icon.png --export-width=180 --export-height=180
```

### Opção 3: Usar Node.js com sharp

```bash
npm install -g sharp-cli

# Ou usando sharp diretamente:
node -e "
const sharp = require('sharp');
sharp('icon-fieldmanager.svg')
  .resize(1024, 1024)
  .toFile('icon.png');
"
```

## Design do Ícone

- **Engrenagem**: Azul (#3b82f6) - representa múltiplos domínios integrados
- **Folha no centro**: Branca - representa gestão/natureza (pode ser adaptada para multidisciplinaridade)
- **Fundo**: Gradiente azul do FieldManager

## Após Gerar os PNGs

1. Substitua os arquivos em `frontend/public/`:
   - `icon.png` (1024x1024)
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `apple-touch-icon.png` (180x180)

2. Limpe o cache do navegador (Ctrl+Shift+R / Cmd+Shift+R)

3. Os ícones devem aparecer automaticamente!

