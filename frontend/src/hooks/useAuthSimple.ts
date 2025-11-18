// ===================================================================
// MÓDULO DE AUTENTICAÇÃO SIMPLIFICADO - ECOFIELD SYSTEM  
// Localização: src/hooks/useAuth.ts
// ===================================================================

import { useState, useEffect } from 'react';

// ===================================================================
// TIPOS SIMPLIFICADOS
// ===================================================================

interface UserComplete {
  // Dados básicos do usuário
  id: string;
  nome: string;
  email: string;
  matricula: string;
  telefone: string;
  ativo: boolean;
  
  // Dados do perfil (unificado)
  perfil: string;
  funcao: string;
  permissoes: {
    lv?: boolean;
    fotos?: boolean;
    inspecoes?: boolean;
    gps?: boolean;
    admin?: boolean;
  };
  
  // Metadados
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: UserComplete | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ===================================================================
// API DE AUTENTICAÇÃO SIMPLIFICADA
// ===================================================================

const API_URL = import.meta.env.VITE_API_URL;

class AuthService {
  // ===================================================================
  // LOGIN UNIFICADO - UMA ÚNICA REQUISIÇÃO
  // ===================================================================
  
  async login(email: string, password: string): Promise<{ user?: UserComplete; error?: string }> {
    try {
      console.log('🔐 [AUTH SIMPLE] Iniciando login unificado:', email);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [AUTH SIMPLE] Erro no login:', data.error);
        return { 
          error: data.error?.includes('Invalid login credentials') 
            ? 'Email ou senha incorretos' 
            : data.error || 'Erro no login'
        };
      }

      if (!data.user) {
        console.error('❌ [AUTH SIMPLE] Usuário não encontrado');
        return { error: 'Usuário não encontrado' };
      }

      // ✅ SALVAR TOKEN E DADOS
      if (data.token) {
        localStorage.setItem('ecofield_auth_token', data.token);
      }
      
      const userComplete: UserComplete = {
        id: data.user.id,
        nome: data.user.nome,
        email: data.user.email,
        matricula: data.user.matricula || '',
        telefone: data.user.telefone || '',
        ativo: data.user.ativo,
        perfil: data.user.perfil || 'TMA Campo',
        funcao: data.user.funcao || 'Técnico',
        permissoes: data.user.permissoes || {},
        created_at: data.user.created_at,
        updated_at: data.user.updated_at
      };

      // ✅ SALVAR NO LOCALSTORAGE
      localStorage.setItem('ecofield_user_complete', JSON.stringify(userComplete));
      
      console.log('✅ [AUTH SIMPLE] Login unificado bem-sucedido:', userComplete.nome);
      return { user: userComplete };
      
    } catch (error) {
      console.error('💥 [AUTH SIMPLE] Erro inesperado no login:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  // ===================================================================
  // LOGOUT SIMPLIFICADO
  // ===================================================================
  
  async logout(): Promise<void> {
    try {
      console.log('🚪 [AUTH SIMPLE] Fazendo logout...');
      
      // 1. Tentar logout via backend
      const token = localStorage.getItem('ecofield_auth_token');
      if (token) {
        try {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            }
          });
        } catch (error) {
          console.warn('⚠️ [AUTH SIMPLE] Erro no logout backend:', error);
        }
      }

      // 2. Limpar todos os dados
      this.clearAllData();
      
      // 3. Redirecionar
      window.location.href = '/';
      
    } catch (error) {
      console.error('💥 [AUTH SIMPLE] Erro no logout:', error);
      this.clearAllData();
      window.location.href = '/';
    }
  }

  // ===================================================================
  // CARREGAMENTO DO STORAGE
  // ===================================================================
  
  loadUserFromStorage(): UserComplete | null {
    try {
      const stored = localStorage.getItem('ecofield_user_complete');
      if (stored) {
        const user = JSON.parse(stored);
        console.log('📱 [AUTH SIMPLE] Usuário carregado do storage:', user.nome);
        return user;
      }
    } catch (error) {
      console.error('❌ [AUTH SIMPLE] Erro ao carregar do storage:', error);
    }
    return null;
  }

  // ===================================================================
  // LIMPEZA COMPLETA
  // ===================================================================
  
  clearAllData(): void {
    const keysToRemove = [
      'ecofield_user_complete',
      'ecofield_auth_token',
      'ecofield_user',
      'ecofield_auth',
      'ecofield_perfil_cache',
      'ecofield_last_auth_init'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Limpar cookies
    document.cookie.split(";").forEach(c => { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });

    console.log('🗑️ [AUTH SIMPLE] Dados limpos completamente');
  }
}

// ===================================================================
// HOOK SIMPLIFICADO
// ===================================================================

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const authService = new AuthService();

  // ===================================================================
  // INICIALIZAÇÃO - APENAS UMA VEZ
  // ===================================================================
  
  useEffect(() => {
    const initAuth = () => {
      console.log('🔍 [AUTH SIMPLE] Inicializando autenticação...');
      
      try {
        const storedUser = authService.loadUserFromStorage();
        
        if (storedUser) {
          console.log('✅ [AUTH SIMPLE] Usuário encontrado no storage');
          setAuthState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          console.log('ℹ️ [AUTH SIMPLE] Nenhum usuário no storage');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('❌ [AUTH SIMPLE] Erro na inicialização:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Erro na inicialização'
        });
      }
    };

    initAuth();
  }, []); // Sem dependências - executa apenas uma vez

  // ===================================================================
  // FUNÇÃO DE LOGIN
  // ===================================================================
  
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🚀 [AUTH SIMPLE] Tentando login:', email);
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authService.login(email, password);
      
      if (result.user) {
        // ✅ SUCESSO - ATUALIZAR ESTADO
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        console.log('✅ [AUTH SIMPLE] Login bem-sucedido!');

        // Pré-carregar dados para cache offline (não aguarda para não travar o login)
        setTimeout(async () => {
          try {
            console.log('🔄 [AUTH SIMPLE] Iniciando pré-carregamento de dados...');
            const lvAPI = await import('../lib/lvAPI');
            await lvAPI.lvAPI.preloadLVData();
          } catch (error) {
            console.warn('⚠️ [AUTH SIMPLE] Erro no pré-carregamento:', error);
          }
        }, 1000); // Aguarda 1 segundo para não impactar a experiência do login

        return { success: true };
        
      } else {
        // ❌ ERRO - ATUALIZAR ESTADO
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Erro no login'
        });
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 [AUTH SIMPLE] Erro inesperado:', error);
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erro interno do servidor'
      });
      
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  // ===================================================================
  // FUNÇÃO DE LOGOUT
  // ===================================================================
  
  const logout = async (): Promise<void> => {
    console.log('🚪 [AUTH SIMPLE] Executando logout...');
    
    // Atualizar estado imediatamente
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });

    // Executar logout completo
    await authService.logout();
  };

  // ===================================================================
  // FUNÇÕES DE PERMISSÃO
  // ===================================================================
  
  const isAdmin = authState.user?.permissoes?.admin || false;
  
  const hasPermission = (permission: keyof NonNullable<UserComplete['permissoes']>): boolean => {
    return authState.user?.permissoes?.[permission] || false;
  };

  // ===================================================================
  // RETORNO DO HOOK
  // ===================================================================
  
  return {
    // Estados
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Funções
    login,
    logout,
    
    // Permissões
    isAdmin,
    hasPermission,
    
    // Dados derivados
    userName: authState.user?.nome || '',
    userEmail: authState.user?.email || '',
    userProfile: authState.user?.perfil || '',
  };
}

export default useAuth;