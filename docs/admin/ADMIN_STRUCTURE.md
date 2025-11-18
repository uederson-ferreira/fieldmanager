# MAPEAMENTO COMPLETO - ÁREA ADMINISTRATIVA ECOFIELD

## 1. ESTRUTURA DE COMPONENTES ADMIN

### Localização Base

`/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/components/admin/`

### Componentes Existentes (23 arquivos)

#### Dashboard Principal

- **AdminDashboard.tsx** (Componente raiz)
  - Arquivo: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/components/AdminDashboard.tsx`
  - Função: Container principal com sidebar e navegação
  - Status: Funcional
  - Estrutura:
    - Menu lateral colapsável
    - 11 seções de navegação
    - Dashboard com 4 cards de estatísticas
    - Atividades recentes (dados mockados)

#### Dashboard Gerencial (Relatórios)

- **DashboardGerencial.tsx**
  - Função: Gráficos e relatórios
  - Status: Parcialmente implementado
  - Conteúdo:
    - Cards com estatísticas (Total inspeções, Conformidade, Não conformidades, Termos)
    - 1 gráfico BarChart (Evolução Mensal)
    - 2 placeholders para gráficos futuros

---

## 2. MENU LATERAL E NAVEGAÇÃO

### Estrutura do Menu (AdminDashboard.tsx - linhas 46-58)

```typescript
menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'perfis', label: 'Perfis', icon: UserCheck },
  { id: 'categorias', label: 'Categorias', icon: FolderOpen },
  { id: 'areas', label: 'Áreas', icon: MapPin },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'termos', label: 'Termos', icon: FileCheck },
  { id: 'rotinas', label: 'Rotinas', icon: Clock },
  { id: 'metas', label: 'Metas', icon: Target }
]
```

### Problemas Identificados

1. **Configurações ao final**: Deveria estar no topo ou grupo separado
2. **Sem agrupamento**: Não há separação visual entre seções relacionadas
3. **Sem sub-menus**: Todas as opções no mesmo nível

---

## 3. LISTAGENS IMPLEMENTADAS

### A. TERMOS (Implementado - Funcional)

Arquivos:

- `AdminTermos.tsx` (Container)
- `AdminTermosAcoes.tsx` (Botões de ação)
- `AdminTermosTabela.tsx` (Tabela de dados)
- `AdminTermosFiltro.tsx` (Filtros avançados)

Funcionalidades:

- Listar termos ambientais
- Filtrar por tipo, status, data, emitido por, área
- Selecionar múltiplos termos
- Excluir individual ou em lote
- Mensagens de status (sucesso/erro)

Hook associado:

- `useAdminTermos()` - Controla estado, filtros, seleção

---

### B. ROTINAS (Implementado - Funcional)

Arquivos:

- `AdminRotinas.tsx` (Container)
- `AdminRotinasAcoes.tsx` (Botões de ação)
- `AdminRotinasTabela.tsx` (Tabela de dados)
- `AdminRotinasForm.tsx` (Formulário CRUD)

Funcionalidades:

- Criar, editar, deletar rotinas
- Listar rotinas com filtros
- Formulário modal reutilizável
- Tratamento de erros

Hook associado:

- `useAdminRotinas()` - CRUD completo

---

### C. METAS (Implementado - Complexo)

Arquivos:

- `CrudMetas.tsx` (Wrapper)
- `CrudMetasContainer.tsx` (Container principal)
- `CrudMetasTable.tsx` (Tabela de dados)
- `CrudMetasForm.tsx` (Formulário)
- `CrudMetasDashboard.tsx` (Dashboard de metas)
- `CrudMetasFilters.tsx` (Filtros)
- `CrudMetasAtribuicao.tsx` (Modal de atribuição)
- `CrudMetasEditarAtribuicao.tsx` (Modal editar atribuição)

Funcionalidades:

- Dashboard com indicadores
- CRUD completo de metas
- Atribuição de metas a usuários/equipes
- Cálculo de progresso
- Filtros por tipo, status, período
- Suporte a diferentes tipos: individual, equipe, LV, termo, rotina

Hook associado:

- `useCrudMetas()` - Gerencia todo o CRUD e atribuições

---

### D. USUÁRIOS (Implementado - Funcional)

Arquivo:

- `CrudUsuarios.tsx` (Completo)

Funcionalidades:

- Listar usuários
- Criar, editar, deletar usuários
- Gerenciar perfis de usuários
- Filtrar por nome e perfil
- Validação de senha
- Mostrar/ocultar senha

---

### E. PERFIS (Implementado - Funcional)

Arquivo:

- `CrudPerfis.tsx`

Funcionalidades:

- Gerenciar perfis (Admin, Supervisor, Técnico)
- CRUD de perfis
- Listagem com filtros

---

### F. CATEGORIAS (Implementado - Funcional)

Arquivo:

- `CrudCategorias.tsx`

Funcionalidades:

- Gerenciar categorias de LVs
- CRUD completo
- Listagem e filtros

---

### G. ÁREAS (Implementado - Funcional)

Arquivo:

- `CrudAreas.tsx`

Funcionalidades:

- Gerenciar áreas
- CRUD completo
- Associar com categorias

---

### H. CONFIGURAÇÕES (Implementado - Parcial)

Arquivo:

- `CrudConfiguracoes.tsx`

Funcionalidades:

- Gerenciar configurações do sistema (chave-valor)
- CRUD básico

---

### I. BACKUP (Implementado - Funcional)

Arquivo:

- `Backup.tsx`

Funcionalidades:

- Criar backups do sistema
- Download de dados

---

### J. LVs - NÃO EXISTE LISTAGEM ADMIN

- Não existe componente de administração de LVs
- Existe API (lvAPI.ts) para manipular LVs
- Função renderizada via tecnico/components
- **OPORTUNIDADE**: Criar AdminLVs similar ao AdminRotinas

---

## 4. ESTRUTURA DE DADOS E APIs

### API Layer

Localização: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/lib/`

APIs Disponíveis:

- `usuariosAPI.ts` - Gerenciar usuários
- `perfisAPI.ts` - Gerenciar perfis
- `categoriasAPI.ts` - Gerenciar categorias
- `areasAPI.ts` - Gerenciar áreas
- `termosAPI.ts` - Gerenciar termos
- `rotinasAPI.ts` - Gerenciar rotinas
- `metasAPI.ts` - Gerenciar metas
- `lvAPI.ts` - Gerenciar LVs
- `estatisticasAPI.ts` - Dados de estatísticas
- `configuracoesAPI.ts` - Gerenciar configurações

### Endpoints de Estatísticas (Backend)

Arquivo: `/Users/uedersonferreira/MeusProjetos/ecofield/backend/src/routes/estatisticas.ts`

Endpoints:

- `GET /api/estatisticas/dashboard` - Dashboard geral
- `GET /api/estatisticas/lvs` - Estatísticas de LVs
- `GET /rotinas` - Dados de rotinas
- `GET /termos/estatisticas` - Estatísticas de termos

---

## 5. HOOKS PERSONALIZADOS

Localização: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/hooks/`

Hooks Admin:

- `useAdminTermos()` - Estado e ações para termos
- `useAdminRotinas()` - Estado e ações para rotinas
- `useCrudMetas()` - Estado e ações para metas (mais complexo)

Padrão:

```typescript
// Cada hook retorna:
{
  // Estado
  data: T[],
  loading: boolean,
  error: string | null,
  
  // Ações CRUD
  fetch: () => Promise<void>,
  create: (data: T) => Promise<void>,
  update: (id: string, data: Partial<T>) => Promise<void>,
  delete: (id: string) => Promise<void>,
  
  // Ações específicas
  ...especificas
}
```

---

## 6. PROBLEMAS IDENTIFICADOS

### P1. Link de Configurações Mal Posicionado

- **Local**: AdminDashboard.tsx linhas 53
- **Problema**: Configurações no mesmo nível das outras opções
- **Impacto**: Organização confusa, acesso frequente difícil
- **Solução**: Mover para grupo "Sistema" ou separa no final com divisor

### P2. Sem Listagem de LVs no Admin

- **Local**: Nenhum componente `AdminLVs.tsx`
- **Problema**: Não há CRUD de LVs para admins
- **Impacto**: Admins não conseguem gerenciar LVs
- **Solução**: Criar `AdminLVs.tsx` com padrão similar a `AdminRotinas.tsx`

### P3. Gráficos Incompletos

- **Local**: DashboardGerencial.tsx
- **Problema**: 2 placeholder sem implementação
- **Impacto**: Dashboard de relatórios incompleto
- **Solução**: Implementar usando Recharts com dados reais

### P4. Estatísticas Mockadas

- **Local**: AdminDashboard.tsx linhas 97-160
- **Problema**: Cards com dados hardcoded (12 usuários, 8 inspeções, etc)
- **Impacto**: Informações não refletem realidade
- **Solução**: Integrar com API de estatísticas

### P5. Sem Agrupamento de Menu

- **Local**: AdminDashboard.tsx menuItems
- **Problema**: 11 itens sem organização hierárquica
- **Impacto**: Difícil de navegar
- **Solução**: Agrupar em "Dados Principais", "Documentos", "Sistema"

### P6. Sem Ordenação Lógica

- **Local**: AdminDashboard.tsx menuItems
- **Problema**: Ordem não segue lógica de importância/uso
- **Impacto**: Confuso para usuários novos
- **Solução**: Dashboard → Gestão → Relatórios → Sistema

---

## 7. ARQUITETURA DO DASHBOARD ADMIN

```bash
AdminDashboard.tsx (Raiz)
├── Sidebar
│   ├── Header (EcoField Admin)
│   ├── Menu Items (11 itens)
│   │   ├── Dashboard (Stats cards + atividades)
│   │   ├── Usuários (CrudUsuarios)
│   │   ├── Perfis (CrudPerfis)
│   │   ├── Categorias (CrudCategorias)
│   │   ├── Áreas (CrudAreas)
│   │   ├── Relatórios (DashboardGerencial)
│   │   ├── Configurações (CrudConfiguracoes)
│   │   ├── Backup (Backup)
│   │   ├── Termos (AdminTermos)
│   │   ├── Rotinas (AdminRotinas)
│   │   └── Metas (CrudMetas → CrudMetasContainer)
│   └── User Info + Logout
├── Main Content Area
│   └── renderContent() - Switch para cada seção
└── Componentes Modais (Dentro de cada seção)
```

---

## 8. FLUXO DE DADOS

### Exemplo: Termos

```bash
CrudMetas (UI)
    ↓
useAdminTermos() (Hook)
    ↓
termosAPI.ts (API Client)
    ↓
fetch() → Backend
    ↓
/api/termos (Express Route)
    ↓
Supabase PostgreSQL
```

### Estado Global vs Local

- **Local**: Cada seção gerencia seu próprio estado
- **Global**: Não há Zustand para admin (considerar implementar)
- **Caching**: TanStack Query não está integrado para admin

---

## 9. VARIÁVEIS DE AMBIENTE

Arquivo: `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/.env`

```bash
VITE_API_URL=http://localhost:3001
VITE_REDIRECT_URL=https://ecofield.vercel.app/auth/reset-password
VITE_ENCRYPTION_KEY=a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
```

---

## 10. RECOMENDAÇÕES DE ORGANIZAÇÃO

### Curto Prazo

1. Reorganizar menu em grupos (com divisores visuais)
2. Mover Configurações para seção "Sistema"
3. Implementar gráficos do Dashboard Gerencial

### Médio Prazo

1. Criar AdminLVs component
2. Integrar estatísticas reais no Dashboard
3. Adicionar TanStack Query para caching

### Longo Prazo

1. Implementar Zustand para estado global do admin
2. Refatorar componentes maiores (CrudUsuarios)
3. Adicionar feature flags para controlar visibilidade de seções
4. Implementar auditoria de ações admin

---

## 11. TECNOLOGIAS UTILIZADAS

- React 18.3.1
- TypeScript 5.7.3
- TailwindCSS 3.4.17
- Lucide React (Icons)
- Recharts 3.0.2 (Gráficos)
- Supabase (Backend)
- Fetch API (HTTP Client)

---

## RESUMO DE STATUS

| Componente | Status | Completude | Notas |
|-----------|--------|-----------|-------|
| Dashboard | ✅ | 70% | Stats mockadas, atividades hardcoded |
| Usuários | ✅ | 90% | Funcional, validações prontas |
| Perfis | ✅ | 85% | CRUD básico funcional |
| Categorias | ✅ | 85% | CRUD básico funcional |
| Áreas | ✅ | 85% | CRUD básico funcional |
| Termos | ✅ | 95% | Modular, com filtros avançados |
| Rotinas | ✅ | 95% | Modular, CRUD completo |
| Metas | ✅ | 90% | Complexo, com atribuições e progresso |
| Configurações | ✅ | 75% | CRUD simples, sem validações |
| Backup | ✅ | 60% | Básico, sem testes |
| Relatórios | ⚠️  | 40% | Gráficos incompletos |
| LVs Admin | ❌ | 0% | Não existe |
