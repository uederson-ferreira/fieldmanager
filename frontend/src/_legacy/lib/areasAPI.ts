// ===================================================================
// API DE ÁREAS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/areasAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface Area {
  id: string;
  nome: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export const areasAPI = {
  // Listar todas as áreas
  async getAreas(): Promise<Area[]> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/areas/areas`, {
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
      console.log('✅ [AREAS API] Áreas carregadas:', data.length);
      return data;
    } catch (error) {
      console.error('❌ [AREAS API] Erro ao listar áreas:', error);
      return [];
    }
  },

  // Buscar área por ID
  async getArea(id: string): Promise<Area | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/areas/areas/${id}`, {
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
      console.error('❌ [AREAS API] Erro ao buscar área:', error);
      return null;
    }
  },

  // Criar nova área
  async createArea(areaData: Omit<Area, 'id' | 'created_at' | 'updated_at'>): Promise<Area | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/areas/areas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(areaData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [AREAS API] Erro ao criar área:', error);
      return null;
    }
  },

  // Atualizar área
  async updateArea(id: string, areaData: Partial<Area>): Promise<Area | null> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/areas/areas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(areaData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [AREAS API] Erro ao atualizar área:', error);
      return null;
    }
  },

  // Excluir área
  async deleteArea(id: string): Promise<boolean> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/areas/areas/${id}`, {
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
      console.error('❌ [AREAS API] Erro ao excluir área:', error);
      return false;
    }
  }
}; 