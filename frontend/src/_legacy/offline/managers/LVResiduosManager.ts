import { offlineDB } from '../../database';
import type { LVResiduosOffline, LVResiduosAvaliacaoOffline, LVResiduosFotoOffline } from '../../../../types/offline';

/**
 * Gerenciador de LVs de resíduos offline
 * Responsável por todas as operações CRUD de LVs de resíduos no banco local
 */
export class LVResiduosManager {
  /**
   * Salva um LV de resíduos no banco offline
   */
  static async save(lv: LVResiduosOffline): Promise<void> {
    try {
      await offlineDB.lv_residuos.put(lv);
      console.log('✅ [LV RESIDUOS MANAGER] LV salvo com sucesso:', lv.id);
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao salvar LV:', error);
      throw error;
    }
  }

  /**
   * Busca todos os LVs de resíduos offline
   */
  static async getAll(): Promise<LVResiduosOffline[]> {
    try {
      const lvs = await offlineDB.lv_residuos.toArray();
      console.log('✅ [LV RESIDUOS MANAGER] Buscados LVs:', lvs.length);
      return lvs;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao buscar LVs:', error);
      throw error;
    }
  }

  /**
   * Busca LVs pendentes de sincronização
   */
  static async getPendentes(): Promise<LVResiduosOffline[]> {
    try {
      const lvs = await offlineDB.lv_residuos
        .where('sincronizado')
        .equals(false)
        .toArray();
      console.log('✅ [LV RESIDUOS MANAGER] LVs pendentes:', lvs.length);
      return lvs;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao buscar LVs pendentes:', error);
      throw error;
    }
  }

  /**
   * Busca um LV específico por ID
   */
  static async getById(id: string): Promise<LVResiduosOffline | undefined> {
    try {
      const lv = await offlineDB.lv_residuos.get(id);
      if (lv) {
        console.log('✅ [LV RESIDUOS MANAGER] LV encontrado:', id);
      } else {
        console.log('⚠️ [LV RESIDUOS MANAGER] LV não encontrado:', id);
      }
      return lv;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao buscar LV:', id, error);
      throw error;
    }
  }

  /**
   * Busca LVs por tipo de resíduo
   */
  static async getByTipoResiduo(tipo: string): Promise<LVResiduosOffline[]> {
    try {
      const lvs = await offlineDB.lv_residuos
        .where('tipo_residuo')
        .equals(tipo)
        .toArray();
      console.log('✅ [LV RESIDUOS MANAGER] LVs do tipo:', tipo, lvs.length);
      return lvs;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao buscar LVs por tipo:', error);
      throw error;
    }
  }

  /**
   * Busca LVs por status
   */
  static async getByStatus(status: string): Promise<LVResiduosOffline[]> {
    try {
      const lvs = await offlineDB.lv_residuos
        .where('status')
        .equals(status)
        .toArray();
      console.log('✅ [LV RESIDUOS MANAGER] LVs com status:', status, lvs.length);
      return lvs;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao buscar LVs por status:', error);
      throw error;
    }
  }

  /**
   * Atualiza um LV existente
   */
  static async update(lv: LVResiduosOffline): Promise<void> {
    try {
      await offlineDB.lv_residuos.put(lv);
      console.log('✅ [LV RESIDUOS MANAGER] LV atualizado:', lv.id);
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao atualizar LV:', error);
      throw error;
    }
  }

  /**
   * Remove um LV do banco offline (com transação atômica para deletar avaliações e fotos associadas)
   */
  static async delete(id: string): Promise<void> {
    try {
      // ✅ CORREÇÃO P0: Usar transação atômica para garantir integridade
      await offlineDB.transaction('rw', [offlineDB.lv_residuos, offlineDB.lv_residuos_avaliacoes, offlineDB.lv_residuos_fotos], async () => {
        // 1. Deletar LV de resíduos
        await offlineDB.lv_residuos.delete(id);

        // 2. Deletar avaliações associadas (cascade)
        const avaliacoesRemovidas = await offlineDB.lv_residuos_avaliacoes
          .where('lv_residuos_id')
          .equals(id)
          .delete();

        // 3. Deletar fotos associadas (cascade)
        const fotosRemovidas = await offlineDB.lv_residuos_fotos
          .where('lv_residuos_id')
          .equals(id)
          .delete();

        console.log('✅ [LV RESIDUOS MANAGER] LV removido:', id);
        console.log(`✅ [LV RESIDUOS MANAGER] ${avaliacoesRemovidas} avaliações órfãs removidas`);
        console.log(`✅ [LV RESIDUOS MANAGER] ${fotosRemovidas} fotos órfãs removidas`);
      });
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao remover LV:', error);
      throw error;
    }
  }

  /**
   * Marca um LV como sincronizado
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      await offlineDB.lv_residuos.update(id, { sincronizado: true });
      console.log('✅ [LV RESIDUOS MANAGER] LV marcado como sincronizado:', id);
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao marcar LV como sincronizado:', error);
      throw error;
    }
  }

  /**
   * Conta o total de LVs offline
   */
  static async count(): Promise<number> {
    try {
      const count = await offlineDB.lv_residuos.count();
      console.log('✅ [LV RESIDUOS MANAGER] Total de LVs:', count);
      return count;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao contar LVs:', error);
      throw error;
    }
  }

  /**
   * Conta LVs pendentes de sincronização
   */
  static async countPendentes(): Promise<number> {
    try {
      const count = await offlineDB.lv_residuos
        .where('sincronizado')
        .equals(false)
        .count();
      console.log('✅ [LV RESIDUOS MANAGER] LVs pendentes:', count);
      return count;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao contar LVs pendentes:', error);
      throw error;
    }
  }

  /**
   * Busca LVs por data de criação
   */
  static async getByDataCriacao(dataInicio: Date, dataFim?: Date): Promise<LVResiduosOffline[]> {
    try {
      let query = offlineDB.lv_residuos.where('data_criacao').aboveOrEqual(dataInicio);
      
      if (dataFim) {
        query = query.belowOrEqual(dataFim);
      }
      
      const lvs = await query.toArray();
      console.log('✅ [LV RESIDUOS MANAGER] LVs por data:', dataInicio, dataFim, lvs.length);
      return lvs;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao buscar LVs por data:', error);
      throw error;
    }
  }

  /**
   * Limpa LVs sincronizados antigos
   */
  static async limparSincronizados(): Promise<number> {
    try {
      const count = await offlineDB.lv_residuos
        .where('sincronizado')
        .equals(true)
        .delete();
      console.log('✅ [LV RESIDUOS MANAGER] LVs sincronizados removidos:', count);
      return count;
    } catch (error) {
      console.error('❌ [LV RESIDUOS MANAGER] Erro ao limpar LVs sincronizados:', error);
      throw error;
    }
  }
}

/**
 * Gerenciador de avaliações de LVs de resíduos offline
 */
export class LVResiduosAvaliacaoManager {
  /**
   * Salva uma avaliação de LV no banco offline
   */
  static async save(avaliacao: LVResiduosAvaliacaoOffline): Promise<void> {
    try {
      await offlineDB.lv_residuos_avaliacoes.put(avaliacao);
      console.log('✅ [LV RESIDUOS AVALIACAO MANAGER] Avaliação salva com sucesso:', avaliacao.id);
    } catch (error) {
      console.error('❌ [LV RESIDUOS AVALIACAO MANAGER] Erro ao salvar avaliação:', error);
      throw error;
    }
  }

  /**
   * Busca avaliações por LV
   */
  static async getByLVId(lvId: string): Promise<LVResiduosAvaliacaoOffline[]> {
    try {
      const avaliacoes = await offlineDB.lv_residuos_avaliacoes
        .where('lv_residuos_id')
        .equals(lvId)
        .toArray();
      console.log('✅ [LV RESIDUOS AVALIACAO MANAGER] Avaliações do LV:', lvId, avaliacoes.length);
      return avaliacoes;
    } catch (error) {
      console.error('❌ [LV RESIDUOS AVALIACAO MANAGER] Erro ao buscar avaliações:', error);
      throw error;
    }
  }

  /**
   * Remove avaliações de um LV
   */
  static async deleteByLVId(lvId: string): Promise<number> {
    try {
      const count = await offlineDB.lv_residuos_avaliacoes
        .where('lv_residuos_id')
        .equals(lvId)
        .delete();
      console.log('✅ [LV RESIDUOS AVALIACAO MANAGER] Avaliações do LV removidas:', lvId, count);
      return count;
    } catch (error) {
      console.error('❌ [LV RESIDUOS AVALIACAO MANAGER] Erro ao remover avaliações:', error);
      throw error;
    }
  }
}

/**
 * Gerenciador de fotos de LVs de resíduos offline
 */
export class LVResiduosFotoManager {
  /**
   * Salva uma foto de LV no banco offline
   */
  static async save(foto: LVResiduosFotoOffline): Promise<void> {
    try {
      await offlineDB.lv_residuos_fotos.put(foto);
      console.log('✅ [LV RESIDUOS FOTO MANAGER] Foto salva com sucesso:', foto.id);
    } catch (error) {
      console.error('❌ [LV RESIDUOS FOTO MANAGER] Erro ao salvar foto:', error);
      throw error;
    }
  }

  /**
   * Busca fotos por LV
   */
  static async getByLVId(lvId: string): Promise<LVResiduosFotoOffline[]> {
    try {
      const fotos = await offlineDB.lv_residuos_fotos
        .where('lv_residuos_id')
        .equals(lvId)
        .toArray();
      console.log('✅ [LV RESIDUOS FOTO MANAGER] Fotos do LV:', lvId, fotos.length);
      return fotos;
    } catch (error) {
      console.error('❌ [LV RESIDUOS FOTO MANAGER] Erro ao buscar fotos:', error);
      throw error;
    }
  }

  /**
   * Remove fotos de um LV
   */
  static async deleteByLVId(lvId: string): Promise<number> {
    try {
      const count = await offlineDB.lv_residuos_fotos
        .where('lv_residuos_id')
        .equals(lvId)
        .delete();
      console.log('✅ [LV RESIDUOS FOTO MANAGER] Fotos do LV removidas:', lvId, count);
      return count;
    } catch (error) {
      console.error('❌ [LV RESIDUOS FOTO MANAGER] Erro ao remover fotos:', error);
      throw error;
    }
  }
}
