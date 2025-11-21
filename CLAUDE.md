# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 DIRETRIZES CRÍTICAS DO PROJETO

### Este é um Projeto COMPLETAMENTE NOVO

**FieldManager v2.0** é um projeto **INTEIRAMENTE NOVO**, totalmente **SEPARADO** do projeto EcoField:

- ✅ **Novo repositório**: `github.com/uederson-ferreira/fieldmanager`
- ✅ **Nova arquitetura**: Multi-domínio / Multi-tenant desde o início
- ✅ **Novo banco de dados**: fieldmanager-production (Supabase)
- ✅ **Nova visão**: Plataforma generalista para múltiplos domínios

### Código Legado (_legacy/)

O código em `backend/src/routes/_legacy/` é do **EcoField antigo** e serve APENAS como:

- 📚 **Referência** de como era implementado no sistema anterior
- 🔍 **Consulta** para entender lógicas de negócio específicas
- ❌ **NÃO deve ser reutilizado** diretamente no novo sistema
- 🗑️ **Será removido** após a migração estar completa

### Estratégia de Desenvolvimento

**SEMPRE seguir** o documento de estratégia oficial:

📄 `/docs/ESTRATEGIA_GENERALIZACAO_MULTIDOMINIO.md`

**Princípios fundamentais**:

1. **Generalização**: Código deve funcionar para QUALQUER domínio (Ambiental, Segurança, Qualidade, etc.)
2. **Multi-tenant**: Cada cliente tem dados isolados via RLS
3. **Configurável**: Templates reutilizáveis, perguntas dinâmicas
4. **Escalável**: Adicionar novo domínio não requer refatoração

### Abordagem para Novas Features

❌ **NÃO fazer**:

- Copiar código de `_legacy/` diretamente
- Criar lógica específica para um domínio (ex: só ambiental)
- Hard-code de categorias, perguntas ou módulos

✅ **FAZER**:

- Criar componentes genéricos que funcionem para qualquer domínio
- Usar `modulos_sistema` e `perguntas_modulos` (dinâmico)
- Seguir arquitetura multi-domínio do documento de estratégia
- Consultar `_legacy/` para entender requisitos, mas implementar de forma genérica

### Estado Atual do Projeto (Jan 2025)

**Backend**: ✅ APIs multi-domínio implementadas

- `/api/dominios` - Gerenciamento de domínios
- `/api/modulos-sistema` - Templates configuráveis
- `/api/execucoes` - Sistema unificado de execuções

**Banco de Dados**: ✅ Schema multi-domínio criado

- 6 domínios cadastrados (Ambiental, Segurança, Qualidade, Saúde, Manutenção, Auditoria)
- 1 módulo exemplo (NR-35 com 20 perguntas)
- 13 rotas legadas isoladas em `_legacy/`

**Frontend**: ⏳ Aguardando migração (Fase 3)

- Ainda usa código do EcoField
- Próximo passo: Implementar DominioContext e componentes dinâmicos

## Project Overview

**FieldManager** is a fullstack Progressive Web Application (PWA) for multi-domain management, specifically designed for field inspections, verification checklists (LV - Listas de Verificação), waste management, and routine activities tracking. The system supports offline operation with automatic synchronization and is optimized for mobile devices.

## Tech Stack

### Frontend

- **React 18.3.1** with **TypeScript 5.7.3**
- **Vite 7.0.0** as build tool and dev server
- **TailwindCSS 3.4.17** for styling
- **React Router DOM 7.6.3** for routing
- **Zustand 5.0.6** for state management
- **TanStack Query 5.81.2** for server state caching
- **Dexie 4.0.11** for IndexedDB (offline storage)
- **Supabase JS 2.50.2** for backend/auth
- **Lucide React** for icons
- **Recharts 3.0.2** for data visualization
- **PWA** with service workers and manifest

### Backend

- **Express 4.21.2** with **TypeScript 5.8.3**
- **Supabase** for database (PostgreSQL) and authentication
- **Puppeteer 24.15.0** for PDF generation
- **Multer 2.0.1** for file uploads
- **CORS** enabled for cross-origin requests

### Development

- **pnpm** (version >=8.0.0, configured: 9.0.0 frontend / 10.9.0 backend)
- **ESLint** for linting
- **TypeScript** for type checking
- Node.js >=18.0.0

## Architecture

### Monorepo Structure

This is a monorepo with two main applications:

- `frontend/` - React SPA with PWA capabilities
- `backend/` - Express API server
- `tests/` - Test files organized by backend/frontend

### Frontend Architecture

**Component Organization:**

- `src/components/admin/` - Admin-specific components (user management, categories, areas, statistics)
- `src/components/tecnico/` - Technician-specific components (field inspections, routine activities)
- `src/components/common/` - Shared components
- `src/components/lv/` - Verification list (LV) components
- `src/components/dashboard/` - Dashboard components

**API Layer:**

- `src/lib/` - API client modules organized by resource (usuariosAPI, lvAPI, fotosAPI, etc.)
- `src/lib/offline/` - Offline synchronization logic
- `src/lib/unifiedCache.ts` - Unified caching strategy
- `src/lib/supabase.ts` - Supabase client configuration

**State Management:**

- Zustand stores for global state
- TanStack Query for server state with automatic caching
- IndexedDB (via Dexie) for offline data persistence

**Offline Architecture:**

- Service worker with workbox for asset caching
- IndexedDB for data storage when offline
- Automatic sync queue that processes when connection is restored
- Network-first strategy for API calls with fallback to cache

### Backend Architecture

**Route Organization:**

- `src/routes/` - Express route handlers organized by resource
  - `auth.ts` - Authentication endpoints
  - `usuarios.ts` - User management
  - `lvs.ts` - Verification lists
  - `rotinas.ts` - Routine activities
  - `fotos.ts` - Photo uploads
  - `metas.ts` - Goals/targets
  - `sync.ts` - Offline sync endpoints
  - `estatisticas.ts` - Statistics and reports
  - Plus: areas, categorias, empresas, perfis, termos, backup, etc.

**Configuration:**

- CORS configured for localhost:3000, localhost:5173, and Vercel deployments
- Environment variables via `.env` files
- Supabase admin client for database operations

## Development Commands

### Frontend (from `frontend/` directory)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server on port 3000
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm type-check       # TypeScript type checking
pnpm clean            # Remove node_modules and build files
pnpm fresh            # Clean install (removes cache)
```

### Backend (from `backend/` directory)

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server with ts-node
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run compiled JavaScript (production)
pnpm clean            # Remove dist directory
pnpm type-check       # TypeScript type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm verificar        # Check Node.js version and environment
```

### Database & Migrations (from `frontend/` directory)

```bash
pnpm migrate:perguntas    # Run questions migration script
pnpm migrate:sql          # Execute SQL migration files
node scripts/criar_perfis_banco.js       # Create user profiles
node scripts/limpar_buckets.js           # Clean storage buckets
node scripts/migrar_usuarios_auth.js     # Migrate user authentication
```

### Testing (from `tests/` directory)

```bash
# Backend tests
node tests/backend/test-auth-flow.js
node tests/backend/test-supabase-connection.js
node tests/backend/test-supabase-admin.js

# Frontend tests
node tests/frontend/test-hash.js
node tests/frontend/test-prefix.js
```

## Key Features & Implementation Notes

### User Roles & Permissions

The system has three main user roles with different access levels:

- **Admin** - Full system access, manages users, categories, areas, and system configuration
- **Supervisor** - Can view reports and monitor inspections
- **Técnico** (Technician) - Executes field inspections and routine activities

Permissions are enforced both client-side (for UI) and server-side (with Supabase Row Level Security policies).

### Offline Capabilities

The offline system works in layers:

1. **Service Worker** - Caches static assets and API responses
2. **IndexedDB (Dexie)** - Stores data records when offline
3. **Sync Queue** - Tracks pending operations and syncs when online
4. **Network Detection** - Visual indicators show online/offline status

When creating or updating data offline:

- Data is saved to IndexedDB with a `pendingSync` flag
- Photos are converted to base64 strings
- A sync queue tracks all pending operations
- When online, the sync process runs automatically

### Photo Handling

- Photos are uploaded via `backend/src/routes/fotos.ts`
- Supabase storage buckets are used for persistence
- Offline: photos are converted to base64 and stored in IndexedDB
- The system supports capture from mobile devices

### WhatsApp Sharing

- Located in technician components
- Formats activity data into professional messages with emojis
- Includes GPS coordinates in DMS format
- Guides users to manually attach photos in WhatsApp

### Database Schema

Key tables (in Supabase PostgreSQL):

- `usuarios` - User accounts and profile information
- `perfis` - User role definitions
- `categorias_lv` - Verification list categories
- `areas` - Inspection areas
- `inspecoes` - Inspection records
- `atividades_rotina` - Routine activity records
- `empresas_contratadas` - Contracted companies
- `metas_tma` - Goals and targets
- `fotos` - Photo metadata and URLs

SQL migrations are in `frontend/sql/` organized by purpose (admin, migrations, fixes, debug).

### Environment Variables

**Frontend (.env):**

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME="FieldManager - Sistema de Gestão Ambiental"
VITE_APP_VERSION="1.4.0"
VITE_APP_ENV=development
```

**Backend (.env):**

```bash
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=development
```

## Code Organization Principles

### Component Structure

- Keep components focused on a single responsibility
- Admin components in `admin/`, technician components in `tecnico/`
- Shared/reusable components in `common/`
- Use TypeScript interfaces from `src/types/`

### API Client Pattern

Each resource has its own API client module in `src/lib/`:

- Consistent function naming: `getX()`, `createX()`, `updateX()`, `deleteX()`
- Error handling with try-catch
- Offline fallback logic where needed
- Type-safe with TypeScript interfaces

### State Management Pattern

- Use Zustand for global app state (user session, settings)
- Use TanStack Query for server data (with automatic caching and refetching)
- Use IndexedDB for offline data persistence
- Avoid prop drilling - prefer context or stores for shared state

### Styling Approach

- TailwindCSS utility classes for styling
- Responsive design with mobile-first approach
- Consistent color scheme: emerald/green for primary actions
- Dark mode not currently implemented

## Deployment

### Frontend (Vercel)

- Configured in `frontend/vercel.json`
- Build command: `pnpm build`
- Output directory: `dist`
- SPA routing with rewrites to `/index.html`
- Security headers configured

### Backend1

- Can be deployed to any Node.js hosting (Heroku, Render, Railway, etc.)
- Requires `PORT` environment variable
- Uses `Procfile` for Heroku deployment

## Common Development Workflows

### Adding a New Route/Feature

1. **Backend**: Create route handler in `backend/src/routes/`
2. **Backend**: Register route in `backend/src/index.ts`
3. **Frontend**: Create API client function in `frontend/src/lib/[resource]API.ts`
4. **Frontend**: Create component in appropriate folder
5. **Frontend**: Add route in `App.tsx` if needed
6. Update TypeScript types in `src/types/`

### Database Changes

1. Write SQL migration in `frontend/sql/migrations/`
2. Test migration locally
3. Apply to production Supabase via SQL editor
4. Update TypeScript types if schema changed

### Adding Offline Support to a Feature

1. Add Dexie table definition in `frontend/src/lib/offline/`
2. Implement save-to-IndexedDB in the API client
3. Add sync logic to upload pending changes
4. Update UI to show sync status

## Important Notes

- **Session Management**: User sessions expire after 24 hours
- **Photo Size**: Large photos may impact offline storage - consider compression
- **Sync Conflicts**: Currently uses "last write wins" - no conflict resolution
- **RLS Policies**: All database access is protected by Row Level Security in Supabase
- **Mobile Optimization**: The app is heavily optimized for mobile use in field conditions
- **Network Resilience**: The system is designed to work in areas with poor connectivity

## File Naming Conventions

- React components: PascalCase (e.g., `AdminDashboard.tsx`)
- Utilities/helpers: camelCase (e.g., `dateUtils.ts`)
- API clients: camelCase with API suffix (e.g., `usuariosAPI.ts`)
- Types: PascalCase interfaces/types in `types/` folders
- SQL files: lowercase with underscores (e.g., `criar_admin.sql`)
