// ===================================================================
// CONFLICT RESOLVER - SPRINT 2
// Localização: src/lib/offline/sync/ConflictResolver.ts
// Módulo: Detecção e resolução de conflitos em sincronização offline
// ===================================================================

/**
 * Tipo de conflito detectado
 */
export type ConflictType =
  | 'REMOTE_NEWER'      // Servidor tem versão mais nova
  | 'LOCAL_NEWER'       // Local tem versão mais nova
  | 'BOTH_MODIFIED'     // Ambos modificados (conflito real)
  | 'NO_CONFLICT';      // Sem conflito

/**
 * Estratégia de resolução de conflito
 */
export type ConflictStrategy =
  | 'USE_LOCAL'         // Usar versão local (sobrescrever servidor)
  | 'USE_REMOTE'        // Usar versão remota (descartar local)
  | 'MERGE'             // Tentar merge automático
  | 'ASK_USER';         // Perguntar ao usuário

/**
 * Resultado da detecção de conflito
 */
export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflictType: ConflictType;
  localTimestamp?: string;
  remoteTimestamp?: string;
  recommendedStrategy: ConflictStrategy;
  message: string;
}

/**
 * Entidade que suporta detecção de conflitos
 */
export interface ConflictableEntity {
  id: string;
  updated_at?: string;
  created_at?: string;
  _local_updated_at?: string;  // Timestamp local para comparação
  _conflict_resolved_at?: string; // Última vez que conflito foi resolvido
}

/**
 * Classe para detectar e resolver conflitos
 */
export class ConflictResolver {
  /**
   * Detectar se existe conflito entre versão local e remota
   */
  static detectConflict(
    local: ConflictableEntity,
    remote: ConflictableEntity
  ): ConflictDetectionResult {
    // Caso 1: Não existe versão remota (registro novo local)
    if (!remote) {
      return {
        hasConflict: false,
        conflictType: 'NO_CONFLICT',
        recommendedStrategy: 'USE_LOCAL',
        message: 'Registro novo criado localmente',
      };
    }

    // Caso 2: Não existe updated_at em ambos - usar created_at como fallback
    const localTimestamp = local.updated_at || local.created_at;
    const remoteTimestamp = remote.updated_at || remote.created_at;

    if (!localTimestamp || !remoteTimestamp) {
      console.warn('⚠️ [CONFLICT] Timestamps ausentes, assumindo sem conflito');
      return {
        hasConflict: false,
        conflictType: 'NO_CONFLICT',
        recommendedStrategy: 'USE_LOCAL',
        message: 'Timestamps ausentes - assumindo sem conflito',
      };
    }

    // Converter para Date para comparação
    const localDate = new Date(localTimestamp);
    const remoteDate = new Date(remoteTimestamp);

    // Caso 3: Timestamps inválidos
    if (isNaN(localDate.getTime()) || isNaN(remoteDate.getTime())) {
      console.error('❌ [CONFLICT] Timestamps inválidos');
      return {
        hasConflict: false,
        conflictType: 'NO_CONFLICT',
        localTimestamp,
        remoteTimestamp,
        recommendedStrategy: 'USE_LOCAL',
        message: 'Timestamps inválidos - usando versão local',
      };
    }

    // Caso 4: Versão remota mais nova (servidor foi atualizado por outro usuário)
    if (remoteDate > localDate) {
      const diffMinutes = Math.floor((remoteDate.getTime() - localDate.getTime()) / (1000 * 60));

      return {
        hasConflict: true,
        conflictType: 'REMOTE_NEWER',
        localTimestamp,
        remoteTimestamp,
        recommendedStrategy: 'USE_REMOTE',
        message: `Versão remota mais recente (${diffMinutes} min mais nova)`,
      };
    }

    // Caso 5: Versão local mais nova (usuário editou offline)
    if (localDate > remoteDate) {
      const diffMinutes = Math.floor((localDate.getTime() - remoteDate.getTime()) / (1000 * 60));

      return {
        hasConflict: true,
        conflictType: 'LOCAL_NEWER',
        localTimestamp,
        remoteTimestamp,
        recommendedStrategy: 'USE_LOCAL',
        message: `Versão local mais recente (${diffMinutes} min mais nova)`,
      };
    }

    // Caso 6: Mesmos timestamps - sem conflito
    return {
      hasConflict: false,
      conflictType: 'NO_CONFLICT',
      localTimestamp,
      remoteTimestamp,
      recommendedStrategy: 'USE_LOCAL',
      message: 'Mesma versão - sem conflito',
    };
  }

  /**
   * Resolver conflito automaticamente baseado na estratégia
   */
  static resolveConflict<T extends ConflictableEntity>(
    local: T,
    remote: T,
    strategy: ConflictStrategy
  ): T {
    console.log(`🔄 [CONFLICT] Resolvendo conflito com estratégia: ${strategy}`);

    switch (strategy) {
      case 'USE_LOCAL':
        console.log('✅ [CONFLICT] Usando versão local');
        return {
          ...local,
          _conflict_resolved_at: new Date().toISOString(),
        };

      case 'USE_REMOTE':
        console.log('✅ [CONFLICT] Usando versão remota');
        return {
          ...remote,
          _conflict_resolved_at: new Date().toISOString(),
        };

      case 'MERGE':
        console.log('🔀 [CONFLICT] Tentando merge automático');
        return this.autoMerge(local, remote);

      case 'ASK_USER':
        console.warn('⚠️ [CONFLICT] Estratégia ASK_USER não suportada em modo automático');
        // Por padrão, usar local quando pede para perguntar
        return {
          ...local,
          _conflict_resolved_at: new Date().toISOString(),
        };

      default:
        console.warn('⚠️ [CONFLICT] Estratégia desconhecida, usando local');
        return local;
    }
  }

  /**
   * Tentativa de merge automático (strategy MERGE)
   * Mantém valores mais recentes campo por campo
   */
  private static autoMerge<T extends ConflictableEntity>(
    local: T,
    remote: T
  ): T {
    console.log('🔀 [CONFLICT] Executando auto-merge');

    const merged = { ...remote }; // Começar com remoto como base

    // Para cada campo do local, verificar se é mais recente
    Object.keys(local).forEach((key) => {
      const localValue = (local as any)[key];
      const remoteValue = (remote as any)[key];

      // Se local tem valor e remoto não tem, usar local
      if (localValue !== undefined && localValue !== null &&
          (remoteValue === undefined || remoteValue === null)) {
        (merged as any)[key] = localValue;
      }
    });

    // Marcar como resolvido
    merged._conflict_resolved_at = new Date().toISOString();
    merged.updated_at = new Date().toISOString();

    console.log('✅ [CONFLICT] Merge automático concluído');
    return merged;
  }

  /**
   * Atualizar timestamp local antes de salvar
   */
  static updateLocalTimestamp<T extends ConflictableEntity>(entity: T): T {
    return {
      ...entity,
      _local_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Verificar se entidade foi modificada localmente
   */
  static isLocallyModified(entity: ConflictableEntity): boolean {
    if (!entity._local_updated_at || !entity.updated_at) {
      return false;
    }

    const localDate = new Date(entity._local_updated_at);
    const remoteDate = new Date(entity.updated_at);

    return localDate > remoteDate;
  }

  /**
   * Formatar mensagem de conflito para o usuário
   */
  static formatConflictMessage(result: ConflictDetectionResult): string {
    if (!result.hasConflict) {
      return 'Sem conflitos detectados';
    }

    const local = result.localTimestamp
      ? new Date(result.localTimestamp).toLocaleString('pt-BR')
      : 'N/A';
    const remote = result.remoteTimestamp
      ? new Date(result.remoteTimestamp).toLocaleString('pt-BR')
      : 'N/A';

    return `⚠️ CONFLITO DETECTADO\n\n` +
           `Tipo: ${result.conflictType}\n` +
           `Versão Local: ${local}\n` +
           `Versão Remota: ${remote}\n\n` +
           `${result.message}\n\n` +
           `Recomendação: ${result.recommendedStrategy}`;
  }
}
