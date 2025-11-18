// ===================================================================
// SISTEMA DE OTIMIZAÇÃO DE FOTOS - ECOFIELD
// Localização: src/utils/photoOptimizer.ts
// Módulo: Compressão e otimização de fotos para reduzir base64
// ===================================================================

interface PhotoOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  format?: 'jpeg' | 'webp' | 'png';
  maxFileSize?: number; // em bytes
}

interface OptimizedPhoto {
  file: File;
  base64: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export class PhotoOptimizer {
  private static readonly DEFAULT_OPTIONS: PhotoOptimizationOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg',
    maxFileSize: 1024 * 1024 // 1MB
  };

  /**
   * Otimizar foto com compressão inteligente
   */
  static async optimizePhoto(
    file: File,
    options: PhotoOptimizationOptions = {}
  ): Promise<OptimizedPhoto> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log(`🖼️ [PHOTO OPTIMIZER] Otimizando foto: ${file.name} (${this.formatFileSize(file.size)})`);

    try {
      // Verificar se já está otimizada
      if (file.size <= config.maxFileSize!) {
        console.log('✅ [PHOTO OPTIMIZER] Foto já está otimizada');
        const base64 = await this.fileToBase64(file);
        return {
          file,
          base64,
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: 1,
          format: file.type,
          dimensions: await this.getImageDimensions(file)
        };
      }

      // Carregar imagem
      const image = await this.loadImage(file);
      
      // Calcular novas dimensões
      const dimensions = this.calculateDimensions(
        image.width,
        image.height,
        config.maxWidth!,
        config.maxHeight!
      );

      // Criar canvas para redimensionar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Desenhar imagem redimensionada
      ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);

      // Converter para blob com qualidade otimizada
      const blob = await this.canvasToBlob(canvas, config.format!, config.quality!);
      
      // Criar novo arquivo
      const optimizedFile = new File([blob], file.name, {
        type: this.getMimeType(config.format!),
        lastModified: Date.now()
      });

      const compressionRatio = optimizedFile.size / file.size;
      
      // Converter para base64
      const base64 = await this.fileToBase64(optimizedFile);
      
      console.log(`✅ [PHOTO OPTIMIZER] Otimização concluída:`, {
        original: this.formatFileSize(file.size),
        optimized: this.formatFileSize(optimizedFile.size),
        compression: `${(compressionRatio * 100).toFixed(1)}%`,
        dimensions: `${dimensions.width}x${dimensions.height}`
      });

      return {
        file: optimizedFile,
        base64,
        originalSize: file.size,
        optimizedSize: optimizedFile.size,
        compressionRatio,
        format: config.format!,
        dimensions
      };

    } catch (error) {
      console.error('❌ [PHOTO OPTIMIZER] Erro ao otimizar foto:', error);
      throw error;
    }
  }

  /**
   * Otimizar múltiplas fotos em paralelo
   */
  static async optimizePhotos(
    files: File[],
    options: PhotoOptimizationOptions = {}
  ): Promise<OptimizedPhoto[]> {
    console.log(`🖼️ [PHOTO OPTIMIZER] Otimizando ${files.length} fotos...`);

    const results = await Promise.all(
      files.map(file => this.optimizePhoto(file, options))
    );

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const totalCompression = totalOptimized / totalOriginal;

    console.log(`✅ [PHOTO OPTIMIZER] Otimização em lote concluída:`, {
      totalOriginal: this.formatFileSize(totalOriginal),
      totalOptimized: this.formatFileSize(totalOptimized),
      totalCompression: `${(totalCompression * 100).toFixed(1)}%`
    });

    return results;
  }

  /**
   * Gerar thumbnail otimizado
   */
  static async generateThumbnail(
    file: File,
    maxSize: number = 300
  ): Promise<File> {
    console.log(`🖼️ [PHOTO OPTIMIZER] Gerando thumbnail para: ${file.name}`);

    const image = await this.loadImage(file);
    
    // Calcular dimensões do thumbnail (quadrado)
    const size = Math.min(image.width, image.height, maxSize);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = size;
    canvas.height = size;

    // Calcular posição para centralizar
    const offsetX = (image.width - size) / 2;
    const offsetY = (image.height - size) / 2;

    // Desenhar thumbnail centralizado
    ctx.drawImage(
      image,
      offsetX, offsetY, size, size,
      0, 0, size, size
    );

    const blob = await this.canvasToBlob(canvas, 'jpeg', 0.7);
    const thumbnailFile = new File([blob], `thumb_${file.name}`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    console.log(`✅ [PHOTO OPTIMIZER] Thumbnail gerado: ${this.formatFileSize(thumbnailFile.size)}`);
    return thumbnailFile;
  }

  /**
   * Converter base64 otimizado (com compressão)
   */
  static async base64ToOptimizedFile(
    base64Data: string,
    filename: string,
    options: PhotoOptimizationOptions = {}
  ): Promise<File> {
    console.log(`🖼️ [PHOTO OPTIMIZER] Convertendo base64 otimizado: ${filename}`);

    // Converter base64 para blob
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });

    // Otimizar o arquivo
    const optimized = await this.optimizePhoto(file, options);
    return optimized.file;
  }

  /**
   * Verificar se foto precisa de otimização
   */
  static needsOptimization(file: File, maxSize: number = 1024 * 1024): boolean {
    return file.size > maxSize;
  }

  /**
   * Obter estatísticas de otimização
   */
  static getOptimizationStats(files: File[]): {
    totalFiles: number;
    totalSize: number;
    needsOptimization: number;
    estimatedSavings: number;
  } {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const needsOptimization = files.filter(file => this.needsOptimization(file)).length;
    const estimatedSavings = totalSize * 0.6; // Estimativa de 60% de economia

    return {
      totalFiles,
      totalSize,
      needsOptimization,
      estimatedSavings
    };
  }

  // Métodos auxiliares
  private static async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
  }

  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    const image = await this.loadImage(file);
    return { width: image.width, height: image.height };
  }

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Redimensionar mantendo proporção
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private static async canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Falha ao converter canvas para blob'));
        }
      }, this.getMimeType(format), quality);
    });
  }

  private static getMimeType(format: string): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'png':
        return 'image/png';
      default:
        return 'image/jpeg';
    }
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Funções de conveniência
export const optimizePhoto = (file: File, options?: PhotoOptimizationOptions) => {
  return PhotoOptimizer.optimizePhoto(file, options);
};

export const optimizePhotos = (files: File[], options?: PhotoOptimizationOptions) => {
  return PhotoOptimizer.optimizePhotos(files, options);
};

export const generateThumbnail = (file: File, maxSize?: number) => {
  return PhotoOptimizer.generateThumbnail(file, maxSize);
};

export const needsOptimization = (file: File, maxSize?: number) => {
  return PhotoOptimizer.needsOptimization(file, maxSize);
}; 