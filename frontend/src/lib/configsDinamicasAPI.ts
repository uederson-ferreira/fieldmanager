/**
 * =====================================================
 * API CLIENT: Configurações Dinâmicas
 * Data: 04/01/2025
 * Descrição: Cliente para acessar configurações que antes eram hardcoded
 * Substitui: Constantes hardcoded em types/termos.ts e componentes
 * =====================================================
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================
// TIPOS TYPESCRIPT
// =====================================================

export interface TermType {
  id: string;
  code: string; // 'NOTIFICACAO', 'PARALIZACAO_TECNICA', 'RECOMENDACAO'
  prefix: string; // 'NT', 'PT', 'RC'
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  requires_signature: boolean;
  requires_action_plan: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TermStatus {
  id: string;
  code: string; // 'PENDENTE', 'EM_ANDAMENTO', 'CORRIGIDO', 'LIBERADO'
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_initial: boolean;
  is_final: boolean;
  allows_edit: boolean;
  requires_approval: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeverityLevel {
  id: string;
  code: string; // 'MA', 'A', 'M', 'B', 'PE'
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  priority: number;
  requires_immediate_action: boolean;
  sla_hours: number | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeviationNature {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  requires_investigation: boolean;
  requires_root_cause_analysis: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LVEvaluationOption {
  id: string;
  code: string; // 'C', 'NC', 'NA'
  label: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  affects_compliance: boolean;
  weight: number | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoutineActivityStatus {
  id: string;
  code: string; // 'PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  is_initial: boolean;
  is_final: boolean;
  allows_edit: boolean;
  allows_photos: boolean;
  requires_completion_date: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LVCriticalityLevel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  priority: number;
  requires_immediate_action: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LVInspectionType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  requires_checklist: boolean;
  requires_report: boolean;
  frequency_days: number | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface WasteClassification {
  id: string;
  code: string;
  name: string;
  description: string | null;
  regulatory_reference: string | null;
  color: string | null;
  icon: string | null;
  requires_special_handling: boolean;
  requires_manifest: boolean;
  disposal_restrictions: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LVValidationRule {
  id: string;
  rule_type: string;
  entity_type: string | null;
  threshold_value: number | null;
  error_message: string;
  warning_message: string | null;
  is_blocking: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AllConfigurations {
  termTypes: TermType[];
  termStatus: TermStatus[];
  severityLevels: SeverityLevel[];
  deviationNature: DeviationNature[];
  lvEvaluationOptions: LVEvaluationOption[];
  routineStatus: RoutineActivityStatus[];
  lvCriticalityLevels: LVCriticalityLevel[];
  lvInspectionTypes: LVInspectionType[];
  wasteClassifications: WasteClassification[];
  lvValidationRules: LVValidationRule[];
}

// =====================================================
// FUNÇÕES DE API
// =====================================================

/**
 * Buscar TODAS as configurações em um único request
 * Recomendado para cache inicial da aplicação
 */
export const getAllConfigurations = async (): Promise<AllConfigurations> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/all`);

    if (!response.ok) {
      throw new Error('Erro ao buscar configurações');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Todas as configurações carregadas');
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar todas as configurações:', error);
    throw error;
  }
};

/**
 * Buscar tipos de termo (NOTIFICACAO, PARALIZACAO_TECNICA, RECOMENDACAO)
 */
export const getTermTypes = async (): Promise<TermType[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/term-types`);

    if (!response.ok) {
      throw new Error('Erro ao buscar tipos de termo');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Tipos de termo carregados:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar tipos de termo:', error);
    throw error;
  }
};

/**
 * Buscar status de termo (PENDENTE, EM_ANDAMENTO, CORRIGIDO, LIBERADO)
 */
export const getTermStatus = async (): Promise<TermStatus[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/term-status`);

    if (!response.ok) {
      throw new Error('Erro ao buscar status de termo');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Status de termo carregados:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar status de termo:', error);
    throw error;
  }
};

/**
 * Buscar níveis de severidade (MA, A, M, B, PE)
 */
export const getSeverityLevels = async (): Promise<SeverityLevel[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/severity-levels`);

    if (!response.ok) {
      throw new Error('Erro ao buscar níveis de severidade');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Níveis de severidade carregados:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar níveis de severidade:', error);
    throw error;
  }
};

/**
 * Buscar naturezas de desvio
 */
export const getDeviationNature = async (): Promise<DeviationNature[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/deviation-nature`);

    if (!response.ok) {
      throw new Error('Erro ao buscar naturezas de desvio');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Naturezas de desvio carregadas:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar naturezas de desvio:', error);
    throw error;
  }
};

/**
 * Buscar opções de avaliação LV (C, NC, NA)
 */
export const getLVEvaluationOptions = async (): Promise<LVEvaluationOption[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/lv-evaluation-options`);

    if (!response.ok) {
      throw new Error('Erro ao buscar opções de avaliação LV');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Opções de avaliação LV carregadas:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar opções de avaliação LV:', error);
    throw error;
  }
};

/**
 * Buscar status de atividades de rotina
 */
export const getRoutineActivityStatus = async (): Promise<RoutineActivityStatus[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/routine-status`);

    if (!response.ok) {
      throw new Error('Erro ao buscar status de rotina');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Status de rotina carregados:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar status de rotina:', error);
    throw error;
  }
};

/**
 * Buscar níveis de criticidade LV
 */
export const getLVCriticalityLevels = async (): Promise<LVCriticalityLevel[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/lv-criticality-levels`);

    if (!response.ok) {
      throw new Error('Erro ao buscar níveis de criticidade');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Níveis de criticidade carregados:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar níveis de criticidade:', error);
    throw error;
  }
};

/**
 * Buscar tipos de inspeção LV
 */
export const getLVInspectionTypes = async (): Promise<LVInspectionType[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/lv-inspection-types`);

    if (!response.ok) {
      throw new Error('Erro ao buscar tipos de inspeção');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Tipos de inspeção carregados:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar tipos de inspeção:', error);
    throw error;
  }
};

/**
 * Buscar classificações de resíduos
 */
export const getWasteClassifications = async (): Promise<WasteClassification[]> => {
  try {
    const response = await fetch(`${API_URL}/api/configuracoes/dinamicas/waste-classifications`);

    if (!response.ok) {
      throw new Error('Erro ao buscar classificações de resíduos');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Classificações de resíduos carregadas:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar classificações de resíduos:', error);
    throw error;
  }
};

/**
 * Buscar regras de validação LV
 * @param entityType - Opcional: filtrar por tipo de entidade
 */
export const getLVValidationRules = async (entityType?: string): Promise<LVValidationRule[]> => {
  try {
    const url = entityType
      ? `${API_URL}/api/configuracoes/dinamicas/lv-validation-rules?entity_type=${entityType}`
      : `${API_URL}/api/configuracoes/dinamicas/lv-validation-rules`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao buscar regras de validação');
    }

    const data = await response.json();
    console.log(' [CONFIGS DINÂMICAS] Regras de validação carregadas:', data.length);
    return data;
  } catch (error) {
    console.error('L [CONFIGS DINÂMICAS] Erro ao buscar regras de validação:', error);
    throw error;
  }
};

// =====================================================
// HELPERS DE CONVERSÃO (para manter compatibilidade com código legado)
// =====================================================

/**
 * Converte array de TermType para objeto no formato antigo
 * Útil durante migração gradual
 *
 * Formato antigo (types/termos.ts):
 * {
 *   NOTIFICACAO: { nome: 'Notificação', descricao: '...' }
 * }
 */
export const convertTermTypesToLegacyFormat = (termTypes: TermType[]) => {
  const result: Record<string, { nome: string; descricao: string }> = {};

  termTypes.forEach(type => {
    result[type.code] = {
      nome: type.name,
      descricao: type.description || ''
    };
  });

  return result;
};

/**
 * Converte array de SeverityLevel para objeto no formato antigo
 *
 * Formato antigo (types/termos.ts):
 * {
 *   MA: { nome: 'Muito Alto', cor: 'red' }
 * }
 */
export const convertSeverityLevelsToLegacyFormat = (levels: SeverityLevel[]) => {
  const result: Record<string, { nome: string; cor: string }> = {};

  levels.forEach(level => {
    result[level.code] = {
      nome: level.name,
      cor: level.color || 'gray'
    };
  });

  return result;
};

/**
 * Converte array de DeviationNature para objeto no formato antigo
 */
export const convertDeviationNatureToLegacyFormat = (natures: DeviationNature[]) => {
  const result: Record<string, { nome: string }> = {};

  natures.forEach(nature => {
    result[nature.code] = {
      nome: nature.name
    };
  });

  return result;
};

/**
 * Busca prefixo de um tipo de termo pelo código
 * Substitui a lógica hardcoded em TermoFormFields.tsx:65-67
 *
 * Antes: const prefixo = tipo === 'PARALIZACAO_TECNICA' ? 'PT' : tipo === 'NOTIFICACAO' ? 'NT' : 'RC';
 * Depois: const prefixo = getTermPrefixByCode(termTypes, tipo);
 */
export const getTermPrefixByCode = (termTypes: TermType[], code: string): string => {
  const termType = termTypes.find(t => t.code === code);
  return termType?.prefix || 'RC'; // Fallback para RC
};

/**
 * Converte array de RoutineActivityStatus para array de options
 * Para uso em Select/Combobox
 */
export const convertRoutineStatusToSelectOptions = (statuses: RoutineActivityStatus[]) => {
  return statuses.map(status => ({
    value: status.code,
    label: status.name
  }));
};

/**
 * Converte array de LVEvaluationOption para mapa de códigos
 * Para acesso rápido por código (C, NC, NA)
 */
export const convertLVEvaluationToMap = (options: LVEvaluationOption[]) => {
  const map = new Map<string, LVEvaluationOption>();
  options.forEach(opt => map.set(opt.code, opt));
  return map;
};

// =====================================================
// EXPORT DEFAULT (para facilitar imports)
// =====================================================

export default {
  // API functions
  getAllConfigurations,
  getTermTypes,
  getTermStatus,
  getSeverityLevels,
  getDeviationNature,
  getLVEvaluationOptions,
  getRoutineActivityStatus,
  getLVCriticalityLevels,
  getLVInspectionTypes,
  getWasteClassifications,
  getLVValidationRules,

  // Helper functions
  convertTermTypesToLegacyFormat,
  convertSeverityLevelsToLegacyFormat,
  convertDeviationNatureToLegacyFormat,
  getTermPrefixByCode,
  convertRoutineStatusToSelectOptions,
  convertLVEvaluationToMap
};
