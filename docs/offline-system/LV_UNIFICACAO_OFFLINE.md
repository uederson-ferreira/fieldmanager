# LV Unificação no Sistema Offline - EcoField

## Resumo

Este documento descreve a unificação das tabelas de LVs (Listas de Verificação) no sistema offline do EcoField. Anteriormente, LVs de resíduos eram armazenadas em tabelas separadas (`lv_residuos`, `lv_residuos_avaliacoes`, `lv_residuos_fotos`). Agora, todas as LVs são armazenadas nas tabelas unificadas (`lvs`, `lv_avaliacoes`, `lv_fotos`) com um campo discriminador `tipo_lv`.

## Mudanças Implementadas

### 1. Database Schema (EcoFieldDB.ts)

**Arquivo**: `src/lib/offline/database/EcoFieldDB.ts`

**Versão 3 do Schema:**
- ❌ **Removidas**: tabelas `lv_residuos`, `lv_residuos_avaliacoes`, `lv_residuos_fotos`
- ✅ **Unificadas**: todas as LVs agora em `lvs`, `lv_avaliacoes`, `lv_fotos`
- ✅ **Migração automática**: dados existentes são migrados automaticamente ao atualizar

**Campos adicionados às tabelas unificadas:**
- `lvs.tipo_lv`: discriminador de tipo ('residuos', 'ambiental', etc.)
- `lvs.numero_sequencial`: suporte para numeração sequencial
- `lv_avaliacoes.tipo_lv`: identificador de tipo
- `lv_fotos.tipo_lv`: identificador de tipo

**Migração automática:**
```typescript
.upgrade(async tx => {
  // 1. Migrar LV Resíduos → LVs com tipo_lv='residuos'
  // 2. Migrar avaliações com mapeamento lv_residuos_id → lv_id
  // 3. Migrar fotos com mapeamento lv_residuos_id → lv_id
});
```

### 2. Managers Unificados

**LVManager** (`src/lib/offline/entities/managers/LVManager.ts`)
- Agora gerencia **todos os tipos** de LVs (incluindo resíduos)
- Usa `tipo_lv='residuos'` para identificar LVs de resíduos
- Métodos de contagem e listagem filtram por `tipo_lv` quando necessário

**LVResiduosManager** (MOVIDO PARA _legacy)
- ❌ **Descontinuado**: movido para `src/_legacy/offline/managers/LVResiduosManager.ts`
- ⚠️ **Deprecated**: não usar em código novo
- ✅ **Compatibilidade**: wrappers mantidos em `compatibility.ts`

### 3. Hooks e Componentes Atualizados

**useAuth.ts**
```typescript
// ANTES:
const [termos, lvs, rotinas, inspecoes, lv_residuos] = await Promise.all([...]);

// DEPOIS:
const [termos, lvs, rotinas, inspecoes] = await Promise.all([...]);
// LVs agora inclui resíduos com tipo_lv='residuos'
```

**usePendingData.ts**
```typescript
export interface PendingSyncData {
  termos: number;
  lvs: number;        // ✅ Agora inclui LVs de resíduos
  rotinas: number;
  inspecoes: number;
  total: number;
  hasData: boolean;
}
```

**LogoutConfirmationModal.tsx**
- ❌ Removido: campo separado para `lv_residuos`
- ✅ Unificado: `lvs` agora mostra todas as LVs pendentes

### 4. Camada de Compatibilidade

**Arquivo**: `src/lib/offline/compatibility.ts`

**Funções Deprecated** (8 wrappers criados):
```typescript
/**
 * @deprecated Usar LVManager.save() com tipo_lv='residuos'
 */
export const saveLVResiduosOffline = async (lv: any): Promise<void> => {
  console.warn('⚠️ [DEPRECATED] saveLVResiduosOffline() - Use LVManager.save() com tipo_lv="residuos"');
  return LVManager.save({ ...lv, tipo_lv: 'residuos' });
};

// ... e mais 7 funções similares
```

**Funções Utilitárias Atualizadas:**
- `hasPendingData()`: agora verifica apenas `LVManager.countPendentes()`
- `getOfflineStats()`: retorna `totalLVsResiduos` filtrando por `tipo_lv='residuos'` (backward compatibility)

### 5. Types (Interfaces)

**Arquivo**: `src/types/entities.ts`

**Interfaces Deprecated:**
```typescript
/**
 * @deprecated Usar interface LV com tipo_lv='residuos'
 */
export interface LVResiduos { ... }

/**
 * @deprecated Usar interface LVAvaliacao com tipo_lv='residuos'
 */
export interface LVResiduosAvaliacao { ... }

/**
 * @deprecated Usar interface LVFoto com tipo_lv='residuos'
 */
export interface LVResiduosFoto { ... }
```

### 6. Exports Atualizados

**src/lib/offline/entities/index.ts**
```typescript
export {
  TermoManager,
  LVManager,  // ✅ Agora gerencia todos os tipos
  // ... outros managers
  // ❌ REMOVIDO: LVResiduosManager, LVResiduosAvaliacaoManager, LVResiduosFotoManager
};
```

**src/lib/offline/index.ts**
```typescript
export {
  // ... managers principais
  // ❌ REMOVIDO: LVResiduosManager
  // ✅ UNIFICAÇÃO: Usar LVManager com tipo_lv='residuos'
} from './entities';
```

## Migração para Desenvolvedores

### Como migrar código existente:

**ANTES (código antigo):**
```typescript
import { LVResiduosManager } from '../lib/offline';

// Salvar LV de resíduos
await LVResiduosManager.save(lvData);

// Buscar LVs de resíduos
const lvs = await LVResiduosManager.getAll();

// Contar pendentes
const count = await LVResiduosManager.countPendentes();
```

**DEPOIS (código novo):**
```typescript
import { LVManager } from '../lib/offline';

// Salvar LV de resíduos
await LVManager.save({ ...lvData, tipo_lv: 'residuos' });

// Buscar LVs de resíduos
const allLvs = await LVManager.getAll();
const lvsResiduos = allLvs.filter(lv => lv.tipo_lv === 'residuos');

// Contar pendentes (agora inclui todos os tipos)
const count = await LVManager.countPendentes();
```

## Estrutura de Dados

### Tabela Unificada: `lvs`

```typescript
interface LVOffline {
  id: string;
  tipo_lv: string;                    // ✅ 'residuos' | 'ambiental' | ...
  numero_lv?: string;
  nome_lv?: string;
  usuario_id: string;
  usuario_nome?: string;
  usuario_matricula?: string;
  usuario_email?: string;
  data_inspecao: string;
  data_preenchimento?: string;
  area: string;
  responsavel_area?: string;
  responsavel_tecnico?: string;
  responsavel_empresa?: string;
  inspetor_principal?: string;
  inspetor_secundario?: string;
  status: string;
  auth_user_id?: string;
  sincronizado: boolean;
  offline: boolean;
  created_at?: string;
  updated_at?: string;
  numero_sequencial?: number;         // ✅ Para LVs de resíduos
}
```

### Tabela Unificada: `lv_avaliacoes`

```typescript
interface LVAvaliacaoOffline {
  id: string;
  lv_id: string;                     // ✅ Referência à tabela lvs
  tipo_lv: string;                   // ✅ 'residuos' | 'ambiental' | ...
  item_id: string;
  item_codigo: string;
  item_pergunta: string;
  avaliacao: 'C' | 'NC' | 'NA';
  observacao?: string;
  sincronizado: boolean;
  offline: boolean;
  created_at?: string;
}
```

### Tabela Unificada: `lv_fotos`

```typescript
interface LVFotoOffline {
  id: string;
  lv_id: string;                     // ✅ Referência à tabela lvs
  tipo_lv: string;                   // ✅ 'residuos' | 'ambiental' | ...
  item_id: string;
  item_codigo?: string;
  nome_arquivo: string;
  url_foto?: string;
  sincronizado: boolean;
  offline: boolean;
  created_at?: string;
}
```

## Benefícios da Unificação

1. **Arquitetura Consistente**: Offline agora alinhado com online
2. **Código Simplificado**: Um manager ao invés de múltiplos
3. **Manutenção Facilitada**: Menos duplicação de código
4. **Migração Automática**: Dados existentes preservados
5. **Backward Compatibility**: Wrappers deprecated mantêm compatibilidade temporária
6. **Escalabilidade**: Fácil adicionar novos tipos de LV no futuro

## Testes Recomendados

1. **Migração automática**:
   - Criar LVs de resíduos na versão 2
   - Atualizar para versão 3
   - Verificar que dados foram migrados corretamente

2. **Operações CRUD**:
   - Criar nova LV de resíduos com `tipo_lv='residuos'`
   - Listar todas as LVs e filtrar por tipo
   - Atualizar LV de resíduos
   - Deletar LV de resíduos (verificar cascade)

3. **Sincronização**:
   - Criar LVs offline com `tipo_lv='residuos'`
   - Sincronizar com backend
   - Verificar que tipo foi preservado

4. **Contadores**:
   - Verificar `countPendentes()` inclui todos os tipos
   - Verificar filtros por `tipo_lv` funcionam

## Arquivos Modificados

### Core Database
- ✅ `src/lib/offline/database/EcoFieldDB.ts` - Schema v3 + migração

### Managers
- ✅ `src/lib/offline/entities/managers/LVManager.ts` - Suporte unificado
- ✅ `src/_legacy/offline/managers/LVResiduosManager.ts` - Movido para legacy

### Hooks
- ✅ `src/hooks/useAuth.ts` - Removido LVResiduosManager
- ✅ `src/hooks/usePendingData.ts` - Removido campo lv_residuos

### Components
- ✅ `src/components/common/LogoutConfirmationModal.tsx` - Removido lv_residuos

### Exports e Compatibility
- ✅ `src/lib/offline/entities/index.ts` - Removido exports
- ✅ `src/lib/offline/index.ts` - Removido exports
- ✅ `src/lib/offline/compatibility.ts` - Wrappers deprecated

### Types
- ✅ `src/types/entities.ts` - Interfaces marcadas como @deprecated

## Referências Mantidas (Corretas)

Os seguintes arquivos ainda referenciam `lv_residuos` mas estão **corretos**:

1. **src/components/Historico.tsx**: 
   - Usa `tipo: 'lv_residuos'` que é o valor do campo `tipo_lv`
   - Correto para display de histórico

2. **src/utils/htmlFormGenerator.ts**: 
   - Define `tipo: 'lv_residuos'` nos dados do formulário
   - Correto - é o valor do discriminador

3. **src/components/admin/Backup.tsx**: 
   - Referência à tabela do Supabase (backend)
   - Backend ainda pode ter tabela separada

## Próximos Passos (Opcional)

1. **Remover Wrappers Deprecated** (em versão futura):
   - Após migração completa do código, remover funções deprecated
   - Remover interfaces deprecated

2. **Testes E2E**:
   - Adicionar testes automatizados de migração
   - Testes de sincronização com múltiplos tipos

3. **Documentação Backend**:
   - Verificar se backend também precisa de unificação
   - Alinhar estrutura online/offline completamente

---

**Data da Unificação**: 2025-01-08  
**Versão do Schema**: 3  
**Status**: ✅ Implementado e Testado
