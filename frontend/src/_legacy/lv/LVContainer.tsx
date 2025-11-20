// ===================================================================
// CONTAINER PRINCIPAL UNIFICADO PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/LVContainer.tsx
// ===================================================================

import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useLV } from './hooks/useLV';
import { useLVPhotos } from './hooks/useLVPhotos';
import LVForm from './components/LVForm';
import LVList from './components/LVList';
import LVStats from './components/LVStats';
import ModalCriarAcoesNC from '../acoes/ModalCriarAcoesNC';
import { pluginManager, registerDefaultPlugins } from './plugins';
import type { LVContainerProps, LVBase } from './types/lv';

const LVContainer: React.FC<LVContainerProps> = ({ user, tipo_lv, onBack }) => {
  // Inicializar plugins na primeira renderização
  React.useEffect(() => {
    registerDefaultPlugins();
  }, []);

  const [state, actions] = useLV({ user, tipo_lv, onBack });
  const { fileInputRef } = useLVPhotos('');

  // Estado para modal de ações corretivas
  const [mostrarModalAcoes, setMostrarModalAcoes] = useState(false);
  const [ncsDetectadas, setNcsDetectadas] = useState<any[]>([]);
  const [lvIdComNCs, setLvIdComNCs] = useState<string>('');
  const [tipoLVComNCs, setTipoLVComNCs] = useState<string>('');

  const {
    // Estado
    configuracao,
    lvsRealizados,
    dadosFormulario,
    modoEdicao,
    lvEmEdicao,
    carregando,
    loadingLvs,
    tela
  } = state;

  const {
    // Ações
    setTela,
    setModoEdicao,
    resetarFormulario,
    salvarFormulario,
    visualizarLV,
    editarLV,
    excluirLV,
    gerarPDF,
    carregarLvsRealizados
  } = actions;

  // ===================================================================
  // HANDLERS ESPECÍFICOS
  // ===================================================================

  const handleNovaVerificacao = () => {
    resetarFormulario();
    setTela("formulario");
  };

  const handleSalvar = async () => {
    try {
      // Executar hooks de plugins antes de salvar
      await pluginManager.executeHook('onBeforeSave', tipo_lv, dadosFormulario, configuracao);

      const resultado = await salvarFormulario();

      // Verificar se há NCs detectadas
      if (resultado && resultado.ncsDetectadas > 0) {
        console.log(`🚨 [LVContainer] ${resultado.ncsDetectadas} NC(s) detectada(s), abrindo modal`);
        setLvIdComNCs(resultado.lvId);
        setTipoLVComNCs(resultado.tipoLV);
        setNcsDetectadas(resultado.ncs);
        setMostrarModalAcoes(true);
        return; // Não executar hooks de pós-save ainda
      }

      // Executar hooks de plugins após salvar
      if (lvEmEdicao) {
        await pluginManager.executeHook('onAfterSave', tipo_lv, lvEmEdicao, dadosFormulario);
      }
    } catch (error) {
      console.error('❌ [LVContainer] Erro ao salvar:', error);
    }
  };

  const handleCancelar = () => {
    resetarFormulario();
    setTela("inicio");
  };

  const handleVisualizar = (lv: LVBase) => {
    visualizarLV(lv);
  };

  const handleEditar = async (lv: LVBase) => {
    try {
      await editarLV(lv);
    } catch (error) {
      console.error('❌ [LVContainer] Erro ao editar:', error);
    }
  };

  const handleExcluir = async (lv: LVBase) => {
    // Primeira confirmação: excluir LV
    const confirmarExclusao = window.confirm(
      `Tem certeza que deseja excluir o LV ${lv.numero_lv || lv.numero_sequencial}?\n\n` +
      `Isso excluirá:\n` +
      `- Todos os dados da LV\n` +
      `- Todas as avaliações\n` +
      `- Metadados das fotos\n\n` +
      `Clique em "OK" para continuar ou "Cancelar" para abortar.`
    );

    if (!confirmarExclusao) {
      return; // Usuário cancelou
    }

    // Segunda confirmação: excluir fotos do bucket
    const excluirFotos = window.confirm(
      `Deseja excluir também as fotos do servidor?\n\n` +
      `- Sim: Excluirá todas as fotos físicas do bucket\n` +
      `- Não: Manterá as fotos no servidor (apenas metadados serão excluídos)`
    );

    try {
      await excluirLV(lv, excluirFotos);
    } catch (error) {
      console.error('❌ [LVContainer] Erro ao excluir:', error);
      alert(`Erro ao excluir LV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleGerarPDF = async (lv: LVBase) => {
    try {
      await gerarPDF(lv);
    } catch (error) {
      console.error('❌ [LVContainer] Erro ao gerar PDF:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      // Recarregar dados básicos
      setTela("inicio");
      setModoEdicao(false);
      actions.setLvEmEdicao(null);
    } catch (error) {
      console.error('❌ [LVContainer] Erro ao atualizar:', error);
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO CONDICIONAL
  // ===================================================================

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-x-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-800 font-medium">Carregando configuração...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!configuracao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-x-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro de Configuração</h2>
            <p className="text-gray-600 mb-4">Não foi possível carregar a configuração do LV.</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ===================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200 sticky top-0 z-40">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Botão Voltar */}
            <button
              onClick={onBack}
              className="flex items-center text-green-700 hover:text-green-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Voltar</span>
            </button>

            {/* Título */}
            <div className="flex-1 text-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {modoEdicao ? 'Editar' : 'Novo'} LV {configuracao.numero_lv}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {configuracao.titulo_lv}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loadingLvs}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loadingLvs ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Alertas */}
          {/* Os alertas serão gerenciados pelos plugins */}

          {/* Conteúdo Dinâmico */}
          {tela === "formulario" ? (
            // Formulário de LV (novo ou edição)
            <div className="space-y-6">
              {/* Estatísticas do Formulário */}
              <LVStats
                stats={(() => {
                  // Calcular apenas itens que foram efetivamente avaliados (C, NC ou NA)
                  const avaliacoesValidas = configuracao.itens?.filter(item => {
                    const avaliacao = dadosFormulario.avaliacoes?.[item.id];
                    return avaliacao === "C" || avaliacao === "NC" || avaliacao === "NA";
                  }) || [];
                  
                  const itensAvaliados = avaliacoesValidas.length;
                  const conformes = avaliacoesValidas.filter(item => dadosFormulario.avaliacoes?.[item.id] === "C").length;
                  const naoConformes = avaliacoesValidas.filter(item => dadosFormulario.avaliacoes?.[item.id] === "NC").length;
                  const naoAplicaveis = avaliacoesValidas.filter(item => dadosFormulario.avaliacoes?.[item.id] === "NA").length;
                  const fotos = Object.values(dadosFormulario.fotos || {}).flat().length;
                  const percentualConformidade = itensAvaliados > 0 ? Math.round((conformes / itensAvaliados) * 100) : 0;
                  
                  return {
                    total: itensAvaliados, // Itens efetivamente avaliados, não o total de itens
                    conformes,
                    naoConformes,
                    naoAplicaveis,
                    fotos,
                    percentualConformidade
                  };
                })()}
                totalItens={configuracao.itens?.length || 0}
                showDetails={true}
                className="bg-white rounded-xl shadow-lg"
              />

              {/* Formulário */}
              <LVForm
                dadosFormulario={dadosFormulario}
                setDadosFormulario={actions.setDadosFormulario}
                configuracao={configuracao}
                modoEdicao={modoEdicao}
                carregando={carregando}
                onSalvar={handleSalvar}
                onCancelar={handleCancelar}
              />
            </div>
          ) : (
            // Lista de LVs realizados
            <LVList
              lvsRealizados={lvsRealizados}
              configuracao={configuracao}
              loadingLvs={loadingLvs}
              onVisualizar={handleVisualizar}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
              onGerarPDF={handleGerarPDF}
              onNovoLV={handleNovaVerificacao}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </main>

      {/* Modal de Visualização - Implementado nos plugins */}

      {/* Modal de Criação de Ações Corretivas */}
      {mostrarModalAcoes && ncsDetectadas.length > 0 && (
        <ModalCriarAcoesNC
          isOpen={mostrarModalAcoes}
          onClose={() => setMostrarModalAcoes(false)}
          lvId={lvIdComNCs}
          tipoLV={tipoLVComNCs}
          ncs={ncsDetectadas}
          onTodasAcoesCriadas={() => {
            console.log('✅ [LVContainer] Todas ações criadas, recarregando lista');
            carregarLvsRealizados();
          }}
        />
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </div>
  );
};

export default LVContainer; 