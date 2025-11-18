// ===================================================================
// EXPORTAÇÕES DOS SYNCERS - ECOFIELD OFFLINE SYSTEM
// ===================================================================

// Syncers principais
export { TermoSync } from './syncers/TermoSync';
export { LVSync } from './syncers/LVSync';
export { AtividadeRotinaSync } from './syncers/AtividadeRotinaSync';
export { EncarregadoSync } from './syncers/EncarregadoSync';
export { InspecaoSync } from './syncers/InspecaoSync';

// ✅ P1 #2: Sync Queue (Fila de sincronização persistente)
export { SyncQueue } from './SyncQueue';
export type { SyncQueueResult, SyncQueueStats } from './SyncQueue';

// ✅ SPRINT 2: Conflict Resolver (Detecção de conflitos)
export { ConflictResolver } from './ConflictResolver';
export type {
  ConflictType,
  ConflictStrategy,
  ConflictDetectionResult,
  ConflictableEntity,
} from './ConflictResolver';

// Tipos de callback e resultado
export type { ProgressCallback, SyncResult } from './syncers/TermoSync';
export type { LVProgressCallback, LVSyncResult } from './syncers/LVSync';
