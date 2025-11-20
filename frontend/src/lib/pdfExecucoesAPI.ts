// ===================================================================
// API DE GERAÇÃO DE PDF - FIELDMANAGER v2.0
// Gera relatórios PDF das execuções com fotos e formatação profissional
// ===================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExecucaoParaPDF {
  numero_documento: string;
  data_execucao: string;
  status: string;
  local_atividade?: string;
  responsavel_tecnico?: string;
  observacoes?: string;
  modulos?: {
    nome: string;
    descricao?: string;
    codigo?: string;
  };
  respostas?: Array<{
    pergunta_codigo: string;
    resposta: string;
    observacao?: string;
    pergunta?: {
      pergunta: string;
      categoria?: string;
    };
  }>;
  campos_customizados?: {
    empresa?: string;
    fotos?: Array<{
      url: string;
      nome?: string;
      pergunta_codigo?: string;
      descricao?: string;
    }>;
  };
}

interface PDFOptions {
  incluirFotos?: boolean;
  incluirCabecalho?: boolean;
  incluirRodape?: boolean;
  titulo?: string;
  subtitulo?: string;
  logoUrl?: string;
}

/**
 * Converte imagem URL para base64 (necessário para jsPDF)
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao converter imagem para base64:', error);
    throw error;
  }
}

/**
 * Redimensionar imagem mantendo aspect ratio
 */
function calcularDimensoesImagem(
  larguraOriginal: number,
  alturaOriginal: number,
  larguraMax: number,
  alturaMax: number
): { width: number; height: number } {
  const ratio = Math.min(larguraMax / larguraOriginal, alturaMax / alturaOriginal);
  return {
    width: larguraOriginal * ratio,
    height: alturaOriginal * ratio
  };
}

/**
 * Adicionar cabeçalho ao PDF
 */
function adicionarCabecalho(
  doc: jsPDF,
  titulo: string,
  subtitulo?: string,
  logoUrl?: string
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Fundo do cabeçalho
  doc.setFillColor(16, 185, 129); // Verde emerald-500
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 15, 15);

  // Subtítulo
  if (subtitulo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo, 15, 25);
  }

  // Data de geração
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 15, 15, { align: 'right' });

  // Logo (se fornecido)
  // TODO: Implementar quando logoUrl for fornecido
}

/**
 * Adicionar rodapé ao PDF
 */
function adicionarRodape(doc: jsPDF, numeroPagina: number, totalPaginas: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

  // Texto do rodapé
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  doc.text('FieldManager v2.0 - Sistema de Gestão de Execuções', 15, pageHeight - 10);
  doc.text(`Página ${numeroPagina} de ${totalPaginas}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
}

/**
 * Gerar PDF da execução
 */
export async function gerarPDFExecucao(
  execucao: ExecucaoParaPDF,
  options: PDFOptions = {}
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    console.log('📄 [PDF] Iniciando geração de PDF...');

    const {
      incluirFotos = true,
      incluirCabecalho = true,
      incluirRodape = true,
      titulo = 'Relatório de Execução',
      subtitulo = execucao.modulos?.nome
    } = options;

    // Criar documento PDF (A4)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = incluirCabecalho ? 45 : 20;

    // Cabeçalho
    if (incluirCabecalho) {
      adicionarCabecalho(doc, titulo, subtitulo);
    }

    // ===================================================================
    // INFORMAÇÕES GERAIS
    // ===================================================================

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações Gerais', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const infoGerais = [
      ['Documento:', execucao.numero_documento || 'N/A'],
      ['Data de Execução:', new Date(execucao.data_execucao).toLocaleString('pt-BR')],
      ['Status:', execucao.status === 'concluido' ? 'Concluído' : 'Rascunho'],
      ['Módulo:', execucao.modulos?.nome || 'N/A'],
      ['Código:', execucao.modulos?.codigo || 'N/A']
    ];

    if (execucao.local_atividade) {
      infoGerais.push(['Local:', execucao.local_atividade]);
    }
    if (execucao.responsavel_tecnico) {
      infoGerais.push(['Responsável:', execucao.responsavel_tecnico]);
    }
    if (execucao.campos_customizados?.empresa) {
      infoGerais.push(['Empresa:', execucao.campos_customizados.empresa]);
    }

    // Tabela de informações gerais
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: infoGerais,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // ===================================================================
    // RESPOSTAS DO CHECKLIST
    // ===================================================================

    if (execucao.respostas && execucao.respostas.length > 0) {
      // Verificar se precisa de nova página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Respostas do Checklist', 15, yPosition);
      yPosition += 10;

      // Calcular estatísticas
      const conformes = execucao.respostas.filter(r => r.resposta === 'C').length;
      const naoConformes = execucao.respostas.filter(r => r.resposta === 'NC').length;
      const naoAplicaveis = execucao.respostas.filter(r => r.resposta === 'NA').length;
      const total = conformes + naoConformes + naoAplicaveis;
      const taxaConformidade = total > 0 ? Math.round((conformes / (conformes + naoConformes)) * 100) : 0;

      // Box de estatísticas
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(15, yPosition, pageWidth - 30, 20, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${total}`, 20, yPosition + 7);

      doc.setTextColor(16, 185, 129); // Verde
      doc.text(`Conformes: ${conformes}`, 55, yPosition + 7);

      doc.setTextColor(239, 68, 68); // Vermelho
      doc.text(`Não Conformes: ${naoConformes}`, 100, yPosition + 7);

      doc.setTextColor(156, 163, 175); // Cinza
      doc.text(`N/A: ${naoAplicaveis}`, 160, yPosition + 7);

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Taxa de Conformidade:', 20, yPosition + 15);

      // Cor baseada na taxa
      if (taxaConformidade >= 90) {
        doc.setTextColor(16, 185, 129); // Verde
      } else if (taxaConformidade >= 75) {
        doc.setTextColor(245, 158, 11); // Amarelo
      } else {
        doc.setTextColor(239, 68, 68); // Vermelho
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${taxaConformidade}%`, 75, yPosition + 15);
      doc.setTextColor(0, 0, 0);

      yPosition += 25;

      // Tabela de respostas
      const respostasData = execucao.respostas.map(r => [
        r.pergunta_codigo,
        r.pergunta?.pergunta || 'N/A',
        r.resposta === 'C' ? 'Conforme' : r.resposta === 'NC' ? 'Não Conforme' : 'N/A',
        r.observacao || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Código', 'Pergunta', 'Resposta', 'Observação']],
        body: respostasData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 55 }
        },
        didParseCell: (data) => {
          // Colorir coluna de resposta
          if (data.column.index === 2 && data.section === 'body') {
            const resposta = respostasData[data.row.index][2];
            if (resposta === 'Conforme') {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
            } else if (resposta === 'Não Conforme') {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [156, 163, 175];
            }
          }
        },
        margin: { left: 15, right: 15 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // ===================================================================
    // OBSERVAÇÕES GERAIS
    // ===================================================================

    if (execucao.observacoes) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações Gerais', 15, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const observacoesLinhas = doc.splitTextToSize(execucao.observacoes, pageWidth - 30);
      doc.text(observacoesLinhas, 15, yPosition);
      yPosition += observacoesLinhas.length * 5 + 10;
    }

    // ===================================================================
    // FOTOS (se habilitado)
    // ===================================================================

    if (incluirFotos && execucao.campos_customizados?.fotos && execucao.campos_customizados.fotos.length > 0) {
      const fotos = execucao.campos_customizados.fotos;

      console.log(`📸 [PDF] Incluindo ${fotos.length} fotos...`);

      // Nova página para fotos
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Evidências Fotográficas (${fotos.length})`, 15, yPosition);
      yPosition += 10;

      // Grid de fotos (2 por linha)
      const fotosPerRow = 2;
      const fotoWidth = (pageWidth - 40) / fotosPerRow;
      const fotoHeight = fotoWidth * 0.75; // Aspect ratio 4:3
      let xPosition = 15;
      let fotoCount = 0;

      for (const foto of fotos) {
        try {
          // Verificar se precisa de nova página
          if (yPosition + fotoHeight + 20 > 280) {
            doc.addPage();
            yPosition = 20;
            xPosition = 15;
            fotoCount = 0;
          }

          // Converter URL para base64
          const imgBase64 = await imageUrlToBase64(foto.url);

          // Adicionar imagem
          doc.addImage(imgBase64, 'JPEG', xPosition, yPosition, fotoWidth - 5, fotoHeight);

          // Legenda da foto
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const legenda = foto.pergunta_codigo
            ? `${foto.pergunta_codigo}${foto.descricao ? ` - ${foto.descricao}` : ''}`
            : (foto.nome || 'Foto');
          const legendaLinhas = doc.splitTextToSize(legenda, fotoWidth - 10);
          doc.text(legendaLinhas, xPosition + 2, yPosition + fotoHeight + 5);

          fotoCount++;
          xPosition += fotoWidth;

          // Próxima linha
          if (fotoCount >= fotosPerRow) {
            yPosition += fotoHeight + 15;
            xPosition = 15;
            fotoCount = 0;
          }

        } catch (error) {
          console.warn(`⚠️ [PDF] Erro ao incluir foto ${foto.nome}:`, error);
        }
      }

      console.log('✅ [PDF] Fotos incluídas com sucesso');
    }

    // ===================================================================
    // RODAPÉ EM TODAS AS PÁGINAS
    // ===================================================================

    if (incluirRodape) {
      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        adicionarRodape(doc, i, totalPaginas);
      }
    }

    // ===================================================================
    // GERAR BLOB
    // ===================================================================

    const blob = doc.output('blob');
    console.log('✅ [PDF] Geração concluída');

    return { success: true, blob };

  } catch (error) {
    console.error('❌ [PDF] Erro ao gerar PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar PDF'
    };
  }
}

/**
 * Download direto do PDF
 */
export function downloadPDF(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Preview do PDF em nova aba
 */
export function previewPDF(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
