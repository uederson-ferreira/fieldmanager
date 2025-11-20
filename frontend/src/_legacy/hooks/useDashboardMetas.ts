// ===================================================================
// HOOK ESPECIALIZADO - METAS DO DASHBOARD
// Localização: src/hooks/useDashboardMetas.ts
// Módulo: Gerenciamento de metas com suporte offline
// ===================================================================

import { useState, useEffect, useCallback } from 'react';
import { metasAPI } from '../lib/metasAPI';
import { useOnlineStatus } from './useOnlineStatus';
import useAuth from './useAuth';
import { MetaComProgresso } from '../types/metas';

interface CacheData {
  metas: MetaComProgresso[];
  timestamp: number;
}

export function useDashboardMetas() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [metasIndividuais, setMetasIndividuais] = useState<MetaComProgresso[]>([]);
  const [metasEquipe, setMetasEquipe] = useState<MetaComProgresso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizarMetas = useCallback((metas: MetaComProgresso[], usuarioId: string) => {
    return metas.map(meta => {
      const progresso = meta.progresso_individual
        || meta.progresso_metas?.find(pm => pm.tma_id === usuarioId)
        || meta.progresso_metas?.[0]
        || null;

      return {
        ...meta,
        progresso_individual: progresso || undefined
      } as MetaComProgresso;
    });
  }, []);

  const carregarMetas = useCallback(async (forcarAtualizacao = false) => {
    const usuarioId = user?.usuario_id || user?.id;
    if (!usuarioId) return;

    setLoading(true);
    setError(null);

    try {
      const cacheKey = `metas_${usuarioId}`;
      const cached = localStorage.getItem(cacheKey);

      // Se forçar atualização, ignorar cache
      if (cached && !isOnline && !forcarAtualizacao) {
        const cacheData: CacheData = JSON.parse(cached);
        setMetasIndividuais(cacheData.metas.filter(m => m.escopo === 'individual'));
        setMetasEquipe(cacheData.metas.filter(m => m.escopo === 'equipe'));
        setLoading(false);
        return;
      }

      if (isOnline) {
        console.log('📊 [METAS] Carregando metas online para usuário:', user?.nome, forcarAtualizacao ? '(FORÇADO)' : '');

        const response = await metasAPI.buscarMetasAtribuidasAoUsuario(usuarioId);

        if (!response.success) {
          setError(response.error || 'Erro ao carregar metas');
          setLoading(false);
          return;
        }

        const metasEquipeNormalizadas = normalizarMetas((response.metasEquipe || []) as MetaComProgresso[], usuarioId);
        const metasIndividuaisNormalizadas = normalizarMetas((response.metasIndividuais || []) as MetaComProgresso[], usuarioId);
        const todasMetas = [...metasEquipeNormalizadas, ...metasIndividuaisNormalizadas];

        setMetasEquipe(metasEquipeNormalizadas);
        setMetasIndividuais(metasIndividuaisNormalizadas);

        const cacheData: CacheData = {
          metas: todasMetas,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } else if (cached) {
        const cacheData: CacheData = JSON.parse(cached);
        setMetasIndividuais(cacheData.metas.filter(m => m.escopo === 'individual'));
        setMetasEquipe(cacheData.metas.filter(m => m.escopo === 'equipe'));
      } else {
        setError('Sem conexão e sem dados em cache');
      }
    } catch (err) {
      console.error('❌ [METAS] Erro ao carregar metas:', err);
      setError('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  }, [user?.usuario_id, user?.id, user?.nome, isOnline, normalizarMetas]);

  useEffect(() => {
    carregarMetas();

    // Listener para recarregar quando termo/lv/rotina for criado
    const handleRecarregarMetas = () => {
      console.log('🔄 [METAS] Recarregando metas após criação de item...');
      carregarMetas(true); // Forçar atualização
    };

    window.addEventListener('meta:atualizar', handleRecarregarMetas);

    return () => {
      window.removeEventListener('meta:atualizar', handleRecarregarMetas);
    };
  }, [carregarMetas]);

  const atualizarMeta = useCallback(async (metaId: string, dados: any) => {
    try {
      const response = await metasAPI.atualizarMeta(metaId, dados);
      if (response.success) {
        await carregarMetas(); // Recarregar dados
        return true;
      } else {
        setError(response.error || 'Erro ao atualizar meta');
        return false;
      }
    } catch (err) {
      console.error('❌ [METAS] Erro ao atualizar meta:', err);
      setError('Erro ao atualizar meta');
      return false;
    }
  }, [carregarMetas]);

  const atualizarProgresso = useCallback(async (metaId: string, quantidadeAdicionada: number, observacao?: string) => {
    try {
      const response = await metasAPI.atualizarProgresso(metaId, quantidadeAdicionada, observacao);
      if (response.success) {
        await carregarMetas(); // Recarregar dados
        return true;
      } else {
        setError(response.error || 'Erro ao atualizar progresso');
        return false;
      }
    } catch (err) {
      console.error('❌ [METAS] Erro ao atualizar progresso:', err);
      setError('Erro ao atualizar progresso');
      return false;
    }
  }, [carregarMetas]);

  return {
    metasIndividuais,
    metasEquipe,
    loading,
    error,
    carregarMetas,
    atualizarMeta,
    atualizarProgresso
  };
}

// ===================================================================
// HOOKS AUXILIARES
// ===================================================================

export const useMetasIndividuais = () => {
  const { metasIndividuais, loading, error, carregarMetas } = useDashboardMetas();
  
  return {
    metas: metasIndividuais,
    loading,
    error,
    refreshMetas: carregarMetas
  };
};

export const useMetasEquipe = () => {
  const { metasEquipe, loading, error, carregarMetas } = useDashboardMetas();
  
  return {
    metas: metasEquipe,
    loading,
    error,
    refreshMetas: carregarMetas
  };
};

export const useMetasProgress = () => {
  const { metasIndividuais, metasEquipe, loading, error } = useDashboardMetas();
  
  const getMetasProgress = useCallback(() => {
    const todasMetas = [...metasIndividuais, ...metasEquipe];
    
    if (todasMetas.length === 0) {
      return {
        totalMetas: 0,
        metasConcluidas: 0,
        percentualGeral: 0,
        metasEmAndamento: 0
      };
    }

    const metasConcluidas = todasMetas.filter(meta => 
      (meta.progresso_individual?.percentual_alcancado || 0) >= 100
    ).length;

    const metasEmAndamento = todasMetas.filter(meta => 
      (meta.progresso_individual?.percentual_alcancado || 0) > 0 &&
      (meta.progresso_individual?.percentual_alcancado || 0) < 100
    ).length;

    const percentualGeral = todasMetas.reduce((total, meta) => {
      const percentual = meta.progresso_individual?.percentual_alcancado || 0;
      return total + percentual;
    }, 0) / todasMetas.length;

    return {
      totalMetas: todasMetas.length,
      metasConcluidas,
      metasEmAndamento,
      percentualGeral: Math.round(percentualGeral)
    };
  }, [metasIndividuais, metasEquipe]);

  return {
    progress: getMetasProgress(),
    loading,
    error
  };
};

// ===================================================================
// EXPORTS PARA COMPATIBILIDADE
// ===================================================================

export default useDashboardMetas; 