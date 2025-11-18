// ===================================================================
// OFFLINE ANALYTICS - P3 #1 IMPLEMENTATION
// Localização: src/lib/offline/analytics/OfflineAnalytics.ts
// Módulo: Sistema de analytics e métricas para offline
// ===================================================================

import { offlineDB } from '../database';

/**
 * Evento de analytics
 */
export interface AnalyticsEvent {
  id: string;
  type: 'sync_failure' | 'sync_success' | 'storage_warning' | 'conflict_detected' | 'validation_error' | 'custom';
  entity_type?: 'termo' | 'lv' | 'rotina' | 'inspecao' | 'encarregado';
  entity_id?: string;
  error_message?: string;
  error_code?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  user_id?: string;
}

/**
 * Métrica de storage ao longo do tempo
 */
export interface StorageMetric {
  id: string;
  timestamp: string;
  usage_bytes: number;
  quota_bytes: number;
  usage_percent: number;
  entities_count: {
    termos: number;
    lvs: number;
    rotinas: number;
    fotos: number;
    total: number;
  };
}

/**
 * Estatísticas de sync por tipo
 */
export interface SyncStats {
  entity_type: string;
  total_attempts: number;
  successful: number;
  failed: number;
  success_rate: number;
  avg_retry_count: number;
  common_errors: Array<{ error: string; count: number }>;
  last_sync_at?: string;
}

/**
 * Padrão de dados problemáticos
 */
export interface DataPattern {
  pattern_type: 'frequent_sync_failure' | 'large_entity' | 'many_retries' | 'validation_issues';
  entity_type: string;
  entity_id?: string;
  occurrence_count: number;
  first_detected: string;
  last_detected: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Relatório de analytics
 */
export interface AnalyticsReport {
  period: {
    start: string;
    end: string;
  };
  sync_stats: SyncStats[];
  storage_metrics: {
    current: StorageMetric;
    trend: 'increasing' | 'decreasing' | 'stable';
    avg_usage_percent: number;
  };
  data_patterns: DataPattern[];
  top_errors: Array<{ error: string; count: number }>;
  recommendations: string[];
}

/**
 * Classe principal de Analytics Offline
 */
export class OfflineAnalytics {
  private static instance: OfflineAnalytics;
  private storageMetricsInterval?: number;

  private constructor() {}

  static getInstance(): OfflineAnalytics {
    if (!OfflineAnalytics.instance) {
      OfflineAnalytics.instance = new OfflineAnalytics();
    }
    return OfflineAnalytics.instance;
  }

  /**
   * Rastrear evento de analytics
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<string> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    // Salvar no IndexedDB (vamos adicionar tabela na versão 5)
    console.log('📊 [ANALYTICS] Evento rastreado:', analyticsEvent.type, analyticsEvent);

    // Por enquanto, salvar em localStorage como fallback
    this.saveEventToLocalStorage(analyticsEvent);

    return analyticsEvent.id;
  }

  /**
   * Rastrear falha de sincronização
   */
  async trackSyncFailure(
    entityType: AnalyticsEvent['entity_type'],
    entityId: string,
    error: Error | string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'sync_failure',
      entity_type: entityType,
      entity_id: entityId,
      error_message: error instanceof Error ? error.message : error,
      error_code: error instanceof Error ? error.name : undefined,
      metadata
    });
  }

  /**
   * Rastrear sucesso de sincronização
   */
  async trackSyncSuccess(
    entityType: AnalyticsEvent['entity_type'],
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'sync_success',
      entity_type: entityType,
      entity_id: entityId,
      metadata
    });
  }

  /**
   * Rastrear conflito detectado
   */
  async trackConflict(
    entityType: AnalyticsEvent['entity_type'],
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'conflict_detected',
      entity_type: entityType,
      entity_id: entityId,
      metadata
    });
  }

  /**
   * Rastrear erro de validação
   */
  async trackValidationError(
    entityType: AnalyticsEvent['entity_type'],
    errors: string[],
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      type: 'validation_error',
      entity_type: entityType,
      error_message: errors.join(', '),
      metadata
    });
  }

  /**
   * Coletar métrica de storage atual
   */
  async collectStorageMetric(): Promise<StorageMetric> {
    // Obter quota
    let usage_bytes = 0;
    let quota_bytes = 0;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      usage_bytes = estimate.usage || 0;
      quota_bytes = estimate.quota || 0;
    }

    // Contar entidades
    const [termos, lvs, rotinas, fotos] = await Promise.all([
      offlineDB.termos_ambientais.count(),
      offlineDB.lvs.count(),
      offlineDB.atividades_rotina.count(),
      offlineDB.termos_fotos.count()
    ]);

    const metric: StorageMetric = {
      id: `metric_${Date.now()}`,
      timestamp: new Date().toISOString(),
      usage_bytes,
      quota_bytes,
      usage_percent: quota_bytes > 0 ? (usage_bytes / quota_bytes) * 100 : 0,
      entities_count: {
        termos,
        lvs,
        rotinas,
        fotos,
        total: termos + lvs + rotinas + fotos
      }
    };

    // Salvar métrica
    this.saveMetricToLocalStorage(metric);

    console.log('📊 [ANALYTICS] Métrica de storage coletada:', metric);

    return metric;
  }

  /**
   * Iniciar coleta automática de métricas de storage
   */
  startStorageMetricsCollection(intervalMs: number = 3600000): void {
    // Default: 1 hora
    if (this.storageMetricsInterval) {
      console.warn('⚠️ [ANALYTICS] Coleta de métricas já está ativa');
      return;
    }

    // Coletar imediatamente
    this.collectStorageMetric();

    // Coletar periodicamente
    this.storageMetricsInterval = window.setInterval(() => {
      this.collectStorageMetric();
    }, intervalMs);

    console.log(`✅ [ANALYTICS] Coleta de métricas iniciada (intervalo: ${intervalMs}ms)`);
  }

  /**
   * Parar coleta de métricas
   */
  stopStorageMetricsCollection(): void {
    if (this.storageMetricsInterval) {
      clearInterval(this.storageMetricsInterval);
      this.storageMetricsInterval = undefined;
      console.log('⏹️ [ANALYTICS] Coleta de métricas parada');
    }
  }

  /**
   * Obter estatísticas de sync por tipo
   */
  async getSyncStatsByType(
    entityType: AnalyticsEvent['entity_type'],
    periodDays: number = 7
  ): Promise<SyncStats> {
    const events = this.getEventsFromLocalStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    const cutoffISO = cutoffDate.toISOString();

    // Filtrar eventos de sync deste tipo
    const syncEvents = events.filter(
      e =>
        e.entity_type === entityType &&
        (e.type === 'sync_success' || e.type === 'sync_failure') &&
        e.timestamp >= cutoffISO
    );

    const successful = syncEvents.filter(e => e.type === 'sync_success').length;
    const failed = syncEvents.filter(e => e.type === 'sync_failure').length;
    const total_attempts = successful + failed;

    // Contar erros comuns
    const errorCounts: Record<string, number> = {};
    syncEvents
      .filter(e => e.type === 'sync_failure' && e.error_message)
      .forEach(e => {
        const error = e.error_message!;
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });

    const common_errors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calcular média de retries
    const retries = syncEvents
      .filter(e => e.metadata?.retry_count !== undefined)
      .map(e => e.metadata!.retry_count as number);
    const avg_retry_count = retries.length > 0 ? retries.reduce((a, b) => a + b, 0) / retries.length : 0;

    // Última sincronização
    const lastSync = syncEvents
      .filter(e => e.type === 'sync_success')
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

    return {
      entity_type: entityType!,
      total_attempts,
      successful,
      failed,
      success_rate: total_attempts > 0 ? (successful / total_attempts) * 100 : 0,
      avg_retry_count,
      common_errors,
      last_sync_at: lastSync?.timestamp
    };
  }

  /**
   * Identificar padrões de dados problemáticos
   */
  async identifyDataPatterns(periodDays: number = 30): Promise<DataPattern[]> {
    const patterns: DataPattern[] = [];
    const events = this.getEventsFromLocalStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    const cutoffISO = cutoffDate.toISOString();

    const recentEvents = events.filter(e => e.timestamp >= cutoffISO);

    // Padrão 1: Falhas frequentes de sync para mesma entidade
    const syncFailuresByEntity: Record<string, AnalyticsEvent[]> = {};

    recentEvents
      .filter(e => e.type === 'sync_failure' && e.entity_id)
      .forEach(e => {
        const key = `${e.entity_type}_${e.entity_id}`;
        if (!syncFailuresByEntity[key]) {
          syncFailuresByEntity[key] = [];
        }
        syncFailuresByEntity[key].push(e);
      });

    Object.entries(syncFailuresByEntity).forEach(([key, failures]) => {
      if (failures.length >= 3) {
        const [entity_type, entity_id] = key.split('_');
        patterns.push({
          pattern_type: 'frequent_sync_failure',
          entity_type,
          entity_id,
          occurrence_count: failures.length,
          first_detected: failures[failures.length - 1].timestamp,
          last_detected: failures[0].timestamp,
          details: `Entidade falhou ${failures.length} vezes em ${periodDays} dias`,
          severity: failures.length >= 10 ? 'high' : failures.length >= 5 ? 'medium' : 'low'
        });
      }
    });

    // Padrão 2: Muitos retries
    const highRetryEvents = recentEvents.filter(
      e => e.metadata?.retry_count && (e.metadata.retry_count as number) >= 3
    );

    const retryCountsByType: Record<string, number> = {};
    highRetryEvents.forEach(e => {
      const type = e.entity_type || 'unknown';
      retryCountsByType[type] = (retryCountsByType[type] || 0) + 1;
    });

    Object.entries(retryCountsByType).forEach(([entity_type, count]) => {
      if (count >= 5) {
        patterns.push({
          pattern_type: 'many_retries',
          entity_type,
          occurrence_count: count,
          first_detected: highRetryEvents[highRetryEvents.length - 1].timestamp,
          last_detected: highRetryEvents[0].timestamp,
          details: `${count} entidades do tipo ${entity_type} precisaram de 3+ retries`,
          severity: count >= 20 ? 'high' : count >= 10 ? 'medium' : 'low'
        });
      }
    });

    // Padrão 3: Erros de validação frequentes
    const validationErrors = recentEvents.filter(e => e.type === 'validation_error');
    const validationErrorsByType: Record<string, number> = {};

    validationErrors.forEach(e => {
      const type = e.entity_type || 'unknown';
      validationErrorsByType[type] = (validationErrorsByType[type] || 0) + 1;
    });

    Object.entries(validationErrorsByType).forEach(([entity_type, count]) => {
      if (count >= 5) {
        patterns.push({
          pattern_type: 'validation_issues',
          entity_type,
          occurrence_count: count,
          first_detected: validationErrors[validationErrors.length - 1].timestamp,
          last_detected: validationErrors[0].timestamp,
          details: `${count} erros de validação para ${entity_type}`,
          severity: count >= 20 ? 'high' : count >= 10 ? 'medium' : 'low'
        });
      }
    });

    return patterns.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Gerar relatório completo de analytics
   */
  async generateReport(periodDays: number = 7): Promise<AnalyticsReport> {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - periodDays);

    // Coletar estatísticas de sync para todos os tipos
    const sync_stats = await Promise.all([
      this.getSyncStatsByType('termo', periodDays),
      this.getSyncStatsByType('lv', periodDays),
      this.getSyncStatsByType('rotina', periodDays),
      this.getSyncStatsByType('inspecao', periodDays)
    ]);

    // Métrica de storage atual
    const current_metric = await this.collectStorageMetric();

    // Analisar tendência de storage
    const metrics = this.getMetricsFromLocalStorage();
    const recentMetrics = metrics
      .filter(m => m.timestamp >= start.toISOString())
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentMetrics.length >= 2) {
      const first = recentMetrics[0].usage_percent;
      const last = recentMetrics[recentMetrics.length - 1].usage_percent;
      const diff = last - first;

      if (diff > 5) trend = 'increasing';
      else if (diff < -5) trend = 'decreasing';
    }

    const avg_usage_percent =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.usage_percent, 0) / recentMetrics.length
        : current_metric.usage_percent;

    // Identificar padrões problemáticos
    const data_patterns = await this.identifyDataPatterns(periodDays);

    // Top erros
    const events = this.getEventsFromLocalStorage();
    const errorCounts: Record<string, number> = {};

    events
      .filter(e => e.type === 'sync_failure' && e.error_message && e.timestamp >= start.toISOString())
      .forEach(e => {
        const error = e.error_message!;
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });

    const top_errors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Gerar recomendações
    const recommendations: string[] = [];

    if (current_metric.usage_percent > 80) {
      recommendations.push('⚠️ Storage crítico (>80%). Execute limpeza de dados antigos.');
    }

    if (trend === 'increasing') {
      recommendations.push('📈 Uso de storage está aumentando. Considere migrar fotos para blob comprimido.');
    }

    const highFailureRate = sync_stats.find(s => s.success_rate < 70);
    if (highFailureRate) {
      recommendations.push(
        `❌ Taxa de falha alta para ${highFailureRate.entity_type} (${(100 - highFailureRate.success_rate).toFixed(1)}%). Investigar causas.`
      );
    }

    const highSeverityPatterns = data_patterns.filter(p => p.severity === 'high');
    if (highSeverityPatterns.length > 0) {
      recommendations.push(`🚨 ${highSeverityPatterns.length} padrões problemáticos de alta severidade detectados.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Sistema operando normalmente. Nenhuma ação necessária.');
    }

    return {
      period: {
        start: start.toISOString(),
        end: now.toISOString()
      },
      sync_stats,
      storage_metrics: {
        current: current_metric,
        trend,
        avg_usage_percent
      },
      data_patterns,
      top_errors,
      recommendations
    };
  }

  /**
   * Limpar eventos antigos (>N dias)
   */
  clearOldEvents(daysOld: number = 90): number {
    const events = this.getEventsFromLocalStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const recentEvents = events.filter(e => e.timestamp >= cutoffISO);
    const removed = events.length - recentEvents.length;

    localStorage.setItem('offline_analytics_events', JSON.stringify(recentEvents));

    console.log(`🗑️ [ANALYTICS] ${removed} eventos antigos removidos (>${daysOld} dias)`);

    return removed;
  }

  /**
   * Limpar métricas antigas (>N dias)
   */
  clearOldMetrics(daysOld: number = 90): number {
    const metrics = this.getMetricsFromLocalStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffISO);
    const removed = metrics.length - recentMetrics.length;

    localStorage.setItem('offline_storage_metrics', JSON.stringify(recentMetrics));

    console.log(`🗑️ [ANALYTICS] ${removed} métricas antigas removidas (>${daysOld} dias)`);

    return removed;
  }

  // ===================================================================
  // MÉTODOS PRIVADOS - PERSISTÊNCIA EM LOCALSTORAGE
  // ===================================================================

  private saveEventToLocalStorage(event: AnalyticsEvent): void {
    const events = this.getEventsFromLocalStorage();
    events.unshift(event); // Mais recente primeiro

    // Limitar a 1000 eventos
    if (events.length > 1000) {
      events.splice(1000);
    }

    localStorage.setItem('offline_analytics_events', JSON.stringify(events));
  }

  private getEventsFromLocalStorage(): AnalyticsEvent[] {
    const stored = localStorage.getItem('offline_analytics_events');
    return stored ? JSON.parse(stored) : [];
  }

  private saveMetricToLocalStorage(metric: StorageMetric): void {
    const metrics = this.getMetricsFromLocalStorage();
    metrics.unshift(metric); // Mais recente primeiro

    // Limitar a 500 métricas
    if (metrics.length > 500) {
      metrics.splice(500);
    }

    localStorage.setItem('offline_storage_metrics', JSON.stringify(metrics));
  }

  private getMetricsFromLocalStorage(): StorageMetric[] {
    const stored = localStorage.getItem('offline_storage_metrics');
    return stored ? JSON.parse(stored) : [];
  }
}

/**
 * Instância singleton
 */
export const offlineAnalytics = OfflineAnalytics.getInstance();
