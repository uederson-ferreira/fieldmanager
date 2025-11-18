// ===================================================================
// API DE SINCRONIZAÇÃO - ECOFIELD SYSTEM
// Localização: src/lib/syncAPI.ts
// ===================================================================


import { EcoFieldDB } from './offline/database';
import { perfisOfflineAPI } from './perfisOfflineAPI';
import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export const syncAPI = {
  // Sincronizar dados do usuário para IndexedDB
  async syncUserData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [SYNC API] Iniciando sincronização de dados do usuário...');
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [SYNC API] Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }
      
      // Buscar dados via API do backend
      const response = await fetch(`${API_URL}/api/sync/usuario/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [SYNC API] Erro na API:', response.status, errorData);
        return { success: false, error: 'Erro ao sincronizar dados do usuário' };
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('❌ [SYNC API] Sincronização falhou:', data.error);
        return { success: false, error: data.error || 'Erro na sincronização' };
      }
      
      const db = new EcoFieldDB();
      
      // Salvar dados do usuário no IndexedDB
      if (data.user) {
        await db.usuarios.put({
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          matricula: data.user.matricula || '',
          telefone: data.user.telefone || '',
          ativo: data.user.ativo,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
          auth_user_id: userId
        });
      }

      // Salvar perfil do usuário se existir
      if (data.perfil) {
        perfisOfflineAPI.salvarPerfilLocal(userId, data.perfil);
      }

      console.log('✅ [SYNC API] Dados do usuário sincronizados com sucesso');
      return { success: true };
    } catch (error) {
      console.error('💥 [SYNC API] Erro na sincronização:', error);
      return { success: false, error: 'Erro na sincronização' };
    }
  },

  // Sincronizar dados gerais (perfis, etc.)
  async syncGeneralData(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [SYNC API] Iniciando sincronização de dados gerais...');
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [SYNC API] Token de autenticação não encontrado');
        return { success: false, error: 'Token de autenticação não encontrado' };
      }
      
      // Buscar dados via API do backend
      const response = await fetch(`${API_URL}/api/sync/geral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [SYNC API] Erro na API:', response.status, errorData);
        return { success: false, error: 'Erro ao sincronizar dados gerais' };
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('❌ [SYNC API] Sincronização falhou:', data.error);
        return { success: false, error: data.error || 'Erro na sincronização' };
      }
      
      // Salvar perfis no IndexedDB
      const db = new EcoFieldDB();
      if (data.perfis && data.perfis.length > 0) {
        for (const perfil of data.perfis) {
          await db.perfis.put({
            id: perfil.id,
            nome: perfil.nome,
            descricao: perfil.descricao,
            permissoes: perfil.permissoes || {},
            ativo: perfil.ativo ?? true,
            created_at: perfil.created_at,
            updated_at: perfil.updated_at,
          });
        }
      }

      console.log('✅ [SYNC API] Dados gerais sincronizados com sucesso');
      return { success: true };
    } catch (error) {
      console.error('💥 [SYNC API] Erro na sincronização geral:', error);
      return { success: false, error: 'Erro na sincronização' };
    }
  },

  // Sincronização completa
  async syncAll(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [SYNC API] Iniciando sincronização completa...');
      
      // Sincronizar dados do usuário
      const userResult = await this.syncUserData(userId);
      if (!userResult.success) {
        return userResult;
      }
      
      // Sincronizar dados gerais
      const generalResult = await this.syncGeneralData();
      if (!generalResult.success) {
        return generalResult;
      }
      
      console.log('✅ [SYNC API] Sincronização completa concluída com sucesso');
      return { success: true };
    } catch (error) {
      console.error('💥 [SYNC API] Erro na sincronização completa:', error);
      return { success: false, error: 'Erro na sincronização completa' };
    }
  }
}; 