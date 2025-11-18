// ===================================================================
// STORAGE MONITOR - P2 #2 IMPLEMENTATION
// Localização: src/lib/offline/utils/storageMonitor.ts
// Módulo: Monitoramento de quota de armazenamento
// ===================================================================

export interface StorageQuota {
  usage: number;           // Bytes usados
  quota: number;           // Bytes disponíveis
  usagePercent: number;    // Percentual usado (0-100)
  availableBytes: number;  // Bytes disponíveis
  availableMB: number;     // MB disponíveis
  usageMB: number;         // MB usados
  quotaMB: number;         // MB totais
}

export interface StorageBreakdown {
  indexedDB: number;
  cacheStorage: number;
  total: number;
}

export type StorageWarningLevel = 'safe' | 'warning' | 'critical' | 'full';

/**
 * Verificar quota de armazenamento
 */
export async function checkStorageQuota(): Promise<StorageQuota> {
  try {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      console.warn('⚠️ [STORAGE MONITOR] Storage API não suportada');
      return {
        usage: 0,
        quota: 0,
        usagePercent: 0,
        availableBytes: 0,
        availableMB: 0,
        usageMB: 0,
        quotaMB: 0
      };
    }

    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;
    const availableBytes = quota - usage;

    const result: StorageQuota = {
      usage,
      quota,
      usagePercent,
      availableBytes,
      availableMB: availableBytes / (1024 * 1024),
      usageMB: usage / (1024 * 1024),
      quotaMB: quota / (1024 * 1024)
    };

    console.log('📊 [STORAGE MONITOR] Quota:', {
      used: `${result.usageMB.toFixed(2)} MB`,
      total: `${result.quotaMB.toFixed(2)} MB`,
      percent: `${result.usagePercent.toFixed(2)}%`,
      available: `${result.availableMB.toFixed(2)} MB`
    });

    return result;
  } catch (error) {
    console.error('❌ [STORAGE MONITOR] Erro ao verificar quota:', error);
    throw error;
  }
}

/**
 * Obter breakdown detalhado do armazenamento
 */
export async function getStorageBreakdown(): Promise<StorageBreakdown> {
  try {
    let indexedDBSize = 0;
    let cacheSize = 0;

    // Estimar tamanho do IndexedDB
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usageDetails) {
        indexedDBSize = (estimate.usageDetails as any).indexedDB || 0;
        cacheSize = (estimate.usageDetails as any).caches || 0;
      }
    }

    return {
      indexedDB: indexedDBSize,
      cacheStorage: cacheSize,
      total: indexedDBSize + cacheSize
    };
  } catch (error) {
    console.error('❌ [STORAGE MONITOR] Erro ao obter breakdown:', error);
    return {
      indexedDB: 0,
      cacheStorage: 0,
      total: 0
    };
  }
}

/**
 * Determinar nível de alerta baseado no uso
 */
export function getWarningLevel(usagePercent: number): StorageWarningLevel {
  if (usagePercent >= 95) return 'full';
  if (usagePercent >= 80) return 'critical';
  if (usagePercent >= 60) return 'warning';
  return 'safe';
}

/**
 * Obter mensagem de alerta
 */
export function getWarningMessage(level: StorageWarningLevel, quota: StorageQuota): string {
  switch (level) {
    case 'full':
      return `⛔ ARMAZENAMENTO CHEIO! Apenas ${quota.availableMB.toFixed(0)}MB disponíveis. Limpe dados urgentemente.`;
    case 'critical':
      return `🔴 ARMAZENAMENTO CRÍTICO! ${quota.usagePercent.toFixed(0)}% usado (${quota.usageMB.toFixed(0)}MB/${quota.quotaMB.toFixed(0)}MB). Considere limpar dados antigos.`;
    case 'warning':
      return `⚠️ ARMAZENAMENTO EM ALERTA! ${quota.usagePercent.toFixed(0)}% usado. Considere sincronizar e limpar dados.`;
    case 'safe':
      return `✅ Armazenamento OK: ${quota.usagePercent.toFixed(0)}% usado (${quota.usageMB.toFixed(0)}MB/${quota.quotaMB.toFixed(0)}MB)`;
  }
}

/**
 * Verificar se há espaço suficiente para salvar dados
 */
export async function hasEnoughSpace(requiredBytes: number): Promise<boolean> {
  const quota = await checkStorageQuota();
  return quota.availableBytes >= requiredBytes;
}

/**
 * Estimar espaço necessário para uma operação
 */
export function estimateSpace(data: any): number {
  try {
    // Estimar tamanho via JSON.stringify
    const json = JSON.stringify(data);
    const bytes = new Blob([json]).size;

    // Adicionar overhead de ~30% para IndexedDB
    return Math.ceil(bytes * 1.3);
  } catch (error) {
    console.error('❌ [STORAGE MONITOR] Erro ao estimar espaço:', error);
    return 0;
  }
}

/**
 * Monitorar storage periodicamente
 */
export class StorageMonitor {
  private interval: number | null = null;
  private callbacks: Array<(quota: StorageQuota) => void> = [];
  private lastWarningLevel: StorageWarningLevel = 'safe';

  /**
   * Iniciar monitoramento
   */
  start(intervalMs: number = 60000): void {
    if (this.interval) {
      console.warn('⚠️ [STORAGE MONITOR] Monitor já está rodando');
      return;
    }

    console.log('🔄 [STORAGE MONITOR] Iniciando monitoramento...');

    // Verificar imediatamente
    this.check();

    // Verificar periodicamente
    this.interval = window.setInterval(() => {
      this.check();
    }, intervalMs);
  }

  /**
   * Parar monitoramento
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ [STORAGE MONITOR] Monitoramento parado');
    }
  }

  /**
   * Verificar storage
   */
  private async check(): Promise<void> {
    try {
      const quota = await checkStorageQuota();
      const level = getWarningLevel(quota.usagePercent);

      // Notificar callbacks
      for (const callback of this.callbacks) {
        callback(quota);
      }

      // Alertar se mudou de nível
      if (level !== this.lastWarningLevel && level !== 'safe') {
        const message = getWarningMessage(level, quota);
        console.warn(message);

        // Disparar evento customizado
        window.dispatchEvent(
          new CustomEvent('storage-warning', {
            detail: { level, quota, message }
          })
        );
      }

      this.lastWarningLevel = level;
    } catch (error) {
      console.error('❌ [STORAGE MONITOR] Erro ao verificar:', error);
    }
  }

  /**
   * Adicionar callback para notificações
   */
  onQuotaChange(callback: (quota: StorageQuota) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remover callback
   */
  offQuotaChange(callback: (quota: StorageQuota) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

/**
 * Instância global do monitor
 */
export const storageMonitor = new StorageMonitor();

/**
 * Solicitar armazenamento persistente
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const isPersisted = await navigator.storage.persist();

      if (isPersisted) {
        console.log('✅ [STORAGE MONITOR] Armazenamento persistente concedido');
      } else {
        console.warn('⚠️ [STORAGE MONITOR] Armazenamento persistente negado');
      }

      return isPersisted;
    }

    console.warn('⚠️ [STORAGE MONITOR] Persistent Storage API não suportada');
    return false;
  } catch (error) {
    console.error('❌ [STORAGE MONITOR] Erro ao solicitar storage persistente:', error);
    return false;
  }
}

/**
 * Verificar se storage é persistente
 */
export async function isPersisted(): Promise<boolean> {
  try {
    if ('storage' in navigator && 'persisted' in navigator.storage) {
      return await navigator.storage.persisted();
    }
    return false;
  } catch (error) {
    console.error('❌ [STORAGE MONITOR] Erro ao verificar persistência:', error);
    return false;
  }
}
