# Sistema de Geração de PDF - FieldManager v2.0

## 📄 Visão Geral

Sistema completo de **geração de relatórios em PDF** das execuções de checklists, incluindo informações gerais, respostas, estatísticas de conformidade e **evidências fotográficas**.

---

## 🎯 Funcionalidades

### ✅ Implementadas

1. **Geração de PDF Profissional**
   - Formato A4 (portrait)
   - Cabeçalho customizável com gradiente
   - Rodapé com numeração de páginas
   - Logo e branding (opcional)

2. **Informações da Execução**
   - Número do documento
   - Data de execução
   - Status (Concluído/Rascunho)
   - Módulo executado
   - Local, responsável, empresa

3. **Tabela de Respostas**
   - Listagem completa de perguntas
   - Código e descrição
   - Resposta (C/NC/NA)
   - Observações
   - Cores diferenciadas por resposta

4. **Estatísticas de Conformidade**
   - Box destacado com métricas
   - Total de respostas
   - Conformes, Não Conformes, N/A
   - Taxa de conformidade (%) com cor dinâmica

5. **Evidências Fotográficas**
   - Grid 2 fotos por linha
   - Legendas com código da pergunta
   - Conversão automática para base64
   - Redimensionamento proporcional

6. **Download Automático**
   - Botão no modal de detalhes
   - Loading state durante geração
   - Nome de arquivo inteligente
   - Preview opcional em nova aba

---

## 🏗️ Arquitetura

### Fluxo de Geração

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Baixar PDF" no modal                     │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Importação dinâmica de pdfExecucoesAPI (lazy load)      │
│    → Reduz bundle inicial                                  │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. gerarPDFExecucao() processa dados                       │
│    - Criar documento jsPDF                                 │
│    - Adicionar cabeçalho e informações                     │
│    - Gerar tabela de respostas (autoTable)                 │
│    - Calcular estatísticas                                 │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Processar fotos (se incluídas)                          │
│    - Fetch de cada URL                                     │
│    - Conversão para base64                                 │
│    - Adicionar ao PDF com legendas                         │
└────────────────┬────────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Finalizar PDF                                           │
│    - Adicionar rodapé em todas as páginas                  │
│    - Gerar blob                                            │
│    - Download automático                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

### Criados

#### `/frontend/src/lib/pdfExecucoesAPI.ts` (420 linhas)

API completa de geração de PDF:

```typescript
// Funções principais
- gerarPDFExecucao() → Gera PDF completo da execução
- downloadPDF() → Download automático do blob
- previewPDF() → Abre PDF em nova aba
- imageUrlToBase64() → Converte URL de imagem para base64
- calcularDimensoesImagem() → Redimensiona mantendo aspect ratio
- adicionarCabecalho() → Cabeçalho customizado
- adicionarRodape() → Rodapé com numeração
```

**Características**:
- Suporte a fotos via base64
- Tabelas com jspdf-autotable
- Cores dinâmicas baseadas em conformidade
- Multi-página automático
- Estatísticas visuais

#### `/frontend/src/types/jspdf-autotable.d.ts` (120 linhas)

Declarações TypeScript para jspdf-autotable:

```typescript
// Tipos principais
- UserOptions → Opções da tabela
- Styles → Estilos de células
- CellDef → Definição de célula
- CellHookData → Dados dos callbacks
```

### Modificados

#### `/frontend/src/components/TecnicoDashboard.tsx`

**Mudanças**:
1. Import de ícones: `Download`, `FileText`, `LoaderIcon`
2. State no `ModalDetalhesExecucao`:
   - `gerandoPDF` (boolean) para loading
   - `handleDownloadPDF()` (função assíncrona)
3. Footer do modal:
   - Botão "Baixar PDF" com loading state
   - Importação dinâmica (lazy load)
   - Feedback visual (spinner)

**Linhas modificadas**: 7-11 (imports), 251-284 (função PDF), 422-447 (footer)

---

## ⚙️ Configuração

### Dependências Instaladas

```bash
# jspdf já estava instalado
"jspdf": "^3.0.3"

# jspdf-autotable adicionado
pnpm add jspdf-autotable@5.0.2
```

### Opções de Configuração

```typescript
interface PDFOptions {
  incluirFotos?: boolean;       // Default: true
  incluirCabecalho?: boolean;   // Default: true
  incluirRodape?: boolean;      // Default: true
  titulo?: string;              // Default: "Relatório de Execução"
  subtitulo?: string;           // Default: execucao.modulos?.nome
  logoUrl?: string;             // Opcional (futuro)
}
```

---

## 🔧 Uso no Código

### Gerar e Baixar PDF

```typescript
import { gerarPDFExecucao, downloadPDF } from '../lib/pdfExecucoesAPI';

const handleDownload = async () => {
  const resultado = await gerarPDFExecucao(execucao, {
    incluirFotos: true,
    incluirCabecalho: true,
    incluirRodape: true,
    titulo: 'Relatório NR-35',
    subtitulo: execucao.modulos?.nome
  });

  if (resultado.success && resultado.blob) {
    downloadPDF(resultado.blob, 'relatorio.pdf');
  }
};
```

### Preview em Nova Aba

```typescript
import { gerarPDFExecucao, previewPDF } from '../lib/pdfExecucoesAPI';

const handlePreview = async () => {
  const resultado = await gerarPDFExecucao(execucao);

  if (resultado.success && resultado.blob) {
    previewPDF(resultado.blob); // Abre em nova aba
  }
};
```

### Sem Fotos (mais rápido)

```typescript
const resultado = await gerarPDFExecucao(execucao, {
  incluirFotos: false  // Gera apenas texto (mais rápido)
});
```

---

## 📊 Estrutura do PDF

### Página 1: Informações e Respostas

```
┌─────────────────────────────────────────────────────────┐
│ CABEÇALHO (verde emerald)                               │
│ Relatório de Execução                                   │
│ NR-35 - Trabalho em Altura                    19/11/25  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Informações Gerais                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Documento: EXEC-2025-001234                         │ │
│ │ Data: 19/11/2025 14:30                              │ │
│ │ Status: Concluído                                   │ │
│ │ Local: Setor A - Prédio 1                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Respostas do Checklist                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Total: 20 │ Conformes: 18 │ NC: 2 │ N/A: 0         │ │
│ │ Taxa de Conformidade: 90%                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌──────┬────────────────┬──────────┬────────────────┐   │
│ │ Cód  │ Pergunta       │ Resposta │ Observação     │   │
│ ├──────┼────────────────┼──────────┼────────────────┤   │
│ │NR35.1│ Possui anc... │ Conforme │ Verificado OK  │   │
│ │NR35.2│ Cinto de...   │ NC       │ Desgaste vis.. │   │
│ └──────┴────────────────┴──────────┴────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ FieldManager v2.0                        Página 1 de 3  │
└─────────────────────────────────────────────────────────┘
```

### Página 2+: Fotos (se incluídas)

```
┌─────────────────────────────────────────────────────────┐
│ Evidências Fotográficas (5)                             │
│                                                         │
│ ┌─────────────────┐   ┌─────────────────┐              │
│ │                 │   │                 │              │
│ │   [Foto 1]      │   │   [Foto 2]      │              │
│ │                 │   │                 │              │
│ └─────────────────┘   └─────────────────┘              │
│  NR35.1 - Ancoragem    NR35.2 - Cinto                   │
│                                                         │
│ ┌─────────────────┐   ┌─────────────────┐              │
│ │                 │   │                 │              │
│ │   [Foto 3]      │   │   [Foto 4]      │              │
│ │                 │   │                 │              │
│ └─────────────────┘   └─────────────────┘              │
│  NR35.3 - Altura       NR35.4 - EPI                     │
├─────────────────────────────────────────────────────────┤
│ FieldManager v2.0                        Página 2 de 3  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Design e Cores

### Paleta de Cores

| Elemento | Cor | Código Hex | Uso |
|----------|-----|-----------|-----|
| Cabeçalho | Verde Emerald | `#10b981` | Fundo do header |
| Texto Header | Branco | `#ffffff` | Título e subtítulo |
| Conforme | Verde | `#10b981` | Respostas conformes |
| Não Conforme | Vermelho | `#ef4444` | Respostas NC |
| N/A | Cinza | `#9ca3af` | Respostas não aplicáveis |
| Bordas | Cinza Claro | `#c8c8c8` | Tabelas |
| Rodapé | Cinza Médio | `#646464` | Texto do rodapé |

### Taxa de Conformidade (cores dinâmicas)

- **≥ 90%**: Verde `#10b981` (Excelente)
- **75-89%**: Amarelo `#f59e0b` (Bom)
- **< 75%**: Vermelho `#ef4444` (Atenção)

---

## 🧪 Como Testar

### Teste 1: PDF Simples (sem fotos)

```bash
1. Login como técnico
2. Acessar lista de execuções
3. Clicar "Ver Detalhes" em execução SEM fotos
4. Clicar "Baixar PDF"
5. Verificar:
   ✅ PDF baixa automaticamente
   ✅ Nome: execucao_{numero}_{data}.pdf
   ✅ Cabeçalho verde com título
   ✅ Informações gerais corretas
   ✅ Tabela de respostas formatada
   ✅ Cores por tipo de resposta
   ✅ Rodapé com numeração
```

### Teste 2: PDF com Fotos

```bash
1. Criar execução COM fotos (3-5 fotos)
2. Ver Detalhes → Baixar PDF
3. Verificar:
   ✅ Loading "Gerando PDF..."
   ✅ Fotos aparecem no PDF
   ✅ Legendas com código da pergunta
   ✅ Grid 2x2 organizado
   ✅ Qualidade das imagens OK
   ✅ Páginas extras criadas se necessário
```

### Teste 3: Execução Grande (> 50 perguntas)

```bash
1. Executar módulo com muitas perguntas
2. Baixar PDF
3. Verificar:
   ✅ Múltiplas páginas criadas automaticamente
   ✅ Quebra de página correta
   ✅ Rodapé em todas as páginas
   ✅ Numeração sequencial
```

### Teste 4: Diferentes Taxas de Conformidade

```bash
# Alta (≥90%)
1. Execução com 18C, 2NC → 90%
2. Verificar box verde

# Média (75-89%)
1. Execução com 16C, 4NC → 80%
2. Verificar box amarelo

# Baixa (<75%)
1. Execução com 14C, 6NC → 70%
2. Verificar box vermelho
```

---

## 🚀 Performance

### Otimizações Implementadas

1. **Lazy Loading**
   - `import()` dinâmico do pdfExecucoesAPI
   - Não aumenta bundle inicial
   - Carregado apenas quando necessário

2. **Conversão de Imagens**
   - Fetch paralelo de fotos
   - Conversão para base64 (jsPDF requirement)
   - Redimensionamento proporcional

3. **Geração Assíncrona**
   - `async/await` para não travar UI
   - Loading state visual
   - Feedback durante processamento

### Métricas Estimadas

| Cenário | Tempo de Geração | Tamanho do PDF |
|---------|------------------|----------------|
| Sem fotos (20 perguntas) | ~500ms | ~50KB |
| Com 3 fotos | ~2-3s | ~400KB |
| Com 10 fotos | ~5-7s | ~1.2MB |
| 100 perguntas + 10 fotos | ~8-10s | ~1.5MB |

---

## 🔒 Considerações de Segurança

### CORS e Imagens

- Fotos devem estar no mesmo domínio OU
- Supabase Storage com CORS habilitado
- Fetch falha silenciosamente se CORS bloquear

### Dados Sensíveis

- PDF gerado client-side (dados não vão para servidor)
- Download direto para dispositivo do usuário
- Nenhum armazenamento temporário em backend

---

## 📝 Próximas Melhorias

### Curto Prazo

1. **Logo Customizável**
   - Upload de logo da empresa
   - Exibição no cabeçalho
   - Posicionamento ajustável

2. **Assinatura Digital**
   - Campo de assinatura do responsável
   - Timestamp criptográfico
   - QR Code de verificação

3. **Temas de Cores**
   - Tema por domínio (Segurança = Vermelho, Qualidade = Azul)
   - Personalização por tenant
   - Cores acessíveis (WCAG)

### Médio Prazo

4. **Gráficos Visuais**
   - Gráfico de pizza (C/NC/NA) no PDF
   - Evolução temporal
   - Comparação com meta

5. **Sumário Executivo**
   - Página inicial com resumo
   - Highlights de não-conformidades
   - Ações recomendadas

6. **Anexos**
   - Adicionar documentos externos
   - Referências normativas
   - Planos de ação

### Longo Prazo

7. **Batch Export**
   - Exportar múltiplas execuções em 1 PDF
   - Índice automático
   - Consolidação de estatísticas

8. **Templates Customizados**
   - Editor visual de layout
   - Arrastar/soltar seções
   - Salvar templates por módulo

9. **Certificação Digital**
   - Assinatura ICP-Brasil
   - Validação blockchain
   - Não-repúdio legal

---

## 🐛 Troubleshooting

### PDF não baixa (erro silencioso)

**Causa**: Erro ao gerar blob

**Solução**:
1. Abrir console do navegador (F12)
2. Verificar logs `❌ [PDF]`
3. Checar se jspdf-autotable está instalado
4. Verificar tipos TypeScript

### Fotos não aparecem no PDF

**Causa 1**: CORS bloqueando fetch

**Solução**:
- Configurar CORS no Supabase Storage
- Ou usar proxy para fotos

**Causa 2**: URLs inválidas

**Solução**:
- Verificar `campos_customizados.fotos[].url`
- Testar URL manualmente no navegador

### PDF muito grande (> 5MB)

**Causa**: Muitas fotos em alta resolução

**Solução**:
1. Aumentar compressão em `fotosExecucoesAPI.ts`:
   ```typescript
   quality: 0.6  // Reduzir de 0.8
   ```
2. Reduzir dimensões máximas:
   ```typescript
   maxWidth = 1280  // Reduzir de 1920
   ```

### Tabela cortada entre páginas

**Causa**: autoTable não quebrou corretamente

**Solução**:
```typescript
autoTable(doc, {
  // ...
  rowPageBreak: 'avoid',  // Evitar quebra no meio da linha
  showHead: 'everyPage'   // Repetir cabeçalho
});
```

---

## 📚 Referências

- **jsPDF Docs**: https://artskydj.github.io/jsPDF/docs/
- **jspdf-autotable**: https://github.com/simonbengtsson/jsPDF-AutoTable
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

**Data de Implementação**: 19/11/2025
**Versão**: FieldManager v2.0
**Status**: ✅ Implementado e Documentado
