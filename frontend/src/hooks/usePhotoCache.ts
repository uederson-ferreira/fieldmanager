import { useState, useCallback } from 'react';

interface PhotoCache {
  [url: string]: string;
}

export const usePhotoCache = () => {
  const [cache, setCache] = useState<PhotoCache>({});

  // Função para converter URL de foto para base64 com cache
  const convertPhotoUrlToBase64 = useCallback(async (url: string): Promise<string> => {
    try {
      // Se já é base64, retornar como está
      if (url.startsWith('data:image/')) {
        return url;
      }

      // Verificar cache primeiro usando getter para evitar dependência
      const currentCache = cache;
      if (currentCache[url]) {
        console.log('🔄 [CACHE] Foto encontrada no cache:', url.substring(0, 50) + '...');
        return currentCache[url];
      }

      console.log('🔄 [CONVERSÃO] Convertendo foto:', url.substring(0, 50) + '...');

      // Criar um timeout para evitar travamentos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar foto')), 10000);
      });

      // Função para fazer o fetch com timeout
      const fetchWithTimeout = async (url: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
          const response = await fetch(url, { 
            signal: controller.signal,
            mode: 'cors'
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return response.blob();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      // Fazer download da imagem
      const blob = await Promise.race([
        fetchWithTimeout(url),
        timeoutPromise
      ]);

      // Converter blob para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(blob);
      });

      // Salvar no cache
      setCache(prev => ({ ...prev, [url]: base64 }));
      console.log('✅ [CACHE] Foto convertida e salva no cache');

      return base64;

    } catch (error) {
      console.error('❌ [CONVERSÃO] Erro ao converter foto:', error, 'URL:', url.substring(0, 50) + '...');
      // Retornar uma imagem placeholder em base64
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0OEM0NC40MTggNDggNDggNDQuNDE4IDQ4IDQwQzQ4IDM1LjU4MiA0NC40MTggMzIgNDAgMzJDMzUuNTgyIDMyIDMyIDM1LjU4MiAzMiA0MEMzMiA0NC40MTggMzIuNTgyIDQ4IDQwIDQ4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
    }
  }, []); // Removida dependência do cache para evitar loop

  // Função para limpar cache
  const clearCache = useCallback(() => {
    setCache({});
    console.log('🗑️ [CACHE] Cache limpo');
  }, []);

  // Função para obter estatísticas do cache
  const getCacheStats = useCallback(() => {
    const urls = Object.keys(cache);
    return {
      total: urls.length,
      urls: urls
    };
  }, [cache]);

  return {
    convertPhotoUrlToBase64,
    clearCache,
    getCacheStats,
    cache
  };
}; 