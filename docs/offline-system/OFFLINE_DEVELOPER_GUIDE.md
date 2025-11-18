# 📘 ECOFIELD OFFLINE SYSTEM - GUIA DO DESENVOLVEDOR

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [P0: Funcionalidades Críticas](#p0-funcionalidades-críticas)
4. [P1: Funcionalidades de Alta Prioridade](#p1-funcionalidades-de-alta-prioridade)
5. [P2: Funcionalidades de Média Prioridade](#p2-funcionalidades-de-média-prioridade)
6. [Guia de Uso Prático](#guia-de-uso-prático)
7. [Melhores Práticas](#melhores-práticas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **EcoField Offline System** é um sistema robusto de sincronização offline-first para aplicações web progressivas (PWA). Ele permite que usuários trabalhem completamente offline e sincronizem dados automaticamente quando a conexão for restaurada.

### Status das Implementações

- ✅ **P0 (Crítico)**: 100% Implementado
- ✅ **P1 (Alta Prioridade)**: 100% Implementado
- ✅ **P2 (Média Prioridade)**: 100% Implementado

### Benefícios Principais

- 🔒 **Transações Atômicas**: Dados sempre consistentes
- 🔄 **Sync Automático**: Retry com backoff exponencial
- 📦 **Compressão de Imagens**: ~85% de redução no uso de storage
- ✅ **Validação de Dados**: Qualidade garantida antes do armazenamento
- 📊 **Monitoramento de Quota**: Alertas proativos de storage
- 🗑️ **Soft Deletes**: Recuperação de dados deletados acidentalmente
- ⚡ **Background Sync**: Sincronização automática em background

---

## 🏗️ Arquitetura do Sistema

### Camadas do Sistema

```
┌─────────────────────────────────────────────────────┐
│              React Components (UI)                  │
├─────────────────────────────────────────────────────┤
│              Custom Hooks                           │
│  useBackgroundSync | useStorageMonitor              │
├─────────────────────────────────────────────────────┤
│              Entity Managers                        │
│  TermoManager | LVManager | RotinaManager           │
├─────────────────────────────────────────────────────┤
│              Sync Layer                             │
│  SyncQueue | Syncers | Conflict Detection           │
├─────────────────────────────────────────────────────┤
│              Utilities                              │
│  Validation | Storage Monitor | Soft Delete         │
├─────────────────────────────────────────────────────┤
│              IndexedDB (Dexie)                      │
│  termos | lvs | rotinas | sync_queue | ...          │
├─────────────────────────────────────────────────────┤
│              Service Worker                         │
│  Background Sync API | Cache Strategy               │
└─────────────────────────────────────────────────────┘
```

### Versões do Schema

- **Version 1**: Schema inicial (termos, fotos, lvs)
- **Version 2**: Adicionado support LV, rotinas, inspeções
- **Version 3**: ✅ P0 - Adicionado conflict tracking
- **Version 4**: ✅ P1 - Adicionado sync_queue persistente

---

## 🔴 P0: Funcionalidades Críticas

### 1. Transações Atômicas com Dexie

**Problema Resolvido**: Inconsistências de dados ao salvar múltiplas entidades relacionadas.

**Como Usar**:

```typescript
import { TermoManager } from '@/lib/offline/entities/managers/TermoManager';

async function salvarTermoCompleto() {
  try {
    await TermoManager.saveWithPhotos(
      termo,
      fotos,
      (progress) => console.log(`Progresso: ${progress}%`)
    );
    console.log('✅ Termo e fotos salvos atomicamente');
  } catch (error) {
    console.error('❌ Rollback automático em caso de erro');
  }
}
```

**Benefícios**:
- ✅ Tudo é salvo ou nada é salvo (all-or-nothing)
- ✅ Rollback automático em caso de erro
- ✅ Callbacks de progresso

---

### 2. Detecção de Conflitos

**Problema Resolvido**: Conflitos silenciosos quando o mesmo dado é modificado em múltiplos dispositivos.

**Como Usar**:

```typescript
import { ConflictDetector } from '@/lib/offline/sync/ConflictDetector';

async function sincronizarComDeteccaoDeConflitos() {
  const conflicts = await ConflictDetector.detectTermoConflicts();

  if (conflicts.length > 0) {
    console.warn('⚠️ Conflitos detectados:', conflicts);

    for (const conflict of conflicts) {
      // Estratégia: Última modificação vence
      await ConflictDetector.resolveConflict(
        conflict,
        'use_latest'
      );
    }
  }
}
```

**Estratégias de Resolução**:
- `use_local`: Mantém versão local
- `use_remote`: Usa versão remota
- `use_latest`: Usa modificação mais recente
- `manual`: Exige resolução manual

---

### 3. Bloqueio de Logout com Dados Pendentes

**Problema Resolvido**: Perda de dados não sincronizados ao fazer logout.

**Como Usar**:

```typescript
import { canSafelyLogout } from '@/lib/offline/sync/logoutGuard';

async function handleLogout() {
  const canLogout = await canSafelyLogout();

  if (!canLogout) {
    alert('Existem dados pendentes de sincronização. Aguarde ou force o logout.');
    return;
  }

  // Prosseguir com logout
  await performLogout();
}
```

**Interface de Alerta**:

```typescript
// Hook customizado
const { hasPendingData, pendingCounts } = usePendingDataCheck();

{hasPendingData && (
  <Alert variant="warning">
    <AlertTitle>Dados Pendentes</AlertTitle>
    <AlertDescription>
      {pendingCounts.termos} termos, {pendingCounts.lvs} LVs pendentes
    </AlertDescription>
  </Alert>
)}
```

---

### 4. Correção de Bugs de Sincronização de Fotos

**Problema Resolvido**: Falhas na sincronização de fotos por timeout ou tamanho.

**Melhorias Implementadas**:

```typescript
// Antes: Upload sem retry
await uploadPhoto(photo);

// Depois: Upload com retry e timeout configurável
await TermoSync.uploadPhotoWithRetry(photo, {
  maxRetries: 3,
  timeout: 30000, // 30 segundos
  onProgress: (progress) => updateUI(progress)
});
```

**Recursos**:
- ✅ Retry automático (até 3 tentativas)
- ✅ Timeout configurável
- ✅ Callbacks de progresso
- ✅ Compressão automática antes do upload

---

## 🟡 P1: Funcionalidades de Alta Prioridade

### 1. Compressão de Imagens + Blob Storage

**Problema Resolvido**: Quota exceeded devido a fotos em base64 sem compressão.

**Economia de Storage**: ~85% de redução total
- 33% ao usar Blob ao invés de base64
- 70-80% com compressão JPEG

**Como Usar**:

```typescript
import { compressImage } from '@/lib/offline/utils/imageCompression';

async function salvarFotoComprimida(file: File) {
  // Comprimir imagem
  const result = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    targetSizeKB: 500
  });

  console.log(`Compressão: ${result.compressionRatio.toFixed(1)}%`);

  // Salvar como Blob
  await offlineDB.termos_fotos.add({
    id: generateId(),
    termo_id: termoId,
    arquivo_blob: result.blob,
    comprimido: true,
    tamanho_original: result.originalSize,
    sincronizado: false,
    offline: true
  });
}
```

**Migração de Fotos Antigas**:

```typescript
import { migrateAllPhotosToBlob } from '@/lib/offline/utils/photoMigration';

async function migrarFotosAntidas() {
  const result = await migrateAllPhotosToBlob();

  console.log(`
    ✅ Migração concluída:
    - Total processado: ${result.totalProcessed}
    - Migradas: ${result.migrated}
    - Espaço liberado: ${result.spaceSavedMB.toFixed(1)} MB
  `);
}
```

---

### 2. Sync Queue Persistente com Retry Logic

**Problema Resolvido**: Perda de progresso de sincronização ao fechar o navegador.

**Como Usar**:

```typescript
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';

// Adicionar item à fila
async function agendarSincronizacao() {
  const queueId = await SyncQueue.enqueue(
    'termo',           // tipo de entidade
    termoId,           // ID da entidade
    'create',          // operação
    {
      priority: 5,     // prioridade (0-10)
      max_retries: 5   // tentativas máximas
    }
  );

  console.log(`✅ Item adicionado à fila: ${queueId}`);
}

// Processar fila
async function processarFila() {
  const result = await SyncQueue.processPending({
    limit: 10,         // processar até 10 itens
    onProgress: (processed, total) => {
      console.log(`Progresso: ${processed}/${total}`);
    }
  });

  console.log(`
    Resultado:
    - Sucesso: ${result.processed}
    - Falhas: ${result.failed}
    - Pendentes: ${result.remaining}
  `);
}
```

**Backoff Exponencial**:

| Tentativa | Delay    |
|-----------|----------|
| 1         | 1 seg    |
| 2         | 5 seg    |
| 3         | 15 seg   |
| 4         | 60 seg   |
| 5         | 300 seg  |

---

### 3. Background Sync API

**Problema Resolvido**: Necessidade de sincronização manual.

**Como Usar**:

```typescript
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

function MyComponent() {
  const { status, registerBackgroundSync, syncNow } = useBackgroundSync();

  useEffect(() => {
    // Registrar sync automático quando voltar online
    if (navigator.onLine && !status.isRegistered) {
      registerBackgroundSync();
    }
  }, [navigator.onLine]);

  return (
    <div>
      {status.isSupported ? (
        <Badge variant="success">Background Sync Habilitado</Badge>
      ) : (
        <Badge variant="warning">Background Sync Não Suportado</Badge>
      )}

      {status.pendingCount > 0 && (
        <Button onClick={syncNow}>
          Sincronizar Agora ({status.pendingCount} pendentes)
        </Button>
      )}
    </div>
  );
}
```

**Service Worker Integration**:

```javascript
// public/sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});
```

---

## 🟢 P2: Funcionalidades de Média Prioridade

### 1. Validação de Dados com Schemas

**Problema Resolvido**: Dados inválidos sendo salvos no IndexedDB.

**Como Usar**:

```typescript
import { validateWithStats, ValidationError } from '@/lib/offline/validation';

async function salvarComValidacao(termo: TermoAmbientalOffline) {
  try {
    // Validar dados
    const validation = validateWithStats(termo, 'termo');

    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Salvar no banco
    await offlineDB.termos_ambientais.put(termo);

    console.log('✅ Termo validado e salvo');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Erros de validação:', error.errors);
      // Mostrar erros na UI
    }
  }
}
```

**Schemas Disponíveis**:

- `termo` - Termos Ambientais
- `lv` - Listas de Verificação
- `rotina` - Atividades de Rotina
- `inspecao` - Inspeções
- `encarregado` - Encarregados
- `foto` - Fotos
- `syncQueueItem` - Itens da fila de sync

**Criar Schema Customizado**:

```typescript
import { Validator } from '@/lib/offline/validation/schemas';

const meuSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'nome', required: true, type: 'string', min: 3, max: 100 },
  { field: 'email', required: false, type: 'email' },
  { field: 'idade', required: false, type: 'number', min: 18, max: 120 },
  {
    field: 'telefone',
    required: false,
    custom: (value) => {
      if (value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
        return 'Telefone inválido. Use o formato (99) 99999-9999';
      }
    }
  }
]);

const resultado = meuSchema.validate(dados);
```

---

### 2. Monitoramento de Quota de Storage

**Problema Resolvido**: App crashando por quota exceeded sem aviso prévio.

**Como Usar**:

```typescript
import { useStorageMonitor } from '@/hooks/useStorageMonitor';

function StorageStatusComponent() {
  const {
    quota,
    warningLevel,
    warningMessage,
    isPersisted,
    refresh,
    requestPersistence
  } = useStorageMonitor({
    autoRefresh: true,
    refreshInterval: 60000 // 1 minuto
  });

  // Alertas visuais
  const getAlertVariant = () => {
    switch (warningLevel) {
      case 'full': return 'error';
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div>
      {quota && (
        <>
          <Alert variant={getAlertVariant()}>
            <AlertTitle>Armazenamento</AlertTitle>
            <AlertDescription>
              {warningMessage}
              <br />
              Usando: {quota.usageMB.toFixed(1)} MB de {quota.quotaMB.toFixed(1)} MB
              ({quota.usagePercent.toFixed(1)}%)
            </AlertDescription>
          </Alert>

          {!isPersisted && (
            <Button onClick={requestPersistence}>
              Solicitar Armazenamento Persistente
            </Button>
          )}
        </>
      )}
    </div>
  );
}
```

**Níveis de Alerta**:

| Nível    | % Uso   | Mensagem                                    |
|----------|---------|---------------------------------------------|
| safe     | < 60%   | Espaço suficiente disponível                |
| warning  | 60-79%  | Atenção: espaço de armazenamento limitado   |
| critical | 80-94%  | CRÍTICO: pouco espaço disponível            |
| full     | ≥ 95%   | ALERTA: armazenamento quase cheio           |

**API Programática**:

```typescript
import { checkStorageQuota, hasEnoughSpace } from '@/lib/offline/utils/storageMonitor';

// Verificar quota
const quota = await checkStorageQuota();
console.log(`Disponível: ${quota.availableMB.toFixed(1)} MB`);

// Verificar se há espaço para operação
const canSavePhoto = await hasEnoughSpace(5); // 5 MB
if (!canSavePhoto) {
  alert('Espaço insuficiente para salvar foto');
}
```

---

### 3. Soft Deletes (Recuperação de Dados)

**Problema Resolvido**: Perda permanente de dados deletados acidentalmente.

**Como Usar**:

```typescript
import { softDelete, restore, getActive, getDeleted } from '@/lib/offline/utils/softDelete';
import { offlineDB } from '@/lib/offline/database';

// Soft delete
async function deletarTermo(id: string, userId: string) {
  const result = await softDelete(
    offlineDB.termos_ambientais,
    id,
    userId
  );

  if (result.success) {
    console.log(`✅ Termo marcado como deletado em ${result.deletedAt}`);
  }
}

// Restaurar
async function restaurarTermo(id: string) {
  const success = await restore(offlineDB.termos_ambientais, id);

  if (success) {
    console.log('✅ Termo restaurado com sucesso');
  }
}

// Listar apenas ativos
const termosAtivos = await getActive(offlineDB.termos_ambientais);

// Listar deletados
const termosDeletados = await getDeleted(offlineDB.termos_ambientais);
```

**Interface de Lixeira**:

```typescript
function LixeiraComponent() {
  const [deletados, setDeletados] = useState<TermoAmbientalOffline[]>([]);

  useEffect(() => {
    async function carregarDeletados() {
      const items = await getDeleted(offlineDB.termos_ambientais);
      setDeletados(items);
    }
    carregarDeletados();
  }, []);

  return (
    <div>
      <h2>Lixeira ({deletados.length})</h2>
      {deletados.map(termo => (
        <Card key={termo.id}>
          <CardHeader>
            <CardTitle>{termo.titulo}</CardTitle>
            <CardDescription>
              Deletado em {new Date(termo.deleted_at!).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => handleRestore(termo.id)}>
              Restaurar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

**Limpeza Automática**:

```typescript
import { SoftDeleteManager } from '@/lib/offline/utils/softDelete';

// Limpar itens deletados há mais de 30 dias
async function limparLixeira() {
  const result = await SoftDeleteManager.autoCleanup(30);

  console.log(`
    Limpeza concluída:
    - Termos: ${result.termos}
    - LVs: ${result.lvs}
    - Rotinas: ${result.rotinas}
    - Total: ${result.total}
  `);
}
```

---

## 🎓 Guia de Uso Prático

### Caso de Uso 1: Criar Termo Offline com Fotos

```typescript
import { TermoManager } from '@/lib/offline/entities/managers/TermoManager';
import { compressImage } from '@/lib/offline/utils/imageCompression';
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';

async function criarTermoOffline(
  termoData: Partial<TermoAmbientalOffline>,
  fotoFiles: File[]
) {
  try {
    // 1. Validar e normalizar dados
    const termoCompleto: TermoAmbientalOffline = {
      ...termoData,
      id: generateId(),
      sincronizado: false,
      offline: true,
      created_at: new Date().toISOString()
    };

    // 2. Comprimir fotos
    const fotosComprimidas = await Promise.all(
      fotoFiles.map(async (file) => {
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          targetSizeKB: 500
        });

        return {
          id: generateId(),
          termo_id: termoCompleto.id,
          arquivo_blob: compressed.blob,
          comprimido: true,
          tamanho_original: compressed.originalSize,
          sincronizado: false,
          offline: true
        };
      })
    );

    // 3. Salvar atomicamente
    await TermoManager.saveWithPhotos(
      termoCompleto,
      fotosComprimidas,
      (progress) => console.log(`Salvando: ${progress}%`)
    );

    // 4. Adicionar à fila de sync
    await SyncQueue.enqueue('termo', termoCompleto.id, 'create', {
      priority: 8
    });

    console.log('✅ Termo criado offline com sucesso');
    return termoCompleto.id;

  } catch (error) {
    console.error('❌ Erro ao criar termo offline:', error);
    throw error;
  }
}
```

---

### Caso de Uso 2: Sincronização Completa

```typescript
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';
import { ConflictDetector } from '@/lib/offline/sync/ConflictDetector';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

function SyncComponent() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const { status } = useBackgroundSync();

  async function sincronizarTudo() {
    setIsSyncing(true);

    try {
      // 1. Detectar conflitos
      const conflicts = await ConflictDetector.detectAllConflicts();

      if (conflicts.length > 0) {
        console.warn(`⚠️ ${conflicts.length} conflitos detectados`);

        // Resolver automaticamente com "última modificação vence"
        for (const conflict of conflicts) {
          await ConflictDetector.resolveConflict(conflict, 'use_latest');
        }
      }

      // 2. Processar fila de sync
      const result = await SyncQueue.processPending({
        limit: 50,
        onProgress: (processed, total) => {
          setProgress({ processed, total });
        }
      });

      console.log(`
        ✅ Sincronização concluída:
        - Processados: ${result.processed}
        - Falhas: ${result.failed}
        - Pendentes: ${result.remaining}
      `);

      // 3. Verificar estatísticas
      const stats = await SyncQueue.getStats();
      console.log('Estatísticas da fila:', stats);

    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div>
      <Button
        onClick={sincronizarTudo}
        disabled={isSyncing || !navigator.onLine}
      >
        {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
      </Button>

      {isSyncing && (
        <Progress
          value={(progress.processed / progress.total) * 100}
        />
      )}

      {status.pendingCount > 0 && (
        <Badge>{status.pendingCount} itens pendentes</Badge>
      )}
    </div>
  );
}
```

---

### Caso de Uso 3: Monitoramento e Manutenção

```typescript
import { useStorageMonitor } from '@/hooks/useStorageMonitor';
import { SoftDeleteManager } from '@/lib/offline/utils/softDelete';
import { migrateAllPhotosToBlob } from '@/lib/offline/utils/photoMigration';

function MaintenancePanel() {
  const { quota, warningLevel, refresh } = useStorageMonitor({
    autoRefresh: true
  });

  async function executarManutencao() {
    console.log('🔧 Iniciando manutenção...');

    // 1. Limpar soft deletes antigos (>30 dias)
    const cleanupResult = await SoftDeleteManager.autoCleanup(30);
    console.log(`🗑️ Removidos ${cleanupResult.total} itens antigos`);

    // 2. Migrar fotos para blob comprimido
    const migrationResult = await migrateAllPhotosToBlob();
    console.log(`📸 Liberados ${migrationResult.spaceSavedMB.toFixed(1)} MB`);

    // 3. Atualizar quota
    await refresh();

    console.log('✅ Manutenção concluída');
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Manutenção do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {quota && (
            <div>
              <p>Uso de Storage: {quota.usagePercent.toFixed(1)}%</p>
              <p>Disponível: {quota.availableMB.toFixed(1)} MB</p>

              {warningLevel !== 'safe' && (
                <Alert variant="warning">
                  Considere executar manutenção para liberar espaço
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={executarManutencao}>
            Executar Manutenção
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

## ✅ Melhores Práticas

### 1. Sempre Validar Antes de Salvar

```typescript
// ❌ NÃO FAZER
await offlineDB.termos_ambientais.put(termo);

// ✅ FAZER
import { validateWithStats, ValidationError } from '@/lib/offline/validation';

const validation = validateWithStats(termo, 'termo');
if (!validation.valid) {
  throw new ValidationError(validation.errors);
}
await offlineDB.termose_ambientais.put(termo);
```

---

### 2. Usar Transações para Operações Relacionadas

```typescript
// ❌ NÃO FAZER (pode deixar dados inconsistentes)
await offlineDB.termos_ambientais.put(termo);
for (const foto of fotos) {
  await offlineDB.termos_fotos.put(foto);
}

// ✅ FAZER (tudo ou nada)
await TermoManager.saveWithPhotos(termo, fotos);
```

---

### 3. Sempre Comprimir Imagens

```typescript
// ❌ NÃO FAZER (vai estourar quota rapidamente)
await offlineDB.termos_fotos.add({
  arquivo_base64: await fileToBase64(file)
});

// ✅ FAZER (economia de ~85%)
import { compressImage } from '@/lib/offline/utils/imageCompression';

const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  targetSizeKB: 500
});

await offlineDB.termos_fotos.add({
  arquivo_blob: compressed.blob,
  comprimido: true,
  tamanho_original: file.size
});
```

---

### 4. Usar Soft Delete ao Invés de Delete Permanente

```typescript
// ❌ NÃO FAZER (perda permanente)
await offlineDB.termos_ambientais.delete(id);

// ✅ FAZER (recuperável)
import { softDelete } from '@/lib/offline/utils/softDelete';

await softDelete(offlineDB.termos_ambientais, id, userId);
```

---

### 5. Monitorar Storage Proativamente

```typescript
// ✅ FAZER - Componente de monitoramento
function App() {
  const { warningLevel, warningMessage } = useStorageMonitor({
    autoRefresh: true,
    refreshInterval: 60000
  });

  return (
    <>
      {warningLevel !== 'safe' && (
        <Alert variant="warning">{warningMessage}</Alert>
      )}
      {/* resto da app */}
    </>
  );
}
```

---

### 6. Adicionar Items à Sync Queue

```typescript
// ✅ FAZER - Sempre adicionar à fila após criar/editar
await offlineDB.termos_ambientais.put(termo);
await SyncQueue.enqueue('termo', termo.id, 'create', { priority: 8 });
```

---

### 7. Tratar Conflitos de Sincronização

```typescript
// ✅ FAZER - Detectar e resolver conflitos antes de sync
import { ConflictDetector } from '@/lib/offline/sync/ConflictDetector';

const conflicts = await ConflictDetector.detectTermoConflicts();

for (const conflict of conflicts) {
  // Permitir usuário escolher ou usar estratégia automática
  await ConflictDetector.resolveConflict(conflict, 'use_latest');
}
```

---

## 🔧 Troubleshooting

### Problema: "QuotaExceededError"

**Solução**:

```typescript
import { checkStorageQuota } from '@/lib/offline/utils/storageMonitor';
import { migrateAllPhotosToBlob } from '@/lib/offline/utils/photoMigration';

// 1. Verificar quota
const quota = await checkStorageQuota();
console.log(`Usando ${quota.usagePercent.toFixed(1)}%`);

// 2. Migrar fotos para liberar espaço
const result = await migrateAllPhotosToBlob();
console.log(`Liberados ${result.spaceSavedMB.toFixed(1)} MB`);

// 3. Limpar itens antigos
const cleanup = await SoftDeleteManager.autoCleanup(30);
console.log(`Removidos ${cleanup.total} itens antigos`);
```

---

### Problema: Dados não sincronizando

**Solução**:

```typescript
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';

// 1. Verificar itens na fila
const stats = await SyncQueue.getStats();
console.log('Fila:', stats);

// 2. Verificar itens com erro
const failed = await SyncQueue.getFailedItems();
console.log('Falhas:', failed);

// 3. Tentar reprocessar falhas
for (const item of failed) {
  await SyncQueue.retry(item.id);
}
```

---

### Problema: Conflitos frequentes

**Solução**:

```typescript
import { ConflictDetector } from '@/lib/offline/sync/ConflictDetector';

// Obter estatísticas de conflitos
const stats = await ConflictDetector.getConflictStats();
console.log('Conflitos:', stats);

// Configurar resolução automática
await ConflictDetector.setAutoResolveStrategy('use_latest');
```

---

### Problema: Service Worker não sincronizando

**Solução**:

```typescript
// 1. Verificar suporte
if (!('serviceWorker' in navigator)) {
  console.error('Service Worker não suportado');
}

// 2. Verificar registro
const registration = await navigator.serviceWorker.ready;
console.log('SW registrado:', registration);

// 3. Verificar Background Sync
if ('sync' in registration) {
  await registration.sync.register('sync-offline-data');
  console.log('Background Sync registrado');
} else {
  console.warn('Background Sync não suportado');
}
```

---

## 📊 Estatísticas e Métricas

### Monitoramento da Fila de Sync

```typescript
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';

const stats = await SyncQueue.getStats();

console.log(`
  📊 Estatísticas da Fila:

  Total de Itens: ${stats.total}
  Pendentes: ${stats.pending}
  Agendados: ${stats.scheduled}
  Com Erro: ${stats.withErrors}

  Mais Antigo: ${stats.oldestCreatedAt}
  Mais Recente: ${stats.newestCreatedAt}

  Por Tipo:
  - Termos: ${stats.byEntityType.termo || 0}
  - LVs: ${stats.byEntityType.lv || 0}
  - Rotinas: ${stats.byEntityType.rotina || 0}
`);
```

---

### Estatísticas de Validação

```typescript
import { validationStats } from '@/lib/offline/validation';

const stats = validationStats.getStats();

console.log(`
  ✅ Estatísticas de Validação:

  Total: ${stats.totalValidations}
  Sucesso: ${stats.successCount}
  Falhas: ${stats.failureCount}
  Taxa de Sucesso: ${((stats.successCount / stats.totalValidations) * 100).toFixed(1)}%

  Erros por Tipo:
  ${JSON.stringify(stats.errorsByType, null, 2)}
`);
```

---

### Estatísticas de Soft Delete

```typescript
import { SoftDeleteManager } from '@/lib/offline/utils/softDelete';

const stats = await SoftDeleteManager.getGeneralStats();

console.log(`
  🗑️ Estatísticas de Soft Delete:

  Termos:
  - Total: ${stats.termos.total}
  - Ativos: ${stats.termos.active}
  - Deletados: ${stats.termos.deleted}

  LVs:
  - Total: ${stats.lvs.total}
  - Ativos: ${stats.lvs.active}
  - Deletados: ${stats.lvs.deleted}
`);
```

---

## 🎯 Conclusão

O **EcoField Offline System** agora possui uma arquitetura robusta e completa com:

- ✅ **P0 (Crítico)**: Transações atômicas, detecção de conflitos, proteção contra perda de dados
- ✅ **P1 (Alta Prioridade)**: Compressão de imagens, sync queue persistente, background sync
- ✅ **P2 (Média Prioridade)**: Validação de dados, monitoramento de storage, soft deletes

### Próximos Passos Recomendados

1. **Testes**: Criar testes unitários e de integração
2. **UI Components**: Criar componentes React para todas as funcionalidades
3. **Documentação de API**: Gerar documentação com TypeDoc
4. **Performance**: Monitorar e otimizar queries IndexedDB
5. **P3 Items**: Considerar implementação de funcionalidades nice-to-have

---

**Versão do Documento**: 1.0
**Última Atualização**: Janeiro 2025
**Autores**: Claude Code (Anthropic)
