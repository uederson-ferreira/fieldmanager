import { getAuthToken } from '../utils/authUtils';
import type {
  AcaoCorretiva,
  AcaoCorretivaCompleta,
  HistoricoAcao,
  ComentarioAcao,
  EstatisticasAcoes,
  FiltrosAcoes,
  CriarAcaoPayload,
  StatusAcao
} from '../types/acoes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// HELPERS
// ============================================

// eslint-disable-next-line no-undef
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Não autenticado');
  }

  const url = `${API_URL}/api/acoes-corretivas${endpoint}`;
  console.log('🔍 [AÇÕES API] Chamando:', url, options.method || 'GET');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  console.log('📡 [AÇÕES API] Status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    console.error('❌ [AÇÕES API] Erro completo:', error);

    // Construir mensagem de erro com detalhes
    let mensagemErro = error.error || `Erro HTTP: ${response.status}`;
    if (error.details) {
      mensagemErro += ` - ${error.details}`;
    }

    throw new Error(mensagemErro);
  }

  const data = await response.json();
  console.log('✅ [AÇÕES API] Resposta:', data);
  return data;
}

// ============================================
// LISTAR AÇÕES CORRETIVAS
// ============================================

export async function listarAcoesCorretivas(
  filtros?: FiltrosAcoes
): Promise<{
  acoes: AcaoCorretivaCompleta[];
  total: number;
  limite: number;
  offset: number;
}> {
  try {
    const params = new URLSearchParams();

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return await fetchAPI(endpoint);
  } catch (error) {
    console.error('Erro ao listar ações corretivas:', error);
    throw error;
  }
}

// ============================================
// BUSCAR AÇÃO ESPECÍFICA
// ============================================

export async function buscarAcaoCorretiva(
  id: string
): Promise<{
  acao: AcaoCorretivaCompleta;
  historico: HistoricoAcao[];
  comentarios: ComentarioAcao[];
}> {
  try {
    return await fetchAPI(`/${id}`);
  } catch (error) {
    console.error('Erro ao buscar ação corretiva:', error);
    throw error;
  }
}

// ============================================
// CRIAR AÇÃO CORRETIVA MANUAL
// ============================================

export async function criarAcaoCorretiva(
  payload: CriarAcaoPayload
): Promise<AcaoCorretiva> {
  try {
    return await fetchAPI('', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Erro ao criar ação corretiva:', error);
    throw error;
  }
}

// ============================================
// CRIAR AÇÃO AUTOMÁTICA (baseada em regras)
// ============================================

export async function criarAcaoAutomatica(
  avaliacaoId: string
): Promise<{
  acao: AcaoCorretiva;
  auto_criada: boolean;
  regra_aplicada: {
    criticidade: string;
    prazo_dias: number;
    categoria: string;
  };
}> {
  try {
    console.log('🚀 [AÇÕES API] Criando ação automática para avaliação:', avaliacaoId);
    const resultado = await fetchAPI('/auto-criar', {
      method: 'POST',
      body: JSON.stringify({ avaliacao_id: avaliacaoId })
    });
    console.log('✅ [AÇÕES API] Ação automática criada:', resultado);
    return resultado;
  } catch (error) {
    console.error('❌ [AÇÕES API] Erro ao criar ação automática:', error);
    throw error;
  }
}

// ============================================
// ATUALIZAR STATUS DA AÇÃO
// ============================================

export async function atualizarStatusAcao(
  id: string,
  status: StatusAcao,
  observacoes?: string
): Promise<AcaoCorretiva> {
  try {
    return await fetchAPI(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, observacoes })
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

// ============================================
// ADICIONAR EVIDÊNCIA DE CORREÇÃO
// ============================================

export async function adicionarEvidencia(
  id: string,
  urlFoto: string,
  descricao?: string
): Promise<AcaoCorretiva> {
  try {
    return await fetchAPI(`/${id}/evidencias`, {
      method: 'POST',
      body: JSON.stringify({
        url_foto: urlFoto,
        descricao: descricao || ''
      })
    });
  } catch (error) {
    console.error('Erro ao adicionar evidência:', error);
    throw error;
  }
}

// ============================================
// ADICIONAR COMENTÁRIO
// ============================================

export async function adicionarComentario(
  id: string,
  comentario: string
): Promise<ComentarioAcao> {
  try {
    return await fetchAPI(`/${id}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ comentario })
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
}

// ============================================
// BUSCAR ESTATÍSTICAS
// ============================================

export async function buscarEstatisticasAcoes(): Promise<EstatisticasAcoes> {
  try {
    return await fetchAPI('/estatisticas');
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}

// ============================================
// BUSCAR AÇÕES POR LV
// ============================================

export async function buscarAcoesPorLV(lvId: string): Promise<AcaoCorretivaCompleta[]> {
  try {
    const resultado = await listarAcoesCorretivas({ lv_id: lvId, limite: 100 });
    return resultado.acoes;
  } catch (error) {
    console.error('Erro ao buscar ações por LV:', error);
    throw error;
  }
}

// ============================================
// BUSCAR AÇÕES DO USUÁRIO (como responsável)
// ============================================

export async function buscarMinhasAcoes(
  usuarioId: string,
  filtros?: Omit<FiltrosAcoes, 'responsavel_id'>
): Promise<AcaoCorretivaCompleta[]> {
  try {
    const resultado = await listarAcoesCorretivas({
      ...filtros,
      responsavel_id: usuarioId,
      limite: filtros?.limite || 100
    });
    return resultado.acoes;
  } catch (error) {
    console.error('Erro ao buscar minhas ações:', error);
    throw error;
  }
}

// ============================================
// BUSCAR AÇÕES ATRASADAS
// ============================================

export async function buscarAcoesAtrasadas(): Promise<AcaoCorretivaCompleta[]> {
  try {
    const resultado = await listarAcoesCorretivas({
      status_prazo: 'atrasada',
      limite: 100
    });
    return resultado.acoes;
  } catch (error) {
    console.error('Erro ao buscar ações atrasadas:', error);
    throw error;
  }
}

// ============================================
// BUSCAR AÇÕES CRÍTICAS ABERTAS
// ============================================

export async function buscarAcoesCriticasAbertas(): Promise<AcaoCorretivaCompleta[]> {
  try {
    const resultado = await listarAcoesCorretivas({
      criticidade: 'critica',
      status: 'aberta',
      limite: 100
    });
    return resultado.acoes;
  } catch (error) {
    console.error('Erro ao buscar ações críticas:', error);
    throw error;
  }
}

// ============================================
// VERIFICAR SE NC JÁ TEM AÇÃO
// ============================================

export async function verificarAcaoExistente(avaliacaoId: string): Promise<AcaoCorretivaCompleta | null> {
  try {
    // Buscar pela view usando filtro
    const resultado = await listarAcoesCorretivas({ limite: 1 });

    // Filtrar manualmente (idealmente o backend deveria suportar este filtro)
    const acaoEncontrada = resultado.acoes.find(a => a.avaliacao_id === avaliacaoId);

    return acaoEncontrada || null;
  } catch (error) {
    console.error('Erro ao verificar ação existente:', error);
    return null;
  }
}

// ============================================
// CANCELAR AÇÃO
// ============================================

export async function cancelarAcao(
  id: string,
  motivo: string
): Promise<AcaoCorretiva> {
  try {
    return await atualizarStatusAcao(id, 'cancelada', motivo);
  } catch (error) {
    console.error('Erro ao cancelar ação:', error);
    throw error;
  }
}

// ============================================
// INICIAR AÇÃO (Mudar para "em_andamento")
// ============================================

export async function iniciarAcao(id: string): Promise<AcaoCorretiva> {
  try {
    return await atualizarStatusAcao(id, 'em_andamento');
  } catch (error) {
    console.error('Erro ao iniciar ação:', error);
    throw error;
  }
}

// ============================================
// SOLICITAR VALIDAÇÃO
// ============================================

export async function solicitarValidacao(
  id: string,
  observacoes?: string
): Promise<AcaoCorretiva> {
  try {
    return await atualizarStatusAcao(id, 'aguardando_validacao', observacoes);
  } catch (error) {
    console.error('Erro ao solicitar validação:', error);
    throw error;
  }
}

// ============================================
// CONCLUIR AÇÃO
// ============================================

export async function concluirAcao(
  id: string,
  observacoes?: string
): Promise<AcaoCorretiva> {
  try {
    return await atualizarStatusAcao(id, 'concluida', observacoes);
  } catch (error) {
    console.error('Erro ao concluir ação:', error);
    throw error;
  }
}

// ============================================
// CONTADORES RÁPIDOS (para badges/cards)
// ============================================

export async function contarAcoesAbertas(): Promise<number> {
  try {
    const resultado = await listarAcoesCorretivas({ status: 'aberta', limite: 1 });
    return resultado.total;
  } catch (error) {
    console.error('Erro ao contar ações abertas:', error);
    return 0;
  }
}

export async function contarAcoesAtrasadas(): Promise<number> {
  try {
    const resultado = await listarAcoesCorretivas({ status_prazo: 'atrasada', limite: 1 });
    return resultado.total;
  } catch (error) {
    console.error('Erro ao contar ações atrasadas:', error);
    return 0;
  }
}

export async function contarAcoesCriticas(): Promise<number> {
  try {
    const resultado = await listarAcoesCorretivas({ criticidade: 'critica', limite: 1 });
    return resultado.total;
  } catch (error) {
    console.error('Erro ao contar ações críticas:', error);
    return 0;
  }
}
