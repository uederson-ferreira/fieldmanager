// ===================================================================
// API DE FOTOS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/fotosAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface Foto {
  id: string;
  url_arquivo: string;
  nome_arquivo: string;
  descricao?: string;
  categoria?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  lv_id?: string;
  termo_id?: string;
  tipo_lv?: string;
  item_id?: string; // UUID da pergunta (perguntas_lv.id)
  tipo?: 'lv' | 'termo';
}

export interface FotosStats {
  total: number;
  porCategoria: { [key: string]: number };
  porMes: { [key: string]: number };
  tamanhoTotal: number;
}

export const fotosAPI = {
  // Listar todas as fotos
  async list(): Promise<{ success: boolean; data?: Foto[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/fotos`, {
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
      console.log('✅ [FOTOS API] Fotos carregadas:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [FOTOS API] Erro ao listar fotos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar foto por ID
  async get(id: string): Promise<{ success: boolean; data?: Foto; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/fotos/${id}`, {
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
      console.log('✅ [FOTOS API] Foto carregada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [FOTOS API] Erro ao buscar foto:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Deletar foto
  async delete(id: string, tipo: 'lv' | 'termo'): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/fotos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tipo })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [FOTOS API] Foto excluída:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ [FOTOS API] Erro ao excluir foto:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar estatísticas de fotos
  async getStats(): Promise<{ success: boolean; data?: FotosStats; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/fotos/stats`, {
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
      console.log('✅ [FOTOS API] Estatísticas carregadas');
      return { success: true, data };
    } catch (error) {
      console.error('❌ [FOTOS API] Erro ao buscar estatísticas:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Download de foto
  async download(id: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/fotos/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('✅ [FOTOS API] Foto baixada:', id);
      return { success: true, data: blob };
    } catch (error) {
      console.error('❌ [FOTOS API] Erro ao baixar foto:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}; 