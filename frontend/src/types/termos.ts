// ===================================================================
// TIPOS TYPESCRIPT - TERMOS AMBIENTAIS
// Localização: src/types/termos.ts
// Módulo: Termos Ambientais (Paralização, Notificação, Recomendação)
// ===================================================================



export interface TermoAmbiental {
  id: string;
  numero_sequencial: number;
  data_termo: string;
  hora_termo: string;
  local_atividade: string;
  projeto_ba?: string;
  fase_etapa_obra?: string;
  emitido_por_nome: string;
  emitido_por_gerencia?: string;
  emitido_por_empresa?: string;
  emitido_por_usuario_id?: string;
  destinatario_nome: string;
  destinatario_gerencia?: string;
  destinatario_empresa?: string;
  area_equipamento_atividade: string;
  equipe?: string;
  atividade_especifica?: string;
  tipo_termo: 'PARALIZACAO_TECNICA' | 'NOTIFICACAO' | 'RECOMENDACAO';
  natureza_desvio: 'OCORRENCIA_REAL' | 'QUASE_ACIDENTE_AMBIENTAL' | 'POTENCIAL_NAO_CONFORMIDADE';
  // Não conformidades (até 10 itens)
  descricao_nc_1?: string;
  severidade_nc_1?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_2?: string;
  severidade_nc_2?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_3?: string;
  severidade_nc_3?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_4?: string;
  severidade_nc_4?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_5?: string;
  severidade_nc_5?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_6?: string;
  severidade_nc_6?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_7?: string;
  severidade_nc_7?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_8?: string;
  severidade_nc_8?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_9?: string;
  severidade_nc_9?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  descricao_nc_10?: string;
  severidade_nc_10?: 'MA' | 'A' | 'M' | 'B' | 'PE';
  // Verificação e responsável
  lista_verificacao_aplicada?: string;
  tst_tma_responsavel?: string;
  // Ações para correção (até 10 itens)
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
  // Assinaturas
  assinatura_responsavel_area?: boolean;
  data_assinatura_responsavel?: string;
  assinatura_emitente?: boolean;
  data_assinatura_emitente?: string;
  assinatura_responsavel_area_img?: string;
  assinatura_emitente_img?: string;
  // Textos livres
  providencias_tomadas?: string;
  observacoes?: string;
  // Liberação (apenas Paralização Técnica)
  liberacao_nome?: string;
  liberacao_empresa?: string;
  liberacao_gerencia?: string;
  liberacao_data?: string;
  liberacao_horario?: string;
  liberacao_assinatura_carimbo?: boolean;
  data_liberacao?: string;
  // Status e controle
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CORRIGIDO' | 'LIBERADO';
  latitude?: number;
  longitude?: number;
  precisao_gps?: number;
  endereco_gps?: string;
  sincronizado?: boolean;
  offline?: boolean;
  created_at: string;
  updated_at: string;
  numero_termo?: string;
  auth_user_id?: string;
  // Campos adicionais para compatibilidade com frontend
  titulo?: string;
  data_emissao?: string;
  hora_emissao?: string;
  responsavel_area_id?: string;
  responsavel_area?: string;
  descricao_fatos?: string;
  medidas_corretivas?: string;
  area_id?: string;
  
  // Fotos do termo
  fotos?: TermoFoto[];
}

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
  sincronizado: boolean;
}

export interface TermoFiltros {
  status?: string;
  tipo_termo?: string;
  data_inicio?: string;
  data_fim?: string;
  usuario_id?: string;
  area_id?: string;
  busca_texto?: string;
}

export interface TermosEstatisticas {
  total: number;
  pendentes: number;
  em_andamento: number;
  corrigidos: number;
  liberados: number;
  por_tipo: {
    paralizacao_tecnica: number;
    notificacao: number;
    recomendacao: number;
  };
  por_area: Array<{
    area_id: string;
    area_nome: string;
    quantidade: number;
  }>;
}

// ✅ INTERFACES OFFLINE MOVIDAS PARA src/types/offline.ts
// As interfaces TermoAmbientalOffline e TermoFotoOffline agora estão em:
// - src/types/entities.ts (base)
// - src/types/offline.ts (estendem base com campos offline)

// Alias para compatibilidade com componentes existentes
export type TermoNotificacaoInterdicao = TermoAmbiental;
    
// ===================================================================
// TIPOS AUXILIARES
// ===================================================================

// Tipo para não conformidade (usado no formulário)
export interface TermoNaoConformidade {
    descricao: string;
  severidade: 'MA' | 'A' | 'M' | 'B' | 'PE';
}

// Tipo para ação de correção (usado no formulário)
export interface TermoAcaoCorrecao {
  descricao: string;
  prazo: string;
}

// Tipo para dados de liberação (usado no formulário)
export interface TermoLiberacao {
  nome?: string;
  empresa?: string;
  gerencia?: string;
  data?: string;
  horario?: string;
  assinatura_carimbo?: boolean;
}
  
  // Tipo para fotos e evidências

  
  // Tipo para histórico
  export interface TermoHistorico {
    id?: string;
    termo_id?: string;
    
    // Dados da Ação
    tipo_acao: string;
    descricao: string;
    data_acao?: string;
    
    // Responsável
    usuario_id?: string;
    usuario_nome?: string;
    
    // Dados Adicionais
    observacoes?: string;
    anexos_adicionados: number;
    
    created_at?: string;
  }
  
// Tipo para dados do formulário (NOVA ESTRUTURA)
  export interface TermoFormData {
    destinatario_cpf: any;
    emitido_por_matricula: any;
    emitido_por_cargo: any;
  // Identificação básica
    numero_termo?: string; // ✅ ADICIONAR numero_termo
    data_termo: string;
    hora_termo: string;
    local_atividade: string;
    projeto_ba: string;
    fase_etapa_obra: string;
    
    // Emissor (De)
    emitido_por_nome: string;
    emitido_por_gerencia: string;
    emitido_por_empresa: string;
    emitido_por_usuario_id?: string;
    
    // Destinatário (Para)
    destinatario_nome: string;
    destinatario_gerencia: string;
    destinatario_empresa: string;
      
      // Localização
    area_equipamento_atividade: string;
    equipe: string;
    atividade_especifica: string;
      
    // Tipo e natureza
    tipo_termo: 'PARALIZACAO_TECNICA' | 'NOTIFICACAO' | 'RECOMENDACAO';
    natureza_desvio: 'OCORRENCIA_REAL' | 'QUASE_ACIDENTE_AMBIENTAL' | 'POTENCIAL_NAO_CONFORMIDADE';
      
    // Não conformidades
    nao_conformidades: TermoNaoConformidade[];
  
    // Lista de verificação
    lista_verificacao_aplicada: string;
    tst_tma_responsavel: string;
    
    // Ações para correção
    acoes_correcao: TermoAcaoCorrecao[];
    
    // Assinaturas
    assinatura_responsavel_area: boolean;
    data_assinatura_responsavel?: string; // ✅ Data da assinatura do responsável
    assinatura_emitente: boolean;
    data_assinatura_emitente?: string; // ✅ Data da assinatura do emitente
    
    // Assinaturas base64 (imagens)
    assinatura_responsavel_area_img?: string; // base64 da assinatura
    assinatura_emitente_img?: string; // base64 da assinatura
    
    // Textos livres
    providencias_tomadas: string;
    observacoes: string;
    
    // Liberação (apenas Paralização Técnica)
    liberacao?: TermoLiberacao;
    
    // GPS
    usarGpsAtual: boolean;
    latitude?: number;
    longitude?: number;
    precisao_gps?: number;
    endereco_gps: string;
      
    // Fotos
    fotos: { [key: string]: any[] };
    
    // Status (para edição)
    status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'CORRIGIDO' | 'LIBERADO' | 'BAIXADA';
  }
  
// ===================================================================
// FILTROS E ESTATÍSTICAS
// ===================================================================
  
  // Tipo para filtros de busca
  export interface TermosFiltros {
  tipo_termo?: 'PARALIZACAO_TECNICA' | 'NOTIFICACAO' | 'RECOMENDACAO' | 'TODOS';
  natureza_desvio?: 'OCORRENCIA_REAL' | 'QUASE_ACIDENTE_AMBIENTAL' | 'POTENCIAL_NAO_CONFORMIDADE' | 'TODOS';
  status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'CORRIGIDO' | 'LIBERADO' | 'TODOS';
  data_inicio?: string;
  data_fim?: string;
  projeto_ba?: string;
  emitido_por?: string;
  destinatario?: string;
  busca_texto?: string;
  emitido_por_usuario_id?: string; // ✅ FILTRO POR USUÁRIO - SEGURANÇA
}
  

  
// ===================================================================
// CONSTANTES
// ===================================================================

// Tipos de termo disponíveis
  export const TIPOS_TERMO = {
  RECOMENDACAO: {
    nome: 'Recomendação',
    descricao: 'Sugestão para melhoria ou adequação'
  },
  NOTIFICACAO: {
    nome: 'Notificação',
    descricao: 'Comunicação formal sobre não conformidade'
  },
  PARALIZACAO_TECNICA: {
    nome: 'Paralização Técnica',
    descricao: 'Interrupção imediata de atividade ou equipamento'
  }
} as const;

// Natureza do desvio
export const NATUREZA_DESVIO = {
  OCORRENCIA_REAL: {
    nome: 'Ocorrência Real',
    descricao: 'Fato já ocorrido que gerou impacto'
  },
  QUASE_ACIDENTE_AMBIENTAL: {
    nome: 'Quase Acidente Ambiental',
    descricao: 'Situação que poderia ter gerado impacto ambiental'
  },
  POTENCIAL_NAO_CONFORMIDADE: {
    nome: 'Potencial Não Conformidade',
    descricao: 'Condição que pode gerar não conformidade'
    }
  } as const;
  
// Grau de severidade
export const GRAU_SEVERIDADE = {
  MA: {
    nome: 'Muito Alto',
    cor: 'red',
    descricao: 'Risco crítico, ação imediata necessária'
    },
  A: {
    nome: 'Alto',
    cor: 'orange',
    descricao: 'Risco alto, ação urgente necessária'
    },
  M: {
    nome: 'Moderado',
    cor: 'yellow',
    descricao: 'Risco moderado, ação planejada necessária'
  },
  B: {
    nome: 'Baixo',
    cor: 'blue',
    descricao: 'Risco baixo, monitoramento necessário'
    },
  PE: {
    nome: 'Pequeno Evento',
    cor: 'green',
    descricao: 'Risco mínimo, melhoria recomendada'
    }
  } as const;
  
// Constantes para compatibilidade com componentes antigos
  export const GRAVIDADE_NAO_CONFORMIDADE = {
  CRITICA: 'CRITICA',
  ALTA: 'ALTA',
  MEDIA: 'MEDIA',
  BAIXA: 'BAIXA'
  } as const;
  
export const CATEGORIAS_NAO_CONFORMIDADE = {
  AMBIENTAL: 'AMBIENTAL',
  SEGURANCA: 'SEGURANCA',
  QUALIDADE: 'QUALIDADE',
  LEGAL: 'LEGAL',
  OUTROS: 'OUTROS'
} as const;