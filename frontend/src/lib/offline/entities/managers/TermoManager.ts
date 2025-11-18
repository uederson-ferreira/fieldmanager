// ===================================================================
// TERMO MANAGER - ECOFIELD SYSTEM
// Localização: src/lib/offline/entities/managers/TermoManager.ts
// Módulo: Gerenciador de termos ambientais offline
// ===================================================================

import type { TermoAmbientalOffline, TermoFotoOffline } from '../../../../types/offline';
import { offlineDB } from '../../database';
import { validateWithStats, ValidationError, normalizeData } from '../../validation';

// ===================================================================
// GERENCIADOR DE TERMOS AMBIENTAIS OFFLINE
// ===================================================================

export class TermoManager {
  /**
   * Salvar termo ambiental offline
   * ✅ P2 #1: Com validação de dados
   */
  static async save(termo: TermoAmbientalOffline): Promise<void> {
    try {
      // ✅ P2 #1: Normalizar dados
      const normalized = normalizeData(termo);

      // ✅ P2 #1: Validar dados
      const validation = validateWithStats(normalized, 'termo');

      if (!validation.valid) {
        console.error('❌ [TERMO MANAGER] Dados inválidos:', validation.errors);
        throw new ValidationError(validation.errors);
      }

      await offlineDB.termos_ambientais.put(normalized);
      console.log('✅ [TERMO MANAGER] Termo salvo com sucesso:', termo.id);
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao salvar termo:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os termos ambientais offline
   */
  static async getAll(): Promise<TermoAmbientalOffline[]> {
    try {
      const termos = await offlineDB.termos_ambientais.toArray();
      console.log(`✅ [TERMO MANAGER] ${termos.length} termos encontrados`);
      return termos;
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao buscar termos:', error);
      return [];
    }
  }

  /**
   * Buscar termo por ID
   */
  static async getById(id: string): Promise<TermoAmbientalOffline | undefined> {
    try {
      const termo = await offlineDB.termos_ambientais.get(id);
      if (termo) {
        console.log('✅ [TERMO MANAGER] Termo encontrado:', id);
      } else {
        console.log('⚠️ [TERMO MANAGER] Termo não encontrado:', id);
      }
      return termo;
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao buscar termo por ID:', error);
      return undefined;
    }
  }

  /**
   * Buscar termos pendentes de sincronização
   */
  static async getPendentes(): Promise<TermoAmbientalOffline[]> {
    try {
      const termos = await offlineDB.termos_ambientais
        .filter(termo => termo.sincronizado === false)
        .toArray();
      console.log(`✅ [TERMO MANAGER] ${termos.length} termos pendentes encontrados`);
      return termos;
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao buscar termos pendentes:', error);
      return [];
    }
  }

  /**
   * Deletar termo por ID (com transação atômica para deletar fotos associadas)
   */
  static async delete(id: string): Promise<void> {
    try {
      // ✅ CORREÇÃO P0: Usar transação atômica para garantir integridade
      await offlineDB.transaction('rw', [offlineDB.termos_ambientais, offlineDB.termos_fotos], async () => {
        // 1. Deletar termo
        await offlineDB.termos_ambientais.delete(id);

        // 2. Deletar fotos associadas (cascade)
        const fotosRemovidas = await offlineDB.termos_fotos
          .where('termo_id')
          .equals(id)
          .delete();

        console.log('✅ [TERMO MANAGER] Termo deletado:', id);
        console.log(`✅ [TERMO MANAGER] ${fotosRemovidas} fotos órfãs removidas`);
      });
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao deletar termo:', error);
      throw error;
    }
  }

  /**
   * Atualizar termo
   */
  static async update(termo: TermoAmbientalOffline): Promise<void> {
    try {
      await offlineDB.termos_ambientais.put(termo);
      console.log('✅ [TERMO MANAGER] Termo atualizado:', termo.id);
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao atualizar termo:', error);
      throw error;
    }
  }

  /**
   * Marcar termo como sincronizado
   */
  static async marcarSincronizado(id: string): Promise<void> {
    try {
      const termo = await offlineDB.termos_ambientais.get(id);
      if (termo) {
        termo.sincronizado = true;
        await offlineDB.termos_ambientais.put(termo);
        console.log('✅ [TERMO MANAGER] Termo marcado como sincronizado:', id);
      }
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao marcar termo como sincronizado:', error);
      throw error;
    }
  }

  /**
   * Contar total de termos
   */
  static async count(): Promise<number> {
    try {
      const total = await offlineDB.termos_ambientais.count();
      return total;
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao contar termos:', error);
      return 0;
    }
  }

  /**
   * Contar termos pendentes
   */
  static async countPendentes(): Promise<number> {
    try {
      const total = await offlineDB.termos_ambientais
        .filter(termo => termo.sincronizado === false)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [TERMO MANAGER] Erro ao contar termos pendentes:', error);
      return 0;
    }
  }
}

// ===================================================================
// GERENCIADOR DE FOTOS DE TERMOS OFFLINE
// ===================================================================

export class TermoFotoManager {
  /**
   * Salvar foto de termo offline
   */
  static async save(foto: TermoFotoOffline): Promise<void> {
    try {
      await offlineDB.termos_fotos.put(foto);
      console.log('✅ [TERMO FOTO MANAGER] Foto salva com sucesso:', foto.id);
    } catch (error) {
      console.error('❌ [TERMO FOTO MANAGER] Erro ao salvar foto:', error);
      throw error;
    }
  }

  /**
   * Buscar fotos por termo ID
   */
  static async getByTermoId(termoId: string): Promise<TermoFotoOffline[]> {
    try {
      const fotos = await offlineDB.termos_fotos
        .where('termo_id')
        .equals(termoId)
        .toArray();
      console.log(`✅ [TERMO FOTO MANAGER] ${fotos.length} fotos encontradas para termo:`, termoId);
      return fotos;
    } catch (error) {
      console.error('❌ [TERMO FOTO MANAGER] Erro ao buscar fotos por termo:', error);
      return [];
    }
  }

  /**
   * Deletar foto por ID
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.termos_fotos.delete(id);
      console.log('✅ [TERMO FOTO MANAGER] Foto deletada:', id);
    } catch (error) {
      console.error('❌ [TERMO FOTO MANAGER] Erro ao deletar foto:', error);
      throw error;
    }
  }

  /**
   * Deletar todas as fotos de um termo
   */
  static async deleteByTermoId(termoId: string): Promise<void> {
    try {
      await offlineDB.termos_fotos
        .where('termo_id')
        .equals(termoId)
        .delete();
      console.log('✅ [TERMO FOTO MANAGER] Todas as fotos do termo deletadas:', termoId);
    } catch (error) {
      console.error('❌ [TERMO FOTO MANAGER] Erro ao deletar fotos do termo:', error);
      throw error;
    }
  }

  /**
   * Contar fotos por termo
   */
  static async countByTermoId(termoId: string): Promise<number> {
    try {
      const total = await offlineDB.termos_fotos
        .where('termo_id')
        .equals(termoId)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [TERMO FOTO MANAGER] Erro ao contar fotos do termo:', error);
      return 0;
    }
  }
}
