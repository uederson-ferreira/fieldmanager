// ============================================
// TIPOS: Módulo de Ações Corretivas
// ============================================

export interface AcaoCorretiva {
  id: string;
  lv_id: string;
  avaliacao_id: string;
  tipo_lv: string;
  item_codigo: string;
  item_pergunta: string;
  descricao_nc: string;
  criticidade: Criticidade;
  categoria?: string;
  acao_proposta: string;
  acao_descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  area_responsavel?: string;
  prazo_inicial: string;
  prazo_atual: string;
  data_abertura: string;
  data_conclusao?: string;
  status: StatusAcao;
  evidencias_correcao: Evidencia[];
  observacoes_conclusao?: string;
  validada_por?: string;
  validada_em?: string;
  validacao_observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface AcaoCorretivaCompleta extends AcaoCorretiva {
  responsavel_nome_atual?: string;
  responsavel_email?: string;
  responsavel_telefone?: string;
  nome_lv?: string;
  data_inspecao?: string;
  lv_area?: string;
  lv_responsavel_tecnico?: string;
  nc_observacao_original?: string;
  nc_detectada_em?: string;
  status_prazo: StatusPrazo;
  dias_ate_prazo: number;
  qtd_evidencias: number;
  tempo_resolucao_dias?: number;
}

export interface Evidencia {
  url: string;
  descricao: string;
  data: string;
  usuario_id: string;
}

export interface HistoricoAcao {
  id: string;
  acao_id: string;
  tipo_evento: TipoEventoAcao;
  descricao: string;
  dados_anteriores?: any;
  dados_novos?: any;
  usuario_id?: string;
  usuario_nome?: string;
  created_at: string;
}

export interface ComentarioAcao {
  id: string;
  acao_id: string;
  usuario_id: string;
  usuario_nome: string;
  comentario: string;
  created_at: string;
  updated_at: string;
}

export interface RegraCriticidade {
  id: string;
  tipo_lv?: string;
  categoria_lv?: string;
  item_codigo?: string;
  palavra_chave?: string;
  criticidade: Criticidade;
  requer_acao_imediata: boolean;
  prazo_padrao_dias?: number;
  acao_sugerida?: string;
  categoria_sugerida?: string;
  ativo: boolean;
  prioridade: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface NotificacaoAcao {
  id: string;
  acao_id: string;
  usuario_id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  lida_em?: string;
  enviada_email: boolean;
  enviada_whatsapp: boolean;
  created_at: string;
}

export interface EstatisticasAcoes {
  total: number;
  abertas: number;
  em_andamento: number;
  aguardando_validacao: number;
  concluidas: number;
  canceladas: number;
  criticas: number;
  altas: number;
  medias: number;
  baixas: number;
  atrasadas: number;
  proximas_vencer: number;
  tempo_medio_resolucao_dias?: number;
  tempo_medio_critica?: number;
  tempo_medio_alta?: number;
  taxa_conclusao_no_prazo?: number;
  ultima_atualizacao?: string;
}

export interface FiltrosAcoes {
  status?: StatusAcao;
  responsavel_id?: string;
  criticidade?: Criticidade;
  prazo_de?: string;
  prazo_ate?: string;
  lv_id?: string;
  status_prazo?: StatusPrazo;
  limite?: number;
  offset?: number;
}

export interface CriarAcaoPayload {
  lv_id: string;
  avaliacao_id: string;
  tipo_lv: string;
  item_codigo: string;
  item_pergunta: string;
  descricao_nc: string;
  criticidade?: Criticidade;
  categoria?: string;
  acao_proposta: string;
  acao_descricao?: string;
  responsavel_id?: string;
  area_responsavel?: string;
  prazo_dias?: number;
}

// ============================================
// TIPOS E ENUMS
// ============================================

export type StatusAcao =
  | 'aberta'
  | 'em_andamento'
  | 'aguardando_validacao'
  | 'concluida'
  | 'cancelada';

export type Criticidade =
  | 'baixa'
  | 'media'
  | 'alta'
  | 'critica';

export type StatusPrazo =
  | 'concluida'
  | 'atrasada'
  | 'proxima_vencer'
  | 'no_prazo';

export type TipoEventoAcao =
  | 'criada'
  | 'atribuida'
  | 'iniciada'
  | 'atualizada'
  | 'prazo_alterado'
  | 'evidencia_adicionada'
  | 'validada'
  | 'concluida'
  | 'cancelada'
  | 'reaberta'
  | 'comentario';

export type TipoNotificacao =
  | 'nova_acao'
  | 'acao_atribuida'
  | 'prazo_proximo'
  | 'prazo_vencido'
  | 'validacao_solicitada'
  | 'acao_validada'
  | 'acao_rejeitada'
  | 'comentario_adicionado';

// ============================================
// HELPERS E CONSTANTES
// ============================================

export const STATUS_ACAO_LABELS: Record<StatusAcao, string> = {
  'aberta': 'Aberta',
  'em_andamento': 'Em Andamento',
  'aguardando_validacao': 'Aguardando Validação',
  'concluida': 'Concluída',
  'cancelada': 'Cancelada'
};

export const CRITICIDADE_LABELS: Record<Criticidade, string> = {
  'baixa': 'Baixa',
  'media': 'Média',
  'alta': 'Alta',
  'critica': 'Crítica'
};

export const STATUS_PRAZO_LABELS: Record<StatusPrazo, string> = {
  'concluida': 'Concluída',
  'atrasada': 'Atrasada',
  'proxima_vencer': 'Próxima do Vencimento',
  'no_prazo': 'No Prazo'
};

export const CRITICIDADE_CORES: Record<Criticidade, { bg: string; text: string }> = {
  'baixa': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'media': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'alta': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'critica': { bg: 'bg-red-100', text: 'text-red-800' }
};

export const STATUS_ACAO_CORES: Record<StatusAcao, { bg: string; text: string }> = {
  'aberta': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'em_andamento': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'aguardando_validacao': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'concluida': { bg: 'bg-green-100', text: 'text-green-800' },
  'cancelada': { bg: 'bg-gray-100', text: 'text-gray-800' }
};

export const STATUS_PRAZO_CORES: Record<StatusPrazo, { bg: string; text: string }> = {
  'concluida': { bg: 'bg-green-100', text: 'text-green-800' },
  'atrasada': { bg: 'bg-red-100', text: 'text-red-800' },
  'proxima_vencer': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'no_prazo': { bg: 'bg-blue-100', text: 'text-blue-800' }
};

// ============================================
// HELPERS DE FORMATAÇÃO
// ============================================

export function formatarPrazo(statusPrazo: StatusPrazo, diasAtePrazo: number): string {
  if (statusPrazo === 'concluida') {
    return 'Concluída';
  }
  if (statusPrazo === 'atrasada') {
    return `${Math.abs(diasAtePrazo)} ${Math.abs(diasAtePrazo) === 1 ? 'dia' : 'dias'} atrasada`;
  }
  if (statusPrazo === 'proxima_vencer') {
    return `${diasAtePrazo} ${diasAtePrazo === 1 ? 'dia' : 'dias'} restante${diasAtePrazo === 1 ? '' : 's'}`;
  }
  return `${diasAtePrazo} ${diasAtePrazo === 1 ? 'dia' : 'dias'} restante${diasAtePrazo === 1 ? '' : 's'}`;
}

export function getCriticidadeIcone(criticidade: Criticidade): string {
  const icones: Record<Criticidade, string> = {
    'baixa': '🟢',
    'media': '🟡',
    'alta': '🟠',
    'critica': '🔴'
  };
  return icones[criticidade];
}

export function getStatusIcone(status: StatusAcao): string {
  const icones: Record<StatusAcao, string> = {
    'aberta': '🆕',
    'em_andamento': '⏳',
    'aguardando_validacao': '👀',
    'concluida': '✅',
    'cancelada': '❌'
  };
  return icones[status];
}
