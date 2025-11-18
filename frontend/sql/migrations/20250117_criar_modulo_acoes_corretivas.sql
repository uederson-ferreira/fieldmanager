-- ============================================
-- MIGRAÇÃO: Módulo de Ações Corretivas para NCs
-- Data: 17/11/2025
-- Versão: 1.0
-- Descrição: Cria estrutura completa para gestão de
--            ações corretivas derivadas de não conformidades
-- ============================================

-- ============================================
-- 1. TABELA: acoes_corretivas
-- Armazena as ações corretivas criadas para NCs
-- ============================================
CREATE TABLE IF NOT EXISTS acoes_corretivas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculação com LV e NC
  lv_id uuid NOT NULL REFERENCES lvs(id) ON DELETE CASCADE,
  avaliacao_id uuid NOT NULL REFERENCES lv_avaliacoes(id) ON DELETE CASCADE,

  -- Identificação da NC
  tipo_lv text NOT NULL,
  item_codigo text NOT NULL,
  item_pergunta text NOT NULL,
  descricao_nc text NOT NULL,

  -- Classificação da NC
  criticidade text NOT NULL DEFAULT 'media' CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  categoria text,

  -- Ação Corretiva Proposta
  acao_proposta text NOT NULL,
  acao_descricao text,

  -- Responsabilidade
  responsavel_id uuid REFERENCES usuarios(id),
  responsavel_nome text,
  area_responsavel text,

  -- Prazos
  prazo_inicial date NOT NULL,
  prazo_atual date NOT NULL,
  data_abertura timestamp DEFAULT NOW(),
  data_conclusao timestamp,

  -- Status do workflow
  status text NOT NULL DEFAULT 'aberta' CHECK (
    status IN ('aberta', 'em_andamento', 'aguardando_validacao', 'concluida', 'cancelada')
  ),

  -- Evidências de correção (JSON array de objetos com url, descricao, data)
  evidencias_correcao jsonb DEFAULT '[]'::jsonb,
  observacoes_conclusao text,

  -- Validação (por supervisor)
  validada_por uuid REFERENCES usuarios(id),
  validada_em timestamp,
  validacao_observacoes text,

  -- Auditoria
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  created_by uuid REFERENCES usuarios(id),
  updated_by uuid REFERENCES usuarios(id),

  -- Constraints
  CONSTRAINT prazo_atual_maior_igual_inicial CHECK (prazo_atual >= prazo_inicial)
);

-- Comentários na tabela
COMMENT ON TABLE acoes_corretivas IS 'Ações corretivas geradas a partir de não conformidades detectadas em LVs';
COMMENT ON COLUMN acoes_corretivas.criticidade IS 'Nível de criticidade da NC: baixa, media, alta, critica';
COMMENT ON COLUMN acoes_corretivas.status IS 'Status do workflow: aberta -> em_andamento -> aguardando_validacao -> concluida/cancelada';
COMMENT ON COLUMN acoes_corretivas.evidencias_correcao IS 'Array JSON com fotos/documentos que comprovam a correção';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_acoes_lv_id ON acoes_corretivas(lv_id);
CREATE INDEX IF NOT EXISTS idx_acoes_avaliacao_id ON acoes_corretivas(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_acoes_responsavel ON acoes_corretivas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_acoes_status ON acoes_corretivas(status);
CREATE INDEX IF NOT EXISTS idx_acoes_prazo ON acoes_corretivas(prazo_atual);
CREATE INDEX IF NOT EXISTS idx_acoes_criticidade ON acoes_corretivas(criticidade);
CREATE INDEX IF NOT EXISTS idx_acoes_created_at ON acoes_corretivas(created_at);

-- ============================================
-- 2. TABELA: historico_acoes_corretivas
-- Registra todas as mudanças em uma ação corretiva
-- ============================================
CREATE TABLE IF NOT EXISTS historico_acoes_corretivas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id uuid NOT NULL REFERENCES acoes_corretivas(id) ON DELETE CASCADE,

  -- Tipo de evento
  tipo_evento text NOT NULL CHECK (
    tipo_evento IN (
      'criada', 'atribuida', 'iniciada', 'atualizada',
      'prazo_alterado', 'evidencia_adicionada', 'validada',
      'concluida', 'cancelada', 'reaberta', 'comentario'
    )
  ),

  -- Detalhes do evento
  descricao text NOT NULL,
  dados_anteriores jsonb,
  dados_novos jsonb,

  -- Quem realizou a ação
  usuario_id uuid REFERENCES usuarios(id),
  usuario_nome text,

  -- Timestamp
  created_at timestamp DEFAULT NOW()
);

COMMENT ON TABLE historico_acoes_corretivas IS 'Histórico completo de todas as alterações em ações corretivas (auditoria)';

CREATE INDEX IF NOT EXISTS idx_historico_acao_id ON historico_acoes_corretivas(acao_id);
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico_acoes_corretivas(created_at);
CREATE INDEX IF NOT EXISTS idx_historico_tipo_evento ON historico_acoes_corretivas(tipo_evento);

-- ============================================
-- 3. TABELA: regras_criticidade_nc
-- Define regras para determinar automaticamente a
-- criticidade e prazos de NCs
-- ============================================
CREATE TABLE IF NOT EXISTS regras_criticidade_nc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Critérios de match (pode usar wildcards com %)
  tipo_lv text,
  categoria_lv text,
  item_codigo text,
  palavra_chave text,

  -- Classificação resultante
  criticidade text NOT NULL CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  requer_acao_imediata boolean DEFAULT false,
  prazo_padrao_dias integer,

  -- Ação sugerida
  acao_sugerida text,
  categoria_sugerida text,

  -- Controle
  ativo boolean DEFAULT true,
  prioridade integer DEFAULT 0,

  -- Auditoria
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  created_by uuid REFERENCES usuarios(id)
);

COMMENT ON TABLE regras_criticidade_nc IS 'Regras configuráveis para classificação automática de NCs e sugestão de ações corretivas';
COMMENT ON COLUMN regras_criticidade_nc.prioridade IS 'Ordem de avaliação das regras (maior = mais prioritária)';
COMMENT ON COLUMN regras_criticidade_nc.item_codigo IS 'Pode usar % como wildcard, ex: 05.% para todos itens 05.x';

CREATE INDEX IF NOT EXISTS idx_regras_tipo_lv ON regras_criticidade_nc(tipo_lv);
CREATE INDEX IF NOT EXISTS idx_regras_ativo ON regras_criticidade_nc(ativo);
CREATE INDEX IF NOT EXISTS idx_regras_prioridade ON regras_criticidade_nc(prioridade DESC);

-- ============================================
-- 4. TABELA: notificacoes_acoes
-- Notificações para usuários sobre ações corretivas
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  acao_id uuid NOT NULL REFERENCES acoes_corretivas(id) ON DELETE CASCADE,

  -- Destinatário
  usuario_id uuid NOT NULL REFERENCES usuarios(id),

  -- Tipo de notificação
  tipo text NOT NULL CHECK (tipo IN (
    'nova_acao', 'acao_atribuida', 'prazo_proximo',
    'prazo_vencido', 'validacao_solicitada', 'acao_validada',
    'acao_rejeitada', 'comentario_adicionado'
  )),

  -- Conteúdo
  titulo text NOT NULL,
  mensagem text NOT NULL,

  -- Status
  lida boolean DEFAULT false,
  lida_em timestamp,

  -- Canais de envio
  enviada_email boolean DEFAULT false,
  enviada_whatsapp boolean DEFAULT false,

  -- Timestamp
  created_at timestamp DEFAULT NOW()
);

COMMENT ON TABLE notificacoes_acoes IS 'Notificações sobre ações corretivas para usuários do sistema';

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes_acoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes_acoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_acao ON notificacoes_acoes(acao_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes_acoes(created_at);

-- ============================================
-- 5. TABELA: comentarios_acoes
-- Sistema de comentários para discussão de ações
-- ============================================
CREATE TABLE IF NOT EXISTS comentarios_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id uuid NOT NULL REFERENCES acoes_corretivas(id) ON DELETE CASCADE,

  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  usuario_nome text NOT NULL,

  comentario text NOT NULL,

  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

COMMENT ON TABLE comentarios_acoes IS 'Comentários e discussões sobre ações corretivas';

CREATE INDEX IF NOT EXISTS idx_comentarios_acao_id ON comentarios_acoes(acao_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios_acoes(created_at);

-- ============================================
-- 6. FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRIGGERS: updated_at
-- ============================================
DROP TRIGGER IF EXISTS trigger_acoes_updated_at ON acoes_corretivas;
CREATE TRIGGER trigger_acoes_updated_at
  BEFORE UPDATE ON acoes_corretivas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_regras_updated_at ON regras_criticidade_nc;
CREATE TRIGGER trigger_regras_updated_at
  BEFORE UPDATE ON regras_criticidade_nc
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_comentarios_updated_at ON comentarios_acoes;
CREATE TRIGGER trigger_comentarios_updated_at
  BEFORE UPDATE ON comentarios_acoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

-- ============================================
-- 8. VIEW: v_acoes_corretivas_completa
-- View com informações completas das ações
-- ============================================
CREATE OR REPLACE VIEW v_acoes_corretivas_completa AS
SELECT
  ac.*,

  -- Dados do responsável atual
  u.nome as responsavel_nome_atual,
  u.email as responsavel_email,
  u.telefone as responsavel_telefone,

  -- Dados da LV origem
  lv.nome_lv,
  lv.data_inspecao,
  lv.area as lv_area,
  lv.responsavel_tecnico as lv_responsavel_tecnico,

  -- Dados da avaliação (NC original)
  av.observacao as nc_observacao_original,
  av.created_at as nc_detectada_em,

  -- Status calculado do prazo
  CASE
    WHEN ac.status IN ('concluida', 'cancelada') THEN 'concluida'
    WHEN ac.prazo_atual < CURRENT_DATE THEN 'atrasada'
    WHEN ac.prazo_atual <= CURRENT_DATE + INTERVAL '3 days' THEN 'proxima_vencer'
    ELSE 'no_prazo'
  END as status_prazo,

  -- Dias até o prazo (negativo = atrasado)
  ac.prazo_atual - CURRENT_DATE as dias_ate_prazo,

  -- Contagem de evidências
  COALESCE(jsonb_array_length(ac.evidencias_correcao), 0) as qtd_evidencias,

  -- Tempo de resolução (se concluída)
  CASE
    WHEN ac.data_conclusao IS NOT NULL THEN
      EXTRACT(EPOCH FROM (ac.data_conclusao - ac.data_abertura)) / 86400
    ELSE NULL
  END as tempo_resolucao_dias

FROM acoes_corretivas ac
LEFT JOIN usuarios u ON ac.responsavel_id = u.id
LEFT JOIN lvs lv ON ac.lv_id = lv.id
LEFT JOIN lv_avaliacoes av ON ac.avaliacao_id = av.id;

COMMENT ON VIEW v_acoes_corretivas_completa IS 'View completa com dados agregados de ações corretivas e informações relacionadas';

-- ============================================
-- 9. VIEW: v_estatisticas_acoes
-- Estatísticas agregadas para dashboard
-- ============================================
CREATE OR REPLACE VIEW v_estatisticas_acoes AS
SELECT
  -- Totais por status
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'aberta') as abertas,
  COUNT(*) FILTER (WHERE status = 'em_andamento') as em_andamento,
  COUNT(*) FILTER (WHERE status = 'aguardando_validacao') as aguardando_validacao,
  COUNT(*) FILTER (WHERE status = 'concluida') as concluidas,
  COUNT(*) FILTER (WHERE status = 'cancelada') as canceladas,

  -- Totais por criticidade
  COUNT(*) FILTER (WHERE criticidade = 'critica') as criticas,
  COUNT(*) FILTER (WHERE criticidade = 'alta') as altas,
  COUNT(*) FILTER (WHERE criticidade = 'media') as medias,
  COUNT(*) FILTER (WHERE criticidade = 'baixa') as baixas,

  -- Ações com problemas de prazo
  COUNT(*) FILTER (
    WHERE status NOT IN ('concluida', 'cancelada')
    AND prazo_atual < CURRENT_DATE
  ) as atrasadas,

  COUNT(*) FILTER (
    WHERE status NOT IN ('concluida', 'cancelada')
    AND prazo_atual <= CURRENT_DATE + INTERVAL '3 days'
    AND prazo_atual >= CURRENT_DATE
  ) as proximas_vencer,

  -- Métricas de tempo
  AVG(
    EXTRACT(EPOCH FROM (data_conclusao - data_abertura)) / 86400
  ) FILTER (WHERE status = 'concluida') as tempo_medio_resolucao_dias,

  AVG(
    EXTRACT(EPOCH FROM (data_conclusao - data_abertura)) / 86400
  ) FILTER (WHERE status = 'concluida' AND criticidade = 'critica') as tempo_medio_critica,

  AVG(
    EXTRACT(EPOCH FROM (data_conclusao - data_abertura)) / 86400
  ) FILTER (WHERE status = 'concluida' AND criticidade = 'alta') as tempo_medio_alta,

  -- Taxa de sucesso
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'concluida' AND data_conclusao <= prazo_inicial) /
    NULLIF(COUNT(*) FILTER (WHERE status = 'concluida'), 0),
    2
  ) as taxa_conclusao_no_prazo,

  -- Data da última atualização
  MAX(updated_at) as ultima_atualizacao

FROM acoes_corretivas;

COMMENT ON VIEW v_estatisticas_acoes IS 'Estatísticas agregadas de ações corretivas para dashboards e relatórios';

-- ============================================
-- 10. FUNÇÃO: Registrar evento no histórico
-- ============================================
CREATE OR REPLACE FUNCTION registrar_historico_acao(
  p_acao_id uuid,
  p_tipo_evento text,
  p_descricao text,
  p_usuario_id uuid DEFAULT NULL,
  p_dados_anteriores jsonb DEFAULT NULL,
  p_dados_novos jsonb DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_usuario_nome text;
BEGIN
  -- Buscar nome do usuário se fornecido
  IF p_usuario_id IS NOT NULL THEN
    SELECT nome INTO v_usuario_nome
    FROM usuarios
    WHERE id = p_usuario_id;
  END IF;

  -- Inserir no histórico
  INSERT INTO historico_acoes_corretivas (
    acao_id,
    tipo_evento,
    descricao,
    usuario_id,
    usuario_nome,
    dados_anteriores,
    dados_novos
  ) VALUES (
    p_acao_id,
    p_tipo_evento,
    p_descricao,
    p_usuario_id,
    v_usuario_nome,
    p_dados_anteriores,
    p_dados_novos
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION registrar_historico_acao IS 'Função helper para registrar eventos no histórico de ações corretivas';

-- ============================================
-- 11. POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE acoes_corretivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_acoes_corretivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_criticidade_nc ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_acoes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS: acoes_corretivas
-- ============================================

-- SELECT: Todos usuários autenticados podem ver ações
DROP POLICY IF EXISTS "Usuários autenticados podem ver ações" ON acoes_corretivas;
CREATE POLICY "Usuários autenticados podem ver ações"
  ON acoes_corretivas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND ativo = true
    )
  );

-- INSERT: Admins e supervisores podem criar ações
DROP POLICY IF EXISTS "Admins e supervisores podem criar ações" ON acoes_corretivas;
CREATE POLICY "Admins e supervisores podem criar ações"
  ON acoes_corretivas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('ADM', 'SUP')
      AND u.ativo = true
      AND p.ativo = true
    )
  );

-- UPDATE: Admins, supervisores e responsável podem atualizar
DROP POLICY IF EXISTS "Admins, supervisores e responsável podem atualizar" ON acoes_corretivas;
CREATE POLICY "Admins, supervisores e responsável podem atualizar"
  ON acoes_corretivas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND (
        p.nome IN ('ADM', 'SUP')
        OR u.id = acoes_corretivas.responsavel_id
      )
      AND u.ativo = true
      AND p.ativo = true
    )
  );

-- DELETE: Apenas admins podem deletar
DROP POLICY IF EXISTS "Apenas admins podem deletar ações" ON acoes_corretivas;
CREATE POLICY "Apenas admins podem deletar ações"
  ON acoes_corretivas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'ADM'
      AND u.ativo = true
      AND p.ativo = true
    )
  );

-- ============================================
-- RLS: historico_acoes_corretivas
-- ============================================

-- SELECT: Todos podem ver histórico
DROP POLICY IF EXISTS "Todos podem ver histórico" ON historico_acoes_corretivas;
CREATE POLICY "Todos podem ver histórico"
  ON historico_acoes_corretivas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND ativo = true
    )
  );

-- INSERT: Sistema (service role) e usuários autenticados
DROP POLICY IF EXISTS "Sistema pode inserir histórico" ON historico_acoes_corretivas;
CREATE POLICY "Sistema pode inserir histórico"
  ON historico_acoes_corretivas
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RLS: regras_criticidade_nc
-- ============================================

-- SELECT: Todos podem ver regras ativas
DROP POLICY IF EXISTS "Todos podem ver regras ativas" ON regras_criticidade_nc;
CREATE POLICY "Todos podem ver regras ativas"
  ON regras_criticidade_nc
  FOR SELECT
  USING (
    ativo = true
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'ADM'
      AND u.ativo = true
    )
  );

-- INSERT/UPDATE/DELETE: Apenas admins
DROP POLICY IF EXISTS "Apenas admins podem gerenciar regras" ON regras_criticidade_nc;
CREATE POLICY "Apenas admins podem gerenciar regras"
  ON regras_criticidade_nc
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'ADM'
      AND u.ativo = true
    )
  );

-- ============================================
-- RLS: notificacoes_acoes
-- ============================================

-- SELECT: Usuário vê apenas suas notificações
DROP POLICY IF EXISTS "Usuário vê suas notificações" ON notificacoes_acoes;
CREATE POLICY "Usuário vê suas notificações"
  ON notificacoes_acoes
  FOR SELECT
  USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

-- INSERT: Sistema pode criar notificações
DROP POLICY IF EXISTS "Sistema cria notificações" ON notificacoes_acoes;
CREATE POLICY "Sistema cria notificações"
  ON notificacoes_acoes
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Usuário pode marcar suas notificações como lidas
DROP POLICY IF EXISTS "Usuário atualiza suas notificações" ON notificacoes_acoes;
CREATE POLICY "Usuário atualiza suas notificações"
  ON notificacoes_acoes
  FOR UPDATE
  USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================
-- RLS: comentarios_acoes
-- ============================================

-- SELECT: Todos podem ver comentários
DROP POLICY IF EXISTS "Todos podem ver comentários" ON comentarios_acoes;
CREATE POLICY "Todos podem ver comentários"
  ON comentarios_acoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND ativo = true
    )
  );

-- INSERT: Usuários autenticados podem comentar
DROP POLICY IF EXISTS "Usuários podem comentar" ON comentarios_acoes;
CREATE POLICY "Usuários podem comentar"
  ON comentarios_acoes
  FOR INSERT
  WITH CHECK (
    usuario_id IN (
      SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

-- UPDATE/DELETE: Apenas autor ou admin
DROP POLICY IF EXISTS "Autor ou admin pode editar/deletar" ON comentarios_acoes;
CREATE POLICY "Autor ou admin pode editar/deletar"
  ON comentarios_acoes
  FOR ALL
  USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'ADM'
    )
  );

-- ============================================
-- 12. DADOS INICIAIS (SEEDS)
-- Regras de criticidade padrão
-- ============================================

-- Resíduos Classe I (Perigosos) - CRÍTICO
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('01', 'Resíduos', '05.02', 'critica', true, 1, 'Providenciar contenção adequada imediata para resíduos Classe I', 'residuos_classe_i', 100),
  ('01', 'Resíduos', '05.03', 'critica', true, 1, 'Regularizar armazenamento temporário de resíduos perigosos', 'residuos_classe_i', 100),
  ('01', 'Resíduos', '05.04', 'alta', true, 2, 'Corrigir segregação de resíduos perigosos', 'residuos_classe_i', 90);

-- Efluentes - ALTA
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('01', 'Efluentes', NULL, 'alta', true, 3, 'Corrigir sistema de tratamento de efluentes', 'efluentes', 80);

-- Emissões atmosféricas - ALTA
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('01', 'Emissões', NULL, 'alta', true, 3, 'Ajustar sistema de controle de emissões', 'emissoes', 80);

-- Documentação - MÉDIA
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('01', 'Documentação', NULL, 'media', false, 7, 'Atualizar documentação ambiental', 'documentacao', 40);

-- Licenças - ALTA
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('01', 'Licenças', NULL, 'alta', true, 5, 'Regularizar licença ambiental', 'licencas', 90);

-- EPI/Segurança - ALTA
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('01', NULL, NULL, 'alta', true, 2, 'Providenciar EPIs adequados', 'seguranca', 85);

-- Palavras-chave críticas
INSERT INTO regras_criticidade_nc (palavra_chave, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida, prioridade)
VALUES
  ('vazamento', 'critica', true, 1, 'Conter vazamento imediatamente e avaliar impacto ambiental', 'emergencia', 200),
  ('derramamento', 'critica', true, 1, 'Conter derramamento e iniciar limpeza emergencial', 'emergencia', 200),
  ('contaminação', 'critica', true, 1, 'Isolar área contaminada e avaliar extensão', 'emergencia', 190),
  ('vencid', 'alta', true, 3, 'Renovar/atualizar item vencido', 'conformidade', 70),
  ('irregular', 'alta', true, 3, 'Regularizar situação irregular', 'conformidade', 70),
  ('inadequad', 'media', true, 5, 'Adequar conforme requisitos', 'adequacao', 50);

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: 5';
  RAISE NOTICE '📋 Views criadas: 2';
  RAISE NOTICE '⚙️  Funções criadas: 2';
  RAISE NOTICE '🔒 Políticas RLS: 15';
  RAISE NOTICE '📝 Regras iniciais: 12';
END $$;
