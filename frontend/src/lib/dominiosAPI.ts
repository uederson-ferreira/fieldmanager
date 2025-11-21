// ===================================================================
// API CLIENT - DOMÍNIOS (FIELDMANAGER v2.0)
// Localização: frontend/src/lib/dominiosAPI.ts
// ===================================================================

import type {
  Dominio,
  TenantDominio,
  ModuloSistema
} from '../types/dominio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Cache simples em memória
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Retry com backoff exponencial para erro 429
 */
async function fetchWithRetry(
  url: string,
  // eslint-disable-next-line no-undef
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Se for 429 (Too Many Requests), aguardar antes de tentar novamente
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : Math.min(1000 * Math.pow(2, attempt), 10000); // Backoff exponencial, max 10s

        console.warn(`⏳ [dominiosAPI] Rate limit atingido. Aguardando ${waitTime}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Erro ao fazer requisição após múltiplas tentativas');
}

/**
 * Busca todos os domínios disponíveis no sistema (com cache)
 */
export async function getDominios(): Promise<Dominio[]> {
  const cacheKey = 'dominios_all';
  const cached = cache.get(cacheKey);

  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 [dominiosAPI] Retornando domínios do cache');
    return cached.data;
  }

  try {
    const response = await fetchWithRetry(`${API_URL}/api/dominios`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar domínios: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Salvar no cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error('❌ [dominiosAPI] Erro ao buscar domínios:', error);
    throw error;
  }
}

/**
 * Busca um domínio específico por ID (com cache)
 */
export async function getDominio(id: string): Promise<Dominio> {
  const cacheKey = `dominio_${id}`;
  const cached = cache.get(cacheKey);

  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 [dominiosAPI] Retornando domínio ${id} do cache`);
    return cached.data;
  }

  try {
    const response = await fetchWithRetry(`${API_URL}/api/dominios/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar domínio: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Salvar no cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao buscar domínio ${id}:`, error);
    throw error;
  }
}

/**
 * Busca domínios ativos para um tenant específico (com cache)
 */
export async function getDominiosAtivosTenant(tenantId: string): Promise<Dominio[]> {
  const cacheKey = `dominios_tenant_${tenantId}`;
  const cached = cache.get(cacheKey);

  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 [dominiosAPI] Retornando domínios do tenant ${tenantId} do cache`);
    return cached.data;
  }

  try {
    const response = await fetchWithRetry(`${API_URL}/api/dominios/tenant/${tenantId}/ativos`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar domínios do tenant: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Salvar no cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao buscar domínios do tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Busca módulos disponíveis para um domínio (com cache)
 * @param dominioId - ID do domínio
 * @param tenantId - ID do tenant (opcional, para incluir módulos customizados)
 */
export async function getModulosDominio(
  dominioId: string,
  tenantId?: string
): Promise<ModuloSistema[]> {
  const cacheKey = `modulos_dominio_${dominioId}_${tenantId || 'all'}`;
  const cached = cache.get(cacheKey);

  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 [dominiosAPI] Retornando módulos do domínio ${dominioId} do cache`);
    return cached.data;
  }

  try {
    const url = new URL(`${API_URL}/api/dominios/${dominioId}/modulos`);

    if (tenantId) {
      url.searchParams.append('tenantId', tenantId);
    }

    const response = await fetchWithRetry(url.toString());

    if (!response.ok) {
      throw new Error(`Erro ao buscar módulos do domínio: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Salvar no cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao buscar módulos do domínio ${dominioId}:`, error);
    throw error;
  }
}

/**
 * Limpa o cache (útil para forçar refresh)
 */
export function clearCache(): void {
  cache.clear();
  console.log('🗑️ [dominiosAPI] Cache limpo');
}

/**
 * Ativa um domínio para um tenant
 */
export async function ativarDominioTenant(
  dominioId: string,
  tenantId: string
): Promise<TenantDominio> {
  try {
    const response = await fetch(`${API_URL}/api/dominios/${dominioId}/ativar-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tenantId })
    });

    if (!response.ok) {
      throw new Error(`Erro ao ativar domínio: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao ativar domínio ${dominioId} para tenant ${tenantId}:`, error);
    throw error;
  }
}

export const dominiosAPI = {
  getDominios,
  getDominio,
  getDominiosAtivosTenant,
  getModulosDominio,
  ativarDominioTenant,
  clearCache
};
