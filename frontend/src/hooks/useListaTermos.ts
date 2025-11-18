// ===================================================================
// HOOK CUSTOMIZADO - LISTA TERMOS - ECOFIELD SYSTEM
// Localização: src/hooks/useListaTermos.ts
// Módulo: Lógica principal da lista de termos
// ===================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { termosAPI } from '../lib/termosAPI';
import { getTermosAmbientaisOffline } from '../lib/offline';
import type { TermoAmbiental, TermoFoto } from '../types/termos';
import type { UserData } from '../types/entities';

// Tipo local para termos offline (IndexedDB pode retornar numero_sequencial como string)
type TermoAmbientalOffline = TermoAmbiental & { 
  numero_sequencial?: number | string;
  uuid?: string; // Campo para controle de sincronização offline
};

interface UseListaTermosProps {
  user: UserData;
  onBack?: () => void;
}

interface UseListaTermosReturn {
  // Estados principais
  termos: TermoAmbiental[];
  termosOffline: unknown[];
  estatisticas: any | null;
  carregando: boolean;
  filtros: {
    tipo_termo: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    busca_texto: string;
  };
  mostrarFiltros: boolean;
  termoSelecionado: TermoAmbiental | null;
  mostrarDetalhes: boolean;
  mostrarNovoTermo: boolean;
  loadingSync: boolean;
  syncProgress: {current: number, total: number} | null;
  syncMessage: string | null;
  fotosSelecionadas: TermoFoto[];
  assinaturasSelecionadas: { assinatura_emitente?: string, assinatura_responsavel_area?: string } | undefined;
  
  // Estados de sincronização
  isOnline: boolean;
  termosOfflinePendentes: unknown[];
  
  // Ações principais
  carregarTermos: () => Promise<void>;
  carregarPendentesOffline: () => Promise<void>;
  handleTermoSalvo: (event: Event) => void;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
  visualizarTermo: (id: string) => Promise<void>;
  editarTermo: (termo: TermoAmbiental | TermoAmbientalOffline) => void;
  handleGerarRelatorio: (termo: TermoAmbiental) => Promise<void>;
  handleExcluirTermo: (termo: TermoAmbiental) => Promise<void>;
  
  // Setters
  setFiltros: React.Dispatch<React.SetStateAction<{
    tipo_termo: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    busca_texto: string;
  }>>;
  setMostrarFiltros: React.Dispatch<React.SetStateAction<boolean>>;
  setTermoSelecionado: React.Dispatch<React.SetStateAction<TermoAmbiental | null>>;
  setMostrarDetalhes: React.Dispatch<React.SetStateAction<boolean>>;
  setMostrarNovoTermo: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Utilitários
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  getTipoColor: (tipo: string) => string;
  formatarData: (data: string) => string;
  getNumeroTermoFormatado: (tipo: string, numero?: number | string) => string;
  termosParaExibir: (TermoAmbiental | TermoAmbientalOffline)[];
}

export const useListaTermos = ({ user }: UseListaTermosProps): UseListaTermosReturn => {
  const isOnline = useOnlineStatus();
  const [termos, setTermos] = useState<TermoAmbiental[]>([]);
  const [termosOffline, setTermosOffline] = useState<unknown[]>([]);
  const [estatisticas] = useState<any | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo_termo: 'TODOS',
    status: 'TODOS',
    data_inicio: '',
    data_fim: '',
    busca_texto: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [termoSelecionado, setTermoSelecionado] = useState<TermoAmbiental | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [mostrarNovoTermo, setMostrarNovoTermo] = useState(false);
  const [loadingSync] = useState(false);
  const [syncProgress] = useState<{current: number, total: number} | null>(null);
  const [syncMessage] = useState<string | null>(null);
  const [fotosSelecionadas] = useState<TermoFoto[]>([]);
  const [assinaturasSelecionadas] = useState<{ assinatura_emitente?: string, assinatura_responsavel_area?: string } | undefined>(undefined);
  const [termosOfflinePendentes, setTermosOfflinePendentes] = useState<unknown[]>([]);

  // Carregar termos
  const carregarTermos = useCallback(async () => {
    try {
      setCarregando(true);
      
      if (isOnline) {
        console.log('🌐 [LISTA TERMOS] Carregando termos do usuário:', user.nome);
        
        const response = await termosAPI.listarTermos({
          status: filtros.status,
          data_inicio: filtros.data_inicio,
          data_fim: filtros.data_fim
        });
        
        if (response.success && response.data) {
          console.log('📊 [LISTA TERMOS] Termos carregados:', response.data.length);
          setTermos(response.data as any);
        } else {
          console.error('❌ [LISTA TERMOS] Erro ao carregar termos:', response.error);
          setTermos([]);
        }
      } else {
        console.log('📱 [LISTA TERMOS] Carregando termos offline...');
        console.log('📱 [LISTA TERMOS] User ID para filtro:', user.id);
        const dadosOffline = await getTermosAmbientaisOffline();
        console.log('📱 [LISTA TERMOS] Dados offline brutos:', dadosOffline);
        
        const termosDoUsuario = dadosOffline.filter((t: any) => {
          const ehDoUsuario = t.emitido_por_usuario_id === user.id;
          console.log(`📱 [LISTA TERMOS] Termo ${t.id}: emitido_por_usuario_id=${t.emitido_por_usuario_id}, user.id=${user.id}, match=${ehDoUsuario}`);
          return ehDoUsuario;
        });
        
        console.log('📱 [LISTA TERMOS] Termos offline encontrados:', termosDoUsuario.length);
        setTermosOffline(termosDoUsuario);
        // ✅ CORREÇÃO: Definir também o estado termos para exibição offline
        setTermos(termosDoUsuario as any);
      }
    } catch (error) {
      console.error('❌ [LISTA TERMOS] Erro ao carregar termos:', error);
      setTermos([]);
    } finally {
      setCarregando(false);
    }
  }, [isOnline, user.id, user.nome, filtros.status, filtros.data_inicio, filtros.data_fim]);

  // Carregar pendentes offline
  const carregarPendentesOffline = useCallback(async () => {
    try {
      const dadosOffline = await getTermosAmbientaisOffline();
      console.log('📱 [LISTA TERMOS] Dados offline brutos:', dadosOffline.length);
      
      // ✅ DEBUG: Verificar estrutura completa de cada termo
      dadosOffline.forEach((t: any, index: number) => {
        console.log(`📱 [LISTA TERMOS] Termo ${index + 1} - Estrutura completa:`, {
          id: t.id,
          emitido_por_usuario_id: t.emitido_por_usuario_id,
          user_id: user.id,
          offline: t.offline,
          sincronizado: t.sincronizado,
          // Verificar se há campos extras ou problemas
          campos_extras: Object.keys(t).filter(key => !['id', 'emitido_por_usuario_id', 'offline', 'sincronizado'].includes(key))
        });
      });
      
      // ✅ CORREÇÃO: Filtro mais robusto para termos do usuário atual
      const pendentes = dadosOffline.filter((t: any) => {
        // Verificar se o termo pertence ao usuário atual
        const ehDoUsuario = t.emitido_por_usuario_id === user.id;
        
        // Verificar se é offline e não sincronizado
        const ehOffline = t.offline === true;
        const naoSincronizado = t.sincronizado === false;
        
        // Log detalhado para debug
        console.log(`📱 [LISTA TERMOS] Filtro termo ${t.id}:`, {
          emitido_por_usuario_id: t.emitido_por_usuario_id,
          user_id: user.id,
          usuario: ehDoUsuario,
          offline: ehOffline,
          sincronizado: t.sincronizado,
          naoSincronizado: naoSincronizado,
          resultado: ehDoUsuario && ehOffline && naoSincronizado
        });
        
        // ✅ Retornar apenas termos do usuário atual que são offline e não sincronizados
        return ehDoUsuario && ehOffline && naoSincronizado;
      });
      
      console.log('📱 [LISTA TERMOS] Termos filtrados para usuário atual:', pendentes.length);
      setTermosOfflinePendentes(pendentes);
      
      // ✅ DEBUG: Verificar se há termos com dados incorretos
      const termosComProblemas = dadosOffline.filter((t: any) => {
        return !t.emitido_por_usuario_id || 
               t.emitido_por_usuario_id === '' || 
               t.emitido_por_usuario_id !== user.id;
      });
      
      if (termosComProblemas.length > 0) {
        console.warn('⚠️ [LISTA TERMOS] Termos com problemas encontrados:', termosComProblemas.length);
        termosComProblemas.forEach((t: any) => {
          console.warn('⚠️ [LISTA TERMOS] Termo problemático:', {
            id: t.id,
            emitido_por_usuario_id: t.emitido_por_usuario_id,
            user_id: user.id,
            problema: !t.emitido_por_usuario_id ? 'emitido_por_usuario_id undefined/null' : 
                     t.emitido_por_usuario_id === '' ? 'emitido_por_usuario_id vazio' : 
                     'emitido_por_usuario_id diferente do usuário atual'
          });
        });
      }
      
    } catch (error) {
      console.error('❌ [LISTA TERMOS] Erro ao carregar pendentes offline:', error);
      setTermosOfflinePendentes([]);
    }
  }, [user.id]);

  // ✅ FUNÇÃO DE LIMPEZA: Remover termos com dados incorretos

  // Handle termo salvo
  const handleTermoSalvo = useCallback(() => {
    console.log('✅ [LISTA TERMOS] Termo salvo, recarregando lista...');
    carregarTermos();
    carregarPendentesOffline();
    setMostrarNovoTermo(false);
  }, [carregarTermos, carregarPendentesOffline]);

  // Aplicar filtros
  const aplicarFiltros = useCallback(() => {
    carregarTermos();
  }, [carregarTermos]);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros({
      tipo_termo: 'TODOS',
      status: 'TODOS',
      data_inicio: '',
      data_fim: '',
      busca_texto: ''
    });
  }, []);

  // Utilitários
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-orange-100 text-orange-800';
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800';
      case 'CORRIGIDO':
        return 'bg-green-100 text-green-800';
      case 'LIBERADO':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'clock';
      case 'EM_ANDAMENTO':
        return 'alert-triangle';
      case 'CORRIGIDO':
        return 'check-circle';
      case 'LIBERADO':
        return 'check-circle';
      default:
        return 'clock';
    }
  }, []);

  const getTipoColor = useCallback((tipo: string) => {
    switch (tipo) {
      case 'PARALIZACAO_TECNICA':
        return 'bg-red-100 text-red-800';
      case 'NOTIFICACAO':
        return 'bg-yellow-100 text-yellow-800';
      case 'RECOMENDACAO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatarData = useCallback((data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  }, []);

  const getNumeroTermoFormatado = useCallback((tipo: string, numero?: number | string) => {
    if (!numero) return 'N/A';
            const prefixo = tipo === 'PARALIZACAO_TECNICA' ? 'PT' : tipo === 'NOTIFICACAO' ? 'NT' : 'RC';
    return `${prefixo}-${String(numero).padStart(4, '0')}`;
  }, []);

  // Visualizar termo
  const visualizarTermo = useCallback(async (id: string) => {
    try {
      console.log('📄 [LISTA TERMOS] Visualizando termo:', id);
      
      // ✅ BUSCAR termo completo da API
      const response = await termosAPI.buscarTermo(id);
      
      if (response.success && response.data) {
        console.log('✅ [LISTA TERMOS] Termo carregado para visualização:', response.data);
        console.log('✅ [LISTA TERMOS] Fotos do termo:', (response.data as any).termos_fotos);
        
        // ✅ DEFINIR termo selecionado e abrir modal
        setTermoSelecionado(response.data);
        setMostrarDetalhes(true);
      } else {
        console.error('❌ [LISTA TERMOS] Erro ao carregar termo para visualização:', response.error);
        alert('Erro ao carregar dados do termo: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [LISTA TERMOS] Erro ao visualizar termo:', error);
      alert('Erro ao carregar dados do termo');
    }
  }, []);

  // Gerar PDF - MESMA IMPLEMENTAÇÃO DO MODAL
  const handleGerarRelatorio = useCallback(async (termo: TermoAmbiental) => {
    try {
      console.log('📄 [LISTA TERMOS] Gerando PDF para termo:', termo.id);
      console.log('🔍 [LISTA TERMOS] Usando MESMA implementação do modal');
      
      // Buscar termo completo com fotos
      const response = await termosAPI.buscarTermo(termo.id);
      if (!response.success || !response.data) {
        throw new Error('Erro ao carregar dados do termo');
      }
      
      const termoCompleto = response.data;
      const fotos = (termoCompleto as any).termos_fotos || [];
      
      // Importar dependências
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Criar estilos CSS específicos para desktop
      const estilosDesktop = document.createElement('style');
      estilosDesktop.id = 'estilos-pdf-desktop-lista';
      estilosDesktop.textContent = `
        .pdf-desktop-style * {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        .pdf-desktop-style {
          width: 1200px !important;
          min-width: 1200px !important;
          max-width: 1200px !important;
          background-color: #ffffff !important;
          font-family: Arial, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          color: #000 !important;
        }
        
        .pdf-desktop-style .grid { display: grid !important; }
        .pdf-desktop-style .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
        .pdf-desktop-style .grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
        .pdf-desktop-style .gap-4 { gap: 16px !important; }
        .pdf-desktop-style .gap-6 { gap: 24px !important; }
        .pdf-desktop-style .flex { display: flex !important; }
        .pdf-desktop-style .items-center { align-items: center !important; }
        .pdf-desktop-style .justify-center { justify-content: center !important; }
        .pdf-desktop-style .justify-between { justify-content: space-between !important; }
        .pdf-desktop-style .text-center { text-align: center !important; }
        .pdf-desktop-style .font-bold { font-weight: bold !important; }
        .pdf-desktop-style .mb-4 { margin-bottom: 16px !important; }
        .pdf-desktop-style .mb-6 { margin-bottom: 24px !important; }
        .pdf-desktop-style .mb-8 { margin-bottom: 32px !important; }
        .pdf-desktop-style .p-4 { padding: 16px !important; }
        .pdf-desktop-style .p-5 { padding: 20px !important; }
        .pdf-desktop-style .rounded-lg { border-radius: 8px !important; }
        .pdf-desktop-style .border { border: 1px solid #e5e7eb !important; }
        .pdf-desktop-style img { max-width: 100% !important; height: auto !important; }
      `;

      document.head.appendChild(estilosDesktop);

      // Criar elementos temporários para as duas páginas
      const pagina1Element = document.createElement('div');
      pagina1Element.id = 'termo-pagina-1-pdf-lista';
      pagina1Element.className = 'pdf-desktop-style';
      pagina1Element.style.position = 'absolute';
      pagina1Element.style.left = '-9999px';
      pagina1Element.style.top = '0';
      pagina1Element.style.width = '1200px';
      pagina1Element.style.background = 'white';
      pagina1Element.style.padding = '40px';
      pagina1Element.style.fontFamily = 'Arial, sans-serif';
      pagina1Element.style.fontSize = '14px';
      pagina1Element.style.lineHeight = '1.5';
      pagina1Element.style.color = '#000';
      pagina1Element.style.minHeight = '900px';

      const pagina2Element = document.createElement('div');
      pagina2Element.id = 'termo-pagina-2-pdf-lista';
      pagina2Element.className = 'pdf-desktop-style';
      pagina2Element.style.position = 'absolute';
      pagina2Element.style.left = '-9999px';
      pagina2Element.style.top = '0';
      pagina2Element.style.width = '1200px';
      pagina2Element.style.background = 'white';
      pagina2Element.style.padding = '40px';
      pagina2Element.style.fontFamily = 'Arial, sans-serif';
      pagina2Element.style.fontSize = '14px';
      pagina2Element.style.lineHeight = '1.5';
      pagina2Element.style.color = '#000';
      pagina2Element.style.minHeight = '900px';

      // Configurações
      const statusConfig = {
        PENDENTE: { label: 'PENDENTE', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
        EM_ANDAMENTO: { label: 'EM ANDAMENTO', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
        CORRIGIDO: { label: 'CORRIGIDO', color: 'bg-green-100 text-green-800', icon: '✅' },
        LIBERADO: { label: 'LIBERADO', color: 'bg-purple-100 text-purple-800', icon: '🔓' },
        CANCELADO: { label: 'CANCELADO', color: 'bg-gray-100 text-gray-800', icon: '❌' },
      };

      const tipoConfig = {
        PARALIZACAO: { label: 'Paralização Técnica', icon: '🛑', color: 'from-red-500 to-red-600' },
        NOTIFICACAO: { label: 'Notificação', icon: '⚠️', color: 'from-orange-500 to-orange-600' },
        RECOMENDACAO: { label: 'Recomendação', icon: '💡', color: 'from-blue-500 to-blue-600' },
      };

      const severidadeConfig = {
        MA: { label: 'Muito Alto', color: 'bg-red-500 text-white', icon: '🔴' },
        A: { label: 'Alto', color: 'bg-orange-500 text-white', icon: '🟠' },
        M: { label: 'Moderado', color: 'bg-yellow-500 text-white', icon: '🟡' },
        B: { label: 'Baixo', color: 'bg-green-500 text-white', icon: '🟢' },
        PE: { label: 'Pequenos Eventos', color: 'bg-blue-500 text-white', icon: '🔵' },
      };

      const statusInfo = statusConfig[termoCompleto.status as keyof typeof statusConfig] || statusConfig.PENDENTE;
      const tipoInfo = tipoConfig[termoCompleto.tipo_termo as keyof typeof tipoConfig] || tipoConfig.NOTIFICACAO;

      // Extrair não conformidades
      const naoConformidades: { numero: number; descricao: string; severidade: string }[] = [];
      for (let i = 1; i <= 10; i++) {
        const descricao = (termoCompleto as unknown as Record<string, unknown>)[`descricao_nc_${i}`] as string;
        const severidade = (termoCompleto as unknown as Record<string, unknown>)[`severidade_nc_${i}`] as string || 'M';
        if (descricao?.trim()) {
          naoConformidades.push({ numero: i, descricao: descricao.trim(), severidade });
        }
      }

      // Extrair ações corretivas
      const acoesCorrecao: { numero: number; descricao: string; prazo: string | null }[] = [];
      for (let i = 1; i <= 10; i++) {
        const acao = (termoCompleto as unknown as Record<string, unknown>)[`acao_correcao_${i}`] as string;
        const prazo = (termoCompleto as unknown as Record<string, unknown>)[`prazo_acao_${i}`] as string;
        if (acao?.trim()) {
          acoesCorrecao.push({
            numero: i,
            descricao: acao.trim(),
            prazo: prazo ? new Date(prazo).toLocaleDateString('pt-BR') : null
          });
        }
      }

      const assinaturaEmitente = (termoCompleto as any).assinatura_emitente_img ?? termoCompleto.assinatura_emitente;
      const assinaturaResponsavel = (termoCompleto as any).assinatura_responsavel_area_img ?? termoCompleto.assinatura_responsavel_area;

      // Gerar conteúdo da página 1
      pagina1Element.innerHTML = `
        <!-- CABEÇALHO COMPACTO -->
        <div class="text-center mb-6" style="background: linear-gradient(to right,rgb(59, 246, 168),rgb(96, 193, 187)); color: white; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
            <span style="font-size: 24px;">${tipoInfo.icon}</span>
            <div>
              <h1 style="font-size: 18px; font-weight: bold; color: white; margin: 0;">
                ${tipoInfo.label}
              </h1>
              <p style="font-size: 12px; color: #e0e7ff; margin: 0;">
                ECOFIELD SYSTEM - GESTÃO
              </p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.9); color: #1e40af; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold;">
              ${termoCompleto.numero_termo || 'Pendente'}
            </div>
            <span style="background: rgba(255, 255, 255, 0.2); color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">
              ${statusInfo.icon} ${statusInfo.label}
            </span>
          </div>
        </div>

        <!-- CONTEÚDO EM DUAS COLUNAS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex: 1;">
          
          <!-- COLUNA ESQUERDA -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- INFORMAÇÕES GERAIS -->
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                📋 Informações Gerais
              </h2>
              <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 12px;">
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">LOCAL DA ATIVIDADE</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.local_atividade || 'Não informado'}</p>
                </div>
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">ÁREA/EQUIPAMENTO</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.area_equipamento_atividade || 'Não informado'}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">DATA</p>
                    <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${new Date(termoCompleto.data_termo).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">HORA</p>
                    <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.hora_termo || 'Não informado'}</p>
                  </div>
                </div>
                ${termoCompleto.projeto_ba ? `
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">PROJETO/BA</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.projeto_ba}</p>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- RESPONSÁVEIS -->
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                👥 Responsáveis
              </h2>
              <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 12px;">
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">EMITIDO POR</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.emitido_por_nome || 'Não informado'}</p>
                </div>
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">EMPRESA EMITENTE</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.emitido_por_empresa || 'Não informado'}</p>
                </div>
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">DESTINATÁRIO</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.destinatario_nome || 'Não informado'}</p>
                </div>
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">EMPRESA DESTINATÁRIA</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.destinatario_empresa || 'Não informado'}</p>
                </div>
                ${termoCompleto.responsavel_area ? `
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">TST/TMA RESPONSÁVEL</p>
                  <p style="font-size: 12px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.responsavel_area}</p>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- LOCALIZAÇÃO GPS COMPACTA -->
            ${(termoCompleto.latitude && termoCompleto.longitude) ? `
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                📍 Localização GPS
              </h2>
              <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">LATITUDE</p>
                  <p style="font-size: 11px; font-family: monospace; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.latitude}</p>
                </div>
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">LONGITUDE</p>
                  <p style="font-size: 11px; font-family: monospace; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.longitude}</p>
                </div>
                ${termoCompleto.endereco_gps ? `
                <div style="grid-column: 1 / -1;">
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">ENDEREÇO</p>
                  <p style="font-size: 11px; font-weight: 500; color: #1f2937; margin: 0;">${termoCompleto.endereco_gps}</p>
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- COLUNA DIREITA -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- NÃO CONFORMIDADES COMPACTAS -->
            ${naoConformidades.length > 0 ? `
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                ⚠️ Não Conformidades
              </h2>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${naoConformidades.slice(0, 3).map((nc) => {
                  const severidadeInfo = severidadeConfig[nc.severidade as keyof typeof severidadeConfig] || severidadeConfig.M;
                  return `
                    <div style="border-left: 3px solid #ef4444; background: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fecaca;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="; color: red; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                          NC ${nc.numero}
                        </span>
                        <span style="background: ${severidadeInfo.color.includes('red') ? '#ef4444' : severidadeInfo.color.includes('orange') ? '#f97316' : severidadeInfo.color.includes('yellow') ? '#eab308' : severidadeInfo.color.includes('green') ? '#22c55e' : '#3b82f6'}; color: white; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                          ${severidadeInfo.icon}
                        </span>
                      </div>
                      <p style="font-size: 11px; color: #374151; margin: 0; line-height: 1.4;">${nc.descricao}</p>
                    </div>
                  `;
                }).join('')}
                ${naoConformidades.length > 3 ? `
                <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center; font-size: 11px; color: #6b7280;">
                  +${naoConformidades.length - 3} não conformidades adicionais
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            <!-- AÇÕES CORRETIVAS COMPACTAS -->
            ${acoesCorrecao.length > 0 ? `
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                🔧 Ações para Correção
              </h2>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${acoesCorrecao.slice(0, 3).map((acao) => `
                  <div style="border-left: 3px solid #3b82f6; background: #eff6ff; padding: 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span style="color: blue; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                        AÇÃO ${acao.numero}
                      </span>
                      ${acao.prazo ? `
                      <span style="color: #c2410c; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
                        📅 ${acao.prazo}
                      </span>
                      ` : ''}
                    </div>
                    <p style="font-size: 11px; color: #374151; margin: 0; line-height: 1.4;">${acao.descricao}</p>
                  </div>
                `).join('')}
                ${acoesCorrecao.length > 3 ? `
                <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center; font-size: 11px; color: #6b7280;">
                  +${acoesCorrecao.length - 3} ações adicionais
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            <!-- OBSERVAÇÕES E PROVIDÊNCIAS COMPACTAS -->
            ${(termoCompleto.observacoes || termoCompleto.providencias_tomadas) ? `
            <div>
              ${termoCompleto.observacoes ? `
              <div style="margin-bottom: 12px;">
                <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  💭 Observações
                </h2>
                <div style="background: #eff6ff; padding: 12px; border-radius: 6px; border: 1px solid #bfdbfe;">
                  <p style="font-size: 11px; color: #374151; margin: 0; line-height: 1.4; white-space: pre-wrap;">${termoCompleto.observacoes.substring(0, 200)}${termoCompleto.observacoes.length > 200 ? '...' : ''}</p>
                </div>
              </div>
              ` : ''}
              
              ${termoCompleto.providencias_tomadas ? `
              <div>
                <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  ✅ Providências
                </h2>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
                  <p style="font-size: 11px; color: #374151; margin: 0; line-height: 1.4; white-space: pre-wrap;">${termoCompleto.providencias_tomadas.substring(0, 200)}${termoCompleto.providencias_tomadas.length > 200 ? '...' : ''}</p>
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}

            <!-- DETALHES TÉCNICOS -->
            ${(termoCompleto.atividade_especifica || termoCompleto.natureza_desvio || (termoCompleto as any).lista_verificacao_aplicada) ? `
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                🔧 Detalhes Técnicos
              </h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${termoCompleto.atividade_especifica ? `
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">ATIVIDADE ESPECÍFICA</p>
                  <p style="font-size: 11px; color: #1f2937; margin: 0;">${termoCompleto.atividade_especifica}</p>
                </div>
                ` : ''}
                ${termoCompleto.natureza_desvio ? `
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 2px 0;">NATUREZA DO DESVIO</p>
                  <p style="font-size: 11px; color: #1f2937; margin: 0;">${termoCompleto.natureza_desvio}</p>
                </div>
                ` : ''}
                ${(termoCompleto as any).lista_verificacao_aplicada ? `
                <div>
                  <p style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">LISTA DE VERIFICAÇÃO</p>
                  <p style="font-size: 11px; color: #1f2937; margin: 0;">${(termoCompleto as any).lista_verificacao_aplicada}</p>
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- ASSINATURAS DIGITAIS - FOOTER DA PRIMEIRA PÁGINA -->
        <div style="margin-top: 20px;">
          <h2 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            ✍️ Assinaturas Digitais
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            
            <!-- Assinatura Emitente -->
            <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 10px;">
                <span style="font-size: 16px; color: #3b82f6;">👤</span>
                <h3 style="font-size: 12px; font-weight: bold; color: #1f2937; margin: 0;">EMITENTE</h3>
              </div>
              
              ${assinaturaEmitente ? `
              <div>
                <div style="background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 6px; padding: 8px; margin-bottom: 8px; height: 160px; display: flex; align-items: center; justify-content: center;">
                  <img src="${String(assinaturaEmitente)}" alt="Assinatura do Emitente" style="max-width: 100%; max-height: 250px;" />
                </div>
                <p style="font-size: 11px; font-weight: bold; color: #1f2937; margin: 0 0 2px 0;">${termoCompleto.emitido_por_nome}</p>
                <p style="font-size: 9px; color: #6b7280; margin: 0 0 4px 0;">
                  ${termoCompleto.data_assinatura_emitente ? new Date(termoCompleto.data_assinatura_emitente).toLocaleDateString('pt-BR') : new Date(termoCompleto.data_termo).toLocaleDateString('pt-BR')}
                </p>
                <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold;">
                  ✅ ASSINADO
                </span>
              </div>
              ` : `
              <div>
                <div style="background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 6px; padding: 16px 8px; margin-bottom: 8px; height: 50px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px; color: #9ca3af;">📄</span>
                </div>
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 2px 0;">${termoCompleto.emitido_por_nome || 'Não informado'}</p>
                <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold;">
                  ⏳ PENDENTE
                </span>
              </div>
              `}
            </div>

            <!-- Assinatura Responsável -->
            <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 10px;">
                <span style="font-size: 16px; color: #8b5cf6;">🏢</span>
                <h3 style="font-size: 12px; font-weight: bold; color: #1f2937; margin: 0;">RESPONSÁVEL</h3>
              </div>
              
              ${assinaturaResponsavel ? `
              <div>
                <div style="background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 6px; padding: 8px; margin-bottom: 8px; height: 160px; display: flex; align-items: center; justify-content: center;">
                  <img src="${String(assinaturaResponsavel)}" alt="Assinatura do Responsável" style="max-width: 100%; max-height: 250px;" />
                </div>
                <p style="font-size: 11px; font-weight: bold; color: #1f2937; margin: 0 0 2px 0;">${termoCompleto.destinatario_nome}</p>
                <p style="font-size: 9px; color: #6b7280; margin: 0 0 4px 0;">
                  ${termoCompleto.data_assinatura_responsavel ? new Date(termoCompleto.data_assinatura_responsavel).toLocaleDateString('pt-BR') : new Date(termoCompleto.data_termo).toLocaleDateString('pt-BR')}
                </p>
                <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold;">
                  ✅ ASSINADO
                </span>
              </div>
              ` : `
              <div>
                <div style="background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 6px; padding: 16px 8px; margin-bottom: 8px; height: 50px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 24px; color: #9ca3af;">📄</span>
                </div>
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 2px 0;">${termoCompleto.responsavel_area || 'Não informado'}</p>
                <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold;">
                  ⏳ PENDENTE
                </span>
              </div>
              `}
            </div>
          </div>
        </div>
      `;

      // Gerar conteúdo da página 2
      pagina2Element.innerHTML = `
        <!-- EVIDÊNCIAS FOTOGRÁFICAS -->
        ${fotos.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            📷 Evidências Fotográficas (${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'})
          </h2>
          
          <div style="display: grid; grid-template-columns: ${fotos.length === 1 ? '1fr' : fotos.length === 2 ? 'repeat(2, 1fr)' : fotos.length === 3 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))'}; gap: 16px;">
            ${fotos.map((foto: any, index: number) => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <div style="aspect-ratio: 16/10; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  ${foto.url_arquivo ? `
                    <img src="${foto.url_arquivo}" alt="Evidência ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                  ` : `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                      <p style="margin: 8px 0 0 0; font-size: 12px;">Sem imagem</p>
                    </div>
                  `}
                </div>
                <div style="padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0;">
                      Foto ${index + 1}
                    </p>
                    ${foto.categoria ? `
                      <span style="background-color: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">
                        ${foto.categoria}
                      </span>
                    ` : ''}
                  </div>
                  ${foto.descricao ? `
                    <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0; line-height: 1.4;">
                      ${foto.descricao}
                    </p>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- TODAS AS NÃO CONFORMIDADES -->
        ${naoConformidades.length > 3 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            ⚠️ Todas as Não Conformidades (${naoConformidades.length})
          </h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${naoConformidades.map((nc) => {
              const severidadeInfo = severidadeConfig[nc.severidade as keyof typeof severidadeConfig] || severidadeConfig.M;
              return `
                <div style="border-left: 4px solid #ef4444; background: #fef2f2; padding: 16px; border-radius: 8px; border: 1px solid #fecaca;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="background: #ef4444; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                      NC ${nc.numero}
                    </span>
                    <span style="background: ${severidadeInfo.color.includes('red') ? '#ef4444' : severidadeInfo.color.includes('orange') ? '#f97316' : severidadeInfo.color.includes('yellow') ? '#eab308' : severidadeInfo.color.includes('green') ? '#22c55e' : '#3b82f6'}; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                      ${severidadeInfo.icon} ${severidadeInfo.label}
                    </span>
                  </div>
                  <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">${nc.descricao}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- TODAS AS AÇÕES CORRETIVAS -->
        ${acoesCorrecao.length > 3 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            🔧 Todas as Ações para Correção (${acoesCorrecao.length})
          </h2>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${acoesCorrecao.map((acao) => `
              <div style="border-left: 4px solid #3b82f6; background: #eff6ff; padding: 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                    AÇÃO ${acao.numero}
                  </span>
                  ${acao.prazo ? `
                  <span style="background: #fed7aa; color: #c2410c; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                    📅 ${acao.prazo}
                  </span>
                  ` : ''}
                </div>
                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">${acao.descricao}</p>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- METADADOS DO DOCUMENTO -->
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            🗂️ Metadados do Documento
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">ID DO TERMO</p>
              <p style="font-family: monospace; font-weight: 500; color: #1f2937; margin: 0; font-size: 14px;">${termoCompleto.id}</p>
            </div>
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">CRIADO EM</p>
              <p style="font-weight: 500; color: #1f2937; margin: 0; font-size: 14px;">
                ${new Date(termoCompleto.created_at).toLocaleDateString('pt-BR')} às ${new Date(termoCompleto.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            ${termoCompleto.updated_at ? `
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">ÚLTIMA ATUALIZAÇÃO</p>
              <p style="font-weight: 500; color: #1f2937; margin: 0; font-size: 14px;">
                ${new Date(termoCompleto.updated_at).toLocaleDateString('pt-BR')} às ${new Date(termoCompleto.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            ` : ''}
            ${termoCompleto.auth_user_id ? `
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0;">USUÁRIO CRIADOR</p>
              <p style="font-family: monospace; font-weight: 500; color: #1f2937; margin: 0; font-size: 14px;">${termoCompleto.auth_user_id}</p>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- RODAPÉ FINAL -->
        <div style="background: #1f2937; color: white; padding: 24px; border-radius: 8px; text-align: center; margin-top: 32px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
            <span style="font-size: 24px;">🌱</span>
            <h3 style="font-size: 20px; font-weight: bold; margin: 0;">ECOFIELD SYSTEM</h3>
          </div>
          <p style="color: #d1d5db; margin: 0 0 12px 0; font-size: 16px;">Sistema Inteligente de Gestão</p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">
            Documento gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 16px 0;">
            Termo validado digitalmente
          </p>
          <div style="border-top: 1px solid #374151; padding-top: 16px;">
            <p style="font-size: 10px; color: #6b7280; margin: 0;">
              ID: ${termoCompleto.id} | Nº Sequencial: ${termoCompleto.numero_sequencial || 'N/A'}
            </p>
          </div>
        </div>
      `;

      // Adicionar elementos ao DOM
      document.body.appendChild(pagina1Element);
      document.body.appendChild(pagina2Element);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Capturar página 1
      console.log('📄 Capturando página 1...');
      const canvas1 = await html2canvas(pagina1Element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
        height: pagina1Element.scrollHeight,
        windowWidth: 1200,
        windowHeight: 800
      });

      // Capturar página 2
      console.log('📄 Capturando página 2...');
      const canvas2 = await html2canvas(pagina2Element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
        height: pagina2Element.scrollHeight,
        windowWidth: 1200,
        windowHeight: 800
      });

      // Criar PDF com ambas as páginas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const margin = 10;
      const imgWidth = pdfWidth - (margin * 2);

      // Adicionar página 1
      const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData1, 'JPEG', margin, margin, imgWidth, imgHeight1);

      // Adicionar página 2
      pdf.addPage();
      const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData2, 'JPEG', margin, margin, imgWidth, imgHeight2);

      const nomeArquivo = `Termo_${termoCompleto.numero_termo || termoCompleto.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      console.log(`✅ [LISTA TERMOS] PDF gerado com sucesso: ${nomeArquivo} (2 páginas)`);

      // Limpeza
      document.body.removeChild(pagina1Element);
      document.body.removeChild(pagina2Element);
      document.head.removeChild(estilosDesktop);

    } catch (error) {
      console.error('❌ [LISTA TERMOS] Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  }, []);

  // Excluir termo
  const handleExcluirTermo = useCallback(async (termo: TermoAmbiental) => {
    if (!window.confirm('Deseja realmente excluir este termo?')) return;
    
    try {
      console.log('🗑️ [LISTA TERMOS] Excluindo termo:', termo.id);
      
      const response = await termosAPI.excluirTermo(termo.id);
      
      if (response.success) {
        console.log('✅ [LISTA TERMOS] Termo excluído com sucesso');
        carregarTermos();
      } else {
        console.error('❌ [LISTA TERMOS] Erro ao excluir termo:', response.error);
        alert('Erro ao excluir termo: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [LISTA TERMOS] Erro ao excluir termo:', error);
      alert('Erro ao excluir termo');
    }
  }, [carregarTermos]);

  // Editar termo
  const editarTermo = useCallback(async (termo: TermoAmbiental | TermoAmbientalOffline) => {
    try {
      console.log('✏️ [LISTA TERMOS] Editando termo:', termo.id);
      console.log('✏️ [LISTA TERMOS] Dados do termo da lista:', termo);
      
      // Buscar o termo completo da API para ter todos os campos e fotos
      const response = await termosAPI.buscarTermo(termo.id!);
      
      if (response.success && response.data) {
        console.log('✅ [LISTA TERMOS] Termo carregado para edição:', response.data);
        console.log('✅ [LISTA TERMOS] Fotos do termo:', (response.data as any).fotos_termos_ambientais);
        console.log('✅ [LISTA TERMOS] Assinaturas do termo:', (response.data as any).assinaturas_termos_ambientais);
        setTermoSelecionado(response.data);
        setMostrarNovoTermo(true);
      } else {
        console.error('❌ [LISTA TERMOS] Erro ao carregar termo para edição:', response.error);
        alert('Erro ao carregar dados do termo: ' + response.error);
      }
    } catch (error) {
      console.error('❌ [LISTA TERMOS] Erro ao editar termo:', error);
      alert('Erro ao carregar dados do termo');
    }
  }, []);

  // ✅ Filtrar e ordenar termos para exibição
  // Prioridade: 1º) Termos offline pendentes de sincronização, 2º) Outros termos por data de criação (mais recentes primeiro)
  const termosParaExibir = useMemo(() => {
    // 1º: Termos offline pendentes sempre no topo
    const termosPendentes = termosOfflinePendentes as (TermoAmbiental | TermoAmbientalOffline)[];
    
    // 2º: Outros termos ordenados por data de criação (mais recentes primeiro)
    const outrosTermos = isOnline 
      ? termos 
      : (termosOffline as (TermoAmbiental | TermoAmbientalOffline)[]);
    
    // Ordenar por data de criação (mais recentes primeiro)
    const outrosTermosOrdenados = outrosTermos.sort((a, b) => {
      const dataA = new Date(a.created_at || 0).getTime();
      const dataB = new Date(b.created_at || 0).getTime();
      return dataB - dataA; // Ordem decrescente (mais recente primeiro)
    });
    
    // ✅ CORREÇÃO: Evitar duplicatas ao combinar arrays
    const todosTermos = [...termosPendentes, ...outrosTermosOrdenados];
    
    // Remover duplicatas baseado no ID
    const termosUnicos = todosTermos.filter((termo, index, array) => {
      const primeiroIndex = array.findIndex(t => t.id === termo.id);
      return primeiroIndex === index; // Manter apenas a primeira ocorrência
    });
    
    console.log('📱 [LISTA TERMOS] Termos para exibir:', {
      pendentes: termosPendentes.length,
      outros: outrosTermosOrdenados.length,
      total: todosTermos.length,
      unicos: termosUnicos.length,
      duplicatas: todosTermos.length - termosUnicos.length
    });
    
    return termosUnicos;
  }, [termosOfflinePendentes, termos, termosOffline, isOnline]);

  // Carregar dados na inicialização
  useEffect(() => {
    carregarTermos();
    carregarPendentesOffline();
  }, [carregarTermos, carregarPendentesOffline]);

  // Event listener para termo salvo
  useEffect(() => {
    window.addEventListener('termoSalvo', handleTermoSalvo);
    return () => {
      window.removeEventListener('termoSalvo', handleTermoSalvo);
    };
  }, [handleTermoSalvo]);

  return {
    // Estados
    termos,
    termosOffline,
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
    fotosSelecionadas,
    assinaturasSelecionadas,
    isOnline,
    termosOfflinePendentes,
    
    // Ações
    carregarTermos,
    carregarPendentesOffline,
    handleTermoSalvo,
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
  };
}; 