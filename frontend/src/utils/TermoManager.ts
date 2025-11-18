// ===================================================================
// MÓDULO PRINCIPAL: Termos - Gerenciador Central
// Localização: src/utils/TermoManager.ts
// ===================================================================

import { TermoFormData } from '../types/termos';
import { ProcessedPhotoData } from './TermoPhotoProcessor';
import { TermoPhotoProcessor } from './TermoPhotoProcessor';
import { TermoValidator } from './TermoValidator';
import { TermoGPS, GPSResult } from './TermoGPS';
import { TermoSaver, SaveResult } from './TermoSaver';

export interface TermoManagerOptions {
  autoGPS?: boolean;
  validarAntes?: boolean;
  salvarFotos?: boolean;
  modoOffline?: boolean;
}

export interface TermoManagerState {
  fotos: { [categoria: string]: ProcessedPhotoData[] };
  localizacao?: GPSResult;
  carregandoGPS: boolean;
  salvando: boolean;
  ultimoErro?: string;
}

export class TermoManager {
  private state: TermoManagerState = {
    fotos: {},
    carregandoGPS: false,
    salvando: false
  };

  private options: TermoManagerOptions;
  private inicializado = false; // Flag para evitar inicializações múltiplas

  constructor(options: TermoManagerOptions = {}) {
    this.options = {
      autoGPS: true,
      validarAntes: true,
      salvarFotos: true,
      modoOffline: false,
      ...options
    };

    // console.log(`🚀 [TERMO MANAGER] Inicializado com opções:`, this.options);
  }

  /**
   * Obtém o estado atual
   */
  getState(): TermoManagerState {
    return { ...this.state };
  }

  /**
   * Atualiza o estado
   */
  private setState(updates: Partial<TermoManagerState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Inicializa o módulo (obtém GPS se configurado)
   */
  async inicializar(): Promise<void> {
    if (this.inicializado) {
      // if (import.meta.env.DEV) {
      //   console.log(`⏭️ [TERMO MANAGER] Já inicializado, pulando...`);
      // }
      return;
    }

    // if (import.meta.env.DEV) {
    //   console.log(`🔧 [TERMO MANAGER] Inicializando módulo`);
    // }

    if (this.options.autoGPS) {
      await this.obterGPS();
    }

    this.inicializado = true;
    // if (import.meta.env.DEV) {
    //   console.log(`✅ [TERMO MANAGER] Inicialização concluída`);
    // }
  }

  /**
   * Obtém localização GPS
   */
  async obterGPS(): Promise<GPSResult> {
    // if (import.meta.env.DEV) {
    //   console.log(`📍 [TERMO MANAGER] Obtendo GPS...`);
    // }
    
    this.setState({ carregandoGPS: true });

    try {
      const resultado = await TermoGPS.obterLocalizacao();
      this.setState({ 
        localizacao: resultado,
        carregandoGPS: false 
      });

      if (resultado.success) {
        // if (import.meta.env.DEV) {
        //   console.log(`✅ [TERMO MANAGER] GPS obtido:`, {
        //     latitude: resultado.localizacao?.latitude,
        //     longitude: resultado.localizacao?.longitude,
        //     endereco: resultado.endereco?.endereco
        //   });
        // }
      } else {
        // if (import.meta.env.DEV) {
        //   console.warn(`⚠️ [TERMO MANAGER] Erro ao obter GPS:`, resultado.error);
        // }
      }

      return resultado;
    } catch (error) {
      this.setState({ carregandoGPS: false });
      // if (import.meta.env.DEV) {
      //   console.error(`❌ [TERMO MANAGER] Erro ao obter GPS:`, error);
      // }
      throw error;
    }
  }

  /**
   * Processa e adiciona uma foto
   */
  async adicionarFoto(
    file: File,
    categoria: string
  ): Promise<ProcessedPhotoData> {
    // if (import.meta.env.DEV) {
    //   console.log(`📷 [TERMO MANAGER] Adicionando foto:`, {
    //     categoria,
    //     nomeArquivo: file.name,
    //     tamanho: file.size
    //   });
    // }

    try {
      // Validar arquivo
      const validacaoArquivo = TermoValidator.validarArquivoFoto(file);
      if (!validacaoArquivo.isValid) {
        const mensagensErro = TermoValidator.obterMensagensErro(validacaoArquivo);
        throw new Error(`Arquivo inválido:\n${mensagensErro.join('\n')}`);
      }

      // Processar foto
      const fotoProcessada = await TermoPhotoProcessor.processarFoto(
        file,
        categoria,
        this.state.localizacao?.localizacao,
        this.state.localizacao?.endereco?.endereco
      );

      // Adicionar ao estado
      const novasFotos = TermoPhotoProcessor.adicionarFoto(
        this.state.fotos,
        categoria,
        fotoProcessada
      );

      this.setState({ fotos: novasFotos });

      if (import.meta.env.DEV) {
        console.log(`✅ [TERMO MANAGER] Foto adicionada:`, {
          categoria,
          totalFotos: TermoPhotoProcessor.contarFotos(novasFotos)
        });
      }

      return fotoProcessada;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`❌ [TERMO MANAGER] Erro ao adicionar foto:`, error);
      }
      throw error;
    }
  }

  /**
   * Remove uma foto
   */
  removerFoto(categoria: string, index: number): void {
    if (import.meta.env.DEV) {
      console.log(`🗑️ [TERMO MANAGER] Removendo foto:`, { categoria, index });
    }

    const novasFotos = TermoPhotoProcessor.removerFoto(
      this.state.fotos,
      categoria,
      index
    );

    this.setState({ fotos: novasFotos });

    if (import.meta.env.DEV) {
      console.log(`✅ [TERMO MANAGER] Foto removida:`, {
        categoria,
        totalFotos: TermoPhotoProcessor.contarFotos(novasFotos)
      });
    }
  }

  /**
   * Obtém estatísticas das fotos
   */
  obterEstatisticasFotos() {
    return TermoPhotoProcessor.obterEstatisticas(this.state.fotos);
  }

  /**
   * Valida dados do formulário
   */
  validarFormulario(dados: TermoFormData) {
    if (import.meta.env.DEV) {
      console.log(`🔍 [TERMO MANAGER] Validando formulário`);
    }
    
    const validacao = TermoValidator.validarFormulario(dados);
    
    // Adicionar validação de GPS se necessário
    if (dados.latitude && dados.longitude) {
      const validacaoGPS = TermoValidator.validarGPS(dados.latitude, dados.longitude);
      validacao.errors.push(...validacaoGPS.errors);
      validacao.warnings.push(...validacaoGPS.warnings);
    }

    if (import.meta.env.DEV) {
      console.log(`📊 [TERMO MANAGER] Resultado da validação:`, {
        isValid: validacao.isValid,
        totalErrors: validacao.errors.length,
        totalWarnings: validacao.warnings.length
      });
    }

    return validacao;
  }

  /**
   * Salva termo completo
   */
  async salvarTermo(dados: TermoFormData, user: { id: string } | null): Promise<SaveResult> {
    if (import.meta.env.DEV) {
      console.log(`💾 [TERMO MANAGER] Iniciando salvamento do termo`);
    }

    this.setState({ salvando: true, ultimoErro: undefined });

    try {
      // Preparar dados com GPS se disponível
      const dadosComGPS = {
        ...dados,
        latitude: dados.latitude || this.state.localizacao?.localizacao?.latitude,
        longitude: dados.longitude || this.state.localizacao?.localizacao?.longitude,
        precisao_gps: dados.precisao_gps || this.state.localizacao?.localizacao?.accuracy,
        endereco_gps: dados.endereco_gps || this.state.localizacao?.endereco?.endereco || 'Localização não disponível'
      };

      // Detectar modo offline automaticamente
      const isOnline = navigator.onLine;
      const modoOffline = !isOnline || this.options.modoOffline;

      if (import.meta.env.DEV) {
        console.log(`🌐 [TERMO MANAGER] Status de conexão:`, {
          online: isOnline,
          modoOffline,
          opcaoManual: this.options.modoOffline
        });
      }

      // Salvar usando o módulo de salvamento
      const resultado = await TermoSaver.salvarTermo(
        dadosComGPS,
        this.state.fotos,
        user,
        {
          validarAntes: this.options.validarAntes,
          salvarFotos: this.options.salvarFotos,
          modoOffline
        }
      );

      if (resultado.success) {
        if (import.meta.env.DEV) {
          console.log(`✅ [TERMO MANAGER] Termo salvo com sucesso:`, {
            termoId: resultado.termoId,
            fotosSalvas: resultado.fotosSalvas
          });
        }

        // Limpar estado após salvamento bem-sucedido
        this.limparEstado();
      } else {
        if (import.meta.env.DEV) {
          console.error(`❌ [TERMO MANAGER] Erro ao salvar termo:`, resultado.error);
        }
        this.setState({ ultimoErro: resultado.error });
      }

      return resultado;
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
      if (import.meta.env.DEV) {
        console.error(`❌ [TERMO MANAGER] Erro no salvamento:`, error);
      }
      this.setState({ ultimoErro: mensagemErro });
      
      return {
        success: false,
        error: mensagemErro
      };
    } finally {
      this.setState({ salvando: false });
    }
  }

  /**
   * Limpa o estado (após salvamento bem-sucedido)
   */
  limparEstado(): void {
    if (import.meta.env.DEV) {
      console.log(`🧹 [TERMO MANAGER] Limpando estado`);
    }
    
    this.setState({
      fotos: {},
      ultimoErro: undefined
    });
  }

  /**
   * Gera ID único para termo offline
   */
  async gerarNumeroOffline(tipoTermo: string): Promise<string> {
    // Gerar ID único que será usado como numero_termo
    const numeroOffline = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (import.meta.env.DEV) {
      console.log(`📱 [TERMO MANAGER] ID único gerado para ${tipoTermo}: ${numeroOffline}`);
    }
    
    return numeroOffline;
  }

  /**
   * Sincroniza termos offline
   */
  async sincronizarOffline(): Promise<{ success: boolean; sincronizados: number; error?: string }> {
    if (import.meta.env.DEV) {
      console.log(`🔄 [TERMO MANAGER] Iniciando sincronização offline`);
    }
    
    try {
      const resultado = await TermoSaver.sincronizarTermosOffline();
      
      if (resultado.success) {
        if (import.meta.env.DEV) {
          console.log(`✅ [TERMO MANAGER] Sincronização concluída:`, {
            sincronizados: resultado.sincronizados
          });
        }
      } else {
        if (import.meta.env.DEV) {
          console.error(`❌ [TERMO MANAGER] Erro na sincronização:`, resultado.error);
        }
      }

      return resultado;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`❌ [TERMO MANAGER] Erro na sincronização:`, error);
      }
      return {
        success: false,
        sincronizados: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      };
    }
  }

  /**
   * Obtém informações de debug
   */
  obterInfoDebug() {
    return {
      estado: this.state,
      opcoes: this.options,
      inicializado: this.inicializado,
      // ✅ ADICIONAR função de teste para números offline
      testarNumeroOffline: async (tipo: string) => {
        try {
          return await this.gerarNumeroOffline(tipo);
        } catch (error) {
          return `Erro: ${error}`;
        }
      }
    };
  }
} 