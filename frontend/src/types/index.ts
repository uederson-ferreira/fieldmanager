// ===================================================================
// DEFINIÇÕES DE TIPOS - ECOFIELD SYSTEM
// Localização: src/types/index.ts
// ===================================================================

// Importar interfaces base de entities.ts
import type {
  Usuario,
  Area,
  EmpresaContratada,
  Encarregado,
  Perfil,
  CategoriaLV,
  VersaoLV,
  PerguntaLV,
  Localizacao
} from './entities';

// Importar interfaces offline
import type * as OfflineTypes from './offline';

import type { UserData } from './auth';

// Re-exportar interfaces base para compatibilidade
export type {
  UserData,
  Usuario,
  Area,
  EmpresaContratada,
  Encarregado,
  Perfil,
  CategoriaLV,
  VersaoLV,
  PerguntaLV,
  Localizacao
};

// Re-exportar todas as interfaces offline
export type {
  TermoAmbientalOffline,
  TermoFotoOffline,
  LVOffline,
  LVAvaliacaoOffline,
  LVFotoOffline,
  AtividadeRotinaOffline,
  FotoRotinaOffline,
  InspecaoOffline,
  RespostaInspecaoOffline,
  FotoInspecaoOffline,
  EncarregadoOffline,
  LVResiduosOffline,
  LVResiduosAvaliacaoOffline,
  LVResiduosFotoOffline
} from './offline';

// ===================================================================
// TIPOS UNIFICADOS - ECOFIELD SYSTEM
// ===================================================================

// Tipos base para todas as LVs
export interface LVBase {
  id?: string;
  numero_lv: string;
  titulo_lv: string;
  usuario_id: string;
  usuario_nome: string;
  data_inspecao: string;
  area: string;
  responsavel_tecnico: string;
  responsavel_empresa?: string;
  inspetor_principal: string;
  inspetor_secundario?: string;
  inspetor_secundario_matricula?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  gps_precisao?: number;
  endereco_gps?: string;
  observacoes_gerais?: string;
  total_fotos: number;
  total_conformes: number;
  total_nao_conformes: number;
  total_nao_aplicaveis: number;
  percentual_conformidade: number;
  status: string;
  sincronizado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LVAvaliacao {
  id?: string;
  lv_id: string;
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  item_codigo: string;
  item_pergunta: string;
  avaliacao: "C" | "NC" | "NA";
  observacao?: string;
  created_at?: string;
}

export interface LVFoto {
  id?: string;
  lv_id: string;
  nome_arquivo: string;
  url_foto: string;
  tamanho_bytes?: number;
  tipo_mime?: string;
  created_at?: string;
}

// Configuração específica por tipo de LV
export interface LVConfig {
  numero_lv: string;
  titulo_lv: string;
  campos_customizados?: Record<string, unknown>;
  validacoes_customizadas?: Record<string, unknown>;
}

// ===================================================================
// TIPOS ESPECÍFICOS (NÃO DUPLICADOS)
// ===================================================================

// Tipos do Supabase - Inspeções
export interface Inspecao {
  id: string;
  data_inspecao: string;
  area_id: string;
  categoria_id: string;
  versao_id: string;
  responsavel_id: string;
  tma_contratada_id?: string;
  status: "Pendente" | "Em Andamento" | "Concluída";
  observacoes_gerais?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  areas?: Area;
  categorias_lv?: CategoriaLV;
  versoes_lv?: VersaoLV;
  usuarios?: Usuario;
  empresas_contratadas?: EmpresaContratada;
}

// Tipos do Supabase - Respostas
export interface RespostaInspecao {
  id: string;
  inspecao_id: string;
  pergunta_id: string;
  resposta: "Conforme" | "Não Conforme" | "Não Aplicável";
  observacao?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  inspecoes?: Inspecao;
  perguntas_lv?: PerguntaLV;
}

// Tipos do Supabase - Fotos
export interface FotoInspecao {
  id: string;
  inspecao_id: string;
  pergunta_id?: string;
  url: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  inspecoes?: Inspecao;
  perguntas_lv?: PerguntaLV;
}

// Tipos para Atividades de Rotina
export interface AtividadeRotina {
  id: string;
  data_atividade: string;
  hora_inicio?: string;
  hora_fim?: string;
  area_id: string;
  atividade: string;
  descricao?: string;
  km_percorrido?: number;
  tma_responsavel_id: string;
  encarregado_id: string;
  empresa_contratada_id?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  offline_created?: boolean;
  // Relacionamentos
  areas?: Area;
  usuarios?: UserData;
  encarregado?: UserData;
  empresas_contratadas?: EmpresaContratada;
}

export interface FotoRotina {
  id: string;
  atividade_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  // Relacionamentos
  atividades_rotina?: AtividadeRotina;
}

// Tipos para Metas
export interface Meta {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: "individual" | "equipe" | "lv" | "termo" | "rotina";
  meta_quantidade: number;
  quantidade_atual: number;
  data_inicio: string;
  data_fim: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "ATRASADA" | "CANCELADA";
  usuario_id?: string;
  sincronizado?: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  usuarios?: Usuario;
}

export interface ProgressoMeta {
  id: string;
  meta_id: string;
  quantidade_adicionada: number;
  quantidade_atual?: number;
  percentual_alcancado?: number;
  observacao?: string;
  data_progresso: string;
  usuario_id: string;
  created_at: string;
  // Relacionamentos
  metas?: Meta;
  usuarios?: Usuario;
}

// Tipos para Termos Ambientais - Importados de types/termos.ts para evitar duplicação
export type { 
  TermoAmbiental, 
  TermoFoto, 
  TermoFiltros,
  TermosEstatisticas
} from './termos';

// Tipos para Componentes
export interface LVProps {
  user: UserData;
  onBack: () => void;
}

export interface InspecaoLVProps {
  categoria: CategoriaLV;
  user: UserData;
  onBack: () => void;
}

export interface CategoryCardProps {
  categoria: CategoriaLV;
  onClick: () => void;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: import("react").ComponentType<{ className?: string; size?: number }>;
  color?: "green" | "blue" | "purple" | "orange" | "red";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Tipos para Formulários
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "checkbox"
    | "date";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

// Tipos para Navegação
export interface NavItem {
  label: string;
  icon: import("react").ComponentType<{ className?: string; size?: number }>;
  href: string;
  badge?: string | number;
  children?: NavItem[];
}

// Tipos para Modais
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: import("react").ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// Tipos para Notificações
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

// Tipos para Filtros
export interface FilterOptions {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  area?: string;
  categoria?: string;
  responsavel?: string;
}

// Tipos para Paginação
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Tipos para Respostas de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: PaginationInfo;
}

// Tipos para Configurações do Sistema
export interface SystemConfig {
  app_name: string;
  app_version: string;
  max_file_size: number;
  allowed_file_types: string[];
  session_timeout: number;
  backup_frequency: string;
}

// Tipos para LVs Específicos
export interface TipoLV {
  id: number;
  codigo: string;
  nome: string;
  nomeCompleto: string;
  revisao: string;
  dataRevisao: string;
  itens: {
    id: number;
    codigo: string;
    pergunta: string;
  }[];
}

// Tipos para Dados de Formulário
export interface DadosFormulario {
  area: string;
  areaCustomizada: string;
  usarAreaCustomizada: boolean;
  dataHora?: string;
  responsavel?: string;
  responsavelArea: string;
  responsavelEmpresa?: string;
  inspetor2Nome: string;
  inspetor2Matricula: string;
  observacoes: string;
  observacoesIndividuais: Record<number, string>;
  avaliacoes: Record<number, "C" | "NC" | "NA" | "">;
  fotos: Record<number, FotoData[]>;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  enderecoGPS: string;
}

// Tipos para Fotos
export interface FotoData {
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}

// Tipos para Logs
export interface Log {
  id: string;
  usuario: string;
  acao: string;
  detalhes?: string;
  data: string;
  created_at?: string;
}

// Tipos para Configurações
export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para Rotinas
export interface Rotina {
  id: string;
  nome: string;
  descricao?: string;
  frequencia: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}
