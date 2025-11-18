/**
 * Utilitário para compartilhamento via WhatsApp
 * Suporta Web Share API, URLs específicas por dispositivo e fallbacks
 */

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export class WhatsAppSharer {
  /**
   * Compartilha conteúdo via WhatsApp ou apps nativos
   */
  static async share(data: ShareData): Promise<boolean> {
    try {
      const isMobile = this.isMobileDevice();
      
      console.log('📱 Iniciando compartilhamento:', {
        isMobile,
        userAgent: navigator.userAgent,
        hasWebShare: 'share' in navigator,
        messageLength: data.text.length
      });

      // PRIMEIRA OPÇÃO: Web Share API (melhor para mobile)
      if ('share' in navigator && isMobile) {
        try {
          const shareData = {
            title: data.title,
            text: data.text,
            url: data.url || window.location.href
          };

          await navigator.share(shareData);
          console.log('✅ Compartilhamento via Web Share API realizado');
          return true;
        } catch (shareError) {
          console.log('⚠️ Web Share API falhou, tentando método alternativo:', shareError);
        }
      }

      // SEGUNDA OPÇÃO: WhatsApp direto com URLs específicas
      const mensagemCodificada = encodeURIComponent(data.text);
      
      // Estratégia múltipla: tentar várias URLs
      const urlsParaTestar = [
        this.getWhatsAppUrl(mensagemCodificada, isMobile),
        `https://wa.me/?text=${mensagemCodificada}`, // Fallback universal
      ];
      
      // Se é mobile e Android, adicionar mais opções
      if (isMobile && /Android/i.test(navigator.userAgent)) {
        urlsParaTestar.unshift(`whatsapp://send?text=${mensagemCodificada}`);
      }
      
      console.log('🔗 [WHATSAPP] URLs para testar:', urlsParaTestar);
      
      // Tentar abrir a primeira URL
      const whatsappUrl = urlsParaTestar[0];
      console.log('🚀 [WHATSAPP] Tentando abrir:', whatsappUrl);
      
      const newWindow = window.open(whatsappUrl, '_blank');
      
      // Verificar se a janela foi aberta
      if (!newWindow) {
        console.log('⚠️ [WHATSAPP] Popup bloqueado, tentando fallback para clipboard...');
        return await this.fallbackToClipboard(data.text);
      } else {
        console.log('✅ [WHATSAPP] Janela aberta com sucesso');
        
        // Para mobile, aguardar e verificar se conseguiu abrir o app
        if (isMobile) {
          setTimeout(() => {
            if (newWindow.closed) {
              console.log('✅ [WHATSAPP] App foi aberto (janela fechou)');
            } else {
              console.log('⚠️ [WHATSAPP] Possível problema - janela ainda aberta, tentando URL alternativa');
              // Se a janela ainda está aberta após 2s, pode não ter funcionado
              newWindow.close();
              // Tentar URL alternativa
              if (urlsParaTestar.length > 1) {
                window.open(urlsParaTestar[1], '_blank');
              }
            }
          }, 2000);
        }
        return true;
      }
    } catch (error) {
      console.error("Erro ao compartilhar via WhatsApp:", error);
      return await this.fallbackToClipboard(data.text);
    }
  }

  /**
   * Detecta se o dispositivo é mobile (incluindo telas redimensionadas)
   */
  private static isMobileDevice(): boolean {
    // Verificar User Agent para dispositivos móveis reais
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Verificar largura da tela para responsive design
    const isMobileScreen = window.innerWidth <= 768;
    
    // Verificar se tem touch (dispositivos móveis geralmente têm)
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    console.log('📱 [WHATSAPP] Detecção móvel:', {
      userAgent: isMobileUA,
      screenWidth: window.innerWidth,
      isMobileScreen,
      hasTouch,
      final: isMobileUA || (isMobileScreen && hasTouch)
    });
    
    return isMobileUA || (isMobileScreen && hasTouch);
  }

  /**
   * Gera URL do WhatsApp baseada no dispositivo
   */
  private static getWhatsAppUrl(mensagemCodificada: string, isMobile: boolean): string {
    // Estratégia simplificada: wa.me funciona em todos os dispositivos
    const waUrl = `https://wa.me/?text=${mensagemCodificada}`;
    
    console.log('🔗 [WHATSAPP] URL gerada:', {
      isMobile,
      url: waUrl,
      messageLength: mensagemCodificada.length
    });
    
    // Para Android mobile real, tentar whatsapp:// primeiro como fallback
    if (isMobile && /Android/i.test(navigator.userAgent)) {
      const androidUrl = `whatsapp://send?text=${mensagemCodificada}`;
      console.log('🤖 [WHATSAPP] Tentando URL Android nativa:', androidUrl);
      return androidUrl;
    }
    
    return waUrl;
  }

  /**
   * Fallback: copia texto para área de transferência
   */
  private static async fallbackToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('Mensagem copiada para área de transferência! Cole no WhatsApp manualmente.');
      } else {
        // Fallback para navegadores sem clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Mensagem copiada para área de transferência! Cole no WhatsApp manualmente.');
      }
      return true;
    } catch (error) {
      console.error('Erro no fallback de clipboard:', error);
      alert('Erro ao copiar mensagem. Tente copiar manualmente.');
      return false;
    }
  }

  /**
   * Compartilhamento simples com fallback
   */
  static async shareSimple(text: string, title: string = 'Compartilhamento'): Promise<boolean> {
    return this.share({
      title,
      text
    });
  }

  /**
   * Compartilhamento com URL específica
   */
  static async shareWithUrl(text: string, url: string, title: string = 'Compartilhamento'): Promise<boolean> {
    return this.share({
      title,
      text,
      url
    });
  }
} 