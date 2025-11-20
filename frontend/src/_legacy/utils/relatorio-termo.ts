// ===================================================================
// UTILITÁRIOS DE RELATÓRIO DE TERMO AMBIENTAL
// Localização: src/utils/relatorio-termo.ts
// Módulo: Geração, download e impressão de relatórios de termos
// ===================================================================

import type { TermoAmbiental, TermoFoto } from '../types/termos';

// ===================================================================
// INTERFACES E TIPOS
// ===================================================================

interface StatusConfig {
  label: string;
  className: string;
  bgColor: string;
  textColor: string;
}

// ===================================================================
// MAPAS E CONFIGURAÇÕES
// ===================================================================

const statusMap: Record<string, StatusConfig> = {
  PENDENTE: { 
    label: 'Pendente', 
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900'
  },
  EM_ANDAMENTO: { 
    label: 'Em Andamento', 
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900'
  },
  CORRIGIDO: { 
    label: 'Corrigido', 
    className: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-900'
  },
  LIBERADO: { 
    label: 'Liberado', 
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900'
  },
};

const tipoTermoMap: Record<string, { label: string; icon: string; color: string }> = {
  PARALIZACAO_TECNICA: { 
    label: 'Paralização Técnica', 
    icon: '🛑', 
    color: 'text-red-600' 
  },
  NOTIFICACAO: { 
    label: 'Notificação', 
    icon: '📢', 
    color: 'text-orange-600' 
  },
  RECOMENDACAO: { 
    label: 'Recomendação', 
    icon: '💡', 
    color: 'text-blue-600' 
  },
};

const naturezaDesvioMap: Record<string, string> = {
  OCORRENCIA_REAL: 'Ocorrência Real',
  QUASE_ACIDENTE_AMBIENTAL: 'Quase Acidente',
  POTENCIAL_NAO_CONFORMIDADE: 'Potencial Não Conformidade',
};

const severidadeMap: Record<string, { label: string; className: string }> = {
  MA: { label: 'Muito Alto', className: 'bg-red-600 text-white' },
  A: { label: 'Alto', className: 'bg-orange-500 text-white' },
  M: { label: 'Moderado', className: 'bg-yellow-500 text-white' },
  B: { label: 'Baixo', className: 'bg-green-500 text-white' },
  PE: { label: 'Pequenos Eventos', className: 'bg-gray-500 text-white' },
};

// ===================================================================
// FUNÇÕES AUXILIARES
// ===================================================================

/**
 * Extrai não conformidades do termo
 */
const extrairNaoConformidades = (termo: TermoAmbiental) => {
  const naoConformidades = [];
  const termoObj = (termo as unknown) as Record<string, unknown>;
  for (let i = 1; i <= 10; i++) {
    const descricao = termoObj[`descricao_nc_${i}`] as string | undefined;
    const severidade = termoObj[`severidade_nc_${i}`] as string | undefined;
    if (descricao?.trim()) {
      naoConformidades.push({
        numero: i,
        descricao: descricao.trim(),
        severidade: severidade || 'M'
      });
    }
  }
  return naoConformidades;
};

/**
 * Extrai ações corretivas do termo
 */
const extrairAcoesCorrecao = (termo: TermoAmbiental) => {
  const acoesCorrecao = [];
  const termoObj = (termo as unknown) as Record<string, unknown>;
  for (let i = 1; i <= 10; i++) {
    const acao = termoObj[`acao_correcao_${i}`] as string | undefined;
    const prazo = termoObj[`prazo_acao_${i}`] as string | undefined;
    if (acao?.trim()) {
      acoesCorrecao.push({
        numero: i,
        descricao: acao.trim(),
        prazo: prazo ? new Date(prazo).toLocaleDateString('pt-BR') : null
      });
    }
  }
  return acoesCorrecao;
};

/**
 * Formata data para exibição
 */
const formatarData = (data: string | Date): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

/**
 * Gera CSS para o relatório
 */
const gerarCSS = (): string => {
  return `
    <style>
      @media print {
        body { 
          margin: 0; 
          padding: 0;
        }
        .no-print { display: none !important; }
        .page-break { page-break-before: always; }
        @page {
          size: A4;
          margin: 10mm;
        }
      }
      
      body {
        font-family: Arial, sans-serif;
        line-height: 1.4;
        color: #333;
        max-width: 210mm;
        margin: 0 auto;
        padding: 10px;
      }
      
      .header {
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .header h1 {
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: bold;
      }
      
      .header-info {
        margin: 15px 0;
        text-align: center;
      }
      
      .header-row {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 8px 0;
        flex-wrap: wrap;
      }
      
      .header-row span {
        opacity: 0.9;
        font-size: 14px;
      }
      
      .section {
        margin-bottom: 20px;
        border-left: 4px solid #059669;
        padding-left: 15px;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: bold;
        color: #047857;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
      }
      
      .section-title .icon {
        margin-right: 10px;
        font-size: 20px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin-bottom: 15px;
      }
      
      .info-item {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px;
      }
      
      .info-label {
        font-weight: bold;
        color: #6b7280;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
      }
      
      .info-value {
        color: #1f2937;
        font-size: 14px;
        word-wrap: break-word;
      }
      
      .status-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .status-pendente { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
      .status-andamento { background: #dbeafe; color: #1e40af; border: 1px solid #60a5fa; }
      .status-corrigido { background: #d1fae5; color: #065f46; border: 1px solid #34d399; }
      .status-liberado { background: #e9d5ff; color: #7c2d12; border: 1px solid #c084fc; }
      
      .nc-item {
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 0 8px 8px 0;
      }
      
      .nc-header {
        display: flex;
        justify-content: between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .nc-number {
        background: #dc2626;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .severidade-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .severidade-ma { background: #dc2626; color: white; }
      .severidade-a { background: #f97316; color: white; }
      .severidade-m { background: #eab308; color: white; }
      .severidade-b { background: #16a34a; color: white; }
      .severidade-pe { background: #6b7280; color: white; }
      
      .acao-item {
        background: #f0fdf4;
        border-left: 4px solid #16a34a;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 0 8px 8px 0;
      }
      
      .acao-header {
        display: flex;
        justify-content: between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .acao-number {
        background: #16a34a;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .prazo-badge {
        background: #2563eb;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
      }
      
      .assinaturas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 25px;
      }
      
      .assinatura-box {
        text-align: center;
        padding: 20px;
        border: 2px solid #d1d5db;
        border-radius: 8px;
      }
      
      .assinatura-linha {
        border-top: 2px solid #374151;
        margin: 0 30px 10px 30px;
      }
      
      .assinatura-nome {
        font-weight: bold;
        color: #1f2937;
      }
      
      .assinatura-cargo {
        font-size: 12px;
        color: #6b7280;
      }
      
      .assinatura-status {
        margin-top: 8px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .assinado { color: #16a34a; }
      .pendente { color: #f59e0b; }
      
      .fotos-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      
      .foto-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        background: white;
      }
      
      .foto-item img {
        width: 100%;
        height: 180px;
        object-fit: cover;
      }
      
      .foto-info {
        padding: 12px;
      }
      
      .foto-categoria {
        background: #d1fae5;
        color: #065f46;
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        display: inline-block;
        margin-bottom: 6px;
      }
      
      .foto-descricao {
        font-size: 12px;
        color: #6b7280;
      }
      
      .footer {
        background: #f9fafb;
        padding: 20px;
        border-radius: 8px;
        border-top: 3px solid #059669;
        text-align: center;
        margin-top: 40px;
        font-size: 12px;
        color: #6b7280;
      }
      
      .footer strong {
        color: #047857;
        display: block;
        margin-bottom: 5px;
      }
      
      .text-content {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #e9ecef;
        white-space: pre-wrap;
        line-height: 1.6;
      }
      
      @media print {
        .header { break-inside: avoid; }
        .section { break-inside: avoid; margin-bottom: 10px !important; }
        .info-grid { break-inside: avoid; }
        .nc-item { break-inside: avoid; }
        .acao-item { break-inside: avoid; }
        .assinaturas { break-inside: avoid; }
        .footer { margin-top: 10px !important; }
      }
      
      @media (max-width: 768px) {
        .fotos-grid {
          grid-template-columns: 1fr;
        }
        .header-row {
          flex-direction: column;
          gap: 5px;
        }
        .header-row span {
          font-size: 12px;
        }
      }
    </style>
  `;
};

// ===================================================================
// FUNÇÕES PRINCIPAIS
// ===================================================================

/**
 * Gera HTML completo do relatório do termo
 */
export const gerarRelatorioTermo = async (
  termo: TermoAmbiental, 
  fotos: TermoFoto[] = []
): Promise<string> => {
  try {
    const statusInfo = statusMap[termo.status] || statusMap.PENDENTE;
    const tipoInfo = tipoTermoMap[termo.tipo_termo] || { 
      label: termo.tipo_termo, 
      icon: '📄', 
      color: 'text-gray-600' 
    };

    const naoConformidades = extrairNaoConformidades(termo);
    const acoesCorrecao = extrairAcoesCorrecao(termo);

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório - ${tipoInfo.label} Número do Termo: ${termo.numero_termo} • Número Sequencial do Termo: ${termo.numero_sequencial}</title>
        ${gerarCSS()}
      </head>
      <body>
        <!-- CABEÇALHO -->
        <div class="header">
          <h1>${tipoInfo.icon} ${tipoInfo.label}</h1>
          <div class="header-info">
            <div class="header-row">
              <span><strong>Número do Termo:</strong> ${termo.numero_termo || 'Pendente'}</span>
              <span><strong>Número Sequencial:</strong> ${termo.numero_sequencial || 'Pendente'}</span>
            </div>
            <div class="header-row">
              <span><strong>Data de Cadastro:</strong> ${formatarData(termo.data_termo)}</span>
              <span><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <span class="status-badge status-${termo.status.toLowerCase().replace('_', '-')}">
            ${statusInfo.label}
          </span>
        </div>

        <!-- INFORMAÇÕES BÁSICAS -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">📋</span>
            Informações Básicas
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Data do Termo</div>
              <div class="info-value">${formatarData(termo.data_termo)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hora</div>
              <div class="info-value">${termo.hora_termo || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Local da Atividade</div>
              <div class="info-value">${termo.local_atividade || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Projeto/BA</div>
              <div class="info-value">${termo.projeto_ba || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fase/Etapa da Obra</div>
              <div class="info-value">${termo.fase_etapa_obra || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Natureza do Desvio</div>
              <div class="info-value">${naturezaDesvioMap[termo.natureza_desvio] || termo.natureza_desvio || '-'}</div>
            </div>
          </div>
        </div>

        <!-- PESSOAS ENVOLVIDAS -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">👥</span>
            Pessoas Envolvidas
          </h2>
          
          <h3>📤 Emitido Por (De)</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nome</div>
              <div class="info-value">${termo.emitido_por_nome || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Empresa</div>
              <div class="info-value">${termo.emitido_por_empresa || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gerência</div>
              <div class="info-value">${termo.emitido_por_gerencia || '-'}</div>
            </div>
          </div>

          <h3>📥 Destinatário (Para)</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nome</div>
              <div class="info-value">${termo.destinatario_nome || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Empresa</div>
              <div class="info-value">${termo.destinatario_empresa || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gerência</div>
              <div class="info-value">${termo.destinatario_gerencia || '-'}</div>
            </div>
          </div>
        </div>

        <!-- LOCALIZAÇÃO -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">📍</span>
            Localização e Contexto
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Área/Equipamento/Atividade</div>
              <div class="info-value">${termo.area_equipamento_atividade || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Equipe</div>
              <div class="info-value">${termo.equipe || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Atividade Específica</div>
              <div class="info-value">${termo.atividade_especifica || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">TST/TMA Responsável</div>
              <div class="info-value">${termo.tst_tma_responsavel || '-'}</div>
            </div>
          </div>
        </div>

        ${naoConformidades.length > 0 ? `
        <!-- NÃO CONFORMIDADES -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">⚠️</span>
            Não Conformidades Identificadas
          </h2>
          ${naoConformidades.map(nc => {
            const sevInfo = severidadeMap[nc.severidade] || severidadeMap.M;
            return `
              <div class="nc-item">
                <div class="nc-header">
                  <span class="nc-number">NC ${nc.numero}</span>
                  <span class="severidade-badge severidade-${nc.severidade.toLowerCase()}">
                    ${sevInfo.label}
                  </span>
                </div>
                <p>${nc.descricao}</p>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}

        ${termo.lista_verificacao_aplicada ? `
        <!-- LISTA DE VERIFICAÇÃO -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">📝</span>
            Lista de Verificação Aplicada
          </h2>
          <div class="text-content">${termo.lista_verificacao_aplicada}</div>
        </div>
        ` : ''}

        ${acoesCorrecao.length > 0 ? `
        <!-- AÇÕES CORRETIVAS -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">🔧</span>
            Ações para Correção
          </h2>
          ${acoesCorrecao.map(acao => `
            <div class="acao-item">
              <div class="acao-header">
                <span class="acao-number">Ação ${acao.numero}</span>
                ${acao.prazo ? `<span class="prazo-badge">Prazo: ${acao.prazo}</span>` : ''}
              </div>
              <p>${acao.descricao}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${termo.providencias_tomadas ? `
        <!-- PROVIDÊNCIAS -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">🛠️</span>
            Providências Tomadas
          </h2>
          <div class="text-content">${termo.providencias_tomadas}</div>
        </div>
        ` : ''}

        ${termo.observacoes ? `
        <!-- OBSERVAÇÕES -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">💬</span>
            Observações
          </h2>
          <div class="text-content">${termo.observacoes}</div>
        </div>
        ` : ''}

        ${termo.tipo_termo === 'PARALIZACAO_TECNICA' && termo.liberacao_nome ? `
        <!-- LIBERAÇÃO -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">🔓</span>
            Liberação para Retomada das Atividades
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Liberado Por</div>
              <div class="info-value">${termo.liberacao_nome || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Empresa</div>
              <div class="info-value">${termo.liberacao_empresa || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gerência</div>
              <div class="info-value">${termo.liberacao_gerencia || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data da Liberação</div>
              <div class="info-value">${termo.liberacao_data ? formatarData(termo.liberacao_data) : '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Horário</div>
              <div class="info-value">${termo.liberacao_horario || '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Assinatura/Carimbo</div>
              <div class="info-value">${termo.liberacao_assinatura_carimbo ? 'Sim' : 'Não'}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${fotos && fotos.length > 0 ? `
        <!-- FOTOS -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">📸</span>
            Fotos e Evidências
          </h2>
          ${(() => {
            // Agrupar fotos em pares
            const fotosAgrupadas = [];
            for (let i = 0; i < fotos.length; i += 2) {
              fotosAgrupadas.push(fotos.slice(i, i + 2));
            }
            
            return fotosAgrupadas.map((parFotos, grupoIdx) => `
              <div class="fotos-grid" style="margin-bottom: ${grupoIdx < fotosAgrupadas.length - 1 ? '20px' : '0'}">
                ${parFotos.map(foto => `
                  <div class="foto-item">
                    <img src="${foto.url_arquivo}" alt="${foto.nome_arquivo || 'Foto'}" />
                    <div class="foto-info">
                      <div class="foto-categoria">${foto.categoria || 'Geral'}</div>
                      ${foto.descricao ? `<div class="foto-descricao">${foto.descricao}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `).join('');
          })()}
        </div>
        ` : ''}

        <!-- ASSINATURAS -->
        <div class="section">
          <h2 class="section-title">
            <span class="icon">✍️</span>
            Assinaturas
          </h2>
          <div class="assinaturas">
            <div class="assinatura-box">
              ${termo.assinatura_emitente_img ? `
                <img src="${termo.assinatura_emitente_img}" alt="Assinatura Emitente" style="max-width:220px;max-height:80px;margin:10px auto 0 auto;display:block;" />
              ` : ''}
              <div class="assinatura-linha"></div>
              <div class="assinatura-nome">${termo.emitido_por_nome || '-'}</div>
              <div class="assinatura-cargo">Emitente - ${formatarData(termo.data_termo)}</div>
              ${termo.assinatura_emitente_img ? `
                <div class="assinatura-status assinado">✅ Assinado</div>
              ` : `
                <div class="assinatura-status pendente">⏳ Pendente</div>
              `}
            </div>
            <div class="assinatura-box">
              ${termo.assinatura_responsavel_area_img ? `
                <img src="${termo.assinatura_responsavel_area_img}" alt="Assinatura Responsável da Área" style="max-width:220px;max-height:80px;margin:10px auto 0 auto;display:block;" />
              ` : ''}
              <div class="assinatura-linha"></div>
              <div class="assinatura-nome">${termo.destinatario_nome || '-'}</div>
              <div class="assinatura-cargo">Responsável da Área - ${formatarData(termo.data_termo)}</div>
              ${termo.assinatura_responsavel_area_img ? `
                <div class="assinatura-status assinado">✅ Assinado</div>
              ` : `
                <div class="assinatura-status pendente">⏳ Pendente</div>
              `}
            </div>
          </div>
        </div>

        <!-- RODAPÉ -->
        <div class="footer">
          <strong>EcoField - Sistema de Gestão</strong>
          <div>
            ${tipoInfo.label} • Número do Termo: ${termo.numero_termo || 'Pendente'} • Número Sequencial: ${termo.numero_sequencial || 'Pendente'}
            • Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error('Erro ao gerar HTML do relatório:', error);
    throw new Error('Falha ao gerar relatório HTML');
  }
};

/**
 * Imprime o relatório do termo
 */
export const imprimirRelatorioTermo = async (
  termo: TermoAmbiental, 
  fotos: TermoFoto[] = []
): Promise<void> => {
  try {
    const html = await gerarRelatorioTermo(termo, fotos);
    
    // Criar janela de impressão
    const janelaImpressao = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    
    if (!janelaImpressao) {
      throw new Error('Não foi possível abrir a janela de impressão');
    }

    janelaImpressao.document.write(html);
    janelaImpressao.document.close();

    // Aguardar carregamento e imprimir
    janelaImpressao.onload = () => {
      janelaImpressao.print();
    };

    // Fechar janela após impressão (opcional)
    janelaImpressao.onafterprint = () => {
      janelaImpressao.close();
    };

  } catch (error) {
    console.error('Erro ao imprimir relatório:', error);
    throw new Error('Falha ao imprimir relatório');
  }
};

/**
 * Faz download do relatório como HTML
 */
export const downloadRelatorioTermo = async (
  termo: TermoAmbiental, 
  fotos: TermoFoto[] = []
): Promise<void> => {
  try {
    const html = await gerarRelatorioTermo(termo, fotos);
    const tipoInfo = tipoTermoMap[termo.tipo_termo] || { label: termo.tipo_termo };
    
    // Criar blob com o HTML
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    
    // Criar URL temporária
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tipoInfo.label.replace(/\s+/g, '_')}_${termo.numero_sequencial}_${new Date().toISOString().split('T')[0]}.html`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Erro ao fazer download do relatório:', error);
    throw new Error('Falha ao fazer download do relatório');
  }
};
