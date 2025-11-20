// ===================================================================
// API DE PERFIS OFFLINE - ECOFIELD SYSTEM
// Localização: src/lib/perfisOfflineAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

// Tipos para perfis (migrados do perfisAPI)
export interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  permissoes: PermissoesPerfil;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissoesPerfil {
  // Módulos principais
  lvs: string[];           // ["read", "write", "delete"]
  termos: string[];        // ["read", "write", "delete"]
  rotinas: string[];       // ["read", "write", "delete"]
  metas: string[];         // ["read", "write", "delete"]

  // Funcionalidades específicas
  fotos: string[];         // ["upload", "view", "delete"]
  relatorios: string[];    // ["view", "export", "admin"]

  // Permissões administrativas
  usuarios: string[];      // ["view", "create", "edit", "delete"]
  perfis: string[];        // ["view", "create", "edit", "delete"]
  sistema: string[];       // ["config", "backup", "logs"]

  // Flags especiais
  admin: boolean;          // Acesso total
  demo: boolean;           // Modo demonstração
}

// Chaves para localStorage
const STORAGE_KEYS = {
  PERFIL_USUARIO: 'ecofield_perfil_usuario',
  PERMISSOES_USUARIO: 'ecofield_permissoes_usuario',
  PERFIS_CACHE: 'ecofield_perfis_cache',
  LAST_SYNC: 'ecofield_perfis_last_sync'
};

// Cache em memória para performance
let permissoesCache: PermissoesPerfil | null = null;

export const perfisOfflineAPI = {
  // ===================================================================
  // GESTÃO DE CACHE LOCAL
  // ===================================================================

  // Salvar perfil no localStorage
  salvarPerfilLocal(userId: string, perfil: Perfil): void {
    try {
      const key = `${STORAGE_KEYS.PERFIL_USUARIO}_${userId}`;
      const permissoesKey = `${STORAGE_KEYS.PERMISSOES_USUARIO}_${userId}`;
      
      localStorage.setItem(key, JSON.stringify(perfil));
      localStorage.setItem(permissoesKey, JSON.stringify(perfil.permissoes));
      
      // Atualizar cache em memória
      permissoesCache = perfil.permissoes;
      
      console.log('✅ [PERFIS OFFLINE] Perfil salvo localmente:', perfil.nome);
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao salvar perfil local:', error);
    }
  },

  // Carregar perfil do localStorage
  carregarPerfilLocal(userId: string): { perfil: Perfil | null; permissoes: PermissoesPerfil | null } {
    try {
      const key = `${STORAGE_KEYS.PERFIL_USUARIO}_${userId}`;
      const permissoesKey = `${STORAGE_KEYS.PERMISSOES_USUARIO}_${userId}`;
      
      const perfilData = localStorage.getItem(key);
      const permissoesData = localStorage.getItem(permissoesKey);
      
      if (perfilData && permissoesData) {
        const perfil = JSON.parse(perfilData) as Perfil;
        const permissoes = JSON.parse(permissoesData) as PermissoesPerfil;
        
        // Atualizar cache em memória
        permissoesCache = permissoes;
        
        console.log('✅ [PERFIS OFFLINE] Perfil carregado localmente:', perfil.nome);
        return { perfil, permissoes };
      }
      
      return { perfil: null, permissoes: null };
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao carregar perfil local:', error);
      return { perfil: null, permissoes: null };
    }
  },

  // Limpar perfil do localStorage
  limparPerfilLocal(userId: string): void {
    try {
      const key = `${STORAGE_KEYS.PERFIL_USUARIO}_${userId}`;
      const permissoesKey = `${STORAGE_KEYS.PERMISSOES_USUARIO}_${userId}`;
      
      localStorage.removeItem(key);
      localStorage.removeItem(permissoesKey);
      
      // Limpar cache em memória
      permissoesCache = null;
      
      console.log('✅ [PERFIS OFFLINE] Perfil limpo localmente');
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao limpar perfil local:', error);
    }
  },

  // ===================================================================
  // SINCRONIZAÇÃO ONLINE/OFFLINE
  // ===================================================================

  // Sincronizar perfil do servidor
  async sincronizarPerfil(userId: string): Promise<{ perfil: Perfil | null; error?: string }> {
    try {
      console.log('🔄 [PERFIS OFFLINE] Sincronizando perfil do servidor...');
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS OFFLINE] Token de autenticação não encontrado');
        return { perfil: null, error: 'Token de autenticação não encontrado' };
      }

      // Buscar dados via API do backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecofield-production.up.railway.app'}/api/perfis/usuario/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ [PERFIS OFFLINE] Erro na API:', response.status);
        return { perfil: null, error: 'Erro ao buscar perfil do servidor' };
      }

      const data = await response.json();
      
      if (!data.perfil) {
        console.log('⚠️ [PERFIS OFFLINE] Usuário sem perfil no servidor');
        return { perfil: null };
      }

      const perfil: Perfil = {
        id: data.perfil.id,
        nome: data.perfil.nome || 'TMA Campo',
        descricao: data.perfil.descricao || '',
        permissoes: data.perfil.permissoes || {},
        ativo: data.perfil.ativo ?? true,
        created_at: data.perfil.created_at || new Date().toISOString(),
        updated_at: data.perfil.updated_at || new Date().toISOString(),
      };

      // Salvar localmente
      this.salvarPerfilLocal(userId, perfil);
      
      // Atualizar timestamp de sincronização
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      console.log('✅ [PERFIS OFFLINE] Perfil sincronizado:', perfil.nome);
      return { perfil };
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro inesperado na sincronização:', error);
      return { perfil: null, error: 'Erro interno do servidor' };
    }
  },

  // Verificar se precisa sincronizar
  precisaSincronizar(): boolean {
    try {
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (!lastSync) return true;
      
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const diffHours = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);
      
      // Sincronizar a cada 24 horas
      return diffHours > 24;
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao verificar sincronização:', error);
      return true;
    }
  },

  // ===================================================================
  // OBTER PERFIL (HÍBRIDO ONLINE/OFFLINE)
  // ===================================================================

  // Obter perfil do usuário (prioriza cache local)
  async getPerfilUsuario(userId: string): Promise<{ perfil: Perfil | null; error?: string }> {
    try {
      console.log('🔍 [PERFIS OFFLINE] Obtendo perfil do usuário:', userId);
      
      // 1. Tentar carregar do cache local primeiro
      const { perfil: perfilLocal, permissoes: permissoesLocal } = this.carregarPerfilLocal(userId);
      
      if (perfilLocal && permissoesLocal) {
        console.log('✅ [PERFIS OFFLINE] Perfil encontrado no cache local');
        return { perfil: perfilLocal };
      }
      
      // 2. Se não tem cache local, tentar sincronizar
      console.log('🔄 [PERFIS OFFLINE] Cache local não encontrado, tentando sincronizar...');
      return await this.sincronizarPerfil(userId);
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro inesperado ao obter perfil:', error);
      return { perfil: null, error: 'Erro interno do servidor' };
    }
  },

  // Obter perfil com sincronização forçada
  async getPerfilUsuarioComSync(userId: string, forcarSync: boolean = false): Promise<{ perfil: Perfil | null; error?: string }> {
    try {
      console.log('🔍 [PERFIS OFFLINE] Obtendo perfil com sincronização:', forcarSync);
      
      // Verificar se precisa sincronizar
      if (forcarSync || this.precisaSincronizar()) {
        console.log('🔄 [PERFIS OFFLINE] Sincronização necessária');
        return await this.sincronizarPerfil(userId);
      }
      
      // Tentar cache local
      const { perfil: perfilLocal, permissoes: permissoesLocal } = this.carregarPerfilLocal(userId);
      
      if (perfilLocal && permissoesLocal) {
        console.log('✅ [PERFIS OFFLINE] Perfil encontrado no cache local');
        return { perfil: perfilLocal };
      }
      
      // Se não tem cache, sincronizar
      console.log('🔄 [PERFIS OFFLINE] Cache não encontrado, sincronizando...');
      return await this.sincronizarPerfil(userId);
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro inesperado:', error);
      return { perfil: null, error: 'Erro interno do servidor' };
    }
  },

  // ===================================================================
  // VERIFICAÇÃO DE PERMISSÕES (FUNCIONA OFFLINE)
  // ===================================================================

  // Verificar permissão (funciona offline)
  verificarPermissao(userId: string, modulo: string, acao: string): { temPermissao: boolean; error?: string } {
    try {
      console.log('🔐 [PERFIS OFFLINE] Verificando permissão:', modulo, acao);
      
      // Usar cache em memória se disponível
      if (permissoesCache) {
        return this.verificarPermissaoComPermissoes(permissoesCache, modulo, acao);
      }
      
      // Tentar carregar do localStorage
      const { permissoes } = this.carregarPerfilLocal(userId);
      
      if (!permissoes) {
        console.log('⚠️ [PERFIS OFFLINE] Permissões não encontradas localmente');
        return { temPermissao: false, error: 'Perfil não encontrado' };
      }
      
      return this.verificarPermissaoComPermissoes(permissoes, modulo, acao);
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro ao verificar permissão:', error);
      return { temPermissao: false, error: 'Erro interno' };
    }
  },

  // Verificar permissão com objeto de permissões
  verificarPermissaoComPermissoes(permissoes: PermissoesPerfil, modulo: string, acao: string): { temPermissao: boolean; error?: string } {
    try {
      // Admin tem todas as permissões
      if (permissoes.admin) {
        console.log('✅ [PERFIS OFFLINE] Usuário é admin - permissão concedida');
        return { temPermissao: true };
      }
      
      // Verificar permissão específica
      const permissoesModulo = permissoes[modulo as keyof PermissoesPerfil];
      
      if (Array.isArray(permissoesModulo) && permissoesModulo.includes(acao)) {
        console.log('✅ [PERFIS OFFLINE] Permissão concedida');
        return { temPermissao: true };
      }
      
      console.log('❌ [PERFIS OFFLINE] Permissão negada');
      return { temPermissao: false };
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro ao verificar permissão:', error);
      return { temPermissao: false, error: 'Erro interno' };
    }
  },

  // Verificar múltiplas permissões (funciona offline)
  verificarPermissoes(userId: string, permissoesRequeridas: Array<{ modulo: string; acao: string }>): { temTodas: boolean; permissoesFaltantes: string[]; error?: string } {
    try {
      console.log('🔐 [PERFIS OFFLINE] Verificando múltiplas permissões');
      
      // Usar cache em memória se disponível
      if (permissoesCache) {
        return this.verificarPermissoesComPermissoes(permissoesCache, permissoesRequeridas);
      }
      
      // Tentar carregar do localStorage
      const { permissoes } = this.carregarPerfilLocal(userId);
      
      if (!permissoes) {
        console.log('⚠️ [PERFIS OFFLINE] Permissões não encontradas localmente');
        return { temTodas: false, permissoesFaltantes: [], error: 'Perfil não encontrado' };
      }
      
      return this.verificarPermissoesComPermissoes(permissoes, permissoesRequeridas);
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro ao verificar permissões:', error);
      return { temTodas: false, permissoesFaltantes: [], error: 'Erro interno' };
    }
  },

  // Verificar múltiplas permissões com objeto de permissões
  verificarPermissoesComPermissoes(permissoes: PermissoesPerfil, permissoesRequeridas: Array<{ modulo: string; acao: string }>): { temTodas: boolean; permissoesFaltantes: string[]; error?: string } {
    try {
      // Admin tem todas as permissões
      if (permissoes.admin) {
        console.log('✅ [PERFIS OFFLINE] Usuário é admin - todas as permissões concedidas');
        return { temTodas: true, permissoesFaltantes: [] };
      }
      
      const permissoesFaltantes: string[] = [];
      
      for (const { modulo, acao } of permissoesRequeridas) {
        const permissoesModulo = permissoes[modulo as keyof PermissoesPerfil];
        
        if (!Array.isArray(permissoesModulo) || !permissoesModulo.includes(acao)) {
          permissoesFaltantes.push(`${modulo}:${acao}`);
        }
      }
      
      const temTodas = permissoesFaltantes.length === 0;
      
      console.log(`✅ [PERFIS OFFLINE] Verificação concluída: ${temTodas ? 'Todas concedidas' : `${permissoesFaltantes.length} negadas`}`);
      
      return { temTodas, permissoesFaltantes };
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro ao verificar permissões:', error);
      return { temTodas: false, permissoesFaltantes: [], error: 'Erro interno' };
    }
  },

  // ===================================================================
  // UTILITÁRIOS
  // ===================================================================

  // Limpar cache
  limparCache(): void {
    try {
      permissoesCache = null;
      console.log('✅ [PERFIS OFFLINE] Cache limpo');
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao limpar cache:', error);
    }
  },

  // Verificar se tem dados offline
  temDadosOffline(userId: string): boolean {
    try {
      const key = `${STORAGE_KEYS.PERFIL_USUARIO}_${userId}`;
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao verificar dados offline:', error);
      return false;
    }
  },

  // Obter timestamp da última sincronização
  getUltimaSincronizacao(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('❌ [PERFIS OFFLINE] Erro ao obter última sincronização:', error);
      return null;
    }
  },

  // ===================================================================
  // FUNÇÕES ADMINISTRATIVAS (MIGRADAS DO PERFISAPI)
  // ===================================================================

  // Obter todos os perfis (função administrativa)
  async getPerfis(): Promise<{ perfis: Perfil[]; error?: string }> {
    try {
      console.log('📋 [PERFIS OFFLINE] Obtendo perfis do banco...');

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS OFFLINE] Token de autenticação não encontrado');
        return { perfis: [], error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecofield-production.up.railway.app'}/api/perfis`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ [PERFIS OFFLINE] Erro na API:', response.status);
        return { perfis: [], error: 'Erro ao buscar perfis' };
      }

      const data = await response.json();
      const perfis: Perfil[] = data.perfis || [];

      console.log(`✅ [PERFIS OFFLINE] ${perfis.length} perfis carregados do banco`);
      return { perfis };
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro inesperado ao obter perfis:', error);
      return { perfis: [], error: 'Erro interno do servidor' };
    }
  },

  // Obter perfil por ID (função administrativa)
  async getPerfilById(perfilId: string): Promise<{ perfil: Perfil | null; error?: string }> {
    try {
      console.log('🔍 [PERFIS OFFLINE] Obtendo perfil por ID:', perfilId);

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS OFFLINE] Token de autenticação não encontrado');
        return { perfil: null, error: 'Token de autenticação não encontrado' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecofield-production.up.railway.app'}/api/perfis/${perfilId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ [PERFIS OFFLINE] Erro na API:', response.status);
        return { perfil: null, error: 'Perfil não encontrado' };
      }

      const data = await response.json();
      const perfil: Perfil = {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao || '',
        permissoes: data.permissoes || {},
        ativo: data.ativo,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log('✅ [PERFIS OFFLINE] Perfil encontrado:', perfil.nome);
      return { perfil };
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro inesperado ao obter perfil:', error);
      return { perfil: null, error: 'Erro interno do servidor' };
    }
  },

  // Aplicar perfil a um usuário (função administrativa)
  async aplicarPerfil(userId: string, perfilId: string): Promise<{ error?: string }> {
    try {
      console.log('🔄 [PERFIS OFFLINE] Aplicando perfil:', perfilId, 'ao usuário:', userId);

      const token = getAuthToken();
      if (!token) {
        console.error('❌ [PERFIS OFFLINE] Token de autenticação não encontrado');
        return { error: 'Token de autenticação não encontrado' };
      }

      // Primeiro verificar se o perfil existe
      const { perfil, error: perfilError } = await this.getPerfilById(perfilId);
      
      if (perfilError || !perfil) {
        console.error('❌ [PERFIS OFFLINE] Perfil não encontrado:', perfilError);
        return { error: perfilError || 'Perfil não encontrado' };
      }

      // Atualizar usuário com o novo perfil
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecofield-production.up.railway.app'}/api/perfis/aplicar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, perfilId })
      });

      if (!response.ok) {
        console.error('❌ [PERFIS OFFLINE] Erro ao atualizar usuário:', response.status);
        return { error: 'Erro ao aplicar perfil' };
      }

      console.log('✅ [PERFIS OFFLINE] Perfil aplicado com sucesso');
      return {};
    } catch (error) {
      console.error('💥 [PERFIS OFFLINE] Erro inesperado ao aplicar perfil:', error);
      return { error: 'Erro interno do servidor' };
    }
  }
}; 