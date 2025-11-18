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

/**
 * Busca todos os domínios disponíveis no sistema
 */
export async function getDominios(): Promise<Dominio[]> {
  try {
    const response = await fetch(`${API_URL}/api/dominios`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar domínios: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [dominiosAPI] Erro ao buscar domínios:', error);
    throw error;
  }
}

/**
 * Busca um domínio específico por ID
 */
export async function getDominio(id: string): Promise<Dominio> {
  try {
    const response = await fetch(`${API_URL}/api/dominios/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar domínio: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao buscar domínio ${id}:`, error);
    throw error;
  }
}

/**
 * Busca domínios ativos para um tenant específico
 */
export async function getDominiosAtivosTenant(tenantId: string): Promise<Dominio[]> {
  try {
    const response = await fetch(`${API_URL}/api/dominios/tenant/${tenantId}/ativos`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar domínios do tenant: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao buscar domínios do tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Busca módulos disponíveis para um domínio
 * @param dominioId - ID do domínio
 * @param tenantId - ID do tenant (opcional, para incluir módulos customizados)
 */
export async function getModulosDominio(
  dominioId: string,
  tenantId?: string
): Promise<ModuloSistema[]> {
  try {
    const url = new URL(`${API_URL}/api/dominios/${dominioId}/modulos`);

    if (tenantId) {
      url.searchParams.append('tenantId', tenantId);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Erro ao buscar módulos do domínio: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [dominiosAPI] Erro ao buscar módulos do domínio ${dominioId}:`, error);
    throw error;
  }
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
  ativarDominioTenant
};
