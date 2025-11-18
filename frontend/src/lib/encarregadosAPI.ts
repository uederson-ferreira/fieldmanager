// ===================================================================
// API DE ENCARREGADOS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/encarregadosAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface Encarregado {
  id: string;
  nome_completo: string;
  telefone?: string;
  empresa?: string;
  created_at?: string;
  updated_at?: string;
}

export const encarregadosAPI = {
  // Listar todos os encarregados
  async getEncarregados(): Promise<Encarregado[]> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/encarregados/encarregados-completos`, {
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
      console.log('✅ [ENCARREGADOS API] Encarregados carregados:', data.encarregados?.length || 0);
      // Retornar array direto para compatibilidade com unifiedCache
      return data.encarregados || [];
    } catch (error) {
      console.error('❌ [ENCARREGADOS API] Erro ao listar encarregados:', error);
      return [];
    }
  },

  // Buscar encarregado por ID
  async getEncarregado(id: string): Promise<Encarregado | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/encarregados/encarregados/${id}`, {
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
      return data;
    } catch (error) {
      console.error('❌ [ENCARREGADOS API] Erro ao buscar encarregado:', error);
      return null;
    }
  },

  // Criar novo encarregado
  async createEncarregado(encarregadoData: Omit<Encarregado, 'id' | 'created_at' | 'updated_at'>): Promise<Encarregado | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/encarregados/encarregados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(encarregadoData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [ENCARREGADOS API] Erro ao criar encarregado:', error);
      return null;
    }
  },

  // Atualizar encarregado
  async updateEncarregado(id: string, encarregadoData: Partial<Encarregado>): Promise<Encarregado | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/encarregados/encarregados/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(encarregadoData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [ENCARREGADOS API] Erro ao atualizar encarregado:', error);
      return null;
    }
  },

  // Excluir encarregado
  async deleteEncarregado(id: string): Promise<boolean> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/encarregados/encarregados/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('❌ [ENCARREGADOS API] Erro ao excluir encarregado:', error);
      return false;
    }
  }
}; 