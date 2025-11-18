// ===================================================================
// ENCARREGADO MANAGER - ECOFIELD SYSTEM
// Localização: src/lib/offline/entities/managers/EncarregadoManager.ts
// Módulo: Gerenciador de encarregados offline
// ===================================================================

import type { EncarregadoOffline } from '../../../../types/offline';
import { offlineDB } from '../../database';

// ===================================================================
// GERENCIADOR DE ENCARREGADOS OFFLINE
// ===================================================================

export class EncarregadoManager {
  /**
   * Salvar encarregado offline
   */
  static async save(encarregado: EncarregadoOffline): Promise<void> {
    try {
      await offlineDB.encarregados.put(encarregado);
      console.log('✅ [ENCARREGADO MANAGER] Encarregado salvo com sucesso:', encarregado.id);
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao salvar encarregado:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os encarregados offline
   */
  static async getAll(): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados.toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregados:', error);
      return [];
    }
  }

  /**
   * Buscar encarregado por ID
   */
  static async getById(id: string): Promise<EncarregadoOffline | undefined> {
    try {
      const encarregado = await offlineDB.encarregados.get(id);
      if (encarregado) {
        console.log('✅ [ENCARREGADO MANAGER] Encarregado encontrado:', id);
      } else {
        console.log('⚠️ [ENCARREGADO MANAGER] Encarregado não encontrado:', id);
      }
      return encarregado;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregado por ID:', error);
      return undefined;
    }
  }

  /**
   * Buscar encarregado por nome
   */
  static async getByNome(nome: string): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados
        .filter(encarregado => 
          encarregado.nome_completo.toLowerCase().includes(nome.toLowerCase()) ||
          encarregado.apelido?.toLowerCase().includes(nome.toLowerCase())
        )
        .toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados com nome "${nome}" encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregado por nome:', error);
      return [];
    }
  }

  /**
   * Buscar encarregados ativos
   */
  static async getAtivos(): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados
        .filter(encarregado => encarregado.ativo !== false)
        .toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados ativos encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregados ativos:', error);
      return [];
    }
  }

  /**
   * Deletar encarregado por ID
   */
  static async delete(id: string): Promise<void> {
    try {
      await offlineDB.encarregados.delete(id);
      console.log('✅ [ENCARREGADO MANAGER] Encarregado deletado:', id);
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao deletar encarregado:', error);
      throw error;
    }
  }

  /**
   * Atualizar encarregado
   */
  static async update(encarregado: EncarregadoOffline): Promise<void> {
    try {
      await offlineDB.encarregados.put(encarregado);
      console.log('✅ [ENCARREGADO MANAGER] Encarregado atualizado:', encarregado.id);
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao atualizar encarregado:', error);
      throw error;
    }
  }

  /**
   * Contar total de encarregados
   */
  static async count(): Promise<number> {
    try {
      const total = await offlineDB.encarregados.count();
      return total;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao contar encarregados:', error);
      return 0;
    }
  }

  /**
   * Contar encarregados ativos
   */
  static async countAtivos(): Promise<number> {
    try {
      const total = await offlineDB.encarregados
        .filter(encarregado => encarregado.ativo !== false)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao contar encarregados ativos:', error);
      return 0;
    }
  }

  /**
   * Buscar encarregados por empresa
   */
  static async getByEmpresa(empresaId: string): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados
        .filter(encarregado => encarregado.empresa_id === empresaId)
        .toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados da empresa ${empresaId} encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregados por empresa:', error);
      return [];
    }
  }

  /**
   * Buscar encarregados por área
   */
  static async getByArea(areaId: string): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados
        .filter(encarregado => encarregado.area_id === areaId)
        .toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados da área ${areaId} encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregados por área:', error);
      return [];
    }
  }

  /**
   * Verificar se encarregado existe
   */
  static async exists(id: string): Promise<boolean> {
    try {
      const encarregado = await offlineDB.encarregados.get(id);
      return !!encarregado;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao verificar se encarregado existe:', error);
      return false;
    }
  }

  /**
   * Buscar encarregados por especialidade
   */
  static async getByEspecialidade(especialidade: string): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados
        .filter(encarregado => 
          encarregado.especialidades?.some(esp => 
            esp.toLowerCase().includes(especialidade.toLowerCase())
          )
        )
        .toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados com especialidade "${especialidade}" encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregados por especialidade:', error);
      return [];
    }
  }

  /**
   * Buscar encarregados pendentes de sincronização
   */
  static async getPendentes(): Promise<EncarregadoOffline[]> {
    try {
      const encarregados = await offlineDB.encarregados
        .filter(encarregado => !encarregado.sincronizado)
        .toArray();
      console.log(`✅ [ENCARREGADO MANAGER] ${encarregados.length} encarregados pendentes encontrados`);
      return encarregados;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao buscar encarregados pendentes:', error);
      return [];
    }
  }

  /**
   * Marcar encarregado como sincronizado
   */
  static async marcarSincronizado(id: string): Promise<void> {
    try {
      await offlineDB.encarregados.update(id, { sincronizado: true });
      console.log('✅ [ENCARREGADO MANAGER] Encarregado marcado como sincronizado:', id);
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao marcar como sincronizado:', error);
      throw error;
    }
  }

  /**
   * Contar encarregados pendentes
   */
  static async countPendentes(): Promise<number> {
    try {
      const total = await offlineDB.encarregados
        .filter(encarregado => !encarregado.sincronizado)
        .count();
      return total;
    } catch (error) {
      console.error('❌ [ENCARREGADO MANAGER] Erro ao contar pendentes:', error);
      return 0;
    }
  }
}
