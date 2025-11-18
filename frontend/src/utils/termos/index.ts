// ===================================================================
// ÍNDICE DOS MÓDULOS DE TERMOS
// Localização: src/utils/termos/index.ts
// ===================================================================

// Módulos principais
export { TermoManager } from '../TermoManager';
export { TermoPhotoProcessor } from '../TermoPhotoProcessor';
export type { ProcessedPhotoData } from '../TermoPhotoProcessor';
export { TermoPhotoUploader } from '../TermoPhotoUploader';
export { TermoValidator } from '../TermoValidator';
export { TermoGPS } from '../TermoGPS';
export { TermoSaver } from '../TermoSaver';

// Tipos e interfaces
export type {
  TermoManagerOptions,
  TermoManagerState
} from '../TermoManager';

export type {
  UploadResult,
  BatchUploadResult
} from '../TermoPhotoUploader';

export type {
  ValidationError,
  ValidationResult
} from '../TermoValidator';

export type {
  LocalizacaoGPS,
  EnderecoGPS,
  GPSResult
} from '../TermoGPS';

export type {
  SaveResult,
  SaveOptions
} from '../TermoSaver';

// Re-exportar tipos do módulo de termos
export type {
  TermoFormData,
  TermoAmbiental,
  FotoData
} from '../../types/termos'; 