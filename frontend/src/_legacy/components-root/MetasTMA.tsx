// ===================================================================
// COMPONENTE METAS TMA - ECOFIELD (SEM CACHE) - VERSÃO FINAL CORRIGIDA
// Localização: src/components/MetasTMA.tsx
// Módulo: Interface de Metas sempre online (sem cache) - Tipos Corrigidos
// ===================================================================

import { useState, useEffect, useCallback } from 'react';
import { 
  Target, 
  BarChart3, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Award,
  Activity,
  PieChart,
  LineChart,
  ArrowLeft
} from 'lucide-react';
import { metasAPI } from '../lib/metasAPI';
import type { MetaComProgresso } from '../lib/metasAPI';
import { formatarPeriodo } from '../types/metas';
import useAuth from '../hooks/useAuth';
import type { UserData } from '../types/entities';

interface MetasTMAProps {
  onBack: () => void;
  user: UserData; // Mantida para compatibilidade com TecnicoDashboard
}

export default function MetasTMA({ onBack, user: userProp }: MetasTMAProps) {
  // Estados principais
  const [metas, setMetas] = useState<MetaComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDashboard, _setShowDashboard] = useState(true);
  const [resumo, setResumo] = useState<any | null>(null); // Changed to any for now as types are complex

  // Filtros (mantendo apenas o estado, sem setter - removido setFiltros não utilizado)
  const [_filtros] = useState<any>({}); // Changed to any for now as types are complex
  const [showFiltros, setShowFiltros] = useState(false);

  // Hook de autenticação
  const { user: userFromAuth } = useAuth();
  
  const user = userProp || userFromAuth;
  const usuarioId = user?.usuario_id || user?.id;

  // Função para carregar dados - SEMPRE DO SERVIDOR (com useCallback)
  const carregarDados = useCallback(async (fonte: 'automatico' | 'manual' = 'automatico') => {
    console.log(`🔄 [METAS TMA] Carregando dados SEMPRE DO SERVIDOR - fonte: ${fonte}`);
    setLoading(true);

    try {
      if (!usuarioId) {
        console.error('❌ [CARREGAR DADOS] Usuário não identificado');
        return;
      }

      console.log('👤 [CARREGAR DADOS] Buscando metas atribuídas ao usuário...');
      const { metasEquipe: metasEquipeData, metasIndividuais: metasIndividuaisData } = 
        await metasAPI.buscarMetasAtribuidasAoUsuario(usuarioId);
      
      console.log('✅ [CARREGAR DADOS] Metas atribuídas carregadas:', {
        equipe: metasEquipeData?.length || 0,
        individuais: metasIndividuaisData?.length || 0
      });

      // ✅ DEBUG: Verificar estrutura dos dados recebidos
      console.log('🔍 [DEBUG METAS TMA] Dados recebidos da API:', {
        metasEquipeData,
        metasIndividuaisData
      });
      
      if (metasEquipeData && metasEquipeData.length > 0) {
        console.log('🔍 [DEBUG METAS TMA] Primeira meta de EQUIPE:', metasEquipeData[0]);
        console.log('🔍 [DEBUG METAS TMA] Progresso meta de EQUIPE:', metasEquipeData[0].progresso_individual);
      }
      
      if (metasIndividuaisData && metasIndividuaisData.length > 0) {
        console.log('🔍 [DEBUG METAS TMA] Primeira meta INDIVIDUAL:', metasIndividuaisData[0]);
        console.log('🔍 [DEBUG METAS TMA] Progresso meta INDIVIDUAL:', metasIndividuaisData[0].progresso_individual);
      }

      // Combinar todas as metas atribuídas
      const todasMetas = [...(metasEquipeData || []), ...(metasIndividuaisData || [])];
      const metasNormalizadas = (todasMetas as MetaComProgresso[]).map(meta => {
        const progresso = meta.progresso_individual
          || meta.progresso_metas?.find(pm => pm.tma_id === usuarioId)
          || meta.progresso_metas?.[0]
          || null;

        return {
          ...meta,
          progresso_individual: progresso || undefined
        } as MetaComProgresso;
      });

      console.log('✅ [CARREGAR DADOS] Total de metas atribuídas:', metasNormalizadas.length);
      setMetas(metasNormalizadas);

      const metasPorTipo = agruparMetasPorTipo(metasNormalizadas);
      const resumoCalculado = {
        total_metas: metasNormalizadas.length,
        lv: metasNormalizadas.filter(m => m.tipo_meta === 'lv').length,
        termo: metasNormalizadas.filter(m => m.tipo_meta === 'termo').length,
        rotina: metasNormalizadas.filter(m => m.tipo_meta === 'rotina').length,
        metas_alcancadas: metasNormalizadas.filter(m => (m.progresso_individual?.percentual_alcancado || 0) >= 100).length,
        metas_em_andamento: metasNormalizadas.filter(m => {
          const percentual = m.progresso_individual?.percentual_alcancado || 0;
          return percentual > 0 && percentual < 100;
        }).length,
        metas_nao_alcancadas: metasNormalizadas.filter(m => (m.progresso_individual?.percentual_alcancado || 0) <= 0).length,
        percentual_geral: metasNormalizadas.length > 0 
          ? Math.round(
              metasNormalizadas.reduce((acc, meta) => acc + (meta.progresso_individual?.percentual_alcancado || 0), 0) /
                metasNormalizadas.length
            )
          : 0,
        metas_por_tipo: metasPorTipo
      };
      setResumo(resumoCalculado);

      console.log('✅ [CARREGAR DADOS] Todos os dados carregados - APENAS METAS ATRIBUÍDAS');
      
    } catch (error) {
      console.error('❌ [CARREGAR DADOS] Erro ao carregar dados:', error);
      alert('Erro ao carregar dados das metas. Verifique sua conexão com a internet.');
    } finally {
      setLoading(false);
    }
  }, [usuarioId]); // Dependências corrigidas

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Funções auxiliares
  function getTipoMetaLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'lv': 'LVs',
      'termo': 'Termos',
      'rotina': 'Rotinas',
      'individual': 'Individual',
      'equipe': 'Equipe'
    };
    return labels[tipo] || tipo;
  }

  const getPercentualColor = (percentual: number) => {
    if (percentual >= 100) return 'text-green-600';
    if (percentual >= 80) return 'text-yellow-600';
    if (percentual >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alcancada':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'superada':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'em_andamento':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'nao_alcancada':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCardBgColor = (status: string) => {
    switch (status) {
      case 'alcancada':
        return 'bg-green-50 border-green-200';
      case 'superada':
        return 'bg-purple-50 border-purple-200';
      case 'em_andamento':
        return 'bg-yellow-50 border-yellow-200';
      case 'nao_alcancada':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const resolvePercentual = (meta: MetaComProgresso) => meta.progresso_individual?.percentual_alcancado || 0;
  const resolveQuantidadeAtual = (meta: MetaComProgresso) => meta.progresso_individual?.quantidade_atual || 0;
  const resolveStatus = (meta: MetaComProgresso) => meta.progresso_individual?.status || 'em_andamento';

  // Filtrar metas baseado no termo de busca
  const filtrarMetas = (metas: MetaComProgresso[]) => {
    return metas.filter(meta =>
      meta.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoMetaLabel(meta.tipo_meta || meta.escopo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Funções para o dashboard
  const getMetasPorTipo = () => {
    const tipos = metas.reduce((acc, meta) => {
      const chave = meta.tipo_meta || 'outros';
      acc[chave] = (acc[chave] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return Object.entries(tipos).map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
      percentual: metas.length ? (quantidade / metas.length) * 100 : 0
    }));
  };

  const getMetasPorStatus = () => {
    const statusCounts: Record<string, number> = {};
    metas.forEach(meta => {
      const status = resolveStatus(meta);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, quantidade]) => ({
      status,
      quantidade: quantidade as number,
      percentual: metas.length ? (quantidade / metas.length) * 100 : 0
    }));
  };

  const getEvolucaoMensal = () => {
    const monthlyData: Record<string, number> = {};
    metas.forEach(meta => {
      const referencia = meta.progresso_individual?.ultima_atualizacao || meta.updated_at || meta.created_at;
      const month = new Date(referencia).toLocaleDateString('pt-BR', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return Object.entries(monthlyData).map(([mes, quantidade]) => ({
      mes,
      quantidade: quantidade as number
    }));
  };

  const getTopMetas = () => {
    const topMetas = metas
      .sort((a, b) => {
        const progressoA = a.progresso_individual?.percentual_alcancado || 0;
        const progressoB = b.progresso_individual?.percentual_alcancado || 0;
        return progressoB - progressoA;
      })
      .slice(0, 5);
      
    console.log('🔍 [DEBUG TOP METAS] Calculando top metas:', {
      totalMetas: metas.length,
      topMetas: topMetas.map(m => ({
        id: m.id,
        descricao: m.descricao,
        tipo: m.tipo_meta,
        progresso_individual: m.progresso_individual
      }))
    });
    
    return topMetas;
  };

  const getMetasAtrasadas = () => {
    return metas.filter(meta => {
      return resolvePercentual(meta) < 50;
    });
  };

  const agruparMetasPorTipo = (metas: MetaComProgresso[]) => {
    return {
      individual: metas.filter(m => m.escopo === 'individual').length,
      equipe: metas.filter(m => m.escopo === 'equipe').length,
      lv: metas.filter(m => m.tipo_meta === 'lv').length,
      termo: metas.filter(m => m.tipo_meta === 'termo').length,
      rotina: metas.filter(m => m.tipo_meta === 'rotina').length,
    };
  };



  // Remover a função agruparMetasPorStatus não utilizada
  // const agruparMetasPorStatus = (metas: MetaComProgresso[]) => {
  //   return metas.reduce((acc, meta) => {
  //     const statusAtual = meta.status || 'em_andamento';
  //     acc[statusAtual] = (acc[statusAtual] || 0) + 1;
  //     return acc;
  //   }, {} as Record<string, number>);
  // };

  // Renderizar dashboard
  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }

    const metasPorTipo = getMetasPorTipo();
    const metasPorStatus = getMetasPorStatus();
    const evolucaoMensal = getEvolucaoMensal();
    const topMetas = getTopMetas();
    const metasAtrasadas = getMetasAtrasadas();

    return (
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Metas</p>
                <p className="text-3xl font-bold text-gray-900">{resumo?.total_metas || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Ativas no sistema</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alcançadas</p>
                <p className="text-3xl font-bold text-green-600">{resumo?.metas_alcancadas || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {resumo?.total_metas ? Math.round((resumo.metas_alcancadas / resumo.total_metas) * 100) : 0}% do total
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-3xl font-bold text-yellow-600">{resumo?.metas_em_andamento || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Precisam de atenção</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progresso Médio</p>
                <p className="text-3xl font-bold text-blue-600">{resumo?.percentual_geral || 0}%</p>
                <p className="text-xs text-gray-500 mt-1">Média geral</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Visualizações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Tipo */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Distribuição por Tipo
            </h3>
            <div className="space-y-3">
              {metasPorTipo.map((item) => (
                <div key={item.tipo} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {getTipoMetaLabel(item.tipo)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentual}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.quantidade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status das Metas */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Status das Metas
            </h3>
            <div className="space-y-3">
              {metasPorStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      item.status === 'alcancada' ? 'bg-green-500' :
                      item.status === 'em_andamento' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.status === 'alcancada' ? 'bg-green-500' :
                          item.status === 'em_andamento' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.percentual}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.quantidade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evolução Mensal */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-purple-600" />
            Evolução Mensal
          </h3>
          {evolucaoMensal.length > 0 ? (
            <div className="flex items-end justify-between h-32 space-x-2">
            {evolucaoMensal.map((item, _index) => {
              // ✅ CALCULAR ALTURA DA BARRA BASEADA NO CONTAINER (128px)
              const alturaMaxima = 100; // 100px para deixar espaço para texto
              const alturaPercentual = Math.max(2, item.quantidade); // Mínimo 2% para visibilidade
              const alturaPixels = (alturaPercentual / 100) * alturaMaxima;
              
              return (
                <div key={item.mes} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-600 mb-1">{item.mes}</div>
                  <div className="flex-1 flex items-end">
                    <div 
                      className="bg-purple-500 rounded-t w-full transition-all duration-300 min-h-[2px]"
                      style={{ height: `${alturaPixels}px` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.quantidade}%
                  </div>
                </div>
                             );
             })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <LineChart className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">Dados de evolução serão exibidos conforme o progresso das metas</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Metas e Metas Atrasadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Metas */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Top 5 Metas
            </h3>
            <div className="space-y-3">
              {topMetas.map((meta, index) => (
                <div key={meta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-yellow-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {meta.descricao || `Meta ${getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')} • {formatarPeriodo(meta)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const progresso = meta.progresso_individual;
                      const percentual = progresso?.percentual_alcancado || 0;
                      
                      return (
                        <>
                          <p className={`text-sm font-bold ${getPercentualColor(percentual)}`}>
                            {Math.round(percentual)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {progresso?.quantidade_atual || 0}/{meta.meta_quantidade}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metas Atrasadas */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              Metas Atrasadas
            </h3>
            <div className="space-y-3">
              {metasAtrasadas.length > 0 ? (
                metasAtrasadas.map((meta) => (
                  <div key={meta.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {meta.descricao || `Meta ${getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')} • {formatarPeriodo(meta)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const progresso = meta.progresso_individual;
                        const percentual = progresso?.percentual_alcancado || 0;
                        
                        return (
                          <>
                            <p className="text-sm font-bold text-red-600">
                              {Math.round(percentual)}%
                            </p>
                            <p className="text-xs text-gray-500">
                              {progresso?.quantidade_atual || 0}/{meta.meta_quantidade}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-600">Nenhuma meta atrasada!</p>
                  <p className="text-sm text-gray-500">Todas as metas estão no prazo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo por Tipo */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Resumo por Tipo de Meta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(resumo?.metas_por_tipo || {}).map(([tipo, quantidade]) => (
              <div key={tipo} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{getTipoMetaLabel(tipo)}</h4>
                  <span className="text-2xl font-bold text-indigo-600">
                    {String(quantidade)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${resumo?.total_metas ? ((quantidade as number) / resumo.total_metas) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {resumo?.total_metas ? Math.round(((quantidade as number) / resumo.total_metas) * 100) : 0}% do total
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">
            Metas
          </h1>
          <p className="text-green-600 mt-1">
            Acompanhe o progresso das suas metas
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-green-600 bg-green-50 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          <button
            onClick={() => carregarDados('manual')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            title="Atualizar dados"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Status de Conectividade */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">Conectado ao servidor - Dados sempre atualizados</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showDashboard ? (
          // Dashboard
          renderDashboard()
        ) : (
          // Lista de Metas
          <>
            {/* Cards de Resumo */}
            {resumo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Metas</p>
                      <p className="text-2xl font-bold text-gray-900">{resumo.total_metas}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Alcançadas</p>
                      <p className="text-2xl font-bold text-green-600">{resumo.metas_alcancadas}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Em Andamento</p>
                      <p className="text-2xl font-bold text-yellow-600">{resumo.metas_em_andamento}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Progresso Médio</p>
                      <p className="text-2xl font-bold text-blue-600">{resumo.percentual_geral}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Barra de Busca */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar metas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFiltros(!showFiltros)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showFiltros 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Filter className="h-4 w-4 inline mr-2" />
                    Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Metas */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filtrarMetas(metas).length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta encontrada</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar os termos de busca.' : 'Não há metas cadastradas no momento.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarMetas(metas).map((meta) => (
                  <div key={meta.id} className={`bg-white rounded-lg shadow border transition-all duration-200 hover:shadow-lg ${getCardBgColor(resolveStatus(meta))}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(resolveStatus(meta))}
                          <h3 className="font-medium text-gray-900 truncate">
                          {meta.descricao || `Meta ${getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')}`}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(() => {
                          // ✅ USAR progresso_individual da nova estrutura
                          const progresso = meta.progresso_individual;
                          const percentualAlcancado = progresso?.percentual_alcancado || 0;
                          
                          return (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progresso:</span>
                                <span className="font-medium">
                                  {String(resolveQuantidadeAtual(meta))} / {String(meta.meta_quantidade || 0)}
                                </span>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(percentualAlcancado, 100)}%` }}
                                ></div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className={`text-2xl font-bold ${getPercentualColor(percentualAlcancado)}`}>
                                  {Math.round(percentualAlcancado)}%
                                </div>
                                
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(percentualAlcancado, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatarPeriodo(meta)}</span>
                          <span className="capitalize">{getTipoMetaLabel(meta.tipo_meta || meta.escopo || 'meta')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
