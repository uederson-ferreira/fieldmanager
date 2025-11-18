# P2 (Medium Priority) Implementation Summary - EcoField Offline System

**Data de Implementação:** 2025-01-08  
**Status:** ✅ COMPLETO (3/3 itens)  
**Referência:** OFFLINE_SYSTEM_ANALYSIS.md - Seção 10.3

---

## 📋 Resumo Executivo

Todos os 3 itens P2 (Medium Priority) foram implementados com sucesso:

1. ✅ **P2 #1**: Validação de Dados com Schemas
2. ✅ **P2 #2**: Monitoramento de Quota de Storage
3. ✅ **P2 #3**: Soft Deletes para Recuperação

**Impacto:** Melhora em qualidade de dados, prevenção de problemas de storage e capacidade de recuperação de dados deletados.

---

## ✅ P2 #1: Validação de Dados com Schemas

### **Problema Original**

- Sem validação de dados antes de salvar
- Dados inválidos causam erros silenciosos
- Difícil identificar origem de problemas
- Sem rastreamento de erros de validação

### **Solução Implementada**

**Arquivos Criados:**
- `src/lib/offline/validation/schemas.ts` (380 linhas)
- `src/lib/offline/validation/index.ts` (180 linhas)

**Características:**

1. **Sistema de Validação Baseado em Regras**
```typescript
interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'email';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}
```

2. **Validadores Pré-definidos**
```typescript
// Schemas disponíveis
const schemas = {
  termo: termoSchema,        // Termos ambientais
  lv: lvSchema,              // Listas de verificação
  rotina: atividadeRotinaSchema,  // Atividades de rotina
  inspecao: inspecaoSchema,  // Inspeções
  encarregado: encarregadoSchema, // Encarregados
  foto: fotoSchema,          // Fotos
  syncQueue: syncQueueSchema // Fila de sync
};
```

3. **API de Validação**
```typescript
// Validar dados
const result = validateData(termo, 'termo');
if (!result.valid) {
  console.error('Dados inválidos:', result.errors);
}

// Validar e lançar exceção se inválido
try {
  validateOrThrow(termo, 'termo');
  // Dados válidos, continuar...
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Erros:', error.errors);
  }
}

// Validar em lote
const { valid, invalid } = validateBatch(termos, 'termo');
console.log(`${valid.length} válidos, ${invalid.length} inválidos`);
```

4. **Normalização de Dados**
```typescript
// Normalizar antes de validar
const normalized = normalizeData(termo);
// - Trim em strings
// - Conversão de datas para ISO
// - Remoção de campos null/undefined
```

5. **Estatísticas de Validação**
```typescript
// Tracking automático
const result = validateWithStats(termo, 'termo');

// Obter estatísticas
const stats = validationStats.getStats();
// {
//   totalValidations: 150,
//   successCount: 145,
//   failureCount: 5,
//   errorsByType: { 'Campo obrigatório': 3, 'Formato inválido': 2 },
//   lastValidationAt: '2025-01-08T...'
// }
```

6. **Exemplo de Schema (Termo)**
```typescript
export const termoSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'numero_termo', required: true, type: 'string', min: 3, max: 50 },
  { field: 'titulo', required: true, type: 'string', min: 5, max: 200 },
  { field: 'data_termo', required: true, type: 'date' },
  { field: 'emitido_por_usuario_id', required: true, type: 'uuid' },
  { field: 'descricao_fatos', required: true, type: 'string', min: 10 },
  { field: 'status', required: true, type: 'string' },
  { field: 'sincronizado', required: true, type: 'boolean' },
  { field: 'offline', required: true, type: 'boolean' }
]);
```

### **Integração com Managers**

```typescript
// TermoManager com validação
export class TermoManager {
  static async save(termo: TermoAmbientalOffline): Promise<void> {
    // ✅ P2 #1: Normalizar dados
    const normalized = normalizeData(termo);

    // ✅ P2 #1: Validar dados
    const validation = validateWithStats(normalized, 'termo');

    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    await offlineDB.termos_ambientais.put(normalized);
  }
}
```

### **Benefícios**

- ✅ Previne dados inválidos no IndexedDB
- ✅ Mensagens de erro claras e úteis
- ✅ Rastreamento de erros de validação
- ✅ Validação customizada flexível
- ✅ Normalização automática de dados
- ✅ Type-safe com TypeScript

---

## ✅ P2 #2: Monitoramento de Quota de Storage

### **Problema Original**

- Sem monitoramento de espaço disponível
- Usuário não sabe quando está perto do limite
- Aplicativo quebra quando quota é excedida
- Difícil diagnosticar problemas de storage

### **Solução Implementada**

**Arquivos Criados:**
- `src/lib/offline/utils/storageMonitor.ts` (350 linhas)
- `src/hooks/useStorageMonitor.ts` (120 linhas)

**Características:**

1. **Verificação de Quota**
```typescript
const quota = await checkStorageQuota();
// {
//   usage: 52428800,          // 50MB
//   quota: 524288000,         // 500MB
//   usagePercent: 10,         // 10%
//   availableBytes: 471859200,// 450MB
//   availableMB: 450,
//   usageMB: 50,
//   quotaMB: 500
// }
```

2. **Níveis de Alerta**
```typescript
type StorageWarningLevel = 'safe' | 'warning' | 'critical' | 'full';

const level = getWarningLevel(quota.usagePercent);
// safe:     < 60%
// warning:  60-79%
// critical: 80-94%
// full:     >= 95%

const message = getWarningMessage(level, quota);
// "⚠️ ARMAZENAMENTO EM ALERTA! 65% usado. 
//  Considere sincronizar e limpar dados."
```

3. **Verificar Espaço Disponível**
```typescript
// Antes de salvar dados grandes
const requiredBytes = estimateSpace(termoData);
const hasSpace = await hasEnoughSpace(requiredBytes);

if (!hasSpace) {
  throw new Error('Espaço insuficiente!');
}
```

4. **Monitoramento Contínuo**
```typescript
// Instância global com monitoramento periódico
storageMonitor.start(60000); // Check a cada 60s

// Callback quando quota mudar
storageMonitor.onQuotaChange((quota) => {
  console.log(`Usando ${quota.usagePercent}%`);
});

// Parar monitoramento
storageMonitor.stop();
```

5. **Hook React**
```typescript
function MyComponent() {
  const {
    quota,
    warningLevel,
    warningMessage,
    isPersisted,
    isLoading,
    refresh,
    requestPersistence
  } = useStorageMonitor({
    autoRefresh: true,
    refreshInterval: 60000
  });

  return (
    <div>
      {warningLevel !== 'safe' && (
        <Alert variant={warningLevel === 'critical' ? 'danger' : 'warning'}>
          {warningMessage}
        </Alert>
      )}
      
      <Progress 
        value={quota?.usagePercent || 0} 
        max={100}
        color={warningLevel === 'safe' ? 'green' : 'red'}
      />
      
      <p>Usado: {quota?.usageMB.toFixed(0)} MB de {quota?.quotaMB.toFixed(0)} MB</p>
      
      {!isPersisted && (
        <button onClick={requestPersistence}>
          Solicitar Armazenamento Persistente
        </button>
      )}
    </div>
  );
}
```

6. **Eventos Customizados**
```typescript
// Escutar alertas de storage
window.addEventListener('storage-warning', (event) => {
  const { level, quota, message } = event.detail;
  
  if (level === 'critical') {
    showNotification('CRÍTICO', message);
  }
});
```

7. **Armazenamento Persistente**
```typescript
// Solicitar que navegador não delete dados
const granted = await requestPersistentStorage();

if (granted) {
  console.log('✅ Storage persistente concedido');
} else {
  console.warn('⚠️ Storage persistente negado');
}

// Verificar se é persistente
const isPersisted = await isPersisted();
```

8. **Breakdown Detalhado**
```typescript
const breakdown = await getStorageBreakdown();
// {
//   indexedDB: 45678901,   // ~43.5MB
//   cacheStorage: 8388608, // ~8MB
//   total: 54067509        // ~51.5MB
// }
```

### **Benefícios**

- ✅ Alertas proativos antes de exceder quota
- ✅ UI visual do uso de storage
- ✅ Previne falhas por falta de espaço
- ✅ Monitoramento contínuo automático
- ✅ Suporte a storage persistente
- ✅ Eventos customizados para integrações

---

## ✅ P2 #3: Soft Deletes para Recuperação

### **Problema Original**

- Deletes são permanentes (sem recuperação)
- Usuário pode deletar dados acidentalmente
- Sem audit trail de deleções
- Difícil debugar "dados perdidos"

### **Solução Implementada**

**Arquivos Criados:**
- `src/lib/offline/utils/softDelete.ts` (290 linhas)

**Arquivos Modificados:**
- `src/types/offline.ts` (campos deleted, deleted_at, deleted_by adicionados)

**Características:**

1. **Interface SoftDeletable**
```typescript
interface SoftDeletable {
  id: string;
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

// Adicionado às interfaces principais
interface TermoAmbientalOffline extends TermoAmbiental {
  sincronizado: boolean;
  offline: boolean;
  deleted?: boolean;        // ✅ P2 #3
  deleted_at?: string;      // ✅ P2 #3
  deleted_by?: string;      // ✅ P2 #3
}
```

2. **Soft Delete**
```typescript
// Marcar como deletado
const result = await softDelete(
  offlineDB.termos_ambientais,
  termoId,
  userId  // Opcional: rastrear quem deletou
);

// {
//   success: true,
//   id: '123...',
//   deletedAt: '2025-01-08T...'
// }

// Termo ainda existe no banco, mas com deleted=true
```

3. **Restaurar Dados**
```typescript
// Restaurar um item
const restored = await restore(offlineDB.termos_ambientais, termoId);

// Restaurar múltiplos
const result = await restoreBatch(
  offlineDB.termos_ambientais,
  [id1, id2, id3]
);
// { restored: 3, failed: 0 }
```

4. **Filtrar Ativos vs Deletados**
```typescript
// Buscar apenas itens ativos (não deletados)
const ativos = await getActive(offlineDB.termos_ambientais);

// Buscar apenas deletados (lixeira)
const deletados = await getDeleted(offlineDB.termos_ambientais);

// Estatísticas
const stats = await getStats(offlineDB.termos_ambientais);
// {
//   total: 100,
//   active: 85,
//   deleted: 15,
//   deletedByUser: { 'user-123': 10, 'user-456': 5 },
//   oldestDeletedAt: '2024-12-01T...',
//   newestDeletedAt: '2025-01-08T...'
// }
```

5. **Limpeza Automática**
```typescript
// Deletar permanentemente itens > 30 dias
const purged = await purgeOldDeleted(
  offlineDB.termos_ambientais,
  30  // dias
);

console.log(`${purged} itens removidos permanentemente`);
```

6. **Gerenciador de Soft Deletes**
```typescript
// Limpeza automática de todas as tabelas
const result = await SoftDeleteManager.autoCleanup(30);
// {
//   termos: 5,
//   lvs: 3,
//   rotinas: 8,
//   inspecoes: 2,
//   total: 18
// }

// Estatísticas gerais
const stats = await SoftDeleteManager.getGeneralStats();
// {
//   termos: { total: 50, active: 45, deleted: 5, ... },
//   lvs: { total: 30, active: 28, deleted: 2, ... },
//   ...
// }

// Restaurar todos de uma tabela
const restored = await SoftDeleteManager.restoreAll(
  offlineDB.termos_ambientais
);
```

7. **Soft Delete em Lote**
```typescript
// Deletar múltiplos
const result = await softDeleteBatch(
  offlineDB.termos_ambientais,
  [id1, id2, id3],
  userId
);
// { deleted: 3, failed: 0 }
```

### **Exemplo de Uso Completo**

```typescript
// 1. Usuário deleta termo
await softDelete(offlineDB.termos_ambientais, termoId, userId);

// 2. Termo ainda existe, mas marcado como deleted
const termo = await offlineDB.termos_ambientais.get(termoId);
// { ..., deleted: true, deleted_at: '2025-01-08T...', deleted_by: 'user-123' }

// 3. Listar apenas ativos (excluindo deletados)
const ativos = await getActive(offlineDB.termos_ambientais);
// termoId NÃO aparece aqui

// 4. Implementar "lixeira" na UI
const deletados = await getDeleted(offlineDB.termos_ambientais);
// termoId APARECE aqui

// 5. Usuário restaura termo da lixeira
await restore(offlineDB.termos_ambientais, termoId);

// 6. Termo volta a aparecer normalmente
const ativos2 = await getActive(offlineDB.termos_ambientais);
// termoId APARECE aqui novamente

// 7. Limpeza automática mensal
// Deletes permanentemente itens > 30 dias
await SoftDeleteManager.autoCleanup(30);
```

### **Benefícios**

- ✅ Recuperação de dados deletados acidentalmente
- ✅ Audit trail (quem deletou, quando)
- ✅ Implementar "lixeira" na UI
- ✅ Limpeza automática de itens antigos
- ✅ Soft delete em lote
- ✅ Estatísticas de deleções

---

## 📊 Impacto Geral

### **Antes das Implementações P2**

| Aspecto | Status |
|---------|--------|
| Validação de Dados | ❌ Nenhuma |
| Qualidade de Dados | ⚠️ Inconsistente |
| Monitoramento de Storage | ❌ Nenhum |
| Alertas de Quota | ❌ Nenhum |
| Recuperação de Dados | ❌ Impossível (delete permanente) |
| Audit Trail | ❌ Nenhum |

### **Depois das Implementações P2**

| Aspecto | Status |
|---------|--------|
| Validação de Dados | ✅ Automática com 7 schemas |
| Qualidade de Dados | ✅ Consistente e confiável |
| Monitoramento de Storage | ✅ Contínuo com alertas |
| Alertas de Quota | ✅ 4 níveis (safe/warning/critical/full) |
| Recuperação de Dados | ✅ Soft delete + restauração |
| Audit Trail | ✅ deleted_by, deleted_at |

---

## 🎯 Como Usar

### **1. Validar Dados ao Salvar**

```typescript
import { validateWithStats, normalizeData, ValidationError } from '../lib/offline';

async function salvarTermo(termo: TermoAmbientalOffline) {
  try {
    // Normalizar
    const normalized = normalizeData(termo);
    
    // Validar
    const result = validateWithStats(normalized, 'termo');
    
    if (!result.valid) {
      throw new ValidationError(result.errors);
    }
    
    // Salvar
    await TermoManager.save(normalized);
  } catch (error) {
    if (error instanceof ValidationError) {
      showErrors(error.errors);
    }
  }
}
```

### **2. Monitorar Storage**

```typescript
import { useStorageMonitor } from '../hooks/useStorageMonitor';

function StorageIndicator() {
  const { quota, warningLevel, warningMessage } = useStorageMonitor({
    autoRefresh: true,
    refreshInterval: 60000
  });

  if (!quota) return <Loading />;

  return (
    <div className={`alert alert-${warningLevel === 'critical' ? 'danger' : 'warning'}`}>
      {warningMessage}
      <ProgressBar value={quota.usagePercent} />
    </div>
  );
}
```

### **3. Implementar Soft Delete**

```typescript
import { softDelete, restore, getDeleted } from '../lib/offline';

// Deletar (soft)
async function handleDelete(termoId: string, userId: string) {
  const result = await softDelete(
    offlineDB.termos_ambientais,
    termoId,
    userId
  );
  
  if (result.success) {
    showToast('Termo movido para lixeira');
  }
}

// Restaurar
async function handleRestore(termoId: string) {
  const success = await restore(offlineDB.termos_ambientais, termoId);
  
  if (success) {
    showToast('Termo restaurado com sucesso');
  }
}

// Listar lixeira
async function loadTrash() {
  const deleted = await getDeleted(offlineDB.termos_ambientais);
  setTrashItems(deleted);
}
```

---

## 📝 Arquivos Criados/Modificados

### **Novos Arquivos (5)**

1. `src/lib/offline/validation/schemas.ts` - Schemas de validação
2. `src/lib/offline/validation/index.ts` - API de validação
3. `src/lib/offline/utils/storageMonitor.ts` - Monitor de storage
4. `src/hooks/useStorageMonitor.ts` - Hook de storage
5. `src/lib/offline/utils/softDelete.ts` - Sistema de soft deletes

### **Arquivos Modificados (4)**

1. `src/lib/offline/entities/managers/TermoManager.ts` - Validação integrada
2. `src/lib/offline/utils/index.ts` - Exports atualizados
3. `src/lib/offline/index.ts` - Export de validação
4. `src/types/offline.ts` - Campos soft delete adicionados

### **Total**
- **9 arquivos** modificados/criados
- **~1,320 linhas** de código novo
- **100% TypeScript** (type-safe)

---

## ✅ Checklist de Implementação

- [x] P2 #1: Schemas de validação criados
- [x] P2 #1: API de validação implementada
- [x] P2 #1: Normalização de dados
- [x] P2 #1: Validação integrada no TermoManager
- [x] P2 #1: Estatísticas de validação
- [x] P2 #2: Verificação de quota implementada
- [x] P2 #2: Níveis de alerta (4 níveis)
- [x] P2 #2: Monitoramento contínuo
- [x] P2 #2: Hook React criado
- [x] P2 #2: Eventos customizados
- [x] P2 #2: Storage persistente
- [x] P2 #3: Soft delete implementado
- [x] P2 #3: Restauração de dados
- [x] P2 #3: Limpeza automática
- [x] P2 #3: Soft delete em lote
- [x] P2 #3: Audit trail (deleted_by, deleted_at)
- [x] Documentação completa

---

## 🚀 Integração com P0 e P1

Os itens P2 complementam perfeitamente as implementações P0 e P1:

**P0 + P2 #1 (Validação):**
- Transações atômicas agora com dados validados
- Conflitos detectados com dados consistentes

**P1 + P2 #2 (Storage Monitor):**
- Compressão de fotos + monitoramento = uso otimizado
- Sync queue + alertas = sincronização inteligente

**P0 + P2 #3 (Soft Delete):**
- Bloqueio de logout + soft delete = dados sempre recuperáveis
- Transações atômicas + soft delete = integridade garantida

---

**Status Final:** ✅ TODOS OS P2 IMPLEMENTADOS E DOCUMENTADOS  
**Data:** 2025-01-08  
**Versão Atual:** P0 + P1 + P2 COMPLETOS
