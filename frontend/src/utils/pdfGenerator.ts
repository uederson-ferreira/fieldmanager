// ===================================================================
// PDF GENERATOR - FRONTEND COM html2canvas + jsPDF
// Localização: frontend/src/utils/pdfGenerator.ts
// ===================================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  filename?: string;
  scale?: number;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
  
  /**
   * Captura um elemento HTML e converte para PDF
   * @param elementId ID do elemento a ser capturado
   * @param options Opções de configuração do PDF
   */
  public static async captureElementToPDF(
    elementId: string, 
    options: PDFOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = 'documento.pdf',
        scale = 2,
        quality = 0.95,
        format = 'a4',
        orientation = 'portrait'
      } = options;

      console.log('📸 [PDF GENERATOR] Iniciando captura do elemento:', elementId);

      // 1. Encontrar o elemento
      const elemento = document.getElementById(elementId);
      if (!elemento) {
        throw new Error(`Elemento com ID "${elementId}" não encontrado`);
      }

      // 2. Preparar elemento para captura
      this.prepareElementForCapture(elemento);

      // 3. Capturar como imagem com alta qualidade
      console.log('📷 [PDF GENERATOR] Capturando elemento como imagem...');
      const canvas = await html2canvas(elemento, {
        scale: scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        removeContainer: false,
        foreignObjectRendering: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Garantir que estilos sejam aplicados no clone
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            this.applyPrintStyles(clonedElement);
          }
        }
      });

      // 4. Criar PDF
      console.log('📄 [PDF GENERATOR] Criando PDF...');
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format,
        compress: true
      });

      // 5. Calcular dimensões
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 6. Adicionar imagem ao PDF
      const imgData = canvas.toDataURL('image/jpeg', quality);
      
      if (imgHeight <= pdfHeight) {
        // Cabe em uma página
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Múltiplas páginas
        let position = 0;
        const pageHeight = pdfHeight;
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData, 
            'JPEG', 
            0, 
            -position, 
            imgWidth, 
            imgHeight
          );
          
          position += pageHeight;
        }
      }

      // 7. Download do PDF
      pdf.save(filename);
      
      console.log('✅ [PDF GENERATOR] PDF gerado com sucesso:', {
        filename,
        pages: pdf.getNumberOfPages(),
        size: `${imgWidth.toFixed(0)}x${imgHeight.toFixed(0)}mm`
      });

    } catch (error) {
      console.error('❌ [PDF GENERATOR] Erro ao gerar PDF:', error);
      throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Prepara elemento para captura otimizada
   */
  private static prepareElementForCapture(elemento: HTMLElement): void {
    // Garantir que o elemento esteja visível
    elemento.style.visibility = 'visible';
    elemento.style.opacity = '1';
    
    // Forçar layout
    elemento.offsetHeight;
    
    // Aguardar imagens carregarem
    const images = elemento.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        console.log('⏳ [PDF GENERATOR] Aguardando imagem carregar:', img.src);
      }
    });
  }

  /**
   * Aplica estilos específicos para impressão
   */
  private static applyPrintStyles(elemento: HTMLElement): void {
    // Estilos inline para garantir renderização
    elemento.style.backgroundColor = '#ffffff';
    elemento.style.color = '#000000';
    
    // Garantir que gradientes sejam renderizados
    const gradientElements = elemento.querySelectorAll('[class*="gradient"]');
    gradientElements.forEach(el => {
      (el as HTMLElement).style.background = '#f8fafc';
    });
  }

  /**
   * Versão específica para termos
   */
  public static async gerarPDFTermo(
    termoId: string, 
    numeroTermo: string
  ): Promise<void> {
    try {
      await this.captureElementToPDF('modal-content-to-print', {
        filename: `termo-${numeroTermo || termoId}.pdf`,
        scale: 2,
        quality: 0.92,
        format: 'a4',
        orientation: 'portrait'
      });
    } catch (error) {
      throw new Error(`Erro ao gerar PDF do termo: ${error}`);
    }
  }

  /**
   * Preview antes de gerar PDF
   */
  public static async previewPDF(elementId: string): Promise<string> {
    try {
      const elemento = document.getElementById(elementId);
      if (!elemento) {
        throw new Error('Elemento não encontrado');
      }

      const canvas = await html2canvas(elemento, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      throw new Error(`Erro no preview: ${error}`);
    }
  }
}

// ===================================================================
// FUNÇÃO HELPER PARA USAR NOS COMPONENTES
// ===================================================================

export const gerarPDFDoModal = async (termoId: string, numeroTermo?: string) => {
  try {
    console.log('🚀 [PDF GENERATOR] Iniciando gerarPDFDoModal...');
    console.log('📄 [PDF GENERATOR] Termo ID:', termoId);
    console.log('📄 [PDF GENERATOR] Número Termo:', numeroTermo);
    
    await PDFGenerator.gerarPDFTermo(termoId, numeroTermo || termoId);
    
    console.log('✅ [PDF GENERATOR] PDF gerado com sucesso via nova implementação');
  } catch (error) {
    console.error('❌ [PDF GENERATOR] Erro ao gerar PDF:', error);
    throw error;
  }
};

export const previewPDFDoModal = async () => {
  try {
    return await PDFGenerator.previewPDF('modal-content-to-print');
  } catch (error) {
    console.error('Erro no preview:', error);
    throw error;
  }
}; 