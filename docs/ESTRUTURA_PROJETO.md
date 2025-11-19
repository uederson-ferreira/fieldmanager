# 📁 Estrutura do Projeto - FieldManager v2.0

## 🎯 Convenções de Organização

Este documento define a estrutura de pastas e organização de arquivos do FieldManager v2.0.

---

## 📂 Estrutura de Diretórios na Raiz

```
/fieldmanager/
├── sql/                    # ← TODOS os arquivos SQL (migrations, seeds, queries)
├── docs/                   # ← TODA a documentação .md
├── scripts/                # ← TODOS os scripts auxiliares (bash, node, python)
├── frontend/               # ← Aplicação React/TypeScript
├── backend/                # ← API Express/TypeScript
├── tests/                  # ← Testes E2E e integração
├── .github/                # ← GitHub Actions e workflows
├── CLAUDE.md               # ← Instruções para IA
├── README.md               # ← Documentação principal
├── HISTORY.md              # ← Histórico do projeto
└── package.json            # ← Scripts do monorepo
```

---

## 📄 Regras de Organização

### 1. SQL (`/sql/`)

**TODOS** os arquivos SQL devem estar nesta pasta, organizados por subpastas:

```
/sql/
├── migrations/             # Migrations do banco (DDL)
│   ├── 001_criar_tabelas.sql
│   ├── 002_adicionar_multitenancy.sql
│   └── ...
├── seeds/                  # Seeds e dados iniciais
│   ├── seed-database.sql
│   ├── seed-dominios.sql
│   └── ...
├── queries/                # Queries úteis para consulta
│   ├── relatorios.sql
│   ├── estatisticas.sql
│   └── ...
└── DadosSupabase/          # Dumps do Supabase (legado)
    └── *.sql
```

**❌ NÃO criar**: `frontend/sql/`, `backend/sql/`
**✅ CRIAR**: `/sql/` na raiz

---

### 2. Documentação (`/docs/`)

**TODA** documentação `.md` deve estar nesta pasta:

```
/docs/
├── README_SEED.md                          # Como popular o banco
├── ESTRUTURA_PROJETO.md                    # Este arquivo
├── ESTRATEGIA_GENERALIZACAO_MULTIDOMINIO.md # Estratégia multi-domínio
├── API.md                                  # Documentação da API
├── CONTRIBUINDO.md                         # Guia de contribuição
└── arquitetura/                            # Diagramas e docs técnicas
    ├── diagrama-er.md
    ├── fluxo-autenticacao.md
    └── ...
```

**❌ NÃO criar**: `backend/docs/`, `frontend/README.md` (para docs gerais)
**✅ CRIAR**: `/docs/` na raiz

**Exceções permitidas**:
- `frontend/README.md` - Apenas para instruções específicas do frontend
- `backend/README.md` - Apenas para instruções específicas do backend

---

### 3. Scripts (`/scripts/`)

**TODOS** os scripts auxiliares devem estar nesta pasta:

```
/scripts/
├── seed/                   # Scripts de seed do banco
│   ├── seed-all.sh
│   └── seed-dev.js
├── migration/              # Scripts de migração de dados
│   ├── migrar-usuarios.js
│   └── migrar-modulos.js
├── utils/                  # Utilitários gerais
│   ├── backup-db.sh
│   └── gerar-relatorio.js
└── deploy/                 # Scripts de deploy
    ├── deploy-frontend.sh
    └── deploy-backend.sh
```

**❌ NÃO criar**: `backend/scripts/`, `frontend/scripts/`
**✅ CRIAR**: `/scripts/` na raiz

**Exceções permitidas**:
- `frontend/scripts/` - Apenas para scripts específicos do build do frontend
- `backend/scripts/` - Apenas para scripts específicos do build do backend

---

## 🏗️ Estrutura Interna das Aplicações

### Frontend (`/frontend/`)

```
/frontend/
├── src/
│   ├── components/         # Componentes React
│   │   ├── admin/          # Componentes admin
│   │   ├── tecnico/        # Componentes técnico
│   │   └── common/         # Componentes compartilhados
│   ├── contexts/           # React Context
│   ├── hooks/              # Custom hooks
│   ├── lib/                # API clients e utils
│   ├── pages/              # Páginas/rotas
│   ├── types/              # TypeScript types
│   └── styles/             # Estilos globais
├── public/                 # Assets estáticos
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Backend (`/backend/`)

```
/backend/
├── src/
│   ├── routes/             # Rotas Express
│   │   ├── _legacy/        # Rotas antigas (EcoField)
│   │   ├── dominios.ts
│   │   ├── modulos-sistema.ts
│   │   └── ...
│   ├── middleware/         # Middlewares
│   ├── services/           # Lógica de negócio
│   ├── utils/              # Utilitários
│   └── index.ts            # Entry point
├── uploads/                # Uploads temporários
├── package.json
└── tsconfig.json
```

---

## ✅ Checklist de Organização

Ao criar novos arquivos, verifique:

- [ ] É um arquivo SQL? → `/sql/`
- [ ] É documentação .md? → `/docs/`
- [ ] É um script auxiliar? → `/scripts/`
- [ ] É código do frontend? → `/frontend/src/`
- [ ] É código do backend? → `/backend/src/`
- [ ] É teste? → `/tests/`

---

## 🔄 Migração de Arquivos Antigos

Se encontrar arquivos nos locais errados:

```bash
# SQL
mv frontend/sql/alguma-query.sql sql/queries/alguma-query.sql

# Documentação
mv backend/docs/API.md docs/API.md

# Scripts
mv backend/scripts/seed.js scripts/seed/seed.js
```

---

## 📝 Convenções de Nomenclatura

### SQL
- **Migrations**: `XXX_descricao_kebab_case.sql` (ex: `001_criar_tabelas.sql`)
- **Seeds**: `seed-nome.sql` (ex: `seed-database.sql`)
- **Queries**: `nome-descritivo.sql` (ex: `relatorio-mensal.sql`)

### Markdown
- **CAPS_SNAKE_CASE.md** para docs importantes (ex: `README_SEED.md`)
- **PascalCase.md** para docs técnicas (ex: `EstruturaModulos.md`)
- **kebab-case.md** para tutoriais (ex: `como-criar-modulo.md`)

### Scripts
- **kebab-case.sh** para bash (ex: `backup-database.sh`)
- **kebab-case.js** para Node.js (ex: `seed-users.js`)
- **snake_case.py** para Python (ex: `generate_report.py`)

---

## 🎯 Benefícios desta Estrutura

✅ **Clareza**: Todos sabem onde encontrar/criar arquivos
✅ **Manutenibilidade**: Fácil de navegar e manter
✅ **Separação**: Frontend/Backend isolados, recursos compartilhados na raiz
✅ **Escalabilidade**: Suporta crescimento do projeto
✅ **Padrão**: Segue convenções de monorepos modernos

---

**Última atualização**: 2025-11-19
**Mantido por**: Equipe FieldManager
