# 🚀 ECOFIELD OFFLINE - QUICK REFERENCE CARD

> Guia rápido para desenvolvimento com o sistema offline

---

## 📦 Imports Essenciais

```typescript
// Entity Managers
import { TermoManager } from '@/lib/offline/entities/managers/TermoManager';
import { LVManager } from '@/lib/offline/entities/managers/LVManager';
import { RotinaManager } from '@/lib/offline/entities/managers/RotinaManager';

// Sync
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';
import { ConflictDetector } from '@/lib/offline/sync/ConflictDetector';
import { canSafelyLogout } from '@/lib/offline/sync/logoutGuard';

// Validation
import { validateWithStats, ValidationError } from '@/lib/offline/validation';

// Storage
import { compressImage } from '@/lib/offline/utils/imageCompression';
import { migrateAllPhotosToBlob } from '@/lib/offline/utils/photoMigration';
import { checkStorageQuota } from '@/lib/offline/utils/storageMonitor';

// Soft Delete
import { softDelete, restore, getActive } from '@/lib/offline/utils/softDelete';

// Hooks
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useStorageMonitor } from '@/hooks/useStorageMonitor';

// Database
import { offlineDB } from '@/lib/offline/database';
```

---

## 💾 CRUD Básico

### Criar Termo com Fotos (Atomic)

```typescript
await TermoManager.saveWithPhotos(termo, fotos, (progress) => {
  console.log(`${progress}%`);
});
```

### Buscar Apenas Ativos (Soft Delete)

```typescript
const ativos = await getActive(offlineDB.termos_ambientais);
```

### Deletar (Soft Delete)

```typescript
await softDelete(offlineDB.termos_ambientais, id, userId);
```

### Restaurar

```typescript
await restore(offlineDB.termos_ambientais, id);
```

---

## 🔄 Sincronização

### Adicionar à Fila

```typescript
await SyncQueue.enqueue('termo', id, 'create', { priority: 8 });
```

### Processar Fila

```typescript
const result = await SyncQueue.processPending({
  limit: 10,
  onProgress: (p, t) => console.log(`${p}/${t}`)
});
```

### Detectar Conflitos

```typescript
const conflicts = await ConflictDetector.detectTermoConflicts();
```

### Resolver Conflito

```typescript
await ConflictDetector.resolveConflict(conflict, 'use_latest');
```

### Verificar se Pode Fazer Logout

```typescript
const canLogout = await canSafelyLogout();
if (!canLogout) {
  alert('Dados pendentes! Sincronize primeiro.');
}
```

---

## 📸 Fotos

### Comprimir Imagem

```typescript
const result = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  targetSizeKB: 500
});

// result.blob - Blob comprimido
// result.compressionRatio - % de compressão
```

### Migrar Fotos Base64 → Blob

```typescript
const result = await migrateAllPhotosToBlob();
console.log(`Liberados: ${result.spaceSavedMB.toFixed(1)} MB`);
```

---

## ✅ Validação

### Validar Dados

```typescript
const validation = validateWithStats(termo, 'termo');

if (!validation.valid) {
  throw new ValidationError(validation.errors);
}
```

### Normalizar Antes de Salvar

```typescript
import { normalizeData } from '@/lib/offline/validation';

const normalized = normalizeData(termo);
await offlineDB.termos_ambientais.put(normalized);
```

---

## 💽 Storage Monitor

### Hook React

```typescript
const {
  quota,
  warningLevel,
  warningMessage,
  refresh,
  requestPersistence
} = useStorageMonitor({ autoRefresh: true });

// warningLevel: 'safe' | 'warning' | 'critical' | 'full'
```

### API Programática

```typescript
const quota = await checkStorageQuota();

console.log(`
  Usando: ${quota.usageMB.toFixed(1)} MB
  Total: ${quota.quotaMB.toFixed(1)} MB
  Percentual: ${quota.usagePercent.toFixed(1)}%
`);
```

### Verificar Espaço

```typescript
import { hasEnoughSpace } from '@/lib/offline/utils/storageMonitor';

const canSave = await hasEnoughSpace(5); // 5 MB
```

---

## 🔧 Background Sync

### Hook React

```typescript
const { status, registerBackgroundSync, syncNow } = useBackgroundSync();

// status.isSupported
// status.isRegistered
// status.pendingCount

await registerBackgroundSync();
await syncNow();
```

---

## 📊 Estatísticas

### Sync Queue

```typescript
const stats = await SyncQueue.getStats();
// stats.total, stats.pending, stats.withErrors
```

### Validation

```typescript
import { validationStats } from '@/lib/offline/validation';

const stats = validationStats.getStats();
// stats.totalValidations, stats.successCount
```

### Soft Delete

```typescript
import { SoftDeleteManager } from '@/lib/offline/utils/softDelete';

const stats = await SoftDeleteManager.getGeneralStats();
// stats.termos, stats.lvs, stats.rotinas
```

---

## 🗑️ Manutenção

### Limpar Deletados Antigos (>30 dias)

```typescript
import { SoftDeleteManager } from '@/lib/offline/utils/softDelete';

const result = await SoftDeleteManager.autoCleanup(30);
console.log(`Removidos: ${result.total} itens`);
```

### Retry Itens com Erro

```typescript
const failed = await SyncQueue.getFailedItems();

for (const item of failed) {
  await SyncQueue.retry(item.id);
}
```

---

## 🎯 Schemas de Validação Disponíveis

| Schema | Tipo |
|--------|------|
| `termo` | TermoAmbientalOffline |
| `lv` | LVOffline |
| `rotina` | AtividadeRotinaOffline |
| `inspecao` | InspecaoOffline |
| `encarregado` | EncarregadoOffline |
| `foto` | FotoOffline |
| `syncQueueItem` | SyncQueueItem |

---

## ⚡ Estratégias de Resolução de Conflitos

| Estratégia | Comportamento |
|------------|---------------|
| `use_local` | Mantém versão local |
| `use_remote` | Usa versão remota |
| `use_latest` | Usa modificação mais recente |
| `manual` | Requer resolução manual |

---

## 🚨 Níveis de Alerta de Storage

| Nível | % | Ação Recomendada |
|-------|---|------------------|
| `safe` | < 60% | Nenhuma |
| `warning` | 60-79% | Considerar limpeza |
| `critical` | 80-94% | Executar manutenção |
| `full` | ≥ 95% | **URGENTE**: Liberar espaço |

---

## 📱 Exemplo Completo: Criar Termo Offline

```typescript
async function criarTermoOfflineCompleto(
  termoData: Partial<TermoAmbientalOffline>,
  fotoFiles: File[]
) {
  // 1. Preparar dados
  const termo: TermoAmbientalOffline = {
    ...termoData,
    id: generateId(),
    sincronizado: false,
    offline: true,
    created_at: new Date().toISOString()
  };

  // 2. Validar
  const validation = validateWithStats(termo, 'termo');
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  // 3. Comprimir fotos
  const fotos = await Promise.all(
    fotoFiles.map(async (file) => {
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        targetSizeKB: 500
      });

      return {
        id: generateId(),
        termo_id: termo.id,
        arquivo_blob: compressed.blob,
        comprimido: true,
        tamanho_original: file.size,
        sincronizado: false,
        offline: true
      };
    })
  );

  // 4. Salvar atomicamente
  await TermoManager.saveWithPhotos(termo, fotos);

  // 5. Adicionar à fila de sync
  await SyncQueue.enqueue('termo', termo.id, 'create', {
    priority: 8
  });

  return termo.id;
}
```

---

## 🔄 Exemplo Completo: Sincronização

```typescript
async function sincronizarTudo() {
  // 1. Verificar conexão
  if (!navigator.onLine) {
    throw new Error('Sem conexão com a internet');
  }

  // 2. Detectar e resolver conflitos
  const conflicts = await ConflictDetector.detectAllConflicts();
  for (const conflict of conflicts) {
    await ConflictDetector.resolveConflict(conflict, 'use_latest');
  }

  // 3. Processar fila
  const result = await SyncQueue.processPending({
    limit: 50,
    onProgress: (p, t) => console.log(`${p}/${t}`)
  });

  console.log(`
    ✅ Sincronização concluída:
    - Processados: ${result.processed}
    - Falhas: ${result.failed}
    - Pendentes: ${result.remaining}
  `);

  return result;
}
```

---

## 🛠️ Troubleshooting Rápido

### Quota Exceeded

```typescript
// Verificar
const quota = await checkStorageQuota();

// Migrar fotos
await migrateAllPhotosToBlob();

// Limpar antigos
await SoftDeleteManager.autoCleanup(30);
```

### Sync Travado

```typescript
// Ver fila
const stats = await SyncQueue.getStats();

// Ver falhas
const failed = await SyncQueue.getFailedItems();

// Retry
for (const item of failed) {
  await SyncQueue.retry(item.id);
}
```

### Dados Inválidos

```typescript
// Validar antes de salvar
const validation = validateWithStats(data, 'termo');

if (!validation.valid) {
  console.error('Erros:', validation.errors);
  // Corrigir dados
}
```

---

## 📖 Links Úteis

- [Guia Completo do Desenvolvedor](./OFFLINE_DEVELOPER_GUIDE.md)
- [P0 Implementation Summary](./P0_IMPLEMENTATION_SUMMARY.md)
- [P1 Implementation Summary](./P1_IMPLEMENTATION_SUMMARY.md)
- [P2 Implementation Summary](./P2_IMPLEMENTATION_SUMMARY.md)
- [Offline System Analysis](./OFFLINE_SYSTEM_ANALYSIS.md)

---

**Última Atualização**: Janeiro 2025
**Versão**: 1.0
