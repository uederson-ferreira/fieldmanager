// ===================================================================
// DASHBOARD TÉCNICO - FIELDMANAGER v2.0 (MULTI-DOMÍNIO)
// Localização: src/components/TecnicoDashboard.tsx
// ===================================================================

import React, { useState } from 'react';
import {
  Menu, X, LogOut, User, CheckCircle2, AlertTriangle,
  TrendingUp, Clock, Settings, BarChart3, FileCheck, Camera,
  Download, FileText, Loader2 as LoaderIcon
} from 'lucide-react';
import DominioSelector from './common/DominioSelector';
import { NavigationSection } from './common/DynamicNavigation';
import FormularioDinamico from './common/FormularioDinamico';
import DashboardEstatisticas from './common/DashboardEstatisticas';
import FiltrosExecucoes, { type FiltrosState } from './common/FiltrosExecucoes';
import { useMenuTecnico, useMenuItem } from '../hooks/useMenuDinamico';
import { useDominio } from '../contexts/DominioContext';
import { modulosAPI } from '../lib/modulosAPI';
import { execucoesAPI } from '../lib/execucoesAPI';
import { dominiosAPI } from '../lib/dominiosAPI';
import { aplicarFiltros, exportarParaCSV } from '../utils/filtrosExecucoes';
import type { UserData } from '../types/entities';
import type { ModuloCompleto, Execucao } from '../types/dominio';

// ===================================================================
// COMPONENTE: HISTÓRICO DE EXECUÇÕES
// ===================================================================

interface HistoricoExecucoesProps {
  userId: string;
  tenantId: string;
}

const HistoricoExecucoes: React.FC<HistoricoExecucoesProps> = ({ userId, tenantId }) => {
  const [execucoesTodas, setExecucoesTodas] = useState<Execucao[]>([]);
  const [modulos, setModulos] = useState<Array<{ id: string; nome: string }>>([]);
  const [dominios, setDominios] = useState<Array<{ id: string; nome: string; icone: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [execucaoSelecionada, setExecucaoSelecionada] = useState<any | null>(null);
  const [gerandoPDF, setGerandoPDF] = useState<string | null>(null); // ID da execução sendo processada

  // Estado dos filtros
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: '',
    dataInicio: '',
    dataFim: '',
    status: 'todos',
    moduloId: '',
    dominioId: '',
    ordenacao: 'data_desc'
  });

  // Buscar dados iniciais (execuções, módulos, domínios)
  React.useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        console.log('📋 [HistoricoExecucoes] Buscando dados...');
        console.log(`   userId: ${userId}, tenantId: ${tenantId}`);

        // Buscar execuções (todas, sem filtro)
        const resultadoExec = await execucoesAPI.getExecucoes({
          tenantId,
          usuarioId: userId,
          limit: 200,
          offset: 0
        });
        
        console.log(`📊 [HistoricoExecucoes] Resposta da API:`, {
          total: resultadoExec.total,
          dataLength: resultadoExec.data?.length,
          data: resultadoExec.data?.slice(0, 3) // Primeiras 3 para debug
        });
        
        setExecucoesTodas(resultadoExec.data || []);

        // Buscar módulos disponíveis
        const resultadoModulos = await modulosAPI.getModulos({ tenantId });
        setModulos(resultadoModulos.map(m => ({ id: m.id, nome: m.nome })));

        // Buscar domínios disponíveis
        const resultadoDominios = await dominiosAPI.getDominios();
        setDominios(resultadoDominios.map(d => ({ id: d.id, nome: d.nome, icone: d.icone })));

        console.log(`✅ [HistoricoExecucoes] ${resultadoExec.data?.length || 0} execuções carregadas (total no banco: ${resultadoExec.total || 0})`);
      } catch (error) {
        console.error('❌ [HistoricoExecucoes] Erro ao buscar dados:', error);
        setExecucoesTodas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [tenantId, userId]);

  // Aplicar filtros
  const execucoesFiltradas = React.useMemo(() => {
    return aplicarFiltros(execucoesTodas, filtros);
  }, [execucoesTodas, filtros]);

  // Visualizar detalhes
  const handleVerDetalhes = async (id: string) => {
    try {
      console.log('📋 [HistoricoExecucoes] Buscando detalhes da execução:', id);
      const execucaoCompleta = await execucoesAPI.getExecucao(id);
      console.log('✅ [HistoricoExecucoes] Execução completa carregada:', execucaoCompleta.id);
      setExecucaoSelecionada(execucaoCompleta);
      console.log('🔍 [HistoricoExecucoes] Modal deve aparecer agora');
    } catch (error) {
      console.error('❌ [HistoricoExecucoes] Erro ao buscar detalhes:', error);
      alert('Erro ao carregar detalhes da execução');
    }
  };

  // Deletar execução
  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta execução?')) return;

    try {
      await execucoesAPI.deletarExecucao(id);
      setExecucoesTodas(prev => prev.filter(e => e.id !== id));
      alert('✅ Execução deletada com sucesso!');
    } catch (error) {
      console.error('❌ [HistoricoExecucoes] Erro ao deletar:', error);
      alert('Erro ao deletar execução');
    }
  };

  // Gerar PDF direto da lista
  const handleGerarPDF = async (execucao: any) => {
    try {
      setGerandoPDF(execucao.id);
      console.log('📄 [HistoricoExecucoes] Gerando PDF da execução:', execucao.numero_documento);

      // Buscar execução completa se necessário
      let execucaoCompleta = execucao;
      if (!execucao.respostas || !execucao.fotos) {
        console.log('📋 [HistoricoExecucoes] Buscando execução completa para PDF...');
        execucaoCompleta = await execucoesAPI.getExecucao(execucao.id);
      }

      // Importação dinâmica (lazy load) para reduzir bundle
      const { gerarPDFExecucao, downloadPDF } = await import('../lib/pdfExecucoesAPI');

      const resultado = await gerarPDFExecucao(execucaoCompleta, {
        incluirFotos: true,
        incluirCabecalho: true,
        incluirRodape: true,
        titulo: 'Relatório de Execução',
        subtitulo: execucaoCompleta.modulos?.nome
      });

      if (resultado.success && resultado.blob) {
        const nomeArquivo = `execucao_${execucaoCompleta.numero_documento}_${new Date().toISOString().split('T')[0]}.pdf`;
        downloadPDF(resultado.blob, nomeArquivo);
        console.log('✅ [HistoricoExecucoes] PDF baixado:', nomeArquivo);
      } else {
        alert(`Erro ao gerar PDF: ${resultado.error}`);
      }
    } catch (error) {
      console.error('❌ [HistoricoExecucoes] Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGerandoPDF(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Clock className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-gray-600">Carregando execuções...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Execuções</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e busque suas execuções de checklists
          </p>
        </div>
      </div>

      {/* Componente de Filtros */}
      <FiltrosExecucoes
        filtros={filtros}
        onFiltrosChange={setFiltros}
        modulos={modulos}
        dominios={dominios}
        totalExecucoes={execucoesTodas.length}
        execucoesVisiveis={execucoesFiltradas.length}
        onExportar={() => exportarParaCSV(execucoesFiltradas)}
      />

      {/* Lista de Execuções */}
      {execucoesFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma execução encontrada
          </h3>
          <p className="text-gray-500">
            Suas execuções de checklists aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {execucoesFiltradas.map((exec: any) => (
            <div
              key={exec.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {exec.modulos?.nome || 'Módulo Desconhecido'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {exec.numero_documento || 'Sem número'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exec.status === 'concluido'
                      ? 'bg-green-100 text-green-800'
                      : exec.status === 'rascunho'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {exec.status === 'concluido' ? 'Concluído' : exec.status === 'rascunho' ? 'Rascunho' : exec.status}
                </span>
              </div>

              {/* Informações */}
              <div className="space-y-2 mb-4 text-sm">
                {exec.local_atividade && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Local:</span>
                    {exec.local_atividade}
                  </div>
                )}
                {exec.responsavel_tecnico && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Responsável:</span>
                    {exec.responsavel_tecnico}
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(exec.data_execucao).toLocaleString('pt-BR')}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleVerDetalhes(exec.id)}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  Ver Detalhes
                </button>
                <button
                  onClick={() => handleGerarPDF(exec)}
                  disabled={gerandoPDF === exec.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Baixar PDF"
                >
                  {gerandoPDF === exec.id ? (
                    <>
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeletar(exec.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {execucaoSelecionada && (
        <ModalDetalhesExecucao
          execucao={execucaoSelecionada}
          onClose={() => setExecucaoSelecionada(null)}
        />
      )}
    </div>
  );
};

// ===================================================================
// COMPONENTE: MODAL DE DETALHES DA EXECUÇÃO
// ===================================================================

interface ModalDetalhesExecucaoProps {
  execucao: any;
  onClose: () => void;
}

const ModalDetalhesExecucao: React.FC<ModalDetalhesExecucaoProps> = ({ execucao, onClose }) => {
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Log para debug
  React.useEffect(() => {
    console.log('🔍 [ModalDetalhesExecucao] Modal renderizado com execução:', execucao?.id, execucao?.numero_documento);
  }, [execucao]);

  const handleDownloadPDF = async () => {
    try {
      setGerandoPDF(true);
      console.log('📄 [Modal] Iniciando geração de PDF...');

      // Importação dinâmica (lazy load) para reduzir bundle
      const { gerarPDFExecucao, downloadPDF } = await import('../lib/pdfExecucoesAPI');

      console.log('📄 [Modal] Gerando PDF da execução:', execucao.numero_documento);

      // Buscar execução completa se necessário
      let execucaoCompleta = execucao;
      if (!execucao.respostas || !execucao.fotos) {
        console.log('📋 [Modal] Buscando execução completa para PDF...');
        execucaoCompleta = await execucoesAPI.getExecucao(execucao.id);
      }

      const resultado = await gerarPDFExecucao(execucaoCompleta, {
        incluirFotos: true,
        incluirCabecalho: true,
        incluirRodape: true,
        titulo: 'Relatório de Execução',
        subtitulo: execucaoCompleta.modulos?.nome
      });

      if (resultado.success && resultado.blob) {
        const nomeArquivo = `execucao_${execucaoCompleta.numero_documento}_${new Date().toISOString().split('T')[0]}.pdf`;
        downloadPDF(resultado.blob, nomeArquivo);
        console.log('✅ [Modal] PDF baixado:', nomeArquivo);
      } else {
        console.error('❌ [Modal] Erro ao gerar PDF:', resultado.error);
        alert(`Erro ao gerar PDF: ${resultado.error}`);
      }
    } catch (error) {
      console.error('❌ [Modal] Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{execucao.modulos?.nome || 'Execução'}</h2>
            <p className="text-emerald-100 mt-1">{execucao.numero_documento}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Informações Gerais */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Data:</span>{' '}
                <span className="text-gray-600">
                  {new Date(execucao.data_execucao).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  execucao.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {execucao.status}
                </span>
              </div>
              {execucao.local_atividade && (
                <div>
                  <span className="font-medium text-gray-700">Local:</span>{' '}
                  <span className="text-gray-600">{execucao.local_atividade}</span>
                </div>
              )}
              {execucao.responsavel_tecnico && (
                <div>
                  <span className="font-medium text-gray-700">Responsável:</span>{' '}
                  <span className="text-gray-600">{execucao.responsavel_tecnico}</span>
                </div>
              )}
            </div>
          </div>

          {/* Respostas */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Respostas ({execucao.respostas?.length || 0})
            </h3>
            <div className="space-y-3">
              {execucao.respostas && execucao.respostas.length > 0 ? (
                execucao.respostas.map((resposta: any, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{resposta.pergunta?.pergunta || 'Pergunta não encontrada'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {resposta.pergunta_codigo} • {resposta.pergunta?.categoria}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                          resposta.resposta === 'C'
                            ? 'bg-green-100 text-green-800'
                            : resposta.resposta === 'NC'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {resposta.resposta === 'C' ? 'Conforme' : resposta.resposta === 'NC' ? 'Não Conforme' : 'N/A'}
                      </span>
                    </div>
                    {resposta.observacao && (
                      <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-gray-300">
                        {resposta.observacao}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma resposta registrada</p>
              )}
            </div>
          </div>

          {/* Fotos */}
          {(() => {
            // Suportar ambos os formatos: novo (campos_customizados.fotos) e antigo (execucao.fotos)
            const fotos = execucao.campos_customizados?.fotos || execucao.fotos || [];

            if (fotos.length === 0) return null;

            return (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-gray-700" />
                  Fotos ({fotos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fotos.map((foto: any, index: number) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:border-emerald-500 transition-colors">
                        <img
                          src={foto.url || foto.url_arquivo}
                          alt={foto.descricao || foto.nome || 'Foto da execução'}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(foto.url || foto.url_arquivo, '_blank')}
                        />
                      </div>
                      {/* Info overlay */}
                      {(foto.pergunta_codigo || foto.descricao) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {foto.pergunta_codigo && (
                            <p className="text-xs font-medium text-white">{foto.pergunta_codigo}</p>
                          )}
                          {foto.descricao && (
                            <p className="text-xs text-gray-200 truncate">{foto.descricao}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <button
            onClick={handleDownloadPDF}
            disabled={gerandoPDF}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gerandoPDF ? (
              <>
                <LoaderIcon className="h-5 w-5 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Baixar PDF
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL: TÉCNICO DASHBOARD
// ===================================================================

interface TecnicoDashboardProps {
  user: UserData;
  onLogout: () => void;
  loginInfo: {
    method: 'supabase' | 'demo' | null;
    isSupabase: boolean;
    isDemo: boolean;
    source: string;
  };
}

const TecnicoDashboard: React.FC<TecnicoDashboardProps> = ({ user, onLogout, loginInfo }) => {
  // Hooks do sistema multi-domínio
  const menuSections = useMenuTecnico();
  const { dominioAtual, modulosDisponiveis } = useDominio();

  // State local
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [execucoesRecentes, setExecucoesRecentes] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [moduloCompleto, setModuloCompleto] = useState<ModuloCompleto | null>(null);
  const [loadingModulo, setLoadingModulo] = useState(false);

  // Buscar item de menu atual
  const currentMenuItem = useMenuItem(menuSections, activeSection);

  // Buscar execuções recentes
  React.useEffect(() => {
    const fetchExecucoes = async () => {
      try {
        const token = localStorage.getItem('ecofield_auth_token');

        if (!token) {
          console.error('❌ Token não encontrado');
          setStatsLoading(false);
          return;
        }

        // TODO: Implementar endpoint de execuções recentes
        // Por enquanto, usar dados mockados
        setExecucoesRecentes([
          { tipo: 'NR-35', status: 'concluida', data: '2 horas atrás', usuario: user.nome },
          { tipo: 'Checklist Ambiental', status: 'pendente', data: '5 horas atrás', usuario: user.nome }
        ]);
        setStatsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar execuções recentes:', error);
        setStatsLoading(false);
      }
    };

    if (activeSection === 'dashboard') {
      fetchExecucoes();
    }
  }, [activeSection, user.nome]);

  // ===================================================================
  // RENDERIZAÇÃO DE MÓDULOS DINÂMICOS
  // ===================================================================

  // Carregar módulo completo quando necessário
  React.useEffect(() => {
    const loadModulo = async () => {
      // Se não está em uma seção de módulo, limpar estado
      if (!activeSection.startsWith('modulo_')) {
        setModuloCompleto(null);
        return;
      }

      const moduleId = activeSection.replace('modulo_', '');
      setLoadingModulo(true);

      try {
        console.log('📋 [TecnicoDashboard] Carregando módulo completo:', moduleId);
        const moduloComPerguntas = await modulosAPI.getModuloCompleto(moduleId);
        setModuloCompleto(moduloComPerguntas);
        console.log('✅ [TecnicoDashboard] Módulo carregado:', moduloComPerguntas.nome);
        console.log(`   ${moduloComPerguntas.perguntas.length} perguntas encontradas`);
      } catch (error) {
        console.error('❌ [TecnicoDashboard] Erro ao carregar módulo:', error);
        setModuloCompleto(null);
      } finally {
        setLoadingModulo(false);
      }
    };

    loadModulo();
  }, [activeSection]);

  const renderModuloContent = (moduleId: string) => {
    // Loading state
    if (loadingModulo) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Clock className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando módulo...</p>
        </div>
      );
    }

    // Error state
    if (!moduloCompleto) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Erro ao carregar módulo</p>
          <button
            onClick={() => setActiveSection('dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      );
    }

    // Callbacks para o formulário
    // NOTA: O FormularioDinamico já cria a execução internamente,
    // então estes callbacks são apenas para navegação/mensagem
    const handleSubmit = async (payload: any) => {
      try {
        console.log('✅ [TecnicoDashboard] Execução já foi criada pelo FormularioDinamico, apenas navegando...');
        
        // A execução já foi criada pelo FormularioDinamico
        // Apenas mostrar mensagem e navegar
        // O payload pode conter informações da execução criada
        const numeroDocumento = payload.numero_documento || 'N/A';
        alert(`✅ Execução salva com sucesso!\n\nNúmero do documento: ${numeroDocumento}`);

        // Voltar ao dashboard
        setActiveSection('dashboard');
      } catch (error) {
        console.error('❌ [TecnicoDashboard] Erro ao processar submissão:', error);
        // Não mostrar erro aqui, pois a execução já foi criada
      }
    };

    const handleSaveDraft = async (payload: any) => {
      try {
        console.log('✅ [TecnicoDashboard] Rascunho já foi criado pelo FormularioDinamico');
        // O rascunho já foi criado pelo FormularioDinamico
        // Apenas mostrar mensagem
        alert('💾 Rascunho salvo com sucesso!');
      } catch (error) {
        console.error('❌ [TecnicoDashboard] Erro ao processar rascunho:', error);
        // Não mostrar erro aqui, pois o rascunho já foi criado
      }
    };

    const handleCancel = () => {
      setActiveSection('dashboard');
      setModuloCompleto(null);
    };

    // Renderizar formulário dinâmico
    return (
      <FormularioDinamico
        modulo={moduloCompleto}
        tenantId={user.tenant_id || '00000000-0000-0000-0000-000000000001'}
        usuarioId={user.usuario_id || user.id || ''}
        usuarioNome={user.nome || ''}
        usuarioEmail={user.email || ''}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
      />
    );
  };

  // ===================================================================
  // RENDERIZAR CONTEÚDO
  // ===================================================================

  const renderContent = () => {
    // Verificar se é um módulo dinâmico (ID começa com "modulo_")
    if (activeSection.startsWith('modulo_')) {
      const moduleId = activeSection.replace('modulo_', '');
      return renderModuloContent(moduleId);
    }

    // Rotas estáticas
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Seletor de Domínio */}
            <DominioSelector />

            {/* Header do Dashboard */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Técnico</h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo, {user.nome} - {loginInfo.source}
                </p>
                {dominioAtual && (
                  <p className="text-sm mt-1" style={{ color: dominioAtual.cor_primaria }}>
                    {dominioAtual.icone} {dominioAtual.nome}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>v{import.meta.env.VITE_APP_VERSION || '2.0.0'}</span>
                {import.meta.env.DEV && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    DEV
                  </span>
                )}
              </div>
            </div>

            {/* Dashboard de Estatísticas Dinâmico */}
            <DashboardEstatisticas
              userId={user.usuario_id || user.id || ''}
              tenantId={user.tenant_id || '00000000-0000-0000-0000-000000000001'}
            />
          </div>
        );

      case 'historico':
        return <HistoricoExecucoes userId={user.usuario_id || user.id || ''} tenantId={user.tenant_id || ''} />;

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Settings className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentMenuItem?.label || 'Seção Desconhecida'}
            </h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidade está em desenvolvimento.
            </p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        );
    }
  };

  // ===================================================================
  // RENDER PRINCIPAL
  // ===================================================================

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden w-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">FieldManager</h2>
          {dominioAtual && (
            <span className="text-xs px-2 py-1 rounded-full" style={{
              backgroundColor: `${dominioAtual.cor_primaria}20`,
              color: dominioAtual.cor_primaria
            }}>
              {dominioAtual.nome}
            </span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar - Mobile Overlay / Desktop Fixed */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarOpen ? 'w-64' : 'md:w-16'}
        bg-white shadow-lg flex flex-col
        md:h-screen
      `}>
        {/* Header da Sidebar - Desktop Only */}
        <div className="hidden md:flex p-4 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold text-gray-900">
                FieldManager
                <span className="block text-xs text-gray-500 font-normal">Campo</span>
              </h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu Items - Dinâmico por Domínio */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {sidebarOpen ? (
            // Modo expandido: mostrar seções completas
            menuSections.map((section, sectionIndex) => (
              <NavigationSection
                key={sectionIndex}
                section={section}
                activeItemId={activeSection}
                onItemClick={(itemId) => {
                  setActiveSection(itemId);
                  // Fechar sidebar no mobile após clicar
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              />
            ))
          ) : (
            // Modo compacto: mostrar apenas ícones
            <div className="space-y-1">
              {menuSections.flatMap(section => section.items).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors
                    ${activeSection === item.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User Info e Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
              backgroundColor: dominioAtual?.cor_primaria || '#10b981'
            }}>
              <User className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user.perfil}</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TecnicoDashboard;
