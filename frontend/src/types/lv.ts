// ===================================================================
// INTERFACES UNIFICADAS PARA LVs - ESTRUTURA UNIFICADA
// ===================================================================

// Interface principal unificada para todas as LVs
export interface LV {
  id: string;
  tipo_lv: string; // '01'=Resíduos, '02'=Segurança, '03'=Água, etc.
  nome_lv: string; // 'Resíduos', 'Segurança', 'Água', etc.
  usuario_id: string;
  usuario_nome: string;
  usuario_matricula?: string;
  usuario_email: string;
  data_inspecao: string;
  data_preenchimento: string;
  area: string;
  area_id?: string;
  responsavel_area?: string;
  responsavel_tecnico: string;
  responsavel_empresa: string;
  inspetor_principal: string;
  inspetor_secundario?: string;
  inspetor_secundario_matricula?: string;
  latitude?: number;
  longitude?: number;
  gps_precisao?: number;
  endereco_gps?: string;
  observacoes?: string; // Campo legado para compatibilidade
  observacoes_gerais?: string;
  total_fotos: number;
  total_conformes: number;
  total_nao_conformes: number;
  total_nao_aplicaveis: number;
  percentual_conformidade: number;
  status: 'concluido' | 'rascunho' | 'concluida';
  sincronizado: boolean;
  numero_sequencial: number;
  created_at: string;
  updated_at: string;
  offline?: boolean; // Para compatibilidade com IndexedDB
}

// Interface para avaliações unificadas
export interface LVAvaliacao {
  id: string;
  lv_id: string;
  tipo_lv: string; // Para otimização de consultas
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  item_codigo: string;
  item_pergunta: string;
  avaliacao: 'C' | 'NC' | 'NA' | 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  observacao?: string;
  created_at: string;
}

// Interface para criação de avaliações (sem id obrigatório)
export interface LVAvaliacaoCriacao {
  lv_id: string;
  tipo_lv: string;
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  item_codigo: string;
  item_pergunta: string;
  avaliacao: 'C' | 'NC' | 'NA' | 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  observacao?: string;
  created_at: string;
}

// Interface para fotos unificadas
export interface LVFoto {
  id: string;
  lv_id: string;
  tipo_lv: string; // Para otimização de consultas
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  nome_arquivo: string;
  url_arquivo: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  sincronizado?: boolean; // Para compatibilidade com IndexedDB
  offline?: boolean; // Para compatibilidade com IndexedDB
}

// Interface para configuração das LVs
export interface LVConfiguracao {
  id: string;
  tipo_lv: string;
  nome_lv: string;
  nome_completo: string;
  revisao?: string;
  data_revisao?: string;
  ativa: boolean;
  bucket_fotos: string;
  created_at: string;
  updated_at: string;
}

// Interface para dados do formulário (compatibilidade)
export interface LVFormData {
  // Dados principais
  area: string;
  areaCustomizada?: string;
  usarAreaCustomizada?: boolean;
  responsavel_area?: string;
  responsavel_tecnico: string;
  responsavel_empresa: string;
  inspetor_principal: string;
  inspetor_secundario?: string;
  inspetor_secundario_matricula?: string;
  data_inspecao: string;
  observacoes_gerais?: string;
  
  // GPS
  latitude?: number;
  longitude?: number;
  gps_precisao?: number;
  endereco_gps?: string;
  
  // Avaliações
  avaliacoes: { [itemId: string]: 'C' | 'NC' | 'NA' };
  
  // Fotos
  fotos: { [itemId: string]: (LVFoto | any)[] };
  
  // Observações individuais
  observacoesIndividuais: { [itemId: string]: string };
  
  // Campos customizados para plugins
  customFields?: Record<string, unknown>;
}

export interface LVBase {
  id: string;
  numero_sequencial: string;
  area_id: string;
  data_inspecao: string;
  inspetor_id: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes?: string;
  customFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Interface para estatísticas
export interface LVEstatisticas {
  total_lvs: number;
  total_conformes: number;
  total_nao_conformes: number;
  total_nao_aplicaveis: number;
  percentual_conformidade: number;
  total_fotos: number;
}

// Interface para filtros de busca
export interface LVFiltros {
  tipo_lv?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  area?: string;
  responsavel_tecnico?: string;
  usuario_id?: string; // ✅ FILTRO POR USUÁRIO - SEGURANÇA
}

// Interface para paginação
export interface LVPaginacao {
  pagina: number;
  por_pagina: number;
  total: number;
  total_paginas: number;
}

// Interface para resposta da API
export interface LVResposta {
  dados: LV[];
  estatisticas: LVEstatisticas;
  paginacao: LVPaginacao;
}

// Interface para criação/edição de LV
export interface LVCriacao {
  tipo_lv: string;
  titulo: string; // Campo obrigatório para API do backend
  nome_lv: string;
  usuario_id: string;
  usuario_nome: string;
  usuario_matricula?: string;
  usuario_email: string;
  data_inspecao: string;
  area: string;
  responsavel_area?: string;
  responsavel_tecnico: string;
  responsavel_empresa: string;
  inspetor_principal: string;
  inspetor_secundario?: string;
  inspetor_secundario_matricula?: string;
  latitude?: number;
  longitude?: number;
  gps_precisao?: number;
  endereco_gps?: string;
  observacoes_gerais?: string;
  // Assinaturas digitais (base64)
  assinatura_inspetor_principal?: string;
  data_assinatura_inspetor_principal?: string;
  assinatura_inspetor_secundario?: string;
  data_assinatura_inspetor_secundario?: string;
}

// Interface para atualização de LV
export interface LVAtualizacao extends Partial<LVCriacao> {
  id: string;
}

// Interface para exclusão de LV
export interface LVExclusao {
  id: string;
  tipo_lv: string;
}

// Interface para sincronização offline
export interface LVOffline {
  lv: LV;
  avaliacoes: LVAvaliacao[];
  fotos: LVFoto[];
  sincronizado: boolean;
  offline: boolean;
}

// Interface para configuração de itens da LV
export interface LVItem {
  id: string | number; // UUID ou número sequencial para compatibilidade
  codigo: string;
  pergunta?: string;
  descricao?: string; // Alias para pergunta
  categoria?: string;
  obrigatorio?: boolean;
  ordem?: number; // Número sequencial usado como item_id no banco
}

// Interface para configuração completa da LV
export interface LVConfiguracaoCompleta extends LVConfiguracao {
  itens: LVItem[];
  categorias?: string[];
}

// ===================================================================
// TIPOS AUXILIARES
// ===================================================================

// Tipo para status de operação
export type LVStatus = 'carregando' | 'sucesso' | 'erro' | 'vazio';

// Tipo para ações da LV
export type LVAcao = 'criar' | 'editar' | 'visualizar' | 'excluir' | 'download';

// Tipo para modo de exibição
export type LVModo = 'lista' | 'formulario' | 'visualizacao' | 'relatorio';

// ===================================================================
// CONSTANTES
// ===================================================================

// Configurações padrão das LVs
export const LV_CONFIGS: Record<string, LVConfiguracaoCompleta> = {
  '01': {
    id: '',
    tipo_lv: '01',
    nome_lv: 'Resíduos',
    nome_completo: '01.Resíduos',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '01.01', pergunta: 'Os resíduos estão sendo segregados corretamente?', obrigatorio: true },
      { id: 2, codigo: '01.02', pergunta: 'Os containers estão identificados?', obrigatorio: true },
      // ... outros itens
    ]
  },
  '02': {
    id: '',
    tipo_lv: '02',
    nome_lv: 'Recursos Hídricos',
    nome_completo: '02.Recursos Hídricos',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '02.01', pergunta: 'Foram implantados sistema de proteção de acordo com as necessidades do local? (Cortina de turbidez, bidim, gabião, ou outras medidas)', obrigatorio: true },
      { id: 2, codigo: '02.02', pergunta: 'Existe a necessidade da implantação de dispositivos provisórios de contenção e direcionamento ordenado de águas pluviais para o controle de processos erosivos superficiais?', obrigatorio: true },
      { id: 3, codigo: '02.03', pergunta: 'Há evidências do preenchimento do formulário de captação de água?', obrigatorio: true },
      { id: 4, codigo: '02.04', pergunta: 'Há vazamento de óleo e agua na moto bomba utilizado para captação de água?', obrigatorio: true }
    ]
  },
  '03': {
    id: '',
    tipo_lv: '03',
    nome_lv: 'Emissões Atmosféricas',
    nome_completo: '03.Emissões Atmosféricas',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '03.01', pergunta: 'O veículo possui selo de vistoria que demonstra utilização do laudo de opacidade do veiculo em dias?', obrigatorio: true },
      { id: 2, codigo: '03.02', pergunta: 'Há evidencia de umectação/captação em palnilha de controle preenchida?', obrigatorio: true },
      { id: 3, codigo: '03.03', pergunta: 'Existe emissão de material particulado (poeira) na área?', obrigatorio: true },
      { id: 4, codigo: '03.04', pergunta: 'A umectação de vias está sendo realizada conforme necessidade?', obrigatorio: true }
    ]
  },
  '04': {
    id: '',
    tipo_lv: '04',
    nome_lv: 'Produtos Químicos',
    nome_completo: '04.Produtos Químicos',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '04.01', pergunta: 'É disponibilizada FISPQ (atualizada) dos produtos armazenados?', obrigatorio: true },
      { id: 2, codigo: '04.02', pergunta: 'Existe evidência do treinamento na FISPQ dos produtos químicos?', obrigatorio: true },
      { id: 3, codigo: '04.03', pergunta: 'Existe contenção, cobertura, identificação e sinalização de risco (pictogramas) nos locais de armazenamento?', obrigatorio: true },
      { id: 4, codigo: '04.04', pergunta: 'É disponibilizado equipamentos/recursos para atendimento a emergências ambientais (kit de mitigação) e combate a incêndios no local?', obrigatorio: true },
      { id: 5, codigo: '04.05', pergunta: 'O armazenamento de produtos químicos possui identificação (carômetro) de quem é autorizado a acessar o local?', obrigatorio: true },
      { id: 6, codigo: '04.06', pergunta: 'Existe produto químico fracionado? Caso positivo, verificar se possui rotulagem secundária/e se está conforme orientações da FISPQ e com os pictogramas de perigo do GHS.', obrigatorio: true },
      { id: 7, codigo: '04.07', pergunta: 'Existe bacia de contenção com capacidade adequada para o volume armazenado com segurança contra derramamentos?', obrigatorio: true },
      { id: 8, codigo: '04.08', pergunta: 'Existem vazamentos de produtos químicos na área?', obrigatorio: true },
      { id: 9, codigo: '04.09', pergunta: 'O inventário dos produtos químicos é disponibilizado?', obrigatorio: true }
    ]
  },
  '05': {
    id: '',
    tipo_lv: '05',
    nome_lv: 'Comboio',
    nome_completo: '05.Comboio',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '05.01', pergunta: 'O motorista está portando CNH, MOPP, CIPP, CIV e LO?', obrigatorio: true },
      { id: 2, codigo: '05.02', pergunta: 'O caminhão possui sinalização de Segurança (Rótulo de risco, Painel de Segurança e Pictograma)?', obrigatorio: true },
      { id: 3, codigo: '05.03', pergunta: 'O caminhão possui Kit de Emergência Ambiental?', obrigatorio: true },
      { id: 4, codigo: '05.04', pergunta: 'É disponibilizado checklist do comboio?', obrigatorio: true },
      { id: 5, codigo: '05.05', pergunta: 'É disponibilizado Ficha de Emergência para o transporte dos produtos?', obrigatorio: true },
      { id: 6, codigo: '05.06', pergunta: 'É disponibilizado Envelope Cinza/Amarelo com todos os contatos de Emergência?', obrigatorio: true },
      { id: 7, codigo: '05.07', pergunta: 'O equipamento está livre de vazamento dos produtos?', obrigatorio: true },
      { id: 8, codigo: '05.08', pergunta: 'O equipamento possui aterramento (uso na hora do abastecimento)?', obrigatorio: true },
      { id: 9, codigo: '05.09', pergunta: 'Existem placas de perigo de abastecimento e afasta-se para utilização durante o abastecimento e cones para sinalização durante o abastecimento em campo?', obrigatorio: true }
    ]
  },
  '06': {
    id: '',
    tipo_lv: '06',
    nome_lv: 'Gerador',
    nome_completo: '06.Gerador',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '06.01', pergunta: 'Os geradores de energia estão em área isolada e com proibição de acesso para pessoas não autorizadas?', obrigatorio: true },
      { id: 2, codigo: '06.02', pergunta: 'Existe recursos para atendimento a emergências ambientais (Kit de mitigação) no local ou próximo?', obrigatorio: true },
      { id: 3, codigo: '06.03', pergunta: 'Existe sinais de vazamento?', obrigatorio: true },
      { id: 4, codigo: '06.04', pergunta: 'Existe identificação e sinalização adequada?', obrigatorio: true },
      { id: 5, codigo: '06.05', pergunta: 'O sistema de contenção auxiliar está em bom estado e suporta o volume de óleo em utilização?', obrigatorio: true },
      { id: 6, codigo: '06.06', pergunta: 'Existe necessidade de cobertura ou o equipamento é auto-contido/blindado?', obrigatorio: true }
    ]
  },
  '08': {
    id: '',
    tipo_lv: '08',
    nome_lv: 'Concreto',
    nome_completo: '08.Concreto',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '08.01', pergunta: 'O resíduo da atividade de concretagem está sendo descartado em local contido de forma ordenada e sem exceder o limite de capacidade de armazenamento?', obrigatorio: true },
      { id: 2, codigo: '08.02', pergunta: 'A área de abastecimento do concreto possui drenos para bacia de disposição temporária de concreto residual?', obrigatorio: true },
      { id: 3, codigo: '08.03', pergunta: 'A água utilizada na fabricação de concreto é de origem autorizada/legal?', obrigatorio: true },
      { id: 4, codigo: '08.04', pergunta: 'O local de lavagem do caminhão betoneira está distante de corpos hídricos?', obrigatorio: true },
      { id: 5, codigo: '08.05', pergunta: 'O efluente da lavagem do caminhão betoneira está sendo despejada em local correto (bacia de disposição temporária de concreto residual)?', obrigatorio: true }
    ]
  },
  '09': {
    id: '',
    tipo_lv: '09',
    nome_lv: 'Banheiro Químico',
    nome_completo: '09.Banheiro Químico',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '09.01', pergunta: 'As condições de higiene dos banheiros estão satisfatórias?', obrigatorio: true },
      { id: 2, codigo: '09.02', pergunta: 'Os banheiros possuem cronograma de limpeza atualizados e assinados?', obrigatorio: true },
      { id: 3, codigo: '09.03', pergunta: 'Existe itens de higiene pessoal nos banheiros quimicos? (papel higiênico, papel toalha, sabão liquido,água)?', obrigatorio: true },
      { id: 4, codigo: '09.04', pergunta: 'Existe procedimento de limpeza dos banheiros químicos, e está disponível?', obrigatorio: true },
      { id: 5, codigo: '09.05', pergunta: 'Os banheiros possuem fácil acesso para realização de limpeza?', obrigatorio: true },
      { id: 6, codigo: '09.06', pergunta: 'Os banheiros possuem cobertura adequada?', obrigatorio: true }
    ]
  },
  '11': {
    id: '',
    tipo_lv: '11',
    nome_lv: 'Proteções Ambientais',
    nome_completo: '11.Proteções Ambientais',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '11.01', pergunta: 'A proteção ambiental está atendendo de forma eficiente?', obrigatorio: true },
      { id: 2, codigo: '11.02', pergunta: 'O material utilizado para fixar os bidins suportam a água em caso de chuva intensa?', obrigatorio: true },
      { id: 3, codigo: '11.03', pergunta: 'Existem sulcos (erosão) realizadas pela passagem da água pluvial?', obrigatorio: true },
      { id: 4, codigo: '11.04', pergunta: 'Existe acúmulo de água que comprometa a estabilidade da proteção ambiental?', obrigatorio: true },
      { id: 5, codigo: '11.05', pergunta: 'A área que foi instalada a proteção ambiental permite a passagem de água de modo que não cause novas feições erosivas?', obrigatorio: true },
      { id: 6, codigo: '11.06', pergunta: 'Existem danos no bidim que causem a passagem de material para o curso d\'água?', obrigatorio: true },
      { id: 7, codigo: '11.07', pergunta: 'A marca do nível d\'água no bidim demonstra que houve transbordo?', obrigatorio: true }
    ]
  },
  '12': {
    id: '',
    tipo_lv: '12',
    nome_lv: 'Supressão Vegetal',
    nome_completo: '12.Supressão Vegetal',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '12.01', pergunta: 'O resgate de Germoplasma foi realizado?', obrigatorio: true },
      { id: 2, codigo: '12.02', pergunta: 'Foi realizado a limpeza da área conforme a ASV emitida pela SEMAS/PA?', obrigatorio: true },
      { id: 3, codigo: '12.03', pergunta: 'Foi realizado o armazenamento em pátios conforme a ASV emitida pela SEMAS/PA e POS da HYDRO?', obrigatorio: true },
      { id: 4, codigo: '12.04', pergunta: 'O empilhamento da madeira por DAP está de acordo com o POS da HYDRO?', obrigatorio: true },
      { id: 5, codigo: '12.05', pergunta: 'O traçamento, arraste e transporte da madeira estão sendo realizados conforme o POS da HYDRO?', obrigatorio: true },
      { id: 6, codigo: '12.06', pergunta: 'A remoção de indivíduo de porte arbóreo por classe esta sendo executada?', obrigatorio: true },
      { id: 7, codigo: '12.07', pergunta: 'Está havendo o cumprimento das recomendações da ASV emitida pela SEMAS/PA?', obrigatorio: true },
      { id: 8, codigo: '12.08', pergunta: 'A captura, coleta, resgate, transporte e soltura de animais esta sendo realizado de acordo com a AU emitida pela SEMAS/PA?', obrigatorio: true },
      { id: 9, codigo: '12.09', pergunta: 'A cubagem e/ou romaneio está ocorrendo conforme o POS da HYDRO?', obrigatorio: true }
    ]
  },
  '13': {
    id: '',
    tipo_lv: '13',
    nome_lv: 'Equipamentos',
    nome_completo: '13.Equipamentos',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '13.01', pergunta: 'Existe algum tipo de vazamento (óleo hidráulico, combustível, graxa, etc)?', obrigatorio: true },
      { id: 2, codigo: '13.02', pergunta: 'Existe kit de mitigação ambiental na frente de serviço do equipamento?', obrigatorio: true },
      { id: 3, codigo: '13.03', pergunta: 'Os operadores sabem o que fazer quando acontecer alguma ocorrência ambiental?', obrigatorio: true },
      { id: 4, codigo: '13.04', pergunta: 'O equipamento está livre de resíduos?', obrigatorio: true },
      { id: 5, codigo: '13.05', pergunta: 'As mangueiras e conexões estão em bom estado?', obrigatorio: true }
    ]
  },
  '24': {
    id: '',
    tipo_lv: '24',
    nome_lv: 'Gerenciamento de Resíduos',
    nome_completo: '24.Gerenciamento de Resíduos',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '24.01', pergunta: 'As inspeções mensais estão sendo realizadas conforme o cronograma?', obrigatorio: true },
      { id: 2, codigo: '24.02', pergunta: 'A segregação dos resíduos está sendo feita adequadamente conforme as categorias?', obrigatorio: true },
      { id: 3, codigo: '24.03', pergunta: 'Os resíduos estão sendo coletados e armazenados corretamente?', obrigatorio: true },
      { id: 4, codigo: '24.04', pergunta: 'Os relatórios mensais de gerenciamento de resíduos foram recebidos e revisados?', obrigatorio: true },
      { id: 5, codigo: '24.05', pergunta: 'Os resultados obtidos estão conforme os padrões regulamentares?', obrigatorio: true },
      { id: 6, codigo: '24.06', pergunta: 'Os resíduos estão sendo encaminhados para os destinos finais corretos?', obrigatorio: true },
      { id: 7, codigo: '24.07', pergunta: 'Os procedimentos de gestão de resíduos estão sendo seguidos?', obrigatorio: true },
      { id: 8, codigo: '24.08', pergunta: 'As inspeções de campo estão sendo realizadas conforme programado?', obrigatorio: true },
      { id: 9, codigo: '24.09', pergunta: 'Há documentação de não conformidades encontradas?', obrigatorio: true },
      { id: 10, codigo: '24.10', pergunta: 'As medidas corretivas aplicadas são eficazes?', obrigatorio: true }
    ]
  },
  '25': {
    id: '',
    tipo_lv: '25',
    nome_lv: 'Plantio Compensatório',
    nome_completo: '25.Plantio Compensatório',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '25.01', pergunta: 'As evidências da empresa executora foram recebidas e revisadas?', obrigatorio: true },
      { id: 2, codigo: '25.02', pergunta: 'O plantio está sendo executado conforme o plano aprovado?', obrigatorio: true },
      { id: 3, codigo: '25.03', pergunta: 'As espécies plantadas estão corretamente identificadas?', obrigatorio: true },
      { id: 4, codigo: '25.04', pergunta: 'As áreas plantadas estão sendo mantidas e monitoradas corretamente?', obrigatorio: true },
      { id: 5, codigo: '25.05', pergunta: 'Os relatórios de progresso do plantio foram recebidos e revisados?', obrigatorio: true },
      { id: 6, codigo: '25.06', pergunta: 'Os resultados obtidos estão conforme os objetivos do plano compensatório?', obrigatorio: true },
      { id: 7, codigo: '25.07', pergunta: 'As técnicas de plantio estão sendo aplicadas corretamente?', obrigatorio: true },
      { id: 8, codigo: '25.08', pergunta: 'A sobrevivência das espécies plantadas está sendo verificada?', obrigatorio: true },
      { id: 9, codigo: '25.09', pergunta: 'Há documentação de falhas ou sucessos no plantio?', obrigatorio: true },
      { id: 10, codigo: '25.10', pergunta: 'As medidas de manutenção aplicadas são eficazes?', obrigatorio: true }
    ]
  },
  '26': {
    id: '',
    tipo_lv: '26',
    nome_lv: 'Recuperação de APP',
    nome_completo: '26.Recuperação de APP',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '26.01', pergunta: 'As visitas mensais estão sendo realizadas conforme o cronograma?', obrigatorio: true },
      { id: 2, codigo: '26.02', pergunta: 'As atividades de recuperação estão sendo executadas conforme o plano aprovado?', obrigatorio: true },
      { id: 3, codigo: '26.03', pergunta: 'As áreas de APP estão corretamente identificadas?', obrigatorio: true },
      { id: 4, codigo: '26.04', pergunta: 'Os relatórios mensais de recuperação foram recebidos e revisados?', obrigatorio: true },
      { id: 5, codigo: '26.05', pergunta: 'Os resultados obtidos estão conforme os objetivos do plano de recuperação?', obrigatorio: true },
      { id: 6, codigo: '26.06', pergunta: 'As técnicas de recomposição estão sendo aplicadas corretamente?', obrigatorio: true },
      { id: 7, codigo: '26.07', pergunta: 'As áreas recuperadas estão conformes com os padrões estabelecidos?', obrigatorio: true },
      { id: 8, codigo: '26.08', pergunta: 'Há documentação de falhas ou sucessos na recuperação?', obrigatorio: true },
      { id: 9, codigo: '26.09', pergunta: 'As áreas recuperadas estão sendo mantidas corretamente?', obrigatorio: true },
      { id: 10, codigo: '26.10', pergunta: 'As medidas de recomposição aplicadas são eficazes?', obrigatorio: true }
    ]
  },
  '27': {
    id: '',
    tipo_lv: '27',
    nome_lv: 'Educação Ambiental',
    nome_completo: '27.Educação Ambiental',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '27.01', pergunta: 'As visitas prévias às comunidades estão sendo realizadas?', obrigatorio: true },
      { id: 2, codigo: '27.02', pergunta: 'As atividades de educação ambiental estão sendo executadas conforme o plano?', obrigatorio: true },
      { id: 3, codigo: '27.03', pergunta: 'As comunidades estão participando das atividades programadas?', obrigatorio: true },
      { id: 4, codigo: '27.04', pergunta: 'Os relatórios de educação ambiental foram recebidos e revisados?', obrigatorio: true },
      { id: 5, codigo: '27.05', pergunta: 'Os resultados obtidos estão conforme os objetivos do programa?', obrigatorio: true },
      { id: 6, codigo: '27.06', pergunta: 'Os materiais educativos estão sendo utilizados conforme o planejado?', obrigatorio: true },
      { id: 7, codigo: '27.07', pergunta: 'Os métodos de educação ambiental estão sendo seguidos corretamente?', obrigatorio: true },
      { id: 8, codigo: '27.08', pergunta: 'Há documentação dos feedbacks das comunidades?', obrigatorio: true },
      { id: 9, codigo: '27.09', pergunta: 'As campanhas de conscientização estão sendo realizadas?', obrigatorio: true },
      { id: 10, codigo: '27.10', pergunta: 'As atividades educativas aplicadas são eficazes?', obrigatorio: true }
    ]
  },
  '28': {
    id: '',
    tipo_lv: '28',
    nome_lv: 'Comunicação Social',
    nome_completo: '28.Comunicação Social',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '28.01', pergunta: 'As informações do SACS foram recebidas e revisadas até o dia 10 de cada mês?', obrigatorio: true },
      { id: 2, codigo: '28.02', pergunta: 'As reuniões e consultas com a comunidade local estão sendo realizadas?', obrigatorio: true },
      { id: 3, codigo: '28.03', pergunta: 'As informações relevantes sobre o projeto estão sendo divulgadas?', obrigatorio: true },
      { id: 4, codigo: '28.04', pergunta: 'Os feedbacks da comunidade estão sendo avaliados e respondidos?', obrigatorio: true },
      { id: 5, codigo: '28.05', pergunta: 'As atividades de comunicação social estão documentadas?', obrigatorio: true },
      { id: 6, codigo: '28.06', pergunta: 'As comunidades estão participando das reuniões?', obrigatorio: true },
      { id: 7, codigo: '28.07', pergunta: 'Os materiais informativos estão sendo distribuídos?', obrigatorio: true },
      { id: 8, codigo: '28.08', pergunta: 'Os métodos de comunicação estão sendo seguidos corretamente?', obrigatorio: true },
      { id: 9, codigo: '28.09', pergunta: 'Os resultados obtidos estão conforme os objetivos do programa?', obrigatorio: true },
      { id: 10, codigo: '28.10', pergunta: 'As atividades de comunicação aplicadas são eficazes?', obrigatorio: true }
    ]
  },
  '29': {
    id: '',
    tipo_lv: '29',
    nome_lv: 'Qualidade das Águas',
    nome_completo: '29.Qualidade das Águas',
    revisao: 'Revisão 01',
    data_revisao: '2024-01-01',
    ativa: true,
    bucket_fotos: 'fotos-lvs',
    created_at: '',
    updated_at: '',
    itens: [
      { id: 1, codigo: '29.01', pergunta: 'As amostragens estão sendo executadas conforme o cronograma bimestral?', obrigatorio: true },
      { id: 2, codigo: '29.02', pergunta: 'Os equipamentos de amostragem de água estão calibrados?', obrigatorio: true },
      { id: 3, codigo: '29.03', pergunta: 'As amostras de água superficial estão sendo coletadas corretamente?', obrigatorio: true },
      { id: 4, codigo: '29.04', pergunta: 'Os relatórios de qualidade da água foram recebidos e revisados?', obrigatorio: true },
      { id: 5, codigo: '29.05', pergunta: 'Os resultados obtidos estão conforme os limites regulamentares?', obrigatorio: true },
      { id: 6, codigo: '29.06', pergunta: 'Os pontos de amostragem estão corretamente identificados?', obrigatorio: true },
      { id: 7, codigo: '29.07', pergunta: 'As amostras estão sendo transportadas com integridade?', obrigatorio: true },
      { id: 8, codigo: '29.08', pergunta: 'As análises laboratoriais estão sendo realizadas conforme os padrões?', obrigatorio: true },
      { id: 9, codigo: '29.09', pergunta: 'Há documentação de excedências nos parâmetros de qualidade da água?', obrigatorio: true },
      { id: 10, codigo: '29.10', pergunta: 'Os relatórios de tendência estão sendo revisados bimestralmente?', obrigatorio: true }
    ]
  }
};

// Função para obter configuração de uma LV
export const getLVConfig = (tipo_lv: string): LVConfiguracaoCompleta => {
  return LV_CONFIGS[tipo_lv] || LV_CONFIGS['01']; // fallback para LV Resíduos
};

// Função para verificar se uma LV está ativa
export const isLVAtiva = (tipo_lv: string): boolean => {
  const config = getLVConfig(tipo_lv);
  return config.ativa;
};

// Função para obter nome completo da LV
export const getLVNomeCompleto = (tipo_lv: string): string => {
  const config = getLVConfig(tipo_lv);
  return config.nome_completo;
};

// Função para obter bucket de fotos da LV
export const getLVBucketFotos = (tipo_lv: string): string => {
  const config = getLVConfig(tipo_lv);
  return config.bucket_fotos;
}; 