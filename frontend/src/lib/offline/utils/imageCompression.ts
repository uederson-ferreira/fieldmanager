// ===================================================================
// IMAGE COMPRESSION - P1 #1 IMPLEMENTATION
// Localização: src/lib/offline/utils/imageCompression.ts
// Módulo: Compressão de imagens para economizar espaço de armazenamento
// ===================================================================

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  targetSizeKB?: number;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  targetSizeKB: 500
};

/**
 * Comprimir imagem (File ou Blob) para otimizar armazenamento
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  console.log('🔄 [IMAGE COMPRESSION] Iniciando compressão...');
  console.log(`📏 [IMAGE COMPRESSION] Tamanho original: ${(file.size / 1024).toFixed(2)} KB`);

  try {
    // Criar URL para a imagem
    const imageUrl = URL.createObjectURL(file);

    // Carregar imagem
    const img = await loadImage(imageUrl);

    // Calcular novas dimensões mantendo aspect ratio
    const { width, height } = calculateDimensions(
      img.width,
      img.height,
      opts.maxWidth,
      opts.maxHeight
    );

    console.log(`📐 [IMAGE COMPRESSION] Dimensões: ${img.width}x${img.height} → ${width}x${height}`);

    // Comprimir imagem
    let blob = await resizeAndCompress(img, width, height, opts.quality);

    // Se ainda está muito grande, reduzir qualidade progressivamente
    let currentQuality = opts.quality;
    const targetBytes = opts.targetSizeKB * 1024;

    while (blob.size > targetBytes && currentQuality > 0.3) {
      currentQuality -= 0.1;
      console.log(`🔽 [IMAGE COMPRESSION] Reduzindo qualidade para ${currentQuality.toFixed(2)}`);
      blob = await resizeAndCompress(img, width, height, currentQuality);
    }

    // Liberar URL
    URL.revokeObjectURL(imageUrl);

    const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(2);

    console.log(`✅ [IMAGE COMPRESSION] Tamanho comprimido: ${(blob.size / 1024).toFixed(2)} KB`);
    console.log(`📊 [IMAGE COMPRESSION] Taxa de compressão: ${compressionRatio}%`);

    return {
      blob,
      originalSize: file.size,
      compressedSize: blob.size,
      compressionRatio: parseFloat(compressionRatio),
      width,
      height
    };
  } catch (error) {
    console.error('❌ [IMAGE COMPRESSION] Erro ao comprimir imagem:', error);
    throw error;
  }
}

/**
 * Carregar imagem a partir de URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Calcular dimensões mantendo aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Se já está dentro dos limites, não redimensionar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcular aspect ratio
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Redimensionar e comprimir imagem usando Canvas
 */
function resizeAndCompress(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Criar canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Desenhar imagem redimensionada
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Não foi possível obter contexto 2D do canvas'));
      return;
    }

    // Melhorar qualidade do redimensionamento
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, 0, 0, width, height);

    // Converter para Blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Falha ao converter canvas para blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Converter File ou Blob para base64 (fallback para navegadores antigos)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Resultado não é string'));
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converter base64 para Blob
 */
export async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return response.blob();
}

/**
 * Verificar se navegador suporta IndexedDB com Blobs
 */
export function supportsIndexedDBBlobs(): boolean {
  // IndexedDB com suporte a Blobs está disponível em todos os navegadores modernos
  return 'indexedDB' in window;
}

/**
 * Estimar economia de espaço usando Blob ao invés de Base64
 */
export function estimateStorageSavings(base64Size: number): {
  base64Bytes: number;
  blobBytes: number;
  savings: number;
  savingsPercent: number;
} {
  // Base64 tem ~33% de overhead
  const blobBytes = Math.floor(base64Size / 1.33);
  const savings = base64Size - blobBytes;
  const savingsPercent = (savings / base64Size) * 100;

  return {
    base64Bytes: base64Size,
    blobBytes,
    savings,
    savingsPercent
  };
}
