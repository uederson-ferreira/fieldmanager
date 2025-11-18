// ===================================================================
// HELPER PARA CONVERSÃO DE IDs - ECOFIELD SYSTEM
// Localização: src/utils/userIdHelper.ts
// ===================================================================

import { getAuthToken } from './authUtils';

interface UserIdMapping {
  auth_user_id: string;
  usuarios_id: string;
}

// Cache para evitar múltiplas consultas
const userIdCache = new Map<string, string>();

/**
 * Converte auth_user_id para usuarios.id
 * @param authUserId - ID do usuário do Supabase Auth
 * @returns usuarios.id correspondente
 */
export async function getUsuarioIdFromAuthId(authUserId: string): Promise<string | null> {
  if (!authUserId) {
    console.warn('⚠️ [USER ID HELPER] auth_user_id não fornecido');
    return null;
  }

  // Verificar cache primeiro
  if (userIdCache.has(authUserId)) {
    const cachedId = userIdCache.get(authUserId)!;
    console.log('✅ [USER ID HELPER] ID encontrado no cache:', {
      auth_user_id: authUserId,
      usuarios_id: cachedId
    });
    return cachedId;
  }

  try {
    console.log('🔍 [USER ID HELPER] Buscando usuarios.id para auth_user_id:', authUserId);
    
    const token = getAuthToken();
    if (!token) {
      console.error('❌ [USER ID HELPER] Token de autenticação não encontrado');
      return null;
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ecofield-production.up.railway.app'}/api/usuarios/auth/${authUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ [USER ID HELPER] Erro na API:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data) {
      console.warn('⚠️ [USER ID HELPER] Usuário não encontrado para auth_user_id:', authUserId);
      return null;
    }

    // Armazenar no cache
    userIdCache.set(authUserId, data.id);
    
    console.log('✅ [USER ID HELPER] Mapeamento encontrado:', {
      auth_user_id: authUserId,
      usuarios_id: data.id,
      nome: data.nome,
      email: data.email
    });

    return data.id;

  } catch (error) {
    console.error('❌ [USER ID HELPER] Erro geral:', error);
    return null;
  }
}

/**
 * Limpa o cache de IDs (útil em logout)
 */
export function clearUserIdCache(): void {
  userIdCache.clear();
  console.log('🧹 [USER ID HELPER] Cache limpo');
}

/**
 * Função utilitária para garantir que sempre temos o usuarios.id correto
 * @param authUserId - auth_user_id do frontend
 * @returns Promise<string> - usuarios.id ou auth_user_id como fallback
 */
export async function ensureUsuarioId(authUserId: string): Promise<string> {
  const usuarioId = await getUsuarioIdFromAuthId(authUserId);
  
  if (usuarioId) {
    return usuarioId;
  }
  
  console.warn('⚠️ [USER ID HELPER] Usando auth_user_id como fallback:', authUserId);
  return authUserId;
} 