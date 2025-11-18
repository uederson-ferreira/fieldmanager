// ===================================================================
// ATIVIDADE ROTINA MANAGER - ECOFIELD SYSTEM
// Localização: src/lib/offline/entities/managers/AtividadeRotinaManager.ts
// Módulo: Gerenciador de atividades de rotina offline
// ===================================================================

import type { AtividadeRotinaOffline, FotoRotinaOffline } from '../../../../types/offline';
import { offlineDB } from '../../database';

// ===================================================================
// GERENCIADOR DE ATIVIDADES DE ROTINA OFFLINE
// ===================================================================

export class AtividadeRotinaManager {
  /**
   * Salvar atividade de rotina offline
   */
  static async save(atividade: AtividadeRotinaOffline): Promise<void> {
    try {
      await offlineDB.atividades_rotina.put(atividade);
      console.log('✅ [ATIVIDADE ROTINA MANAGER] Atividade salva com sucesso:', atividade.id);
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao salvar atividade:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as atividades de rotina offline
   */
  static async getAll(): Promise<AtividadeRotinaOffline[]> {
    try {
      const atividades = await offlineDB.atividades_rotina.toArray();
      console.log(`✅ [ATIVIDADE ROTINA MANAGER] ${atividades.length} atividades encontradas`);
      return atividades;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao buscar atividades:', error);
      return [];
    }
  }

  /**
   * Buscar atividade por ID
   */
  static async getById(id: string): Promise<AtividadeRotinaOffline | undefined> {
    try {
      const atividade = await offlineDB.atividades_rotina.get(id);
      if (atividade) {
        console.log('✅ [ATIVIDADE ROTINA MANAGER] Atividade encontrada:', id);
      } else {
        console.log('⚠️ [ATIVIDADE ROTINA MANAGER] Atividade não encontrada:', id);
      }
      return atividade;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao buscar atividade por ID:', error);
      return undefined;
    }
  }

  /**
   * Buscar atividades por área
   */
  static async getByArea(areaId: string): Promise<AtividadeRotinaOffline[]> {
    try {
      const atividades = await offlineDB.atividades_rotina
        .where('area_id')
        .equals(areaId)
        .toArray();
      console.log(`✅ [ATIVIDADE ROTINA MANAGER] ${atividades.length} atividades da área ${areaId} encontradas`);
      return atividades;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao buscar atividades por área:', error);
      return [];
    }
  }

  /**
   * Buscar atividades por data
   */
  static async getByData(data: string): Promise<AtividadeRotinaOffline[]> {
    try {
      const atividades = await offlineDB.atividades_rotina
        .where('data_atividade')
        .equals(data)
        .toArray();
      console.log(`✅ [ATIVIDADE ROTINA MANAGER] ${atividades.length} atividades da data ${data} encontradas`);
      return atividades;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao buscar atividades por data:', error);
      return [];
    }
  }

  /**
   * Buscar atividades pendentes de sincronização
   */
  static async getPendentes(): Promise<AtividadeRotinaOffline[]> {
    try {
      const atividades = await offlineDB.atividades_rotina
        .filter(atividade => atividade.sincronizado === false)
        .toArray();
      console.log(`✅ [ATIVIDADE ROTINA MANAGER] ${atividades.length} atividades pendentes encontradas`);
      return atividades;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao buscar atividades pendentes:', error);
      return [];
    }
  }

  /**
   * Deletar atividade por ID (com transação atômica para deletar fotos associadas)
   */
  static async delete(id: string): Promise<void> {
    try {
      // ✅ CORREÇÃO P0: Usar transação atômica para garantir integridade
      await offlineDB.transaction('rw', [offlineDB.atividades_rotina, offlineDB.fotos_rotina], async () => {
        // 1. Deletar atividade
        await offlineDB.atividades_rotina.delete(id);

        // 2. Deletar fotos associadas (cascade)
        const fotosRemovidas = await offlineDB.fotos_rotina
          .where('atividade_id')
          .equals(id)
          .delete();

        console.log('✅ [ATIVIDADE ROTINA MANAGER] Atividade deletada:', id);
        console.log(`✅ [ATIVIDADE ROTINA MANAGER] ${fotosRemovidas} fotos órfãs removidas`);
      });
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao deletar atividade:', error);
      throw error;
    }
  }

  /**
   * Atualizar atividade
   */
  static async update(atividade: AtividadeRotinaOffline): Promise<void> {
    try {
      await offlineDB.atividades_rotina.put(atividade);
      console.log('✅ [ATIVIDADE ROTINA MANAGER] Atividade atualizada:', atividade.id);
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao atualizar atividade:', error);
      throw error;
    }
  }

  /**
   * Marcar atividade como sincronizada
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      const atividade = await offlineDB.atividades_rotina.get(id);
      if (atividade) {
        atividade.sincronizado = true;
        await offlineDB.atividades_rotina.put(atividade);
        console.log('✅ [ATIVIDADE ROTINA MANAGER] Atividade marcada como sincronizada:', id);
      }
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao marcar atividade como sincronizada:', error);
      throw error;
    }
  }

  /**
   * Contar total de atividades
   */
  static async count(): Promise<number> {
    try {
      const total = await offlineDB.atividades_rotina.count();
      return total;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao contar atividades:', error);
      return 0;
    }
  }

  /**
   * Contar atividades pendentes
   */
  static async countPendentes(): Promise<number> {
    try {
      const total = await offlineDB.atividades_rotina
        .filter(atividade => atividade.sincronizado === false)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao contar atividades pendentes:', error);
      return 0;
    }
  }

  /**
   * Buscar atividades por período
   */
  static async getByPeriodo(dataInicio: string, dataFim: string): Promise<AtividadeRotinaOffline[]> {
    try {
      const atividades = await offlineDB.atividades_rotina
        .filter(atividade => {
          const dataAtividade = new Date(atividade.data_atividade);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return dataAtividade >= inicio && dataAtividade <= fim;
        })
        .toArray();
      console.log(`✅ [ATIVIDADE ROTINA MANAGER] ${atividades.length} atividades no período ${dataInicio} a ${dataFim} encontradas`);
      return atividades;
    } catch (error) {
      console.error('❌ [ATIVIDADE ROTINA MANAGER] Erro ao buscar atividades por período:', error);
      return [];
    }
  }
}

// ===================================================================
// GERENCIADOR DE FOTOS DE ATIVIDADES DE ROTINA OFFLINE
// ===================================================================

export class FotoRotinaManager {
  /**
   * Salvar foto de atividade de rotina offline
   */
  static async save(foto: FotoRotinaOffline): Promise<void> {
    try {
      await offlineDB.fotos_rotina.put(foto);
      console.log('✅ [FOTO ROTINA MANAGER] Foto salva com sucesso:', foto.id);
    } catch (error) {
      console.error('❌ [FOTO ROTINA MANAGER] Erro ao salvar foto:', error);
      throw error;
    }
  }

  /**
   * Buscar fotos por atividade ID
   */
  static async getByAtividadeId(atividadeId: string): Promise<FotoRotinaOffline[]> {
    try {
      const fotos = await offlineDB.fotos_rotina
        .where('atividade_id')
        .equals(atividadeId)
        .toArray();
      console.log(`✅ [FOTO ROTINA MANAGER] ${fotos.length} fotos encontradas para atividade:`, atividadeId);
      return fotos;
    } catch (error) {
      console.error('❌ [FOTO ROTINA MANAGER] Erro ao buscar fotos por atividade:', error);
      return [];
    }
  }

  /**
   * Deletar foto por ID
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.fotos_rotina.delete(id);
      console.log('✅ [FOTO ROTINA MANAGER] Foto deletada:', id);
    } catch (error) {
      console.error('❌ [FOTO ROTINA MANAGER] Erro ao deletar foto:', error);
      throw error;
    }
  }

  /**
   * Deletar todas as fotos de uma atividade
   */
  static async deleteByAtividadeId(atividadeId: string): Promise<void> {
    try {
      await offlineDB.fotos_rotina
        .where('atividade_id')
        .equals(atividadeId)
        .delete();
      console.log('✅ [FOTO ROTINA MANAGER] Todas as fotos da atividade deletadas:', atividadeId);
    } catch (error) {
      console.error('❌ [FOTO ROTINA MANAGER] Erro ao deletar fotos da atividade:', error);
      throw error;
    }
  }

  /**
   * Contar fotos por atividade
   */
  static async countByAtividadeId(atividadeId: string): Promise<number> {
    try {
      const total = await offlineDB.fotos_rotina
        .where('atividade_id')
        .equals(atividadeId)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [FOTO ROTINA MANAGER] Erro ao contar fotos da atividade:', error);
      return 0;
    }
  }

  /**
   * Marcar foto como sincronizada
   */
  static async marcarSincronizada(id: string): Promise<void> {
    try {
      await offlineDB.fotos_rotina.update(id, { sincronizado: true });
      console.log('✅ [FOTO ROTINA MANAGER] Foto marcada como sincronizada:', id);
    } catch (error) {
      console.error('❌ [FOTO ROTINA MANAGER] Erro ao marcar foto como sincronizada:', error);
      throw error;
    }
  }
}
