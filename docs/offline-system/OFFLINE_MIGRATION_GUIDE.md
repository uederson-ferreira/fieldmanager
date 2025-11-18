# 🔄 ECOFIELD OFFLINE - MIGRATION GUIDE

> Guia para migrar código existente para usar as novas funcionalidades P0, P1 e P2

---

## 📋 Índice

1. [Visão Geral da Migração](#visão-geral-da-migração)
2. [Migração P0: Funcionalidades Críticas](#migração-p0-funcionalidades-críticas)
3. [Migração P1: Alta Prioridade](#migração-p1-alta-prioridade)
4. [Migração P2: Média Prioridade](#migração-p2-média-prioridade)
5. [Checklist de Migração](#checklist-de-migração)
6. [Breaking Changes](#breaking-changes)
7. [Compatibilidade com Código Antigo](#compatibilidade-com-código-antigo)

---

## 🎯 Visão Geral da Migração

### O que mudou?

- ✅ **Schema do IndexedDB**: Versão 1 → Versão 4
- ✅ **API de Fotos**: Base64 → Blob comprimido
- ✅ **API de CRUD**: Operações diretas → Managers com transações
- ✅ **Sincronização**: Manual → Automática com retry
- ✅ **Validação**: Sem validação → Schemas obrigatórios
- ✅ **Deletes**: Permanentes → Soft deletes

### Tempo Estimado

- **Pequeno projeto** (< 10 arquivos usando offline): ~2-4 horas
- **Médio projeto** (10-30 arquivos): ~1-2 dias
- **Grande projeto** (> 30 arquivos): ~3-5 dias

### Compatibilidade

- ✅ **Backward compatible**: Código antigo continua funcionando
- ⚠️ **Depreciações**: Algumas APIs estão marcadas como deprecated
- 🚀 **Recomendado**: Migrar gradualmente para novas APIs

---

## 🔴 Migração P0: Funcionalidades Críticas

### 1. Transações Atômicas

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - SEM transações
async function salvarTermoComFotos(termo: TermoAmbientalOffline, fotos: TermoFotoOffline[]) {
  try {
    // Salvar termo
    await offlineDB.termos_ambientais.put(termo);

    // Salvar fotos uma a uma
    for (const foto of fotos) {
      await offlineDB.termos_fotos.put(foto);
    }

    console.log('Termo salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar termo:', error);
    // ⚠️ PROBLEMA: Se falhar ao salvar foto, termo fica salvo sem fotos
  }
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - COM transações atômicas
import { TermoManager } from '@/lib/offline/entities/managers/TermoManager';

async function salvarTermoComFotos(termo: TermoAmbientalOffline, fotos: TermoFotoOffline[]) {
  try {
    await TermoManager.saveWithPhotos(
      termo,
      fotos,
      (progress) => {
        console.log(`Salvando: ${progress}%`);
      }
    );

    console.log('✅ Termo salvo atomicamente com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar termo (rollback automático):', error);
    // ✅ SOLUÇÃO: Rollback automático - tudo ou nada
  }
}
```

#### Passos de Migração

1. Identificar todos os lugares onde você salva termo + fotos juntos
2. Substituir por `TermoManager.saveWithPhotos()`
3. Adicionar callback de progresso (opcional)
4. Remover código de cleanup manual de erros (não é mais necessário)

---

### 2. Detecção de Conflitos

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - SEM detecção de conflitos
async function sincronizarTermos() {
  const termosOffline = await offlineDB.termos_ambientais
    .filter(t => !t.sincronizado)
    .toArray();

  for (const termo of termosOffline) {
    // Enviar para API sem verificar conflitos
    await api.post('/termos', termo);

    // Marcar como sincronizado
    await offlineDB.termos_ambientais.update(termo.id, {
      sincronizado: true
    });
  }

  // ⚠️ PROBLEMA: Se termo foi editado no servidor, sobrescreve sem avisar
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - COM detecção de conflitos
import { ConflictDetector } from '@/lib/offline/sync/ConflictDetector';
import { TermoSync } from '@/lib/offline/sync/syncers/TermoSync';

async function sincronizarTermos() {
  // 1. Detectar conflitos ANTES de sincronizar
  const conflicts = await ConflictDetector.detectTermoConflicts();

  if (conflicts.length > 0) {
    console.warn(`⚠️ ${conflicts.length} conflitos detectados`);

    for (const conflict of conflicts) {
      // Permitir usuário escolher estratégia
      const strategy = await askUserConflictStrategy(conflict);

      await ConflictDetector.resolveConflict(conflict, strategy);
    }
  }

  // 2. Sincronizar normalmente
  const result = await TermoSync.syncAll((progress) => {
    console.log(`Sync: ${progress}%`);
  });

  console.log(`✅ Sincronizados: ${result.synced}, Falhas: ${result.failed}`);
}
```

#### Passos de Migração

1. Adicionar `ConflictDetector.detectTermoConflicts()` ANTES de sync
2. Implementar UI para resolver conflitos (ou usar estratégia automática)
3. Resolver conflitos antes de prosseguir com sync
4. Atualizar testes para cobrir cenários de conflito

---

### 3. Proteção de Logout

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - SEM proteção
async function handleLogout() {
  // Logout direto
  await supabase.auth.signOut();
  navigate('/login');

  // ⚠️ PROBLEMA: Pode ter dados não sincronizados que serão perdidos
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - COM proteção
import { canSafelyLogout, getPendingDataSummary } from '@/lib/offline/sync/logoutGuard';

async function handleLogout() {
  // 1. Verificar se pode fazer logout
  const canLogout = await canSafelyLogout();

  if (!canLogout) {
    // 2. Mostrar resumo de dados pendentes
    const summary = await getPendingDataSummary();

    const confirmed = confirm(`
      ⚠️ Atenção! Você tem dados não sincronizados:
      - ${summary.termos} termos
      - ${summary.lvs} LVs
      - ${summary.rotinas} rotinas
      - ${summary.fotos} fotos

      Deseja realmente fazer logout? Os dados serão perdidos.
    `);

    if (!confirmed) {
      return; // Cancelar logout
    }
  }

  // 3. Prosseguir com logout
  await supabase.auth.signOut();
  navigate('/login');
}
```

#### Passos de Migração

1. Importar `canSafelyLogout` e `getPendingDataSummary`
2. Adicionar verificação antes de logout
3. Implementar UI de confirmação com resumo de dados
4. Adicionar botão de "Sincronizar antes de sair" (opcional)

---

## 🟡 Migração P1: Alta Prioridade

### 1. Compressão de Fotos + Blob Storage

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - Base64 SEM compressão
async function handlePhotoCapture(file: File) {
  // Converter para base64 diretamente
  const base64 = await fileToBase64(file);

  await offlineDB.termos_fotos.add({
    id: generateId(),
    termo_id: termoId,
    arquivo_base64: base64, // ⚠️ ~33% maior + sem compressão
    sincronizado: false,
    offline: true
  });

  // ⚠️ PROBLEMA: 3MB foto → 4MB base64 → Quota exceeded rapidamente
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - Blob COM compressão
import { compressImage } from '@/lib/offline/utils/imageCompression';

async function handlePhotoCapture(file: File) {
  // Comprimir imagem
  const result = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    targetSizeKB: 500
  });

  console.log(`Compressão: ${result.compressionRatio.toFixed(1)}%`);

  await offlineDB.termos_fotos.add({
    id: generateId(),
    termo_id: termoId,
    arquivo_blob: result.blob, // ✅ Blob comprimido
    comprimido: true,
    tamanho_original: file.size,
    sincronizado: false,
    offline: true
  });

  // ✅ SOLUÇÃO: 3MB foto → ~450KB blob → ~85% de economia
}
```

#### Migração de Fotos Existentes

```typescript
// Script de migração (executar UMA VEZ)
import { migrateAllPhotosToBlob } from '@/lib/offline/utils/photoMigration';

async function migrarFotosExistentes() {
  console.log('🔄 Iniciando migração de fotos...');

  const result = await migrateAllPhotosToBlob();

  console.log(`
    ✅ Migração concluída:
    - Total processado: ${result.totalProcessed}
    - Migradas: ${result.migrated}
    - Puladas: ${result.skipped}
    - Espaço liberado: ${result.spaceSavedMB.toFixed(1)} MB
  `);
}

// Executar na primeira vez que usuário abrir app após atualização
if (!localStorage.getItem('photos_migrated_v4')) {
  await migrarFotosExistentes();
  localStorage.setItem('photos_migrated_v4', 'true');
}
```

#### Passos de Migração

1. **Código Novo**: Substituir `fileToBase64()` por `compressImage()`
2. **Campos**: Usar `arquivo_blob` ao invés de `arquivo_base64`
3. **Migração**: Executar `migrateAllPhotosToBlob()` uma vez
4. **Uploads**: Atualizar código de upload para suportar Blob
5. **Limpeza**: Marcar `arquivo_base64` como deprecated

---

### 2. Sync Queue Persistente

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - Sync manual sem retry
async function sincronizar() {
  const termosOffline = await offlineDB.termos_ambientais
    .filter(t => !t.sincronizado)
    .toArray();

  for (const termo of termosOffline) {
    try {
      await api.post('/termos', termo);

      await offlineDB.termos_ambientais.update(termo.id, {
        sincronizado: true
      });
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      // ⚠️ PROBLEMA: Se fechar navegador, perde progresso
    }
  }
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - Sync queue com retry automático
import { SyncQueue } from '@/lib/offline/sync/SyncQueue';

// 1. Adicionar à fila ao criar/editar
async function salvarTermo(termo: TermoAmbientalOffline) {
  await offlineDB.termos_ambientais.put(termo);

  // Adicionar à fila de sync
  await SyncQueue.enqueue('termo', termo.id, 'create', {
    priority: 8,
    max_retries: 5
  });
}

// 2. Processar fila
async function sincronizar() {
  const result = await SyncQueue.processPending({
    limit: 10,
    onProgress: (processed, total) => {
      console.log(`${processed}/${total}`);
    }
  });

  console.log(`
    ✅ Resultado:
    - Processados: ${result.processed}
    - Falhas: ${result.failed}
    - Pendentes: ${result.remaining}
  `);

  // ✅ SOLUÇÃO: Progresso salvo no IndexedDB, retry automático
}
```

#### Passos de Migração

1. **Adicionar à fila**: Após salvar entidade, chamar `SyncQueue.enqueue()`
2. **Remover sync manual**: Substituir loops manuais por `SyncQueue.processPending()`
3. **Atualizar syncers**: Modificar syncers para usar fila
4. **UI de progresso**: Adicionar indicador de progresso com `onProgress`
5. **Retry**: Implementar UI para mostrar itens com erro e permitir retry

---

### 3. Background Sync API

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - Sync manual
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      // Usuário precisa clicar em botão para sincronizar
    }

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div>
      {isOnline && <Button onClick={syncManual}>Sincronizar</Button>}
    </div>
  );
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - Background Sync automático
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

function App() {
  const { status, registerBackgroundSync, syncNow } = useBackgroundSync();

  useEffect(() => {
    // Registrar sync automático quando voltar online
    if (navigator.onLine && !status.isRegistered) {
      registerBackgroundSync();
    }
  }, [navigator.onLine, status.isRegistered]);

  return (
    <div>
      {status.isSupported && (
        <Badge variant="success">Auto-sync habilitado</Badge>
      )}

      {status.pendingCount > 0 && (
        <Button onClick={syncNow}>
          Sincronizar agora ({status.pendingCount})
        </Button>
      )}

      {/* ✅ SOLUÇÃO: Sync automático em background quando voltar online */}
    </div>
  );
}
```

#### Passos de Migração

1. **Hook**: Adicionar `useBackgroundSync()` no componente raiz
2. **Registro**: Registrar background sync quando online
3. **UI**: Atualizar UI para mostrar status de sync
4. **Service Worker**: Verificar se `sw.js` está atualizado
5. **Fallback**: Manter botão manual para navegadores sem suporte

---

## 🟢 Migração P2: Média Prioridade

### 1. Validação de Dados

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - SEM validação
async function salvarTermo(termo: TermoAmbientalOffline) {
  // Salvar direto sem validar
  await offlineDB.termos_ambientais.put(termo);

  // ⚠️ PROBLEMA: Pode salvar dados inválidos
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - COM validação
import { validateWithStats, ValidationError } from '@/lib/offline/validation';
import { normalizeData } from '@/lib/offline/validation';

async function salvarTermo(termo: TermoAmbientalOffline) {
  // 1. Normalizar dados (trim strings, converter datas)
  const normalized = normalizeData(termo);

  // 2. Validar
  const validation = validateWithStats(normalized, 'termo');

  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  // 3. Salvar
  await offlineDB.termos_ambientais.put(normalized);

  // ✅ SOLUÇÃO: Dados sempre válidos no IndexedDB
}
```

#### Passos de Migração

1. **Importar**: Adicionar imports de validação
2. **Normalizar**: Chamar `normalizeData()` antes de validar
3. **Validar**: Chamar `validateWithStats()` antes de salvar
4. **Tratar erros**: Implementar UI para mostrar erros de validação
5. **Forms**: Adicionar validação em tempo real nos formulários

---

### 2. Monitoramento de Storage

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - SEM monitoramento
async function salvarFoto(foto: File) {
  try {
    await offlineDB.termos_fotos.add({
      id: generateId(),
      arquivo_base64: await fileToBase64(foto)
    });
  } catch (error) {
    // ⚠️ PROBLEMA: QuotaExceededError sem aviso prévio
    alert('Erro ao salvar foto');
  }
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - COM monitoramento
import { useStorageMonitor } from '@/hooks/useStorageMonitor';
import { hasEnoughSpace } from '@/lib/offline/utils/storageMonitor';

function MyComponent() {
  const { quota, warningLevel, warningMessage } = useStorageMonitor({
    autoRefresh: true
  });

  async function salvarFoto(foto: File) {
    // Verificar espaço ANTES de salvar
    const estimatedSize = foto.size / 1024 / 1024; // MB
    const hasSpace = await hasEnoughSpace(estimatedSize);

    if (!hasSpace) {
      alert('Espaço insuficiente. Por favor, execute manutenção.');
      return;
    }

    // Prosseguir com salvamento
    const compressed = await compressImage(foto);
    await offlineDB.termos_fotos.add({
      id: generateId(),
      arquivo_blob: compressed.blob
    });
  }

  return (
    <div>
      {warningLevel !== 'safe' && (
        <Alert variant="warning">{warningMessage}</Alert>
      )}
      {/* resto do componente */}
    </div>
  );
}
```

#### Passos de Migração

1. **Hook**: Adicionar `useStorageMonitor()` no componente raiz
2. **Alertas**: Mostrar alertas visuais quando storage > 60%
3. **Verificação**: Verificar espaço antes de operações grandes
4. **Manutenção**: Implementar painel de manutenção
5. **Persistência**: Solicitar armazenamento persistente

---

### 3. Soft Deletes

#### ANTES (Código Antigo)

```typescript
// ❌ Código antigo - Delete permanente
async function deletarTermo(id: string) {
  // Delete permanente - sem volta
  await offlineDB.termos_ambientais.delete(id);

  // ⚠️ PROBLEMA: Dados perdidos permanentemente
}

// Listar termos
async function listarTermos() {
  return await offlineDB.termos_ambientais.toArray();
}
```

#### DEPOIS (Código Novo)

```typescript
// ✅ Código novo - Soft delete
import { softDelete, restore, getActive } from '@/lib/offline/utils/softDelete';

async function deletarTermo(id: string, userId: string) {
  // Soft delete - recuperável
  const result = await softDelete(
    offlineDB.termos_ambientais,
    id,
    userId
  );

  console.log(`✅ Termo deletado em ${result.deletedAt}`);
}

// Restaurar
async function restaurarTermo(id: string) {
  await restore(offlineDB.termos_ambientais, id);
  console.log('✅ Termo restaurado');
}

// Listar APENAS ativos (não deletados)
async function listarTermos() {
  return await getActive(offlineDB.termos_ambientais);
}
```

#### Passos de Migração

1. **Substituir deletes**: Trocar `.delete()` por `softDelete()`
2. **Filtrar ativos**: Usar `getActive()` ao invés de `.toArray()`
3. **Lixeira**: Implementar UI de lixeira com `getDeleted()`
4. **Restauração**: Adicionar botão de restaurar
5. **Limpeza**: Agendar limpeza automática mensal

---

## ✅ Checklist de Migração

### Preparação

- [ ] Fazer backup do banco de dados atual
- [ ] Atualizar dependências (Dexie, React, TypeScript)
- [ ] Criar branch de migração
- [ ] Comunicar time sobre breaking changes

### P0 - Crítico

- [ ] Substituir salvamento direto por `TermoManager.saveWithPhotos()`
- [ ] Adicionar `ConflictDetector` antes de syncs
- [ ] Implementar `canSafelyLogout()` no logout
- [ ] Atualizar testes para cobrir transações

### P1 - Alta Prioridade

- [ ] Substituir base64 por `compressImage()` + Blob
- [ ] Executar migração de fotos existentes
- [ ] Adicionar `SyncQueue.enqueue()` após CRUD
- [ ] Substituir sync manual por `SyncQueue.processPending()`
- [ ] Adicionar `useBackgroundSync()` no App
- [ ] Atualizar Service Worker

### P2 - Média Prioridade

- [ ] Adicionar validação em todos os saves
- [ ] Implementar `useStorageMonitor()` no App
- [ ] Substituir `.delete()` por `softDelete()`
- [ ] Substituir `.toArray()` por `getActive()`
- [ ] Implementar UI de lixeira
- [ ] Agendar limpeza automática

### Finalização

- [ ] Executar testes E2E
- [ ] Testar offline completo
- [ ] Testar sincronização
- [ ] Testar migração de dados
- [ ] Atualizar documentação
- [ ] Deploy gradual (beta → produção)

---

## ⚠️ Breaking Changes

### 1. Schema do IndexedDB

**Antes**: Version 3
**Depois**: Version 4 (com `sync_queue` table)

**Impacto**: Upgrade automático pelo Dexie, sem perda de dados.

---

### 2. Interface `TermoFotoOffline`

**Antes**:
```typescript
interface TermoFotoOffline {
  arquivo_base64: string;
}
```

**Depois**:
```typescript
interface TermoFotoOffline {
  arquivo_base64?: string; // DEPRECATED
  arquivo_blob?: Blob;      // NOVO
  comprimido?: boolean;     // NOVO
  tamanho_original?: number;// NOVO
}
```

**Impacto**: Backward compatible, mas `arquivo_base64` está deprecated.

---

### 3. Métodos de Deleção

**Antes**:
```typescript
await offlineDB.termos_ambientais.delete(id);
```

**Depois**:
```typescript
await softDelete(offlineDB.termos_ambientais, id, userId);
```

**Impacto**: Não é breaking change, mas altamente recomendado migrar.

---

### 4. Listagem de Entidades

**Antes**:
```typescript
const termos = await offlineDB.termos_ambientais.toArray();
```

**Depois**:
```typescript
const termos = await getActive(offlineDB.termos_ambientais);
```

**Impacto**: `.toArray()` agora retorna deletados também. Use `getActive()`.

---

## 🔄 Compatibilidade com Código Antigo

### Período de Transição

Todas as mudanças são **backward compatible** durante período de transição:

- ✅ `arquivo_base64` continua funcionando (até versão 2.0)
- ✅ `.delete()` continua funcionando (até versão 2.0)
- ✅ `.toArray()` continua funcionando
- ✅ Sync manual continua funcionando

### Depreciações Planejadas

| API | Status | Removida em |
|-----|--------|-------------|
| `arquivo_base64` | Deprecated | v2.0 (Jun 2025) |
| Sync manual sem queue | Deprecated | v2.0 (Jun 2025) |
| Delete permanente | Deprecated | v2.0 (Jun 2025) |

---

## 🚀 Estratégia de Migração Recomendada

### Fase 1: Preparação (Semana 1)

1. Estudar documentação completa
2. Fazer backup de dados de produção
3. Testar migração em ambiente de dev
4. Comunicar time sobre mudanças

### Fase 2: P0 - Crítico (Semana 2)

1. Implementar transações atômicas
2. Adicionar detecção de conflitos
3. Implementar proteção de logout
4. Testes extensivos

### Fase 3: P1 - Alta Prioridade (Semana 3-4)

1. Migrar fotos para Blob
2. Implementar sync queue
3. Adicionar background sync
4. Testes de sincronização

### Fase 4: P2 - Média Prioridade (Semana 5)

1. Adicionar validação
2. Implementar monitoramento
3. Implementar soft deletes
4. UI de manutenção

### Fase 5: Deploy Gradual (Semana 6)

1. Deploy para usuários beta
2. Monitorar erros e performance
3. Ajustes finais
4. Deploy para produção

---

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Consulte [OFFLINE_DEVELOPER_GUIDE.md](./OFFLINE_DEVELOPER_GUIDE.md)
2. Consulte [OFFLINE_QUICK_REFERENCE.md](./OFFLINE_QUICK_REFERENCE.md)
3. Consulte troubleshooting em cada documento de implementação (P0, P1, P2)
4. Abra issue no repositório com tag `migration`

---

**Última Atualização**: Janeiro 2025
**Versão**: 1.0
