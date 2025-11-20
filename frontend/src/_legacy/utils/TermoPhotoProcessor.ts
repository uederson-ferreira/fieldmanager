// ===================================================================
// MÓDULO: Termos - Processamento de Fotos
// Localização: src/utils/TermoPhotoProcessor.ts
// ===================================================================

import { FotoData } from '../types/entities';
// import { validateAndCompressImageFile } from './fileSanitizer';
import { PhotoOptimizer } from './photoOptimizer';

export interface ProcessedPhotoData {
  arquivo: File;
  base64Data: string;
  preview: string;
  nome: string;
  itemId: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  endereco?: string;
  tamanho: number;
  tipo: string;
  offline: boolean;
  sincronizado: boolean;
}

export class TermoPhotoProcessor {
  /**
   * Processa uma foto capturada para o módulo Termos
   */
  static async processarFoto(
    file: File,
    categoria: string,
    localizacao?: { latitude: number; longitude: number; accuracy?: number },
    endereco?: string
  ): Promise<ProcessedPhotoData> {
    console.log(`📷 [TERMO PHOTO PROCESSOR] Iniciando processamento:`, {
      nomeArquivo: file.name,
      tipoArquivo: file.type,
      tamanhoArquivo: file.size,
      categoria
    });

    try {
      // 1. Otimizar foto usando PhotoOptimizer
      console.log(`🔄 [TERMO PHOTO PROCESSOR] Otimizando foto...`);
      const optimizedPhoto = await PhotoOptimizer.optimizePhoto(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'jpeg',
        maxFileSize: 1024 * 1024 // 1MB
      });

      console.log(`✅ [TERMO PHOTO PROCESSOR] Foto otimizada:`, {
        originalSize: file.size,
        optimizedSize: optimizedPhoto.file.size,
        compression: Math.round((1 - optimizedPhoto.file.size / file.size) * 100) + '%'
      });

      const optimizedFile = optimizedPhoto.file;
      const base64 = optimizedPhoto.base64;

      // 3. Criar objeto de dados da foto
      const fotoData: ProcessedPhotoData = {
        arquivo: optimizedFile,
        base64Data: base64,
        preview: URL.createObjectURL(optimizedFile),
        itemId: 0, // Será definido pelo módulo de salvamento
        timestamp: new Date().toISOString(),
        latitude: localizacao?.latitude,
        longitude: localizacao?.longitude,
        accuracy: localizacao?.accuracy,
        endereco: endereco,
        tamanho: optimizedFile.size,
        tipo: optimizedFile.type,
        nome: optimizedFile.name,
        offline: false, // Será atualizado pelo módulo de salvamento
        sincronizado: false, // Será atualizado pelo módulo de salvamento
      };

      console.log(`✅ [TERMO PHOTO PROCESSOR] Foto processada com sucesso:`, {
        categoria,
        tamanho: fotoData.tamanho,
        tipo: fotoData.tipo,
        temArquivo: !!fotoData.arquivo,
        temBase64: !!fotoData.base64Data,
        base64Length: fotoData.base64Data?.length,
        coordenadas: fotoData.latitude && fotoData.longitude ? 'Sim' : 'Não'
      });

      return fotoData;
    } catch (error) {
      console.error(`❌ [TERMO PHOTO PROCESSOR] Erro ao processar foto:`, error);
      throw new Error(`Erro ao processar foto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Remove uma foto do estado
   */
  static removerFoto(
    fotos: { [categoria: string]: ProcessedPhotoData[] },
    categoria: string,
    index: number
  ): { [categoria: string]: ProcessedPhotoData[] } {
    console.log(`🗑️ [TERMO PHOTO PROCESSOR] Removendo foto:`, {
      categoria,
      index,
      totalFotosCategoria: fotos[categoria]?.length || 0
    });

    const novasFotos = { ...fotos };
    
    if (novasFotos[categoria]) {
      novasFotos[categoria] = novasFotos[categoria].filter((_, i) => i !== index);
      
      // Remover categoria se ficar vazia
      if (novasFotos[categoria].length === 0) {
        delete novasFotos[categoria];
      }
    }

    return novasFotos;
  }

  /**
   * Adiciona uma foto ao estado
   */
  static adicionarFoto(
    fotos: { [categoria: string]: ProcessedPhotoData[] },
    categoria: string,
    fotoData: ProcessedPhotoData
  ): { [categoria: string]: ProcessedPhotoData[] } {
    console.log(`➕ [TERMO PHOTO PROCESSOR] Adicionando foto:`, {
      categoria,
      nomeArquivo: fotoData.nome,
      totalFotosCategoria: (fotos[categoria]?.length || 0) + 1
    });

    return {
      ...fotos,
      [categoria]: [...(fotos[categoria] || []), fotoData]
    };
  }

  /**
   * Conta total de fotos
   */
  static contarFotos(fotos: { [categoria: string]: ProcessedPhotoData[] }): number {
    return Object.values(fotos).reduce((total, fotosCategoria) => total + fotosCategoria.length, 0);
  }

  /**
   * Obtém estatísticas das fotos
   */
  static obterEstatisticas(fotos: { [categoria: string]: ProcessedPhotoData[] }) {
    const totalFotos = this.contarFotos(fotos);
    const categorias = Object.keys(fotos);
    const totalTamanho = Object.values(fotos)
      .flat()
      .reduce((total, foto) => total + foto.tamanho, 0);

    return {
      totalFotos,
      categorias,
      totalTamanho,
      tamanhoMB: (totalTamanho / (1024 * 1024)).toFixed(2)
    };
  }
} 