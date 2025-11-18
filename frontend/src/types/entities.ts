// ===================================================================
// ENTIDADES BASE UNIFICADAS - ECOFIELD SYSTEM
// Localização: src/types/entities.ts
// ===================================================================

// ===================================================================
// INTERFACES DE USUÁRIO E AUTENTICAÇÃO
// ===================================================================

// Interface principal de usuário (da auth.ts - mais completa)
export interface UserData {
  id: string;
  usuario_id?: string;
  auth_user_id?: string;
  nome: string;
  email: string;
  matricula: string;
  perfil: string; // 'ADM', 'Desenvolvedor', 'TMA Campo', 'TMA Gestão', 'TMA Contratada'
  funcao: string;
  telefone?: string;
  ativo: boolean;
  permissoes?: Record<string, boolean | string | number | null>;
  ultimo_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Interface para criação de usuário
export interface CreateUserData {
  email: string;
  password: string;
  nome: string;
  matricula: string;
  perfil: string;
  funcao: string;
  telefone?: string;
  permissoes?: Record<string, boolean | string | number | null>;
}

// Interface para atualização de usuário
export interface UpdateUserData {
  nome?: string;
  matricula?: string;
  perfil?: string;
  funcao?: string;
  telefone?: string;
  ativo?: boolean;
  permissoes?: Record<string, boolean | string | number | null>;
}

// Interface para metadados do usuário no Supabase Auth
export interface UserMetadata {
  nome: string;
  matricula: string;
  perfil: string;
  funcao: string;
  telefone?: string;
  ativo: boolean;
  permissoes?: Record<string, boolean | string | number | null>;
}

// Estado de autenticação
export interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Credenciais de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Modo de autenticação
export type AuthMode = "auto" | "supabase" | "demo";

// ===================================================================
// INTERFACES DE ENTIDADES BASE
// ===================================================================

// Interface de usuário do Supabase (da index.ts - mais completa)
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  matricula: string;
  telefone?: string;
  perfil_id: string;
  empresa_id?: string;
  ativo: boolean;
  ultimo_login?: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  perfis?: Perfil;
  empresas_contratadas?: EmpresaContratada;
}

// Interface de área (da index.ts - mais completa)
export interface Area {
  id: string;
  nome: string;
  descricao?: string;
  localizacao?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

// Interface de empresa contratada (da index.ts - mais completa)
export interface EmpresaContratada {
  id: string;
  nome: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

// Interface de encarregado
export interface Encarregado {
  id: string;
  nome_completo: string;
  apelido?: string;
  telefone?: string;
  empresa_contratada_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  empresas_contratadas?: EmpresaContratada;
}

// ===================================================================
// INTERFACES DE FOTOS E ARQUIVOS
// ===================================================================

// Interface de foto (da termos.ts - mais completa)
export interface FotoData {
  arquivo: File | null; // Pode ser null para fotos existentes
  base64Data?: string | null; // Para serialização no localStorage
  urlOriginal?: string; // URL original para fotos existentes
  itemId: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  endereco?: string;
  tamanho: number;
  tipo: string;
  offline: boolean;
  sincronizado: boolean;
  fotoExistente?: boolean; // Marca se é uma foto existente
  fotoId?: string; // ID da foto no banco (para fotos existentes)
}

// ===================================================================
// INTERFACES DE PERFIL E PERMISSÕES
// ===================================================================

// Interface de perfil
export interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Record<string, boolean | string | number | null>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// INTERFACES DE CATEGORIAS E VERSÕES
// ===================================================================

// Interface de categoria LV
export interface CategoriaLV {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

// Interface de versão LV
export interface VersaoLV {
  id: string;
  nome: string;
  descricao?: string;
  data_revisao?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

// Interface de pergunta LV
export interface PerguntaLV {
  id: string;
  codigo: string;
  pergunta: string;
  categoria_id: string;
  versao_id: string;
  ordem?: number;
  obrigatoria: boolean;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  categorias_lv?: CategoriaLV;
  versoes_lv?: VersaoLV;
}

// ===================================================================
// INTERFACES DE LOCALIZAÇÃO
// ===================================================================

// Interface de localização GPS
export interface Localizacao {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  altitude?: number;
}

// ===================================================================
// FUNÇÕES HELPER
// ===================================================================

// Função helper para converter User do Supabase para UserData
export const convertSupabaseUserToUserData = (user: any): UserData | null => {
  if (!user) return null;

  const metadata = user.user_metadata as UserMetadata;
  
  return {
    id: user.id,
    nome: metadata?.nome || user.email?.split('@')[0] || 'Usuário',
    email: user.email || '',
    matricula: metadata?.matricula || '',
    perfil: metadata?.perfil || 'TMA Campo',
    funcao: metadata?.funcao || 'Técnico',
    telefone: metadata?.telefone,
    ativo: metadata?.ativo ?? true,
    permissoes: metadata?.permissoes || {},
    ultimo_login: user.last_sign_in_at || null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

// Função helper para criar metadados do usuário
export const createUserMetadata = (userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): UserMetadata => {
  return {
    nome: userData.nome,
    matricula: userData.matricula,
    perfil: userData.perfil,
    funcao: userData.funcao,
    telefone: userData.telefone,
    ativo: userData.ativo,
    permissoes: userData.permissoes,
  };
}; 

// ===================================================================
// INTERFACES BASE - ECOFIELD SYSTEM (ONLINE)
// Localização: src/types/entities.ts
// ===================================================================

// Interface base para Termos Ambientais (online)
export interface TermoAmbiental {
  id: string;
  numero_termo: string;
  titulo: string;
  data_termo: string;
  hora_termo: string;
  local_atividade: string;
  emitido_por_usuario_id: string;
  emitido_por_nome: string;
  responsavel_area_id?: string;
  responsavel_area?: string;
  descricao_fatos: string;
  medidas_corretivas?: string;
  observacoes?: string;
  status: string;
  tipo_termo: string;
  area_id: string;
  created_at: string;
  updated_at: string;
}

// Interface base para Fotos de Termos (online)
export interface TermoFoto {
  id: string;
  termo_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  tamanho_bytes: number;
  tipo_mime: string;
  categoria: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  timestamp_captura?: string;
  created_at: string;
  updated_at: string;
}

// Interface base para LVs (Listas de Verificação)
export interface LV {
  id: string;
  tipo_lv: string;
  usuario_id: string;
  area: string;
  data_inspecao: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface base para Avaliações de LV
export interface LVAvaliacao {
  id: string;
  lv_id: string;
  tipo_lv: string;
  item_id: string;
  item_codigo: string;
  conforme: boolean;
  observacao?: string;
  created_at: string;
}

// Interface base para Fotos de LV
export interface LVFoto {
  id: string;
  lv_id: string;
  tipo_lv: string;
  item_id: string;
  nome_arquivo: string;
  arquivo_base64?: string;
  created_at: string;
}

// Interface base para Atividades de Rotina
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
}

// Interface base para Fotos de Rotina
export interface FotoRotina {
  id: string;
  atividade_id: string;
  nome_arquivo: string;
  arquivo_base64?: string;
  created_at: string;
}

// Interface base para Inspeções
export interface Inspecao {
  id: string;
  data_inspecao: string;
  area_id: string;
  categoria_id: string;
  versao_id: string;
  responsavel_id: string;
  tma_contratada_id: string;
  created_at: string;
  updated_at: string;
}

// Interface base para Respostas de Inspeção
export interface RespostaInspecao {
  id: string;
  inspecao_id: string;
  pergunta_id: string;
  resposta: boolean;
  observacao?: string;
  created_at: string;
}

// Interface base para Fotos de Inspeção
export interface FotoInspecao {
  id: string;
  inspecao_id: string;
  pergunta_id: string;
  nome_arquivo: string;
  arquivo_base64?: string;
  created_at: string;
}

/**
 * @deprecated Usar interface LV com tipo_lv='residuos'
 * Esta interface será removida em versão futura - usar LV unificada
 */
export interface LVResiduos {
  id: string;
  usuario_id: string;
  area: string;
  status: string;
  numero_sequencial: number;
  created_at: string;
  updated_at: string;
}

/**
 * @deprecated Usar interface LVAvaliacao com tipo_lv='residuos'
 * Esta interface será removida em versão futura - usar LVAvaliacao unificada
 */
export interface LVResiduosAvaliacao {
  id: string;
  lv_residuos_id: string;
  item_id: string;
  item_codigo: string;
  conforme: boolean;
  observacao?: string;
  created_at: string;
}

/**
 * @deprecated Usar interface LVFoto com tipo_lv='residuos'
 * Esta interface será removida em versão futura - usar LVFoto unificada
 */
export interface LVResiduosFoto {
  id: string;
  lv_residuos_id: string;
  item_id: string;
  nome_arquivo: string;
  arquivo_base64?: string;
  categoria: 'evidencia' | 'nao_conformidade';
  created_at: string;
} 