// ===================================================================
// SYNC DASHBOARD - P3 #3 IMPLEMENTATION
// Localização: src/components/offline/SyncDashboard.tsx
// Componente: Dashboard completo de sincronização
// ===================================================================

import React, { useState, useEffect } from 'react';
import { SyncProgressBar } from './SyncProgressBar';
import { SyncStatusCard, type EntitySyncStatus } from './SyncStatusCard';
import { offlineDB } from '../../lib/offline/database';

export interface SyncDashboardProps {
  onSyncAll?: () => Promise<void>;
  onSyncEntity?: (entityType: string) => Promise<void>;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Componente de dashboard de sincronização
 */
export const SyncDashboard: React.FC<SyncDashboardProps> = ({
  onSyncAll,
  onSyncEntity,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [entities, setEntities] = useState<EntitySyncStatus[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carregar status de todas as entidades
   */
  const loadEntitiesStatus = async (): Promise<void> => {
    try {
      // Buscar dados do IndexedDB
      const [termos, lvs, rotinas, fotos] = await Promise.all([
        offlineDB.termos_ambientais.toArray(),
        offlineDB.lvs.toArray(),
        offlineDB.atividades_rotina.toArray(),
        offlineDB.termos_fotos.toArray()
      ]);

      // Calcular status de termos
      const termosStatus: EntitySyncStatus = {
        type: 'termo',
        label: 'Termos Ambientais',
        total: termos.length,
        synced: termos.filter(t => t.sincronizado).length,
        pending: termos.filter(t => !t.sincronizado && !t.deleted).length,
        failed: 0, // Seria obtido da sync queue
        status: termos.every(t => t.sincronizado) ? 'success' : 'pending',
        lastSyncAt: termos
          .filter(t => t.sincronizado)
          .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))[0]?.updated_at
      };

      // Calcular status de LVs
      const lvsStatus: EntitySyncStatus = {
        type: 'lv',
        label: 'Listas de Verificação',
        total: lvs.length,
        synced: lvs.filter(l => l.sincronizado).length,
        pending: lvs.filter(l => !l.sincronizado && !l.deleted).length,
        failed: 0,
        status: lvs.every(l => l.sincronizado) ? 'success' : 'pending',
        lastSyncAt: lvs
          .filter(l => l.sincronizado)
          .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))[0]?.updated_at
      };

      // Calcular status de rotinas
      const rotinasStatus: EntitySyncStatus = {
        type: 'rotina',
        label: 'Atividades de Rotina',
        total: rotinas.length,
        synced: rotinas.filter(r => r.sincronizado).length,
        pending: rotinas.filter(r => !r.sincronizado && !r.deleted).length,
        failed: 0,
        status: rotinas.every(r => r.sincronizado) ? 'success' : 'pending',
        lastSyncAt: rotinas
          .filter(r => r.sincronizado)
          .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))[0]?.updated_at
      };

      // Calcular status de fotos
      const fotosStatus: EntitySyncStatus = {
        type: 'foto',
        label: 'Fotos',
        total: fotos.length,
        synced: fotos.filter(f => f.sincronizado).length,
        pending: fotos.filter(f => !f.sincronizado).length,
        failed: 0,
        status: fotos.every(f => f.sincronizado) ? 'success' : 'pending',
        lastSyncAt: undefined
      };

      setEntities([termosStatus, lvsStatus, rotinasStatus, fotosStatus]);
    } catch (error) {
      console.error('❌ [SYNC DASHBOARD] Erro ao carregar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calcular totais gerais
   */
  const getTotals = () => {
    const total = entities.reduce((sum, e) => sum + e.total, 0);
    const synced = entities.reduce((sum, e) => sum + e.synced, 0);
    const pending = entities.reduce((sum, e) => sum + e.pending, 0);
    const failed = entities.reduce((sum, e) => sum + e.failed, 0);

    return { total, synced, pending, failed };
  };

  /**
   * Sincronizar todas as entidades
   */
  const handleSyncAll = async () => {
    if (!onSyncAll) return;

    setIsSyncing(true);

    try {
      // Estimar tempo (1 segundo por item)
      const totals = getTotals();
      setEstimatedTime(totals.pending);

      await onSyncAll();

      // Atualizar status
      await loadEntitiesStatus();
    } catch (error) {
      console.error('❌ [SYNC DASHBOARD] Erro ao sincronizar:', error);
    } finally {
      setIsSyncing(false);
      setEstimatedTime(null);
    }
  };

  /**
   * Tentar novamente uma entidade específica
   */
  const handleRetryEntity = async (entityType: string) => {
    if (!onSyncEntity) return;

    try {
      await onSyncEntity(entityType);
      await loadEntitiesStatus();
    } catch (error) {
      console.error(`❌ [SYNC DASHBOARD] Erro ao sincronizar ${entityType}:`, error);
    }
  };

  /**
   * Inicializar e auto-refresh
   */
  useEffect(() => {
    loadEntitiesStatus();

    if (autoRefresh) {
      const interval = setInterval(loadEntitiesStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  /**
   * Atualizar tempo estimado
   */
  useEffect(() => {
    if (!isSyncing || estimatedTime === null) return;

    const interval = setInterval(() => {
      setEstimatedTime(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSyncing, estimatedTime]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando status de sincronização...</p>
        </div>
      </div>
    );
  }

  const totals = getTotals();

  return (
    <div className="space-y-6">
      {/* Header com progresso geral */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Status de Sincronização</h2>
            <p className="text-gray-600 mt-1">
              {totals.pending > 0
                ? `${totals.pending} ${totals.pending === 1 ? 'item pendente' : 'itens pendentes'}`
                : 'Tudo sincronizado!'}
            </p>
          </div>

          {onSyncAll && totals.pending > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo'}
            </button>
          )}
        </div>

        {/* Barra de progresso geral */}
        <SyncProgressBar
          current={totals.synced}
          total={totals.total}
          status={isSyncing ? 'syncing' : totals.pending === 0 ? 'success' : 'idle'}
          height={32}
        />

        {/* Tempo estimado */}
        {isSyncing && estimatedTime !== null && estimatedTime > 0 && (
          <p className="text-sm text-gray-600 mt-3 text-center">
            ⏱️ Tempo estimado restante: {estimatedTime}s
          </p>
        )}

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-800">{totals.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{totals.synced}</div>
            <div className="text-xs text-green-600">Sincronizado</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{totals.pending}</div>
            <div className="text-xs text-yellow-600">Pendente</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">{totals.failed}</div>
            <div className="text-xs text-red-600">Falhas</div>
          </div>
        </div>
      </div>

      {/* Status por entidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Status por Tipo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map(entity => (
            <SyncStatusCard
              key={entity.type}
              entity={entity}
              onRetry={() => handleRetryEntity(entity.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
