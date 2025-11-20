// ===================================================================
// API DE LOGS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/logsAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface Log {
  id: string;
  usuario: string;
  acao: string;
  detalhes?: string;
  data: string;
  created_at?: string;
}

export interface LogFilters {
  usuario?: string;
  acao?: string;
  data?: string;
  limit?: number;
  offset?: number;
}

export const logsAPI = {
  // Listar logs com filtros opcionais
  async list(filters?: LogFilters): Promise<{ success: boolean; data?: Log[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filters?.usuario) params.append('usuario', filters.usuario);
      if (filters?.acao) params.append('acao', filters.acao);
      if (filters?.data) params.append('data', filters.data);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${API_URL}/api/logs?${params}`, {
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
      console.log('✅ [LOGS API] Logs carregados:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LOGS API] Erro ao listar logs:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar log por ID
  async get(id: string): Promise<{ success: boolean; data?: Log; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/logs/${id}`, {
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
      console.log('✅ [LOGS API] Log carregado:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LOGS API] Erro ao buscar log:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Criar novo log
  async create(logData: Omit<Log, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Log; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [LOGS API] Log criado:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LOGS API] Erro ao criar log:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir log
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/logs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [LOGS API] Log excluído:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ [LOGS API] Erro ao excluir log:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Limpar logs antigos
  async limparAntigos(dias: number = 30): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/logs/limpar/antigos`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dias })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [LOGS API] Logs antigos limpos');
      return { success: true };
    } catch (error) {
      console.error('❌ [LOGS API] Erro ao limpar logs antigos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}; 