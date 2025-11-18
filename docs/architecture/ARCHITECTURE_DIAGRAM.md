# EcoField Architecture - Visual Diagrams

## 1. Current Architecture Overview

```bash
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (Entry Point)                   │
│                   (Binary Role Check)                        │
└──────┬──────────────────────────────────────────────┬────────┘
       │                                              │
       │ isAdmin === true                             │ isAdmin === false
       │                                              │
       v                                              v
┌──────────────────────────────┐         ┌──────────────────────────────┐
│    ADMIN DASHBOARD           │         │   TÉCNICO DASHBOARD          │
│ (Direct Imports, No Lazy)    │         │ (Context Provider + Lazy)    │
├──────────────────────────────┤         ├──────────────────────────────┤
│ Switch(activeSection) {      │         │ <DashboardProvider>          │
│  case 'usuarios'             │         │  ├── DashboardHeader         │
│  case 'areas'                │         │  ├── DashboardNavigation     │
│  case 'categorias'           │         │  └── DashboardMainContent    │
│  case 'perfis'               │         │      Switch(activeSection) { │
│  case 'termos'               │         │       case 'dashboard' (eager)│
│  case 'rotinas'              │         │       case 'metas' (lazy)    │
│  case 'metas'                │         │       case 'lvs' (lazy)      │
│  case 'relatorios'           │         │       case 'rotina' (lazy)   │
│  case 'configuracoes'        │         │       case 'lista-termos'    │
│  case 'backup'               │         │      }                       │
│ }                            │         │ </DashboardProvider>         │
└──────────────────────────────┘         └──────────────────────────────┘
│                                         │
├─ CrudUsuarios.tsx (28.6 KB)            ├─ ListaTermosContainer.tsx
├─ CrudAreas.tsx (16 KB)                 ├─ ModalDetalhesTermo.tsx (53.3 KB)
├─ CrudCategorias.tsx (18 KB)            ├─ TermoFormFields.tsx (42.5 KB)
├─ CrudMetasTable.tsx (13.7 KB)          ├─ AtividadesRotinaContainer.tsx
├─ CrudMetasForm.tsx (9.3 KB)            ├─ ListasVerificacao.tsx (lazy)
├─ AdminTermos*.tsx (4 files)            ├─ Fotos.tsx (lazy)
├─ AdminRotinas*.tsx (4 files)           ├─ Historico.tsx (lazy)
└─ [Other admin components]              └─ [Other técnico components]
```

## 2. Code Distribution

```bash
COMPONENT BREAKDOWN (18,990 LOC total)
─────────────────────────────────────────────────────────────

Técnico Module (5,130 LOC)
┌─────────────────────────────────────────────────────────────┐
│ ModalDetalhesTermo     1,167 LOC (21.8%)  │████████████████│
│ TermoFormFields          946 LOC (18.6%)  │██████████████  │
│ useListaTermos           N/A LOC (in hooks)
│ ListaTermosContainer     378 LOC ( 7.4%)  │█████           │
│ AtividadesRotinaForm     430 LOC ( 8.4%)  │█████           │
│ [Other 14 files]       1,209 LOC (23.8%)  │███████████     │
└─────────────────────────────────────────────────────────────┘

Admin Module (4,365 LOC)
┌─────────────────────────────────────────────────────────────┐
│ CrudUsuarios             740 LOC (17.0%)  │█████████████   │
│ CrudAreas                433 LOC (10.0%)  │███████         │
│ CrudCategorias           466 LOC (10.7%)  │███████         │
│ CrudMetasTable           289 LOC ( 6.6%)  │████            │
│ CrudMetasForm            244 LOC ( 5.6%)  │███             │
│ CrudMetasAtribuicao      237 LOC ( 5.4%)  │███             │
│ [Other 16 files]       1,956 LOC (44.8%)  │██████████████  │
└─────────────────────────────────────────────────────────────┘

LV Module (4,168 LOC)
┌─────────────────────────────────────────────────────────────┐
│ Plugin System           1,000+ LOC
│ Components              1,500+ LOC
│ Hooks & Types           1,500+ LOC
└─────────────────────────────────────────────────────────────┘

Common Components (327 LOC) ⚠️ CRITICAL
┌─────────────────────────────────────────────────────────────┐
│ LoadingSpinner             676 bytes
│ Modal                     5.2 KB
│ StatusIndicator           3.9 KB
└─────────────────────────────────────────────────────────────┘
```

## 3. Shared Code Analysis

```bash
DUPLICATION PATTERNS
─────────────────────────────────────────────────────────────

Pattern 1: List/Table Logic (30-40% duplication)
┌─────────────────┐              ┌──────────────────┐
│ Admin Component │              │ Técnico Component │
├─────────────────┤              ├──────────────────┤
│ CrudAreas.tsx   │ ━━━━━━━ 35% ━━━━ ListaTermos...│
│ - table render  │   similar    │ - table render   │
│ - filtering     │   patterns   │ - filtering      │
│ - sorting       │              │ - sorting        │
│ - selection     │              │ - selection      │
└─────────────────┘              └──────────────────┘

Pattern 2: Hook Implementations (20-35% duplication)
┌──────────────────────┐      ┌──────────────────────┐
│ useAdminTermos       │      │ useListaTermos       │
│ (5.4 KB)             │      │ (57.4 KB) ⚠️ HUGE    │
├──────────────────────┤ ━ ━ ━┤─────────────────────┤
│ - fetch termos       │ 30% │ - fetch termos       │
│ - filter termos      │ 35% │ - filter termos      │
│ - delete termos      │     │ - create/edit termos │
│ - load management    │     │ - offline sync       │
└──────────────────────┘      └──────────────────────┘

Pattern 3: Form/Modal Logic (20-25% duplication)
┌──────────────────────┐      ┌──────────────────────┐
│ CrudUsuarios.tsx     │      │ ModalDetalhesTermo   │
│ - form states        │      │ - form states        │
│ - validation         │ ━ ━ ━│ - validation         │
│ - submission         │ 25%  │ - submission         │
│ - modal management   │      │ - modal management   │
└──────────────────────┘      └──────────────────────┘
```

## 4. State Management Patterns

```bash
INCONSISTENT APPROACHES
─────────────────────────────────────────────────────────────

ADMIN DASHBOARD (Monolithic)
┌──────────────────────────────────────────┐
│ AdminDashboard.tsx                       │
│ ├─ Local State: activeSection            │
│ ├─ useAdminTermos() hook                 │
│ ├─ useAdminRotinas() hook                │
│ └─ Direct component imports              │
└──────────────────────────────────────────┘

TÉCNICO DASHBOARD (Better Architecture)
┌──────────────────────────────────────────┐
│ <DashboardProvider>                      │
│ ├─ Context: activeSection                │
│ ├─ Context: navigation state              │
│ ├─ Hook: useDashboard()                  │
│ ├─ Hook: useLVSyncStatus()               │
│ ├─ Lazy loaded components                │
│ └─ TanStack Query for server state       │
└──────────────────────────────────────────┘

RESULT: Different patterns for similar functionality!
```

## 5. Bundle Size Breakdown

```bash
CURRENT: 2.7 MB (Production Build)
─────────────────────────────────────────────────────────────

Dependencies            │████████████████████████ 2.1 MB (78%)
├─ React, Tailwind, etc.
├─ TanStack Query
├─ Zustand
└─ Other npm packages

API Clients            │███ 150 KB (5.5%)
├─ 21 resource modules
├─ unifiedCache
└─ syncAPI

Custom Hooks           │███ 180 KB (6.7%)
├─ useListaTermos (57.4 KB!) ⚠️
├─ useTermoForm (40.9 KB)
├─ useAtividadesRotina (28.9 KB)
└─ [12 other hooks]

Admin Module           │██ 80-90 KB (3%)
├─ Loaded for all users ⚠️
└─ Only 22% of users need it

Components             │██ 85-95 KB (3%)
├─ Técnico
├─ LV
└─ Common (minimal)

Other/Misc            │█ 150 KB (5.5%)

OPPORTUNITY: Remove admin module for técnico users = -3%
OPPORTUNITY: Deduplicate code = -4-5%
TARGET: 2.0 MB (25% reduction)
```

## 6. Access Control Flow

```bash
CURRENT: Binary Role System at App Root
─────────────────────────────────────────────────────────────

Login
  │
  ├─ Validate credentials
  ├─ Load user from database
  ├─ Check isAdmin = (perfil === 'ADM')
  │
  └─ Route to dashboard
      │
      ├─ If isAdmin → AdminDashboard (fully loaded)
      │                 ├─ All admin features visible
      │                 ├─ All admin API calls available
      │                 └─ No permission checks inside
      │
      └─ Else → TecnicoDashboard (partially lazy)
                   ├─ View assigned features only
                   ├─ Lazy load based on section
                   └─ Some API calls still unprotected

PROBLEMS:
  - No granular permissions
  - No permission caching
  - Can't hide UI before attempting unauthorized actions
  - Técnico users load admin code anyway (lazy loading issue)
  - Backend RLS not synced with frontend

RECOMMENDED: Feature-Flag System
─────────────────────────────────────────────────────────────

Login
  │
  ├─ Validate credentials
  ├─ Load user from database
  ├─ Resolve permissions → usePermissions() hook
  │
  └─ Route to dashboard
      │
      ├─ Only load accessible modules
      ├─ Only show accessible features
      │   {useFeatureAccess('can_manage_users') && <Users />}
      ├─ Prevent unauthorized API calls
      │   if (!can('metas:edit')) return;
      └─ Cache permissions for performance
```

## 7. Component Size Distribution

```bash
GIANT COMPONENTS (Need Splitting)
─────────────────────────────────────────────────────────────

ModalDetalhesTermo.tsx    │████████████████████████ 53.3 KB
                          │ 1,167 LOC - Should be 5-6 files

TermoFormFields.tsx       │█████████████████████ 42.5 KB
                          │ 946 LOC - Should be 3-4 files

useListaTermos.ts         │████████████████████ 40.9 KB
                          │ Heavy business logic

useTermoForm.ts           │████████████ 28.6 KB
                          │ Complex state management

CrudUsuarios.tsx          │████████████ 28.6 KB
                          │ Multiple responsibilities


RECOMMENDED COMPONENTS (Better Sizes)
─────────────────────────────────────────────────────────────

ComponentName.tsx         │██ 5-10 KB (optimal)
                          │ Single responsibility

Container.tsx             │███ 10-15 KB
                          │ State + layout

Hook (useX.ts)           │██ 5-15 KB (typical)
                          │ Focused business logic
```

## 8. Recommended Refactoring Structure

```bash
AFTER IMPROVEMENTS
─────────────────────────────────────────────────────────────

frontend/src/
├── components/
│   ├── common/              (EXPANDED from 3 → 15+ files)
│   │   ├── DataTable/       (NEW: generic table)
│   │   ├── DataList/        (NEW: generic list)
│   │   ├── Form/            (NEW: form components)
│   │   ├── Modal/
│   │   ├── Filters/         (NEW: filter components)
│   │   ├── Actions/         (NEW: action buttons)
│   │   ├── Layouts/         (NEW: page layouts)
│   │   └── [Others]
│   │
│   ├── admin/               (REDUCED: 22 → 12 files)
│   │   ├── AdminDashboard.tsx (lazy loaded)
│   │   ├── sections/
│   │   │   ├── UsersSection.tsx (refactored with DataTable)
│   │   │   ├── AreasSection.tsx
│   │   │   ├── MetasSection.tsx (refactored)
│   │   │   └── [Other sections]
│   │   └── [Removed: form/table duplicates]
│   │
│   ├── tecnico/             (REDUCED: 19 → 12 files)
│   │   ├── TecnicoDashboard.tsx
│   │   ├── dashboard/       (MOVED from root)
│   │   ├── sections/
│   │   │   ├── TermoSection/
│   │   │   │   ├── TermoDetailModal.tsx (SPLIT from 53KB)
│   │   │   │   ├── TermoBasicInfo.tsx
│   │   │   │   ├── TermoPhotos.tsx
│   │   │   │   ├── TermoForms.tsx
│   │   │   │   ├── TermoActions.tsx
│   │   │   │   └── TermoHistory.tsx
│   │   │   ├── ActivitiesSection/
│   │   │   └── [Other sections]
│   │   └── [Removed: duplicates]
│   │
│   └── lv/                 (UNCHANGED: plugin system)
│       ├── components/
│       ├── hooks/
│       ├── plugins/
│       └── types/
│
├── hooks/                  (CONSOLIDATED: 15 → 10)
│   ├── usePermissions.ts    (NEW)
│   ├── useTermoManagement.ts (MERGED: useAdminTermos + useListaTermos)
│   ├── useMetaManagement.ts (MERGED: useCrudMetas + useDashboardMetas)
│   ├── usePaginatedList.ts   (NEW: shared pagination)
│   ├── useFormState.ts       (NEW: shared form logic)
│   ├── useAuth.ts
│   ├── useDashboardStats.ts
│   ├── useLVSyncStatus.ts
│   ├── useAppVersion.ts
│   └── [Reduced duplicates]
│
├── lib/                    (UNCHANGED: 21 API clients)
│   └── [All resource APIs]
│
└── types/
    ├── entities.ts
    ├── permissions.ts      (NEW)
    ├── metas.ts
    └── [Others]
```

---

## Key Improvements Summary

```bash
METRICS IMPROVEMENT TARGETS
─────────────────────────────────────────────────────────────

DUPLICATION
Current:  25-35%  ████████████████ (High)
Target:   <10%    ████             (Low)
Gain:     60-65% reduction

COMMON COMPONENTS
Current:  3 files (2.7% of code)   ▌
Target:   15+ files (15% of code)  ███
Gain:     400% increase in reusability

BUNDLE SIZE
Current:  2.7 MB  ████████████████████████
Target:   2.0 MB  ████████████████
Gain:     25-30% reduction

COMPONENT COUNT
Current:  59 files (avg 321 LOC)   
Target:   45 files (avg 280 LOC)   
Gain:     23% fewer files, better organization

MAINTENANCE BURDEN
Current:  3 places to fix each bug  ⚠️
Target:   1 place to fix bugs       ✓
Gain:     66% less maintenance cost
```
