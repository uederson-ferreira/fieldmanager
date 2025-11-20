// ===================================================================
// MÓDULO: Termos - GPS e Localização
// Localização: src/utils/TermoGPS.ts
// ===================================================================

export interface LocalizacaoGPS {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: number;
}

export interface EnderecoGPS {
  endereco: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  cep?: string;
}

export interface GPSResult {
  success: boolean;
  localizacao?: LocalizacaoGPS;
  endereco?: EnderecoGPS;
  error?: string;
}

export class TermoGPS {
  private static readonly OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;
  private static readonly TIMEOUT = 10000; // 10 segundos
  private static readonly MAX_AGE = 300000; // 5 minutos

  /**
   * Obtém localização GPS atual
   */
  static async obterLocalizacao(): Promise<GPSResult> {
    console.log(`📍 [TERMO GPS] Iniciando obtenção de localização`);

    if (!navigator.geolocation) {
      return {
        success: false,
        error: 'Geolocalização não é suportada por este navegador'
      };
    }

    try {
      const localizacao = await this.obterCoordenadas();
      
      if (!localizacao) {
        return {
          success: false,
          error: 'Não foi possível obter as coordenadas GPS'
        };
      }

      // Tentar obter endereço se online
      let endereco: EnderecoGPS | undefined;
      if (this.OPENCAGE_API_KEY) {
        try {
          endereco = await this.obterEndereco(localizacao.latitude, localizacao.longitude);
        } catch (error) {
          console.warn(`⚠️ [TERMO GPS] Erro ao obter endereço:`, error);
        }
      }

      console.log(`✅ [TERMO GPS] Localização obtida com sucesso:`, {
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        accuracy: localizacao.accuracy,
        temEndereco: !!endereco
      });

      return {
        success: true,
        localizacao,
        endereco
      };
    } catch (error) {
      console.error(`❌ [TERMO GPS] Erro ao obter localização:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao obter localização'
      };
    }
  }

  /**
   * Obtém coordenadas GPS usando a API do navegador
   */
  private static obterCoordenadas(): Promise<LocalizacaoGPS> {
    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: this.TIMEOUT,
        maximumAge: this.MAX_AGE
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const localizacao: LocalizacaoGPS = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            timestamp: Date.now()
          };

          console.log(`📍 [TERMO GPS] Coordenadas obtidas:`, {
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
            accuracy: localizacao.accuracy,
            altitude: localizacao.altitude
          });

          resolve(localizacao);
        },
        (error) => {
          let mensagemErro = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagemErro = 'Permissão de localização negada pelo usuário';
              break;
            case error.POSITION_UNAVAILABLE:
              mensagemErro = 'Informação de localização indisponível';
              break;
            case error.TIMEOUT:
              mensagemErro = 'Tempo limite excedido para obter localização';
              break;
            default:
              mensagemErro = 'Erro desconhecido ao obter localização';
          }

          console.error(`❌ [TERMO GPS] Erro de geolocalização:`, {
            code: error.code,
            message: mensagemErro
          });

          reject(new Error(mensagemErro));
        },
        options
      );
    });
  }

  /**
   * Obtém endereço a partir das coordenadas usando OpenCage
   */
  private static async obterEndereco(latitude: number, longitude: number): Promise<EnderecoGPS> {
    if (!this.OPENCAGE_API_KEY) {
      throw new Error('Chave da API OpenCage não configurada');
    }

    console.log(`🌍 [TERMO GPS] Obtendo endereço para coordenadas:`, {
      latitude,
      longitude
    });

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${this.OPENCAGE_API_KEY}&language=pt&countrycode=br`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API OpenCage: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('Nenhum resultado encontrado para as coordenadas');
    }

    const resultado = data.results[0];
    const componentes = resultado.components;

    const endereco: EnderecoGPS = {
      endereco: resultado.formatted,
      cidade: componentes.city || componentes.town || componentes.village,
      estado: componentes.state,
      pais: componentes.country,
      cep: componentes.postcode
    };

    console.log(`✅ [TERMO GPS] Endereço obtido:`, endereco);

    return endereco;
  }

  /**
   * Calcula distância entre duas coordenadas (fórmula de Haversine)
   */
  static calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    
    return distancia;
  }

  /**
   * Converte graus para radianos
   */
  private static toRadians(graus: number): number {
    return graus * (Math.PI / 180);
  }

  /**
   * Formata coordenadas para exibição
   */
  static formatarCoordenadas(latitude: number, longitude: number): string {
    const latStr = latitude >= 0 ? `${latitude.toFixed(6)}°N` : `${Math.abs(latitude).toFixed(6)}°S`;
    const lonStr = longitude >= 0 ? `${longitude.toFixed(6)}°E` : `${Math.abs(longitude).toFixed(6)}°W`;
    
    return `${latStr}, ${lonStr}`;
  }

  /**
   * Verifica se as coordenadas estão dentro do Brasil
   */
  static estaNoBrasil(latitude: number, longitude: number): boolean {
    // Aproximação das fronteiras do Brasil
    const latMin = -34; // Extremo sul
    const latMax = 6;   // Extremo norte
    const lonMin = -74; // Extremo oeste
    const lonMax = -34; // Extremo leste
    
    return latitude >= latMin && latitude <= latMax && 
           longitude >= lonMin && longitude <= lonMax;
  }

  /**
   * Obtém precisão em metros
   */
  static obterPrecisao(accuracy?: number): string {
    if (!accuracy) return 'Desconhecida';
    
    if (accuracy < 10) return 'Muito alta (< 10m)';
    if (accuracy < 50) return 'Alta (< 50m)';
    if (accuracy < 100) return 'Média (< 100m)';
    if (accuracy < 500) return 'Baixa (< 500m)';
    
    return 'Muito baixa (> 500m)';
  }

  /**
   * Monitora mudanças de localização
   */
  static monitorarLocalizacao(
    callback: (localizacao: LocalizacaoGPS) => void,
    onError?: (error: string) => void
  ): number | null {
    if (!navigator.geolocation) {
      onError?.('Geolocalização não é suportada');
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: this.TIMEOUT,
      maximumAge: this.MAX_AGE
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const localizacao: LocalizacaoGPS = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          timestamp: Date.now()
        };

        console.log(`📍 [TERMO GPS] Nova localização detectada:`, {
          latitude: localizacao.latitude,
          longitude: localizacao.longitude,
          accuracy: localizacao.accuracy
        });

        callback(localizacao);
      },
      (error) => {
        let mensagemErro = 'Erro ao monitorar localização';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensagemErro = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            mensagemErro = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            mensagemErro = 'Tempo limite excedido';
            break;
        }

        console.error(`❌ [TERMO GPS] Erro no monitoramento:`, mensagemErro);
        onError?.(mensagemErro);
      },
      options
    );

    console.log(`👁️ [TERMO GPS] Monitoramento iniciado (ID: ${watchId})`);
    return watchId;
  }

  /**
   * Para o monitoramento de localização
   */
  static pararMonitoramento(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      console.log(`🛑 [TERMO GPS] Monitoramento parado (ID: ${watchId})`);
    }
  }
} 