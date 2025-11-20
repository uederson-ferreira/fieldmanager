// ===================================================================
// MODAL DETALHES TERMO - NAVEGAÇÃO POR PÁGINAS COM PDF DESKTOP
// Localização: src/components/tecnico/ModalDetalhesTermo.tsx
// Módulo: Exibição detalhada de termos ambientais - PDF sempre desktop
// ===================================================================

import React, { useEffect, useState } from 'react';
import { Download, Eye, User, Building, FileText, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../common/Modal';
import type { TermoAmbiental, TermoFoto } from '../../types/termos';

interface ModalDetalhesTermoProps {
  termo: TermoAmbiental;
  fotos?: TermoFoto[];
  assinaturas?: {
    assinatura_emitente?: string;
    assinatura_responsavel_area?: string;
  };
  aberto: boolean;
  onClose: () => void;
}

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

const ModalDetalhesTermo: React.FC<ModalDetalhesTermoProps> = ({ 
  termo, 
  fotos = [], 
  assinaturas,
  aberto, 
  onClose 
}) => {
  const [fotosTermo, setFotosTermo] = useState<TermoFoto[]>([]);
  const [carregando, setCarregando] = useState<'pdf' | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState<1 | 2>(1);

  // ===================================================================
  // FUNÇÃO PDF COM DESKTOP FORÇADO - DUAS PÁGINAS COMPLETAS
  // ===================================================================

  const handleDownloadPDF = async () => {
    setCarregando('pdf');
    setErro(null);
    
    try {
      console.log('📄 [MODAL] Iniciando geração de PDF desktop com 2 páginas...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Obter ambas as páginas
      const pagina1Element = document.getElementById('termo-pagina-1-pdf');
      const pagina2Element = document.getElementById('termo-pagina-2-pdf');
      
      if (!pagina1Element || !pagina2Element) {
        throw new Error('Páginas para captura não encontradas');
      }

      // Criar estilos CSS específicos para desktop A4
      const estilosDesktop = document.createElement('style');
      estilosDesktop.id = 'estilos-pdf-desktop';
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

      // Clonar e preparar página 1
      const clonePagina1 = pagina1Element.cloneNode(true) as HTMLElement;
      clonePagina1.id = 'clone-pagina-1';
      clonePagina1.className = 'pdf-desktop-style';
      clonePagina1.style.position = 'absolute';
      clonePagina1.style.left = '-9999px';
      clonePagina1.style.top = '0';
      document.body.appendChild(clonePagina1);

      // Clonar e preparar página 2
      const clonePagina2 = pagina2Element.cloneNode(true) as HTMLElement;
      clonePagina2.id = 'clone-pagina-2';
      clonePagina2.className = 'pdf-desktop-style';
      clonePagina2.style.position = 'absolute';
      clonePagina2.style.left = '-9999px';
      clonePagina2.style.top = '0';
      document.body.appendChild(clonePagina2);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Capturar página 1
      console.log('📄 Capturando página 1...');
      const canvas1 = await html2canvas(clonePagina1, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
        height: clonePagina1.scrollHeight,
        windowWidth: 1200,
        windowHeight: 800
      });

      // Capturar página 2
      console.log('📄 Capturando página 2...');
      const canvas2 = await html2canvas(clonePagina2, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
        height: clonePagina2.scrollHeight,
        windowWidth: 1200,
        windowHeight: 800
      });

      // Criar PDF com ambas as páginas em tamanho A4
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

      const nomeArquivo = `Termo_${termo.numero_termo || termo.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      console.log(`✅ [MODAL] PDF desktop gerado: ${nomeArquivo} (2 páginas)`);

      // Limpeza
      document.body.removeChild(clonePagina1);
      document.body.removeChild(clonePagina2);
      document.head.removeChild(estilosDesktop);

    } catch (error) {
      console.error('❌ [MODAL] Erro ao gerar PDF desktop:', error);
      setErro(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Limpeza em caso de erro
      const cleanup = ['clone-pagina-1', 'clone-pagina-2', 'estilos-pdf-desktop'];
      cleanup.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.remove();
      });
    } finally {
      setCarregando(null);
    }
  };

  useEffect(() => {
    const fetchFotos = async () => {
      if (aberto && termo?.id) {
        if (fotos && fotos.length > 0) {
          console.log('📸 [MODAL DEBUG] Fotos passadas como prop:', fotos);
          setFotosTermo(fotos);
          return;
        }
        
        try {
          // ✅ USAR MESMA ROTA QUE FUNCIONA NO PDF + TOKEN DE AUTORIZAÇÃO
          const token = localStorage.getItem('ecofield_auth_token');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/termos/${termo.id}/fotos`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const result = await response.json();
            console.log('📸 [MODAL DEBUG] Fotos carregadas do backend:', result || []);
            setFotosTermo(result || []);
          } else {
            console.error('❌ [MODAL DEBUG] Erro ao carregar fotos - Status:', response.status);
            setFotosTermo([]);
          }
        } catch (error) {
          console.error('❌ [MODAL DEBUG] Erro ao carregar fotos:', error);
          setFotosTermo([]);
        }
      }
    };
    fetchFotos();
  }, [aberto, termo?.id, fotos]);

  const statusInfo = statusConfig[termo.status as keyof typeof statusConfig] || statusConfig.PENDENTE;
  const tipoInfo = tipoConfig[termo.tipo_termo as keyof typeof tipoConfig] || { 
    label: termo.tipo_termo, 
    icon: '📄', 
    color: 'from-gray-500 to-gray-600' 
  };

  // Extrair não conformidades
  const naoConformidades: { numero: number; descricao: string; severidade: string }[] = [];
  for (let i = 1; i <= 10; i++) {
    const descricao = (termo as unknown as Record<string, unknown>)[`descricao_nc_${i}`] as string;
    const severidade = (termo as unknown as Record<string, unknown>)[`severidade_nc_${i}`] as string || 'M';
    if (descricao?.trim()) {
      naoConformidades.push({ numero: i, descricao: descricao.trim(), severidade });
    }
  }

  // Extrair ações corretivas
  const acoesCorrecao: { numero: number; descricao: string; prazo: string | null; }[] = [];
  for (let i = 1; i <= 10; i++) {
    const acao = (termo as unknown as Record<string, unknown>)[`acao_correcao_${i}`] as string;
    const prazo = (termo as unknown as Record<string, unknown>)[`prazo_acao_${i}`] as string;
    if (acao?.trim()) {
      acoesCorrecao.push({
        numero: i,
        descricao: acao.trim(),
        prazo: prazo ? new Date(prazo).toLocaleDateString('pt-BR') : null
      });
    }
  }

  const assinaturaEmitente = assinaturas?.assinatura_emitente ?? termo.assinatura_emitente_img ?? termo.assinatura_emitente;
  const assinaturaResponsavel = assinaturas?.assinatura_responsavel_area ?? termo.assinatura_responsavel_area_img ?? termo.assinatura_responsavel_area;

  // ===================================================================
  // RENDERIZAR PÁGINA 1 - LAYOUT RESPONSIVO
  // ===================================================================
  const renderPagina1 = () => (
    <div id="termo-pagina-1-pdf" className="bg-white w-full max-w-4xl mx-auto print:max-w-none print:w-[210mm] print:min-h-[297mm]" style={{ 
      fontFamily: 'Arial, sans-serif',
      fontSize: 'clamp(12px, 2.5vw, 14px)',
      lineHeight: '1.5',
      color: '#000',
      minHeight: '900px',
      padding: 'clamp(20px, 4vw, 40px)'
    }}>
      {/* CABEÇALHO COMPACTO */}
      <div className="text-center mb-6" style={{ 
        background: 'linear-gradient(to right,rgb(59, 246, 168),rgb(96, 193, 187))', 
        color: 'white',
        padding: 'clamp(8px, 2vw, 12px)',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl">{tipoInfo.icon}</span>
          <div className="text-center sm:text-left">
            <h1 className="text-base sm:text-lg font-bold text-white m-0">
              {tipoInfo.label}
            </h1>
            <p className="text-xs sm:text-sm text-green-100 m-0">
              ECOFIELD SYSTEM - GESTÃO
            </p>
              </div>
          <div className="text-blue-800 px-3 py-2 rounded-lg text-sm font-bold">
                    {termo.numero_termo || 'Pendente'}
          </div>
          <span className="text-red-500 px-3 py-1 rounded-lg text-xs font-bold">
            {statusInfo.icon} {statusInfo.label}
                  </span>
              </div>
            </div>
            
      {/* CONTEÚDO RESPONSIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="flex flex-col gap-4">
          
          {/* INFORMAÇÕES GERAIS */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              📋 Informações Gerais
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">LOCAL DA ATIVIDADE</p>
                <p className="text-sm font-medium text-gray-800">{termo.local_atividade || 'Não informado'}</p>
          </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">ÁREA/EQUIPAMENTO</p>
                <p className="text-sm font-medium text-gray-800">{termo.area_equipamento_atividade || 'Não informado'}</p>
        </div>
              <div className="grid grid-cols-2 gap-3">
              <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">DATA</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(termo.data_termo).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">HORA</p>
                  <p className="text-sm font-medium text-gray-800">{termo.hora_termo || 'Não informado'}</p>
                </div>
              </div>
              {termo.projeto_ba && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">PROJETO/BA</p>
                  <p className="text-sm font-medium text-gray-800">{termo.projeto_ba}</p>
                </div>
              )}
            </div>
          </div>

          {/* RESPONSÁVEIS */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              👥 Responsáveis
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">EMITIDO POR</p>
                <p className="text-sm font-medium text-gray-800">{termo.emitido_por_nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">EMPRESA EMITENTE</p>
                <p className="text-sm font-medium text-gray-800">{termo.emitido_por_empresa || 'Não informado'}</p>
            </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">DESTINATÁRIO</p>
                <p className="text-sm font-medium text-gray-800">{termo.destinatario_nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">EMPRESA DESTINATÁRIO</p>
                <p className="text-sm font-medium text-gray-800">{termo.destinatario_empresa || 'Não informado'}</p>
              </div>
              {termo.responsavel_area && (
              <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">TST/TMA RESPONSÁVEL</p>
                  <p className="text-sm font-medium text-gray-800">{termo.responsavel_area}</p>
              </div>
              )}
            </div>
          </div>

          {/* LOCALIZAÇÃO GPS COMPACTA */}
          {(termo.latitude && termo.longitude) && (
                <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                📍 Localização GPS
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">LATITUDE</p>
                  <p className="text-xs font-mono font-medium text-gray-800">{termo.latitude}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">LONGITUDE</p>
                  <p className="text-xs font-mono font-medium text-gray-800">{termo.longitude}</p>
                </div>
                {termo.endereco_gps && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">ENDEREÇO</p>
                    <p className="text-xs font-medium text-gray-800">{termo.endereco_gps}</p>
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* COLUNA DIREITA */}
        <div className="flex flex-col gap-4">
          
          {/* NÃO CONFORMIDADES COMPACTAS */}
        {naoConformidades.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                ⚠️ Não Conformidades
              </h2>
              <div className="flex flex-col gap-2">
                {naoConformidades.slice(0, 3).map((nc, index) => {
                  const severidadeInfo = severidadeConfig[nc.severidade as keyof typeof severidadeConfig] || severidadeConfig.M;
                return (
                    <div key={index} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-lg border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-red-600 px-2 py-1 rounded text-xs font-bold">
                          NC {nc.numero}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold`}>
                          {severidadeInfo.icon}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{nc.descricao}</p>
                  </div>
                );
              })}
                {naoConformidades.length > 3 && (
                  <div className="bg-gray-100 p-2 rounded-lg text-center text-xs text-gray-600">
                    +{naoConformidades.length - 3} não conformidades adicionais
                  </div>
                )}
            </div>
          </div>
        )}

          {/* AÇÕES CORRETIVAS COMPACTAS */}
        {acoesCorrecao.length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                🔧 Ações para Correção
              </h2>
              <div className="flex flex-col gap-2">
                {acoesCorrecao.slice(0, 3).map((acao, index) => (
                  <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-600 px-2 py-1 rounded text-xs font-bold">
                        AÇÃO {acao.numero}
                      </span>
                    {acao.prazo && (
                        <span className="text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                          📅 {acao.prazo}
                        </span>
                    )}
                  </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{acao.descricao}</p>
                </div>
              ))}
                {acoesCorrecao.length > 3 && (
                  <div className="bg-gray-100 p-2 rounded-lg text-center text-xs text-gray-600">
                    +{acoesCorrecao.length - 3} ações adicionais
                  </div>
                )}
            </div>
          </div>
        )}

          {/* OBSERVAÇÕES E PROVIDÊNCIAS COMPACTAS */}
          {(termo.observacoes || termo.providencias_tomadas) && (
            <div>
              {termo.observacoes && (
                <div className="mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    💭 Observações
                  </h2>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {termo.observacoes.substring(0, 200)}{termo.observacoes.length > 200 ? '...' : ''}
                    </p>
              </div>
              </div>
              )}
              
              {termo.providencias_tomadas && (
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    ✅ Providências
                  </h2>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {termo.providencias_tomadas.substring(0, 200)}{termo.providencias_tomadas.length > 200 ? '...' : ''}
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}

          {/* DETALHES TÉCNICOS */}
          {(termo.atividade_especifica || termo.natureza_desvio || termo.lista_verificacao_aplicada) && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                🔧 Detalhes Técnicos
              </h2>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {termo.atividade_especifica && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">ATIVIDADE ESPECÍFICA</p>
                      <p className="text-xs text-gray-700">{termo.atividade_especifica}</p>
              </div>
                  )}
                  {termo.natureza_desvio && (
              <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">NATUREZA DO DESVIO</p>
                      <p className="text-xs text-gray-700">{termo.natureza_desvio}</p>
              </div>
                  )}
                  {termo.lista_verificacao_aplicada && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">LISTA DE VERIFICAÇÃO</p>
                      <p className="text-xs text-gray-700">{termo.lista_verificacao_aplicada}</p>
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
            </div>
          </div>
          
      {/* ASSINATURAS DIGITAIS - FOOTER DA PRIMEIRA PÁGINA */}
      <div className="mt-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          ✍️ Assinaturas Digitais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
            {/* Assinatura Emitente */}
          <div className="border border-gray-300 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-800">EMITENTE</h3>
                </div>
                
                {assinaturaEmitente ? (
              <div>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-2 mb-2 h-250 flex items-center justify-center">
                      <img 
                        src={String(assinaturaEmitente)} 
                        alt="Assinatura do Emitente"
                    className="max-w-full max-h-full object-contain"
                      />
                    </div>
                <p className="text-xs font-bold text-gray-800 mb-1">{termo.emitido_por_nome}</p>
                <p className="text-xs text-gray-600 mb-2">
                        {termo.data_assinatura_emitente ? 
                    new Date(termo.data_assinatura_emitente).toLocaleDateString('pt-BR') :
                    new Date(termo.data_termo).toLocaleDateString('pt-BR')
                        }
                      </p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                  ✅ ASSINADO
                </span>
                  </div>
                ) : (
                    <div>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-2 h-32 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                <p className="text-xs text-gray-600 mb-1">{termo.emitido_por_nome || 'Não informado'}</p>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                  ⏳ PENDENTE
                </span>
                  </div>
                )}
            </div>

            {/* Assinatura Responsável */}
          <div className="border border-gray-300 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Building className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-800">RESPONSÁVEL</h3>
                </div>
                
                {assinaturaResponsavel ? (
              <div>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-2 mb-2 h-32 flex items-center justify-center">
                      <img 
                        src={String(assinaturaResponsavel)} 
                        alt="Assinatura do Responsável"
                    className="max-w-full max-h-full object-contain"
                      />
                    </div>
                <p className="text-xs font-bold text-gray-800 mb-1">{termo.destinatario_nome}</p>
                <p className="text-xs text-gray-600 mb-2">
                        {termo.data_assinatura_responsavel ? 
                    new Date(termo.data_assinatura_responsavel).toLocaleDateString('pt-BR') :
                    new Date(termo.data_termo).toLocaleDateString('pt-BR')
                        }
                      </p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                  ✅ ASSINADO
                </span>
                      </div>
            ) : (
              <div>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-2 h-32 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                <p className="text-xs text-gray-600 mb-1">{termo.responsavel_area || 'Não informado'}</p>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                  ⏳ PENDENTE
                </span>
                  </div>
            )}
                      </div>
                    </div>
                      </div>
                    </div>
  );

  // ===================================================================
  // RENDERIZAR PÁGINA 2 - EVIDÊNCIAS E DETALHES TÉCNICOS
  // ===================================================================
  const renderPagina2 = () => (
    <div id="termo-pagina-2-pdf" className="bg-white max-w-4xl mx-auto" style={{ 
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#000',
      minHeight: '900px',
      padding: '40px'
    }}>
      
      {/* EVIDÊNCIAS FOTOGRÁFICAS - TODAS AS FOTOS */}
      {fotosTermo.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📷 Evidências Fotográficas ({fotosTermo.length} {fotosTermo.length === 1 ? 'foto' : 'fotos'})
          </h2>
          
          {/* Grid responsivo que adapta ao número de fotos */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: fotosTermo.length === 1 ? '1fr' : 
                                fotosTermo.length === 2 ? 'repeat(2, 1fr)' :
                                fotosTermo.length === 3 ? 'repeat(3, 1fr)' :
                                'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px' 
          }}>
            {fotosTermo.map((foto, index) => (
              <div key={index} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Container da imagem com proporção fixa */}
                <div style={{ 
                  aspectRatio: '16/10', 
                  background: '#f3f4f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden' 
                }}>
                  {foto.url_arquivo ? (
                    <img 
                      src={foto.url_arquivo} 
                      alt={`Evidência ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">
                              <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                              <p style="margin: 8px 0 0 0; font-size: 12px;">Imagem não disponível</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      color: '#9ca3af'
                    }}>
                      <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Sem imagem</p>
                  </div>
                )}
              </div>
                
                {/* Informações da foto */}
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      margin: '0'
                    }}>
                      Foto {index + 1}
                    </p>
                    {foto.categoria && (
                      <span style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {foto.categoria}
                      </span>
                    )}
            </div>
                  
                  {foto.descricao && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      margin: '4px 0 0 0',
                      lineHeight: '1.4'
                    }}>
                      {foto.descricao}
                    </p>
                  )}
                  
                  {/* Metadados adicionais se disponíveis */}
                  {(foto.created_at || foto.tamanho_bytes) && (
                    <div style={{ 
                      marginTop: '8px', 
                      paddingTop: '8px', 
                      borderTop: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      color: '#9ca3af'
                    }}>
                      {foto.created_at && (
                        <span>
                          📅 {new Date(foto.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {foto.tamanho_bytes && (
                        <span>
                          📊 {(foto.tamanho_bytes / 1024).toFixed(1)}KB
                        </span>
                      )}
          </div>
                  )}
                </div>
              </div>
            ))}
        </div>

          {/* Resumo das fotos */}
          {fotosTermo.length > 4 && (
            <div style={{ 
              marginTop: '16px',
              background: 'linear-gradient(to right, #eff6ff, #f0f9ff)', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #bfdbfe',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#1e40af', 
                margin: '0',
                fontWeight: '500'
              }}>
                ✅ Total de {fotosTermo.length} evidências fotográficas anexadas ao termo
              </p>
              </div>
          )}
            </div>
      )}

      {/* TODAS AS NÃO CONFORMIDADES */}
      {naoConformidades.length > 3 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Todas as Não Conformidades ({naoConformidades.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {naoConformidades.map((nc, index) => {
              const severidadeInfo = severidadeConfig[nc.severidade as keyof typeof severidadeConfig] || severidadeConfig.M;
              return (
                <div key={index} style={{ 
                  borderLeft: '4px solid #ef4444',
                  background: '#fef2f2',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      fontWeight: 'bold' 
                    }}>
                      NC {nc.numero+9}
                    </span>
                    <span style={{ 
                      background: severidadeInfo.color.includes('red') ? '#ef4444' :
                                 severidadeInfo.color.includes('orange') ? '#f97316' :
                                 severidadeInfo.color.includes('yellow') ? '#eab308' :
                                 severidadeInfo.color.includes('green') ? '#22c55e' : '#3b82f6',
                      color: 'white', 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {severidadeInfo.icon} {severidadeInfo.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '0', lineHeight: '1.6' }}>{nc.descricao}</p>
                </div>
              );
            })}
                  </div>
                </div>
              )}
              
      {/* TODAS AS AÇÕES CORRETIVAS */}
      {acoesCorrecao.length > 3 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔧 Todas as Ações para Correção ({acoesCorrecao.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {acoesCorrecao.map((acao, index) => (
              <div key={index} style={{ 
                borderLeft: '4px solid #3b82f6',
                background: '#eff6ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    background: '#3b82f6', 
                    color: 'white', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    fontSize: '14px', 
                    fontWeight: 'bold' 
                  }}>
                    AÇÃO {acao.numero}
                  </span>
                  {acao.prazo && (
                    <span style={{ 
                      background: '#fed7aa', 
                      color: '#c2410c', 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📅 {acao.prazo}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: '#374151', margin: '0', lineHeight: '1.6' }}>{acao.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROVIDÊNCIAS E DETALHES TÉCNICOS */}
      {(termo.providencias_tomadas || termo.atividade_especifica || termo.natureza_desvio || termo.lista_verificacao_aplicada) && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📋 Providências e Detalhes Técnicos
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            {/* PROVIDÊNCIAS */}
              {termo.providencias_tomadas && (
              <div style={{ 
                background: '#f0fdf4', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '1px solid #bbf7d0',
                borderLeft: '4px solid #22c55e'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>✅</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>Providências</h3>
                  </div>
                <p style={{ fontSize: '14px', color: '#374151', margin: '0', lineHeight: '1.6' }}>
                  {termo.providencias_tomadas}
                </p>
                </div>
              )}
              
            {/* DETALHES TÉCNICOS */}
            {(termo.atividade_especifica || termo.natureza_desvio || termo.lista_verificacao_aplicada) && (
              <div style={{ 
                background: '#f9fafb', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                borderLeft: '4px solid #6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>🔧</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>Detalhes Técnicos</h3>
                      </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {termo.atividade_especifica && (
                        <div>
                      <p style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>ATIVIDADE ESPECÍFICA</p>
                      <p style={{ fontSize: '12px', color: '#1f2937', margin: '0' }}>{termo.atividade_especifica}</p>
                        </div>
                      )}
                  {termo.natureza_desvio && (
                        <div>
                      <p style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>NATUREZA DO DESVIO</p>
                      <p style={{ fontSize: '12px', color: '#1f2937', margin: '0' }}>{termo.natureza_desvio}</p>
                        </div>
                      )}
                  {termo.lista_verificacao_aplicada && (
                        <div>
                      <p style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>LISTA DE VERIFICAÇÃO</p>
                      <p style={{ fontSize: '12px', color: '#1f2937', margin: '0' }}>{termo.lista_verificacao_aplicada}</p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* METADADOS DO DOCUMENTO */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗂️ Metadados do Documento
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
                <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>ID DO TERMO</p>
            <p style={{ fontFamily: 'monospace', fontWeight: '500', color: '#1f2937', margin: '0', fontSize: '14px' }}>{termo.id}</p>
                </div>
                <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>CRIADO EM</p>
            <p style={{ fontWeight: '500', color: '#1f2937', margin: '0', fontSize: '14px' }}>
              {new Date(termo.created_at).toLocaleDateString('pt-BR')} às {new Date(termo.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
                </div>
          {termo.updated_at && (
                  <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>ÚLTIMA ATUALIZAÇÃO</p>
              <p style={{ fontWeight: '500', color: '#1f2937', margin: '0', fontSize: '14px' }}>
                {new Date(termo.updated_at).toLocaleDateString('pt-BR')} às {new Date(termo.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
                  </div>
                )}
          {termo.auth_user_id && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 4px 0' }}>USUÁRIO CRIADOR</p>
              <p style={{ fontFamily: 'monospace', fontWeight: '500', color: '#1f2937', margin: '0', fontSize: '14px' }}>{termo.auth_user_id}</p>
                  </div>
                )}
              </div>
            </div>

      {/* RODAPÉ FINAL */}
      <div style={{ 
        background: '#1f2937',
        color: 'white',
        padding: '24px',
        borderRadius: '8px',
        textAlign: 'center',
        marginTop: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🌱</span>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>ECOFIELD SYSTEM</h3>
            </div>
        <p style={{ color: '#d1d5db', margin: '0 0 12px 0', fontSize: '16px' }}>Sistema Inteligente de Gestão</p>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0' }}>
          Documento gerado automaticamente em {new Date().toLocaleDateString('pt-BR')}, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0' }}>
          Termo validado digitalmente
        </p>
        <div style={{ borderTop: '1px solid #374151', paddingTop: '16px' }}>
          <p style={{ fontSize: '10px', color: '#6b7280', margin: '0' }}>
              ID: {termo.id} | Nº Sequencial: {termo.numero_sequencial || 'N/A'}
            </p>
          </div>
        </div>
    </div>
  );

  // ===================================================================
  // RENDER PRINCIPAL
  // ===================================================================
  return (
    <Modal
      isOpen={aberto}
      onClose={onClose}
      title=""
      size="full"
      showCloseButton={false}
      headerClassName="hidden"
      className="!p-0 max-w-none w-full h-full"
    >
      {/* CABEÇALHO COM NAVEGAÇÃO */}
      <div className="bg-gray-50 p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center text-lg sm:text-xl text-white flex-shrink-0">
            {tipoInfo.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">{tipoInfo.label}</h1>
            <p className="text-gray-600 text-xs sm:text-sm truncate">Número do Termo: {termo.numero_termo || 'Pendente'}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* NAVEGAÇÃO ENTRE PÁGINAS */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setPaginaAtual(1)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                paginaAtual === 1 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Página 1</span>
              <span className="sm:hidden">P1</span>
            </button>
            <button
              onClick={() => setPaginaAtual(2)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                paginaAtual === 2 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">Página 2</span>
              <span className="sm:hidden">P2</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-xs sm:text-sm"
            >
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Fechar</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={carregando === 'pdf'}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">PDF</span>
              {carregando === 'pdf' && <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"></div>}
            </button>
          </div>
        </div>
      </div>

      {erro && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{erro}</span>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA PÁGINA ATUAL */}
      <div className="p-2 sm:p-6 max-h-[calc(100vh-140px)] overflow-y-auto">
        {paginaAtual === 1 ? renderPagina1() : renderPagina2()}
      </div>

      {/* RODAPÉ COM INDICADOR DE PÁGINA */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-2 sm:p-4 border-t border-gray-200 bg-gray-50 gap-2">
        <div className="text-xs sm:text-sm text-gray-600">
          Visualizando página {paginaAtual} de 2
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-xs sm:text-sm text-gray-600">
            Modo visualização
          </span>
        </div>
      </div>

      {/* ELEMENTOS OCULTOS PARA PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        {renderPagina1()}
        {renderPagina2()}
      </div>
    </Modal>
  );
};

export default ModalDetalhesTermo;