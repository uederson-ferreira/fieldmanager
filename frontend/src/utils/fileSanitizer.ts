// Módulo: LV Resíduos - Sanitização de Arquivos
// Localização: src/utils/fileSanitizer.ts

/**
 * Sanitiza nomes de arquivos removendo caracteres especiais
 * que podem causar problemas no upload para o Supabase Storage
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .normalize('NFD')                     // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')      // Remover acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_')      // Substituir caracteres especiais por _
    .replace(/_+/g, '_')                  // Remover múltiplos underscores
    .replace(/^_|_$/g, '');               // Remover underscores do início e fim
};

/**
 * Cria um novo File com nome sanitizado
 */
export const createSanitizedFile = (originalFile: File): File => {
  const sanitizedName = sanitizeFileName(originalFile.name);
  
  // Garantir extensão correta
  const extension = originalFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const finalName = sanitizedName.endsWith(`.${extension}`) ? 
    sanitizedName : 
    `${sanitizedName}.${extension}`;
  
  return new File([originalFile], finalName, {
    type: originalFile.type || 'image/jpeg',
    lastModified: originalFile.lastModified
  });
};

/**
 * Comprime uma imagem reduzindo sua qualidade e/ou dimensões
 */
export const compressImage = (file: File, maxSizeMB: number = 5): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      const maxDimension = 1200; // Reduzido de 1920px para 1200px para melhor compressão
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Converter para blob com qualidade ajustada
      let quality = 0.7; // Reduzido de 0.8 para 0.7 para melhor compressão
      const targetSize = maxSizeMB * 1024 * 1024;
      
      // Determinar o tipo final antes do loop
      const finalType = file.type.includes('png') ? 'image/jpeg' : file.type;
      const outputFormat = finalType;
      
      const tryCompress = (currentQuality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Falha na compressão da imagem'));
            return;
          }
          
          // Se ainda está muito grande e podemos reduzir mais a qualidade
          if (blob.size > targetSize && currentQuality > 0.1) {
            tryCompress(currentQuality - 0.1);
            return;
          }
          
          // Criar novo arquivo com nome original e tipo consistente
          const compressedFile = new File([blob], file.name, {
            type: finalType,
            lastModified: Date.now()
          });
          
          console.log(`🗜️ Arquivo comprimido: ${file.name}, tipo original: ${file.type}, tipo final: ${finalType}, tamanho: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          
          resolve(compressedFile);
        }, outputFormat, currentQuality);
      };
      
      tryCompress(quality);
    };
    
    img.onerror = () => reject(new Error('Erro ao carregar imagem para compressão'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Valida se um arquivo é uma imagem válida e comprime se necessário
 */
export const validateAndCompressImageFile = async (file: File): Promise<{ valid: boolean; file?: File; error?: string }> => {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Arquivo inválido' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Arquivo deve ser uma imagem' };
  }

  const maxSize = 5 * 1024 * 1024; // Reduzido de 10MB para 5MB para melhor compressão
  
  // Se o arquivo já está dentro do limite, retorna como está
  if (file.size <= maxSize) {
    return { valid: true, file };
  }
  
  // Tentar comprimir o arquivo
  try {
    console.log(`🗜️ Comprimindo imagem ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    const compressedFile = await compressImage(file, 5); // Reduzido para 5MB
    console.log(`✅ Imagem comprimida: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return { valid: true, file: compressedFile };
  } catch (error) {
    console.error('Erro na compressão:', error);
    return { valid: false, error: 'Falha ao comprimir imagem. Tente uma imagem menor.' };
  }
};

/**
 * Valida se um arquivo é uma imagem válida (versão original mantida para compatibilidade)
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Arquivo inválido' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Arquivo deve ser uma imagem' };
  }

  const maxSize = 5 * 1024 * 1024; // Reduzido de 10MB para 5MB para melhor compressão
  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo muito grande (máximo 5MB)' };
  }

  return { valid: true };
};