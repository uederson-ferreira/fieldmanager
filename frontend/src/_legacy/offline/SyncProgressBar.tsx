// ===================================================================
// SYNC PROGRESS BAR - P3 #3 IMPLEMENTATION
// Localização: src/components/offline/SyncProgressBar.tsx
// Componente: Barra de progresso de sincronização
// ===================================================================

import React from 'react';

export interface SyncProgressBarProps {
  current: number;
  total: number;
  status?: 'idle' | 'syncing' | 'success' | 'error';
  showPercentage?: boolean;
  showCount?: boolean;
  height?: number;
  className?: string;
}

/**
 * Componente de barra de progresso de sincronização
 */
export const SyncProgressBar: React.FC<SyncProgressBarProps> = ({
  current,
  total,
  status = 'idle',
  showPercentage = true,
  showCount = true,
  height = 24,
  className = ''
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  // Cores baseadas no status
  const getBarColor = (): string => {
    switch (status) {
      case 'syncing':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getBackgroundColor = (): string => {
    switch (status) {
      case 'syncing':
        return 'bg-blue-100';
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Barra de progresso */}
      <div
        className={`relative w-full rounded-full overflow-hidden ${getBackgroundColor()}`}
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full transition-all duration-300 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Animação de "loading" quando está sincronizando */}
          {status === 'syncing' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>

        {/* Texto dentro da barra */}
        {(showPercentage || showCount) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {showCount && `${current}/${total}`}
              {showCount && showPercentage && ' - '}
              {showPercentage && `${percentage}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Variante compacta da barra de progresso
 */
export const SyncProgressBarCompact: React.FC<
  Omit<SyncProgressBarProps, 'showPercentage' | 'showCount' | 'height'>
> = (props) => {
  return <SyncProgressBar {...props} showPercentage={false} showCount={false} height={8} />;
};
