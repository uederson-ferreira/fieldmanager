// ===================================================================
// TIPOS PARA SISTEMA MULTI-DOMÍNIO - FIELDMANAGER v2.0
// Localização: frontend/src/types/dominio.ts
// ===================================================================

/**
 * Domínio de Negócio
 * Representa uma área de atuação (Ambiental, Segurança, Qualidade, etc.)
 */
export interface Dominio {
  id: string;
  codigo: string; // 'ambiental', 'seguranca', 'qualidade'
  nome: string; // 'Meio Ambiente', 'Segurança do Trabalho'
  descricao?: string;
  icone: string; // Nome do ícone Lucide (ex: 'Leaf', 'HardHat')
  cor_primaria: string; // Hex color (ex: '#10b981')
  cor_secundaria?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
}

/**
 * Módulo do Sistema (Template ou Customizado)
 * Representa um checklist/formulário configurável
 */
export interface ModuloSistema {
  id: string;
  dominio_id: string;
  tenant_id?: string | null; // NULL para templates do sistema
  codigo: string; // 'lv-residuos', 'nr35-trabalho-altura'
  nome: string;
  descricao?: string;
  tipo_modulo: 'checklist' | 'formulario' | 'inspecao' | 'auditoria';
  configuracao: Record<string, any>; // JSON configurável
  icone?: string;
  ordem: number;
  ativo: boolean;
  template: boolean; // true = template do sistema, false = customizado
  created_at: string;
  updated_at: string;
}

/**
 * Pergunta de Módulo
 * Representa uma pergunta/campo de um módulo
 */
export interface PerguntaModulo {
  id: string;
  modulo_id: string;
  codigo: string; // '01.001', 'NR35.001', 'ISO9001.001'
  pergunta: string;
  tipo_resposta: 'boolean' | 'text' | 'multiple_choice' | 'numeric' | 'date';
  opcoes_resposta?: string[]; // Para tipo 'multiple_choice'
  obrigatoria: boolean;
  permite_foto: boolean;
  permite_observacao: boolean;
  categoria?: string; // 'EPI', 'Procedimentos', 'Documentação'
  subcategoria?: string;
  ordem: number;
  ativo: boolean;
  metadados?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Execução de Módulo
 * Representa uma execução/preenchimento de um módulo (substitui LV)
 */
export interface Execucao {
  id: string;
  tenant_id: string;
  modulo_id: string;
  usuario_id: string;
  numero_sequencial: number; // Auto-incrementado
  numero_documento: string; // Gerado automaticamente (ex: 'NR35-2025-0001')
  data_execucao: string;
  status: 'rascunho' | 'concluido' | 'cancelado';
  dados_execucao: Record<string, any>; // Dados contextuais (local, empresa, etc.)
  observacoes_gerais?: string;
  created_at: string;
  updated_at: string;

  // Relações (quando carregadas)
  modulos?: ModuloSistema;
  respostas?: ExecucaoResposta[];
  fotos?: ExecucaoFoto[];
}

/**
 * Resposta de Execução
 * Resposta individual de uma pergunta em uma execução
 */
export interface ExecucaoResposta {
  id: string;
  execucao_id: string;
  pergunta_id: string;
  pergunta_codigo: string;
  resposta?: string; // Resposta em texto
  resposta_booleana?: boolean; // Para tipo boolean
  observacao?: string;
  created_at: string;
  updated_at: string;

  // Relação (quando carregada)
  pergunta?: PerguntaModulo;
}

/**
 * Foto de Execução
 * Foto associada a uma pergunta ou execução geral
 */
export interface ExecucaoFoto {
  id: string;
  execucao_id: string;
  pergunta_id?: string | null; // NULL = foto geral da execução
  pergunta_codigo?: string | null;
  nome_arquivo: string;
  url_arquivo: string;
  tamanho_bytes?: number;
  tipo_mime?: string;
  categoria?: string; // 'evidencia', 'nao_conformidade', 'geral'
  descricao?: string;
  latitude?: number;
  longitude?: number;
  timestamp_captura?: string;
  created_at: string;
}

/**
 * Tenant (Multi-tenant)
 * Representa uma empresa/cliente do sistema
 */
export interface Tenant {
  id: string;
  nome_empresa: string;
  cnpj?: string;
  razao_social?: string;
  segmento?: string; // 'industria', 'construcao', 'logistica'
  plano: 'free' | 'starter' | 'professional' | 'enterprise';
  ativo: boolean;
  data_criacao: string;
  data_expiracao?: string;
  configuracoes?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Domínio Ativo do Tenant
 * Associação de domínios ativos para um tenant
 */
export interface TenantDominio {
  id: string;
  tenant_id: string;
  dominio_id: string;
  ativo: boolean;
  data_ativacao: string;
  data_desativacao?: string;
  configuracoes_especificas?: Record<string, any>;
  created_at: string;

  // Relação (quando carregada)
  dominios?: Dominio;
}

/**
 * Módulo Completo (com perguntas carregadas)
 */
export interface ModuloCompleto extends ModuloSistema {
  perguntas: PerguntaModulo[];
  categorias?: string[]; // Categorias únicas das perguntas
}

/**
 * Execução Completa (com todas as relações)
 */
export interface ExecucaoCompleta extends Execucao {
  modulos: ModuloSistema;
  respostas: ExecucaoResposta[];
  fotos: ExecucaoFoto[];
}

/**
 * Filtros para listagem de execuções
 */
export interface ExecucaoFiltros {
  tenantId?: string;
  moduloId?: string;
  usuarioId?: string;
  status?: 'rascunho' | 'concluido' | 'cancelado';
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
  offset?: number;
}

/**
 * Resposta paginada de execuções
 */
export interface ExecucoesPaginadas {
  data: Execucao[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Payload para criar execução
 */
export interface CriarExecucaoPayload {
  tenant_id: string;
  modulo_id: string;
  usuario_id: string;
  data_execucao?: string;
  status?: 'rascunho' | 'concluido';
  dados_execucao?: Record<string, any>;
  observacoes_gerais?: string;
  respostas?: {
    pergunta_id: string;
    pergunta_codigo: string;
    resposta?: string;
    resposta_booleana?: boolean;
    observacao?: string;
  }[];
  fotos?: {
    pergunta_id?: string;
    pergunta_codigo?: string;
    nome_arquivo: string;
    url_arquivo: string;
    tamanho_bytes?: number;
    tipo_mime?: string;
    categoria?: string;
    descricao?: string;
    latitude?: number;
    longitude?: number;
    timestamp_captura?: string;
  }[];
}
