// ===================================================================
// TIPOS UNIFICADOS PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/types/lv.ts
// ===================================================================

import React from 'react';
import type { UserData } from '../../../types/entities';

// Tipos base para todas as LVs
export interface LVBase {
  id?: string;
  numero_sequencial?: number;
  numero_lv?: string;
  tipo_lv: string;
  lv_tipo: string;
  lv_nome: string;
  data_lv?: string;
  local_atividade?: string;
  usuario_id?: string;
  created_at?: string;
  updated_at?: string;
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Dados do formulário unificado
export interface LVFormData {
  // Campos básicos obrigatórios
  area: string;
  areaCustomizada: string;
  usarAreaCustomizada: boolean;
  data_inspecao: string;
  inspetor_principal: string;
  inspetor_principal_matricula: string;
  responsavel_tecnico: string;
  responsavelArea: string;
  responsavelEmpresa: string;
  inspetor2Nome: string;
  inspetor2Matricula: string;
  observacoes: string;

  // Assinaturas (base64)
  assinatura_inspetor_principal: string | null;
  data_assinatura_inspetor_principal: string | null;
  assinatura_inspetor_secundario: string | null;
  data_assinatura_inspetor_secundario: string | null;

  // Campos adicionais para plugins
  customFields?: ResiduosCustomFields;
  metadata?: Record<string, unknown>;

  // Dados dinâmicos (chaves são UUIDs dos itens - perguntas_lv.id)
  observacoesIndividuais: { [key: string]: string };
  avaliacoes: { [key: string]: "C" | "NC" | "NA" | "" };
  fotos: { [key: string]: LVFoto[] };

  // Localização
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  enderecoGPS: string;
}

// Foto unificada
export interface LVFoto {
  id?: string;
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  url_arquivo?: string;
  base64Data?: string;
  arquivo?: File;
  urlOriginal?: string;
  created_at?: string;
}

// Avaliação unificada
export interface LVAvaliacao {
  id?: string;
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  avaliacao: "C" | "NC" | "NA" | "";
  observacao?: string;
  created_at?: string;
}

// Item de LV
export interface LVItem {
  id: string; // UUID da pergunta (perguntas_lv.id)
  codigo: string; // Código da pergunta (ex: "05.001")
  pergunta: string; // Texto da pergunta
  descricao?: string; // Alias para pergunta (compatibilidade)
  categoria?: string;
  subcategoria?: string;
  observacao?: string;
  obrigatorio?: boolean;
  ordem?: number;
}

// Configuração de LV
export interface LVConfig {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  numero_lv?: string;
  titulo_lv?: string;
  revisao: string;
  dataRevisao: string;
  itens: LVItem[];
}

// Estatísticas unificadas
export interface LVStats {
  total: number;
  conformes: number;
  naoConformes: number;
  naoAplicaveis: number;
  fotos: number;
  percentualConformidade: number;
}

// Props do container principal
export interface LVContainerProps {
  user: UserData;
  onBack: () => void;
  tipo_lv: string;
}

// Plugin para funcionalidades específicas
export interface LVPlugin {
  nome: string;
  tipo_lv: string;
  componentes?: {
    Formulario?: React.ComponentType<Record<string, unknown>>;
    Lista?: React.ComponentType<Record<string, unknown>>;
    Estatisticas?: React.ComponentType<Record<string, unknown>>;
  };
  hooks?: {
    useEspecifico?: () => unknown;
  };
  funcoes?: {
    gerarTermo?: (lv: LVBase) => Promise<void>;
    validacoesEspecificas?: (dados: LVFormData) => string[];
  };
}

// Estado do LV
export interface LVState {
  tela: "inicio" | "formulario";
  modoEdicao: boolean;
  lvEmEdicao: LVBase | null;
  itemFotoAtual: string | null; // UUID do item (perguntas_lv.id)
  carregando: boolean;
  loadingLvs: boolean;
  lvsRealizados: LVBase[];
  dadosFormulario: LVFormData;
  configuracao: LVConfig | null;
}

// Ações do LV
export interface LVActions {
  setTela: (tela: "inicio" | "formulario") => void;
  setModoEdicao: (modo: boolean) => void;
  setLvEmEdicao: (lv: LVBase | null) => void;
  setItemFotoAtual: (itemId: string | null) => void;
  setCarregando: (carregando: boolean) => void;
  setLoadingLvs: (loading: boolean) => void;
  setLvsRealizados: (lvs: LVBase[]) => void;
  setDadosFormulario: (dados: LVFormData | ((prev: LVFormData) => LVFormData)) => void;
  setConfiguracao: (config: LVConfig | null) => void;
  resetarFormulario: () => void;
  salvarFormulario: () => Promise<void>;
  visualizarLV: (lv: LVBase) => void;
  editarLV: (lv: LVBase) => Promise<void>;
  excluirLV: (lv: LVBase, excluirFotos?: boolean) => Promise<void>;
  gerarPDF: (lv: LVBase) => Promise<void>;
  carregarLvsRealizados: () => Promise<void>;
} 

// Tipos customizados para plugins de LV
export type ResiduosCustomFields = {
  tipoResiduo?: string;
  volumeEstimado?: number;
  temperatura?: number;
  residuoPerigoso?: boolean;
  residuoInfectante?: boolean;
  residuoRadioativo?: boolean;
}; 