import { offlineDB } from '../../database';
import type { FotoInspecaoOffline } from '../../../../types/offline';

/**
 * Gerenciador de fotos de inspeção offline
 * Responsável por todas as operações CRUD de fotos no banco local
 */
export class FotoInspecaoManager {
  /**
   * Salva uma foto de inspeção no banco offline
   */
  static async save(foto: FotoInspecaoOffline): Promise<void> {
    try {
      await offlineDB.fotos_inspecao.put(foto);
      console.log('✅ [FOTO INSPECAO MANAGER] Foto salva com sucesso:', foto.id);
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao salvar foto:', error);
      throw error;
    }
  }

  /**
   * Busca todas as fotos de inspeção offline
   */
  static async getAll(): Promise<FotoInspecaoOffline[]> {
    try {
      const fotos = await offlineDB.fotos_inspecao.toArray();
      console.log('✅ [FOTO INSPECAO MANAGER] Buscadas fotos:', fotos.length);
      return fotos;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao buscar fotos:', error);
      throw error;
    }
  }

  /**
   * Busca fotos pendentes de sincronização
   */
  static async getPendentes(): Promise<FotoInspecaoOffline[]> {
    try {
      const fotos = await offlineDB.fotos_inspecao
        .where('sincronizado')
        .equals(false)
        .toArray();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos pendentes:', fotos.length);
      return fotos;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao buscar fotos pendentes:', error);
      throw error;
    }
  }

  /**
   * Busca uma foto específica por ID
   */
  static async getById(id: string): Promise<FotoInspecaoOffline | undefined> {
    try {
      const foto = await offlineDB.fotos_inspecao.get(id);
      if (foto) {
        console.log('✅ [FOTO INSPECAO MANAGER] Foto encontrada:', id);
      } else {
        console.log('⚠️ [FOTO INSPECAO MANAGER] Foto não encontrada:', id);
      }
      return foto;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao buscar foto:', id, error);
      throw error;
    }
  }

  /**
   * Busca fotos por inspeção
   */
  static async getByInspecaoId(inspecaoId: string): Promise<FotoInspecaoOffline[]> {
    try {
      const fotos = await offlineDB.fotos_inspecao
        .where('inspecao_id')
        .equals(inspecaoId)
        .toArray();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos da inspeção:', inspecaoId, fotos.length);
      return fotos;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao buscar fotos da inspeção:', error);
      throw error;
    }
  }

  /**
   * Busca fotos por tipo de inspeção
   */
  static async getByTipoInspecao(tipo: string): Promise<FotoInspecaoOffline[]> {
    try {
      const fotos = await offlineDB.fotos_inspecao
        .where('tipo_inspecao')
        .equals(tipo)
        .toArray();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos do tipo:', tipo, fotos.length);
      return fotos;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao buscar fotos por tipo:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma foto existente
   */
  static async update(foto: FotoInspecaoOffline): Promise<void> {
    try {
      await offlineDB.fotos_inspecao.put(foto);
      console.log('✅ [FOTO INSPECAO MANAGER] Foto atualizada:', foto.id);
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao atualizar foto:', error);
      throw error;
    }
  }

  /**
   * Remove uma foto do banco offline
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.fotos_inspecao.delete(id);
      console.log('✅ [FOTO INSPECAO MANAGER] Foto removida:', id);
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao remover foto:', error);
      throw error;
    }
  }

  /**
   * Remove todas as fotos de uma inspeção
   */
  static async deleteByInspecaoId(inspecaoId: string): Promise<number> {
    try {
      const count = await offlineDB.fotos_inspecao
        .where('inspecao_id')
        .equals(inspecaoId)
        .delete();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos da inspeção removidas:', inspecaoId, count);
      return count;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao remover fotos da inspeção:', error);
      throw error;
    }
  }

  /**
   * Marca uma foto como sincronizada
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      await offlineDB.fotos_inspecao.update(id, { sincronizado: true });
      console.log('✅ [FOTO INSPECAO MANAGER] Foto marcada como sincronizada:', id);
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao marcar foto como sincronizada:', error);
      throw error;
    }
  }

  /**
   * Conta o total de fotos offline
   */
  static async count(): Promise<number> {
    try {
      const count = await offlineDB.fotos_inspecao.count();
      console.log('✅ [FOTO INSPECAO MANAGER] Total de fotos:', count);
      return count;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao contar fotos:', error);
      throw error;
    }
  }

  /**
   * Conta fotos pendentes de sincronização
   */
  static async countPendentes(): Promise<number> {
    try {
      const count = await offlineDB.fotos_inspecao
        .where('sincronizado')
        .equals(false)
        .count();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos pendentes:', count);
      return count;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao contar fotos pendentes:', error);
      throw error;
    }
  }

  /**
   * Conta fotos de uma inspeção específica
   */
  static async countByInspecaoId(inspecaoId: string): Promise<number> {
    try {
      const count = await offlineDB.fotos_inspecao
        .where('inspecao_id')
        .equals(inspecaoId)
        .count();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos da inspeção:', inspecaoId, count);
      return count;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao contar fotos da inspeção:', error);
      throw error;
    }
  }

  /**
   * Busca fotos por tamanho (para otimização)
   */
  static async getByTamanho(minSize: number, maxSize?: number): Promise<FotoInspecaoOffline[]> {
    try {
      let query = offlineDB.fotos_inspecao.where('tamanho').above(minSize);
      
      if (maxSize) {
        query = query.below(maxSize);
      }
      
      const fotos = await query.toArray();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos por tamanho:', minSize, maxSize, fotos.length);
      return fotos;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao buscar fotos por tamanho:', error);
      throw error;
    }
  }

  /**
   * Limpa fotos sincronizadas antigas
   */
  static async limparSincronizadas(): Promise<number> {
    try {
      const count = await offlineDB.fotos_inspecao
        .where('sincronizado')
        .equals(true)
        .delete();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos sincronizadas removidas:', count);
      return count;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao limpar fotos sincronizadas:', error);
      throw error;
    }
  }

  /**
   * Limpa fotos antigas por data
   */
  static async limparAntigas(dataLimite: Date): Promise<number> {
    try {
      const count = await offlineDB.fotos_inspecao
        .where('data_criacao')
        .below(dataLimite)
        .delete();
      console.log('✅ [FOTO INSPECAO MANAGER] Fotos antigas removidas:', dataLimite, count);
      return count;
    } catch (error) {
      console.error('❌ [FOTO INSPECAO MANAGER] Erro ao limpar fotos antigas:', error);
      throw error;
    }
  }
}
