// ===================================================================
// SOFT DELETE SYSTEM - P2 #3 IMPLEMENTATION
// Localização: src/lib/offline/utils/softDelete.ts
// Módulo: Sistema de soft deletes para recuperação de dados
// ===================================================================

import { offlineDB } from '../database';
import type { Table } from 'dexie';

/**
 * Interface para entidades com soft delete
 */
export interface SoftDeletable {
  id: string;
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

/**
 * Resultado de operação de soft delete
 */
export interface SoftDeleteResult {
  success: boolean;
  id: string;
  deletedAt: string;
  error?: string;
}

/**
 * Estatísticas de soft deletes
 */
export interface SoftDeleteStats {
  total: number;
  active: number;
  deleted: number;
  deletedByUser: Record<string, number>;
  oldestDeletedAt?: string;
  newestDeletedAt?: string;
}

/**
 * Realizar soft delete em uma entidade
 */
export async function softDelete<T extends SoftDeletable>(
  table: Table<T, string>,
  id: string,
  userId?: string
): Promise<SoftDeleteResult> {
  try {
    const deletedAt = new Date().toISOString();

    await table.update(id, {
      deleted: true,
      deleted_at: deletedAt,
      deleted_by: userId
    } as Partial<T>);

    console.log(`🗑️ [SOFT DELETE] Item marcado como deletado: ${id}`);

    return {
      success: true,
      id,
      deletedAt
    };
  } catch (error: any) {
    console.error('❌ [SOFT DELETE] Erro ao marcar item como deletado:', error);
    return {
      success: false,
      id,
      deletedAt: '',
      error: error.message
    };
  }
}

/**
 * Restaurar item soft deleted
 */
export async function restore<T extends SoftDeletable>(
  table: Table<T, string>,
  id: string
): Promise<boolean> {
  try {
    await table.update(id, {
      deleted: false,
      deleted_at: undefined,
      deleted_by: undefined
    } as Partial<T>);

    console.log(`✅ [SOFT DELETE] Item restaurado: ${id}`);
    return true;
  } catch (error) {
    console.error('❌ [SOFT DELETE] Erro ao restaurar item:', error);
    return false;
  }
}

/**
 * Buscar apenas itens ativos (não deletados)
 */
export async function getActive<T extends SoftDeletable>(
  table: Table<T, string>
): Promise<T[]> {
  return table
    .filter(item => !item.deleted)
    .toArray();
}

/**
 * Buscar apenas itens deletados
 */
export async function getDeleted<T extends SoftDeletable>(
  table: Table<T, string>
): Promise<T[]> {
  return table
    .filter(item => item.deleted === true)
    .toArray();
}

/**
 * Contar itens ativos e deletados
 */
export async function getStats<T extends SoftDeletable>(
  table: Table<T, string>
): Promise<SoftDeleteStats> {
  const all = await table.toArray();
  const active = all.filter(item => !item.deleted);
  const deleted = all.filter(item => item.deleted);

  const deletedByUser: Record<string, number> = {};
  let oldestDeletedAt: string | undefined;
  let newestDeletedAt: string | undefined;

  for (const item of deleted) {
    // Contar por usuário
    if (item.deleted_by) {
      deletedByUser[item.deleted_by] = (deletedByUser[item.deleted_by] || 0) + 1;
    }

    // Encontrar mais antigo e mais recente
    if (item.deleted_at) {
      if (!oldestDeletedAt || item.deleted_at < oldestDeletedAt) {
        oldestDeletedAt = item.deleted_at;
      }
      if (!newestDeletedAt || item.deleted_at > newestDeletedAt) {
        newestDeletedAt = item.deleted_at;
      }
    }
  }

  return {
    total: all.length,
    active: active.length,
    deleted: deleted.length,
    deletedByUser,
    oldestDeletedAt,
    newestDeletedAt
  };
}

/**
 * Limpar permanentemente itens deletados há mais de N dias
 */
export async function purgeOldDeleted<T extends SoftDeletable>(
  table: Table<T, string>,
  daysOld: number = 30
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const toDelete = await table
      .filter(item =>
        item.deleted === true &&
        item.deleted_at !== undefined &&
        item.deleted_at < cutoffISO
      )
      .toArray();

    let purged = 0;

    for (const item of toDelete) {
      await table.delete(item.id);
      purged++;
    }

    console.log(`🗑️ [SOFT DELETE] ${purged} itens deletados permanentemente (>${daysOld} dias)`);

    return purged;
  } catch (error) {
    console.error('❌ [SOFT DELETE] Erro ao purgar itens antigos:', error);
    return 0;
  }
}

/**
 * Restaurar múltiplos itens
 */
export async function restoreBatch<T extends SoftDeletable>(
  table: Table<T, string>,
  ids: string[]
): Promise<{ restored: number; failed: number }> {
  let restored = 0;
  let failed = 0;

  for (const id of ids) {
    const success = await restore(table, id);
    if (success) {
      restored++;
    } else {
      failed++;
    }
  }

  console.log(`✅ [SOFT DELETE] Restauração em lote: ${restored} sucesso, ${failed} falhas`);

  return { restored, failed };
}

/**
 * Soft delete em lote
 */
export async function softDeleteBatch<T extends SoftDeletable>(
  table: Table<T, string>,
  ids: string[],
  userId?: string
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (const id of ids) {
    const result = await softDelete(table, id, userId);
    if (result.success) {
      deleted++;
    } else {
      failed++;
    }
  }

  console.log(`🗑️ [SOFT DELETE] Deleção em lote: ${deleted} sucesso, ${failed} falhas`);

  return { deleted, failed };
}

/**
 * Gerenciador de soft deletes para todas as entidades
 */
export class SoftDeleteManager {
  /**
   * Limpar automaticamente itens antigos de todas as tabelas
   */
  static async autoCleanup(daysOld: number = 30): Promise<{
    termos: number;
    lvs: number;
    rotinas: number;
    inspecoes: number;
    total: number;
  }> {
    console.log(`🔄 [SOFT DELETE MANAGER] Limpeza automática iniciada (>${daysOld} dias)`);

    const termos = await purgeOldDeleted(offlineDB.termos_ambientais as any, daysOld);
    const lvs = await purgeOldDeleted(offlineDB.lvs as any, daysOld);
    const rotinas = await purgeOldDeleted(offlineDB.atividades_rotina as any, daysOld);
    const inspecoes = await purgeOldDeleted(offlineDB.inspecoes as any, daysOld);

    const total = termos + lvs + rotinas + inspecoes;

    console.log(`✅ [SOFT DELETE MANAGER] Limpeza concluída: ${total} itens removidos`);

    return { termos, lvs, rotinas, inspecoes, total };
  }

  /**
   * Obter estatísticas gerais de soft deletes
   */
  static async getGeneralStats(): Promise<{
    termos: SoftDeleteStats;
    lvs: SoftDeleteStats;
    rotinas: SoftDeleteStats;
    inspecoes: SoftDeleteStats;
  }> {
    const [termos, lvs, rotinas, inspecoes] = await Promise.all([
      getStats(offlineDB.termos_ambientais as any),
      getStats(offlineDB.lvs as any),
      getStats(offlineDB.atividades_rotina as any),
      getStats(offlineDB.inspecoes as any)
    ]);

    return { termos, lvs, rotinas, inspecoes };
  }

  /**
   * Restaurar todos os itens deletados de uma tabela
   */
  static async restoreAll<T extends SoftDeletable>(
    table: Table<T, string>
  ): Promise<number> {
    const deleted = await getDeleted(table);
    const ids = deleted.map(item => item.id);
    const result = await restoreBatch(table, ids);
    return result.restored;
  }
}
