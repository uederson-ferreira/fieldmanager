// ===================================================================
// API DE CONFIGURAÇÕES VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/configuracoesAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  tipo?: string; // 'string', 'number', 'boolean', 'json'
  categoria?: string; // 'sistema', 'notificacoes', etc.
  editavel?: boolean;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConfiguracaoCreateData {
  chave: string;
  valor: string;
  descricao?: string;
  tipo?: string;
  categoria?: string;
  editavel?: boolean;
  ativo?: boolean;
}

export interface ConfiguracaoUpdateData {
  chave?: string;
  valor?: string;
  descricao?: string;
  tipo?: string;
  categoria?: string;
  editavel?: boolean;
  ativo?: boolean;
}

export const configuracoesAPI = {
  // Listar todas as configurações
  async list(): Promise<{ success: boolean; data?: Configuracao[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/configuracoes`, {
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
      console.log('✅ [CONFIGURAÇÕES API] Configurações carregadas:', Array.isArray(data) ? data.length : 0);

      // Backend pode retornar array direto ou objeto
      const configs = Array.isArray(data) ? data : (data.data || data.configuracoes || []);
      return { success: true, data: configs };
    } catch (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao listar configurações:', error);

      // Retornar array vazio em caso de erro (permite funcionar sem configurações)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  // Buscar configuração por ID
  async get(id: string): Promise<{ success: boolean; data?: Configuracao; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/configuracoes/${id}`, {
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
      console.log('✅ [CONFIGURAÇÕES API] Configuração carregada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar configuração:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Criar nova configuração
  async create(configData: ConfiguracaoCreateData): Promise<{ success: boolean; data?: Configuracao; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/configuracoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [CONFIGURAÇÕES API] Configuração criada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao criar configuração:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Atualizar configuração
  async update(id: string, configData: ConfiguracaoUpdateData): Promise<{ success: boolean; data?: Configuracao; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/configuracoes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [CONFIGURAÇÕES API] Configuração atualizada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao atualizar configuração:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir configuração
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/configuracoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [CONFIGURAÇÕES API] Configuração excluída:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao excluir configuração:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}; 