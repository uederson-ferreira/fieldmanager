// ===================================================================
// DASHBOARD DE ESTATÍSTICAS - FIELDMANAGER v2.0
// Localização: src/components/common/DashboardEstatisticas.tsx
// ===================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { execucoesAPI } from '../../lib/execucoesAPI';

interface DashboardEstatisticasProps {
  userId: string;
  tenantId: string;
}

interface Estatisticas {
  totalExecucoes: number;
  execucoesHoje: number;
  execucoesSemana: number;
  execucoesMes: number;
  totalRespostas: number;
  conformes: number;
  naoConformes: number;
  naoAplicaveis: number;
  taxaConformidade: number;
  modulosMaisExecutados: { modulo: string; total: number }[];
  evolucaoSemanal: { dia: string; total: number }[];
}

const DashboardEstatisticas: React.FC<DashboardEstatisticasProps> = ({ userId, tenantId }) => {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarEstatisticas = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar todas as execuções do usuário (fazer múltiplas requisições se necessário)
      let todasExecucoes: any[] = [];
      let offset = 0;
      const limit = 1000;
      let total = 0;

      // Primeira requisição para obter o total
      console.log(`🔍 [DASHBOARD STATS] Buscando execuções para userId: ${userId}, tenantId: ${tenantId}`);
      const primeiraRequisicao = await execucoesAPI.getExecucoes({
        tenantId,
        usuarioId: userId,
        limit,
        offset: 0
      });

      todasExecucoes = primeiraRequisicao.data || [];
      total = primeiraRequisicao.total || todasExecucoes.length;
      console.log(`📊 [DASHBOARD STATS] Primeira requisição: ${todasExecucoes.length} execuções retornadas, total no banco: ${total}`);

      // Se houver mais execuções, buscar em lotes
      if (total > limit) {
        console.log(`📊 [DASHBOARD STATS] Buscando ${total} execuções em lotes de ${limit}...`);
        
        const lotesAdicionais = Math.ceil((total - limit) / limit);
        const requisicoesAdicionais = [];

        for (let i = 1; i <= lotesAdicionais; i++) {
          offset = i * limit;
          requisicoesAdicionais.push(
            execucoesAPI.getExecucoes({
              tenantId,
              usuarioId: userId,
              limit,
              offset
            })
          );
        }

        const resultadosAdicionais = await Promise.all(requisicoesAdicionais);
        resultadosAdicionais.forEach(resultado => {
          if (resultado.data) {
            todasExecucoes = [...todasExecucoes, ...resultado.data];
          }
        });

        console.log(`✅ [DASHBOARD STATS] Total de execuções carregadas: ${todasExecucoes.length} de ${total}`);
      }

      const execucoes = todasExecucoes;

      // Calcular estatísticas
      const agora = new Date();
      const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      const umaSemanaAtras = new Date(hoje);
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
      const umMesAtras = new Date(hoje);
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);

      const execucoesHoje = execucoes.filter(e =>
        new Date(e.data_execucao) >= hoje
      ).length;

      const execucoesSemana = execucoes.filter(e =>
        new Date(e.data_execucao) >= umaSemanaAtras
      ).length;

      const execucoesMes = execucoes.filter(e =>
        new Date(e.data_execucao) >= umMesAtras
      ).length;

      // Buscar detalhes de cada execução para contar respostas
      const execucoesCompletas = await Promise.all(
        execucoes.slice(0, 50).map(async (exec) => {
          try {
            return await execucoesAPI.getExecucao(exec.id);
          } catch {
            return null;
          }
        })
      );

      const execucoesValidas = execucoesCompletas.filter(e => e !== null);

      // Contar respostas
      let conformes = 0;
      let naoConformes = 0;
      let naoAplicaveis = 0;

      execucoesValidas.forEach(exec => {
        if (exec.respostas) {
          exec.respostas.forEach((resp: any) => {
            if (resp.resposta === 'C') conformes++;
            else if (resp.resposta === 'NC') naoConformes++;
            else if (resp.resposta === 'NA') naoAplicaveis++;
          });
        }
      });

      const totalRespostas = conformes + naoConformes + naoAplicaveis;
      const taxaConformidade = totalRespostas > 0
        ? Math.round((conformes / (conformes + naoConformes)) * 100)
        : 0;

      // Módulos mais executados
      const modulosCount: Record<string, number> = {};
      execucoes.forEach(exec => {
        const nomeModulo = exec.modulos?.nome || 'Desconhecido';
        modulosCount[nomeModulo] = (modulosCount[nomeModulo] || 0) + 1;
      });

      const modulosMaisExecutados = Object.entries(modulosCount)
        .map(([modulo, total]) => ({ modulo, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Evolução semanal
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const evolucaoSemanal = Array.from({ length: 7 }, (_, i) => {
        const dia = new Date(umaSemanaAtras);
        dia.setDate(dia.getDate() + i);
        const diaStr = diasSemana[dia.getDay()];

        const totalDia = execucoes.filter(e => {
          const dataExec = new Date(e.data_execucao);
          return dataExec.toDateString() === dia.toDateString();
        }).length;

        return { dia: diaStr, total: totalDia };
      });

      // Usar total real do banco (não o tamanho do array)
      const totalExecucoesReal = total || execucoes.length;
      console.log(`📊 [DASHBOARD ESTATISTICAS] Total de execuções: ${totalExecucoesReal} (array: ${execucoes.length})`);

      setStats({
        totalExecucoes: totalExecucoesReal,
        execucoesHoje,
        execucoesSemana,
        execucoesMes,
        totalRespostas,
        conformes,
        naoConformes,
        naoAplicaveis,
        taxaConformidade,
        modulosMaisExecutados,
        evolucaoSemanal
      });

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, tenantId]);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  // Listener para atualizar quando uma execução é criada
  useEffect(() => {
    const handleExecucaoCriada = () => {
      console.log('🔔 [DASHBOARD ESTATISTICAS] Evento execucaoCriada recebido, recarregando...');
      carregarEstatisticas();
    };

    window.addEventListener('execucaoCriada', handleExecucaoCriada);
    window.addEventListener('termoSalvo', handleExecucaoCriada);

    return () => {
      window.removeEventListener('execucaoCriada', handleExecucaoCriada);
      window.removeEventListener('termoSalvo', handleExecucaoCriada);
    };
  }, [carregarEstatisticas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-pulse text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <p className="text-yellow-800">Não foi possível carregar as estatísticas</p>
      </div>
    );
  }

  const dadosConformidade = [
    { name: 'Conforme', value: stats.conformes, color: '#10b981' },
    { name: 'Não Conforme', value: stats.naoConformes, color: '#ef4444' },
    { name: 'N/A', value: stats.naoAplicaveis, color: '#9ca3af' }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Execuções */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total de Execuções</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalExecucoes}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.execucoesHoje} hoje • {stats.execucoesSemana} esta semana
          </p>
        </div>

        {/* Taxa de Conformidade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              stats.taxaConformidade >= 90 ? 'bg-green-100 text-green-800' :
              stats.taxaConformidade >= 75 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {stats.taxaConformidade >= 90 ? 'Excelente' : stats.taxaConformidade >= 75 ? 'Bom' : 'Atenção'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Conformidade</p>
          <p className="text-3xl font-bold text-gray-900">{stats.taxaConformidade}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.conformes} conformes de {stats.conformes + stats.naoConformes} respostas
          </p>
        </div>

        {/* Não Conformidades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Não Conformidades</p>
          <p className="text-3xl font-bold text-gray-900">{stats.naoConformes}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalRespostas > 0 ? Math.round((stats.naoConformes / stats.totalRespostas) * 100) : 0}% do total de respostas
          </p>
        </div>

        {/* Execuções Este Mês */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Este Mês</p>
          <p className="text-3xl font-bold text-gray-900">{stats.execucoesMes}</p>
          <p className="text-xs text-gray-500 mt-2">
            Últimos 30 dias
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição de Conformidade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Distribuição de Conformidade</h3>
          </div>
          {stats.totalRespostas > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosConformidade}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosConformidade.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Nenhuma resposta registrada ainda</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p className="text-xs font-medium text-gray-600">Conforme</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.conformes}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <p className="text-xs font-medium text-gray-600">Não Conforme</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.naoConformes}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                <p className="text-xs font-medium text-gray-600">N/A</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{stats.naoAplicaveis}</p>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras - Módulos Mais Executados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Módulos Mais Executados</h3>
          </div>
          {stats.modulosMaisExecutados.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.modulosMaisExecutados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="modulo"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Nenhuma execução registrada ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Linha - Evolução Semanal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Evolução nos Últimos 7 Dias</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.evolucaoSemanal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              name="Execuções"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardEstatisticas;
