// ===================================================================
// API DE ROTINAS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/rotinasAPI.ts
// ===================================================================


import { EcoFieldDB } from './offline/database';
import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface Rotina {
  id: string;
  data_atividade: string;
  area_id: string;
  atividade: string;
  descricao?: string;
  tma_responsavel_id: string;
  encarregado_id: string;
  status?: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RotinaCreateData {
  data_atividade: string;
  area_id: string;
  atividade: string;
  descricao?: string;
  tma_responsavel_id: string;
  encarregado_id: string;
  status?: string;
}

export interface RotinaUpdateData {
  data_atividade?: string;
  area_id?: string;
  atividade?: string;
  descricao?: string;
  tma_responsavel_id?: string;
  encarregado_id?: string;
  status?: string;
}

export const rotinasAPI = {
  // Listar todas as rotinas (online + offline)
  async list(): Promise<{ success: boolean; data?: Rotina[]; error?: string }> {
    let rotinasOnline: any[] = [];
    let rotinasOffline: any[] = [];
    
    // 1. Tentar buscar rotinas online
    try {
      const token = getAuthToken();
      
      if (token) {
        const response = await fetch(`${API_URL}/api/rotinas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          rotinasOnline = await response.json();
          console.log('✅ [ROTINAS API] Rotinas online carregadas:', rotinasOnline.length);
        } else {
          console.warn('⚠️ [ROTINAS API] Erro na API online:', response.status);
        }
      }
    } catch (onlineError) {
      console.warn('⚠️ [ROTINAS API] Erro ao buscar rotinas online:', onlineError);
    }
    
    // 2. Sempre buscar rotinas offline (independente do status online)
    try {
      const { AtividadeRotinaManager } = await import('./offline/entities/managers/AtividadeRotinaManager');
      rotinasOffline = await AtividadeRotinaManager.getAll();
      console.log('📱 [ROTINAS API] Rotinas offline encontradas:', rotinasOffline.length);
      
      // Debug detalhado das rotinas offline
      if (rotinasOffline.length > 0) {
        console.log('🔍 [ROTINAS API] Detalhes das rotinas offline:', rotinasOffline.map(r => ({
          id: r.id,
          atividade: r.atividade,
          offline: r.offline,
          sincronizado: r.sincronizado
        })));
      }
    } catch (offlineError) {
      console.warn('⚠️ [ROTINAS API] Erro ao buscar rotinas offline:', offlineError);
    }
    
    // 3. Combinar rotinas online + offline
    const todasRotinas = [...rotinasOnline, ...rotinasOffline];
    console.log('📊 [ROTINAS API] Total de rotinas (online + offline):', todasRotinas.length);
    
    // Debug detalhado da combinação
    console.log('🔍 [ROTINAS API] Resumo da combinação:', {
      online: rotinasOnline.length,
      offline: rotinasOffline.length,
      total: todasRotinas.length,
      onlineIds: rotinasOnline.map(r => r.id),
      offlineIds: rotinasOffline.map(r => r.id)
    });
    
    return { success: true, data: todasRotinas };
  },

  // Buscar rotina por ID
  async get(id: string): Promise<{ success: boolean; data?: Rotina; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/rotinas/${id}`, {
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
      console.log('✅ [ROTINAS API] Rotina carregada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [ROTINAS API] Erro ao buscar rotina:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Criar nova rotina
  async create(rotinaData: RotinaCreateData): Promise<{ success: boolean; data?: Rotina; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/rotinas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rotinaData)
      });

      if (!response.ok) {
        // Capturar detalhes do erro 500
        const errorText = await response.text();
        console.error('❌ [ROTINAS API] Detalhes do erro:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          dadosEnviados: rotinaData
        });
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [ROTINAS API] Rotina criada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [ROTINAS API] Erro ao criar rotina:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Atualizar rotina
  async update(id: string, rotinaData: RotinaUpdateData): Promise<{ success: boolean; data?: Rotina; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/rotinas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rotinaData)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [ROTINAS API] Rotina atualizada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [ROTINAS API] Erro ao atualizar rotina:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir rotina
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/rotinas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [ROTINAS API] Rotina excluída:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ [ROTINAS API] Erro ao excluir rotina:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}; 