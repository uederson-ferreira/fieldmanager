// ===================================================================
// CONTAINER PRINCIPAL - LISTA TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/ListaTermosContainer.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import { Wifi } from 'lucide-react';
import { useListaTermos } from '../../hooks/useListaTermos';
import { useLVSyncStatus } from '../../hooks/useLVSyncStatus';
import { ListaTermosEstatisticas } from './ListaTermosEstatisticas';
import { ListaTermosFilters } from './ListaTermosFilters';
import { ListaTermosCards } from './ListaTermosCards';
import { ListaTermosTable } from './ListaTermosTable';
import TermoFormV2 from './TermoFormV2';
import ModalDetalhesTermo from './ModalDetalhesTermo';
import type { UserData } from '../../types/entities';
import { syncTermosAmbientaisOffline } from '../../lib/offline';

interface ListaTermosContainerProps {
  user: UserData;
  onBack?: () => void;
}

export const ListaTermosContainer: React.FC<ListaTermosContainerProps> = ({ user, onBack }) => {
  const {
    // Estados
    estatisticas,
    carregando,
    filtros,
    mostrarFiltros,
    termoSelecionado,
    mostrarDetalhes,
    mostrarNovoTermo,
    loadingSync,
    syncProgress,
    syncMessage,
    assinaturasSelecionadas,
    isOnline,
    termosOfflinePendentes,
    carregarTermos,
    carregarPendentesOffline,
    
    aplicarFiltros,
    limparFiltros,
    visualizarTermo,
    editarTermo,
    handleGerarRelatorio,
    handleExcluirTermo,
    
    // Setters
    setFiltros,
    setMostrarFiltros,
    setTermoSelecionado,
    setMostrarDetalhes,
    setMostrarNovoTermo,
    
    // Utilitários
    getStatusColor,
    getStatusIcon,
    getTipoColor,
    formatarData,
    getNumeroTermoFormatado,
    termosParaExibir
  } = useListaTermos({ user, onBack });

  // ✅ Estados para sincronização manual
  const [sincronizando, setSincronizando] = React.useState(false);
  const [progressoSync, setProgressoSync] = React.useState<{ atual: number; total: number; termoAtual: string } | null>(null);
  const [mensagemSync, setMensagemSync] = React.useState<string>('');

  // ✅ Função para sincronizar termo individual
  const handleSincronizarTermo = async () => {
    if (!isOnline) {
      setMensagemSync('❌ Sem conexão com a internet. Verifique sua conexão.');
      return;
    }

    setSincronizando(true);
    setProgressoSync(null);
    setMensagemSync('🔄 Iniciando sincronização...');

    try {
      const resultado = await syncTermosAmbientaisOffline((atual, total, termoAtual) => {
        setProgressoSync({ atual, total, termoAtual });
      });

      if (resultado.success) {
        setMensagemSync(`✅ Sincronização concluída! ${resultado.sincronizados} termo(s) sincronizado(s).`);
        // Recarregar lista após sincronização
        setTimeout(() => {
          carregarTermos();
          carregarPendentesOffline();
        }, 1000);
      } else {
        setMensagemSync(`❌ Erro na sincronização: ${resultado.error}`);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      setMensagemSync(`❌ Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSincronizando(false);
      setProgressoSync(null);
      // Limpar mensagem após 5 segundos
      setTimeout(() => setMensagemSync(''), 5000);
    }
  };

  // Hook para sincronização
  const { pendingCount, syncing, syncNow } = useLVSyncStatus();

  // ===================================================================
  // 🚀 NAVEGAÇÃO: Se formulário ativo, mostrar apenas o formulário
  // ===================================================================
  if (mostrarNovoTermo) {
    return (
      <TermoFormV2
        modoEdicao={!!termoSelecionado}
        termoParaEditar={termoSelecionado || undefined}
        onSalvar={() => {
          console.log('✅ [NAVEGAÇÃO] Voltando para lista após salvar');
          setMostrarNovoTermo(false);
          setTermoSelecionado(null);
          // Dispara evento para recarregar a lista
          window.dispatchEvent(new Event('termoSalvo'));
        }}
        onCancelar={() => {
          console.log('✅ [NAVEGAÇÃO] Voltando para lista após cancelar');
          setMostrarNovoTermo(false);
          setTermoSelecionado(null);
        }}
      />
    );
  }

  // ===================================================================
  // 📋 LISTA: Se formulário inativo, mostrar apenas a lista
  // ===================================================================
  return (
    <>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full py-4 sm:py-8">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Termos Ambientais
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gerencie e visualize termos ambientais
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Status Online/Offline */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {/* ✅ Botão de Sincronização - MAIS EVIDENTE */}
                  {pendingCount > 0 && (
                    <button
                      onClick={syncNow}
                      disabled={syncing}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all transform hover:scale-105 ${
                        syncing 
                          ? 'bg-blue-400 text-white cursor-not-allowed shadow-lg' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl'
                      }`}
                    >
                      {syncing ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-bold">Sincronizando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="font-bold">🔄 SINCRONIZAR TERMOS ({pendingCount})</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Botão Voltar */}
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar
                  </button>

                  {/* Botão Novo Termo */}
                  <button
                    onClick={() => setMostrarNovoTermo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Novo Termo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de Termos Offline */}
          {termosOfflinePendentes.length > 0 && (
            <div className="bg-yellow-50 border-b border-yellow-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800">
                      {termosOfflinePendentes.length} termo(s) aguardando sincronização
                    </span>
                  </div>
                  {isOnline && (
                    <button
                      onClick={syncNow}
                      disabled={syncing}
                      className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
                    >
                      {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Barra de progresso de sincronização MANUAL */}
          {sincronizando && progressoSync && (
            <div className="w-full flex flex-col items-center my-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <Wifi className="h-5 w-5 text-blue-600 mr-2 animate-pulse" />
                <span className="text-blue-800 font-medium">Sincronizando termo offline...</span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(progressoSync.atual / progressoSync.total) * 100}%` }}
                />
              </div>
              
              <div className="text-center">
                <span className="text-sm text-blue-700">
                  {progressoSync.atual} de {progressoSync.total} termo(s)
                </span>
                <div className="text-xs text-blue-600 mt-1">
                  {progressoSync.termoAtual}
                </div>
              </div>
            </div>
          )}
          
          {/* ✅ Mensagem de sincronização manual */}
          {mensagemSync && (
            <div className={`w-full text-center my-3 p-3 rounded-lg text-sm font-medium ${
              mensagemSync.includes('❌') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : mensagemSync.includes('✅')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {mensagemSync}
            </div>
          )}

          {/* Barra de progresso de sincronização automática (legada) */}
          {loadingSync && syncProgress && (
            <div className="w-full flex flex-col items-center my-2">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                Sincronizando {syncProgress.current} de {syncProgress.total} termo(s)...
              </span>
            </div>
          )}
          
          {/* Mensagem final de sincronização automática (legada) */}
          {syncMessage && (
            <div className={`w-full text-center my-2 text-sm ${
              syncMessage.startsWith('Erro') ? 'text-red-600' : 'text-green-600'
            }`}>
              {syncMessage}
            </div>
          )}

          {/* Estatísticas */}
          <ListaTermosEstatisticas estatisticas={estatisticas} />

          {/* Filtros e Busca */}
          <ListaTermosFilters
            isOnline={isOnline}
            filtros={filtros}
            setFiltros={setFiltros}
            mostrarFiltros={mostrarFiltros}
            setMostrarFiltros={setMostrarFiltros}
            aplicarFiltros={aplicarFiltros}
            limparFiltros={limparFiltros}
          />

          {/* Lista de Termos */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Visualização mobile (cards) */}
            <div className="md:hidden">
              <ListaTermosCards
                termosParaExibir={termosParaExibir}
                carregando={carregando}
                visualizarTermo={visualizarTermo}
                editarTermo={editarTermo}
                handleGerarRelatorio={handleGerarRelatorio}
                handleExcluirTermo={handleExcluirTermo}
                onSincronizarTermo={handleSincronizarTermo}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getTipoColor={getTipoColor}
                formatarData={formatarData}
                getNumeroTermoFormatado={getNumeroTermoFormatado}
              />
            </div>
            
            {/* Visualização desktop (tabela) */}
            <div className="hidden md:block">
              <ListaTermosTable
                termosParaExibir={termosParaExibir}
                carregando={carregando}
                visualizarTermo={visualizarTermo}
                editarTermo={editarTermo}
                handleGerarRelatorio={handleGerarRelatorio}
                handleExcluirTermo={handleExcluirTermo}
                onSincronizarTermo={handleSincronizarTermo}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getTipoColor={getTipoColor}
                formatarData={formatarData}
                getNumeroTermoFormatado={getNumeroTermoFormatado}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODAL DE DETALHES - MANTER COMO MODAL
          =================================================================== */}
      {mostrarDetalhes && termoSelecionado && (
        <ModalDetalhesTermo
          termo={termoSelecionado}
          fotos={termoSelecionado.fotos || []}
          assinaturas={assinaturasSelecionadas}
          aberto={mostrarDetalhes}
          onClose={() => {
            setMostrarDetalhes(false);
            setTermoSelecionado(null);
          }}
        />
      )}
    </>
  );
};