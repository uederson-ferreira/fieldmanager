// ===================================================================
// TIPOS PARA SISTEMA DE METAS - ECOFIELD (SIMPLIFICADO E ALINHADO COM DB)
// Versão: 3.0 - Alinhada 100% com schema SQL
// Data: 2025-11-06
// ===================================================================

import { UserData } from './entities';

// ===================================================================
// TIPOS BÁSICOS
// ===================================================================

export type TipoMeta = 'lv' | 'termo' | 'rotina';
export type PeriodoMeta = 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
export type EscopoMeta = 'equipe' | 'individual';
export type StatusProgresso = 'em_andamento' | 'alcancada' | 'superada' | 'nao_alcancada';

// ===================================================================
// INTERFACE PRINCIPAL - META (100% compatível com DB)
// ===================================================================

export interface Meta {
  // Campos do banco de dados
  id: string;
  tipo_meta: TipoMeta;
  categoria?: string | null;
  periodo: PeriodoMeta;
  ano: number;
  mes?: number | null;
  semana?: number | null;
  dia?: number | null;
  meta_quantidade: number;
  meta_percentual?: number | null;
  descricao?: string | null;
  ativa: boolean;
  criada_por?: string | null;
  escopo: EscopoMeta;
  auth_user_id?: string | null;
  created_at: string;
  updated_at: string;

  // Campos de relacionamento (quando buscar com joins)
  metas_atribuicoes?: MetaAtribuicao[];
  progresso_metas?: ProgressoMeta[];
}

// ===================================================================
// ATRIBUIÇÃO DE META A TÉCNICO
// ===================================================================

export interface MetaAtribuicao {
  id: string;
  meta_id: string;
  tma_id: string;
  meta_quantidade_individual?: number | null;
  responsavel: boolean;
  auth_user_id?: string | null;
  created_at: string;
  updated_at: string;

  // Relacionamentos
  usuarios?: {
    id: string;
    nome: string;
    email: string;
    matricula?: string;
    perfil_id?: string;
    perfis?: { nome: string };
  };
}

// ===================================================================
// PROGRESSO DE META
// ===================================================================

export interface ProgressoMeta {
  id: string;
  meta_id: string;
  periodo: PeriodoMeta;
  ano: number;
  mes?: number | null;
  semana?: number | null;
  dia?: number | null;
  quantidade_atual: number;
  percentual_atual: number;
  percentual_alcancado: number;
  status: StatusProgresso;
  ultima_atualizacao: string;
  tma_id?: string | null;
  auth_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// INTERFACES PARA CRIAÇÃO E ATUALIZAÇÃO
// ===================================================================

export interface MetaCriacao {
  tipo_meta: TipoMeta;
  categoria?: string;
  periodo: PeriodoMeta;
  ano: number;
  mes?: number;
  semana?: number;
  dia?: number;
  meta_quantidade: number;
  meta_percentual?: number;
  descricao?: string;
  escopo?: EscopoMeta;
}

export interface MetaAtualizacao {
  tipo_meta?: TipoMeta;
  categoria?: string;
  periodo?: PeriodoMeta;
  ano?: number;
  mes?: number;
  semana?: number;
  dia?: number;
  meta_quantidade?: number;
  meta_percentual?: number;
  descricao?: string;
  escopo?: EscopoMeta;
  ativa?: boolean;
}

export interface MetaAtribuicaoCriacao {
  meta_id: string;
  tma_id: string;
  meta_quantidade_individual?: number;
  responsavel?: boolean;
}

// ===================================================================
// INTERFACES COMPOSTAS (Meta + Progresso/Atribuições)
// ===================================================================

export interface MetaComProgresso extends Meta {
  progresso_individual?: {
    quantidade_atual: number;
    percentual_alcancado: number;
    status: StatusProgresso;
    ultima_atualizacao: string;
  };
}

export interface MetaComAtribuicoes extends Meta {
  metas_atribuicoes: (MetaAtribuicao & {
    usuarios: {
      id: string;
      nome: string;
      email: string;
      matricula?: string;
    };
  })[];
}

// ===================================================================
// DASHBOARD E ESTATÍSTICAS
// ===================================================================

export interface DashboardMetas {
  total_metas: number;
  metas_por_tipo: {
    lv: number;
    termo: number;
    rotina: number;
  };
  metas_por_escopo: {
    equipe: number;
    individual: number;
  };
  metas_por_status: {
    alcancada: number;
    em_andamento: number;
    nao_alcancada: number;
    superada: number;
  };
}

export interface ResumoMetas {
  total_metas: number;
  metas_alcancadas: number;
  metas_em_andamento: number;
  metas_nao_alcancadas: number;
  percentual_geral: number;
  metas_por_tipo: {
    lv: number;
    termo: number;
    rotina: number;
  };
}

// ===================================================================
// FILTROS
// ===================================================================

export interface FiltrosMeta {
  tipo_meta?: TipoMeta;
  escopo?: EscopoMeta;
  ativa?: boolean;
  periodo?: PeriodoMeta;
  ano?: number;
  mes?: number;
  tma_id?: string;
}

// ===================================================================
// CONSTANTES E HELPERS
// ===================================================================

export const TIPOS_META: { value: TipoMeta; label: string; descricao: string }[] = [
  { value: 'lv', label: 'Lista de Verificação', descricao: 'Metas para LVs específicas ou gerais' },
  { value: 'termo', label: 'Termo Ambiental', descricao: 'Metas para termos ambientais' },
  { value: 'rotina', label: 'Atividade de Rotina', descricao: 'Metas para atividades de rotina' }
];

export const PERIODOS_META: { value: PeriodoMeta; label: string }[] = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' }
];

export const ESCOPOS_META: { value: EscopoMeta; label: string; descricao: string }[] = [
  { value: 'equipe', label: 'Equipe', descricao: 'Meta para toda a equipe' },
  { value: 'individual', label: 'Individual', descricao: 'Meta atribuída a TMAs específicos' }
];

export const STATUS_PROGRESSO: { value: StatusProgresso; label: string; cor: string }[] = [
  { value: 'em_andamento', label: 'Em Andamento', cor: 'blue' },
  { value: 'alcancada', label: 'Alcançada', cor: 'green' },
  { value: 'superada', label: 'Superada', cor: 'purple' },
  { value: 'nao_alcancada', label: 'Não Alcançada', cor: 'red' }
];

// Helper functions
export const getTipoMetaLabel = (tipo: TipoMeta): string => {
  return TIPOS_META.find(t => t.value === tipo)?.label || tipo;
};

export const getPeriodoLabel = (periodo: PeriodoMeta): string => {
  return PERIODOS_META.find(p => p.value === periodo)?.label || periodo;
};

export const getEscopoLabel = (escopo: EscopoMeta): string => {
  return ESCOPOS_META.find(e => e.value === escopo)?.label || escopo;
};

export const getStatusLabel = (status: StatusProgresso): string => {
  return STATUS_PROGRESSO.find(s => s.value === status)?.label || status;
};

export const getStatusColor = (status: StatusProgresso): string => {
  return STATUS_PROGRESSO.find(s => s.value === status)?.cor || 'gray';
};

export const getEscopoColor = (escopo: EscopoMeta): string => {
  return escopo === 'equipe' ? 'blue' : 'green';
};

// Calcular progresso percentual
export const calcularPercentual = (atual: number, meta: number): number => {
  if (meta === 0) return 0;
  return Math.round((atual / meta) * 100);
};

// Determinar status baseado no percentual
export const determinarStatus = (percentual: number): StatusProgresso => {
  if (percentual >= 100) return 'alcancada';
  if (percentual > 110) return 'superada';
  if (percentual < 50) return 'nao_alcancada';
  return 'em_andamento';
};

// Formatar período para exibição
export const formatarPeriodo = (meta: Meta): string => {
  const periodo = getPeriodoLabel(meta.periodo);

  if (meta.periodo === 'diario' && meta.dia) {
    return `${periodo} - ${meta.dia}/${meta.mes}/${meta.ano}`;
  }

  if (meta.periodo === 'semanal' && meta.semana) {
    return `${periodo} - Semana ${meta.semana}/${meta.ano}`;
  }

  if (meta.periodo === 'mensal' && meta.mes) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${periodo} - ${meses[meta.mes - 1]}/${meta.ano}`;
  }

  if (meta.periodo === 'anual') {
    return `${periodo} - ${meta.ano}`;
  }

  return periodo;
};
