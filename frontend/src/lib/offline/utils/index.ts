// ===================================================================
// EXPORTAÇÕES DE UTILITÁRIOS - ECOFIELD OFFLINE SYSTEM
// ===================================================================

// ✅ P1 #1: Compressão de imagens e migração de fotos
export { compressImage, blobToBase64, base64ToBlob, supportsIndexedDBBlobs, estimateStorageSavings } from './imageCompression';
export type { CompressionOptions, CompressionResult } from './imageCompression';

export { migrateAllPhotosToBlob, cleanupBase64Data, getMigrationStatus } from './photoMigration';
export type { PhotoMigrationResult } from './photoMigration';

// ✅ P2 #2: Monitoramento de quota de storage
export {
  checkStorageQuota,
  getStorageBreakdown,
  getWarningLevel,
  getWarningMessage,
  hasEnoughSpace,
  estimateSpace,
  StorageMonitor,
  storageMonitor,
  requestPersistentStorage,
  isPersisted
} from './storageMonitor';
export type { StorageQuota, StorageBreakdown, StorageWarningLevel } from './storageMonitor';

// ✅ P2 #3: Sistema de soft deletes
export {
  softDelete,
  restore,
  getActive,
  getDeleted,
  getStats,
  purgeOldDeleted,
  restoreBatch,
  softDeleteBatch,
  SoftDeleteManager
} from './softDelete';
export type { SoftDeletable, SoftDeleteResult, SoftDeleteStats } from './softDelete';
