-- =====================================================
-- MIGRAÇÃO: Criar Tabelas de Configurações Dinâmicas
-- Data: 04/01/2025
-- Descrição: Migrar configurações hardcoded para banco de dados
-- Prioridade: ALTA
-- Autor: Sistema EcoField
-- =====================================================

-- =====================================================
-- 1. TIPOS DE TERMO (term_types)
-- Substitui: frontend/src/types/termos.ts TIPOS_TERMO
-- =====================================================
CREATE TABLE IF NOT EXISTS term_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'NOTIFICACAO', 'PARALIZACAO_TECNICA', 'RECOMENDACAO'
  prefix VARCHAR(10) NOT NULL, -- 'NT', 'PT', 'RC'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20), -- Para UI (ex: 'red', 'orange', 'yellow')
  icon VARCHAR(50), -- Nome do ícone Lucide
  requires_signature BOOLEAN DEFAULT true,
  requires_action_plan BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca rápida por código
CREATE INDEX idx_term_types_code ON term_types(code);
CREATE INDEX idx_term_types_active ON term_types(active);

COMMENT ON TABLE term_types IS 'Tipos de termos ambientais configuráveis (substituindo TIPOS_TERMO hardcoded)';
COMMENT ON COLUMN term_types.code IS 'Código único do tipo (ex: NOTIFICACAO)';
COMMENT ON COLUMN term_types.prefix IS 'Prefixo para numeração automática (ex: NT para 2025-NT-0001)';

-- =====================================================
-- 2. STATUS DE TERMOS (term_status)
-- Substitui: frontend/src/types/termos.ts status union type
-- =====================================================
CREATE TABLE IF NOT EXISTS term_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'PENDENTE', 'EM_ANDAMENTO', 'CORRIGIDO', 'LIBERADO'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20), -- 'gray', 'yellow', 'blue', 'green'
  icon VARCHAR(50),
  is_initial BOOLEAN DEFAULT false, -- Status inicial ao criar
  is_final BOOLEAN DEFAULT false, -- Status final (não permite mais edição)
  allows_edit BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_term_status_code ON term_status(code);
CREATE INDEX idx_term_status_active ON term_status(active);

COMMENT ON TABLE term_status IS 'Status do workflow de termos ambientais (substituindo union type hardcoded)';

-- =====================================================
-- 3. TRANSIÇÕES DE STATUS DE TERMOS (term_status_transitions)
-- Define quais transições de status são permitidas
-- =====================================================
CREATE TABLE IF NOT EXISTS term_status_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_status_id UUID REFERENCES term_status(id) ON DELETE CASCADE,
  to_status_id UUID REFERENCES term_status(id) ON DELETE CASCADE,
  requires_role VARCHAR(50), -- 'admin', 'supervisor', null = qualquer um
  requires_comment BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_status_id, to_status_id)
);

COMMENT ON TABLE term_status_transitions IS 'Define quais transições de status são permitidas (workflow)';

-- =====================================================
-- 4. GRAUS DE SEVERIDADE (severity_levels)
-- Substitui: frontend/src/types/termos.ts GRAU_SEVERIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS severity_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'MA', 'A', 'M', 'B', 'PE'
  name VARCHAR(100) NOT NULL, -- 'Muito Alto', 'Alto', 'Moderado', 'Baixo', 'Pequeno Evento'
  description TEXT,
  color VARCHAR(20), -- 'red', 'orange', 'yellow', 'blue', 'green'
  icon VARCHAR(50),
  priority INTEGER, -- 5=MA, 4=A, 3=M, 2=B, 1=PE (para ordenação)
  requires_immediate_action BOOLEAN DEFAULT false,
  sla_hours INTEGER, -- Prazo em horas para resposta
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_severity_levels_code ON severity_levels(code);
CREATE INDEX idx_severity_levels_priority ON severity_levels(priority DESC);

COMMENT ON TABLE severity_levels IS 'Níveis de severidade para não-conformidades (substituindo GRAU_SEVERIDADE hardcoded)';

-- =====================================================
-- 5. NATUREZA DO DESVIO (deviation_nature)
-- Substitui: frontend/src/types/termos.ts NATUREZA_DESVIO
-- =====================================================
CREATE TABLE IF NOT EXISTS deviation_nature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'OCORRENCIA_REAL', 'QUASE_ACIDENTE_AMBIENTAL', etc
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  requires_investigation BOOLEAN DEFAULT false,
  requires_root_cause_analysis BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deviation_nature_code ON deviation_nature(code);

COMMENT ON TABLE deviation_nature IS 'Natureza dos desvios ambientais (substituindo NATUREZA_DESVIO hardcoded)';

-- =====================================================
-- 6. OPÇÕES DE AVALIAÇÃO LV (lv_evaluation_options)
-- Substitui: frontend/src/components/lv/components/LVForm.tsx "C" | "NC" | "NA"
-- =====================================================
CREATE TABLE IF NOT EXISTS lv_evaluation_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'C', 'NC', 'NA'
  label VARCHAR(100) NOT NULL, -- 'Conforme', 'Não Conforme', 'Não Aplicável'
  description TEXT,
  color VARCHAR(20), -- 'green', 'red', 'gray'
  icon VARCHAR(50), -- 'CheckCircle', 'XCircle', 'MinusCircle'
  affects_compliance BOOLEAN DEFAULT true, -- Se afeta o percentual de conformidade
  weight DECIMAL(3,2) DEFAULT 1.0, -- Peso para cálculo (C=1, NC=0, NA=null)
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lv_evaluation_options_code ON lv_evaluation_options(code);

COMMENT ON TABLE lv_evaluation_options IS 'Opções de avaliação para LVs (substituindo C/NC/NA hardcoded)';

-- =====================================================
-- 7. STATUS DE ATIVIDADES DE ROTINA (routine_activity_status)
-- Substitui: frontend/src/components/tecnico/AtividadesRotinaForm.tsx getStatusOptions
-- =====================================================
CREATE TABLE IF NOT EXISTS routine_activity_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  is_initial BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  allows_edit BOOLEAN DEFAULT true,
  allows_photos BOOLEAN DEFAULT true,
  requires_completion_date BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_routine_activity_status_code ON routine_activity_status(code);

COMMENT ON TABLE routine_activity_status IS 'Status de atividades de rotina (substituindo array hardcoded)';

-- =====================================================
-- 8. NÍVEIS DE CRITICIDADE LV (lv_criticality_levels)
-- Substitui: frontend/src/components/lv/plugins/InspecaoPlugin.tsx options hardcoded
-- =====================================================
CREATE TABLE IF NOT EXISTS lv_criticality_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'baixa', 'media', 'alta', 'critica'
  name VARCHAR(100) NOT NULL, -- 'Baixa - Rotina', 'Média - Importante', etc
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  priority INTEGER, -- 1=baixa, 2=media, 3=alta, 4=critica
  requires_immediate_action BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lv_criticality_levels_code ON lv_criticality_levels(code);

COMMENT ON TABLE lv_criticality_levels IS 'Níveis de criticidade para inspeções LV';

-- =====================================================
-- 9. TIPOS DE INSPEÇÃO LV (lv_inspection_types)
-- Substitui: frontend/src/components/lv/plugins/InspecaoPlugin.tsx tipos hardcoded
-- =====================================================
CREATE TABLE IF NOT EXISTS lv_inspection_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'preventiva', 'corretiva', 'auditoria'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  requires_checklist BOOLEAN DEFAULT true,
  requires_report BOOLEAN DEFAULT false,
  frequency_days INTEGER, -- Frequência sugerida em dias
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lv_inspection_types_code ON lv_inspection_types(code);

COMMENT ON TABLE lv_inspection_types IS 'Tipos de inspeção para LVs';

-- =====================================================
-- 10. CLASSIFICAÇÃO DE RESÍDUOS (waste_classifications)
-- Substitui: frontend/src/components/lv/plugins/ResiduosPlugin.tsx classes hardcoded
-- =====================================================
CREATE TABLE IF NOT EXISTS waste_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- 'classe1', 'classe2', 'classe3', 'classe4'
  name VARCHAR(100) NOT NULL, -- 'Classe I - Perigoso', etc
  description TEXT,
  regulatory_reference VARCHAR(200), -- Ex: 'NBR 10.004/2004'
  color VARCHAR(20),
  icon VARCHAR(50),
  requires_special_handling BOOLEAN DEFAULT false,
  requires_manifest BOOLEAN DEFAULT false,
  disposal_restrictions TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waste_classifications_code ON waste_classifications(code);

COMMENT ON TABLE waste_classifications IS 'Classificação de resíduos conforme NBR 10.004';

-- =====================================================
-- 11. REGRAS DE VALIDAÇÃO LV (lv_validation_rules)
-- Substitui: frontend/src/components/lv/plugins/InspecaoPlugin.tsx regra 80% hardcoded
-- =====================================================
CREATE TABLE IF NOT EXISTS lv_validation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_type VARCHAR(50) NOT NULL, -- 'minimum_percentage', 'required_photos', etc
  entity_type VARCHAR(50), -- 'lv_inspecao', 'lv_residuos', null = todos
  threshold_value DECIMAL(10,2), -- 80.0 para 80%
  error_message TEXT NOT NULL,
  warning_message TEXT,
  is_blocking BOOLEAN DEFAULT true, -- Bloqueia salvamento se não atender
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lv_validation_rules_type ON lv_validation_rules(rule_type);
CREATE INDEX idx_lv_validation_rules_entity ON lv_validation_rules(entity_type);

COMMENT ON TABLE lv_validation_rules IS 'Regras de validação configuráveis para LVs';

-- =====================================================
-- TRIGGERS DE ATUALIZAÇÃO
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_term_types_updated_at BEFORE UPDATE ON term_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_term_status_updated_at BEFORE UPDATE ON term_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_severity_levels_updated_at BEFORE UPDATE ON severity_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deviation_nature_updated_at BEFORE UPDATE ON deviation_nature
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lv_evaluation_options_updated_at BEFORE UPDATE ON lv_evaluation_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_activity_status_updated_at BEFORE UPDATE ON routine_activity_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lv_criticality_levels_updated_at BEFORE UPDATE ON lv_criticality_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lv_inspection_types_updated_at BEFORE UPDATE ON lv_inspection_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_classifications_updated_at BEFORE UPDATE ON waste_classifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =====================================================

-- Habilitar RLS em todas as tabelas de configuração
ALTER TABLE term_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE severity_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviation_nature ENABLE ROW LEVEL SECURITY;
ALTER TABLE lv_evaluation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_activity_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE lv_criticality_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE lv_inspection_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lv_validation_rules ENABLE ROW LEVEL SECURITY;

-- Policies: Todos podem ler (SELECT), apenas admin pode modificar
CREATE POLICY "Todos podem ler term_types" ON term_types FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar term_types" ON term_types FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler term_status" ON term_status FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar term_status" ON term_status FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler term_status_transitions" ON term_status_transitions FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar term_status_transitions" ON term_status_transitions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler severity_levels" ON severity_levels FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar severity_levels" ON severity_levels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler deviation_nature" ON deviation_nature FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar deviation_nature" ON deviation_nature FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler lv_evaluation_options" ON lv_evaluation_options FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar lv_evaluation_options" ON lv_evaluation_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler routine_activity_status" ON routine_activity_status FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar routine_activity_status" ON routine_activity_status FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler lv_criticality_levels" ON lv_criticality_levels FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar lv_criticality_levels" ON lv_criticality_levels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler lv_inspection_types" ON lv_inspection_types FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar lv_inspection_types" ON lv_inspection_types FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler waste_classifications" ON waste_classifications FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar waste_classifications" ON waste_classifications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

CREATE POLICY "Todos podem ler lv_validation_rules" ON lv_validation_rules FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode modificar lv_validation_rules" ON lv_validation_rules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
  )
);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migração concluída com sucesso!';
  RAISE NOTICE '📊 11 tabelas de configuração criadas';
  RAISE NOTICE '🔒 RLS policies aplicadas';
  RAISE NOTICE '⏰ Triggers de updated_at configurados';
  RAISE NOTICE '📝 Próximo passo: Executar script de população de dados';
END $$;
