import { offlineDB } from '../../database';
import type { RespostaInspecaoOffline } from '../../../../types/offline';

/**
 * Gerenciador de respostas de inspeção offline
 * Responsável por todas as operações CRUD de respostas no banco local
 */
export class RespostaInspecaoManager {
  /**
   * Salva uma resposta de inspeção no banco offline
   */
  static async save(resposta: RespostaInspecaoOffline): Promise<void> {
    try {
      await offlineDB.respostas_inspecao.put(resposta);
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Resposta salva com sucesso:', resposta.id);
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao salvar resposta:', error);
      throw error;
    }
  }

  /**
   * Busca todas as respostas de inspeção offline
   */
  static async getAll(): Promise<RespostaInspecaoOffline[]> {
    try {
      const respostas = await offlineDB.respostas_inspecao.toArray();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Buscadas respostas:', respostas.length);
      return respostas;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao buscar respostas:', error);
      throw error;
    }
  }

  /**
   * Busca respostas pendentes de sincronização
   */
  static async getPendentes(): Promise<RespostaInspecaoOffline[]> {
    try {
      const respostas = await offlineDB.respostas_inspecao
        .where('sincronizado')
        .equals(false)
        .toArray();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Respostas pendentes:', respostas.length);
      return respostas;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao buscar respostas pendentes:', error);
      throw error;
    }
  }

  /**
   * Busca uma resposta específica por ID
   */
  static async getById(id: string): Promise<RespostaInspecaoOffline | undefined> {
    try {
      const resposta = await offlineDB.respostas_inspecao.get(id);
      if (resposta) {
        console.log('✅ [RESPOSTA INSPECAO MANAGER] Resposta encontrada:', id);
      } else {
        console.log('⚠️ [RESPOSTA INSPECAO MANAGER] Resposta não encontrada:', id);
      }
      return resposta;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao buscar resposta:', id, error);
      throw error;
    }
  }

  /**
   * Busca respostas por inspeção
   */
  static async getByInspecaoId(inspecaoId: string): Promise<RespostaInspecaoOffline[]> {
    try {
      const respostas = await offlineDB.respostas_inspecao
        .where('inspecao_id')
        .equals(inspecaoId)
        .toArray();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Respostas da inspeção:', inspecaoId, respostas.length);
      return respostas;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao buscar respostas da inspeção:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma resposta existente
   */
  static async update(resposta: RespostaInspecaoOffline): Promise<void> {
    try {
      await offlineDB.respostas_inspecao.put(resposta);
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Resposta atualizada:', resposta.id);
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao atualizar resposta:', error);
      throw error;
    }
  }

  /**
   * Remove uma resposta do banco offline
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.respostas_inspecao.delete(id);
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Resposta removida:', id);
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao remover resposta:', error);
      throw error;
    }
  }

  /**
   * Remove todas as respostas de uma inspeção
   */
  static async deleteByInspecaoId(inspecaoId: string): Promise<number> {
    try {
      const count = await offlineDB.respostas_inspecao
        .where('inspecao_id')
        .equals(inspecaoId)
        .delete();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Respostas da inspeção removidas:', inspecaoId, count);
      return count;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao remover respostas da inspeção:', error);
      throw error;
    }
  }

  /**
   * Marca uma resposta como sincronizada
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      await offlineDB.respostas_inspecao.update(id, { sincronizado: true });
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Resposta marcada como sincronizada:', id);
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao marcar resposta como sincronizada:', error);
      throw error;
    }
  }

  /**
   * Conta o total de respostas offline
   */
  static async count(): Promise<number> {
    try {
      const count = await offlineDB.respostas_inspecao.count();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Total de respostas:', count);
      return count;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao contar respostas:', error);
      throw error;
    }
  }

  /**
   * Conta respostas pendentes de sincronização
   */
  static async countPendentes(): Promise<number> {
    try {
      const count = await offlineDB.respostas_inspecao
        .where('sincronizado')
        .equals(false)
        .count();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Respostas pendentes:', count);
      return count;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao contar respostas pendentes:', error);
      throw error;
    }
  }

  /**
   * Conta respostas de uma inspeção específica
   */
  static async countByInspecaoId(inspecaoId: string): Promise<number> {
    try {
      const count = await offlineDB.respostas_inspecao
        .where('inspecao_id')
        .equals(inspecaoId)
        .count();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Respostas da inspeção:', inspecaoId, count);
      return count;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao contar respostas da inspeção:', error);
      throw error;
    }
  }

  /**
   * Limpa respostas sincronizadas antigas
   */
  static async limparSincronizadas(): Promise<number> {
    try {
      const count = await offlineDB.respostas_inspecao
        .where('sincronizado')
        .equals(true)
        .delete();
      console.log('✅ [RESPOSTA INSPECAO MANAGER] Respostas sincronizadas removidas:', count);
      return count;
    } catch (error) {
      console.error('❌ [RESPOSTA INSPECAO MANAGER] Erro ao limpar respostas sincronizadas:', error);
      throw error;
    }
  }
}
