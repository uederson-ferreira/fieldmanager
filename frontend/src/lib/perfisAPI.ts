// ===================================================================
// API PARA PERFIS ONLINE - ECOFIELD SYSTEM
// Localização: src/lib/perfisAPI.ts
// ===================================================================

import { Perfil as PerfilOffline, PermissoesPerfil } from './perfisOfflineAPI';

export interface PerfilOnline {
  id: string;
  nome: string;
  descricao: string;
  permissoes: PermissoesPerfil;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Exportar tipo Perfil compatível com ambas as interfaces
export type Perfil = PerfilOffline;

// Função para obter token de autenticação
const getAuthToken = (): string | null => {
  try {
    // Tentar obter token do localStorage
    const token = localStorage.getItem('ecofield_auth_token');
    return token || null;
  } catch (error) {
    console.error('❌ [PERFIS API] Erro ao obter token:', error);
    return null;
  }
};

export const perfisAPI = {
  // Buscar perfil do usuário via API do backend
  async getPerfilUsuario(userId: string): Promise<{ perfil: Perfil | null; error?: string }> {
    try {
      console.log('🔍 [PERFIS API] Buscando perfil via API do backend para usuário:', userId);
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { perfil: null, error: 'Token de autenticação não encontrado' };
      }

      // Buscar perfil via API do backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis/usuario/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [PERFIS API] Erro na API:', response.status, errorData);
        
        if (response.status === 401) {
          return { perfil: null, error: 'Sessão expirada. Faça login novamente.' };
        } else if (response.status === 404) {
          return { perfil: null, error: 'Usuário não encontrado' };
        } else {
          return { perfil: null, error: 'Erro ao buscar perfil' };
        }
      }

      const data = await response.json();
      console.log('✅ [PERFIS API] Perfil encontrado via API:', data.perfil?.nome);
      
      if (!data.perfil) {
        return { perfil: null, error: 'Perfil não encontrado' };
      }

      const perfil: Perfil = {
        id: data.perfil.id,
        nome: data.perfil.nome,
        descricao: data.perfil.descricao,
        permissoes: data.perfil.permissoes || {},
        ativo: data.perfil.ativo ?? true,
        created_at: data.perfil.created_at,
        updated_at: data.perfil.updated_at,
      };

      return { perfil };
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { perfil: null, error: 'Erro interno do servidor' };
    }
  },

  // Buscar todos os perfis disponíveis via API
  async getPerfis(): Promise<{ perfis: Perfil[]; error?: string }> {
    try {
      console.log('🔍 [PERFIS API] Buscando todos os perfis via API...');
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { perfis: [], error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('❌ [PERFIS API] Erro ao buscar perfis:', response.status);
        return { perfis: [], error: 'Erro ao buscar perfis' };
      }

      const data = await response.json();
      console.log('✅ [PERFIS API] Perfis encontrados via API:', data.perfis?.length || 0);
      
      return { perfis: data.perfis || [] };
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { perfis: [], error: 'Erro interno do servidor' };
    }
  },

  // Aplicar perfil a um usuário via API
  async aplicarPerfil(userId: string, perfilId: string): Promise<{ error?: string }> {
    try {
      console.log('🔄 [PERFIS API] Aplicando perfil via API:', perfilId, 'para usuário:', userId);

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis/aplicar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          perfilId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [PERFIS API] Erro ao aplicar perfil:', response.status, errorData);
        return { error: 'Erro ao aplicar perfil' };
      }

      console.log('✅ [PERFIS API] Perfil aplicado com sucesso via API');
      return {};
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { error: 'Erro interno do servidor' };
    }
  },

  // Listar todos os perfis
  async list(): Promise<{ success: boolean; data?: Perfil[]; error?: string }> {
    try {
      console.log('📋 [PERFIS API] Listando todos os perfis');

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('❌ [PERFIS API] Erro ao listar perfis:', response.status);
        return { success: false, error: 'Erro ao listar perfis' };
      }

      const data = await response.json();
      console.log('✅ [PERFIS API] Perfis listados:', data.perfis?.length || 0);

      return { success: true, data: data.perfis || [] };
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  },

  // Criar novo perfil
  async create(perfil: Partial<Perfil>): Promise<{ success: boolean; data?: Perfil; error?: string }> {
    try {
      console.log('➕ [PERFIS API] Criando novo perfil:', perfil.nome);

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(perfil)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [PERFIS API] Erro ao criar perfil:', response.status, errorData);
        return { success: false, error: errorData.error || 'Erro ao criar perfil' };
      }

      const data = await response.json();
      console.log('✅ [PERFIS API] Perfil criado:', data.perfil?.nome);

      return { success: true, data: data.perfil };
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  },

  // Atualizar perfil
  async update(id: string, perfil: Partial<Perfil>): Promise<{ success: boolean; data?: Perfil; error?: string }> {
    try {
      console.log('✏️ [PERFIS API] Atualizando perfil:', id);

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(perfil)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [PERFIS API] Erro ao atualizar perfil:', response.status, errorData);
        return { success: false, error: errorData.error || 'Erro ao atualizar perfil' };
      }

      const data = await response.json();
      console.log('✅ [PERFIS API] Perfil atualizado:', data.perfil?.nome);

      return { success: true, data: data.perfil };
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  },

  // Deletar perfil
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ [PERFIS API] Deletando perfil:', id);

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS API] Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/perfis/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [PERFIS API] Erro ao deletar perfil:', response.status, errorData);
        return { success: false, error: errorData.error || 'Erro ao deletar perfil' };
      }

      console.log('✅ [PERFIS API] Perfil deletado');

      return { success: true };
    } catch (error) {
      console.error('💥 [PERFIS API] Erro inesperado:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }
}; 