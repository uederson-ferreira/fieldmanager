// ===================================================================
// API DE LVs VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/lvAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';
import type {
  LV,
  LVAvaliacao,
  LVFoto,
  LVFiltros,
  LVCriacao,
  LVAtualizacao
} from '../types/lv';
import type { LVOffline } from '../types/offline';

const API_URL = import.meta.env.VITE_API_URL;

export interface LVCreateData {
  numero_lv: string;
  titulo_lv: string;
  tipo_lv: string;
  nome_lv: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_matricula?: string;
  usuario_email: string;
  data_inspecao: string;
  data_preenchimento: string;
  area: string;
  responsavel_area?: string;
  responsavel_tecnico: string;
  responsavel_empresa: string;
  inspetor_principal: string;
  inspetor_secundario?: string;
  inspetor_secundario_matricula?: string;
  latitude?: number;
  longitude?: number;
  gps_precisao?: number;
  endereco_gps?: string;
  observacoes_gerais?: string;
}

export const lvAPI = {
  // Buscar configuração completa de uma LV (com perguntas/itens)
  async buscarConfiguracaoLV(tipo_lv: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        console.warn('⚠️ [LV API] Token de autenticação não encontrado, tentando cache offline');
        // Tentar buscar do cache offline
        return await lvAPI.buscarConfiguracaoOffline(tipo_lv);
      }

      const response = await fetch(`${API_URL}/api/lvs/configuracao/${tipo_lv}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [LV API] Erro na API (${response.status}), tentando cache offline`);
        // Em caso de erro, tentar buscar do cache offline
        return await lvAPI.buscarConfiguracaoOffline(tipo_lv);
      }

      const data = await response.json();
      console.log(`✅ [LV API] Configuração carregada para LV ${tipo_lv}:`, data.itens?.length || 0, 'itens');

      // Salvar no cache offline para uso futuro
      try {
        await lvAPI.salvarConfiguracaoOffline(tipo_lv, data);
      } catch (cacheError) {
        console.warn('⚠️ [LV API] Erro ao salvar configuração no cache:', cacheError);
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar configuração:', error);

      // Última tentativa: buscar do cache offline
      console.log('🔄 [LV API] Tentando buscar configuração do cache offline como fallback');
      return await lvAPI.buscarConfiguracaoOffline(tipo_lv);
    }
  },

  // Buscar configuração do cache offline
  async buscarConfiguracaoOffline(tipo_lv: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { offlineDB } = await import('./offline/database/EcoFieldDB');

      // Buscar perguntas da LV do IndexedDB
      const perguntas = await offlineDB.perguntas_lv.toArray();

      if (!perguntas || perguntas.length === 0) {
        console.warn('⚠️ [LV API] Nenhuma configuração encontrada no cache offline');
        return { success: false, error: 'Configuração não disponível offline' };
      }

      // Buscar categoria correspondente
      const categoria = await offlineDB.categorias_lv.where('codigo').equals(tipo_lv).first();

      if (!categoria) {
        console.warn(`⚠️ [LV API] Categoria ${tipo_lv} não encontrada no cache`);
        return { success: false, error: 'Categoria não encontrada' };
      }

      // Buscar versão ativa
      const versoes = await offlineDB.versoes_lv.toArray();
      const versao = versoes.find(v => v.ativa === true);

      // Filtrar perguntas por categoria
      const perguntasCategoria = perguntas.filter(p => p.categoria_id === categoria.id);

      // Montar estrutura de configuração
      const config = {
        tipo_lv: tipo_lv,
        nome_lv: categoria.nome,
        nome_completo: categoria.nome,
        revisao: versao?.nome || '1.0',
        data_revisao: versao?.created_at || new Date().toISOString(),
        itens: perguntasCategoria.map(p => ({
          id: p.id,
          codigo: p.codigo,
          pergunta: p.pergunta,
          descricao: p.pergunta,
          categoria: categoria.nome,
          obrigatorio: true,
          ordem: p.ordem || 0
        }))
      };

      console.log(`📦 [LV API] Configuração carregada do cache offline: ${config.itens.length} itens`);
      return { success: true, data: config };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar configuração offline:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Salvar configuração no cache offline
  async salvarConfiguracaoOffline(tipo_lv: string, config: any): Promise<void> {
    try {
      const { offlineDB } = await import('./offline/database/EcoFieldDB');

      // Salvar categoria se não existir
      if (config.nome_lv) {
        await offlineDB.categorias_lv.put({
          id: config.categoria_id || tipo_lv,
          codigo: tipo_lv,
          nome: config.nome_lv,
          ativa: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Salvar perguntas/itens
      if (config.itens && config.itens.length > 0) {
        for (const item of config.itens) {
          await offlineDB.perguntas_lv.put({
            id: item.id,
            codigo: item.codigo,
            pergunta: item.pergunta || item.descricao,
            categoria_id: config.categoria_id || tipo_lv,
            versao_id: config.versao_id || 'default',
            ordem: item.ordem || 0,
            obrigatoria: item.obrigatorio !== undefined ? item.obrigatorio : true,
            ativa: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      console.log(`✅ [LV API] Configuração salva no cache offline: ${config.itens?.length || 0} itens`);
    } catch (error) {
      console.error('❌ [LV API] Erro ao salvar configuração offline:', error);
      throw error;
    }
  },

  // Listar LVs com filtros opcionais
  async listarLVs(filtros?: LVFiltros): Promise<{ success: boolean; data?: LV[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtros?.tipo_lv) params.append('tipo_lv', filtros.tipo_lv);
      if (filtros?.status) params.append('status', filtros.status);
      if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros?.area) params.append('area', filtros.area);
      if (filtros?.responsavel_tecnico) params.append('responsavel_tecnico', filtros.responsavel_tecnico);
      if (filtros?.usuario_id) params.append('usuario_id', filtros.usuario_id);

      const response = await fetch(`${API_URL}/api/lvs?${params}`, {
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
      console.log('✅ [LV API] LVs carregadas:', data.length);

      // Salvar no cache offline
      try {
        const { offlineDB } = await import('./offline/database/EcoFieldDB');

        // Salvar cada LV no IndexedDB
        for (const lv of data) {
          await offlineDB.lvs.put({
            ...lv,
            sincronizado: true,
            offline: false
          });
        }

        console.log(`✅ [LV API] ${data.length} LVs salvas no cache offline`);
      } catch (idbError) {
        console.warn('⚠️ [LV API] Não foi possível salvar LVs no cache offline:', idbError);
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao listar LVs:', error);

      // Tentar buscar do cache offline
      try {
        const { offlineDB } = await import('./offline/database/EcoFieldDB');
        const cachedLVs = await offlineDB.lvs.toArray();

        if (cachedLVs.length > 0) {
          console.log(`📦 [LV API] ${cachedLVs.length} LVs carregadas do cache offline`);
          // LVOffline estende LV, então podemos fazer cast direto
          return { success: true, data: cachedLVs as unknown as LV[] };
        }
      } catch (idbError) {
        console.error('❌ [LV API] Erro ao buscar LVs do cache offline:', idbError);
      }

      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar LV por ID
  async buscarLV(id: string): Promise<{ success: boolean; data?: LV; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/lvs/${id}`, {
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
      console.log('✅ [LV API] LV carregada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar LV:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Criar nova LV
  async criarLV(dados: LVCriacao): Promise<{ success: boolean; data?: LV; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('📤 [LV API] Enviando dados para API:', {
        url: `${API_URL}/api/lvs`,
        method: 'POST',
        dadosKeys: Object.keys(dados),
        dadosSize: JSON.stringify(dados).length,
        sample: {
          tipo_lv: dados.tipo_lv,
          titulo: dados.titulo,
          data_inspecao: dados.data_inspecao,
          area: dados.area,
        }
      });

      // Log completo dos dados (para debug)
      console.log('📋 [LV API] Dados completos:', dados);

      const response = await fetch(`${API_URL}/api/lvs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [LV API] Resposta de erro da API:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [LV API] LV criada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao criar LV:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Atualizar LV
  async atualizarLV(id: string, dados: LVAtualizacao): Promise<{ success: boolean; data?: LV; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/lvs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [LV API] LV atualizada:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao atualizar LV:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir LV
  async excluirLV(id: string, excluirFotos: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Enviar parâmetro via query string
      const response = await fetch(`${API_URL}/api/lvs/${id}?excluir_fotos=${excluirFotos}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log(`✅ [LV API] LV excluída: ${id} (fotos: ${excluirFotos ? 'sim' : 'não'})`);
      return { success: true };
    } catch (error) {
      console.error('❌ [LV API] Erro ao excluir LV:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Salvar fotos da LV
  async salvarFotosLV(id: string, fotos: Array<{ arquivo: File; item_id: string }>): Promise<{ success: boolean; data?: LVFoto[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const formData = new FormData();
      fotos.forEach((foto, index) => {
        formData.append('fotos', foto.arquivo);
        formData.append(`item_id_${index}`, foto.item_id);
      });

      const response = await fetch(`${API_URL}/api/lvs/${id}/fotos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ [LV API] Fotos salvas:', data.fotos_salvas || data.data?.length || 0);
      return { success: true, data: data.data || [] };
    } catch (error) {
      console.error('❌ [LV API] Erro ao salvar fotos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar avaliações da LV
  async buscarAvaliacoes(lvId: string): Promise<{ success: boolean; data?: LVAvaliacao[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/lvs/${lvId}/avaliacoes`, {
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
      console.log('✅ [LV API] Avaliações carregadas:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar avaliações:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Buscar fotos da LV
  async buscarFotos(lvId: string): Promise<{ success: boolean; data?: LVFoto[]; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/lvs/${lvId}/fotos`, {
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
      console.log('✅ [LV API] Fotos carregadas:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar fotos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Excluir foto da LV
  async excluirFoto(lvId: string, fotoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/lvs/${lvId}/fotos/${fotoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('✅ [LV API] Foto excluída:', fotoId);
      return { success: true };
    } catch (error) {
      console.error('❌ [LV API] Erro ao excluir foto:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Salvar avaliações da LV
  async salvarAvaliacoes(lvId: string, avaliacoes: Array<{
    item_id: string; // UUID da pergunta (perguntas_lv.id)
    item_codigo: string;
    item_pergunta: string;
    avaliacao: 'C' | 'NC' | 'NA';
    observacao?: string;
  }>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/lvs/${lvId}/avaliacoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avaliacoes })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [LV API] Avaliações salvas:', data.avaliacoes_salvas);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao salvar avaliações:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  /**
   * Pré-carregar dados essenciais de LVs para cache offline
   * Deve ser chamado após o login quando o usuário está online
   */
  async preloadLVData(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [LV API] Iniciando pré-carregamento de dados LVs...');

      // 1. Carregar lista de LVs (que já salva no cache automaticamente)
      await lvAPI.listarLVs();

      // 2. Carregar categorias LV
      const token = getAuthToken();
      if (!token) {
        console.warn('⚠️ [LV API] Token não encontrado para pré-carregamento');
        return { success: false, error: 'Token não encontrado' };
      }

      const response = await fetch(`${API_URL}/api/categorias/lv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const categorias = await response.json();

        // Salvar categorias no IndexedDB
        const { offlineDB } = await import('./offline/database/EcoFieldDB');
        for (const categoria of categorias) {
          await offlineDB.categorias_lv.put(categoria);
        }

        console.log(`✅ [LV API] ${categorias.length} categorias salvas no cache`);
      }

      console.log('✅ [LV API] Pré-carregamento concluído');
      return { success: true };
    } catch (error) {
      console.error('❌ [LV API] Erro no pré-carregamento:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  /**
   * Busca NCs pendentes (sem ação corretiva)
   */
  getNcsPendentes: async () => {
    try {
      console.log('🔍 [LV API] Buscando NCs pendentes...');

      const token = await getAuthToken();
      if (!token) {
        console.error('❌ [LV API] Token de autenticação não encontrado');
        return {
          success: false,
          error: 'Token de autenticação não encontrado'
        };
      }

      const response = await fetch(`${API_URL}/api/lvs/ncs-pendentes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [LV API] Erro ao buscar NCs pendentes:', error);
        return {
          success: false,
          error: error.error || 'Erro ao buscar NCs pendentes'
        };
      }

      const data = await response.json();
      console.log(`✅ [LV API] ${data.total} NC(s) pendente(s) encontrada(s)`);

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar NCs pendentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  /**
   * Detecta não conformidades (NCs) de uma LV
   * Deve ser chamado APÓS salvar as avaliações
   */
  detectarNCs: async (lvId: string) => {
    try {
      console.log(`🔍 [LV API] Detectando NCs para LV: ${lvId}`);

      const token = await getAuthToken();
      if (!token) {
        console.error('❌ [LV API] Token de autenticação não encontrado');
        return {
          success: false,
          error: 'Token de autenticação não encontrado'
        };
      }

      const response = await fetch(`${API_URL}/api/lvs/${lvId}/detectar-ncs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [LV API] Erro ao detectar NCs:', error);
        return {
          success: false,
          error: error.error || 'Erro ao detectar NCs'
        };
      }

      const data = await response.json();
      console.log(`✅ [LV API] ${data.ncs_detectadas} NC(s) detectada(s)`);

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('❌ [LV API] Erro ao detectar NCs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  /**
   * Buscar contagem de NCs pendentes para uma LV específica
   */
  getNcsPendentesCount: async (lvId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { success: false, error: 'Token não encontrado' };
      }

      const response = await fetch(`${API_URL}/api/lvs/${lvId}/ncs-pendentes/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Erro ao buscar contagem' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ [LV API] Erro ao buscar contagem de NCs pendentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}; 