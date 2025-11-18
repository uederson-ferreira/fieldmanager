import { offlineDB } from '../../database';
import type { InspecaoOffline } from '../../../../types/offline';

/**
 * Gerenciador de inspeções offline
 * Responsável por todas as operações CRUD de inspeções no banco local
 */
export class InspecaoManager {
  /**
   * Salva uma inspeção no banco offline
   */
  static async save(inspecao: InspecaoOffline): Promise<void> {
    try {
      await offlineDB.inspecoes.put(inspecao);
      console.log('✅ [INSPECAO MANAGER] Inspeção salva com sucesso:', inspecao.id);
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao salvar inspeção:', error);
      throw error;
    }
  }

  /**
   * Busca todas as inspeções offline
   */
  static async getAll(): Promise<InspecaoOffline[]> {
    try {
      const inspecoes = await offlineDB.inspecoes.toArray();
      console.log('✅ [INSPECAO MANAGER] Buscadas inspeções:', inspecoes.length);
      return inspecoes;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao buscar inspeções:', error);
      throw error;
    }
  }

  /**
   * Busca inspeções pendentes de sincronização
   */
  static async getPendentes(): Promise<InspecaoOffline[]> {
    try {
      const inspecoes = await offlineDB.inspecoes
        .where('sincronizado')
        .equals(false)
        .toArray();
      console.log('✅ [INSPECAO MANAGER] Inspeções pendentes:', inspecoes.length);
      return inspecoes;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao buscar inspeções pendentes:', error);
      throw error;
    }
  }

  /**
   * Busca uma inspeção específica por ID
   */
  static async getById(id: string): Promise<InspecaoOffline | undefined> {
    try {
      const inspecao = await offlineDB.inspecoes.get(id);
      if (inspecao) {
        console.log('✅ [INSPECAO MANAGER] Inspeção encontrada:', id);
      } else {
        console.log('⚠️ [INSPECAO MANAGER] Inspeção não encontrada:', id);
      }
      return inspecao;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao buscar inspeção:', id, error);
      throw error;
    }
  }

  /**
   * Atualiza uma inspeção existente
   */
  static async update(inspecao: InspecaoOffline): Promise<void> {
    try {
      await offlineDB.inspecoes.put(inspecao);
      console.log('✅ [INSPECAO MANAGER] Inspeção atualizada:', inspecao.id);
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao atualizar inspeção:', error);
      throw error;
    }
  }

  /**
   * Remove uma inspeção do banco offline (com transação atômica para deletar respostas e fotos associadas)
   */
  static async delete(id: string): Promise<void> {
    try {
      // ✅ CORREÇÃO P0: Usar transação atômica para garantir integridade
      await offlineDB.transaction('rw', [offlineDB.inspecoes, offlineDB.respostas_inspecao, offlineDB.fotos_inspecao], async () => {
        // 1. Deletar inspeção
        await offlineDB.inspecoes.delete(id);

        // 2. Deletar respostas associadas (cascade)
        const respostasRemovidas = await offlineDB.respostas_inspecao
          .where('inspecao_id')
          .equals(id)
          .delete();

        // 3. Deletar fotos associadas (cascade)
        const fotosRemovidas = await offlineDB.fotos_inspecao
          .where('inspecao_id')
          .equals(id)
          .delete();

        console.log('✅ [INSPECAO MANAGER] Inspeção removida:', id);
        console.log(`✅ [INSPECAO MANAGER] ${respostasRemovidas} respostas órfãs removidas`);
        console.log(`✅ [INSPECAO MANAGER] ${fotosRemovidas} fotos órfãs removidas`);
      });
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao remover inspeção:', error);
      throw error;
    }
  }

  /**
   * Marca uma inspeção como sincronizada
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      await offlineDB.inspecoes.update(id, { sincronizado: true });
      console.log('✅ [INSPECAO MANAGER] Inspeção marcada como sincronizada:', id);
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao marcar inspeção como sincronizada:', error);
      throw error;
    }
  }

  /**
   * Conta o total de inspeções offline
   */
  static async count(): Promise<number> {
    try {
      const count = await offlineDB.inspecoes.count();
      console.log('✅ [INSPECAO MANAGER] Total de inspeções:', count);
      return count;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao contar inspeções:', error);
      throw error;
    }
  }

  /**
   * Conta inspeções pendentes de sincronização
   */
  static async countPendentes(): Promise<number> {
    try {
      const count = await offlineDB.inspecoes
        .where('sincronizado')
        .equals(false)
        .count();
      console.log('✅ [INSPECAO MANAGER] Inspeções pendentes:', count);
      return count;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao contar inspeções pendentes:', error);
      throw error;
    }
  }

  /**
   * Busca inspeções por atividade de rotina
   */
  static async getByAtividadeId(atividadeId: string): Promise<InspecaoOffline[]> {
    try {
      const inspecoes = await offlineDB.inspecoes
        .where('atividade_rotina_id')
        .equals(atividadeId)
        .toArray();
      console.log('✅ [INSPECAO MANAGER] Inspeções da atividade:', atividadeId, inspecoes.length);
      return inspecoes;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao buscar inspeções da atividade:', error);
      throw error;
    }
  }

  /**
   * Limpa inspeções sincronizadas antigas
   */
  static async limparSincronizadas(): Promise<number> {
    try {
      const count = await offlineDB.inspecoes
        .where('sincronizado')
        .equals(true)
        .delete();
      console.log('✅ [INSPECAO MANAGER] Inspeções sincronizadas removidas:', count);
      return count;
    } catch (error) {
      console.error('❌ [INSPECAO MANAGER] Erro ao limpar inspeções sincronizadas:', error);
      throw error;
    }
  }
}
