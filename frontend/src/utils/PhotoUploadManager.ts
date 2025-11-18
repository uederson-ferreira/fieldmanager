// ===================================================================
// GERENCIADOR UNIFICADO DE UPLOAD DE FOTOS - ECOFIELD
// Localização: src/utils/PhotoUploadManager.ts
// Módulo: Upload, otimização e gerenciamento de fotos unificado
// ===================================================================

import { PhotoOptimizer } from './photoOptimizer';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { unifiedCache } from '../lib/unifiedCache';

// ===================================================================
// INTERFACES
// ===================================================================

export interface PhotoUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxFileSize?: number;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
  saveOffline?: boolean;
}

export interface PhotoUploadResult {
  success: boolean;
  file?: File;
  base64?: string;
  thumbnail?: File;
  error?: string;
  metadata: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    format: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface PhotoData {
  id: string;
  file: File;
  base64: string;
  thumbnail?: File;
  metadata: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    format: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
  entityType: string;
  entityId: string;
  uploadedAt: Date;
  isOffline: boolean;
}

// ===================================================================
// CLASSE PRINCIPAL
// ===================================================================

export class PhotoUploadManager {
  private static readonly DEFAULT_OPTIONS: PhotoUploadOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg',
    maxFileSize: 1024 * 1024, // 1MB
    generateThumbnail: true,
    thumbnailSize: 300,
    saveOffline: true
  };

  /**
   * Upload único de foto com otimização
   */
  static async uploadPhoto(
    file: File,
    entityType: string,
    entityId: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log(`📸 [PHOTO UPLOAD MANAGER] Iniciando upload: ${file.name} para ${entityType}/${entityId}`);

    try {
      // 1. Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors[0]?.message || 'Arquivo inválido',
          metadata: {
            originalSize: file.size,
            optimizedSize: 0,
            compressionRatio: 0,
            format: file.type,
            dimensions: { width: 0, height: 0 }
          }
        };
      }

      // 2. Otimizar foto
      const optimizedPhoto = await PhotoOptimizer.optimizePhoto(file, {
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        quality: config.quality,
        format: config.format,
        maxFileSize: config.maxFileSize
      });

      // 3. Gerar thumbnail se solicitado
      let thumbnail: File | undefined;
      if (config.generateThumbnail) {
        thumbnail = await PhotoOptimizer.generateThumbnail(file, config.thumbnailSize);
      }

      // 4. Salvar offline se solicitado
      if (config.saveOffline) {
        await this.savePhotoOffline(optimizedPhoto, entityType, entityId);
      }

      console.log(`✅ [PHOTO UPLOAD MANAGER] Upload concluído:`, {
        original: this.formatFileSize(file.size),
        optimized: this.formatFileSize(optimizedPhoto.file.size),
        compression: `${(optimizedPhoto.compressionRatio * 100).toFixed(1)}%`
      });

      return {
        success: true,
        file: optimizedPhoto.file,
        base64: optimizedPhoto.base64,
        thumbnail,
        metadata: {
          originalSize: optimizedPhoto.originalSize,
          optimizedSize: optimizedPhoto.optimizedSize,
          compressionRatio: optimizedPhoto.compressionRatio,
          format: optimizedPhoto.format,
          dimensions: optimizedPhoto.dimensions
        }
      };

    } catch (error) {
      console.error('❌ [PHOTO UPLOAD MANAGER] Erro no upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        metadata: {
          originalSize: file.size,
          optimizedSize: 0,
          compressionRatio: 0,
          format: file.type,
          dimensions: { width: 0, height: 0 }
        }
      };
    }
  }

  /**
   * Upload múltiplo de fotos
   */
  static async uploadPhotos(
    files: File[],
    entityType: string,
    entityId: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult[]> {
    console.log(`📸 [PHOTO UPLOAD MANAGER] Upload múltiplo: ${files.length} fotos`);

    const results = await Promise.all(
      files.map(file => this.uploadPhoto(file, entityType, entityId, options))
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ [PHOTO UPLOAD MANAGER] Upload múltiplo concluído: ${successCount}/${files.length} sucessos`);

    return results;
  }

  /**
   * Salvar foto offline no cache
   */
  static async savePhotoOffline(
    optimizedPhoto: any,
    entityType: string,
    entityId: string
  ): Promise<void> {
    try {
      const photoData: PhotoData = {
        id: `${entityType}_${entityId}_${Date.now()}`,
        file: optimizedPhoto.file,
        base64: optimizedPhoto.base64,
        metadata: {
          originalSize: optimizedPhoto.originalSize,
          optimizedSize: optimizedPhoto.optimizedSize,
          compressionRatio: optimizedPhoto.compressionRatio,
          format: optimizedPhoto.format,
          dimensions: optimizedPhoto.dimensions
        },
        entityType,
        entityId,
        uploadedAt: new Date(),
        isOffline: true
      };

      await unifiedCache.set(`photo_${photoData.id}`, photoData);
      console.log(`💾 [PHOTO UPLOAD MANAGER] Foto salva offline: ${photoData.id}`);
    } catch (error) {
      console.error('❌ [PHOTO UPLOAD MANAGER] Erro ao salvar offline:', error);
    }
  }

  /**
   * Carregar foto do cache offline
   */
  static async loadPhotoFromOffline(photoId: string): Promise<PhotoData | null> {
    try {
      const photoData = await unifiedCache.get(`photo_${photoId}`);
      return photoData || null;
    } catch (error) {
      console.error('❌ [PHOTO UPLOAD MANAGER] Erro ao carregar foto offline:', error);
      return null;
    }
  }

  /**
   * Sincronizar fotos offline quando online
   */
  static async syncOfflinePhotos(): Promise<{ success: number; failed: number }> {
    try {
      const offlinePhotos = await this.getOfflinePhotos();
      let success = 0;
      let failed = 0;

      for (const photo of offlinePhotos) {
        try {
          // Aqui você implementaria a lógica de upload para o servidor
          // Por enquanto, apenas marcamos como sincronizado
          await unifiedCache.delete(`photo_${photo.id}`);
          success++;
        } catch (error) {
          failed++;
          console.error(`❌ [PHOTO UPLOAD MANAGER] Erro ao sincronizar foto ${photo.id}:`, error);
        }
      }

      console.log(`🔄 [PHOTO UPLOAD MANAGER] Sincronização concluída: ${success} sucessos, ${failed} falhas`);
      return { success, failed };
    } catch (error) {
      console.error('❌ [PHOTO UPLOAD MANAGER] Erro na sincronização:', error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Obter todas as fotos offline
   */
  static async getOfflinePhotos(): Promise<PhotoData[]> {
    try {
      const keys = await unifiedCache.keys();
      const photoKeys = keys.filter(key => key.startsWith('photo_'));
      const photos: PhotoData[] = [];

      for (const key of photoKeys) {
        const photo = await unifiedCache.get(key);
        if (photo && photo.isOffline) {
          photos.push(photo);
        }
      }

      return photos;
    } catch (error) {
      console.error('❌ [PHOTO UPLOAD MANAGER] Erro ao obter fotos offline:', error);
      return [];
    }
  }

  /**
   * Validar arquivo de foto
   */
  private static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      errors.push('Arquivo deve ser uma imagem');
    }

    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('Arquivo muito grande (máximo 10MB)');
    }

    // Verificar extensão
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push('Formato de arquivo não suportado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatar tamanho de arquivo
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// ===================================================================
// HOOK PARA USO EM COMPONENTES
// ===================================================================

export const usePhotoUpload = () => {
  const { isOnline } = useOnlineStatus();

  const uploadPhoto = async (
    file: File,
    entityType: string,
    entityId: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult> => {
    // Sempre salvar offline primeiro
    const offlineOptions = { ...options, saveOffline: true };
    return PhotoUploadManager.uploadPhoto(file, entityType, entityId, offlineOptions);
  };

  const uploadPhotos = async (
    files: File[],
    entityType: string,
    entityId: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult[]> => {
    const offlineOptions = { ...options, saveOffline: true };
    return PhotoUploadManager.uploadPhotos(files, entityType, entityId, offlineOptions);
  };

  const syncPhotos = async (): Promise<{ success: number; failed: number }> => {
    if (isOnline) {
      return PhotoUploadManager.syncOfflinePhotos();
    }
    return { success: 0, failed: 0 };
  };

  return {
    uploadPhoto,
    uploadPhotos,
    syncPhotos,
    isOnline
  };
};

// ===================================================================
// EXPORTS PARA COMPATIBILIDADE
// ===================================================================

export const uploadPhoto = (file: File, entityType: string, entityId: string, options?: PhotoUploadOptions) => {
  return PhotoUploadManager.uploadPhoto(file, entityType, entityId, options);
};

export const uploadPhotos = (files: File[], entityType: string, entityId: string, options?: PhotoUploadOptions) => {
  return PhotoUploadManager.uploadPhotos(files, entityType, entityId, options);
};

export const savePhotoOffline = (optimizedPhoto: any, entityType: string, entityId: string) => {
  return PhotoUploadManager.savePhotoOffline(optimizedPhoto, entityType, entityId);
};

export const loadPhotoFromOffline = (photoId: string) => {
  return PhotoUploadManager.loadPhotoFromOffline(photoId);
};

export const syncOfflinePhotos = () => {
  return PhotoUploadManager.syncOfflinePhotos();
}; 