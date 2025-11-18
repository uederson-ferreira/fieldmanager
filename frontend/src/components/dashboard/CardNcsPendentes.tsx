import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { lvAPI } from '../../lib/lvAPI';
import Modal from '../common/Modal';
import FormAcaoCorretiva from '../acoes/FormAcaoCorretiva';

interface NCPendente {
  id: string;
  lv_id: string;
  item_codigo: string;
  item_pergunta: string;
  observacao: string;
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  prazo_dias: number;
  dias_desde_nc: number;
  atrasada: boolean;
  lvs: {
    id: string;
    tipo_lv: string;
    numero_sequencial: number;
    nome_lv: string;
    data_inspecao: string;
    area: string;
    usuario_nome: string;
  };
}

interface DadosNCs {
  total: number;
  atrasadas: number;
  criticas: number;
  ncs: NCPendente[];
}

/**
 * Card para mostrar NCs pendentes (sem ação corretiva) no Dashboard
 * Mostra total, atrasadas, críticas e lista as mais urgentes
 */
const CardNcsPendentes: React.FC = () => {
  const [dados, setDados] = useState<DadosNCs | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [ncSelecionada, setNcSelecionada] = useState<NCPendente | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro(null);

      const response = await lvAPI.getNcsPendentes();

      if (response.success && response.data) {
        setDados(response.data);
      } else {
        setErro(response.error || 'Erro ao carregar NCs pendentes');
      }
    } catch (error) {
      console.error('Erro ao carregar NCs pendentes:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  }

  function getCriticidadeCor(criticidade: string) {
    switch (criticidade) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  }

  function handleClickNC(nc: NCPendente) {
    setNcSelecionada(nc);
    setMostrarModal(true);
  }

  function handleAcaoCriada(acaoId: string) {
    setMostrarModal(false);
    setNcSelecionada(null);

    // Recarregar dados para atualizar a lista
    carregarDados();

    // Perguntar se deseja visualizar a ação criada
    const visualizar = window.confirm(
      '✅ Ação corretiva criada com sucesso!\n\nDeseja visualizar agora?'
    );

    if (visualizar) {
      // Navegar para a página de detalhes da ação
      window.location.href = `/acoes-corretivas/${acaoId}`;
    }
  }

  function handleFecharModal() {
    setMostrarModal(false);
    setNcSelecionada(null);
  }

  if (carregando) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="text-center text-red-600 py-4">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{erro}</p>
        </div>
      </div>
    );
  }

  if (!dados || dados.total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">NCs Pendentes</h3>
            <p className="text-sm text-gray-600">Nenhuma NC sem ação corretiva</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-green-600 font-medium">✅ Todas as NCs têm ação corretiva!</p>
        </div>
      </div>
    );
  }

  const ncsParaMostrar = expandido ? dados.ncs : dados.ncs.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${dados.atrasadas > 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
              <AlertTriangle className={`h-6 w-6 ${dados.atrasadas > 0 ? 'text-red-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">NCs Pendentes</h3>
              <p className="text-sm text-gray-600">Sem ação corretiva criada</p>
            </div>
          </div>
          <button
            onClick={carregarDados}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Atualizar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{dados.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{dados.atrasadas}</div>
            <div className="text-xs text-red-700">Atrasadas</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{dados.criticas}</div>
            <div className="text-xs text-orange-700">Críticas</div>
          </div>
        </div>
      </div>

      {/* Lista de NCs */}
      <div className="divide-y divide-gray-200">
        {ncsParaMostrar.map((nc) => (
          <div
            key={nc.id}
            onClick={() => handleClickNC(nc)}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Clique para criar ação corretiva"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getCriticidadeCor(nc.criticidade)}`}>
                    {nc.criticidade.toUpperCase()}
                  </span>
                  {nc.atrasada && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atrasada
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    há {nc.dias_desde_nc} dia(s)
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {nc.item_codigo} - {nc.item_pergunta}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  LV-{String(nc.lvs.numero_sequencial).padStart(4, '0')} - {nc.lvs.area} ({nc.lvs.usuario_nome})
                </p>
                {nc.observacao && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    "{nc.observacao}"
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Botão Ver Mais */}
      {dados.ncs.length > 3 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandido(!expandido);
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expandido ? 'Ver menos' : `Ver todas (${dados.ncs.length})`}
          </button>
        </div>
      )}

      {/* Modal para criar ação corretiva */}
      {ncSelecionada && (
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title="🚨 Criar Ação Corretiva para NC"
          size="lg"
        >
          <div className="space-y-4">
            {/* Informações da NC */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    {ncSelecionada.item_codigo} - {ncSelecionada.item_pergunta}
                  </h3>
                  {ncSelecionada.observacao && (
                    <p className="text-sm text-amber-800 mb-2">
                      <strong>Observação:</strong> {ncSelecionada.observacao}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${getCriticidadeCor(ncSelecionada.criticidade)}`}>
                      {ncSelecionada.criticidade.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      Prazo: {ncSelecionada.prazo_dias} dias
                    </span>
                    {ncSelecionada.atrasada && (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Atrasada há {ncSelecionada.dias_desde_nc} dias
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    LV-{String(ncSelecionada.lvs.numero_sequencial).padStart(4, '0')} •
                    {ncSelecionada.lvs.area} •
                    {ncSelecionada.lvs.usuario_nome}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de Ação Corretiva */}
            <FormAcaoCorretiva
              lvId={ncSelecionada.lv_id}
              avaliacaoId={ncSelecionada.id}
              tipoLV={ncSelecionada.lvs.tipo_lv}
              itemCodigo={ncSelecionada.item_codigo}
              itemPergunta={ncSelecionada.item_pergunta}
              descricaoNC={ncSelecionada.observacao || 'Não conformidade detectada'}
              autoCreate={false}
              onSucesso={handleAcaoCriada}
              onCancelar={handleFecharModal}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CardNcsPendentes;
