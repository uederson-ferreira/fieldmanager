// ===================================================================
// HOOK DE ESTATÍSTICAS DO DASHBOARD - ECOFIELD SYSTEM
// Localização: src/hooks/useDashboardStats.ts
// ===================================================================

import { useState, useCallback, useEffect } from 'react';
import { estatisticasAPI } from '../lib/estatisticasAPI';
import { unifiedCache } from '../lib/unifiedCache';
import { useOnlineStatus } from './useOnlineStatus';
import { handleError } from '../utils/errorHandler';
import type { UserData } from '../types';

// ===================================================================
// INTERFACES
// ===================================================================

export interface DashboardStats {
  // LVs (Listas de Verificação)
  lvsPendentes: number;
  lvsCompletas: number;
  lvsNaoConformes: number;
  lvsPercentualConformidade: number;
  
  // Termos Ambientais
  total_termos: number;
  termosPendentes: number;
  termosCorrigidos: number;
  paralizacoes: number;
  notificacoes: number;
  total_recomendacoes: number;
  
  // Rotinas/Atividades
  rotinasHoje: number;
  rotinasMes: number;
  itensEmitidos: number;
  tempoMedio: number;
  
  loading: boolean;
  lastUpdated?: Date;
  isOffline?: boolean;
}

export interface StatsCache {
  stats: DashboardStats;
  timestamp: number;
  userId: string;
}

// ===================================================================
// FUNÇÃO AUXILIAR PARA TRATAR ERROS
// ===================================================================

const getErrorMessage = (error: unknown, context: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return `Erro desconhecido em ${context}`;
};

// ===================================================================
// HOOK PRINCIPAL
// ===================================================================

export const useDashboardStats = (user: UserData) => {
  const [stats, setStats] = useState<DashboardStats>({
    lvsPendentes: 0,
    lvsCompletas: 0,
    lvsNaoConformes: 0,
    lvsPercentualConformidade: 0,
    total_termos: 0,
    termosPendentes: 0,
    termosCorrigidos: 0,
    paralizacoes: 0,
    notificacoes: 0,
    total_recomendacoes: 0,
    rotinasHoje: 0,
    rotinasMes: 0,
    itensEmitidos: 0,
    tempoMedio: 0,
    loading: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  // ===================================================================
  // FUNÇÕES DE CACHE OFFLINE
  // ===================================================================

  const getCachedStats = useCallback(async (): Promise<DashboardStats | null> => {
    try {
      const cacheKey = `dashboard_stats_${user.id}`;
      const cached = await unifiedCache.get(cacheKey) as StatsCache | null;
      
      if (cached && cached.timestamp) {
        const cacheAge = Date.now() - cached.timestamp;
        const maxAge = 5 * 60 * 1000; // 5 minutos
        
        if (cacheAge < maxAge) {
          console.log('📱 [DASHBOARD STATS] Usando cache:', cacheAge, 'ms');
          return cached.stats;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ [DASHBOARD STATS] Erro ao buscar cache:', error);
      return null;
    }
  }, [user.id]);

  const setCachedStats = useCallback(async (newStats: DashboardStats): Promise<void> => {
    try {
      const cacheKey = `dashboard_stats_${user.id}`;
      const cacheData: StatsCache = {
        stats: newStats,
        timestamp: Date.now(),
        userId: user.id
      };
      
      await unifiedCache.set(cacheKey, cacheData);
      console.log('💾 [DASHBOARD STATS] Cache atualizado');
    } catch (error) {
      console.error('❌ [DASHBOARD STATS] Erro ao salvar cache:', error);
    }
  }, [user.id]);

  // ===================================================================
  // FUNÇÃO PRINCIPAL DE CARREGAMENTO
  // ===================================================================

  const carregarEstatisticas = useCallback(async (): Promise<DashboardStats> => {
    console.log('🔄 [DASHBOARD STATS] Carregando estatísticas...');
    
    try {
      // 1. Tentar carregar do cache primeiro
      const cachedStats = await getCachedStats();
      if (cachedStats && !isOnline) {
        console.log('📱 [DASHBOARD STATS] Usando cache offline');
        return {
          ...cachedStats,
          isOffline: true,
          lastUpdated: new Date()
        };
      }

      // 2. Se online, buscar da API
      if (isOnline) {
        console.log('🌐 [DASHBOARD STATS] Buscando da API...');
        const apiStats = await estatisticasAPI.buscarEstatisticasDashboard(user);
        
        // Converter lastUpdated de string para Date
        const convertedStats: DashboardStats = {
          ...apiStats,
          lastUpdated: apiStats.lastUpdated ? new Date(apiStats.lastUpdated) : new Date()
        };
        
        // Salvar no cache
        await setCachedStats(convertedStats);
        
        return {
          ...convertedStats,
          isOffline: false
        };
      }

      // 3. Se offline e sem cache, retornar dados vazios
      console.log('📱 [DASHBOARD STATS] Offline sem cache, retornando dados vazios');
      return {
        lvsPendentes: 0,
        lvsCompletas: 0,
        lvsNaoConformes: 0,
        lvsPercentualConformidade: 0,
        total_termos: 0,
        termosPendentes: 0,
        termosCorrigidos: 0,
        paralizacoes: 0,
        notificacoes: 0,
        total_recomendacoes: 0,
        rotinasHoje: 0,
        rotinasMes: 0,
        itensEmitidos: 0,
        tempoMedio: 0,
        loading: false,
        isOffline: true,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ [DASHBOARD STATS] Erro ao carregar estatísticas:', error);
      throw error;
    }
  }, [user, isOnline, getCachedStats, setCachedStats]);

  // ===================================================================
  // EFEITOS
  // ===================================================================

  useEffect(() => {
    // ✅ REABILITADO - Carregamento automático de estatísticas
    console.log('📊 [DASHBOARD STATS] Iniciando carregamento de estatísticas...');
    
    let mounted = true;

    const loadStats = async () => {
      if (!mounted) return;

      setStats(prev => ({ ...prev, loading: true }));
      setError(null);

      try {
        const newStats = await carregarEstatisticas();
        
        if (mounted) {
          setStats(newStats);
          console.log('✅ [DASHBOARD STATS] Estatísticas atualizadas');
        }
      } catch (error) {
        if (mounted) {
          const errorMessage = getErrorMessage(error, 'useDashboardStats:loadStats');
          handleError(error, 'useDashboardStats:loadStats');
          setError(errorMessage);
          console.error('❌ [DASHBOARD STATS] Erro:', errorMessage);
        }
      } finally {
        if (mounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [carregarEstatisticas]);

  // ===================================================================
  // FUNÇÃO DE REFRESH
  // ===================================================================

  const refreshStats = useCallback(async () => {
    console.log('🔄 [DASHBOARD STATS] Refresh solicitado');
    
    setStats(prev => ({ ...prev, loading: true }));
    setError(null);

    try {
      const newStats = await carregarEstatisticas();
      setStats(newStats);
      console.log('✅ [DASHBOARD STATS] Refresh concluído');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'useDashboardStats:refreshStats');
      handleError(error, 'useDashboardStats:refreshStats');
      setError(errorMessage);
      console.error('❌ [DASHBOARD STATS] Erro no refresh:', errorMessage);
    } finally {
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [carregarEstatisticas]);

  // ===================================================================
  // RETORNO
  // ===================================================================

  return {
    stats,
    error,
    loading: stats.loading,
    isOffline: stats.isOffline || false,
    lastUpdated: stats.lastUpdated,
    carregarEstatisticas,
    refreshStats,
    isOnline
  };
};

// ===================================================================
// HOOKS ESPECIALIZADOS
// ===================================================================

export const useLVsStats = (user: UserData) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarStats = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await estatisticasAPI.buscarEstatisticasLVs(user);
      setStats(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'useLVsStats:carregarStats');
      handleError(error, 'useLVsStats:carregarStats');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  return { stats, loading, error, refresh: carregarStats };
};

export const useTermosStats = (user: UserData) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarStats = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await estatisticasAPI.buscarEstatisticasTermos(user);
      setStats(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'useTermosStats:carregarStats');
      handleError(error, 'useTermosStats:carregarStats');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  return { stats, loading, error, refresh: carregarStats };
};

export const useRotinasStats = (user: UserData) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarStats = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await estatisticasAPI.buscarEstatisticasRotinas(user);
      setStats(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'useRotinasStats:carregarStats');
      handleError(error, 'useRotinasStats:carregarStats');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  return { stats, loading, error, refresh: carregarStats };
}; 