// ===================================================================
// USE OFFLINE ANALYTICS - P3 #1 IMPLEMENTATION
// Localização: src/hooks/useOfflineAnalytics.ts
// Hook: Hook React para analytics offline
// ===================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  offlineAnalytics,
  type AnalyticsReport,
  type SyncStats,
  type DataPattern
} from '../lib/offline/analytics/OfflineAnalytics';

export interface UseOfflineAnalyticsOptions {
  autoStart?: boolean;
  metricsInterval?: number;
  reportPeriodDays?: number;
}

export interface UseOfflineAnalyticsResult {
  report: AnalyticsReport | null;
  isLoading: boolean;
  isCollecting: boolean;
  refreshReport: () => Promise<void>;
  startCollection: () => void;
  stopCollection: () => void;
  clearOldData: (daysOld?: number) => { events: number; metrics: number };
}

/**
 * Hook para usar analytics offline
 */
export const useOfflineAnalytics = (
  options: UseOfflineAnalyticsOptions = {}
): UseOfflineAnalyticsResult => {
  const {
    autoStart = true,
    metricsInterval = 3600000, // 1 hora
    reportPeriodDays = 7
  } = options;

  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);

  /**
   * Atualizar relatório
   */
  const refreshReport = useCallback(async () => {
    setIsLoading(true);

    try {
      const newReport = await offlineAnalytics.generateReport(reportPeriodDays);
      setReport(newReport);

      console.log('📊 [USE ANALYTICS] Relatório atualizado:', newReport);
    } catch (error) {
      console.error('❌ [USE ANALYTICS] Erro ao gerar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reportPeriodDays]);

  /**
   * Iniciar coleta de métricas
   */
  const startCollection = useCallback(() => {
    offlineAnalytics.startStorageMetricsCollection(metricsInterval);
    setIsCollecting(true);
  }, [metricsInterval]);

  /**
   * Parar coleta de métricas
   */
  const stopCollection = useCallback(() => {
    offlineAnalytics.stopStorageMetricsCollection();
    setIsCollecting(false);
  }, []);

  /**
   * Limpar dados antigos
   */
  const clearOldData = useCallback((daysOld: number = 90) => {
    const eventsRemoved = offlineAnalytics.clearOldEvents(daysOld);
    const metricsRemoved = offlineAnalytics.clearOldMetrics(daysOld);

    console.log(`🗑️ [USE ANALYTICS] Limpeza: ${eventsRemoved} eventos, ${metricsRemoved} métricas`);

    // Atualizar relatório após limpeza
    refreshReport();

    return {
      events: eventsRemoved,
      metrics: metricsRemoved
    };
  }, [refreshReport]);

  /**
   * Inicializar
   */
  useEffect(() => {
    // Gerar relatório inicial
    refreshReport();

    // Iniciar coleta se autoStart
    if (autoStart) {
      startCollection();
    }

    // Cleanup
    return () => {
      if (isCollecting) {
        stopCollection();
      }
    };
  }, []); // Executar apenas uma vez

  return {
    report,
    isLoading,
    isCollecting,
    refreshReport,
    startCollection,
    stopCollection,
    clearOldData
  };
};

/**
 * Hook simplificado para obter apenas sync stats
 */
export const useSyncStats = (
  entityType: 'termo' | 'lv' | 'rotina' | 'inspecao',
  periodDays: number = 7
): {
  stats: SyncStats | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} => {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const newStats = await offlineAnalytics.getSyncStatsByType(entityType, periodDays);
      setStats(newStats);
    } catch (error) {
      console.error('❌ [USE SYNC STATS] Erro ao obter stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, periodDays]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, isLoading, refresh };
};

/**
 * Hook para obter padrões de dados problemáticos
 */
export const useDataPatterns = (
  periodDays: number = 30
): {
  patterns: DataPattern[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} => {
  const [patterns, setPatterns] = useState<DataPattern[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const newPatterns = await offlineAnalytics.identifyDataPatterns(periodDays);
      setPatterns(newPatterns);
    } catch (error) {
      console.error('❌ [USE DATA PATTERNS] Erro ao identificar padrões:', error);
    } finally {
      setIsLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patterns, isLoading, refresh };
};
