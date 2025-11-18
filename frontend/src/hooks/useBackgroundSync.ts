// ===================================================================
// USE BACKGROUND SYNC - P1 #3 IMPLEMENTATION
// Localização: src/hooks/useBackgroundSync.ts
// Hook: Background Sync API com Service Worker
// ===================================================================

import { useEffect, useCallback, useState } from 'react';
import { SyncQueue } from '../lib/offline';

export interface BackgroundSyncStatus {
  isRegistered: boolean;
  isSupported: boolean;
  lastSyncAt?: string;
  pendingCount: number;
}

/**
 * Hook para gerenciar Background Sync API
 */
export const useBackgroundSync = () => {
  const [status, setStatus] = useState<BackgroundSyncStatus>({
    isRegistered: false,
    isSupported: false,
    pendingCount: 0
  });

  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Verificar se Background Sync é suportado
   */
  useEffect(() => {
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        setStatus(prev => ({ ...prev, isSupported: true }));
        console.log('✅ [BACKGROUND SYNC] Background Sync API suportado');
      } else {
        console.warn('⚠️ [BACKGROUND SYNC] Background Sync API não suportado neste navegador');
      }
    };

    checkSupport();
  }, []);

  /**
   * Escutar mensagens do Service Worker
   */
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'PROCESS_SYNC_QUEUE') {
        console.log('📥 [BACKGROUND SYNC] Recebida solicitação para processar fila');
        await processSyncQueue();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  /**
   * Atualizar contagem de itens pendentes periodicamente
   */
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const stats = await SyncQueue.getStats();
        setStatus(prev => ({ ...prev, pendingCount: stats.pending }));
      } catch (error) {
        console.error('❌ [BACKGROUND SYNC] Erro ao atualizar contagem:', error);
      }
    };

    updatePendingCount();

    // Atualizar a cada 30 segundos
    const interval = setInterval(updatePendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Registrar background sync
   */
  const registerBackgroundSync = useCallback(async (): Promise<boolean> => {
    if (!status.isSupported) {
      console.warn('⚠️ [BACKGROUND SYNC] Background Sync não suportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if ('sync' in registration) {
        await registration.sync.register('sync-offline-data');
        setStatus(prev => ({ ...prev, isRegistered: true }));
        console.log('✅ [BACKGROUND SYNC] Background sync registrado');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [BACKGROUND SYNC] Erro ao registrar sync:', error);
      return false;
    }
  }, [status.isSupported]);

  /**
   * Processar fila de sincronização
   */
  const processSyncQueue = useCallback(async (): Promise<void> => {
    if (isSyncing) {
      console.log('⚠️ [BACKGROUND SYNC] Já existe uma sincronização em andamento');
      return;
    }

    setIsSyncing(true);

    try {
      console.log('🔄 [BACKGROUND SYNC] Processando fila de sincronização...');

      const result = await SyncQueue.processPending({
        limit: 20,
        onProgress: (processed, total) => {
          console.log(`📊 [BACKGROUND SYNC] Progresso: ${processed}/${total}`);
        }
      });

      console.log('✅ [BACKGROUND SYNC] Fila processada:', result);

      setStatus(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString(),
        pendingCount: 0
      }));

      // Limpar itens que excederam tentativas
      const cleaned = await SyncQueue.cleanupFailedItems();
      if (cleaned > 0) {
        console.log(`🗑️ [BACKGROUND SYNC] ${cleaned} itens removidos por exceder tentativas`);
      }

      return;
    } catch (error) {
      console.error('❌ [BACKGROUND SYNC] Erro ao processar fila:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  /**
   * Trigger sincronização manual
   */
  const syncNow = useCallback(async (): Promise<void> => {
    try {
      // Tentar via Service Worker primeiro
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
        console.log('📤 [BACKGROUND SYNC] Sincronização manual via Service Worker');
      }

      // Processar diretamente também
      await processSyncQueue();
    } catch (error) {
      console.error('❌ [BACKGROUND SYNC] Erro na sincronização manual:', error);
      throw error;
    }
  }, [processSyncQueue]);

  /**
   * Registrar sync quando voltar online
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [BACKGROUND SYNC] Conexão restaurada, registrando sync...');
      registerBackgroundSync();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [registerBackgroundSync]);

  return {
    status,
    isSyncing,
    registerBackgroundSync,
    processSyncQueue,
    syncNow
  };
};
