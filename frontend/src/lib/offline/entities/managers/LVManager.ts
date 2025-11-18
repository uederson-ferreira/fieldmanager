// ===================================================================
// LV MANAGER - ECOFIELD SYSTEM
// Localização: src/lib/offline/entities/managers/LVManager.ts
// Módulo: Gerenciador de LVs offline
// ===================================================================

import type { LV, LVAvaliacao, LVFoto } from '../../../../types/lv';
import { offlineDB } from '../../database';

// ===================================================================
// GERENCIADOR DE LVs OFFLINE
// ===================================================================

export class LVManager {
  /**
   * Salvar LV offline
   */
  static async save(lv: LV): Promise<void> {
    try {
      await offlineDB.lvs.put(lv);
      console.log('✅ [LV MANAGER] LV salva com sucesso:', lv.id);

      // Disparar evento para atualizar metas no dashboard
      window.dispatchEvent(new CustomEvent('meta:atualizar'));
      console.log('🔔 [LV MANAGER] Evento meta:atualizar disparado');
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao salvar LV:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as LVs offline
   */
  static async getAll(): Promise<LV[]> {
    try {
      const lvs = await offlineDB.lvs.toArray();
      console.log(`✅ [LV MANAGER] ${lvs.length} LVs encontradas`);
      return lvs;
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao buscar LVs:', error);
      return [];
    }
  }

  /**
   * Buscar LV por ID
   */
  static async getById(id: string): Promise<LV | undefined> {
    try {
      const lv = await offlineDB.lvs.get(id);
      if (lv) {
        console.log('✅ [LV MANAGER] LV encontrada:', id);
      } else {
        console.log('⚠️ [LV MANAGER] LV não encontrada:', id);
      }
      return lv;
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao buscar LV por ID:', error);
      return undefined;
    }
  }

  /**
   * Buscar LVs por tipo
   */
  static async getByTipo(tipo: string): Promise<LV[]> {
    try {
      const lvs = await offlineDB.lvs
        .where('tipo_lv')
        .equals(tipo)
        .toArray();
      console.log(`✅ [LV MANAGER] ${lvs.length} LVs do tipo ${tipo} encontradas`);
      return lvs;
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao buscar LVs por tipo:', error);
      return [];
    }
  }

  /**
   * Buscar LVs pendentes de sincronização
   */
  static async getPendentes(): Promise<LV[]> {
    try {
      const lvs = await offlineDB.lvs
        .filter(lv => lv.sincronizado === false)
        .toArray();
      console.log(`✅ [LV MANAGER] ${lvs.length} LVs pendentes encontradas`);
      return lvs;
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao buscar LVs pendentes:', error);
      return [];
    }
  }

  /**
   * Deletar LV por ID (com transação atômica para deletar avaliações e fotos associadas)
   */
  static async delete(id: string): Promise<void> {
    try {
      // ✅ CORREÇÃO P0: Usar transação atômica para garantir integridade
      await offlineDB.transaction('rw', [offlineDB.lvs, offlineDB.lv_avaliacoes, offlineDB.lv_fotos], async () => {
        // 1. Deletar LV
        await offlineDB.lvs.delete(id);

        // 2. Deletar avaliações associadas (cascade)
        const avaliacoesRemovidas = await offlineDB.lv_avaliacoes
          .where('lv_id')
          .equals(id)
          .delete();

        // 3. Deletar fotos associadas (cascade)
        const fotosRemovidas = await offlineDB.lv_fotos
          .where('lv_id')
          .equals(id)
          .delete();

        console.log('✅ [LV MANAGER] LV deletada:', id);
        console.log(`✅ [LV MANAGER] ${avaliacoesRemovidas} avaliações órfãs removidas`);
        console.log(`✅ [LV MANAGER] ${fotosRemovidas} fotos órfãs removidas`);
      });
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao deletar LV:', error);
      throw error;
    }
  }

  /**
   * Atualizar LV
   */
  static async update(lv: LV): Promise<void> {
    try {
      await offlineDB.lvs.put(lv);
      console.log('✅ [LV MANAGER] LV atualizada:', lv.id);
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao atualizar LV:', error);
      throw error;
    }
  }

  /**
   * Marcar LV como sincronizada
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      const lv = await offlineDB.lvs.get(id);
      if (lv) {
        lv.sincronizado = true;
        await offlineDB.lvs.put(lv);
        console.log('✅ [LV MANAGER] LV marcada como sincronizada:', id);
      }
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao marcar LV como sincronizada:', error);
      throw error;
    }
  }

  /**
   * Contar total de LVs
   */
  static async count(): Promise<number> {
    try {
      const total = await offlineDB.lvs.count();
      return total;
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao contar LVs:', error);
      return 0;
    }
  }

  /**
   * Contar LVs pendentes
   */
  static async countPendentes(): Promise<number> {
    try {
      const total = await offlineDB.lvs
        .filter(lv => lv.sincronizado === false)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [LV MANAGER] Erro ao contar LVs pendentes:', error);
      return 0;
    }
  }
}

// ===================================================================
// GERENCIADOR DE AVALIAÇÕES DE LV OFFLINE
// ===================================================================

export class LVAvaliacaoManager {
  /**
   * Salvar avaliação de LV offline
   */
  static async save(avaliacao: LVAvaliacao): Promise<void> {
    try {
      await offlineDB.lv_avaliacoes.put(avaliacao);
      console.log('✅ [LV AVALIACAO MANAGER] Avaliação salva com sucesso:', avaliacao.id);
    } catch (error) {
      console.error('❌ [LV AVALIACAO MANAGER] Erro ao salvar avaliação:', error);
      throw error;
    }
  }

  /**
   * Buscar avaliações por LV ID
   */
  static async getByLVId(lvId: string): Promise<LVAvaliacao[]> {
    try {
      const avaliacoes = await offlineDB.lv_avaliacoes
        .where('lv_id')
        .equals(lvId)
        .toArray();
      console.log(`✅ [LV AVALIACAO MANAGER] ${avaliacoes.length} avaliações encontradas para LV:`, lvId);
      return avaliacoes;
    } catch (error) {
      console.error('❌ [LV AVALIACAO MANAGER] Erro ao buscar avaliações por LV:', error);
      return [];
    }
  }

  /**
   * Deletar avaliação por ID
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.lv_avaliacoes.delete(id);
      console.log('✅ [LV AVALIACAO MANAGER] Avaliação deletada:', id);
    } catch (error) {
      console.error('❌ [LV AVALIACAO MANAGER] Erro ao deletar avaliação:', error);
      throw error;
    }
  }

  /**
   * Deletar todas as avaliações de uma LV
   */
  static async deleteByLVId(lvId: string): Promise<void> {
    try {
      await offlineDB.lv_avaliacoes
        .where('lv_id')
        .equals(lvId)
        .delete();
      console.log('✅ [LV AVALIACAO MANAGER] Todas as avaliações da LV deletadas:', lvId);
    } catch (error) {
      console.error('❌ [LV AVALIACAO MANAGER] Erro ao deletar avaliações da LV:', error);
      throw error;
    }
  }

  /**
   * Contar avaliações por LV
   */
  static async countByLVId(lvId: string): Promise<number> {
    try {
      const total = await offlineDB.lv_avaliacoes
        .where('lv_id')
        .equals(lvId)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [LV AVALIACAO MANAGER] Erro ao contar avaliações da LV:', error);
      return 0;
    }
  }
}

// ===================================================================
// GERENCIADOR DE FOTOS DE LV OFFLINE
// ===================================================================

export class LVFotoManager {
  /**
   * Salvar foto de LV offline
   */
  static async save(foto: LVFoto): Promise<void> {
    try {
      await offlineDB.lv_fotos.put(foto);
      console.log('✅ [LV FOTO MANAGER] Foto salva com sucesso:', foto.id);
    } catch (error) {
      console.error('❌ [LV FOTO MANAGER] Erro ao salvar foto:', error);
      throw error;
    }
  }

  /**
   * Buscar fotos por LV ID
   */
  static async getByLVId(lvId: string): Promise<LVFoto[]> {
    try {
      const fotos = await offlineDB.lv_fotos
        .where('lv_id')
        .equals(lvId)
        .toArray();
      console.log(`✅ [LV FOTO MANAGER] ${fotos.length} fotos encontradas para LV:`, lvId);
      return fotos;
    } catch (error) {
      console.error('❌ [LV FOTO MANAGER] Erro ao buscar fotos por LV:', error);
      return [];
    }
  }

  /**
   * Buscar fotos por item específico
   */
  static async getByItemId(lvId: string, itemId: string): Promise<LVFoto[]> {
    try {
      const fotos = await offlineDB.lv_fotos
        .where(['lv_id', 'item_id'])
        .equals([lvId, itemId])
        .toArray();
      console.log(`✅ [LV FOTO MANAGER] ${fotos.length} fotos encontradas para item ${itemId} da LV:`, lvId);
      return fotos;
    } catch (error) {
      console.error('❌ [LV FOTO MANAGER] Erro ao buscar fotos por item:', error);
      return [];
    }
  }

  /**
   * Deletar foto por ID
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.lv_fotos.delete(id);
      console.log('✅ [LV FOTO MANAGER] Foto deletada:', id);
    } catch (error) {
      console.error('❌ [LV FOTO MANAGER] Erro ao deletar foto:', error);
      throw error;
    }
  }

  /**
   * Deletar todas as fotos de uma LV
   */
  static async deleteByLVId(lvId: string): Promise<void> {
    try {
      await offlineDB.lv_fotos
        .where('lv_id')
        .equals(lvId)
        .delete();
      console.log('✅ [LV FOTO MANAGER] Todas as fotos da LV deletadas:', lvId);
    } catch (error) {
      console.error('❌ [LV FOTO MANAGER] Erro ao deletar fotos da LV:', error);
      throw error;
    }
  }

  /**
   * Contar fotos por LV
   */
  static async countByLVId(lvId: string): Promise<number> {
    try {
      const total = await offlineDB.lv_fotos
        .where('lv_id')
        .equals(lvId)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [LV FOTO MANAGER] Erro ao contar fotos da LV:', error);
      return 0;
    }
  }
}
