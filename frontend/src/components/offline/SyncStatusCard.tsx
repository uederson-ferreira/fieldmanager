// ===================================================================
// SYNC STATUS CARD - P3 #3 IMPLEMENTATION
// Localização: src/components/offline/SyncStatusCard.tsx
// Componente: Card de status de sincronização individual por entidade
// ===================================================================

import React from 'react';

export type EntityType = 'termo' | 'lv' | 'rotina' | 'inspecao' | 'foto';
export type SyncStatus = 'pending' | 'syncing' | 'success' | 'error';

export interface EntitySyncStatus {
  type: EntityType;
  label: string;
  total: number;
  synced: number;
  pending: number;
  failed: number;
  status: SyncStatus;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface SyncStatusCardProps {
  entity: EntitySyncStatus;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Componente de card de status de sincronização
 */
export const SyncStatusCard: React.FC<SyncStatusCardProps> = ({ entity, onRetry, compact = false }) => {
  const getStatusIcon = (): string => {
    switch (entity.status) {
      case 'pending':
        return '⏳';
      case 'syncing':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  const getStatusColor = (): string => {
    switch (entity.status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'syncing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusText = (): string => {
    switch (entity.status) {
      case 'pending':
        return 'Pendente';
      case 'syncing':
        return 'Sincronizando...';
      case 'success':
        return 'Sincronizado';
      case 'error':
        return 'Erro';
    }
  };

  const percentage = entity.total > 0 ? Math.round((entity.synced / entity.total) * 100) : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor()}`}>
        <span className="text-2xl">{getStatusIcon()}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{entity.label}</span>
            <span className="text-xs font-semibold">{percentage}%</span>
          </div>
          <div className="text-xs opacity-75">
            {entity.synced}/{entity.total}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getStatusIcon()}</span>
          <div>
            <h3 className="font-semibold text-base">{entity.label}</h3>
            <p className="text-sm opacity-75">{getStatusText()}</p>
          </div>
        </div>

        {entity.status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-sm font-medium rounded-md bg-white border border-current hover:bg-opacity-10 transition-colors"
          >
            Tentar Novamente
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        {/* Barra de progresso */}
        <div className="relative w-full h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-current transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-4">
            <span>
              ✅ Sincronizado: <strong>{entity.synced}</strong>
            </span>
            {entity.pending > 0 && (
              <span>
                ⏳ Pendente: <strong>{entity.pending}</strong>
              </span>
            )}
            {entity.failed > 0 && (
              <span>
                ❌ Falhas: <strong>{entity.failed}</strong>
              </span>
            )}
          </div>
          <span>
            Total: <strong>{entity.total}</strong>
          </span>
        </div>

        {/* Última sincronização */}
        {entity.lastSyncAt && entity.status === 'success' && (
          <p className="text-xs opacity-75 mt-2">
            Última sincronização: {new Date(entity.lastSyncAt).toLocaleString('pt-BR')}
          </p>
        )}

        {/* Mensagem de erro */}
        {entity.status === 'error' && entity.errorMessage && (
          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
            <strong>Erro:</strong> {entity.errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
