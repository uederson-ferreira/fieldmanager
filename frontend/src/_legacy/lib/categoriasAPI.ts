import { unifiedCache } from './unifiedCache';

import type { CategoriaLV } from '../types';

// ===================================================================
// TIPOS
// ===================================================================
export interface CriarCategoriaData {
  codigo?: string;
  nome: string;
  descricao?: string;
  ordem?: number;
}

export interface AtualizarCategoriaData {
  codigo?: string;
  nome?: string;
  descricao?: string;
  ordem?: number;
  ativa?: boolean;
}

// ===================================================================
// API DE CATEGORIAS
// ===================================================================
export const categoriasAPI = {
  // ===================================================================
  // LISTAR TODAS AS CATEGORIAS
  // ===================================================================
  async getCategorias(): Promise<CategoriaLV[]> {
    try {
      console.log('📋 [CATEGORIAS API] Buscando categorias...');

      const result = await unifiedCache.getCachedData<CategoriaLV[]>(
        'categorias_lv',
        async () => {
          console.log('🌐 [CATEGORIAS API] Buscando da API...');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/categorias`);

          if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
          }

          const data = await response.json();
          console.log(`✅ [CATEGORIAS API] ${data.categorias?.length || 0} categorias encontradas`);
          return data.categorias || [];
        }
      );

      return result;
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao buscar categorias:', error);
      throw error;
    }
  },

  // ===================================================================
  // BUSCAR CATEGORIA POR ID
  // ===================================================================
  async getCategoria(id: string): Promise<CategoriaLV> {
    try {
      console.log(`🔍 [CATEGORIAS API] Buscando categoria ID: ${id}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/categoria/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [CATEGORIAS API] Categoria encontrada: ${data.categoria.nome}`);
      return data.categoria;
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao buscar categoria:', error);
      throw error;
    }
  },

  // ===================================================================
  // CRIAR NOVA CATEGORIA
  // ===================================================================
  async criarCategoria(dados: CriarCategoriaData): Promise<CategoriaLV> {
    try {
      console.log('➕ [CATEGORIAS API] Criando nova categoria:', dados);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/criar-categoria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [CATEGORIAS API] Categoria criada: ${data.categoria.nome} (ID: ${data.categoria.id})`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('categorias_lv');
      
      return data.categoria;
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao criar categoria:', error);
      throw error;
    }
  },

  // ===================================================================
  // ATUALIZAR CATEGORIA
  // ===================================================================
  async atualizarCategoria(id: string, dados: AtualizarCategoriaData): Promise<CategoriaLV> {
    try {
      console.log(`✏️ [CATEGORIAS API] Atualizando categoria ID: ${id}`, dados);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/atualizar-categoria/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [CATEGORIAS API] Categoria atualizada: ${data.categoria.nome}`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('categorias_lv');
      
      return data.categoria;
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao atualizar categoria:', error);
      throw error;
    }
  },

  // ===================================================================
  // DELETAR CATEGORIA
  // ===================================================================
  async deletarCategoria(id: string): Promise<void> {
    try {
      console.log(`🗑️ [CATEGORIAS API] Deletando categoria ID: ${id}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/deletar-categoria/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      console.log(`✅ [CATEGORIAS API] Categoria deletada com sucesso`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('categorias_lv');
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao deletar categoria:', error);
      throw error;
    }
  },

  // ===================================================================
  // REORDENAR CATEGORIAS
  // ===================================================================
  async reordenarCategorias(categorias: { id: string; ordem: number }[]): Promise<void> {
    try {
      console.log('🔄 [CATEGORIAS API] Reordenando categorias...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/reordenar-categorias`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categorias }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      console.log(`✅ [CATEGORIAS API] ${categorias.length} categorias reordenadas`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('categorias_lv');
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao reordenar categorias:', error);
      throw error;
    }
  },

  // ===================================================================
  // BUSCAR CATEGORIAS POR NOME
  // ===================================================================
  async buscarCategorias(nome: string): Promise<CategoriaLV[]> {
    try {
      console.log(`🔍 [CATEGORIAS API] Buscando categorias com nome: ${nome}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/buscar-categorias?nome=${encodeURIComponent(nome)}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [CATEGORIAS API] ${data.categorias?.length || 0} categorias encontradas`);
      return data.categorias || [];
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao buscar categorias:', error);
      throw error;
    }
  },

  // ===================================================================
  // ATUALIZAR CACHE
  // ===================================================================
  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 [CATEGORIAS API] Atualizando cache...');
      await unifiedCache.refreshCache('categorias_lv');
      console.log('✅ [CATEGORIAS API] Cache atualizado');
    } catch (error) {
      console.error('❌ [CATEGORIAS API] Erro ao atualizar cache:', error);
      throw error;
    }
  }
};
