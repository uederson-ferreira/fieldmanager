# 🌿 EcoField - Sistema de Gestão Ambiental

[![Tests](https://github.com/[seu-usuario]/ecofield/actions/workflows/tests.yml/badge.svg)](https://github.com/[seu-usuario]/ecofield/actions/workflows/tests.yml)
[![Build](https://github.com/[seu-usuario]/ecofield/actions/workflows/build.yml/badge.svg)](https://github.com/[seu-usuario]/ecofield/actions/workflows/build.yml)
[![Lint](https://github.com/[seu-usuario]/ecofield/actions/workflows/lint.yml/badge.svg)](https://github.com/[seu-usuario]/ecofield/actions/workflows/lint.yml)
[![codecov](https://codecov.io/gh/[seu-usuario]/ecofield/branch/main/graph/badge.svg)](https://codecov.io/gh/[seu-usuario]/ecofield)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646cff.svg)](https://vitejs.dev/)

Progressive Web Application (PWA) para gestão ambiental com suporte offline completo. Desenvolvido para técnicos de campo realizarem inspeções, verificações (LV), gestão de resíduos e atividades de rotina em áreas sem conectividade.

---

## ✨ Funcionalidades

### Modo Offline-First
- ✅ Criação e edição de inspeções sem internet
- ✅ Armazenamento local via IndexedDB (Dexie)
- ✅ Sincronização automática quando online
- ✅ Resolução inteligente de conflitos
- ✅ Fila de sincronização com retry exponencial

### Gestão de Inspeções
- 📋 Inspeções ambientais, de segurança e qualidade
- 📸 Upload de fotos (base64 offline)
- ✅ Respostas a perguntas de checklist
- 📊 Status tracking (em andamento, concluída, cancelada)

### Listas de Verificação (LV)
- 📝 Criação e preenchimento de LVs personalizadas
- ⭐ Sistema de avaliação por critérios
- 📷 Fotos de evidência
- 📈 Metas e indicadores

### Gestão de Resíduos
- 🗑️ Registro de resíduos e destinação
- 🏢 Empresas contratadas
- 👷 Encarregados e responsáveis

### Relatórios
- 📊 Dashboard com estatísticas
- 📄 Exportação de relatórios (PDF)
- 📱 Compartilhamento via WhatsApp

---

## 🧪 Testes

### Status Atual
- **Cobertura:** ~80%
- **Testes:** 235 testes passando
- **Arquivos de teste:** 13
- **Falhas:** 0

### Executar Testes

```bash
# Watch mode (desenvolvimento)
pnpm test

# Interface gráfica
pnpm test:ui

# Executar todos os testes (CI)
pnpm test:run

# Gerar relatório de cobertura
pnpm test:coverage

# Type checking
pnpm type-check
```

### Estrutura de Testes

```
src/
├── lib/__tests__/
│   └── supabase.test.ts (11 testes)
├── lib/offline/entities/managers/__tests__/
│   ├── TermoManager.test.ts (23 testes)
│   ├── LVManager.test.ts (28 testes)
│   ├── InspecaoManager.test.ts (18 testes)
│   ├── EncarregadoManager.test.ts (12 testes)
│   └── AtividadeRotinaManager.test.ts (10 testes)
└── lib/offline/sync/__tests__/
    ├── ConflictResolver.test.ts (93 testes)
    ├── SyncQueue.test.ts (17 testes)
    └── syncers/__tests__/
        ├── TermoSync.test.ts (14 testes)
        ├── LVSync.test.ts (7 testes)
        ├── InspecaoSync.test.ts (3 testes)
        ├── AtividadeRotinaSync.test.ts (3 testes)
        └── EncarregadoSync.test.ts (3 testes)
```

---

## 🚀 Tecnologias

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.7** - Type safety
- **Vite 7.0** - Build tool
- **TailwindCSS 3.4** - Styling
- **Dexie 4.0** - IndexedDB wrapper
- **Zustand 5.0** - State management
- **TanStack Query 5.8** - Server state caching
- **Vitest 4.0** - Testing framework

### Backend
- **Supabase** - PostgreSQL + Auth + Storage
- **Express** - API server
- **Puppeteer** - PDF generation

### DevOps
- **GitHub Actions** - CI/CD
- **Vercel** - Frontend deployment
- **Codecov** - Coverage monitoring

---

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Conta Supabase configurada

### Setup Local

```bash
# Clone o repositório
git clone https://github.com/[seu-usuario]/ecofield.git
cd ecofield/frontend

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Execute em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build
pnpm preview
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME="EcoField - Sistema de Gestão Ambiental"
VITE_APP_VERSION="1.4.0"
VITE_APP_ENV=development
```

---

## 📚 Documentação

### 🎯 Início Rápido
- 📑 **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Índice completo de toda documentação
- 🧪 **[docs/05-testes/](./docs/05-testes/)** - Documentação de testes
- 🎉 **[docs/05-testes/RESUMO_FINAL_COMPLETO.md](./docs/05-testes/RESUMO_FINAL_COMPLETO.md)** - Status atual completo

### Documentação de Testes
- [TESTING_ROADMAP.md](./docs/05-testes/guides/TESTING_ROADMAP.md) - Roadmap de testes
- [TESTING_JOURNEY.md](./docs/05-testes/guides/TESTING_JOURNEY.md) - Jornada completa
- [SPRINT_FINAL_REPORT.md](./docs/05-testes/sprints/SPRINT_FINAL_REPORT.md) - Relatório final
- [SPRINT6_E2E_GUIDE.md](./docs/05-testes/guides/SPRINT6_E2E_GUIDE.md) - Guia de testes E2E

### CI/CD
- [.github/GITHUB_ACTIONS_SETUP.md](./.github/GITHUB_ACTIONS_SETUP.md) - Setup do CI/CD
- [.github/workflows/](./.github/workflows/) - Workflows automatizados

### Arquitetura
- Offline-first com IndexedDB
- Sincronização com fila de retry
- Resolução automática de conflitos
- PWA com Service Worker

---

## 🔄 CI/CD

### Workflows do GitHub Actions

#### Tests (`tests.yml`)
- Executado em: push e pull requests
- Node.js: 18.x e 20.x
- Etapas:
  - Type checking
  - Execução de testes
  - Geração de cobertura
  - Upload para Codecov
  - Comentário de cobertura em PRs

#### Build (`build.yml`)
- Valida que build de produção funciona
- Upload de artifacts
- Verificação de tamanho do bundle

#### Lint (`lint.yml`)
- ESLint em todos os arquivos
- Fail on warnings

### Quality Gates
- ✅ Cobertura mínima: 70%
- ✅ Todos os testes devem passar
- ✅ Build deve compilar sem erros
- ✅ Sem erros de lint

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

1. Crie uma branch a partir de `develop`
2. Faça suas alterações
3. Execute testes: `pnpm test:run`
4. Execute type checking: `pnpm type-check`
5. Execute lint: `pnpm lint`
6. Crie um Pull Request
7. Aguarde aprovação dos checks automáticos

### Padrões de Código
- TypeScript strict mode
- Functional components com hooks
- TailwindCSS para styling
- Testes para novas funcionalidades

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 👥 Time

Desenvolvido com ❤️ por [Seu Nome/Empresa]

---

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@ecofield.com
- 🐛 Issues: [GitHub Issues](https://github.com/[seu-usuario]/ecofield/issues)
