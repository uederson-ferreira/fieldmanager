import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

type EvolucaoMensalItem = {
  mes: string;
  lvs: number;
  termos: number;
  rotinas: number;
  conformidade: number;
};

type ConformidadePorTipoItem = {
  nome: string;
  value: number;
  fill: string;
};

type TermoTipoItem = {
  code: string;
  name: string;
  count: number;
  color?: string;
};

type TermosResumo = {
  total: number;
  notificacoes: number;
  paralizacoes: number;
  recomendacoes: number;
  por_tipo: TermoTipoItem[];
};

type LvResumo = {
  total: number;
  pendentes: number;
  completas: number;
  naoConformes: number;
  conformidadeMedia: number;
};

type RotinaResumo = {
  total: number;
  concluidas: number;
  pendentes: number;
  naoConformes: number;
  tempoMedio: number;
};

type RotinaItem = {
  status?: string;
  total_nao_conformes?: number;
  data_atividade?: string;
  hora_inicio?: string;
  hora_fim?: string;
};

type LvStatsResponse = {
  total?: number;
  pendentes?: number;
  completas?: number;
  naoConformes?: number;
  percentualConformidade?: number;
};

type TermosStatsResponse = {
  total_notificacoes?: number;
  total_paralizacoes?: number;
  total_recomendacoes?: number;
  total?: number;
  por_tipo?: TermoTipoItem[];
};

interface DashboardGerencialProps {
  onNavigateToDetalhamento?: () => void;
}

const DashboardGerencial: React.FC<DashboardGerencialProps> = ({ onNavigateToDetalhamento }) => {
  const [totalProcedimentos, setTotalProcedimentos] = useState<number>(0);
  const [lvResumo, setLvResumo] = useState<LvResumo>({
    total: 0,
    pendentes: 0,
    completas: 0,
    naoConformes: 0,
    conformidadeMedia: 0
  });
  const [rotinasResumo, setRotinasResumo] = useState<RotinaResumo>({
    total: 0,
    concluidas: 0,
    pendentes: 0,
    naoConformes: 0,
    tempoMedio: 0
  });
  const [termosResumo, setTermosResumo] = useState<TermosResumo>({
    total: 0,
    notificacoes: 0,
    paralizacoes: 0,
    recomendacoes: 0,
    por_tipo: []
  });
  const [loading, setLoading] = useState(true);

  const [evolucaoMensalData, setEvolucaoMensalData] = useState<EvolucaoMensalItem[]>([]);
  const [conformidadePorTipo, setConformidadePorTipo] = useState<ConformidadePorTipoItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Pegar token do localStorage (autenticação via backend)
        const token = localStorage.getItem('ecofield_auth_token');

        if (!token) {
          console.error('❌ Token não encontrado');
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Buscar estatísticas via API do backend
        console.log('📡 [DEBUG] Fazendo requisições para:', {
          lvs: `${import.meta.env.VITE_API_URL}/api/estatisticas/lvs`,
          evolucao: `${import.meta.env.VITE_API_URL}/api/estatisticas/evolucao-mensal`,
          conformidade: `${import.meta.env.VITE_API_URL}/api/estatisticas/conformidade-por-tipo`
        });

        const [lvResponse, rotinasResponse, termosResponse, evolucaoResponse, conformidadeResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/lvs`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/rotinas`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/termos/estatisticas`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/evolucao-mensal`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/conformidade-por-tipo`, { headers })
        ]);

        console.log('📡 [DEBUG] Status das respostas:', {
          evolucao: evolucaoResponse.status,
          conformidade: conformidadeResponse.status
        });

        // Processar dados de LVs
        const lvStats: LvStatsResponse = lvResponse.ok ? await lvResponse.json() : {};
        setLvResumo({
          total: lvStats.total || 0,
          pendentes: lvStats.pendentes || 0,
          completas: lvStats.completas || 0,
          naoConformes: lvStats.naoConformes || 0,
          conformidadeMedia: lvStats.percentualConformidade || 0
        });

        // Processar dados de rotinas
        const rotinasData: RotinaItem[] = rotinasResponse.ok ? await rotinasResponse.json() : [];
        const statusConcluidos = ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'];
        const rotinasConcluidas = rotinasData.filter(r => statusConcluidos.includes((r.status || '').toUpperCase())).length;
        const totalNC_Rotinas = rotinasData && rotinasData.length > 0
          ? rotinasData.reduce((acc: number, r) => acc + (r.total_nao_conformes || 0), 0)
          : 0;
        const rotinasComTempo = rotinasData.filter(r => r.hora_inicio && r.hora_fim);
        const tempoMedio = rotinasComTempo.length > 0
          ? Math.round(rotinasComTempo.reduce((acc, rotina) => {
              const inicio = new Date(`2000-01-01T${rotina.hora_inicio}`);
              const fim = new Date(`2000-01-01T${rotina.hora_fim}`);
              return acc + (fim.getTime() - inicio.getTime()) / (1000 * 60);
            }, 0) / rotinasComTempo.length)
          : 0;

        setRotinasResumo({
          total: rotinasData.length,
          concluidas: rotinasConcluidas,
          pendentes: Math.max(rotinasData.length - rotinasConcluidas, 0),
          naoConformes: totalNC_Rotinas,
          tempoMedio
        });

        // Processar dados de termos
        const termosStats: TermosStatsResponse = termosResponse.ok ? await termosResponse.json() : {};

        setTermosResumo({
          total: termosStats.total || 0,
          notificacoes: termosStats.total_notificacoes || 0,
          paralizacoes: termosStats.total_paralizacoes || 0,
          recomendacoes: termosStats.total_recomendacoes || 0,
          por_tipo: Array.isArray(termosStats.por_tipo) ? termosStats.por_tipo : []
        });

        // Processar dados de evolução mensal
        const evolucaoData: EvolucaoMensalItem[] = evolucaoResponse.ok ? await evolucaoResponse.json() : [];
        console.log('📊 [DEBUG] Evolução Mensal recebida:', evolucaoData);
        setEvolucaoMensalData(Array.isArray(evolucaoData) ? evolucaoData : []);

        // Processar dados de conformidade por tipo
        const conformidadeData: ConformidadePorTipoItem[] = conformidadeResponse.ok ? await conformidadeResponse.json() : [];
        console.log('📊 [DEBUG] Conformidade por tipo recebida:', conformidadeData);
        setConformidadePorTipo(Array.isArray(conformidadeData) ? conformidadeData : []);

        const totalCalculado =
          (lvStats.total || 0) +
          rotinasData.length +
          (termosStats.total || 0);
        setTotalProcedimentos(totalCalculado);
        console.log('📊 [DEBUG] Resumo termos:', termosStats);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dados de termos por categoria - dinâmicos se disponíveis, senão usa os valores antigos
  const termosPorCategoria = termosResumo.por_tipo && termosResumo.por_tipo.length > 0
    ? termosResumo.por_tipo.map((tipo) => ({
        name: tipo.name,
        value: tipo.count,
        fill: tipo.color || '#6b7280'
      }))
    : [
        { name: 'Orientação', value: termosResumo.recomendacoes || 0, fill: '#10b981' },
        { name: 'Advertência', value: termosResumo.notificacoes || 0, fill: '#f59e0b' },
        { name: 'Paralização', value: termosResumo.paralizacoes || 0, fill: '#ef4444' },
      ];

  console.log('📊 [DEBUG] termosResumo:', termosResumo);
  console.log('📊 [DEBUG] termosPorCategoria final:', termosPorCategoria);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Gerencial</h1>
        <button
          onClick={onNavigateToDetalhamento}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Detalhamento por Usuário
        </button>
      </div>
      {/* Cards Resumidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-green-50 rounded-lg p-6 text-center shadow">
          <div className="text-3xl font-bold text-green-700 mb-2">{loading ? '...' : totalProcedimentos}</div>
          <div className="text-sm text-green-900">Procedimentos Gerados</div>
          {!loading && (
            <div className="mt-2 text-xs text-green-800">
              {`LVs: ${lvResumo.total} · Rotinas: ${rotinasResumo.total} · Termos: ${termosResumo.total}`}
            </div>
          )}
        </div>
        <div className="bg-blue-50 rounded-lg p-6 text-center shadow">
          <div className="text-3xl font-bold text-blue-700 mb-2">{loading ? '...' : `${lvResumo.conformidadeMedia}%`}</div>
          <div className="text-sm text-blue-900">Conformidade Média das LVs</div>
          {!loading && (
            <div className="mt-2 text-xs text-blue-800">
              {`Completas: ${lvResumo.completas} · Pendentes: ${lvResumo.pendentes}`}
            </div>
          )}
        </div>
        <div className="bg-amber-50 rounded-lg p-6 text-center shadow">
          <div className="text-3xl font-bold text-amber-700 mb-2">{loading ? '...' : termosResumo.total}</div>
          <div className="text-sm text-amber-900">Termos Ambientais Emitidos</div>
          {!loading && (
            <div className="mt-2 text-xs text-amber-700">
              {`Notif.: ${termosResumo.notificacoes} · Paral.: ${termosResumo.paralizacoes} · Recom.: ${termosResumo.recomendacoes}`}
            </div>
          )}
        </div>
        <div className="bg-emerald-50 rounded-lg p-6 text-center shadow">
          <div className="text-3xl font-bold text-emerald-700 mb-2">{loading ? '...' : rotinasResumo.total}</div>
          <div className="text-sm text-emerald-900">Atividades de Rotina</div>
          {!loading && (
            <div className="mt-2 space-y-1 text-xs text-emerald-700">
              <div>{`Concluídas: ${rotinasResumo.concluidas} · Pendentes: ${rotinasResumo.pendentes}`}</div>
              <div>{`Não Conformidades: ${rotinasResumo.naoConformes}`}</div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Evolução Mensal - Stacked Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Evolução Mensal de Atividades</h2>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={250} minWidth={300}>
          <BarChart data={evolucaoMensalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" />
            <YAxis allowDecimals={false} stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="lvs" stackId="a" fill="#10b981" name="Listas de Verificação" />
            <Bar dataKey="rotinas" stackId="a" fill="#3b82f6" name="Atividades de Rotina" />
            <Bar dataKey="termos" stackId="a" fill="#f59e0b" name="Termos Ambientais" />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Conformidade ao Longo do Tempo */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Tendência de Conformidade (%)</h2>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={250} minWidth={300}>
          <AreaChart data={evolucaoMensalData}>
            <defs>
              <linearGradient id="colorConformidade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" stroke="#6b7280" />
            <YAxis domain={[80, 100]} stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value: number) => `${value}%`}
            />
            <Area
              type="monotone"
              dataKey="conformidade"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConformidade)"
              name="Conformidade"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Seção LVs */}
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Indicadores de Listas de Verificação</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-blue-900 mb-4">Resumo Executivo</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Total avaliadas</span>
                <span>{loading ? '...' : lvResumo.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Completas</span>
                <span>{loading ? '...' : lvResumo.completas}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendentes</span>
                <span>{loading ? '...' : lvResumo.pendentes}</span>
              </div>
              <div className="flex justify-between">
                <span>Não conformes</span>
                <span>{loading ? '...' : lvResumo.naoConformes}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Conformidade por Tipo (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={conformidadePorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, value }) => `${nome}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conformidadePorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Ranking de Conformidade por Categoria</h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <BarChart
                  data={conformidadePorTipo}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                  <YAxis dataKey="nome" type="category" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {conformidadePorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Termos */}
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Indicadores de Termos Ambientais</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-amber-900 mb-4">Resumo Executivo</h3>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex justify-between">
                <span>Total emitidos</span>
                <span>{loading ? '...' : termosResumo.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Notificações</span>
                <span>{loading ? '...' : termosResumo.notificacoes}</span>
              </div>
              <div className="flex justify-between">
                <span>Paralizações</span>
                <span>{loading ? '...' : termosResumo.paralizacoes}</span>
              </div>
              <div className="flex justify-between">
                <span>Recomendações</span>
                <span>{loading ? '...' : termosResumo.recomendacoes}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={termosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {termosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Termos Emitidos por Mês</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={evolucaoMensalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="termos" fill="#f59e0b" name="Termos Emitidos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Seção Rotinas */}
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Indicadores de Atividades de Rotina</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-emerald-900 mb-4">Resumo Executivo</h3>
            <div className="space-y-2 text-sm text-emerald-800">
              <div className="flex justify-between">
                <span>Total realizadas</span>
                <span>{loading ? '...' : rotinasResumo.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Concluídas</span>
                <span>{loading ? '...' : rotinasResumo.concluidas}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendentes</span>
                <span>{loading ? '...' : rotinasResumo.pendentes}</span>
              </div>
              <div className="flex justify-between">
                <span>Não conformidades</span>
                <span>{loading ? '...' : rotinasResumo.naoConformes}</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo médio (min)</span>
                <span>{loading ? '...' : rotinasResumo.tempoMedio}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Rotinas por Mês</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={evolucaoMensalData}>
                <defs>
                  <linearGradient id="colorRotinas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#6b7280" />
                <YAxis allowDecimals={false} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="rotinas"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRotinas)"
                  name="Rotinas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardGerencial; 