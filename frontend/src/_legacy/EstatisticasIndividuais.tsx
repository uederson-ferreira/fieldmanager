// ===================================================================
// ESTATÍSTICAS INDIVIDUAIS POR TMA
// ===================================================================

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';

import { MetaComProgressoIndividual } from '../../types/metas';
import type { UserData } from '../../types/entities';

interface EstatisticasIndividuaisProps {
  user: UserData;
}

const EstatisticasIndividuais: React.FC<EstatisticasIndividuaisProps> = ({ user: _user }) => {
  const [metasIndividuais, setMetasIndividuais] = useState<MetaComProgressoIndividual[]>([]);
  const [tmas, setTmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTma, setSelectedTma] = useState<string>('all');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar metas com progresso individual
      const metasResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/metas/metas-individuais`);
      
      if (metasResponse.ok) {
        const metasData = await metasResponse.json();
        setMetasIndividuais(metasData.metas || []);
      }

      // Carregar TMAs
      const tmasResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/usuarios-tma`);
      
      if (tmasResponse.ok) {
        const tmasData = await tmasResponse.json();
        setTmas(tmasData.usuarios || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar estatísticas individuais');
    } finally {
      setLoading(false);
    }
  };

  const getTmaStats = (tmaId: string) => {
    const metasDoTma = metasIndividuais.filter(meta => 
      meta.progresso_metas?.some((p: any) => p.tma_id === tmaId)
    );

    const totalMetas = metasDoTma.length;
    const metasAlcancadas = metasDoTma.filter(meta => {
      const progresso = meta.progresso_metas?.find((p: any) => p.tma_id === tmaId);
              return progresso && (progresso.percentual_alcancado || 0) >= 100;
    }).length;

    const percentualGeral = totalMetas > 0 ? (metasAlcancadas / totalMetas) * 100 : 0;

    return {
      totalMetas,
      metasAlcancadas,
      percentualGeral
    };
  };

  const getPercentualColor = (percentual: number) => {
    if (percentual >= 100) return 'text-green-600';
    if (percentual >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alcancada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'superada':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'nao_alcancada':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
            <span className="ml-2 text-green-600">Carregando estatísticas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Estatísticas Individuais por TMA
            </h1>
            <p className="text-green-600 mt-1">
              Acompanhe o desempenho individual de cada TMA
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedTma}
              onChange={(e) => setSelectedTma(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos os TMAs</option>
              {tmas.map((tma) => (
                <option key={tma.id || ''} value={tma.id || ''}>{tma.nome}</option>
              ))}
            </select>
            <button
              onClick={carregarDados}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total de TMAs</p>
                <p className="text-2xl font-bold text-green-900">{tmas.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Metas Individuais</p>
                <p className="text-2xl font-bold text-blue-900">
                  {metasIndividuais.length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Atribuições</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {metasIndividuais.reduce((total, meta) => 
                    total + (meta.progresso_metas?.length || 0), 0
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">% Médio Alcançado</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(() => {
                    const totalPercentual = metasIndividuais.reduce((total, meta) => {
                      const percentual = meta.progresso_metas?.reduce((sum: number, p: any) => 
                        sum + p.percentual_alcancado, 0
                      ) || 0;
                      return total + percentual;
                    }, 0);
                    const totalAtribuicoes = metasIndividuais.reduce((total, meta) => 
                      total + (meta.progresso_metas?.length || 0), 0
                    );
                    return totalAtribuicoes > 0 ? (totalPercentual / totalAtribuicoes).toFixed(1) : '0.0';
                  })()}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Lista de TMAs com Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Desempenho por TMA</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tmas
                .filter(tma => selectedTma === 'all' || (tma.id || '') === selectedTma)
                .map((tma) => {
                  const stats = getTmaStats(tma.id || '');
                  const metasDoTma = metasIndividuais.filter(meta => 
                    meta.progresso_metas?.some((p: any) => p.tma_id === (tma.id || ''))
                  );

                  return (
                    <div key={tma.id || ''} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{tma.nome}</h4>
                          <p className="text-sm text-gray-600">{tma.email}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getPercentualColor(stats.percentualGeral)}`}>
                            {stats.percentualGeral.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-500">
                            {stats.metasAlcancadas} / {stats.totalMetas} metas
                          </p>
                        </div>
                      </div>

                      {/* Metas do TMA */}
                      {metasDoTma.length > 0 && (
                        <div className="space-y-2">
                          {metasDoTma.map((meta) => {
                            const progresso = meta.progresso_metas?.find((p: any) => p.tma_id === (tma.id || ''));
                            if (!progresso) return null;

                            return (
                              <div key={meta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(progresso.status || '')}
                                  <div>
                                    <p className="font-medium text-gray-900">{meta.descricao}</p>
                                    <p className="text-sm text-gray-600">
                                      {progresso.quantidade_atual} / {meta.meta_quantidade}
                                    </p>
                                  </div>
                                </div>
                                <span className={`font-bold ${getPercentualColor(progresso.percentual_alcancado || 0)}`}>
                                  {(progresso.percentual_alcancado || 0).toFixed(1)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {metasDoTma.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Nenhuma meta atribuída a este TMA
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstatisticasIndividuais; 