// ===================================================================
// SYNC TIME ESTIMATOR - P3 #3 IMPLEMENTATION
// Localização: src/components/offline/SyncTimeEstimator.tsx
// Componente: Estimador de tempo de sincronização
// ===================================================================

import React from 'react';

export interface SyncTimeEstimatorProps {
  totalItems: number;
  processedItems: number;
  startTime?: Date;
  avgTimePerItem?: number; // em segundos
  className?: string;
}

/**
 * Componente estimador de tempo de sincronização
 */
export const SyncTimeEstimator: React.FC<SyncTimeEstimatorProps> = ({
  totalItems,
  processedItems,
  startTime,
  avgTimePerItem = 1, // Default: 1 segundo por item
  className = ''
}) => {
  /**
   * Calcular tempo estimado restante
   */
  const getEstimatedTimeRemaining = (): number => {
    if (processedItems >= totalItems) return 0;

    const remainingItems = totalItems - processedItems;

    // Se temos startTime, calcular com base no tempo real decorrido
    if (startTime && processedItems > 0) {
      const elapsedMs = Date.now() - startTime.getTime();
      const elapsedSeconds = elapsedMs / 1000;
      const avgTimePerItemActual = elapsedSeconds / processedItems;
      return Math.ceil(avgTimePerItemActual * remainingItems);
    }

    // Caso contrário, usar média estimada
    return Math.ceil(avgTimePerItem * remainingItems);
  };

  /**
   * Formatar tempo em string legível
   */
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  /**
   * Calcular velocidade (items por segundo)
   */
  const getSpeed = (): string => {
    if (!startTime || processedItems === 0) return '-';

    const elapsedSeconds = (Date.now() - startTime.getTime()) / 1000;
    const itemsPerSecond = processedItems / elapsedSeconds;

    if (itemsPerSecond >= 1) {
      return `${itemsPerSecond.toFixed(1)} items/s`;
    } else {
      const secondsPerItem = elapsedSeconds / processedItems;
      return `${secondsPerItem.toFixed(1)} s/item`;
    }
  };

  /**
   * Calcular tempo decorrido
   */
  const getElapsedTime = (): string => {
    if (!startTime) return '-';

    const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return formatTime(elapsedSeconds);
  };

  /**
   * Calcular ETA (Estimated Time of Arrival)
   */
  const getETA = (): string => {
    if (!startTime) return '-';

    const remainingSeconds = getEstimatedTimeRemaining();
    if (remainingSeconds === 0) return 'Concluído';

    const eta = new Date(Date.now() + remainingSeconds * 1000);
    return eta.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estimatedTime = getEstimatedTimeRemaining();
  const isComplete = processedItems >= totalItems;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      {/* Tempo estimado restante (destaque) */}
      <div className="text-center mb-4">
        {!isComplete ? (
          <>
            <div className="text-3xl font-bold text-blue-600">{formatTime(estimatedTime)}</div>
            <div className="text-sm text-gray-600 mt-1">Tempo estimado restante</div>
          </>
        ) : (
          <>
            <div className="text-3xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-600 mt-1">Sincronização concluída!</div>
          </>
        )}
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-gray-800">{getElapsedTime()}</div>
          <div className="text-xs text-gray-600">Decorrido</div>
        </div>

        <div>
          <div className="text-lg font-semibold text-gray-800">{getSpeed()}</div>
          <div className="text-xs text-gray-600">Velocidade</div>
        </div>

        <div>
          <div className="text-lg font-semibold text-gray-800">{getETA()}</div>
          <div className="text-xs text-gray-600">ETA</div>
        </div>
      </div>

      {/* Progresso textual */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          {processedItems} de {totalItems} itens processados
        </div>
      </div>
    </div>
  );
};

/**
 * Variante compacta do estimador
 */
export const SyncTimeEstimatorCompact: React.FC<SyncTimeEstimatorProps> = (props) => {
  const { totalItems, processedItems, startTime, avgTimePerItem = 1 } = props;

  const getEstimatedTimeRemaining = (): number => {
    if (processedItems >= totalItems) return 0;

    const remainingItems = totalItems - processedItems;

    if (startTime && processedItems > 0) {
      const elapsedMs = Date.now() - startTime.getTime();
      const elapsedSeconds = elapsedMs / 1000;
      const avgTimePerItemActual = elapsedSeconds / processedItems;
      return Math.ceil(avgTimePerItemActual * remainingItems);
    }

    return Math.ceil(avgTimePerItem * remainingItems);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  };

  const estimatedTime = getEstimatedTimeRemaining();
  const isComplete = processedItems >= totalItems;

  if (isComplete) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
        <span className="text-lg">✓</span>
        <span>Concluído</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
      <span className="animate-pulse">⏱️</span>
      <span>
        ~{formatTime(estimatedTime)} restantes ({processedItems}/{totalItems})
      </span>
    </div>
  );
};
