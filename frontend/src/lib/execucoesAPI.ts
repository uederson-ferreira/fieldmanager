// ===================================================================
// API CLIENT - EXECUÇÕES (FIELDMANAGER v2.0)
// Localização: frontend/src/lib/execucoesAPI.ts
// ===================================================================

import type {
  Execucao,
  ExecucaoCompleta,
  ExecucaoFiltros,
  ExecucoesPaginadas,
  CriarExecucaoPayload
} from '../types/dominio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Busca execuções com filtros e paginação
 */
export async function getExecucoes(filtros?: ExecucaoFiltros): Promise<ExecucoesPaginadas> {
  try {
    const url = new URL(`${API_URL}/api/execucoes`);

    if (filtros?.tenantId) url.searchParams.append('tenantId', filtros.tenantId);
    if (filtros?.moduloId) url.searchParams.append('moduloId', filtros.moduloId);
    if (filtros?.usuarioId) url.searchParams.append('usuarioId', filtros.usuarioId);
    if (filtros?.status) url.searchParams.append('status', filtros.status);
    if (filtros?.limit) url.searchParams.append('limit', String(filtros.limit));
    if (filtros?.offset) url.searchParams.append('offset', String(filtros.offset));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Erro ao buscar execuções: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [execucoesAPI] Erro ao buscar execuções:', error);
    throw error;
  }
}

/**
 * Busca uma execução específica por ID (com todas as relações)
 */
export async function getExecucao(id: string): Promise<ExecucaoCompleta> {
  try {
    const response = await fetch(`${API_URL}/api/execucoes/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar execução: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [execucoesAPI] Erro ao buscar execução ${id}:`, error);
    throw error;
  }
}

/**
 * Cria uma nova execução
 */
export async function criarExecucao(payload: CriarExecucaoPayload): Promise<Execucao> {
  try {
    const response = await fetch(`${API_URL}/api/execucoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro ao criar execução: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [execucoesAPI] Erro ao criar execução:', error);
    throw error;
  }
}

/**
 * Atualiza uma execução existente
 */
export async function atualizarExecucao(
  id: string,
  updates: Partial<Execucao>
): Promise<Execucao> {
  try {
    const response = await fetch(`${API_URL}/api/execucoes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar execução: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ [execucoesAPI] Erro ao atualizar execução ${id}:`, error);
    throw error;
  }
}

/**
 * Remove uma execução
 */
export async function deletarExecucao(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/execucoes/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar execução: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ [execucoesAPI] Erro ao deletar execução ${id}:`, error);
    throw error;
  }
}

/**
 * Gera PDF de uma execução (placeholder - implementar depois)
 */
export async function gerarPDFExecucao(id: string): Promise<Blob> {
  try {
    const response = await fetch(`${API_URL}/api/execucoes/${id}/pdf`);

    if (!response.ok) {
      throw new Error(`Erro ao gerar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error(`❌ [execucoesAPI] Erro ao gerar PDF da execução ${id}:`, error);
    throw error;
  }
}

/**
 * Helper: Cria execução a partir de formulário preenchido
 */
export async function salvarExecucaoFormulario(params: {
  tenant_id: string;
  modulo_id: string;
  usuario_id: string;
  respostas: Map<string, { valor: any; observacao?: string }>;
  fotos?: File[];
  dados_contexto?: Record<string, any>;
}): Promise<Execucao> {
  const { tenant_id, modulo_id, usuario_id, respostas, dados_contexto } = params;

  // Converter Map de respostas para array do formato esperado
  const respostasArray = Array.from(respostas.entries()).map(([perguntaId, resposta]) => ({
    pergunta_id: perguntaId,
    pergunta_codigo: '', // Será preenchido no backend
    resposta: typeof resposta.valor === 'string' ? resposta.valor : undefined,
    resposta_booleana: typeof resposta.valor === 'boolean' ? resposta.valor : undefined,
    observacao: resposta.observacao
  }));

  // TODO: Implementar upload de fotos
  const fotosArray: any[] = [];

  const payload: CriarExecucaoPayload = {
    tenant_id,
    modulo_id,
    usuario_id,
    status: 'concluido',
    dados_execucao: dados_contexto || {},
    respostas: respostasArray,
    fotos: fotosArray
  };

  return criarExecucao(payload);
}

export const execucoesAPI = {
  getExecucoes,
  getExecucao,
  criarExecucao,
  atualizarExecucao,
  deletarExecucao,
  gerarPDFExecucao,
  salvarExecucaoFormulario
};
