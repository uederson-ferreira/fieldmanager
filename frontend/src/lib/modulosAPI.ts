// ===================================================================
// API CLIENT - MÓDULOS DO SISTEMA (FIELDMANAGER v2.0)
// Localização: frontend/src/lib/modulosAPI.ts
// ===================================================================

import type {
  ModuloSistema,
  ModuloCompleto,
  PerguntaModulo
} from '../types/dominio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Busca todos os módulos do sistema
 * @param filtros - Filtros opcionais (tenantId, dominioId, template)
 */
export async function getModulos(filtros?: {
  tenantId?: string;
  dominioId?: string;
  template?: boolean;
}): Promise<ModuloSistema[]> {
  try {
    const url = new URL(`${API_URL}/api/modulos-sistema`);

    if (filtros?.tenantId) {
      url.searchParams.append('tenantId', filtros.tenantId);
    }
    if (filtros?.dominioId) {
      url.searchParams.append('dominioId', filtros.dominioId);
    }
    if (filtros?.template !== undefined) {
      url.searchParams.append('template', String(filtros.template));
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Erro ao buscar módulos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [modulosAPI] Erro ao buscar módulos:', error);
    throw error;
  }
}

/**
 * Busca um módulo específico por ID
 */
export async function getModulo(id: string): Promise<ModuloSistema> {
  try {
    const response = await fetch(`${API_URL}/api/modulos-sistema/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar módulo: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [modulosAPI] Erro ao buscar módulo ${id}:`, error);
    throw error;
  }
}

/**
 * Busca perguntas de um módulo
 * @param moduloId - ID do módulo
 * @param categoria - Categoria opcional para filtrar
 */
export async function getPerguntasModulo(
  moduloId: string,
  categoria?: string
): Promise<PerguntaModulo[]> {
  try {
    const url = new URL(`${API_URL}/api/modulos-sistema/${moduloId}/perguntas`);

    if (categoria) {
      url.searchParams.append('categoria', categoria);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Erro ao buscar perguntas do módulo: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [modulosAPI] Erro ao buscar perguntas do módulo ${moduloId}:`, error);
    throw error;
  }
}

/**
 * Busca categorias únicas de um módulo
 */
export async function getCategoriasModulo(moduloId: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/modulos-sistema/${moduloId}/categorias`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar categorias do módulo: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [modulosAPI] Erro ao buscar categorias do módulo ${moduloId}:`, error);
    throw error;
  }
}

/**
 * Busca módulo completo com todas as perguntas
 */
export async function getModuloCompleto(moduloId: string): Promise<ModuloCompleto> {
  try {
    const [modulo, perguntas, categorias] = await Promise.all([
      getModulo(moduloId),
      getPerguntasModulo(moduloId),
      getCategoriasModulo(moduloId)
    ]);

    return {
      ...modulo,
      perguntas,
      categorias
    };
  } catch (error) {
    console.error(`❌ [modulosAPI] Erro ao buscar módulo completo ${moduloId}:`, error);
    throw error;
  }
}

/**
 * Cria um novo módulo customizado
 */
export async function criarModulo(modulo: Partial<ModuloSistema>): Promise<ModuloSistema> {
  try {
    const response = await fetch(`${API_URL}/api/modulos-sistema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modulo)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar módulo: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [modulosAPI] Erro ao criar módulo:', error);
    throw error;
  }
}

/**
 * Atualiza um módulo existente
 */
export async function atualizarModulo(
  id: string,
  updates: Partial<ModuloSistema>
): Promise<ModuloSistema> {
  try {
    const response = await fetch(`${API_URL}/api/modulos-sistema/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar módulo: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [modulosAPI] Erro ao atualizar módulo ${id}:`, error);
    throw error;
  }
}

/**
 * Desativa um módulo (soft delete)
 */
export async function desativarModulo(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/modulos-sistema/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao desativar módulo: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ [modulosAPI] Erro ao desativar módulo ${id}:`, error);
    throw error;
  }
}

export const modulosAPI = {
  getModulos,
  getModulo,
  getPerguntasModulo,
  getCategoriasModulo,
  getModuloCompleto,
  criarModulo,
  atualizarModulo,
  desativarModulo
};
