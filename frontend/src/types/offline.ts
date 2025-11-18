// ===================================================================
// INTERFACES OFFLINE - ECOFIELD SYSTEM
// Localização: src/types/offline.ts
// ===================================================================

import type {
  TermoAmbiental,
  TermoFoto,
  LV,
  LVAvaliacao,
  LVFoto,
  AtividadeRotina,
  FotoRotina,
  Inspecao,
  RespostaInspecao,
  FotoInspecao,
  Encarregado,
  LVResiduos,
  LVResiduosAvaliacao,
  LVResiduosFoto
} from './entities';

// ===================================================================
// INTERFACES OFFLINE (ESTENDEM AS BASE)
// ===================================================================

// Termo Ambiental Offline - estende TermoAmbiental com campos offline
export interface TermoAmbientalOffline extends TermoAmbiental {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;

  // ✅ P2 #3: Soft delete
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  
  // Campos específicos para versão offline (mais completa)
  numero_sequencial?: string;
  projeto_ba?: string;
  fase_etapa_obra?: string;
  emitido_por_gerencia?: string;
  emitido_por_empresa?: string;
  destinatario_nome: string;
  destinatario_gerencia?: string;
  destinatario_empresa?: string;
  area_equipamento_atividade: string;
  equipe?: string;
  atividade_especifica?: string;
  natureza_desvio: string;
  
  // Campos individuais de não conformidades
  descricao_nc_1?: string;
  severidade_nc_1?: string;
  descricao_nc_2?: string;
  severidade_nc_2?: string;
  descricao_nc_3?: string;
  severidade_nc_3?: string;
  descricao_nc_4?: string;
  severidade_nc_4?: string;
  descricao_nc_5?: string;
  severidade_nc_5?: string;
  descricao_nc_6?: string;
  severidade_nc_6?: string;
  descricao_nc_7?: string;
  severidade_nc_7?: string;
  descricao_nc_8?: string;
  severidade_nc_8?: string;
  descricao_nc_9?: string;
  severidade_nc_9?: string;
  descricao_nc_10?: string;
  severidade_nc_10?: string;
  
  lista_verificacao_aplicada?: string;
  tst_tma_responsavel?: string;
  
  // Campos individuais de ações de correção
  acao_correcao_1?: string;
  prazo_acao_1?: string;
  acao_correcao_2?: string;
  prazo_acao_2?: string;
  acao_correcao_3?: string;
  prazo_acao_3?: string;
  acao_correcao_4?: string;
  prazo_acao_4?: string;
  acao_correcao_5?: string;
  prazo_acao_5?: string;
  acao_correcao_6?: string;
  prazo_acao_6?: string;
  acao_correcao_7?: string;
  prazo_acao_7?: string;
  acao_correcao_8?: string;
  prazo_acao_8?: string;
  acao_correcao_9?: string;
  prazo_acao_9?: string;
  acao_correcao_10?: string;
  prazo_acao_10?: string;
  
  // Campos de assinatura
  assinatura_responsavel_area: boolean;
  data_assinatura_responsavel?: string;
  assinatura_emitente: boolean;
  data_assinatura_emitente?: string;
  assinatura_responsavel_area_img?: string;
  assinatura_emitente_img?: string;
  
  // Campos de liberação
  liberacao_nome?: string;
  liberacao_empresa?: string;
  liberacao_gerencia?: string;
  liberacao_data?: string;
  liberacao_horario?: string;
  liberacao_assinatura_carimbo?: boolean;
  data_liberacao?: string;
  
  // Campos de localização
  latitude?: number;
  longitude?: number;
  precisao_gps?: number;
  endereco_gps?: string;
  
  // Campos adicionais
  providencias_tomadas?: string;
  auth_user_id?: string;
}

// Termo Foto Offline - estende TermoFoto com campos offline
export interface TermoFotoOffline extends TermoFoto {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;

  // ⚠️ DEPRECATED: Usar arquivo_blob ao invés de arquivo_base64 (P1 #1)
  arquivo_base64?: string;

  // ✅ P1 #1: Armazenamento otimizado com Blob (versão 5+)
  arquivo_blob?: Blob;
  comprimido?: boolean;
  tamanho_original?: number;
}

// LV Offline - estende LV com campos offline
export interface LVOffline extends LV {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;

  // ✅ P2 #3: Soft delete
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

// LV Avaliação Offline - estende LVAvaliacao com campos offline
export interface LVAvaliacaoOffline extends LVAvaliacao {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}

// LV Foto Offline - estende LVFoto com campos offline
export interface LVFotoOffline extends LVFoto {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}

// Atividade Rotina Offline - estende AtividadeRotina com campos offline
export interface AtividadeRotinaOffline extends AtividadeRotina {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
  offline_created?: boolean;

  // ✅ P2 #3: Soft delete
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

// Foto Rotina Offline - estende FotoRotina com campos offline
export interface FotoRotinaOffline extends FotoRotina {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}

// Inspeção Offline - estende Inspecao com campos offline
export interface InspecaoOffline extends Inspecao {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
  
  // Campos adicionais para versão offline
  observacoes_gerais?: string;
  latitude?: number;
  longitude?: number;
  precisao_gps?: number;
  endereco_gps?: string;
}

// Resposta Inspeção Offline - estende RespostaInspecao com campos offline
export interface RespostaInspecaoOffline extends RespostaInspecao {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}

// Foto Inspeção Offline - estende FotoInspecao com campos offline
export interface FotoInspecaoOffline extends FotoInspecao {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
  
  // Campo adicional
  descricao?: string;
}

// Encarregado Offline - estende Encarregado com campos offline
export interface EncarregadoOffline extends Encarregado {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}

// LV Resíduos Offline - estende LVResiduos com campos offline
export interface LVResiduosOffline extends LVResiduos {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
  statusSync: 'pendente' | 'enviando' | 'enviado' | 'erro';
}

// LV Resíduos Avaliação Offline - estende LVResiduosAvaliacao com campos offline
export interface LVResiduosAvaliacaoOffline extends LVResiduosAvaliacao {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}

// LV Resíduos Foto Offline - estende LVResiduosFoto com campos offline
export interface LVResiduosFotoOffline extends LVResiduosFoto {
  // Campos de controle offline
  sincronizado: boolean;
  offline: boolean;
}
