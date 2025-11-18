// ===================================================================
// FUNÇÕES DE COMPATIBILIDADE - ECOFIELD OFFLINE SYSTEM
// ===================================================================
// Este arquivo contém funções wrapper que substituem as antigas do offlineDB.ts
// para manter compatibilidade com o código existente

import {
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

import { 
  TermoSync, 
  LVSync, 
  AtividadeRotinaSync, 
  EncarregadoSync, 
  InspecaoSync 
} from './sync';

import type { 
  ProgressCallback, 
  SyncResult, 
  LVProgressCallback, 
  LVSyncResult 
} from './sync';

import type {
  TermoAmbientalOffline,
  TermoFotoOffline,
  LVOffline,
  LVAvaliacaoOffline,
  LVFotoOffline,
  AtividadeRotinaOffline,
  FotoRotinaOffline,
  EncarregadoOffline,
  InspecaoOffline,
  RespostaInspecaoOffline,
  FotoInspecaoOffline
  // ❌ REMOVIDO: LVResiduosOffline, LVResiduosAvaliacaoOffline, LVResiduosFotoOffline
  // ✅ UNIFICAÇÃO: Usar LVOffline com tipo_lv='residuos'
} from '../../types/offline';

// ===================================================================
// FUNÇÕES WRAPPER PARA TERMOS AMBIENTAIS
// ===================================================================

/**
 * Salva um termo ambiental offline (compatibilidade)
 */
export const saveTermoAmbientalOffline = async (termo: TermoAmbientalOffline): Promise<void> => {
  return TermoManager.save(termo);
};

/**
 * Busca todos os termos ambientais offline (compatibilidade)
 */
export const getTermosAmbientaisOffline = async (): Promise<TermoAmbientalOffline[]> => {
  return TermoManager.getAll();
};

/**
 * Busca um termo específico por ID (compatibilidade)
 */
export const getTermoAmbientalOfflineById = async (id: string): Promise<TermoAmbientalOffline | undefined> => {
  return TermoManager.getById(id);
};

/**
 * Busca termos pendentes de sincronização (compatibilidade)
 */
export const getTermosAmbientaisPendentes = async (): Promise<TermoAmbientalOffline[]> => {
  return TermoManager.getPendentes();
};

/**
 * Atualiza um termo existente (compatibilidade)
 */
export const updateTermoAmbientalOffline = async (termo: TermoAmbientalOffline): Promise<void> => {
  return TermoManager.update(termo);
};

/**
 * Remove um termo (compatibilidade)
 */
export const deleteTermoAmbientalOffline = async (id: string): Promise<void> => {
  return TermoManager.delete(id);
};

/**
 * Sincroniza todos os termos offline (compatibilidade)
 */
export const syncTermosAmbientaisOffline = async (onProgress?: ProgressCallback): Promise<SyncResult> => {
  return TermoSync.syncAll(onProgress);
};

/**
 * Sincroniza todas as atividades de rotina offline (compatibilidade)
 */
export const syncAtividadesRotinaOffline = async (onProgress?: ProgressCallback): Promise<SyncResult> => {
  return AtividadeRotinaSync.syncAll(onProgress);
};

/**
 * Salva uma foto de termo offline (compatibilidade)
 */
export const saveTermoFotoOffline = async (foto: TermoFotoOffline): Promise<void> => {
  return TermoFotoManager.save(foto);
};

/**
 * Busca fotos de um termo específico (compatibilidade)
 */
export const getTermoFotosOffline = async (termoId: string): Promise<TermoFotoOffline[]> => {
  return TermoFotoManager.getByTermoId(termoId);
};

/**
 * Remove uma foto de termo (compatibilidade)
 */
export const deleteTermoFotoOffline = async (id: string): Promise<void> => {
  return TermoFotoManager.delete(id);
};

// ===================================================================
// FUNÇÕES WRAPPER PARA LISTAS DE VERIFICAÇÃO (LVs)
// ===================================================================

/**
 * Salva uma LV offline (compatibilidade)
 */
export const saveLVOffline = async (lv: LVOffline): Promise<void> => {
  return LVManager.save(lv);
};

/**
 * Busca todas as LVs offline (compatibilidade)
 */
export const getLVsOffline = async (): Promise<LVOffline[]> => {
  return LVManager.getAll();
};

/**
 * Busca uma LV específica por ID (compatibilidade)
 */
export const getLVOfflineById = async (id: string): Promise<LVOffline | undefined> => {
  return LVManager.getById(id);
};

/**
 * Busca LVs pendentes de sincronização (compatibilidade)
 */
export const getLVsPendentes = async (): Promise<LVOffline[]> => {
  return LVManager.getPendentes();
};

/**
 * Atualiza uma LV existente (compatibilidade)
 */
export const updateLVOffline = async (lv: LVOffline): Promise<void> => {
  return LVManager.update(lv);
};

/**
 * Remove uma LV (compatibilidade)
 */
export const deleteLVOffline = async (id: string): Promise<void> => {
  return LVManager.delete(id);
};

/**
 * Sincroniza todas as LVs offline (compatibilidade)
 */
export const syncLVsOffline = async (onProgress?: LVProgressCallback): Promise<LVSyncResult> => {
  return LVSync.syncAll(onProgress);
};

/**
 * Salva uma avaliação de LV offline (compatibilidade)
 */
export const saveLVAvaliacaoOffline = async (avaliacao: LVAvaliacaoOffline): Promise<void> => {
  return LVAvaliacaoManager.save(avaliacao);
};

/**
 * Busca avaliações de uma LV (compatibilidade)
 */
export const getLVAvaliacoesOffline = async (lvId: string): Promise<LVAvaliacaoOffline[]> => {
  return LVAvaliacaoManager.getByLVId(lvId);
};

/**
 * Salva uma foto de LV offline (compatibilidade)
 */
export const saveLVFotoOffline = async (foto: LVFotoOffline): Promise<void> => {
  return LVFotoManager.save(foto);
};

/**
 * Busca fotos de uma LV (compatibilidade)
 */
export const getLVFotosOffline = async (lvId: string): Promise<LVFotoOffline[]> => {
  return LVFotoManager.getByLVId(lvId);
};

// ===================================================================
// FUNÇÕES WRAPPER PARA ATIVIDADES DE ROTINA
// ===================================================================

/**
 * Salva uma atividade de rotina offline (compatibilidade)
 */
export const saveAtividadeRotinaOffline = async (atividade: AtividadeRotinaOffline): Promise<void> => {
  return AtividadeRotinaManager.save(atividade);
};

/**
 * Busca todas as atividades de rotina offline (compatibilidade)
 */
export const getAtividadesRotinaOffline = async (): Promise<AtividadeRotinaOffline[]> => {
  return AtividadeRotinaManager.getAll();
};

/**
 * Busca uma atividade específica por ID (compatibilidade)
 */
export const getAtividadeRotinaOfflineById = async (id: string): Promise<AtividadeRotinaOffline | undefined> => {
  return AtividadeRotinaManager.getById(id);
};

/**
 * Busca atividades pendentes de sincronização (compatibilidade)
 */
export const getAtividadesRotinaPendentes = async (): Promise<AtividadeRotinaOffline[]> => {
  return AtividadeRotinaManager.getPendentes();
};

/**
 * Atualiza uma atividade existente (compatibilidade)
 */
export const updateAtividadeRotinaOffline = async (atividade: AtividadeRotinaOffline): Promise<void> => {
  return AtividadeRotinaManager.update(atividade);
};

/**
 * Remove uma atividade (compatibilidade)
 */
export const deleteAtividadeRotinaOffline = async (id: string): Promise<void> => {
  return AtividadeRotinaManager.delete(id);
};

// Função syncAtividadesRotinaOffline já definida acima

/**
 * Salva uma foto de atividade offline (compatibilidade)
 */
export const saveFotoRotinaOffline = async (foto: FotoRotinaOffline): Promise<void> => {
  return FotoRotinaManager.save(foto);
};

/**
 * Busca fotos de uma atividade (compatibilidade)
 */
export const getFotosRotinaOffline = async (atividadeId: string): Promise<FotoRotinaOffline[]> => {
  return FotoRotinaManager.getByAtividadeId(atividadeId);
};

// ===================================================================
// FUNÇÕES WRAPPER PARA ENCARREGADOS
// ===================================================================

/**
 * Salva um encarregado offline (compatibilidade)
 */
export const saveEncarregadoOffline = async (encarregado: EncarregadoOffline): Promise<void> => {
  return EncarregadoManager.save(encarregado);
};

/**
 * Busca todos os encarregados offline (compatibilidade)
 */
export const getEncarregadosOffline = async (): Promise<EncarregadoOffline[]> => {
  return EncarregadoManager.getAll();
};

/**
 * Busca um encarregado específico por ID (compatibilidade)
 */
export const getEncarregadoOfflineById = async (id: string): Promise<EncarregadoOffline | undefined> => {
  return EncarregadoManager.getById(id);
};

/**
 * Busca encarregados ativos (compatibilidade)
 */
export const getEncarregadosAtivos = async (): Promise<EncarregadoOffline[]> => {
  return EncarregadoManager.getAtivos();
};

/**
 * Atualiza um encarregado existente (compatibilidade)
 */
export const updateEncarregadoOffline = async (encarregado: EncarregadoOffline): Promise<void> => {
  return EncarregadoManager.update(encarregado);
};

/**
 * Remove um encarregado (compatibilidade)
 */
export const deleteEncarregadoOffline = async (id: string): Promise<void> => {
  return EncarregadoManager.delete(id);
};

/**
 * Sincroniza todos os encarregados offline (compatibilidade)
 */
export const syncEncarregadosOffline = async (onProgress?: ProgressCallback): Promise<SyncResult> => {
  return EncarregadoSync.syncAll(onProgress);
};

// ===================================================================
// FUNÇÕES WRAPPER PARA INSPEÇÕES
// ===================================================================

/**
 * Salva uma inspeção offline (compatibilidade)
 */
export const saveInspecaoOffline = async (inspecao: InspecaoOffline): Promise<void> => {
  return InspecaoManager.save(inspecao);
};

/**
 * Busca todas as inspeções offline (compatibilidade)
 */
export const getInspecoesOffline = async (): Promise<InspecaoOffline[]> => {
  return InspecaoManager.getAll();
};

/**
 * Busca uma inspeção específica por ID (compatibilidade)
 */
export const getInspecaoOfflineById = async (id: string): Promise<InspecaoOffline | undefined> => {
  return InspecaoManager.getById(id);
};

/**
 * Busca inspeções pendentes de sincronização (compatibilidade)
 */
export const getInspecoesPendentes = async (): Promise<InspecaoOffline[]> => {
  return InspecaoManager.getPendentes();
};

/**
 * Sincroniza todas as inspeções offline (compatibilidade)
 */
export const syncInspecoesOffline = async (onProgress?: ProgressCallback): Promise<SyncResult> => {
  return InspecaoSync.syncAll(onProgress);
};

/**
 * Salva uma resposta de inspeção offline (compatibilidade)
 */
export const saveRespostaInspecaoOffline = async (resposta: RespostaInspecaoOffline): Promise<void> => {
  return RespostaInspecaoManager.save(resposta);
};

/**
 * Busca respostas de uma inspeção (compatibilidade)
 */
export const getRespostasInspecaoOffline = async (inspecaoId: string): Promise<RespostaInspecaoOffline[]> => {
  return RespostaInspecaoManager.getByInspecaoId(inspecaoId);
};

/**
 * Salva uma foto de inspeção offline (compatibilidade)
 */
export const saveFotoInspecaoOffline = async (foto: FotoInspecaoOffline): Promise<void> => {
  return FotoInspecaoManager.save(foto);
};

/**
 * Busca fotos de uma inspeção (compatibilidade)
 */
export const getFotosInspecaoOffline = async (inspecaoId: string): Promise<FotoInspecaoOffline[]> => {
  return FotoInspecaoManager.getByInspecaoId(inspecaoId);
};

// ===================================================================
// FUNÇÕES WRAPPER PARA LVs DE RESÍDUOS (DEPRECATED - USA LVManager)
// ===================================================================

/**
 * @deprecated Usar LVManager.save() com tipo_lv='residuos'
 * Salva um LV de resíduos offline (compatibilidade)
 */
export const saveLVResiduosOffline = async (lv: any): Promise<void> => {
  console.warn('⚠️ [DEPRECATED] saveLVResiduosOffline() - Use LVManager.save() com tipo_lv="residuos"');
  return LVManager.save({ ...lv, tipo_lv: 'residuos' });
};

/**
 * @deprecated Usar LVManager.getAll() e filtrar por tipo_lv='residuos'
 * Busca todos os LVs de resíduos offline (compatibilidade)
 */
export const getLVsResiduosOffline = async (): Promise<any[]> => {
  console.warn('⚠️ [DEPRECATED] getLVsResiduosOffline() - Use LVManager.getAll() com filtro tipo_lv="residuos"');
  const allLVs = await LVManager.getAll();
  return allLVs.filter(lv => lv.tipo_lv === 'residuos');
};

/**
 * @deprecated Usar LVManager.getById()
 * Busca um LV de resíduos específico por ID (compatibilidade)
 */
export const getLVResiduosOfflineById = async (id: string): Promise<any | undefined> => {
  console.warn('⚠️ [DEPRECATED] getLVResiduosOfflineById() - Use LVManager.getById()');
  return LVManager.getById(id);
};

/**
 * @deprecated Usar LVManager.getPendentes() e filtrar por tipo_lv='residuos'
 * Busca LVs de resíduos pendentes de sincronização (compatibilidade)
 */
export const getLVsResiduosPendentes = async (): Promise<any[]> => {
  console.warn('⚠️ [DEPRECATED] getLVsResiduosPendentes() - Use LVManager.getPendentes() com filtro tipo_lv="residuos"');
  const pendentes = await LVManager.getPendentes();
  return pendentes.filter(lv => lv.tipo_lv === 'residuos');
};

/**
 * @deprecated Usar LVAvaliacaoManager.save() com tipo_lv='residuos'
 * Salva uma avaliação de LV de resíduos offline (compatibilidade)
 */
export const saveLVResiduosAvaliacaoOffline = async (avaliacao: any): Promise<void> => {
  console.warn('⚠️ [DEPRECATED] saveLVResiduosAvaliacaoOffline() - Use LVAvaliacaoManager.save() com tipo_lv="residuos"');
  return LVAvaliacaoManager.save({ ...avaliacao, tipo_lv: 'residuos' });
};

/**
 * @deprecated Usar LVAvaliacaoManager.getByLVId()
 * Busca avaliações de um LV de resíduos (compatibilidade)
 */
export const getLVsResiduosAvaliacoesOffline = async (lvId: string): Promise<any[]> => {
  console.warn('⚠️ [DEPRECATED] getLVsResiduosAvaliacoesOffline() - Use LVAvaliacaoManager.getByLVId()');
  return LVAvaliacaoManager.getByLVId(lvId);
};

/**
 * @deprecated Usar LVFotoManager.save() com tipo_lv='residuos'
 * Salva uma foto de LV de resíduos offline (compatibilidade)
 */
export const saveLVResiduosFotoOffline = async (foto: any): Promise<void> => {
  console.warn('⚠️ [DEPRECATED] saveLVResiduosFotoOffline() - Use LVFotoManager.save() com tipo_lv="residuos"');
  return LVFotoManager.save({ ...foto, tipo_lv: 'residuos' });
};

/**
 * @deprecated Usar LVFotoManager.getByLVId()
 * Busca fotos de um LV de resíduos (compatibilidade)
 */
export const getLVsResiduosFotosOffline = async (lvId: string): Promise<any[]> => {
  console.warn('⚠️ [DEPRECATED] getLVsResiduosFotosOffline() - Use LVFotoManager.getByLVId()');
  return LVFotoManager.getByLVId(lvId);
};

// ===================================================================
// FUNÇÕES DE UTILIDADE PARA COMPATIBILIDADE
// ===================================================================

/**
 * Verifica se há dados pendentes de sincronização (compatibilidade)
 */
export const hasPendingData = async (): Promise<boolean> => {
  try {
    // ✅ UNIFICAÇÃO: LVManager agora inclui LVs de resíduos (tipo_lv='residuos')
    const [
      termosPendentes,
      lvsPendentes,
      atividadesPendentes,
      encarregadosPendentes,
      inspecoesPendentes
    ] = await Promise.all([
      TermoManager.countPendentes(),
      LVManager.countPendentes(), // Inclui todas as LVs (incluindo resíduos)
      AtividadeRotinaManager.countPendentes(),
      EncarregadoManager.countPendentes(),
      InspecaoManager.countPendentes()
    ]);

    return (termosPendentes + lvsPendentes + atividadesPendentes +
            encarregadosPendentes + inspecoesPendentes) > 0;
  } catch (error) {
    console.error('❌ [COMPATIBILIDADE] Erro ao verificar dados pendentes:', error);
    return false;
  }
};

/**
 * Obtém estatísticas gerais do sistema offline (compatibilidade)
 */
export const getOfflineStats = async () => {
  try {
    // ✅ UNIFICAÇÃO: LVManager agora inclui LVs de resíduos (tipo_lv='residuos')
    const [
      totalTermos,
      totalLVs,
      totalAtividades,
      totalEncarregados,
      totalInspecoes
    ] = await Promise.all([
      TermoManager.count(),
      LVManager.count(), // Inclui todas as LVs (incluindo resíduos)
      AtividadeRotinaManager.count(),
      EncarregadoManager.count(),
      InspecaoManager.count()
    ]);

    // Buscar LVs de resíduos separadamente se necessário para backward compatibility
    const allLVs = await LVManager.getAll();
    const totalLVsResiduos = allLVs.filter(lv => lv.tipo_lv === 'residuos').length;

    return {
      totalTermos,
      totalLVs,
      totalAtividades,
      totalEncarregados,
      totalInspecoes,
      totalLVsResiduos, // Mantido para backward compatibility
      total: totalTermos + totalLVs + totalAtividades + totalEncarregados + totalInspecoes
    };
  } catch (error) {
    console.error('❌ [COMPATIBILIDADE] Erro ao obter estatísticas:', error);
    return {
      totalTermos: 0,
      totalLVs: 0,
      totalAtividades: 0,
      totalEncarregados: 0,
      totalInspecoes: 0,
      totalLVsResiduos: 0,
      total: 0
    };
  }
};
