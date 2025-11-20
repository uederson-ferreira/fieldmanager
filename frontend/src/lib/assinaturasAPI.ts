// ===================================================================
// API DE ASSINATURAS DIGITAIS - FIELDMANAGER v2.0
// Localização: src/lib/assinaturasAPI.ts
// ===================================================================

import { API_URL } from './supabase';
import { getAuthToken } from '../utils/authUtils';
import type { DadosAssinatura } from '../components/common/AssinaturaDigital';

// URL da API do backend
const API_BASE_URL = API_URL || 'http://localhost:3001';

// ===================================================================
// INTERFACES
// ===================================================================

export interface AssinaturaExecucao {
  id: string;
  execucao_id: string;
  tenant_id: string;
  usuario_id: string;
  assinatura_base64: string;
  hash_assinatura: string;
  timestamp_assinatura: string;
  usuario_nome: string;
  usuario_email: string;
  usuario_matricula?: string;
  cargo_responsavel?: string;
  validado_por: 'senha' | 'pin' | 'biometria';
  metodo_captura: 'canvas' | 'tablet' | 'biometria';
  dispositivo: 'mobile' | 'desktop' | 'tablet';
  navegador?: string;
  user_agent?: string;
  ip_address?: string;
  latitude?: number;
  longitude?: number;
  precisao_gps?: number;
  local_assinatura?: string;
  observacoes?: string;
  status: 'ativa' | 'revogada' | 'expirada';
  motivo_revogacao?: string;
  data_revogacao?: string;
  revogado_por?: string;
  certificado_digital?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CriarAssinaturaPayload {
  execucaoId: string;
  tenantId: string;
  usuarioId: string;
  dadosAssinatura: DadosAssinatura;
  localAssinatura?: string;
  cargoResponsavel?: string;
  observacoes?: string;
}

export interface ValidacaoIntegridade {
  valida: boolean;
  hash_original: string;
  hash_calculado: string;
  timestamp_validacao: string;
}

// ===================================================================
// FUNÇÕES DA API
// ===================================================================

/**
 * Criar nova assinatura digital via backend (usa service role - bypass RLS)
 */
export async function criarAssinatura(
  payload: CriarAssinaturaPayload
): Promise<AssinaturaExecucao> {
  try {
    console.log('📝 [AssinaturasAPI] Criando assinatura digital via backend...');

    // Obter user agent
    const userAgent = navigator.userAgent;

    // Obter IP (simulado - em produção usar serviço externo)
    const ipAddress = await obterIPPublico();

    // Montar dados para enviar ao backend
    const dadosInsert = {
      tenant_id: payload.tenantId,
      usuario_id: payload.usuarioId,
      assinatura_base64: payload.dadosAssinatura.assinaturaBase64,
      hash_assinatura: payload.dadosAssinatura.hash,
      timestamp_assinatura: payload.dadosAssinatura.timestamp,
      usuario_nome: payload.dadosAssinatura.usuarioNome,
      usuario_email: payload.dadosAssinatura.usuarioEmail,
      usuario_matricula: payload.dadosAssinatura.usuarioMatricula,
      cargo_responsavel: payload.cargoResponsavel,
      validado_por: payload.dadosAssinatura.validadoPor,
      metodo_captura: 'canvas' as const,
      dispositivo: payload.dadosAssinatura.dispositivo,
      navegador: payload.dadosAssinatura.navegador,
      user_agent: userAgent,
      ip_address: ipAddress,
      latitude: payload.dadosAssinatura.latitude,
      longitude: payload.dadosAssinatura.longitude,
      local_assinatura: payload.localAssinatura,
      observacoes: payload.observacoes
    };

    // Obter token de autenticação
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    // Criar assinatura via backend
    const response = await fetch(`${API_BASE_URL}/api/execucoes/${payload.execucaoId}/assinatura`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosInsert)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('❌ [AssinaturasAPI] Erro ao criar assinatura:', errorData);
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [AssinaturasAPI] Assinatura criada:', data.id);
    return data as AssinaturaExecucao;

  } catch (error) {
    console.error('💥 [AssinaturasAPI] Erro inesperado:', error);
    throw error;
  }
}

/**
 * Buscar assinatura de uma execução
 */
export async function getAssinaturaPorExecucao(
  execucaoId: string
): Promise<AssinaturaExecucao | null> {
  try {
    const { data, error } = await supabase
      .from('assinaturas_execucoes')
      .select('*')
      .eq('execucao_id', execucaoId)
      .maybeSingle();

    if (error) {
      console.error('❌ [AssinaturasAPI] Erro ao buscar assinatura:', error);
      throw new Error(`Erro ao buscar assinatura: ${error.message}`);
    }

    return data as AssinaturaExecucao | null;

  } catch (error) {
    console.error('💥 [AssinaturasAPI] Erro inesperado:', error);
    throw error;
  }
}

/**
 * Listar assinaturas do tenant
 */
export async function getAssinaturasPorTenant(
  tenantId: string,
  filtros?: {
    usuarioId?: string;
    status?: 'ativa' | 'revogada' | 'expirada';
    dataInicio?: string;
    dataFim?: string;
    limit?: number;
    offset?: number;
  }
): Promise<AssinaturaExecucao[]> {
  try {
    let query = supabase
      .from('assinaturas_execucoes')
      .select('*')
      .eq('tenant_id', tenantId);

    // Aplicar filtros
    if (filtros?.usuarioId) {
      query = query.eq('usuario_id', filtros.usuarioId);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.dataInicio) {
      query = query.gte('timestamp_assinatura', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('timestamp_assinatura', filtros.dataFim);
    }

    // Ordenação e paginação
    query = query
      .order('timestamp_assinatura', { ascending: false })
      .limit(filtros?.limit || 50)
      .range(filtros?.offset || 0, (filtros?.offset || 0) + (filtros?.limit || 50) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ [AssinaturasAPI] Erro ao listar assinaturas:', error);
      throw new Error(`Erro ao listar assinaturas: ${error.message}`);
    }

    return data as AssinaturaExecucao[];

  } catch (error) {
    console.error('💥 [AssinaturasAPI] Erro inesperado:', error);
    throw error;
  }
}

/**
 * Revogar assinatura
 */
export async function revogarAssinatura(
  assinaturaId: string,
  motivoRevogacao: string,
  usuarioId: string
): Promise<void> {
  try {
    console.log('🚫 [AssinaturasAPI] Revogando assinatura:', assinaturaId);

    const { error } = await supabase
      .from('assinaturas_execucoes')
      .update({
        status: 'revogada',
        motivo_revogacao: motivoRevogacao,
        data_revogacao: new Date().toISOString(),
        revogado_por: usuarioId
      })
      .eq('id', assinaturaId);

    if (error) {
      console.error('❌ [AssinaturasAPI] Erro ao revogar assinatura:', error);
      throw new Error(`Erro ao revogar assinatura: ${error.message}`);
    }

    console.log('✅ [AssinaturasAPI] Assinatura revogada com sucesso');

  } catch (error) {
    console.error('💥 [AssinaturasAPI] Erro inesperado:', error);
    throw error;
  }
}

/**
 * Validar integridade da assinatura
 */
export async function validarIntegridade(
  assinaturaId: string
): Promise<ValidacaoIntegridade> {
  try {
    const { data, error } = await supabase
      .rpc('validar_integridade_assinatura', {
        p_assinatura_id: assinaturaId
      });

    if (error) {
      console.error('❌ [AssinaturasAPI] Erro ao validar integridade:', error);
      throw new Error(`Erro ao validar integridade: ${error.message}`);
    }

    return data[0] as ValidacaoIntegridade;

  } catch (error) {
    console.error('💥 [AssinaturasAPI] Erro inesperado:', error);
    throw error;
  }
}

/**
 * Obter estatísticas de assinaturas
 */
export async function getEstatisticasAssinaturas(
  tenantId: string,
  periodo?: { dataInicio?: string; dataFim?: string }
): Promise<{
  total: number;
  ativas: number;
  revogadas: number;
  porDispositivo: Record<string, number>;
  porUsuario: Array<{ usuario_nome: string; total: number }>;
}> {
  try {
    let query = supabase
      .from('assinaturas_execucoes')
      .select('*')
      .eq('tenant_id', tenantId);

    if (periodo?.dataInicio) {
      query = query.gte('timestamp_assinatura', periodo.dataInicio);
    }

    if (periodo?.dataFim) {
      query = query.lte('timestamp_assinatura', periodo.dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [AssinaturasAPI] Erro ao buscar estatísticas:', error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const assinaturas = data as AssinaturaExecucao[];

    // Calcular estatísticas
    const total = assinaturas.length;
    const ativas = assinaturas.filter(a => a.status === 'ativa').length;
    const revogadas = assinaturas.filter(a => a.status === 'revogada').length;

    // Por dispositivo
    const porDispositivo: Record<string, number> = {};
    assinaturas.forEach(a => {
      porDispositivo[a.dispositivo] = (porDispositivo[a.dispositivo] || 0) + 1;
    });

    // Por usuário (top 10)
    const porUsuarioMap = new Map<string, number>();
    assinaturas.forEach(a => {
      const count = porUsuarioMap.get(a.usuario_nome) || 0;
      porUsuarioMap.set(a.usuario_nome, count + 1);
    });

    const porUsuario = Array.from(porUsuarioMap.entries())
      .map(([usuario_nome, total]) => ({ usuario_nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      total,
      ativas,
      revogadas,
      porDispositivo,
      porUsuario
    };

  } catch (error) {
    console.error('💥 [AssinaturasAPI] Erro inesperado:', error);
    throw error;
  }
}

// ===================================================================
// FUNÇÕES AUXILIARES
// ===================================================================

/**
 * Obter IP público (usar serviço externo em produção)
 */
async function obterIPPublico(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('⚠️ [AssinaturasAPI] Não foi possível obter IP público:', error);
    return undefined;
  }
}

/**
 * Converter coordenadas para DMS (Degrees, Minutes, Seconds)
 */
export function converterParaDMS(lat: number, lng: number): {
  latitude: string;
  longitude: string;
} {
  const formatarDMS = (valor: number, isLatitude: boolean): string => {
    const absolute = Math.abs(valor);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

    const direction = isLatitude
      ? (valor >= 0 ? 'N' : 'S')
      : (valor >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  return {
    latitude: formatarDMS(lat, true),
    longitude: formatarDMS(lng, false)
  };
}

/**
 * Gerar certificado de assinatura (texto formatado)
 */
export function gerarCertificado(assinatura: AssinaturaExecucao): string {
  const coords = assinatura.latitude && assinatura.longitude
    ? converterParaDMS(assinatura.latitude, assinatura.longitude)
    : null;

  return `
CERTIFICADO DE ASSINATURA DIGITAL
==================================

ID da Assinatura: ${assinatura.id}
Hash SHA-256: ${assinatura.hash_assinatura}

RESPONSÁVEL
-----------
Nome: ${assinatura.usuario_nome}
Email: ${assinatura.usuario_email}
${assinatura.cargo_responsavel ? `Cargo: ${assinatura.cargo_responsavel}` : ''}

VALIDAÇÃO
---------
Método: ${assinatura.validado_por === 'senha' ? 'Senha' : assinatura.validado_por === 'pin' ? 'PIN' : 'Biometria'}
Data/Hora: ${new Date(assinatura.timestamp_assinatura).toLocaleString('pt-BR')}

DISPOSITIVO
-----------
Tipo: ${assinatura.dispositivo}
Navegador: ${assinatura.navegador || 'Desconhecido'}

${coords ? `LOCALIZAÇÃO
-----------
Latitude: ${coords.latitude}
Longitude: ${coords.longitude}
` : ''}
STATUS
------
Status Atual: ${assinatura.status.toUpperCase()}
${assinatura.status === 'revogada' && assinatura.motivo_revogacao ? `Motivo: ${assinatura.motivo_revogacao}` : ''}

---
Gerado em: ${new Date().toLocaleString('pt-BR')}
Sistema: FieldManager v2.0
`.trim();
}
