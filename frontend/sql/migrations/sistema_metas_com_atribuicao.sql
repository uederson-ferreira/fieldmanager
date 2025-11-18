-- ===================================================================
-- SISTEMA DE METAS - ECOFIELD (COM ATRIBUIÇÃO POR TMA)
-- ===================================================================

-- Adicionar coluna escopo se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'metas' AND column_name = 'escopo') THEN
        ALTER TABLE metas ADD COLUMN escopo VARCHAR(20) DEFAULT 'equipe' CHECK (escopo IN ('equipe', 'individual'));
    END IF;
END $$;

-- Adicionar coluna tma_id em progresso_metas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'progresso_metas' AND column_name = 'tma_id') THEN
        ALTER TABLE progresso_metas ADD COLUMN tma_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Tabela de metas definidas pelo administrador
CREATE TABLE IF NOT EXISTS metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_meta VARCHAR(50) NOT NULL CHECK (tipo_meta IN ('lv', 'termo', 'rotina')),
  categoria VARCHAR(100), -- Para LVs específicas (ex: '01', '02', etc.)
  periodo VARCHAR(20) NOT NULL CHECK (periodo IN ('diario', 'semanal', 'mensal', 'trimestral', 'anual')),
  ano INTEGER NOT NULL,
  mes INTEGER, -- NULL para períodos anuais
  semana INTEGER, -- NULL para períodos não semanais
  dia INTEGER, -- NULL para períodos não diários
  meta_quantidade INTEGER NOT NULL,
  meta_percentual DECIMAL(5,2), -- Para metas de percentual (ex: conformidade)
  descricao TEXT,
  escopo VARCHAR(20) DEFAULT 'equipe' CHECK (escopo IN ('equipe', 'individual')),
  ativa BOOLEAN DEFAULT true,
  criada_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atribuição de metas a TMAs específicos
CREATE TABLE IF NOT EXISTS metas_atribuicoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id UUID REFERENCES metas(id) ON DELETE CASCADE,
  tma_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  meta_quantidade_individual INTEGER, -- Meta específica para este TMA (se NULL, usa a meta geral)
  responsavel BOOLEAN DEFAULT true, -- Se este TMA é responsável por esta meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meta_id, tma_id)
);

-- Tabela de progresso das metas (agora com progresso individual)
CREATE TABLE IF NOT EXISTS progresso_metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id UUID REFERENCES metas(id) ON DELETE CASCADE,
  tma_id UUID REFERENCES usuarios(id) ON DELETE CASCADE, -- NULL para progresso da equipe
  periodo VARCHAR(20) NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER,
  semana INTEGER,
  dia INTEGER,
  quantidade_atual INTEGER DEFAULT 0,
  percentual_atual DECIMAL(5,2) DEFAULT 0,
  percentual_alcancado DECIMAL(5,2) DEFAULT 0, -- (atual / meta) * 100
  status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'alcancada', 'superada', 'nao_alcancada')),
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meta_id, tma_id, periodo, ano, mes, semana, dia)
);

-- Tabela de configurações de metas
CREATE TABLE IF NOT EXISTS configuracoes_metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metas_tipo_periodo ON metas(tipo_meta, periodo, ano, mes);
CREATE INDEX IF NOT EXISTS idx_metas_ativa ON metas(ativa);
CREATE INDEX IF NOT EXISTS idx_metas_escopo ON metas(escopo);
CREATE INDEX IF NOT EXISTS idx_metas_atribuicoes_meta ON metas_atribuicoes(meta_id);
CREATE INDEX IF NOT EXISTS idx_metas_atribuicoes_tma ON metas_atribuicoes(tma_id);
CREATE INDEX IF NOT EXISTS idx_progresso_metas_periodo ON progresso_metas(meta_id, tma_id, periodo, ano, mes, semana, dia);
CREATE INDEX IF NOT EXISTS idx_progresso_metas_status ON progresso_metas(status);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at (só criar se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_metas_updated_at') THEN
        CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_metas_atribuicoes_updated_at') THEN
        CREATE TRIGGER update_metas_atribuicoes_updated_at BEFORE UPDATE ON metas_atribuicoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_progresso_metas_updated_at') THEN
        CREATE TRIGGER update_progresso_metas_updated_at BEFORE UPDATE ON progresso_metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_configuracoes_metas_updated_at') THEN
        CREATE TRIGGER update_configuracoes_metas_updated_at BEFORE UPDATE ON configuracoes_metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Função para calcular progresso de metas (individual e equipe)
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
  meta_record RECORD;
  atribuicao_record RECORD;
  quantidade_atual INTEGER := 0;
  percentual_atual DECIMAL(5,2) := 0;
  percentual_alcancado DECIMAL(5,2) := 0;
  status_meta VARCHAR(20) := 'em_andamento';
  meta_quantidade_final INTEGER;
BEGIN
  -- Buscar a meta relacionada
  SELECT * INTO meta_record FROM metas WHERE id = NEW.meta_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Se é meta individual, buscar atribuição
  IF meta_record.escopo = 'individual' AND NEW.tma_id IS NOT NULL THEN
    SELECT * INTO atribuicao_record FROM metas_atribuicoes 
    WHERE meta_id = meta_record.id AND tma_id = NEW.tma_id;
    
    IF FOUND THEN
      meta_quantidade_final := COALESCE(atribuicao_record.meta_quantidade_individual, meta_record.meta_quantidade);
    ELSE
      meta_quantidade_final := meta_record.meta_quantidade;
    END IF;
  ELSE
    meta_quantidade_final := meta_record.meta_quantidade;
  END IF;
  
  -- Calcular quantidade atual baseada no tipo de meta e TMA
  CASE meta_record.tipo_meta
    WHEN 'lv' THEN
      IF NEW.tma_id IS NOT NULL THEN
        -- Contar LVs criadas pelo TMA específico no período
        SELECT COUNT(*) INTO quantidade_atual
        FROM lv_residuos
        WHERE usuario_id = NEW.tma_id
          AND tipo_lv = COALESCE(meta_record.categoria, tipo_lv)
          AND EXTRACT(YEAR FROM created_at) = meta_record.ano
          AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
          AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
          AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
      ELSE
        -- Contar LVs criadas por toda equipe no período
        SELECT COUNT(*) INTO quantidade_atual
        FROM lv_residuos
        WHERE tipo_lv = COALESCE(meta_record.categoria, tipo_lv)
          AND EXTRACT(YEAR FROM created_at) = meta_record.ano
          AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
          AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
          AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
      END IF;
        
    WHEN 'termo' THEN
      IF NEW.tma_id IS NOT NULL THEN
        -- Contar termos criados pelo TMA específico no período
        SELECT COUNT(*) INTO quantidade_atual
        FROM termos_ambientais
        WHERE emitido_por_usuario_id = NEW.tma_id
          AND EXTRACT(YEAR FROM created_at) = meta_record.ano
          AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
          AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
          AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
      ELSE
        -- Contar termos criados por toda equipe no período
        SELECT COUNT(*) INTO quantidade_atual
        FROM termos_ambientais
        WHERE EXTRACT(YEAR FROM created_at) = meta_record.ano
          AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
          AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
          AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
      END IF;
        
    WHEN 'rotina' THEN
      IF NEW.tma_id IS NOT NULL THEN
        -- Contar rotinas criadas pelo TMA específico no período
        SELECT COUNT(*) INTO quantidade_atual
        FROM atividades_rotina
        WHERE tma_responsavel_id = NEW.tma_id
          AND EXTRACT(YEAR FROM created_at) = meta_record.ano
          AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
          AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
          AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
      ELSE
        -- Contar rotinas criadas por toda equipe no período
        SELECT COUNT(*) INTO quantidade_atual
        FROM atividades_rotina
        WHERE EXTRACT(YEAR FROM created_at) = meta_record.ano
          AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
          AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
          AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
      END IF;
  END CASE;
  
  -- Calcular percentual alcançado
  IF meta_quantidade_final > 0 THEN
    percentual_alcancado := (quantidade_atual::DECIMAL / meta_quantidade_final::DECIMAL) * 100;
  END IF;
  
  -- Determinar status
  IF percentual_alcancado >= 100 THEN
    status_meta := 'alcancada';
    IF percentual_alcancado > 120 THEN
      status_meta := 'superada';
    END IF;
  ELSIF percentual_alcancado < 80 THEN
    status_meta := 'nao_alcancada';
  END IF;
  
  -- Atualizar ou inserir progresso
  INSERT INTO progresso_metas (
    meta_id, tma_id, periodo, ano, mes, semana, dia,
    quantidade_atual, percentual_atual, percentual_alcancado, status
  ) VALUES (
    meta_record.id, NEW.tma_id, meta_record.periodo, meta_record.ano, meta_record.mes, meta_record.semana, meta_record.dia,
    quantidade_atual, percentual_atual, percentual_alcancado, status_meta
  )
  ON CONFLICT (meta_id, tma_id, periodo, ano, mes, semana, dia)
  DO UPDATE SET
    quantidade_atual = EXCLUDED.quantidade_atual,
    percentual_atual = EXCLUDED.percentual_atual,
    percentual_alcancado = EXCLUDED.percentual_alcancado,
    status = EXCLUDED.status,
    ultima_atualizacao = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atribuir automaticamente metas a todos os TMAs
CREATE OR REPLACE FUNCTION atribuir_meta_a_todos_tmas(meta_uuid UUID)
RETURNS VOID AS $$
DECLARE
  tma_record RECORD;
BEGIN
  -- Buscar todos os usuários TMA
  FOR tma_record IN 
    SELECT u.id 
    FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE p.nome = 'tma' AND u.ativo = true
  LOOP
    -- Inserir atribuição (ignorar se já existir)
    INSERT INTO metas_atribuicoes (meta_id, tma_id)
    VALUES (meta_uuid, tma_record.id)
    ON CONFLICT (meta_id, tma_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Inserir configurações padrão
INSERT INTO configuracoes_metas (chave, valor, descricao, tipo) VALUES
('meta_lv_diaria_padrao', '5', 'Meta padrão de LVs por dia', 'number'),
('meta_termo_diario_padrao', '2', 'Meta padrão de termos por dia', 'number'),
('meta_rotina_diaria_padrao', '10', 'Meta padrão de rotinas por dia', 'number'),
('meta_conformidade_minima', '85', 'Meta mínima de conformidade (%)', 'number'),
('exibir_metas_tma', 'true', 'Exibir metas para usuários TMA', 'boolean'),
('exibir_metas_admin', 'true', 'Exibir metas para administradores', 'boolean'),
('atualizacao_automatica_metas', 'true', 'Atualizar metas automaticamente', 'boolean'),
('atribuir_automaticamente_tmas', 'true', 'Atribuir metas automaticamente a todos os TMAs', 'boolean'),
('exibir_progresso_individual', 'true', 'Exibir progresso individual dos TMAs', 'boolean')
ON CONFLICT (chave) DO NOTHING;

-- Políticas RLS para metas
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_atribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_metas ENABLE ROW LEVEL SECURITY;

-- Políticas para metas (admin pode tudo, TMA pode visualizar)
DROP POLICY IF EXISTS "Admin pode gerenciar metas" ON metas;
CREATE POLICY "Admin pode gerenciar metas" ON metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode visualizar metas" ON metas;
CREATE POLICY "TMA pode visualizar metas" ON metas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('tma', 'admin', 'developer', 'ADM')
    )
  );

-- Políticas para metas_atribuicoes
DROP POLICY IF EXISTS "Admin pode gerenciar atribuições" ON metas_atribuicoes;
CREATE POLICY "Admin pode gerenciar atribuições" ON metas_atribuicoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode ver suas atribuições" ON metas_atribuicoes;
CREATE POLICY "TMA pode ver suas atribuições" ON metas_atribuicoes
  FOR SELECT USING (
    tma_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Políticas para progresso_metas
DROP POLICY IF EXISTS "Admin pode gerenciar progresso" ON progresso_metas;
CREATE POLICY "Admin pode gerenciar progresso" ON progresso_metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode ver seu progresso" ON progresso_metas;
CREATE POLICY "TMA pode ver seu progresso" ON progresso_metas
  FOR SELECT USING (
    tma_id = auth.uid() OR
    tma_id IS NULL OR -- Progresso da equipe
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Políticas para configuracoes_metas
DROP POLICY IF EXISTS "Admin pode gerenciar configurações" ON configuracoes_metas;
CREATE POLICY "Admin pode gerenciar configurações" ON configuracoes_metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode visualizar configurações" ON configuracoes_metas;
CREATE POLICY "TMA pode visualizar configurações" ON configuracoes_metas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('tma', 'admin', 'developer', 'ADM')
    )
  );

-- Comentários das tabelas
COMMENT ON TABLE metas IS 'Metas definidas pelo administrador para LVs, Termos e Rotinas';
COMMENT ON TABLE metas_atribuicoes IS 'Atribuição de metas a TMAs específicos';
COMMENT ON TABLE progresso_metas IS 'Progresso atual das metas por período e TMA';
COMMENT ON TABLE configuracoes_metas IS 'Configurações do sistema de metas';

COMMENT ON COLUMN metas.tipo_meta IS 'Tipo de meta: lv, termo, rotina';
COMMENT ON COLUMN metas.categoria IS 'Categoria específica (ex: código da LV)';
COMMENT ON COLUMN metas.periodo IS 'Período da meta: diario, semanal, mensal, trimestral, anual';
COMMENT ON COLUMN metas.meta_quantidade IS 'Quantidade alvo da meta';
COMMENT ON COLUMN metas.meta_percentual IS 'Percentual alvo (para metas de conformidade)';
COMMENT ON COLUMN metas.escopo IS 'Escopo da meta: equipe (todos) ou individual (por TMA)';

COMMENT ON COLUMN metas_atribuicoes.meta_quantidade_individual IS 'Meta específica para este TMA (se NULL, usa a meta geral)';
COMMENT ON COLUMN metas_atribuicoes.responsavel IS 'Se este TMA é responsável por esta meta';

COMMENT ON COLUMN progresso_metas.tma_id IS 'ID do TMA (NULL para progresso da equipe)';
COMMENT ON COLUMN progresso_metas.quantidade_atual IS 'Quantidade atual alcançada';
COMMENT ON COLUMN progresso_metas.percentual_alcancado IS 'Percentual da meta alcançado';
COMMENT ON COLUMN progresso_metas.status IS 'Status: em_andamento, alcancada, superada, nao_alcancada'; 