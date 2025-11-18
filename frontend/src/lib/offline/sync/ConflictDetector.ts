// ===================================================================
// CONFLICT DETECTOR - ECOFIELD SYSTEM
// Localização: src/lib/offline/sync/ConflictDetector.ts
// Módulo: Detecção de conflitos na sincronização offline
// ===================================================================

export interface ConflictInfo {
  entityType: 'termo' | 'lv' | 'rotina' | 'inspecao';
  entityId: string;
  localData: any;
  remoteData: any;
  localModifiedAt: string;
  remoteModifiedAt: string;
  conflictType: 'update' | 'delete';
}

export interface ConflictResolution {
  action: 'keep-local' | 'keep-remote' | 'merge' | 'skip';
  mergedData?: any;
}

export type ConflictCallback = (conflict: ConflictInfo) => Promise<ConflictResolution>;

// ===================================================================
// DETECTOR DE CONFLITOS
// ===================================================================

export class ConflictDetector {
  /**
   * Verificar se registro existe no servidor e comparar timestamps
   */
  static async checkForConflict(
    entityType: 'termo' | 'lv' | 'rotina' | 'inspecao',
    localData: any,
    token: string
  ): Promise<ConflictInfo | null> {
    try {
      const apiEndpoint = this.getApiEndpoint(entityType);

      // Tentar buscar registro online usando ID offline
      // Se não existir, não há conflito (registro novo)
      const response = await fetch(`${import.meta.env.VITE_API_URL}${apiEndpoint}/${localData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Se não encontrou (404), não há conflito - é um registro novo
      if (response.status === 404) {
        console.log(`✅ [CONFLICT DETECTOR] Nenhum conflito: registro ${localData.id} é novo`);
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erro ao verificar registro online: ${response.status}`);
      }

      const remoteData = await response.json();

      // Comparar timestamps
      const localModifiedAt = new Date(localData.updated_at || localData.created_at);
      const remoteModifiedAt = new Date(remoteData.updated_at || remoteData.created_at);

      // Se timestamp local for mais recente ou igual, não há conflito
      if (localModifiedAt >= remoteModifiedAt) {
        console.log(`✅ [CONFLICT DETECTOR] Nenhum conflito: local mais recente ou igual`);
        return null;
      }

      // CONFLITO DETECTADO: Registro foi modificado online após modificação local
      console.warn(`⚠️ [CONFLICT DETECTOR] CONFLITO DETECTADO para ${entityType} ${localData.id}`);
      console.warn(`   Local modificado em: ${localModifiedAt.toISOString()}`);
      console.warn(`   Remoto modificado em: ${remoteModifiedAt.toISOString()}`);

      return {
        entityType,
        entityId: localData.id,
        localData,
        remoteData,
        localModifiedAt: localModifiedAt.toISOString(),
        remoteModifiedAt: remoteModifiedAt.toISOString(),
        conflictType: 'update'
      };

    } catch (error) {
      console.error(`❌ [CONFLICT DETECTOR] Erro ao verificar conflito:`, error);

      // Em caso de erro (ex: sem conexão), assumir que não há conflito
      // Isso permite que a sincronização continue
      return null;
    }
  }

  /**
   * Resolver conflito com escolha do usuário
   */
  static async resolveConflict(
    conflict: ConflictInfo,
    resolution: ConflictResolution,
    token: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      switch (resolution.action) {
        case 'keep-local':
          // Sobrescrever remoto com local
          return await this.updateRemote(conflict.entityType, conflict.localData, token);

        case 'keep-remote':
          // Descartar local, manter remoto
          return { success: true, data: conflict.remoteData };

        case 'merge':
          // Mesclar dados (se fornecido)
          if (resolution.mergedData) {
            return await this.updateRemote(conflict.entityType, resolution.mergedData, token);
          }
          return { success: false, error: 'Dados mesclados não fornecidos' };

        case 'skip':
          // Pular sincronização deste item
          return { success: false, error: 'Sincronização pulada pelo usuário' };

        default:
          return { success: false, error: 'Ação de resolução inválida' };
      }
    } catch (error) {
      console.error(`❌ [CONFLICT DETECTOR] Erro ao resolver conflito:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualizar registro remoto
   */
  private static async updateRemote(
    entityType: 'termo' | 'lv' | 'rotina' | 'inspecao',
    data: any,
    token: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const apiEndpoint = this.getApiEndpoint(entityType);

      const response = await fetch(`${import.meta.env.VITE_API_URL}${apiEndpoint}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ [CONFLICT DETECTOR] Registro remoto atualizado:`, result);

      return { success: true, data: result };

    } catch (error) {
      console.error(`❌ [CONFLICT DETECTOR] Erro ao atualizar remoto:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obter endpoint da API para cada tipo de entidade
   */
  private static getApiEndpoint(entityType: 'termo' | 'lv' | 'rotina' | 'inspecao'): string {
    const endpoints = {
      termo: '/api/termos',
      lv: '/api/lvs',
      rotina: '/api/rotinas',
      inspecao: '/api/inspecoes'
    };

    return endpoints[entityType];
  }

  /**
   * Criar descrição legível do conflito para exibir ao usuário
   */
  static getConflictDescription(conflict: ConflictInfo): string {
    const entityNames = {
      termo: 'Termo Ambiental',
      lv: 'Lista de Verificação',
      rotina: 'Atividade de Rotina',
      inspecao: 'Inspeção'
    };

    const entityName = entityNames[conflict.entityType];
    const localDate = new Date(conflict.localModifiedAt).toLocaleString('pt-BR');
    const remoteDate = new Date(conflict.remoteModifiedAt).toLocaleString('pt-BR');

    return `${entityName} foi modificado(a) localmente em ${localDate}, mas também foi modificado(a) no servidor em ${remoteDate}. Qual versão deseja manter?`;
  }

  /**
   * Comparar campos importantes entre versões local e remota
   * Retorna lista de diferenças para ajudar usuário a decidir
   */
  static compareVersions(conflict: ConflictInfo): Array<{ field: string; local: any; remote: any }> {
    const differences: Array<{ field: string; local: any; remote: any }> = [];

    // Campos importantes para comparar (dependendo do tipo de entidade)
    const importantFields = this.getImportantFields(conflict.entityType);

    for (const field of importantFields) {
      const localValue = conflict.localData[field];
      const remoteValue = conflict.remoteData[field];

      // Comparar valores (considerando null/undefined como iguais a '')
      const localNormalized = localValue ?? '';
      const remoteNormalized = remoteValue ?? '';

      if (localNormalized !== remoteNormalized) {
        differences.push({
          field,
          local: localValue,
          remote: remoteValue
        });
      }
    }

    return differences;
  }

  /**
   * Obter campos importantes para comparar por tipo de entidade
   */
  private static getImportantFields(entityType: 'termo' | 'lv' | 'rotina' | 'inspecao'): string[] {
    const fieldsByType = {
      termo: [
        'numero_termo',
        'status',
        'tipo_termo',
        'descricao_nc_1',
        'severidade_nc_1',
        'acao_correcao_1',
        'prazo_acao_1',
        'observacoes'
      ],
      lv: [
        'numero_lv',
        'status',
        'tipo_lv',
        'observacao',
        'data_inspecao'
      ],
      rotina: [
        'atividade',
        'status',
        'descricao',
        'data_atividade',
        'km_percorrido'
      ],
      inspecao: [
        'status',
        'data_inspecao',
        'observacoes'
      ]
    };

    return fieldsByType[entityType] || [];
  }
}
