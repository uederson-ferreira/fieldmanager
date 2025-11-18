# Sistema de Preview e PDF - Termos Ambientais

## 📋 Visão Geral

O sistema de preview e PDF dos termos ambientais foi implementado com duas abordagens distintas:

### 🎨 **Preview (Frontend)**

- **Localização:** `frontend/src/components/tecnico/ModalDetalhesTermo.tsx`
- **Tecnologia:** HTML + CSS + JavaScript
- **Geração:** Frontend via `relatorio-termo.ts`
- **Visualização:** Nova janela do navegador

### 📄 **PDF (Backend)**

- **Localização:** `backend/src/services/pdfService.ts`
- **Tecnologia:** Puppeteer + HTML + CSS
- **Geração:** Backend via API REST
- **Download:** Arquivo `.pdf` profissional

---

## 🎨 Sistema de Preview (Frontend)

### 📁 **Arquivos Principais:**

#### **1. ModalDetalhesTermo.tsx**

```typescript
// Interface do modal de detalhes
interface ModalDetalhesTermoProps {
  termo: TermoAmbiental;
  fotos?: TermoFoto[];
  assinaturas?: {
    assinatura_emitente?: string;
    assinatura_responsavel_area?: string;
  };
  aberto: boolean;
  onClose: () => void;
}
```

#### **2. relatorio-termo.ts**

```typescript
// Geração do HTML do relatório
export const gerarRelatorioTermo = async (
  termo: TermoAmbiental, 
  fotos: TermoFoto[] = []
): Promise<string> => {
  // Gera HTML completo com CSS
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório - ${tipoInfo.label}</title>
      ${gerarCSS()}
    </head>
    <body>
      <!-- Conteúdo do relatório -->
    </body>
    </html>
  `;
  return html;
};
```

### 🎯 **Funcionalidades do Preview:**

#### **✅ Características:**

- **CSS Completo:** Gradientes, cores, fontes
- **Layout Responsivo:** Grid, flexbox, espaçamentos
- **Imagens:** Base64, URLs, responsivas
- **Tipografia:** Hierarquia visual perfeita

#### **📋 Seções Incluídas:**

- **Cabeçalho:** Título, número, status
- **Informações Básicas:** Data, local, projeto
- **Pessoas Envolvidas:** Emitente e destinatário
- **Não Conformidades:** NCs com severidade
- **Ações Corretivas:** Ações com prazos
- **Fotos:** Grid 2x2 com legendas
- **Assinaturas:** Base64 com status

#### **🖼️ Tratamento de Fotos:**

```typescript
// Busca fotos via API se não vieram por props
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fotos/fotos-termo/${termo.id}`);
```

---

## 📄 Sistema de PDF (Backend)

### 📁 *Arquivos Principais:**

#### **1. pdfService.ts**

```typescript
// Interface dos dados do termo
interface TermoData {
  id: string;
  numero_termo: string;
  tipo_termo: 'RECOMENDACAO' | 'NOTIFICACAO' | 'PARALIZACAO';
  status: string;
  // ... todos os campos do termo
  termos_fotos?: Array<{
    id: string;
    url_arquivo: string;
    categoria: string;
    descricao?: string;
    nome_arquivo: string;
  }>;
}
```

#### **2. Geração do PDF:**

```typescript
public static async generatePDF(termo: TermoData): Promise<Buffer> {
  // Configurar Puppeteer
  browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--font-render-hinting=none'
    ]
  });

  // Gerar HTML moderno
  const html = this.generateHTML(termo);
  
  // Carregar HTML na página
  await page.setContent(html, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 45000
  });
  
  // Gerar PDF com qualidade alta
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0.4in',
      right: '0.4in',
      bottom: '0.4in',
      left: '0.4in'
    },
    displayHeaderFooter: false,
    preferCSSPageSize: false,
    scale: 0.9
  });

  return Buffer.from(pdfBuffer);
}
```

### 🎯 **Funcionalidades do PDF:**

#### *✅ Características:**

- **Gradiente Verde Médio:** Cabeçalho profissional
- **Layout Moderno:** Cards, grids, espaçamentos
- **Fotos Organizadas:** Grid 2 colunas fixas
- **Assinaturas Base64:** Imagens incorporadas
- **Tipografia:** Inter font, hierarquia clara

#### **📋 Seções Incluídas:*

- **Cabeçalho:** Título, número, status com gradiente
- **Informações Gerais:** Cards organizados
- **Responsáveis:** Emitente e destinatário
- **Detalhes Técnicos:** Atividade, natureza, lista
- **Não Conformidades:** NCs com severidade colorida
- **Ações de Correção:** Ações com prazos
- **Assinaturas:** Base64 com status
- **Fotos:** Grid 2x2 com fallback
- **Informações Adicionais:** Observações, providências
- **GPS:** Localização quando disponível

#### **🎨 Design Moderno:**

```css
/* Cabeçalho com gradiente verde */
.header {
  background: linear-gradient(135deg, #2d5a2d 0%, #4a7c4a 100%);
  color: white;
  padding: 25px;
  margin: -20px -20px 30px -20px;
  text-align: center;
  border-radius: 0 0 15px 15px;
}

/* Número do termo com identificação */
.numero {
  background: rgba(255,255,255,0.2);
  padding: 8px 20px;
  border-radius: 25px;
  display: inline-block;
  font-weight: 600;
  font-size: 16px;
}
```

---

## 🔄 Fluxo de Funcionamento

### 🎨 **Preview (Frontend):**

1. **Clique no botão "Preview"**
2. **`handlePreview()`** é chamado
3. **`gerarRelatorioTermo(termo, fotosTermo)`** gera HTML
4. **HTML é renderizado** em nova janela
5. **CSS aplicado** para formatação profissional

### 📄 **PDF (Backend):**

1. **Clique no botão "PDF"**
2. **`handleDownloadPDF()`** chama API
3. **`GET /api/termos/:id/pdf`** é executada
4. **`PDFService.generatePDF()`** gera PDF
5. **Puppeteer** converte HTML para PDF
6. **Download** do arquivo `.pdf`

---

## 🛠️ Configurações Técnicas

### 📦 **Dependências:**

#### **Frontend:**

```json
{
  "lucide-react": "^0.263.1",
  "html2pdf.js": "^0.0.18"
}
```

#### **Backend:**

```json
{
  "puppeteer": "^21.5.2",
  "@types/puppeteer": "^7.0.4"
}
```

### 🔧 **Configurações Puppeteer:**

```typescript
// Configurações para servidor
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--single-process',
  '--disable-gpu',
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor',
  '--font-render-hinting=none'
]
```

### 🌐 **APIs Utilizadas:**

#### **Buscar Fotos:**

```typescript
GET /api/fotos/fotos-termo/:termoId
```

#### **Gerar PDF:**

```typescript
GET /api/termos/:id/pdf
```

---

## 🎯 Melhorias Implementadas

### 🎨 **Design Moderno:**

- **Gradientes:** Verde médio no cabeçalho
- **Cards:** Layout organizado e responsivo
- **Cores:** Paleta harmoniosa e profissional
- **Tipografia:** Inter font para melhor legibilidade

### 📸 **Fotos Organizadas:**

- **Grid 2x2:** Layout fixo e organizado
- **Fallback:** Tratamento de erro elegante
- **Legendas:** Informações claras
- **Responsividade:** Adapta a diferentes tamanhos

### ✍️ **Assinaturas Base64:**

- **Imagens:** Incorporadas diretamente no PDF
- **Status:** Assinado/Pendente com cores
- **Layout:** Cards organizados
- **Fallback:** Placeholder quando não disponível

### 🔢 **Número do Termo:**

- **Identificação:** "Número do Termo: 2025-RC-235"
- **Formatação:** Prefixo correto (RC, NT, PT)
- **Destaque:** Badge com status

---

## 🚀 Vantagens do Sistema

### ✅ **Preview (Frontend):**

- **Flexibilidade:** Qualquer CSS funciona
- **Manutenibilidade:** Fácil de modificar
- **Fidelidade:** Exatamente como preview
- **Recursos:** Gradientes, sombras, animações
- **Responsividade:** Adapta a diferentes tamanhos

### ✅ **PDF (Backend):**

- **Qualidade:** Alta resolução e fidelidade
- **Profissionalismo:** Layout corporativo
- **Compatibilidade:** Funciona em qualquer sistema
- **Segurança:** Geração no servidor
- **Performance:** Otimizado para impressão

---

## 📝 Notas de Implementação

### 🔧 **Correções Realizadas:**

1. **Campo `descricao`:** Corrigido para `descricao_fatos`
2. **Botões:** Removidos Preview e PDF, mantido apenas Imprimir
3. **Fotos:** Layout organizado em 2 colunas
4. **Gradiente:** Verde médio no cabeçalho
5. **Número do termo:** Identificação clara

### 🎯 **Funcionalidades Atuais:**

- **Modal:** Visualização completa do termo
- **Imprimir:** Janela de impressão do navegador
- **Fotos:** Carregamento via API
- **Assinaturas:** Base64 com fallback
- **Design:** Moderno e responsivo

---

## 📊 Status Atual

### ✅ **Implementado:**

- [x] Modal de detalhes moderno
- [x] Sistema de preview (HTML)
- [x] Sistema de PDF (Puppeteer)
- [x] Carregamento de fotos
- [x] Assinaturas base64
- [x] Design responsivo
- [x] Gradiente verde
- [x] Layout organizado

### 🎯 **Funcionalidades Disponíveis:**

- **Visualização:** Modal completo com design moderno
- **Impressão:** Via navegador com formatação profissional
- **Fotos:** Grid organizado com fallback
- **Assinaturas:** Base64 com status visual
- **Responsividade:** Adapta a diferentes telas

---

**Sistema completo e funcional para visualização e impressão de termos ambientais!** 🎨📄✨
