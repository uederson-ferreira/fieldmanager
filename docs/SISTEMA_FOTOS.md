# Sistema de Upload de Fotos - FieldManager v2.0

## 📸 Visão Geral

Sistema completo de **captura, upload e visualização** de fotos como evidências fotográficas nas execuções de checklists. As fotos são armazenadas diretamente no **Supabase Storage** e vinculadas às perguntas/execuções.

---

## 🎯 Funcionalidades

### ✅ Implementadas

1. **Captura de Fotos**
   - Botão de câmera em perguntas com `permite_foto = true`
   - Suporte a câmera do dispositivo (`capture="environment"`)
   - Preview imediato das fotos capturadas
   - Múltiplas fotos por pergunta

2. **Compressão Automática**
   - Redimensionamento para máximo 1920px de largura
   - Compressão JPEG com qualidade 80%
   - Economia de storage e melhoria de performance

3. **Upload para Supabase Storage**
   - Upload direto (sem intermediário backend)
   - Bucket público: `execucoes-fotos`
   - Organização por execução (pastas UUID)
   - URLs públicas geradas automaticamente

4. **Vínculo com Respostas**
   - Fotos associadas a `pergunta_id` e `pergunta_codigo`
   - Metadados salvos em `campos_customizados.fotos`
   - Rastreabilidade completa

5. **Galeria de Visualização**
   - Grid responsivo (2-3 colunas)
   - Hover com informações (código da pergunta, descrição)
   - Clique para abrir em nova aba
   - Animações suaves

---

## 🏗️ Arquitetura

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário captura foto no FormularioDinamico              │
│    - Clica em "Adicionar Foto" na pergunta                 │
│    - Seleciona câmera ou galeria                           │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Preview gerado via FileReader                           │
│    - Imagem convertida para base64                         │
│    - Armazenada no state `fotos[]`                         │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Ao submeter: Compressão + Upload                        │
│    - uploadMultipleFotos() chamada                         │
│    - Cada foto passa por compressImage()                   │
│    - Upload paralelo para Supabase Storage                 │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. URLs públicas salvas na execução                        │
│    - campos_customizados.fotos[] populado                  │
│    - Payload enviado para execucoesAPI                     │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Visualização no ModalDetalhesExecucao                   │
│    - Galeria renderizada automaticamente                   │
│    - Clique para visualizar em tela cheia                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

### Criados

#### `/frontend/src/lib/fotosExecucoesAPI.ts` (280 linhas)

API completa para gerenciamento de fotos:

```typescript
// Funções principais
- uploadFoto() → Upload individual com compressão
- uploadMultipleFotos() → Upload em lote (Promise.allSettled)
- deleteFoto() → Remoção de foto do storage
- listarFotosExecucao() → Buscar todas as fotos de uma execução
- compressImage() → Redimensionar e comprimir imagem
- verificarBucket() → Checar existência do bucket
```

**Características**:
- Compressão automática (1920px @ 80% quality)
- Upload paralelo com tratamento de erros individual
- Geração de URLs públicas
- Logging detalhado

#### `/frontend/scripts/setup-storage-bucket.js` (116 linhas)

Script de configuração do Supabase Storage:

```bash
pnpm setup:storage
```

**O que faz**:
- Verifica se bucket `execucoes-fotos` existe
- Cria bucket se necessário
- Configura propriedades (público, 10MB limite, JPEG/PNG/WebP/GIF)
- Testa acesso ao bucket
- Exibe instruções de políticas RLS

### Modificados

#### `/frontend/src/components/common/FormularioDinamico.tsx`

**Mudanças**:
1. Import de `fotosExecucoesAPI` e ícones adicionais (Loader2, ImageIcon)
2. Função `handleSubmit()` atualizada:
   - Upload de fotos ANTES de criar execução
   - Inclusão de URLs no payload `campos_customizados.fotos`
   - Feedback visual durante upload
3. UI de ações:
   - Indicador de fotos pendentes (badge azul)
   - Spinner animado durante upload
   - Mensagem "Enviando fotos..." quando aplicável

**Linhas modificadas**: 6-13 (imports), 291-361 (handleSubmit), 599-633 (UI)

#### `/frontend/src/components/TecnicoDashboard.tsx`

**Mudanças**:
1. Seção de fotos no `ModalDetalhesExecucao` atualizada (linhas 344-384):
   - Suporte a AMBOS os formatos (antigo e novo)
   - Acessa `campos_customizados.fotos` primeiro, fallback para `execucao.fotos`
   - Grid responsivo com hover effects
   - Overlay com informações da foto
   - Clique para abrir em nova aba

#### `/frontend/package.json`

**Mudança**:
- Adicionado script `"setup:storage": "node scripts/setup-storage-bucket.js"` (linha 20)

---

## ⚙️ Configuração do Supabase Storage

### 1. Criar Bucket (Automático)

```bash
cd frontend
pnpm setup:storage
```

Isso irá:
- ✅ Criar bucket `execucoes-fotos`
- ✅ Configurar como público (leitura)
- ✅ Limitar a 10MB por arquivo
- ✅ Permitir JPEG, PNG, WebP, GIF

### 2. Configurar Políticas RLS (Manual)

Acesse Supabase Dashboard → Storage → Policies e adicione:

#### Política 1: Leitura Pública

```sql
-- Nome: "Public read access"
-- Operação: SELECT
-- Roles: public

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'execucoes-fotos');
```

#### Política 2: Upload Autenticado

```sql
-- Nome: "Authenticated upload"
-- Operação: INSERT
-- Roles: authenticated

CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'execucoes-fotos');
```

#### Política 3: Delete Autenticado

```sql
-- Nome: "Authenticated delete"
-- Operação: DELETE
-- Roles: authenticated

CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'execucoes-fotos');
```

---

## 🔧 Uso no Código

### Upload de Foto Individual

```typescript
import { uploadFoto } from '../../lib/fotosExecucoesAPI';

const resultado = await uploadFoto(
  file,                    // File object
  'exec-uuid-123',         // ID da execução
  'pergunta-uuid-456',     // ID da pergunta (opcional)
  'NR-35.1',               // Código da pergunta (opcional)
  'Foto do ponto de ancoragem' // Descrição (opcional)
);

if (resultado.success) {
  console.log('URL:', resultado.data.url);
}
```

### Upload de Múltiplas Fotos

```typescript
import { uploadMultipleFotos } from '../../lib/fotosExecucoesAPI';

const resultado = await uploadMultipleFotos(
  [
    {
      file: foto1,
      perguntaId: 'uuid-1',
      perguntaCodigo: 'NR-35.1',
      descricao: 'Ancoragem'
    },
    {
      file: foto2,
      perguntaId: 'uuid-2',
      perguntaCodigo: 'NR-35.2'
    }
  ],
  'execucao-uuid'
);

console.log(`${resultado.data.length} fotos enviadas`);
if (resultado.errors) {
  console.warn('Erros:', resultado.errors);
}
```

### Listar Fotos de uma Execução

```typescript
import { listarFotosExecucao } from '../../lib/fotosExecucoesAPI';

const resultado = await listarFotosExecucao('execucao-uuid');

resultado.data.forEach(foto => {
  console.log(foto.url, foto.nome_arquivo);
});
```

---

## 📊 Estrutura de Dados

### Objeto `FotoExecucao`

```typescript
interface FotoExecucao {
  id: string;              // Path no storage (execucao-id/timestamp_codigo.jpg)
  url: string;             // URL pública completa
  nome_arquivo: string;    // Nome original do arquivo
  tamanho: number;         // Tamanho em bytes (após compressão)
  tipo: string;            // MIME type (sempre 'image/jpeg')
  descricao?: string;      // Descrição opcional
  execucao_id?: string;    // UUID da execução
  pergunta_id?: string;    // UUID da pergunta
  pergunta_codigo?: string; // Código da pergunta (ex: NR-35.1)
  uploaded_at: string;     // ISO timestamp
}
```

### Armazenamento no Banco

```json
// Tabela: execucoes
// Coluna: campos_customizados (JSONB)
{
  "empresa": "Empresa XYZ Ltda",
  "fotos": [
    {
      "url": "https://vzfcqiwghcivlxbmjdnk.supabase.co/storage/v1/object/public/execucoes-fotos/uuid/1234567890_NR-35.1.jpg",
      "nome": "IMG_20250119_153000.jpg",
      "pergunta_id": "uuid-pergunta-1",
      "pergunta_codigo": "NR-35.1",
      "descricao": "Foto do ponto de ancoragem",
      "tamanho": 245678
    }
  ]
}
```

---

## 🧪 Como Testar

### Teste 1: Captura e Upload

```bash
1. Login como técnico (tecnico@fieldmanager.dev)
2. Criar nova execução de qualquer módulo (ex: NR-35)
3. Em uma pergunta com câmera:
   - Clicar em "Adicionar Foto"
   - Selecionar imagem (ou tirar foto)
   - Verificar preview aparece
4. Adicionar mais 2-3 fotos em diferentes perguntas
5. Clicar em "Finalizar"
6. Verificar:
   ✅ Indicador "X fotos serão enviadas" aparece
   ✅ Botão mostra "Enviando fotos..."
   ✅ Execução é salva com sucesso
```

### Teste 2: Visualização

```bash
1. No dashboard do técnico, lista de execuções
2. Clicar em "Ver Detalhes" na execução criada
3. Verificar seção "Fotos (X)":
   ✅ Galeria renderiza corretamente
   ✅ Imagens carregam sem erro 404
   ✅ Hover mostra código da pergunta
   ✅ Clique abre foto em nova aba
```

### Teste 3: Compressão

```bash
1. Capturar foto de 5MB
2. Após upload, verificar no Supabase Storage:
   ✅ Tamanho reduzido (≤1MB esperado)
   ✅ Resolução máxima 1920px
   ✅ Formato JPEG mantido
```

### Teste 4: Erro Handling

```bash
1. Desligar internet (modo offline)
2. Tentar finalizar execução com fotos
3. Verificar:
   ✅ Erro é capturado
   ✅ Mensagem de erro exibida
   ✅ Execução NÃO é salva sem fotos
```

---

## 🚀 Performance

### Otimizações Implementadas

1. **Compressão Inteligente**
   - Redução de ~80-90% no tamanho original
   - Economia de custos de storage
   - Carregamento mais rápido

2. **Upload Paralelo**
   - `Promise.allSettled()` para múltiplas fotos
   - Não bloqueia se uma foto falhar
   - Feedback individual de sucesso/erro

3. **URLs Públicas**
   - Acesso direto sem autenticação
   - CDN do Supabase (rápido globalmente)
   - Cache no navegador

### Métricas Estimadas

| Cenário | Tamanho Original | Após Compressão | Tempo Upload (4G) |
|---------|------------------|-----------------|-------------------|
| 1 foto  | 4MB              | ~500KB          | ~2s               |
| 3 fotos | 12MB             | ~1.5MB          | ~5s               |
| 5 fotos | 20MB             | ~2.5MB          | ~8s               |

---

## 🔒 Segurança

### Validações Implementadas

1. **Tipos de Arquivo**
   - Apenas JPEG, PNG, WebP, GIF permitidos
   - Validação via `accept="image/*"` no input
   - Re-encode para JPEG no upload (consistência)

2. **Tamanho Limite**
   - Bucket configurado para 10MB máximo
   - Compressão reduz tamanho antes do upload

3. **Autenticação**
   - Upload requer token Supabase válido
   - Políticas RLS controlam acesso
   - Leitura pública, escrita autenticada apenas

4. **Organização**
   - Fotos isoladas por execução (pastas UUID)
   - Nomes únicos (timestamp + código da pergunta)
   - Dificulta enumeração/varredura

---

## 📝 Próximas Melhorias

### Curto Prazo

1. **Modal de Visualização**
   - Lightbox para ampliar fotos
   - Navegação entre fotos (setas)
   - Zoom e pan

2. **Edição de Fotos**
   - Rotação básica
   - Crop/recorte
   - Filtros (brilho, contraste)

3. **Metadados EXIF**
   - Extrair GPS das fotos
   - Salvar data/hora original
   - Informações da câmera

### Médio Prazo

4. **Upload Progressivo**
   - Barra de progresso individual por foto
   - Porcentagem de upload
   - Botão de cancelar upload

5. **Galeria Agrupada**
   - Agrupar fotos por categoria
   - Filtro por pergunta
   - Ordenação customizada

6. **Anotações**
   - Desenhar sobre fotos
   - Adicionar setas/marcações
   - Texto explicativo

### Longo Prazo

7. **OCR (Reconhecimento de Texto)**
   - Extrair texto de fotos
   - Busca por conteúdo da imagem
   - Auto-preenchimento de campos

8. **Análise de IA**
   - Detectar não-conformidades automaticamente
   - Classificação de risco
   - Sugestões de ações corretivas

9. **Modo Offline Avançado**
   - Salvar fotos no IndexedDB
   - Upload em background quando online
   - Sincronização automática

---

## 🐛 Troubleshooting

### Erro: "Bucket 'execucoes-fotos' não existe"

**Solução**:
```bash
pnpm setup:storage
```

### Erro: "403 Forbidden" ao fazer upload

**Causa**: Políticas RLS não configuradas

**Solução**:
1. Acesse Supabase Dashboard → Storage → Policies
2. Adicione políticas de INSERT para `authenticated`
3. Teste novamente

### Fotos não aparecem no modal

**Causa**: Formato antigo (`execucao.fotos`) vs novo (`campos_customizados.fotos`)

**Solução**:
- O código já suporta ambos (line 347 do TecnicoDashboard.tsx)
- Verificar estrutura do objeto execução no console

### Upload muito lento

**Causa**: Compressão insuficiente ou rede lenta

**Solução**:
1. Ajustar qualidade em `fotosExecucoesAPI.ts` (linha 69):
   ```typescript
   quality: 0.7  // Reduzir de 0.8 para 0.7
   ```
2. Reduzir resolução máxima (linha 65):
   ```typescript
   maxWidth = 1280  // Reduzir de 1920 para 1280
   ```

---

## 📚 Referências

- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **Canvas API (compressão)**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **FileReader API**: https://developer.mozilla.org/en-US/docs/Web/API/FileReader

---

**Data de Implementação**: 19/11/2025
**Versão**: FieldManager v2.0
**Status**: ✅ Implementado e Documentado
