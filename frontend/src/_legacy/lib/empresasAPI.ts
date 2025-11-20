import { unifiedCache } from './unifiedCache';
import { getAuthToken } from '../utils/authUtils';

// ===================================================================
// TIPOS
// ===================================================================
export interface EmpresaContratada {
  id: string;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriarEmpresaData {
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
}

export interface AtualizarEmpresaData {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  ativa?: boolean;
}

// ===================================================================
// API DE EMPRESAS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/empresasAPI.ts
// ===================================================================

const API_URL = import.meta.env.VITE_API_URL;

export const empresasAPI = {
  // ===================================================================
  // LISTAR TODAS AS EMPRESAS
  // ===================================================================
  async getEmpresas(): Promise<EmpresaContratada[]> {
    try {
      console.log('📋 [EMPRESAS API] Buscando empresas...');
      
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/empresas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [EMPRESAS API] Empresas carregadas:', data.empresas?.length || 0);
      return data.empresas || [];
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao listar empresas:', error);
      return [];
    }
  },

  // ===================================================================
  // BUSCAR EMPRESA POR ID
  // ===================================================================
  async getEmpresa(id: string): Promise<EmpresaContratada> {
    try {
      console.log(`🔍 [EMPRESAS API] Buscando empresa ID: ${id}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/empresa/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [EMPRESAS API] Empresa encontrada: ${data.empresa.nome}`);
      return data.empresa;
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao buscar empresa:', error);
      throw error;
    }
  },

  // ===================================================================
  // CRIAR NOVA EMPRESA
  // ===================================================================
  async criarEmpresa(dados: CriarEmpresaData): Promise<EmpresaContratada> {
    try {
      console.log('➕ [EMPRESAS API] Criando nova empresa:', dados);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/criar-empresa`, {
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
      console.log(`✅ [EMPRESAS API] Empresa criada: ${data.empresa.nome} (ID: ${data.empresa.id})`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('empresas_contratadas');
      
      return data.empresa;
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao criar empresa:', error);
      throw error;
    }
  },

  // ===================================================================
  // ATUALIZAR EMPRESA
  // ===================================================================
  async atualizarEmpresa(id: string, dados: AtualizarEmpresaData): Promise<EmpresaContratada> {
    try {
      console.log(`✏️ [EMPRESAS API] Atualizando empresa ID: ${id}`, dados);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/atualizar-empresa/${id}`, {
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
      console.log(`✅ [EMPRESAS API] Empresa atualizada: ${data.empresa.nome}`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('empresas_contratadas');
      
      return data.empresa;
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao atualizar empresa:', error);
      throw error;
    }
  },

  // ===================================================================
  // DELETAR EMPRESA
  // ===================================================================
  async deletarEmpresa(id: string): Promise<void> {
    try {
      console.log(`🗑️ [EMPRESAS API] Deletando empresa ID: ${id}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/deletar-empresa/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      console.log(`✅ [EMPRESAS API] Empresa deletada com sucesso`);
      
      // Atualizar cache
      await unifiedCache.refreshCache('empresas_contratadas');
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao deletar empresa:', error);
      throw error;
    }
  },

  // ===================================================================
  // BUSCAR EMPRESAS POR NOME
  // ===================================================================
  async buscarEmpresas(nome: string): Promise<EmpresaContratada[]> {
    try {
      console.log(`🔍 [EMPRESAS API] Buscando empresas com nome: ${nome}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresas/buscar-empresas?nome=${encodeURIComponent(nome)}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [EMPRESAS API] ${data.empresas?.length || 0} empresas encontradas`);
      return data.empresas || [];
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao buscar empresas:', error);
      throw error;
    }
  },

  // ===================================================================
  // ATUALIZAR CACHE
  // ===================================================================
  async refreshCache(): Promise<void> {
    try {
      console.log('🔄 [EMPRESAS API] Atualizando cache...');
      await unifiedCache.refreshCache('empresas_contratadas');
      console.log('✅ [EMPRESAS API] Cache atualizado');
    } catch (error) {
      console.error('❌ [EMPRESAS API] Erro ao atualizar cache:', error);
      throw error;
    }
  }
};
