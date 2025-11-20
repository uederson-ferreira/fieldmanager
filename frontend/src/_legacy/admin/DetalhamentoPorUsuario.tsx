import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfis?: {
    nome: string;
  };
};

type EstatisticasUsuario = {
  lvs: {
    total: number;
    completas: number;
    pendentes: number;
    naoConformes: number;
    conformidadeMedia: number;
  };
  rotinas: {
    total: number;
    concluidas: number;
    pendentes: number;
    naoConformes: number;
    tempoMedio: number;
  };
  termos: {
    total: number;
    notificacoes: number;
    paralizacoes: number;
    recomendacoes: number;
  };
  metas: {
    total: number;
    quantidadeTotal: number;
    porTipo: {
      lv: number;
      rotina: number;
      termo: number;
    };
    concluidas: number;
    emAndamento: number;
    naoIniciadas: number;
    percentualMedio: number;
  };
};

type ComparativoGeral = {
  lvs_media: number;
  rotinas_media: number;
  termos_media: number;
  conformidade_geral: number;
  metas_media: number;
  percentual_medio_metas: number;
};

interface DetalhamentoPorUsuarioProps {
  onBack?: () => void;
}

const DetalhamentoPorUsuario: React.FC<DetalhamentoPorUsuarioProps> = ({ onBack }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string>('');
  const [estatisticas, setEstatisticas] = useState<EstatisticasUsuario | null>(null);
  const [comparativo, setComparativo] = useState<ComparativoGeral | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (usuarioSelecionado) {
      fetchEstatisticasUsuario(usuarioSelecionado);
    }
  }, [usuarioSelecionado]);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/usuarios-ativos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchEstatisticasUsuario = async (userId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Buscar estatísticas do usuário específico
      const [lvsRes, rotinasRes, termosRes, metasRes, comparativoRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/usuario/${userId}/lvs`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/usuario/${userId}/rotinas`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/usuario/${userId}/termos`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/usuario/${userId}/metas`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/comparativo-geral`, { headers })
      ]);

      const [lvsData, rotinasData, termosData, metasData, comparativoData] = await Promise.all([
        lvsRes.ok ? lvsRes.json() : null,
        rotinasRes.ok ? rotinasRes.json() : null,
        termosRes.ok ? termosRes.json() : null,
        metasRes.ok ? metasRes.json() : null,
        comparativoRes.ok ? comparativoRes.json() : null
      ]);

      setEstatisticas({
        lvs: lvsData || { total: 0, completas: 0, pendentes: 0, naoConformes: 0, conformidadeMedia: 0 },
        rotinas: rotinasData || { total: 0, concluidas: 0, pendentes: 0, naoConformes: 0, tempoMedio: 0 },
        termos: termosData || { total: 0, notificacoes: 0, paralizacoes: 0, recomendacoes: 0 },
        metas: metasData || { total: 0, concluidas: 0, emAndamento: 0, naoIniciadas: 0, percentualMedio: 0 }
      });

      setComparativo(comparativoData);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const usuarioInfo = usuarios.find(u => u.id === usuarioSelecionado);

  // Dados para gráfico de radar - Executado vs Meta
  const dadosRadar = comparativo && estatisticas ? [
    {
      metrica: 'LVs',
      Executado: estatisticas.lvs.total || 0,
      Meta: estatisticas.metas?.porTipo?.lv || 0
    },
    {
      metrica: 'Rotinas',
      Executado: estatisticas.rotinas.total || 0,
      Meta: estatisticas.metas?.porTipo?.rotina || 0
    },
    {
      metrica: 'Termos',
      Executado: estatisticas.termos.total || 0,
      Meta: estatisticas.metas?.porTipo?.termo || 0
    }
  ] : [];

  // Dados para gráfico de barras (distribuição de atividades)
  const dadosDistribuicao = estatisticas ? [
    {
      tipo: 'LVs',
      Completas: estatisticas.lvs.completas,
      Pendentes: estatisticas.lvs.pendentes,
      'Não Conformes': estatisticas.lvs.naoConformes
    },
    {
      tipo: 'Rotinas',
      Completas: estatisticas.rotinas.concluidas,
      Pendentes: estatisticas.rotinas.pendentes,
      'Não Conformes': estatisticas.rotinas.naoConformes
    }
  ] : [];

  // Dados para gráfico de pizza (termos)
  const dadosTermos = estatisticas ? [
    { name: 'Notificações', value: estatisticas.termos.notificacoes, fill: '#f59e0b' },
    { name: 'Paralizações', value: estatisticas.termos.paralizacoes, fill: '#ef4444' },
    { name: 'Recomendações', value: estatisticas.termos.recomendacoes, fill: '#10b981' }
  ] : [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Detalhamento por Usuário</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
      </div>

      {/* Seletor de Usuário */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Selecione um usuário para análise:
        </label>
        {loadingUsuarios ? (
          <div className="text-gray-500">Carregando usuários...</div>
        ) : (
          <select
            value={usuarioSelecionado}
            onChange={(e) => setUsuarioSelecionado(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Selecione um usuário --</option>
            {usuarios.map(usuario => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome} ({usuario.email}){usuario.perfis?.nome ? ` - ${usuario.perfis.nome}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Carregando estatísticas...</div>
        </div>
      )}

      {!loading && estatisticas && usuarioInfo && (
        <>
          {/* Cards de Resumo do Usuário */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo de Atividades - {usuarioInfo.nome}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-700">{estatisticas.lvs.total}</div>
                <div className="text-sm text-gray-600">Listas de Verificação</div>
                <div className="mt-2 text-xs text-gray-500">
                  {estatisticas.lvs.conformidadeMedia}% de conformidade
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-700">{estatisticas.rotinas.total}</div>
                <div className="text-sm text-gray-600">Atividades de Rotina</div>
                <div className="mt-2 text-xs text-gray-500">
                  {estatisticas.rotinas.tempoMedio} min médio
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-amber-700">{estatisticas.termos.total}</div>
                <div className="text-sm text-gray-600">Termos Ambientais</div>
                <div className="mt-2 text-xs text-gray-500">
                  {estatisticas.termos.notificacoes} notificações
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Gráficos - Organizada por Tipo */}

          {/* Seção Listas de Verificação */}
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 border-b pb-2">
              📋 Listas de Verificação do Usuário
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Status das Listas de Verificação
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completas', value: estatisticas.lvs.completas, fill: '#10b981' },
                        { name: 'Pendentes', value: estatisticas.lvs.pendentes, fill: '#f59e0b' },
                        { name: 'Não Conformes', value: estatisticas.lvs.naoConformes, fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: any) => (value && value > 0) ? `${name}: ${value}` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Comparativo de Conformidade
                </h3>
                {estatisticas.lvs.conformidadeMedia === 0 && (comparativo?.conformidade_geral || 0) === 0 ? (
                  <div className="flex items-center justify-center h-[250px] text-gray-500">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">Sem dados de conformidade disponíveis</p>
                      <p className="text-xs text-gray-400 mt-1">As LVs precisam ter percentual de conformidade calculado para aparecer neste gráfico</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={[
                        {
                          categoria: 'Usuário',
                          conformidade: estatisticas.lvs.conformidadeMedia
                        },
                        {
                          categoria: 'Média Geral',
                          conformidade: comparativo?.conformidade_geral || 0
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="categoria" stroke="#6b7280" />
                      <YAxis domain={[0, 100]} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        formatter={(value: number) => `${value}%`}
                      />
                      <Bar dataKey="conformidade" radius={[8, 8, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          {/* Seção Atividades de Rotina */}
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 border-b pb-2">
              🔄 Atividades de Rotina do Usuário
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Status das Rotinas
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Concluídas', value: estatisticas.rotinas.concluidas, fill: '#10b981' },
                        { name: 'Pendentes', value: estatisticas.rotinas.pendentes, fill: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: any) => (value && value > 0) ? `${name}: ${value}` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Comparativo de Produtividade
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        categoria: 'Usuário',
                        total: estatisticas.rotinas.total,
                        concluidas: estatisticas.rotinas.concluidas
                      },
                      {
                        categoria: 'Média Geral',
                        total: comparativo?.rotinas_media || 0,
                        concluidas: Math.round((comparativo?.rotinas_media || 0) * 0.7)
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="categoria" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                    <Bar dataKey="concluidas" fill="#10b981" name="Concluídas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Seção Termos Ambientais */}
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 border-b pb-2">
              📄 Termos Ambientais do Usuário
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Distribuição por Tipo
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dadosTermos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: any) => (value && value > 0) ? `${name}: ${value}` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosTermos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Comparativo de Termos Emitidos
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        tipo: 'Notificações',
                        Usuario: estatisticas.termos.notificacoes,
                        'Média': Math.round((comparativo?.termos_media || 0) * 0.3)
                      },
                      {
                        tipo: 'Paralizações',
                        Usuario: estatisticas.termos.paralizacoes,
                        'Média': Math.round((comparativo?.termos_media || 0) * 0.1)
                      },
                      {
                        tipo: 'Recomendações',
                        Usuario: estatisticas.termos.recomendacoes,
                        'Média': Math.round((comparativo?.termos_media || 0) * 0.6)
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="tipo" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="Usuario" fill="#3b82f6" name="Usuário" />
                    <Bar dataKey="Média" fill="#10b981" name="Média Geral" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Seção Metas */}
          <section className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>🎯</span>
              Metas
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Status das Metas
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Concluídas', value: estatisticas.metas.concluidas, fill: '#10b981' },
                        { name: 'Em Andamento', value: estatisticas.metas.emAndamento, fill: '#3b82f6' },
                        { name: 'Não Iniciadas', value: estatisticas.metas.naoIniciadas, fill: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: any) => (value && value > 0) ? `${name}: ${value}` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#6b7280" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Percentual Médio de Progresso
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        categoria: 'Usuário',
                        progresso: estatisticas.metas.percentualMedio
                      },
                      {
                        categoria: 'Média Geral',
                        progresso: comparativo?.percentual_medio_metas || 0
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="categoria" stroke="#6b7280" />
                    <YAxis domain={[0, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => `${value}%`}
                    />
                    <Bar dataKey="progresso" radius={[8, 8, 0, 0]}>
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow p-4 md:p-6">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
                  Comparativo de Metas: Usuário vs Média Geral
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        metrica: 'Total',
                        Usuario: estatisticas.metas.total,
                        'Média Geral': comparativo?.metas_media || 0
                      },
                      {
                        metrica: 'Concluídas',
                        Usuario: estatisticas.metas.concluidas,
                        'Média Geral': Math.round((comparativo?.metas_media || 0) * 0.3)
                      },
                      {
                        metrica: 'Em Andamento',
                        Usuario: estatisticas.metas.emAndamento,
                        'Média Geral': Math.round((comparativo?.metas_media || 0) * 0.5)
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="metrica" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="Usuario" fill="#3b82f6" name="Usuário" />
                    <Bar dataKey="Média Geral" fill="#10b981" name="Média Geral" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Gráfico de Radar - Executado vs Meta */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                🎯 Desempenho vs Metas
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Comparação entre o que foi executado pelo usuário (azul) e as metas atribuídas (amarelo)
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={dadosRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="metrica"
                  tick={{ fill: '#374151', fontSize: 11 }}
                  tickLine={{ stroke: '#9ca3af' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar
                  name="Executado"
                  dataKey="Executado"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  strokeWidth={3}
                />
                <Radar
                  name="Meta"
                  dataKey="Meta"
                  stroke="#f59e0b"
                  fill="#fbbf24"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 Como interpretar:</strong> A área <span className="font-semibold text-blue-600">azul</span> mostra o que foi executado e a área <span className="font-semibold text-amber-600">amarela</span> mostra as metas.
                Quando o azul supera o amarelo, a meta foi batida! Quando o amarelo é maior, ainda há trabalho a fazer.
              </p>
            </div>
          </div>

          {/* Gráfico de Barras - Distribuição de Status */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Distribuição de Status por Tipo de Atividade
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosDistribuicao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tipo" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Completas" fill="#10b981" />
                <Bar dataKey="Pendentes" fill="#f59e0b" />
                <Bar dataKey="Não Conformes" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detalhes Numéricos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-sm md:text-base font-semibold text-green-900 mb-4">Listas de Verificação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">{estatisticas.lvs.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completas</span>
                  <span className="font-semibold text-green-600">{estatisticas.lvs.completas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendentes</span>
                  <span className="font-semibold text-amber-600">{estatisticas.lvs.pendentes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Não Conformes</span>
                  <span className="font-semibold text-red-600">{estatisticas.lvs.naoConformes}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Conformidade Média</span>
                  <span className="font-semibold text-blue-600">{estatisticas.lvs.conformidadeMedia}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-4">Atividades de Rotina</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">{estatisticas.rotinas.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concluídas</span>
                  <span className="font-semibold text-green-600">{estatisticas.rotinas.concluidas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendentes</span>
                  <span className="font-semibold text-amber-600">{estatisticas.rotinas.pendentes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Não Conformes</span>
                  <span className="font-semibold text-red-600">{estatisticas.rotinas.naoConformes}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Tempo Médio</span>
                  <span className="font-semibold text-blue-600">{estatisticas.rotinas.tempoMedio} min</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-sm md:text-base font-semibold text-amber-900 mb-4">Termos Ambientais</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">{estatisticas.termos.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notificações</span>
                  <span className="font-semibold text-amber-600">{estatisticas.termos.notificacoes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paralizações</span>
                  <span className="font-semibold text-red-600">{estatisticas.termos.paralizacoes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recomendações</span>
                  <span className="font-semibold text-green-600">{estatisticas.termos.recomendacoes}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !estatisticas && usuarioSelecionado && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma estatística disponível para este usuário.
        </div>
      )}
    </div>
  );
};

export default DetalhamentoPorUsuario;
