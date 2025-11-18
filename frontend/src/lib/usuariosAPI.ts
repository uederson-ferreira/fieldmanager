import { unifiedCache } from './unifiedCache';
import { getAuthToken } from '../utils/authUtils';

// ===================================================================
// TIPOS
// ===================================================================

export interface Usuario {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  matricula?: string;
  telefone?: string;
  perfil_id: string;
  empresa_id?: string;
  ativo: boolean;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
  perfis?: {
    id: string;
    nome: string;
    descricao: string;
  };
}

export interface CriarUsuarioData {
  nome: string;
  email: string;
  senha: string;
  matricula?: string;
  telefone?: string;
  perfil_id: string;
  empresa_id?: string;
}

export interface AtualizarUsuarioData {
  nome?: string;
  email?: string;
  senha?: string;
  matricula?: string;
  telefone?: string;
  perfil_id?: string;
  empresa_id?: string;
  ativo?: boolean;
}

// ===================================================================
// API DE USUÁRIOS
// ===================================================================

class UsuariosAPI {
  private baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/usuarios`;

  // ===================================================================
  // OBTER USUÁRIO ATUAL
  // ===================================================================

  async getUsuarioAtual(): Promise<{ usuario: Usuario | null; error?: string }> {
    try {
      console.log('👤 [USUARIOS API] Obtendo usuário atual...');

      const response = await fetch(`${this.baseURL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao obter usuário atual:', errorData);
        return { usuario: null, error: errorData.error || 'Erro ao obter usuário atual' };
      }

      const usuario = await response.json();
      console.log('✅ [USUARIOS API] Usuário atual obtido:', usuario.nome);
      return { usuario };
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { usuario: null, error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // OBTER USUÁRIOS ATIVOS
  // ===================================================================

  async getUsuariosAtivos(): Promise<{ usuarios: Usuario[]; error?: string }> {
    try {
      console.log('👥 [USUARIOS API] Obtendo usuários ativos...');

      const response = await fetch(`${this.baseURL}/usuarios-ativos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao obter usuários ativos:', errorData);
        return { usuarios: [], error: errorData.error || 'Erro ao obter usuários ativos' };
      }

      const usuarios = await response.json();
      console.log('✅ [USUARIOS API] Usuários ativos obtidos:', usuarios.length);
      return { usuarios };
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { usuarios: [], error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // OBTER USUÁRIOS TMA
  // ===================================================================

  async getUsuariosTMA(): Promise<{ usuarios: Usuario[]; error?: string }> {
    try {
      console.log('👥 [USUARIOS API] Obtendo usuários TMA...');

      const response = await fetch(`${this.baseURL}/usuarios-tma`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao obter usuários TMA:', errorData);
        return { usuarios: [], error: errorData.error || 'Erro ao obter usuários TMA' };
      }

      const usuarios = await response.json();
      console.log('✅ [USUARIOS API] Usuários TMA obtidos:', usuarios.length);
      return { usuarios };
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { usuarios: [], error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // CRIAR USUÁRIO
  // ===================================================================

  async criarUsuario(dados: CriarUsuarioData): Promise<{ usuario: Usuario | null; error?: string }> {
    try {
      console.log('📝 [USUARIOS API] Criando usuário:', dados.email);

      const response = await fetch(`${this.baseURL}/criar-usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao criar usuário:', errorData);
        return { usuario: null, error: errorData.error || 'Erro ao criar usuário' };
      }

      const usuario = await response.json();
      console.log('✅ [USUARIOS API] Usuário criado:', usuario.email);
      return { usuario };
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { usuario: null, error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // ATUALIZAR USUÁRIO
  // ===================================================================

  async atualizarUsuario(id: string, dados: AtualizarUsuarioData): Promise<{ usuario: Usuario | null; error?: string }> {
    try {
      console.log('📝 [USUARIOS API] Atualizando usuário:', id);

      const response = await fetch(`${this.baseURL}/atualizar-usuario/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao atualizar usuário:', errorData);
        return { usuario: null, error: errorData.error || 'Erro ao atualizar usuário' };
      }

      const usuario = await response.json();
      console.log('✅ [USUARIOS API] Usuário atualizado:', usuario.email);
      return { usuario };
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { usuario: null, error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // DELETAR USUÁRIO
  // ===================================================================

  async deletarUsuario(id: string): Promise<{ error?: string }> {
    try {
      console.log('🗑️ [USUARIOS API] Deletando usuário:', id);

      const response = await fetch(`${this.baseURL}/deletar-usuario/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao deletar usuário:', errorData);
        return { error: errorData.error || 'Erro ao deletar usuário' };
      }

      console.log('✅ [USUARIOS API] Usuário deletado:', id);
      return {};
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // OBTER USUÁRIO POR ID
  // ===================================================================

  async getUsuarioById(id: string): Promise<{ usuario: Usuario | null; error?: string }> {
    try {
      console.log('🔍 [USUARIOS API] Obtendo usuário:', id);

      const response = await fetch(`${this.baseURL}/usuario/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [USUARIOS API] Erro ao obter usuário:', errorData);
        return { usuario: null, error: errorData.error || 'Erro ao obter usuário' };
      }

      const usuario = await response.json();
      console.log('✅ [USUARIOS API] Usuário obtido:', usuario.email);
      return { usuario };
    } catch (error) {
      console.error('💥 [USUARIOS API] Erro inesperado:', error);
      return { usuario: null, error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // UTILITÁRIOS
  // ===================================================================

  private async getAuthToken(): Promise<string> {
    try {
      const token = getAuthToken();
      console.log('🔑 [USUARIOS API] Token obtido:', token ? 'Sim' : 'Não');
      return token || '';
    } catch (error) {
      console.error('❌ [USUARIOS API] Erro ao obter token:', error);
      return '';
    }
  }

  // ===================================================================
  // CACHE E SINCRONIZAÇÃO
  // ===================================================================

  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 [USUARIOS API] Atualizando cache...');
      
      // Limpar cache de usuários
      await unifiedCache.refreshCache('usuarios');
      
      // Recarregar dados
      await this.getUsuariosAtivos();
      await this.getUsuariosTMA();
      
      console.log('✅ [USUARIOS API] Cache atualizado');
    } catch (error) {
      console.error('❌ [USUARIOS API] Erro ao atualizar cache:', error);
    }
  }
}

// ===================================================================
// INSTÂNCIA ÚNICA
// ===================================================================

export const usuariosAPI = new UsuariosAPI(); 