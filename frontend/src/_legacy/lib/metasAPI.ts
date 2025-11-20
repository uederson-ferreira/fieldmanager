// ===================================================================
// API DE METAS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/metasAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';
import type {
  Meta,
  ProgressoMeta,
  FiltrosMeta as SchemaFiltrosMeta
} from '../types/metas';

const API_URL = import.meta.env.VITE_API_URL;

export interface MetaCriacao {
  titulo: string;
  descricao?: string;
  tipo: "individual" | "equipe" | "lv" | "termo" | "rotina";
  quantidade_meta: number;
  data_inicio: string;
  data_fim: string;
  usuario_id: string;
  area_id?: string;
}

export interface MetaAtualizacao {
  titulo?: string;
  descricao?: string;
  tipo?: "individual" | "equipe";
  meta_quantidade?: number;
  quantidade_atual?: number;
  data_inicio?: string;
  data_fim?: string;
  status?: "ativa" | "concluida" | "cancelada";
}

export interface MetaComProgresso extends Meta {
  progresso?: ProgressoMeta[];
  progresso_individual?: {
    quantidade_atual: number;
    percentual_alcancado: number;
    status?: string;
    ultima_atualizacao: string;
  };
}

export const metasAPI = {
  // Listar metas com filtros opcionais
  async listarMetas(filtros?: SchemaFiltrosMeta): Promise<{ success: boolean; data?: Meta[]; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        console.warn('⚠️ [METAS API] Token não encontrado. Usuário precisa fazer login novamente.');
        console.log('📊 [METAS API] localStorage keys:', Object.keys(localStorage));
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtros?.tipo_meta) params.append('tipo_meta', filtros.tipo_meta);
      if (filtros?.escopo) params.append('escopo', filtros.escopo);
      if (typeof filtros?.ativa === 'boolean') params.append('ativa', String(filtros.ativa));
      if (filtros?.periodo) params.append('periodo', filtros.periodo);
      if (typeof filtros?.ano === 'number') params.append('ano', String(filtros.ano));
      if (typeof filtros?.mes === 'number') params.append('mes', String(filtros.mes));

      const response = await fetch(`${API_URL}/api/metas?${params}`, {
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
      console.log('✅ [METAS API] Metas carregadas:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao listar metas:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar meta por ID
  async buscarMeta(id: string): Promise<{ success: boolean; data?: Meta; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${id}`, {
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
      console.log('✅ [METAS API] Meta carregada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao buscar meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Criar nova meta
  async criarMeta(dados: any): Promise<{ success: boolean; data?: Meta; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Transformar campos do formulário antigo para o schema do banco
      const dadosTransformados: any = {
        tipo_meta: dados.tipo_meta,
        periodo: dados.periodo,
        ano: dados.ano,
        mes: dados.mes,
        meta_quantidade: dados.quantidade_meta || dados.meta_quantidade, // Aceita ambos os nomes
        descricao: dados.descricao,
        titulo: dados.titulo || dados.descricao,
        escopo: dados.escopo || 'equipe',
        categoria: dados.categoria
      };

      console.log('🔄 [METAS API] Transformando dados:', { original: dados, transformado: dadosTransformados });

      const response = await fetch(`${API_URL}/api/metas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosTransformados)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [METAS API] Meta criada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao criar meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Atualizar meta
  async atualizarMeta(id: string, dados: any): Promise<{ success: boolean; data?: Meta; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Transformar campos do formulário antigo para o schema do banco
      const dadosTransformados: any = {};
      if (dados.tipo_meta) dadosTransformados.tipo_meta = dados.tipo_meta;
      if (dados.periodo) dadosTransformados.periodo = dados.periodo;
      if (dados.ano) dadosTransformados.ano = dados.ano;
      if (dados.mes) dadosTransformados.mes = dados.mes;
      if (dados.titulo) dadosTransformados.titulo = dados.titulo;
      if (dados.meta_quantidade) dadosTransformados.meta_quantidade = dados.meta_quantidade;
      if (dados.quantidade_meta) dadosTransformados.meta_quantidade = dados.quantidade_meta;
      if (dados.quantidade_atual !== undefined) dadosTransformados.meta_quantidade = dados.quantidade_atual;
      if (dados.descricao) dadosTransformados.descricao = dados.descricao;
      if (dados.escopo) dadosTransformados.escopo = dados.escopo;
      if (dados.categoria) dadosTransformados.categoria = dados.categoria;
      if (dados.data_inicio) dadosTransformados.data_inicio = dados.data_inicio;
      if (dados.data_fim) dadosTransformados.data_fim = dados.data_fim;
      if (dados.status) dadosTransformados.status = dados.status;
      if (dados.ativa !== undefined) dadosTransformados.ativa = dados.ativa;

      console.log('🔄 [METAS API] Transformando atualização:', { original: dados, transformado: dadosTransformados });

      const response = await fetch(`${API_URL}/api/metas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosTransformados)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [METAS API] Meta atualizada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao atualizar meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir meta
  async excluirMeta(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [METAS API] Meta excluída:', id);
      return { success: true };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao excluir meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar metas atribuídas ao usuário
  async buscarMetasAtribuidasAoUsuario(usuarioId: string): Promise<{ 
    success: boolean; 
    metasEquipe?: MetaComProgresso[]; 
    metasIndividuais?: MetaComProgresso[]; 
    error?: string 
  }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/usuario/${usuarioId}`, {
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
      console.log('✅ [METAS API] Metas atribuídas carregadas:', data);

      const normalizar = (metas: any[] | undefined) => {
        if (!Array.isArray(metas)) return [] as MetaComProgresso[];
        return metas.map(meta => {
          const progresso = meta.progresso_individual
            || meta.progresso_metas?.find((pm: any) => pm?.tma_id === usuarioId)
            || meta.progresso_metas?.[0]
            || null;

          return {
            ...meta,
            progresso_individual: progresso || undefined
          } as MetaComProgresso;
        });
      };

      return { 
        success: true, 
        metasEquipe: normalizar(data.metasEquipe), 
        metasIndividuais: normalizar(data.metasIndividuais) 
      };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao buscar metas atribuídas:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Atualizar progresso de uma meta
  async atualizarProgresso(id: string, quantidade_adicionada: number, observacao?: string): Promise<{ success: boolean; data?: ProgressoMeta; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${id}/progresso`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantidade_adicionada,
          observacao
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [METAS API] Progresso atualizado:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao atualizar progresso:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar dashboard de metas
  async buscarDashboard(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/dashboard/resumo`, {
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
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao buscar dashboard:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Deletar meta
  async deletarMeta(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao deletar meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Toggle status da meta
  async toggleMeta(id: string): Promise<{ success: boolean; data?: Meta; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao toggle meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Calcular progresso da meta
  async calcularProgresso(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${id}/calcular-progresso`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao calcular progresso:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar metas com progresso individual
  async buscarMetasComProgressoIndividual(): Promise<{ success: boolean; data?: MetaComProgresso[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/com-progresso-individual`, {
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
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao buscar metas com progresso:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Atribuir meta a usuário
  async atribuirMeta(
    metaId: string,
    tmaIds: string[],
    options?: { meta_quantidade_individual?: number; responsavel?: boolean }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${metaId}/atribuir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tma_ids: tmaIds,
          meta_quantidade_individual: options?.meta_quantidade_individual,
          responsavel: options?.responsavel
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao atribuir meta:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  async removerAtribuicao(metaId: string, atribuicaoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/metas/${metaId}/atribuicoes/${atribuicaoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ [METAS API] Erro ao remover atribuição:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}; 