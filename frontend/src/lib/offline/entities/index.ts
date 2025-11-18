// ===================================================================
// EXPORTAÇÕES DOS MANAGERS - ECOFIELD OFFLINE SYSTEM
// ===================================================================

// Managers principais
export { TermoManager, TermoFotoManager } from './managers/TermoManager';
export { LVManager, LVAvaliacaoManager, LVFotoManager } from './managers/LVManager';
export { AtividadeRotinaManager, FotoRotinaManager } from './managers/AtividadeRotinaManager';
export { EncarregadoManager } from './managers/EncarregadoManager';
export { InspecaoManager } from './managers/InspecaoManager';
export { RespostaInspecaoManager } from './managers/RespostaInspecaoManager';
export { FotoInspecaoManager } from './managers/FotoInspecaoManager';

// ❌ REMOVIDO: LVResiduosManager, LVResiduosAvaliacaoManager, LVResiduosFotoManager
// ✅ UNIFICAÇÃO: Agora usar LVManager com tipo_lv='residuos'
// Managers legados movidos para src/_legacy/offline/managers/
