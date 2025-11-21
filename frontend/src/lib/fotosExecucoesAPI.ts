// ===================================================================
// API DE FOTOS DE EXECUÇÕES - FIELDMANAGER v2.0
// Upload via backend (usa service role - bypass RLS)
// ===================================================================

import { API_URL, supabase } from './supabase';
import { getAuthToken } from '../utils/authUtils';

// Nome do bucket no Supabase Storage
const BUCKET_NAME = 'execucoes';

export interface FotoExecucao {
  id: string;
  url: string;
  nome_arquivo: string;
  tamanho: number;
  tipo: string;
  descricao?: string;
  execucao_id?: string;
  pergunta_id?: string;
  pergunta_codigo?: string;
  uploaded_at: string;
}

// URL da API do backend
const API_BASE_URL = API_URL || 'http://localhost:3001';

/**
 * Comprimir imagem antes do upload (para economizar storage e melhorar performance)
 */
async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar se necessário
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Erro ao criar contexto do canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao comprimir imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload de foto via backend (usa service role - bypass RLS)
 */
export async function uploadFoto(
  file: File,
  execucaoId: string,
  perguntaId?: string,
  perguntaCodigo?: string,
  descricao?: string
): Promise<{ success: boolean; data?: FotoExecucao; error?: string }> {
  try {
    console.log(`📸 [FOTOS] Iniciando upload de ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // Comprimir imagem antes do upload
    const compressedBlob = await compressImage(file);
    console.log(`🗜️ [FOTOS] Imagem comprimida: ${(compressedBlob.size / 1024).toFixed(2)} KB`);

    // Converter blob para File para enviar via FormData
    const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

    // Criar FormData
    const formData = new FormData();
    formData.append('fotos', compressedFile);
    if (perguntaId) formData.append('perguntaId', perguntaId);
    if (perguntaCodigo) formData.append('perguntaCodigo', perguntaCodigo);
    if (descricao) formData.append('descricao', descricao);

    // Obter token de autenticação
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    // Upload via backend
    const response = await fetch(`${API_BASE_URL}/api/execucoes/${execucaoId}/fotos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error('Upload falhou: nenhuma foto foi retornada');
    }

    const foto = result.data[0] as FotoExecucao;
    console.log('✅ [FOTOS] Upload concluído:', foto.url);

    return { success: true, data: foto };
  } catch (error) {
    console.error('❌ [FOTOS] Erro ao fazer upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload'
    };
  }
}

/**
 * Upload de múltiplas fotos via backend
 */
export async function uploadMultipleFotos(
  files: Array<{
    file: File;
    perguntaId?: string;
    perguntaCodigo?: string;
    descricao?: string;
  }>,
  execucaoId: string
): Promise<{ success: boolean; data?: FotoExecucao[]; errors?: string[] }> {
  try {
    console.log(`📸 [FOTOS] Iniciando upload de ${files.length} fotos via backend`);

    // Comprimir todas as imagens primeiro
    const compressedFiles = await Promise.all(
      files.map(async (f) => {
        const compressedBlob = await compressImage(f.file);
        return new File([compressedBlob], f.file.name, { type: 'image/jpeg' });
      })
    );

    // Criar FormData com todas as fotos
    const formData = new FormData();
    compressedFiles.forEach((file) => {
      formData.append('fotos', file);
    });
    
    // Adicionar metadados (usando o primeiro arquivo como referência)
    if (files[0]?.perguntaId) formData.append('perguntaId', files[0].perguntaId);
    if (files[0]?.perguntaCodigo) formData.append('perguntaCodigo', files[0].perguntaCodigo);
    if (files[0]?.descricao) formData.append('descricao', files[0].descricao);

    // Obter token de autenticação
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    // Upload via backend
    const response = await fetch(`${API_BASE_URL}/api/execucoes/${execucaoId}/fotos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`✅ [FOTOS] Upload concluído: ${result.data?.length || 0} sucesso`);

    return {
      success: result.success || false,
      data: result.data || [],
      errors: result.errors
    };
  } catch (error) {
    console.error('❌ [FOTOS] Erro ao fazer upload múltiplo:', error);
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : 'Erro desconhecido']
    };
  }
}

/**
 * Deletar foto do Supabase Storage
 */
export async function deleteFoto(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error('❌ [FOTOS] Erro ao deletar:', error);
      throw error;
    }

    console.log('✅ [FOTOS] Foto deletada:', path);
    return { success: true };
  } catch (error) {
    console.error('❌ [FOTOS] Erro ao deletar foto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar'
    };
  }
}

/**
 * Listar fotos de uma execução
 */
export async function listarFotosExecucao(
  execucaoId: string
): Promise<{ success: boolean; data?: FotoExecucao[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(execucaoId);

    if (error) {
      throw error;
    }

    const fotos: FotoExecucao[] = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${execucaoId}/${file.name}`);

        return {
          id: `${execucaoId}/${file.name}`,
          url: urlData.publicUrl,
          nome_arquivo: file.name,
          tamanho: file.metadata?.size || 0,
          tipo: file.metadata?.mimetype || 'image/jpeg',
          execucao_id: execucaoId,
          uploaded_at: file.created_at
        };
      })
    );

    return { success: true, data: fotos };
  } catch (error) {
    console.error('❌ [FOTOS] Erro ao listar fotos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao listar fotos'
    };
  }
}

/**
 * Verificar se o bucket existe e criar se necessário (para setup inicial)
 */
export async function verificarBucket(): Promise<{ exists: boolean; error?: string }> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      throw error;
    }

    const bucketExists = buckets.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      console.warn(`⚠️ [FOTOS] Bucket '${BUCKET_NAME}' não existe. Criação manual necessária no Supabase Dashboard.`);
      return { exists: false };
    }

    console.log(`✅ [FOTOS] Bucket '${BUCKET_NAME}' encontrado`);
    return { exists: true };
  } catch (error) {
    console.error('❌ [FOTOS] Erro ao verificar bucket:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
