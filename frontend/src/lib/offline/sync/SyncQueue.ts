// ===================================================================
// SYNC QUEUE - P1 #2 IMPLEMENTATION
// Localização: src/lib/offline/sync/SyncQueue.ts
// Módulo: Fila de sincronização persistente com retry logic
// ===================================================================

import { offlineDB } from '../database';
import type { SyncQueueItem } from '../database/EcoFieldDB';
import { TermoSync } from './syncers/TermoSync';
import { LVSync } from './syncers/LVSync';
import { AtividadeRotinaSync } from './syncers/AtividadeRotinaSync';
import { InspecaoSync } from './syncers/InspecaoSync';
import { EncarregadoSync } from './syncers/EncarregadoSync';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

export interface SyncQueueResult {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  errors: Array<{ entity_type: string; entity_id: string; error: string }>;
}

export interface SyncQueueStats {
  total: number;
  pending: number;
  scheduled: number;
  failedRecently: number;
  byEntityType: Record<string, number>;
}

// ===================================================================
// CONFIGURAÇÕES
// ===================================================================

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_PRIORITY = 10;
const RETRY_BACKOFF_MS = [1000, 5000, 15000, 60000, 300000]; // Exponencial backoff
const MAX_CONCURRENT_SYNCS = 3;

// ===================================================================
// CLASSE SYNC QUEUE
// ===================================================================

export class SyncQueue {
  /**
   * Adicionar item à fila de sincronização
   */
  static async enqueue(
    entity_type: SyncQueueItem['entity_type'],
    entity_id: string,
    operation: SyncQueueItem['operation'],
    options?: {
      priority?: number;
      max_retries?: number;
      scheduled_for?: string;
      payload?: any;
    }
  ): Promise<string> {
    try {
      // Verificar se já existe item para esta entidade
      const existing = await offlineDB.sync_queue
        .where('[entity_type+entity_id]')
        .equals([entity_type, entity_id])
        .first();

      if (existing) {
        console.log(
          `⚠️ [SYNC QUEUE] Item já existe na fila: ${entity_type}/${entity_id} - atualizando...`
        );

        // Atualizar item existente
        await offlineDB.sync_queue.update(existing.id, {
          operation,
          priority: options?.priority ?? existing.priority,
          max_retries: options?.max_retries ?? existing.max_retries,
          scheduled_for: options?.scheduled_for,
          payload: options?.payload
        });

        return existing.id;
      }

      // Criar novo item
      const item: SyncQueueItem = {
        id: crypto.randomUUID(),
        entity_type,
        entity_id,
        operation,
        priority: options?.priority ?? DEFAULT_PRIORITY,
        retries: 0,
        max_retries: options?.max_retries ?? DEFAULT_MAX_RETRIES,
        created_at: new Date().toISOString(),
        scheduled_for: options?.scheduled_for,
        payload: options?.payload
      };

      await offlineDB.sync_queue.add(item);

      console.log(
        `✅ [SYNC QUEUE] Item adicionado à fila: ${entity_type}/${entity_id} (prioridade: ${item.priority})`
      );

      return item.id;
    } catch (error) {
      console.error('❌ [SYNC QUEUE] Erro ao adicionar item à fila:', error);
      throw error;
    }
  }

  /**
   * Processar itens pendentes na fila
   */
  static async processPending(
    options?: {
      limit?: number;
      entityType?: SyncQueueItem['entity_type'];
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<SyncQueueResult> {
    console.log('🔄 [SYNC QUEUE] Iniciando processamento da fila...');

    const result: SyncQueueResult = {
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    try {
      // Buscar itens pendentes
      let query = offlineDB.sync_queue
        .orderBy('priority')
        .filter(item => {
          // Filtrar itens agendados para o futuro
          if (item.scheduled_for) {
            const scheduledDate = new Date(item.scheduled_for);
            const now = new Date();
            return scheduledDate <= now;
          }
          return true;
        });

      // Filtrar por tipo de entidade se especificado
      if (options?.entityType) {
        query = query.filter(item => item.entity_type === options.entityType);
      }

      const items = await query.limit(options?.limit ?? 10).toArray();
      result.total = items.length;

      console.log(`📦 [SYNC QUEUE] ${result.total} itens para processar`);

      if (result.total === 0) {
        return result;
      }

      // Processar itens em lotes (máximo 3 concorrentes)
      for (let i = 0; i < items.length; i += MAX_CONCURRENT_SYNCS) {
        const batch = items.slice(i, i + MAX_CONCURRENT_SYNCS);

        await Promise.all(
          batch.map(item => this.processItem(item, result))
        );

        result.processed += batch.length;
        options?.onProgress?.(result.processed, result.total);
      }

      console.log(`✅ [SYNC QUEUE] Processamento concluído:`, {
        total: result.total,
        succeeded: result.succeeded,
        failed: result.failed,
        skipped: result.skipped
      });

      return result;
    } catch (error) {
      console.error('❌ [SYNC QUEUE] Erro ao processar fila:', error);
      throw error;
    }
  }

  /**
   * Processar um item individual da fila
   */
  private static async processItem(
    item: SyncQueueItem,
    result: SyncQueueResult
  ): Promise<void> {
    console.log(
      `🔄 [SYNC QUEUE] Processando: ${item.entity_type}/${item.entity_id} (tentativa ${item.retries + 1}/${item.max_retries})`
    );

    try {
      // Verificar se excedeu o número de tentativas
      if (item.retries >= item.max_retries) {
        console.warn(
          `⚠️ [SYNC QUEUE] Item excedeu tentativas máximas: ${item.entity_type}/${item.entity_id}`
        );
        result.skipped++;
        result.errors.push({
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          error: `Excedeu ${item.max_retries} tentativas`
        });
        return;
      }

      // Executar sincronização baseada no tipo de entidade
      let success = false;

      switch (item.entity_type) {
        case 'termo':
          success = await this.syncTermo(item);
          break;
        case 'lv':
          success = await this.syncLV(item);
          break;
        case 'rotina':
          success = await this.syncRotina(item);
          break;
        case 'inspecao':
          success = await this.syncInspecao(item);
          break;
        case 'encarregado':
          success = await this.syncEncarregado(item);
          break;
        default:
          throw new Error(`Tipo de entidade desconhecido: ${item.entity_type}`);
      }

      if (success) {
        // Sincronização bem-sucedida - remover da fila
        await offlineDB.sync_queue.delete(item.id);
        result.succeeded++;
        console.log(`✅ [SYNC QUEUE] Item sincronizado: ${item.entity_type}/${item.entity_id}`);
      } else {
        // Falha na sincronização - incrementar retries
        await this.handleSyncFailure(item, 'Sincronização retornou false');
        result.failed++;
      }
    } catch (error: any) {
      console.error(
        `❌ [SYNC QUEUE] Erro ao processar item ${item.entity_type}/${item.entity_id}:`,
        error
      );

      await this.handleSyncFailure(item, error.message || 'Erro desconhecido');

      result.failed++;
      result.errors.push({
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        error: error.message || 'Erro desconhecido'
      });
    }
  }

  /**
   * Tratar falha de sincronização
   */
  private static async handleSyncFailure(
    item: SyncQueueItem,
    errorMessage: string
  ): Promise<void> {
    const newRetries = item.retries + 1;

    // Calcular próximo agendamento com backoff exponencial
    const backoffMs = RETRY_BACKOFF_MS[Math.min(newRetries - 1, RETRY_BACKOFF_MS.length - 1)];
    const nextAttempt = new Date(Date.now() + backoffMs).toISOString();

    await offlineDB.sync_queue.update(item.id, {
      retries: newRetries,
      last_error: errorMessage,
      last_attempt_at: new Date().toISOString(),
      scheduled_for: nextAttempt
    });

    console.log(
      `⏰ [SYNC QUEUE] Reagendado para ${new Date(nextAttempt).toLocaleString()} (backoff: ${backoffMs}ms)`
    );
  }

  /**
   * Sincronizar Termo
   */
  private static async syncTermo(item: SyncQueueItem): Promise<boolean> {
    const syncResult = await TermoSync.syncAll();
    return syncResult.sincronizados > 0;
  }

  /**
   * Sincronizar LV
   */
  private static async syncLV(item: SyncQueueItem): Promise<boolean> {
    const syncResult = await LVSync.syncAll();
    return syncResult.sincronizadas > 0;
  }

  /**
   * Sincronizar Atividade de Rotina
   */
  private static async syncRotina(item: SyncQueueItem): Promise<boolean> {
    const syncResult = await AtividadeRotinaSync.syncAll();
    return syncResult.sincronizados > 0;
  }

  /**
   * Sincronizar Inspeção
   */
  private static async syncInspecao(item: SyncQueueItem): Promise<boolean> {
    const syncResult = await InspecaoSync.syncAll();
    return syncResult.sincronizados > 0;
  }

  /**
   * Sincronizar Encarregado
   */
  private static async syncEncarregado(item: SyncQueueItem): Promise<boolean> {
    const syncResult = await EncarregadoSync.syncAll();
    return syncResult.sincronizados > 0;
  }

  /**
   * Obter estatísticas da fila
   */
  static async getStats(): Promise<SyncQueueStats> {
    const allItems = await offlineDB.sync_queue.toArray();
    const now = new Date();

    const stats: SyncQueueStats = {
      total: allItems.length,
      pending: 0,
      scheduled: 0,
      failedRecently: 0,
      byEntityType: {}
    };

    for (const item of allItems) {
      // Contar por tipo
      stats.byEntityType[item.entity_type] = (stats.byEntityType[item.entity_type] || 0) + 1;

      // Classificar status
      if (item.scheduled_for && new Date(item.scheduled_for) > now) {
        stats.scheduled++;
      } else {
        stats.pending++;
      }

      // Contar falhas recentes (últimas 24h)
      if (item.last_attempt_at) {
        const lastAttempt = new Date(item.last_attempt_at);
        const hoursSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastAttempt < 24 && item.retries > 0) {
          stats.failedRecently++;
        }
      }
    }

    return stats;
  }

  /**
   * Limpar itens que excederam tentativas
   */
  static async cleanupFailedItems(): Promise<number> {
    const items = await offlineDB.sync_queue
      .filter(item => item.retries >= item.max_retries)
      .toArray();

    for (const item of items) {
      await offlineDB.sync_queue.delete(item.id);
      console.log(
        `🗑️ [SYNC QUEUE] Item removido por exceder tentativas: ${item.entity_type}/${item.entity_id}`
      );
    }

    return items.length;
  }

  /**
   * Limpar toda a fila
   */
  static async clear(): Promise<void> {
    await offlineDB.sync_queue.clear();
    console.log('🗑️ [SYNC QUEUE] Fila limpa');
  }

  /**
   * Remover item específico da fila
   */
  static async remove(itemId: string): Promise<void> {
    await offlineDB.sync_queue.delete(itemId);
    console.log(`🗑️ [SYNC QUEUE] Item removido: ${itemId}`);
  }
}
