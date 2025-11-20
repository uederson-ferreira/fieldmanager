// ===================================================================
// API DE TERMOS AMBIENTAIS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/termosAPI.ts
// ===================================================================

import type { 
  TermoAmbiental,
  TermoFiltros,
  TermoFoto
} from '../types/termos';
import { getAuthToken, isTokenExpired } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

// Interface para os tipos que estavam faltando
interface TermoFormData {
  [key: string]: any;
}

interface TermoAtualizacao {
  [key: string]: any;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const termosAPI = {
  // Listar termos com filtros opcionais
  async listarTermos(filtros?: TermoFiltros): Promise<{ success: boolean; data?: TermoAmbiental[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Verificar se o token está expirado
      if (isTokenExpired()) {
        console.error('❌ [TERMOS API] Token expirado');
        throw new Error('Token expirado. Faça login novamente.');
      }

      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtros?.status) params.append('status', filtros.status);
      if (filtros?.area_id) params.append('area_id', filtros.area_id);
      if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
      // O backend filtra automaticamente por auth_user_id do token

      const response = await fetch(`${API_URL}/api/termos?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Termos carregados:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao listar termos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar termo por ID
  async buscarTermo(id: string): Promise<{ success: boolean; data?: TermoAmbiental; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/termos/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Termo carregado:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao buscar termo:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Criar novo termo
  async criarTermo(dados: TermoFormData): Promise<{ success: boolean; data?: TermoAmbiental; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/termos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Termo criado:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao criar termo:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Atualizar termo existente
  async atualizarTermo(id: string, dados: TermoAtualizacao): Promise<{ success: boolean; data?: TermoAmbiental; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('📤 [TERMOS API] Enviando atualização:', {
        id,
        url: `${API_URL}/api/termos/${id}`,
        dados: dados
      });

      const response = await fetch(`${API_URL}/api/termos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      console.log('📊 [TERMOS API] Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [TERMOS API] Erro na resposta:', errorText);
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Termo atualizado:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao atualizar termo:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir termo
  async excluirTermo(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const url = `${API_URL}/api/termos/${id}`;
      console.log('🔍 [TERMOS API] URL para exclusão:', url);
      console.log('🔍 [TERMOS API] API_URL:', API_URL);
      console.log('🔍 [TERMOS API] ID do termo:', id);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [TERMOS API] Termo excluído:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao excluir termo:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Gerar relatório (JSON)
  async gerarRelatorio(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/termos/${id}/relatorio`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Relatório gerado:', id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao gerar relatório:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Gerar PDF
  async gerarPDF(id: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/termos/${id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('✅ [TERMOS API] PDF gerado:', blob.size, 'bytes');
      return { success: true, data: blob };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao gerar PDF:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar termos pendentes de sincronização offline
  async buscarPendentesOffline(): Promise<{ success: boolean; data?: TermoAmbiental[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/termos/sync/pendentes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Pendentes offline carregados:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao buscar pendentes offline:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Salvar foto do termo
  async salvarFotoTermo(termoId: string, foto: File, categoria: string): Promise<{ success: boolean; data?: TermoFoto; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const formData = new FormData();
      formData.append('foto', foto);
      formData.append('categoria', categoria);

      const response = await fetch(`${API_URL}/api/termos/${termoId}/fotos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fotos: [{
            nome_arquivo: foto.name,
            url_arquivo: '', // Será preenchido pelo backend
            tamanho_bytes: foto.size,
            tipo_mime: foto.type,
            categoria: categoria,
            descricao: '',
            latitude: null,
            longitude: null,
            precisao_gps: null,
            endereco: '',
            timestamp_captura: new Date().toISOString()
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TERMOS API] Foto salva:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [TERMOS API] Erro ao salvar foto:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
};
