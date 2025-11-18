# LISTA COMPLETA DE ARQUIVOS - ÁREA ADMINISTRATIVA ECOFIELD

## COMPONENTES FRONTEND

### Caminho Base: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/components/`

#### Arquivo Raiz Dashboard

- `AdminDashboard.tsx` (14.1 KB) - Container principal com sidebar

#### Subpasta: `admin/`

**Dashboards (2 arquivos)*

- `admin/DashboardGerencial.tsx` (5.3 KB) - Gráficos e relatórios

**Termos (4 arquivos)*

- `admin/AdminTermos.tsx` (2.2 KB) - Container
- `admin/AdminTermosAcoes.tsx` (1.4 KB) - Botões de ação
- `admin/AdminTermosFiltro.tsx` (3.2 KB) - Filtros
- `admin/AdminTermosTabela.tsx` (6.2 KB) - Tabela com dados

**Rotinas (4 arquivos)*

- `admin/AdminRotinas.tsx` (2.0 KB) - Container
- `admin/AdminRotinasAcoes.tsx` (1.2 KB) - Botões de ação
- `admin/AdminRotinasTabela.tsx` (4.6 KB) - Tabela com dados
- `admin/AdminRotinasForm.tsx` (6.2 KB) - Formulário modal

**Metas (8 arquivos)*

- `admin/CrudMetas.tsx` (642 B) - Wrapper
- `admin/CrudMetasContainer.tsx` (6.2 KB) - Container principal
- `admin/CrudMetasTable.tsx` (13 KB) - Tabela com ações
- `admin/CrudMetasForm.tsx` (9.1 KB) - Formulário modal
- `admin/CrudMetasDashboard.tsx` (5.2 KB) - Dashboard de KPIs
- `admin/CrudMetasFilters.tsx` (3.7 KB) - Filtros avançados
- `admin/CrudMetasAtribuicao.tsx` (9.1 KB) - Modal de atribuição individual
- `admin/CrudMetasEditarAtribuicao.tsx` (3.7 KB) - Modal editar atribuição

**CRUD Simples (7 arquivos)*

- `admin/CrudUsuarios.tsx` (28 KB) - Gerenciar usuários (MONOLÍTICO)
- `admin/CrudPerfis.tsx` (6.9 KB) - Gerenciar perfis
- `admin/CrudCategorias.tsx` (17 KB) - Gerenciar categorias
- `admin/CrudAreas.tsx` (16 KB) - Gerenciar áreas
- `admin/CrudConfiguracoes.tsx` (7.0 KB) - Gerenciar configurações
- `admin/Backup.tsx` (6.2 KB) - Backup e download
- (Falta: AdminLVs - OPORTUNIDADE)

**TOTAL**: 23 arquivos, ~150 KB

---

## HOOKS PERSONALIZADOS

### Caminho: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/hooks/`

**Admin Hooks (3 arquivos)*

- `useAdminTermos.ts` - Estado e ações para termos
- `useAdminRotinas.ts` - Estado e ações para rotinas
- `useCrudMetas.ts` - Estado e ações para metas (gigante, 60+ retornos)

**Outros Hooks (não admin)*

- `useAuth.ts` - Autenticação
- `useOfflineSync.ts` - Sincronização offline
- (+ 20 outros hooks não-admin)

---

## API CLIENTS

### Caminho: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/lib/`

**APIs para Admin (10 arquivos)*

- `usuariosAPI.ts` (10 KB) - Gerenciar usuários
  - `getUsuarios()`
  - `createUsuario(data)`
  - `updateUsuario(id, data)`
  - `deleteUsuario(id)`

- `perfisAPI.ts` (5.4 KB) - Gerenciar perfis
  - `getPerfis()`
  - `createPerfil(data)`
  - `updatePerfil(id, data)`
  - `deletePerfil(id)`

- `categoriasAPI.ts` (8.3 KB) - Gerenciar categorias
  - `listarCategorias()`
  - `criarCategoria(data)`
  - `atualizarCategoria(id, data)`
  - `deletarCategoria(id)`

- `areasAPI.ts` (4.3 KB) - Gerenciar áreas
  - `listarAreas()`
  - `criarArea(data)`
  - `atualizarArea(id, data)`
  - `deletarArea(id)`

- `termosAPI.ts` (11 KB) - Gerenciar termos
  - `listarTermos(filtros)`
  - `criarTermo(data)`
  - `atualizarTermo(id, data)`
  - `excluirTermo(id)`

- `rotinasAPI.ts` (7.5 KB) - Gerenciar rotinas
  - `list()`
  - `create(data)`
  - `update(id, data)`
  - `delete(id)`

- `metasAPI.ts` (18 KB) - Gerenciar metas
  - `listarMetas(filtros)`
  - `criarMeta(data)`
  - `atualizarMeta(id, data)`
  - `deletarMeta(id)`
  - `atribuirMeta(metaId, usuarioIds)`

- `lvAPI.ts` (20 KB) - Gerenciar LVs
  - `buscarConfiguracaoLV(tipo)`
  - `criarLV(data)`
  - `atualizarLV(id, data)`
  - `listarLVs(filtros)`

- `estatisticasAPI.ts` (6.6 KB) - Dados de estatísticas
  - `getDashboard()`
  - `getLVStats()`
  - `getRotinasStats()`
  - `getTermosStats()`

- `configuracoesAPI.ts` (6.2 KB) - Gerenciar configurações
  - `list()`
  - `create(data)`
  - `update(id, data)`
  - `delete(id)`

**Total APIs**: 10 arquivos, ~97 KB

---

## BACKEND ROUTES

### Caminho: `/Users/uedersonferreira/MeusProjetos/ecofield/backend/src/routes/`

**Routes para Admin (11 arquivos)*

- `usuarios.ts` (16 KB) - Endpoints de usuários
  - `GET /api/usuarios` - Listar
  - `POST /api/usuarios` - Criar
  - `PUT /api/usuarios/:id` - Atualizar
  - `DELETE /api/usuarios/:id` - Deletar

- `perfis.ts` (7.8 KB) - Endpoints de perfis
  - `GET /api/perfis` - Listar
  - `POST /api/perfis` - Criar
  - `PUT /api/perfis/:id` - Atualizar

- `categorias.ts` (1.4 KB) - Endpoints de categorias
  - Endpoints básicos

- `areas.ts` (4.9 KB) - Endpoints de áreas
  - CRUD completo

- `termos.ts` (29 KB) - Endpoints de termos
  - `GET /api/termos` - Listar
  - `POST /api/termos` - Criar
  - `PUT /api/termos/:id` - Atualizar
  - `DELETE /api/termos/:id` - Deletar
  - `GET /api/termos/estatisticas` - Estatísticas

- `rotinas.ts` (8.2 KB) - Endpoints de rotinas
  - CRUD completo
  - Filtros por área, data, status

- `metas.ts` (25 KB) - Endpoints de metas
  - `GET /api/metas` - Listar com filtros
  - `POST /api/metas` - Criar
  - `PUT /api/metas/:id` - Atualizar
  - `DELETE /api/metas/:id` - Deletar
  - `POST /api/metas/:id/atribuir` - Atribuir usuários
  - `GET /api/metas/:id/progresso` - Calcular progresso

- `lvs.ts` (29 KB) - Endpoints de LVs
  - `GET /api/lvs/configuracao/:tipo` - Configuração
  - `POST /api/lvs` - Criar
  - `GET /api/lvs` - Listar

- `estatisticas.ts` (12 KB) - Endpoints de estatísticas
  - `GET /api/estatisticas/dashboard` - Dashboard geral
  - Agregações por LV, Termo, Rotina

- `configuracoes.ts` (15 KB) - Endpoints de configurações
  - CRUD de configurações chave-valor

- `backup.ts` (6.7 KB) - Endpoints de backup
  - `GET /api/backup/exportar` - Exportar dados

**Total Backend Routes**: 11 arquivos, ~154 KB

---

## TIPOS E INTERFACES

### Caminho: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/types/`

**Tipos para Admin (5+ arquivos)*

- `entities.ts` - UserData, UserRole
- `termos.ts` - TermoAmbiental, FiltrosTermos
- `rotinas.ts` - Rotina, RotinaCreateData
- `metas.ts` - Meta, MetaCriacao, FiltrosMeta
- `lv.ts` - LV, LVCriacao, LVFiltros

---

## VARIÁVEIS DE AMBIENTE

### Arquivo: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/.env`

```bash
VITE_API_URL=http://localhost:3001
VITE_REDIRECT_URL=https://ecofield.vercel.app/auth/reset-password
VITE_ENCRYPTION_KEY=a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
VITE_APP_NAME="EcoField - Sistema de Gestão Ambiental"
VITE_APP_VERSION="1.4.0"
VITE_APP_ENV=development
```

---

## ESTRUTURA DE DIRETÓRIOS (VISUAL)

```bash
/frontend/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx          ← Raiz
│   │   ├── admin/                       ← 23 arquivos
│   │   │   ├── AdminTermos.tsx
│   │   │   ├── AdminTermosAcoes.tsx
│   │   │   ├── AdminTermosFiltro.tsx
│   │   │   ├── AdminTermosTabela.tsx
│   │   │   ├── AdminRotinas.tsx
│   │   │   ├── AdminRotinasAcoes.tsx
│   │   │   ├── AdminRotinasTabela.tsx
│   │   │   ├── AdminRotinasForm.tsx
│   │   │   ├── CrudMetas.tsx
│   │   │   ├── CrudMetasContainer.tsx
│   │   │   ├── CrudMetasTable.tsx
│   │   │   ├── CrudMetasForm.tsx
│   │   │   ├── CrudMetasDashboard.tsx
│   │   │   ├── CrudMetasFilters.tsx
│   │   │   ├── CrudMetasAtribuicao.tsx
│   │   │   ├── CrudMetasEditarAtribuicao.tsx
│   │   │   ├── CrudUsuarios.tsx
│   │   │   ├── CrudPerfis.tsx
│   │   │   ├── CrudCategorias.tsx
│   │   │   ├── CrudAreas.tsx
│   │   │   ├── CrudConfiguracoes.tsx
│   │   │   ├── Backup.tsx
│   │   │   └── DashboardGerencial.tsx
│   │   └── tecnico/                    ← Componentes do técnico
│   │
│   ├── hooks/
│   │   ├── useAdminTermos.ts           ← Hook admin
│   │   ├── useAdminRotinas.ts          ← Hook admin
│   │   ├── useCrudMetas.ts             ← Hook admin
│   │   └── (+ 20 outros hooks)
│   │
│   ├── lib/
│   │   ├── usuariosAPI.ts
│   │   ├── perfisAPI.ts
│   │   ├── categoriasAPI.ts
│   │   ├── areasAPI.ts
│   │   ├── termosAPI.ts
│   │   ├── rotinasAPI.ts
│   │   ├── metasAPI.ts
│   │   ├── lvAPI.ts
│   │   ├── estatisticasAPI.ts
│   │   ├── configuracoesAPI.ts
│   │   └── (+ 10 outros)
│   │
│   ├── types/
│   │   ├── entities.ts
│   │   ├── termos.ts
│   │   ├── metas.ts
│   │   └── (+ mais)
│   │
│   └── .env

/backend/
├── src/
│   ├── routes/
│   │   ├── usuarios.ts
│   │   ├── perfis.ts
│   │   ├── categorias.ts
│   │   ├── areas.ts
│   │   ├── termos.ts
│   │   ├── rotinas.ts
│   │   ├── metas.ts
│   │   ├── lvs.ts
│   │   ├── estatisticas.ts
│   │   ├── configuracoes.ts
│   │   ├── backup.ts
│   │   └── (+ mais)
│   │
│   ├── index.ts                        ← Registra todas as routes
│   └── supabase.ts                     ← Client Supabase
```

---

## RESUMO ESTATÍSTICO

| Categoria | Quantidade | Tamanho Total |
|-----------|-----------|----------------|
| Componentes Admin | 23 | ~150 KB |
| Hooks Admin | 3 | ~20 KB |
| API Clients | 10 | ~97 KB |
| Backend Routes | 11 | ~154 KB |
| **TOTAL** | **47** | **~421 KB** |

---

## MAPA DE NAVEGAÇÃO PARA DESENVOLVIMENTO

### Para Adicionar Nova Funcionalidade Admin

1. **Criar Backend Route**: `/backend/src/routes/nova-feature.ts`
2. **Criar API Client**: `/frontend/src/lib/novaFeatureAPI.ts`
3. **Criar Hook**: `/frontend/src/hooks/useNovaFeature.ts`
4. **Criar Componentes**:
   - `/frontend/src/components/admin/NovaFeature.tsx` (Container)
   - `/frontend/src/components/admin/NovaFeatureAcoes.tsx`
   - `/frontend/src/components/admin/NovaFeatureFiltro.tsx`
   - `/frontend/src/components/admin/NovaFeatureTabela.tsx`
   - `/frontend/src/components/admin/NovaFeatureForm.tsx` (se CRUD)
5. **Registrar em AdminDashboard.tsx**:
   - Adicionar ao array `menuItems`
   - Adicionar case no `renderContent()`
   - Importar componente
6. **Adicionar Tipos**: `/frontend/src/types/nova-feature.ts`

---

## OBSERVAÇÕES IMPORTANTES

1. **Padrão Dominante**: Modular com hooks (Termos, Rotinas, Metas)
2. **Exceção**: CrudUsuarios é monolítico (28KB em 1 arquivo)
3. **APIs**: Padrão consistente de retorno `{ success, data, error }`
4. **Backend**: Todos os endpoints têm autenticação via Bearer token
5. **Database**: Supabase PostgreSQL com RLS policies
6. **Estado**: Cada seção gerencia estado localmente (sem Zustand)
7. **Caching**: Não usa TanStack Query (oportunidade de melhoria)
