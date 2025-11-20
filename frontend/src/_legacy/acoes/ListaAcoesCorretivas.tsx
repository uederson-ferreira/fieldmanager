import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, Eye, Filter, RefreshCw } from 'lucide-react';
import { listarAcoesCorretivas } from '../../lib/acoesCorretivasAPI';
import type { AcaoCorretivaCompleta, FiltrosAcoes, StatusAcao, Criticidade, StatusPrazo } from '../../types/acoes';
import {
  STATUS_ACAO_LABELS,
  CRITICIDADE_LABELS,
  CRITICIDADE_CORES,
  STATUS_ACAO_CORES,
  STATUS_PRAZO_CORES,
  formatarPrazo
} from '../../types/acoes';
import { useDashboard } from '../dashboard/DashboardProvider';

const ListaAcoesCorretivas: React.FC = () => {
  const { navegarParaDetalhesAcao } = useDashboard();
  const [acoes, setAcoes] = useState<AcaoCorretivaCompleta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [filtros, setFiltros] = useState<FiltrosAcoes>({
    status: undefined,
    criticidade: undefined,
    status_prazo: undefined,
    limite: 20,
    offset: 0
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    carregarAcoes();
  }, [filtros]);

  async function carregarAcoes() {
    try {
      setCarregando(true);
      setErro(null);
      const resultado = await listarAcoesCorretivas(filtros);
      setAcoes(resultado.acoes);
      setTotal(resultado.total);
    } catch (error: any) {
      console.error('Erro ao carregar ações:', error);
      setErro(error.message || 'Erro ao carregar ações corretivas');
    } finally {
      setCarregando(false);
    }
  }

  function alterarFiltro(campo: keyof FiltrosAcoes, valor: any) {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor === '' ? undefined : valor,
      offset: 0 // Resetar para primeira página
    }));
  }

  function limparFiltros() {
    setFiltros({
      status: undefined,
      criticidade: undefined,
      status_prazo: undefined,
      limite: 20,
      offset: 0
    });
  }

  function getBadgeStatus(status: StatusAcao) {
    const cores = STATUS_ACAO_CORES[status];
    const icons = {
      'aberta': <AlertCircle className="w-4 h-4" />,
      'em_andamento': <Clock className="w-4 h-4" />,
      'aguardando_validacao': <Clock className="w-4 h-4" />,
      'concluida': <CheckCircle className="w-4 h-4" />,
      'cancelada': <XCircle className="w-4 h-4" />
    };

    return { cores, icone: icons[status] };
  }

  if (carregando && acoes.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Carregando ações corretivas...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">⚠️ {erro}</p>
        <button
          onClick={carregarAcoes}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ações Corretivas</h2>
          <p className="text-sm text-gray-600">{total} ações encontradas</p>
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filtros.status || ''}
                onChange={(e) => alterarFiltro('status', e.target.value as StatusAcao)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_ACAO_LABELS).map(([valor, label]) => (
                  <option key={valor} value={valor}>{label}</option>
                ))}
              </select>
            </div>

            {/* Criticidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Criticidade
              </label>
              <select
                value={filtros.criticidade || ''}
                onChange={(e) => alterarFiltro('criticidade', e.target.value as Criticidade)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Todas</option>
                {Object.entries(CRITICIDADE_LABELS).map(([valor, label]) => (
                  <option key={valor} value={valor}>{label}</option>
                ))}
              </select>
            </div>

            {/* Status do Prazo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situação do Prazo
              </label>
              <select
                value={filtros.status_prazo || ''}
                onChange={(e) => alterarFiltro('status_prazo', e.target.value as StatusPrazo)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="atrasada">Atrasadas</option>
                <option value="proxima_vencer">Próximas do Vencimento</option>
                <option value="no_prazo">No Prazo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={limparFiltros}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Limpar
            </button>
            <button
              onClick={carregarAcoes}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {acoes.map((acao) => {
          const badgeStatus = getBadgeStatus(acao.status);
          const coresCriticidade = CRITICIDADE_CORES[acao.criticidade];
          const coresPrazo = STATUS_PRAZO_CORES[acao.status_prazo];

          return (
            <div
              key={acao.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-gray-200"
            >
              {/* Cabeçalho */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Criticidade */}
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${coresCriticidade.bg} ${coresCriticidade.text}`}>
                      {CRITICIDADE_LABELS[acao.criticidade]}
                    </span>

                    {/* Status */}
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${badgeStatus.cores.bg} ${badgeStatus.cores.text}`}>
                      {badgeStatus.icone}
                      {STATUS_ACAO_LABELS[acao.status]}
                    </span>

                    {/* Prazo */}
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${coresPrazo.bg} ${coresPrazo.text}`}>
                      {formatarPrazo(acao.status_prazo, acao.dias_ate_prazo)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {acao.item_codigo} - {acao.item_pergunta}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {acao.nome_lv} • {acao.lv_area} • {new Date(acao.data_inspecao || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <button
                  onClick={() => navegarParaDetalhesAcao(acao.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  title="Ver detalhes e gerenciar status"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* NC */}
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-3">
                <p className="text-xs font-semibold text-red-800 mb-1">Não Conformidade:</p>
                <p className="text-sm text-red-700">{acao.descricao_nc}</p>
              </div>

              {/* Ação Proposta */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-3">
                <p className="text-xs font-semibold text-blue-800 mb-1">Ação Corretiva:</p>
                <p className="text-sm text-blue-700">{acao.acao_proposta}</p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-3">
                <div className="flex gap-4">
                  <div>
                    <span className="font-medium">Responsável:</span>{' '}
                    {acao.responsavel_nome || 'Não atribuído'}
                  </div>
                  <div>
                    <span className="font-medium">Prazo:</span>{' '}
                    {new Date(acao.prazo_atual).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Evidências:</span> {acao.qtd_evidencias}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem se vazio */}
      {acoes.length === 0 && !carregando && (
        <div className="text-center p-12 bg-white rounded-lg border">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Nenhuma ação corretiva encontrada.</p>
          <button
            onClick={limparFiltros}
            className="mt-4 text-emerald-600 hover:text-emerald-700 underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Paginação */}
      {total > (filtros.limite || 20) && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => alterarFiltro('offset', Math.max(0, (filtros.offset || 0) - (filtros.limite || 20)))}
            disabled={(filtros.offset || 0) === 0}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-600">
            Mostrando {(filtros.offset || 0) + 1} - {Math.min((filtros.offset || 0) + (filtros.limite || 20), total)} de {total}
          </span>
          <button
            onClick={() => alterarFiltro('offset', (filtros.offset || 0) + (filtros.limite || 20))}
            disabled={(filtros.offset || 0) + (filtros.limite || 20) >= total}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};

export default ListaAcoesCorretivas;
