# FieldManager v2.0 - Frontend

> **Plataforma Multi-Domínio para Gestão de Compliance e Execuções**

Sistema web moderno para execução de checklists, inspeções, auditorias e verificações em múltiplos domínios (Segurança, Qualidade, Saúde, Ambiental, Manutenção, Auditoria).

---

## 🚀 Quick Start

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# Iniciar desenvolvimento
pnpm dev

# Build de produção
pnpm build
```

---

## 📋 Índice

- [Visão Geral](#visao-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Scripts Disponíveis](#scripts-disponiveis)
- [Configuração](#configuracao)
- [Documentação](#documentacao)

---

## 🎯 Visão Geral {#visao-geral}

**FieldManager v2.0** é uma plataforma **multi-domínio / multi-tenant** para gestão de conformidade e execuções de checklists em campo.

### Arquitetura

- **Multi-Domínio**: Suporta 6 domínios diferentes (Ambiental, Segurança, Qualidade, Saúde, Manutenção, Auditoria)
- **Multi-Tenant**: Isolamento de dados por cliente via RLS (Row Level Security)
- **Configurável**: Templates de módulos reutilizáveis e perguntas dinâmicas
- **Escalável**: Adicionar novo domínio não requer refatoração

### Diferencial

Este é um **projeto completamente novo**, separado do EcoField (sistema anterior). O código legado está isolado em `src/_legacy/` apenas para referência.

---

## 🛠️ Tecnologias {#tecnologias}

### Core

- **React 18.3.1** - Interface de usuário
- **TypeScript 5.7.3** - Tipagem estática
- **Vite 7.0.0** - Build tool e dev server
- **TailwindCSS 3.4.17** - Estilização

### Estado e Dados

- **Zustand 5.0.6** - State management
- **TanStack Query 5.81.2** - Server state caching
- **Supabase JS 2.50.2** - Backend e autenticação

### Funcionalidades

- **Recharts 3.0.2** - Gráficos e visualizações
- **jsPDF 3.0.3** - Geração de relatórios PDF
- **jspdf-autotable 5.0.2** - Tabelas em PDF
- **Lucide React** - Ícones modernos

### PWA e Offline

- **Dexie 4.0.11** - IndexedDB para offline
- **vite-plugin-pwa** - Service workers

---

## 📁 Estrutura do Projeto {#estrutura-do-projeto}

```bash
frontend/
├── src/
│   ├── components/           # Componentes React
│   │   ├── common/          # Componentes compartilhados
│   │   │   ├── DashboardEstatisticas.tsx  # Dashboard com gráficos
│   │   │   ├── DominioSelector.tsx        # Seletor de domínios
│   │   │   ├── DynamicNavigation.tsx      # Navegação dinâmica
│   │   │   └── FormularioDinamico.tsx     # Execução de checklists
│   │   ├── AdminDashboard.tsx    # Dashboard administrativo
│   │   ├── TecnicoDashboard.tsx  # Dashboard do técnico
│   │   └── LoginSimple.tsx       # Autenticação
│   │
│   ├── lib/                 # APIs e utilitários
│   │   ├── dominiosAPI.ts          # API de domínios
│   │   ├── modulosAPI.ts           # API de módulos
│   │   ├── execucoesAPI.ts         # API de execuções
│   │   ├── fotosExecucoesAPI.ts    # Upload de fotos (Supabase Storage)
│   │   ├── pdfExecucoesAPI.ts      # Geração de PDFs
│   │   ├── authAPI.ts              # Autenticação
│   │   └── usuariosAPI.ts          # Gestão de usuários
│   │
│   ├── hooks/               # React hooks customizados
│   │   ├── useMenuDinamico.ts      # Menu por domínio
│   │   ├── useDashboardStats.ts    # Estatísticas
│   │   └── useAuth.ts              # Autenticação
│   │
│   ├── contexts/            # Contextos React
│   │   └── DominioContext.tsx      # Contexto de domínio ativo
│   │
│   ├── types/               # Tipos TypeScript
│   │   ├── dominio.ts              # Tipos multi-domínio
│   │   └── entities.ts             # Entidades do sistema
│   │
│   ├── utils/               # Utilitários
│   └── _legacy/             # ⚠️ Código antigo (EcoField) - NÃO USAR
│
├── scripts/                 # Scripts Node.js
│   ├── executar-seed-modulos.js    # Popular módulos no banco
│   └── setup-storage-bucket.js     # Configurar Supabase Storage
│
├── public/                  # Assets estáticos
├── docs/                    # Documentação (na raiz do projeto)
└── sql/                     # Migrations e seeds SQL (na raiz do projeto)
```

---

## ✨ Funcionalidades {#funcionalidades}

### 1. Dashboard de Estatísticas 📊

- 4 KPIs em tempo real (Total, Taxa Conformidade, NC, Mês)
- Gráfico de Pizza (distribuição C/NC/NA)
- Gráfico de Barras (top 5 módulos)
- Gráfico de Linha (evolução 7 dias)
- Responsivo (mobile/tablet/desktop)

**Docs**: `/docs/DASHBOARD_ESTATISTICAS.md`

### 2. Sistema de Fotos 📸

- Captura via câmera do dispositivo
- Compressão automática (1920px @ 80%)
- Upload direto para Supabase Storage
- Preview instantâneo
- Múltiplas fotos por pergunta
- Galeria no modal de detalhes

**Docs**: `/docs/SISTEMA_FOTOS.md`

### 3. Geração de PDF 📄

- Relatórios profissionais (A4)
- Cabeçalho e rodapé customizáveis
- Tabela de respostas com cores dinâmicas
- Estatísticas de conformidade
- **Fotos incluídas automaticamente**
- Download com 1 clique

**Docs**: `/docs/SISTEMA_PDF.md`

### 4. Multi-Domínio 🌐

- 6 domínios configuráveis
- Navegação dinâmica por domínio
- Templates de módulos reutilizáveis
- Perguntas dinâmicas (boolean, text, numeric, date, multiple_choice)

**Docs**: `/docs/ESTRATEGIA_GENERALIZACAO_MULTIDOMINIO.md`

### 5. Execução de Checklists ✅

- FormularioDinamico genérico
- Progresso visual
- Validação em tempo real
- Salvar rascunho
- Preenchimento de teste (DEV)

---

## 📜 Scripts Disponíveis {#scripts-disponiveis}

### Desenvolvimento

```bash
pnpm dev          # Servidor de desenvolvimento (porta 3000)
pnpm build        # Build de produção
pnpm preview      # Preview do build
```

### Qualidade de Código

```bash
pnpm lint         # Executar ESLint
pnpm lint:fix     # Corrigir problemas automaticamente
pnpm type-check   # Verificar tipos TypeScript
```

### Banco de Dados

```bash
pnpm setup:storage    # Configurar bucket de fotos no Supabase
node scripts/executar-seed-modulos.js  # Popular módulos
```

### Testes

```bash
pnpm test         # Executar testes (Vitest)
pnpm test:ui      # Interface gráfica de testes
pnpm test:run     # Executar testes sem watch
pnpm test:coverage # Cobertura de testes
```

### Limpeza

```bash
pnpm clean        # Remover node_modules e build
pnpm fresh        # Instalação limpa
```

---

## ⚙️ Configuração {#configuracao}

### Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_KEY=your_service_key  # Apenas para scripts

# Aplicação
VITE_APP_NAME="FieldManager - Sistema Multi-Domínio"
VITE_APP_VERSION="2.0.0"
VITE_APP_ENV=development
```

### Configurar Supabase Storage

Para usar o sistema de fotos:

```bash
pnpm setup:storage
```

Depois, configurar políticas RLS no Supabase Dashboard:

1. Storage → Policies
2. Adicionar política de leitura pública (SELECT)
3. Adicionar política de upload autenticado (INSERT)

Veja: `/docs/SISTEMA_FOTOS.md` (seção "Configuração")

### Popular Banco de Dados

Executar seeds SQL no Supabase SQL Editor:

1. `/sql/seeds/01_dominios.sql` - Criar 6 domínios
2. `/sql/seeds/02_modulos_multidominio.sql` - Criar módulos templates

Ou usar script Node.js:

```bash
node scripts/executar-seed-modulos.js
```

---

## 📚 Documentação {#documentacao}

### Documentação Técnica (em `/docs/`)

- **ESTRATEGIA_GENERALIZACAO_MULTIDOMINIO.md** - Arquitetura multi-domínio
- **DASHBOARD_ESTATISTICAS.md** - Sistema de estatísticas e gráficos
- **SISTEMA_FOTOS.md** - Upload e gerenciamento de fotos
- **SISTEMA_PDF.md** - Geração de relatórios PDF
- **RESUMO_IMPLEMENTACOES_19NOV2025.md** - Resumo das implementações

### Recursos

- **Recharts Docs**: <https://recharts.org/>
- **jsPDF Docs**: <https://artskydj.github.io/jsPDF/docs/>
- **Supabase Docs**: <https://supabase.com/docs>
- **TailwindCSS**: <https://tailwindcss.com/>
- **React**: <https://react.dev/>

---

## 🧪 Como Testar

### 1. Login

- Admin: `admin@fieldmanager.dev` / `admin123`
- Técnico: `tecnico@fieldmanager.dev` / `tecnico123`

### 2. Criar Execução

1. Login como técnico
2. Selecionar domínio (ex: Segurança)
3. Clicar em módulo (ex: NR-35)
4. Preencher checklist (ou usar "🧪 Preencher com Dados de Teste")
5. Adicionar fotos (opcional)
6. Finalizar execução

### 3. Ver Dashboard

- Ver KPIs e gráficos atualizados em tempo real

### 4. Gerar PDF

1. Lista de execuções → Ver Detalhes
2. Clicar "Baixar PDF"
3. PDF baixa automaticamente com fotos incluídas

---

## 🏗️ Desenvolvimento

### Adicionar Novo Domínio

1. Inserir no banco (tabela `dominios`):

```sql
INSERT INTO dominios (codigo, nome, descricao, icone, cor_primaria)
VALUES ('novo-dominio', 'Novo Domínio', 'Descrição', 'Icon', '#10b981');
```

1. Criar módulo template:

```sql
INSERT INTO modulos_sistema (dominio_id, codigo, nome, template)
VALUES ('<dominio-id>', 'codigo-modulo', 'Nome Módulo', true);
```

1. Sistema detecta automaticamente e adiciona ao menu!

### Adicionar Novo Tipo de Pergunta

Editar `FormularioDinamico.tsx` → função `renderCampo()`:

```typescript
case 'seu_novo_tipo':
  return (
    <input
      type="..."
      onChange={(e) => setResposta(pergunta, undefined, e.target.value)}
    />
  );
```

---

## 🐛 Troubleshooting

### Fotos não aparecem no PDF

**Solução**: Configurar CORS no Supabase Storage ou executar `pnpm setup:storage`

### Erro ao buildar

**Solução**: `pnpm clean && pnpm install`

### TypeScript errors

**Solução**: `pnpm type-check` para verificar erros

### Imports de `_legacy/` quebrando

**Solução**: Código em `_legacy/` é antigo (EcoField). Use apenas código da raiz `src/`

---

## 📝 Convenções de Código

### Naming

- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- APIs: `camelCaseAPI.ts`
- Utils: `camelCase.ts`

### Estrutura de Componentes

```typescript
// 1. Imports
import { useState } from 'react';

// 2. Tipos/Interfaces
interface Props {
  userId: string;
}

// 3. Componente
export default function Component({ userId }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Funções
  const handleClick = () => {};

  // 6. Render
  return <div>...</div>;
}
```

---

## 🚀 Deploy

### Frontend (Vercel)

```bash
pnpm build
# Deploy pasta dist/
```

### Configuração Vercel

- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

---

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

## 👥 Autores

- **Uederson Ferreira** - Desenvolvimento FullStack

---

## 📅 Changelog

### v2.0.0 (19/11/2025)

- ✅ Arquitetura multi-domínio completa
- ✅ Dashboard de estatísticas com gráficos
- ✅ Sistema de upload de fotos
- ✅ Geração de PDF com fotos
- ✅ 6 módulos templates criados
- ✅ Código legado isolado em `_legacy/`

---

**Status**: ✅ Em Produção
**Versão Atual**: 2.0.0
**Última Atualização**: 19/11/2025
