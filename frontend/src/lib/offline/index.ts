// ===================================================================
// EXPORTAÇÕES PRINCIPAIS - ECOFIELD OFFLINE SYSTEM
// ===================================================================

// Database
export { EcoFieldDB, offlineDB } from './database';
export type { SyncQueueItem } from './database/EcoFieldDB';

// Entity Managers
export {
  TermoManager,
  TermoFotoManager,
  LVManager,
  LVAvaliacaoManager,
  LVFotoManager,
  AtividadeRotinaManager,
  FotoRotinaManager,
  EncarregadoManager,
  InspecaoManager,
  RespostaInspecaoManager,
  FotoInspecaoManager
  // ❌ REMOVIDO: LVResiduosManager, LVResiduosAvaliacaoManager, LVResiduosFotoManager
  // ✅ UNIFICAÇÃO: Usar LVManager com tipo_lv='residuos'
} from './entities';

// Syncers
export {
  TermoSync,
  LVSync,
  AtividadeRotinaSync,
  EncarregadoSync,
  InspecaoSync
} from './sync';

// ✅ P1 #2: Sync Queue
export { SyncQueue } from './sync';
export type { SyncQueueResult, SyncQueueStats } from './sync';

// Types
export type {
  ProgressCallback,
  SyncResult,
  LVProgressCallback,
  LVSyncResult
} from './sync';

// Funções de Compatibilidade (substituem as antigas do offlineDB.ts)
export * from './compatibility';

// ✅ P1 #1: Utilitários de compressão e migração de fotos
export * from './utils';

// ✅ P2 #1: Sistema de validação de dados
export * from './validation';
