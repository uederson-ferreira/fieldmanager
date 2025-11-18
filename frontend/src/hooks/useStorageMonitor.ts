// ===================================================================
// USE STORAGE MONITOR - P2 #2 IMPLEMENTATION
// Localização: src/hooks/useStorageMonitor.ts
// Hook: Monitoramento de quota de armazenamento
// ===================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  checkStorageQuota,
  getWarningLevel,
  getWarningMessage,
  requestPersistentStorage,
  isPersisted,
  type StorageQuota,
  type StorageWarningLevel
} from '../lib/offline/utils/storageMonitor';

export interface UseStorageMonitorResult {
  quota: StorageQuota | null;
  warningLevel: StorageWarningLevel;
  warningMessage: string;
  isPersisted: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  requestPersistence: () => Promise<boolean>;
}

/**
 * Hook para monitorar quota de armazenamento
 */
export const useStorageMonitor = (options?: {
  autoRefresh?: boolean;
  refreshInterval?: number;
}): UseStorageMonitorResult => {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [warningLevel, setWarningLevel] = useState<StorageWarningLevel>('safe');
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [persisted, setPersisted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Atualizar quota
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);

      const newQuota = await checkStorageQuota();
      const newLevel = getWarningLevel(newQuota.usagePercent);
      const newMessage = getWarningMessage(newLevel, newQuota);

      setQuota(newQuota);
      setWarningLevel(newLevel);
      setWarningMessage(newMessage);

      // Verificar se é persistente
      const isStoragePersisted = await isPersisted();
      setPersisted(isStoragePersisted);
    } catch (error) {
      console.error('❌ [USE STORAGE MONITOR] Erro ao atualizar quota:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Solicitar armazenamento persistente
   */
  const requestPersistence = useCallback(async (): Promise<boolean> => {
    const granted = await requestPersistentStorage();
    setPersisted(granted);
    return granted;
  }, []);

  /**
   * Inicializar e configurar auto-refresh
   */
  useEffect(() => {
    refresh();

    if (options?.autoRefresh) {
      const interval = setInterval(
        refresh,
        options.refreshInterval || 60000 // Default: 1 minuto
      );

      return () => clearInterval(interval);
    }
  }, [refresh, options?.autoRefresh, options?.refreshInterval]);

  /**
   * Escutar eventos de storage warning
   */
  useEffect(() => {
    const handleStorageWarning = (event: CustomEvent) => {
      const { level, quota: eventQuota, message } = event.detail;

      setWarningLevel(level);
      setQuota(eventQuota);
      setWarningMessage(message);

      console.warn('⚠️ [USE STORAGE MONITOR] Storage warning:', message);
    };

    window.addEventListener('storage-warning', handleStorageWarning as EventListener);

    return () => {
      window.removeEventListener('storage-warning', handleStorageWarning as EventListener);
    };
  }, []);

  return {
    quota,
    warningLevel,
    warningMessage,
    isPersisted: persisted,
    isLoading,
    refresh,
    requestPersistence
  };
};
