// ===================================================================
// API DE AUTENTICAÇÃO SIMPLIFICADA - ECOFIELD SYSTEM
// Localização: src/lib/authAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';
import type { 
  UserData, 
  CreateUserData, 
  UpdateUserData, 
  UserMetadata
} from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const authAPI = {
  // ===================================================================
  // AUTENTICAÇÃO
  // ===================================================================

  // Login com email e senha
  async login(email: string, password: string): Promise<{ user: UserData | null; error?: string }> {
    try {
      console.log('🔐 [AUTH API] Tentando login:', email);
      console.log('📞 [AUTH API] Chamado por:', new Error().stack?.split('\n')[2]?.trim() || 'Desconhecido');
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [AUTH API] Erro no login:', data.error);
        // Mapear mensagens de erro para português
        let errorMessage = data.error || 'Erro no login';
        if (data.error?.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (data.error?.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado';
        } else if (data.error?.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
        }
        return { user: null, error: errorMessage };
      }

      if (!data.user) {
        console.error('❌ [AUTH API] Usuário não encontrado');
        return { user: null, error: 'Usuário não encontrado' };
      }

      // Salvar token no localStorage
      if (data.token) {
        localStorage.setItem('ecofield_auth_token', data.token);
      }

      console.log('✅ [AUTH API] Login bem-sucedido:', data.user.nome);
      
      return { user: data.user };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado no login:', error);
      return { user: null, error: 'Erro interno do servidor' };
    }
  },

  // Logout
  async logout(): Promise<{ error?: string }> {
    try {
      console.log('🚪 [AUTH API] Fazendo logout...');
      console.log('📞 [AUTH API] Chamado por:', new Error().stack?.split('\n')[2]?.trim() || 'Desconhecido');
      
      // 1. Tentar logout via backend
      const token = getAuthToken();
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error('❌ [AUTH API] Erro no logout backend:', response.status);
          }
        } catch (backendError) {
          console.error('❌ [AUTH API] Erro ao chamar logout backend:', backendError);
        }
      }

      // 2. Limpeza adicional do localStorage
      try {
        localStorage.removeItem("ecofield_auth_token");
        localStorage.removeItem("ecofield_auth");
        localStorage.removeItem("ecofield_auth_v2");
        
        // Limpar outras chaves relacionadas
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('supabase') || key.includes('ecofield'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (storageError) {
        console.error('⚠️ [AUTH API] Erro ao limpar localStorage:', storageError);
      }

      console.log('✅ [AUTH API] Logout bem-sucedido');
      return {};
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado no logout:', error);
      
      // Tentar limpeza mesmo com erro
      try {
        localStorage.removeItem("ecofield_auth_token");
        localStorage.removeItem("ecofield_auth");
        localStorage.removeItem("ecofield_auth_v2");
      } catch (clearError) {
        console.error('💥 [AUTH API] Erro ao limpar localStorage após erro:', clearError);
      }
      
      return { error: 'Erro interno do servidor' };
    }
  },

  // Obter usuário atual
  async getCurrentUser(): Promise<{ user: UserData | null; error?: string }> {
    try {
      console.log('👤 [AUTH API] Obtendo usuário atual...');
      
      const token = getAuthToken();
      if (!token) {
        console.log('⚠️ [AUTH API] Nenhum token encontrado');
        return { user: null };
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ [AUTH API] Erro ao obter usuário:', response.status);
        return { user: null, error: 'Erro ao obter usuário' };
      }

      const data = await response.json();

      if (!data.user) {
        console.log('⚠️ [AUTH API] Nenhum usuário logado');
        return { user: null };
      }

      console.log('✅ [AUTH API] Usuário obtido:', data.user.nome);
      
      return { user: data.user };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao obter usuário:', error);
      return { user: null, error: 'Erro interno do servidor' };
    }
  },

  // ===================================================================
  // CRIAÇÃO E GESTÃO DE USUÁRIOS
  // ===================================================================

  // Criar novo usuário
  async createUser(userData: CreateUserData): Promise<{ user: UserData | null; error?: string }> {
    try {
      console.log('👤 [AUTH API] Criando usuário:', userData.email);
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [AUTH API] Token de autenticação não encontrado');
        return { user: null, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [AUTH API] Erro ao criar usuário:', data.error);
        return { user: null, error: data.error || 'Erro ao criar usuário' };
      }

      console.log('✅ [AUTH API] Usuário criado com sucesso:', data.user.nome);
      return { user: data.user };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao criar usuário:', error);
      return { user: null, error: 'Erro interno do servidor' };
    }
  },

  // Atualizar usuário
  async updateUser(updates: UpdateUserData): Promise<{ user: UserData | null; error?: string }> {
    try {
      console.log('🔄 [AUTH API] Atualizando usuário...');
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [AUTH API] Token de autenticação não encontrado');
        return { user: null, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${API_URL}/api/auth/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [AUTH API] Erro ao atualizar usuário:', data.error);
        return { user: null, error: data.error || 'Erro ao atualizar usuário' };
      }

      console.log('✅ [AUTH API] Usuário atualizado:', data.user?.nome);
      return { user: data.user };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao atualizar usuário:', error);
      return { user: null, error: 'Erro interno do servidor' };
    }
  },

  // Deletar usuário
  async deleteUser(): Promise<{ error?: string }> {
    try {
      console.log('🗑️ [AUTH API] Deletando usuário...');
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [AUTH API] Token de autenticação não encontrado');
        return { error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${API_URL}/api/auth/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ [AUTH API] Erro ao deletar usuário:', data.error);
        return { error: data.error || 'Erro ao deletar usuário' };
      }

      console.log('✅ [AUTH API] Usuário deletado');
      return {};
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao deletar usuário:', error);
      return { error: 'Erro interno do servidor' };
    }
  },

  // ===================================================================
  // RECUPERAÇÃO DE SENHA
  // ===================================================================

  // Enviar email de recuperação de senha
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 [AUTH API] Enviando email de recuperação para:', email);
      
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [AUTH API] Erro ao enviar email de recuperação:', data.error);
        return { success: false, error: data.error || 'Erro ao enviar email de recuperação' };
      }

      console.log('✅ [AUTH API] Email de recuperação enviado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao enviar email de recuperação:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  },

  // ===================================================================
  // UTILITÁRIOS
  // ===================================================================

  // Verificar se usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = getAuthToken();
      return !!token;
    } catch (error) {
      console.error('❌ [AUTH API] Erro ao verificar autenticação:', error);
      return false;
    }
  },

  // Obter sessão atual
  async getSession() {
    try {
      const token = getAuthToken();
      if (!token) {
        return { session: null, error: 'Nenhuma sessão encontrada' };
      }

      return { session: { access_token: token } };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao obter sessão:', error);
      return { session: null, error: 'Erro interno do servidor' };
    }
  },

  // Listar todos os usuários (apenas para admin)
  async listUsers(): Promise<{ users: UserData[]; error?: string }> {
    try {
      console.log('📋 [AUTH API] Listando usuários...');
      
      // Nota: Esta funcionalidade requer admin privileges
      // Pode ser implementada usando Supabase Admin API se necessário
      
      console.log('⚠️ [AUTH API] Listagem de usuários não implementada (requer admin)');
      return { users: [], error: 'Funcionalidade não implementada' };
    } catch (error) {
      console.error('💥 [AUTH API] Erro inesperado ao listar usuários:', error);
      return { users: [], error: 'Erro interno do servidor' };
    }
  }
}; 