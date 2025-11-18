-- =====================================================
-- SEED: Popular Tabelas de Configurações Dinâmicas
-- Data: 04/01/2025
-- Descrição: Migrar dados hardcoded para as novas tabelas
-- Executar APÓS: 20250104_criar_tabelas_configuracoes_dinamicas.sql
-- =====================================================

-- =====================================================
-- 1. TIPOS DE TERMO (term_types)
-- Dados de: frontend/src/types/termos.ts TIPOS_TERMO
-- =====================================================
INSERT INTO term_types (code, prefix, name, description, color, icon, requires_signature, requires_action_plan, display_order) VALUES
('RECOMENDACAO', 'RC', 'Recomendação', 'Sugestão para melhoria ou adequação', 'blue', 'Lightbulb', false, false, 1),
('NOTIFICACAO', 'NT', 'Notificação', 'Comunicação formal sobre não conformidade', 'orange', 'AlertTriangle', true, true, 2),
('PARALIZACAO_TECNICA', 'PT', 'Paralização Técnica', 'Interrupção imediata de atividade ou equipamento', 'red', 'OctagonX', true, true, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 2. STATUS DE TERMOS (term_status)
-- Dados de: frontend/src/types/termos.ts status union type
-- =====================================================
INSERT INTO term_status (code, name, description, color, icon, is_initial, is_final, allows_edit, display_order) VALUES
('PENDENTE', 'Pendente', 'Termo registrado, aguardando ação', 'gray', 'Clock', true, false, true, 1),
('EM_ANDAMENTO', 'Em Andamento', 'Ações corretivas sendo executadas', 'yellow', 'RefreshCw', false, false, true, 2),
('CORRIGIDO', 'Corrigido', 'Não conformidade corrigida, aguardando liberação', 'blue', 'CheckCircle2', false, false, false, 3),
('LIBERADO', 'Liberado', 'Termo aprovado e liberado', 'green', 'CheckCircle', false, true, false, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 3. TRANSIÇÕES DE STATUS (term_status_transitions)
-- Define workflow permitido
-- =====================================================
INSERT INTO term_status_transitions (from_status_id, to_status_id, requires_comment)
SELECT
  (SELECT id FROM term_status WHERE code = 'PENDENTE'),
  (SELECT id FROM term_status WHERE code = 'EM_ANDAMENTO'),
  false
ON CONFLICT DO NOTHING;

INSERT INTO term_status_transitions (from_status_id, to_status_id, requires_comment)
SELECT
  (SELECT id FROM term_status WHERE code = 'EM_ANDAMENTO'),
  (SELECT id FROM term_status WHERE code = 'CORRIGIDO'),
  true
ON CONFLICT DO NOTHING;

INSERT INTO term_status_transitions (from_status_id, to_status_id, requires_comment)
SELECT
  (SELECT id FROM term_status WHERE code = 'CORRIGIDO'),
  (SELECT id FROM term_status WHERE code = 'LIBERADO'),
  true
ON CONFLICT DO NOTHING;

-- Permitir voltar de EM_ANDAMENTO para PENDENTE (caso necessário)
INSERT INTO term_status_transitions (from_status_id, to_status_id, requires_comment, requires_role)
SELECT
  (SELECT id FROM term_status WHERE code = 'EM_ANDAMENTO'),
  (SELECT id FROM term_status WHERE code = 'PENDENTE'),
  true,
  'supervisor'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. GRAUS DE SEVERIDADE (severity_levels)
-- Dados de: frontend/src/types/termos.ts GRAU_SEVERIDADE
-- =====================================================
INSERT INTO severity_levels (code, name, description, color, icon, priority, requires_immediate_action, sla_hours, display_order) VALUES
('MA', 'Muito Alto', 'Risco muito alto - Ação imediata obrigatória', 'red', 'AlertOctagon', 5, true, 2, 1),
('A', 'Alto', 'Risco alto - Ação prioritária', 'orange', 'AlertTriangle', 4, true, 24, 2),
('M', 'Moderado', 'Risco moderado - Ação planejada necessária', 'yellow', 'AlertCircle', 3, false, 72, 3),
('B', 'Baixo', 'Risco baixo - Monitoramento', 'blue', 'Info', 2, false, 168, 4),
('PE', 'Pequeno Evento', 'Evento de baixo impacto', 'green', 'CheckCircle', 1, false, NULL, 5)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 5. NATUREZA DO DESVIO (deviation_nature)
-- Dados de: frontend/src/types/termos.ts NATUREZA_DESVIO
-- =====================================================
INSERT INTO deviation_nature (code, name, description, color, icon, requires_investigation, requires_root_cause_analysis, display_order) VALUES
('OCORRENCIA_REAL', 'Ocorrência Real', 'Evento que efetivamente ocorreu', 'red', 'AlertCircle', true, true, 1),
('QUASE_ACIDENTE_AMBIENTAL', 'Quase Acidente Ambiental', 'Situação que poderia resultar em incidente ambiental', 'orange', 'AlertTriangle', true, true, 2),
('POTENCIAL_NAO_CONFORMIDADE', 'Potencial Não Conformidade', 'Condição que pode gerar não conformidade', 'yellow', 'AlertOctagon', false, false, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 6. OPÇÕES DE AVALIAÇÃO LV (lv_evaluation_options)
-- Dados de: frontend/src/components/lv/components/LVForm.tsx
-- =====================================================
INSERT INTO lv_evaluation_options (code, label, description, color, icon, affects_compliance, weight, display_order) VALUES
('C', 'Conforme', 'Item está em conformidade com os requisitos', 'green', 'CheckCircle', true, 1.0, 1),
('NC', 'Não Conforme', 'Item não atende aos requisitos', 'red', 'XCircle', true, 0.0, 2),
('NA', 'Não Aplicável', 'Item não se aplica à situação atual', 'gray', 'MinusCircle', false, NULL, 3)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 7. STATUS DE ATIVIDADES DE ROTINA (routine_activity_status)
-- Dados de: frontend/src/components/tecnico/AtividadesRotinaForm.tsx
-- =====================================================
INSERT INTO routine_activity_status (code, name, description, color, icon, is_initial, is_final, allows_edit, allows_photos, requires_completion_date, display_order) VALUES
('PLANEJADA', 'Planejada', 'Atividade agendada, não iniciada', 'gray', 'Calendar', true, false, true, false, false, 1),
('EM_ANDAMENTO', 'Em Andamento', 'Atividade sendo executada', 'blue', 'PlayCircle', false, false, true, true, false, 2),
('CONCLUIDA', 'Concluída', 'Atividade finalizada com sucesso', 'green', 'CheckCircle', false, true, false, true, true, 3),
('CANCELADA', 'Cancelada', 'Atividade cancelada', 'red', 'XCircle', false, true, false, false, false, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 8. NÍVEIS DE CRITICIDADE LV (lv_criticality_levels)
-- Dados de: frontend/src/components/lv/plugins/InspecaoPlugin.tsx
-- =====================================================
INSERT INTO lv_criticality_levels (code, name, description, color, icon, priority, requires_immediate_action, display_order) VALUES
('baixa', 'Baixa - Rotina', 'Inspeção de rotina, sem urgência', 'blue', 'Info', 1, false, 1),
('media', 'Média - Importante', 'Inspeção importante, requer atenção', 'yellow', 'AlertCircle', 2, false, 2),
('alta', 'Alta - Crítica', 'Inspeção crítica, requer priorização', 'orange', 'AlertTriangle', 3, true, 3),
('critica', 'Crítica - Urgente', 'Inspeção urgente, ação imediata', 'red', 'AlertOctagon', 4, true, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 9. TIPOS DE INSPEÇÃO LV (lv_inspection_types)
-- Dados de: frontend/src/components/lv/plugins/InspecaoPlugin.tsx
-- =====================================================
INSERT INTO lv_inspection_types (code, name, description, color, icon, requires_checklist, requires_report, frequency_days, display_order) VALUES
('preventiva', 'Preventiva', 'Inspeção preventiva periódica', 'blue', 'ShieldCheck', true, false, 30, 1),
('corretiva', 'Corretiva', 'Inspeção após identificação de problema', 'orange', 'Wrench', true, true, NULL, 2),
('auditoria', 'Auditoria', 'Inspeção de auditoria interna/externa', 'purple', 'ClipboardCheck', true, true, 90, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 10. CLASSIFICAÇÃO DE RESÍDUOS (waste_classifications)
-- Dados de: frontend/src/components/lv/plugins/ResiduosPlugin.tsx
-- Referência: NBR 10.004/2004 - ABNT
-- =====================================================
INSERT INTO waste_classifications (code, name, description, regulatory_reference, color, icon, requires_special_handling, requires_manifest, disposal_restrictions, display_order) VALUES
(
  'classe1',
  'Classe I - Perigoso',
  'Resíduos que apresentam periculosidade ou características de inflamabilidade, corrosividade, reatividade, toxicidade ou patogenicidade',
  'NBR 10.004/2004 - Classe I',
  'red',
  'Skull',
  true,
  true,
  'Requer destinação em aterros Classe I ou incineração. MTR obrigatório. Transporte por empresa licenciada.',
  1
),
(
  'classe2a',
  'Classe II A - Não Inerte',
  'Resíduos que não se enquadram nas classificações de Classe I ou Classe II B. Podem ter propriedades como biodegradabilidade, combustibilidade ou solubilidade em água',
  'NBR 10.004/2004 - Classe II A',
  'orange',
  'AlertTriangle',
  false,
  true,
  'Pode ser destinado a aterros Classe II. Requer MTR.',
  2
),
(
  'classe2b',
  'Classe II B - Inerte',
  'Resíduos que, submetidos a testes de solubilização, não têm nenhum de seus constituintes solubilizados a concentrações superiores aos padrões de potabilidade de água',
  'NBR 10.004/2004 - Classe II B',
  'blue',
  'Package',
  false,
  false,
  'Pode ser destinado a aterros de resíduos inertes ou reciclagem.',
  3
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- 11. REGRAS DE VALIDAÇÃO LV (lv_validation_rules)
-- Dados de: frontend/src/components/lv/plugins/InspecaoPlugin.tsx
-- =====================================================
INSERT INTO lv_validation_rules (rule_type, entity_type, threshold_value, error_message, warning_message, is_blocking) VALUES
(
  'minimum_percentage',
  'lv_inspecao',
  80.0,
  'Pelo menos 80% dos itens devem ser avaliados antes de concluir a inspeção.',
  'Recomenda-se avaliar pelo menos 80% dos itens para maior precisão.',
  true
),
(
  'minimum_percentage',
  'lv_residuos',
  70.0,
  'Pelo menos 70% dos itens devem ser avaliados antes de concluir a lista de resíduos.',
  'Recomenda-se avaliar pelo menos 70% dos itens.',
  true
),
(
  'required_photos',
  'lv_inspecao',
  1.0,
  'É obrigatório anexar pelo menos 1 foto na inspeção.',
  'Recomenda-se anexar fotos para documentação.',
  false
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ESTATÍSTICAS E VALIDAÇÃO
-- =====================================================
DO $$
DECLARE
  v_term_types_count INT;
  v_term_status_count INT;
  v_severity_count INT;
  v_deviation_count INT;
  v_lv_eval_count INT;
  v_routine_status_count INT;
  v_criticality_count INT;
  v_inspection_types_count INT;
  v_waste_class_count INT;
  v_validation_rules_count INT;
BEGIN
  SELECT COUNT(*) INTO v_term_types_count FROM term_types;
  SELECT COUNT(*) INTO v_term_status_count FROM term_status;
  SELECT COUNT(*) INTO v_severity_count FROM severity_levels;
  SELECT COUNT(*) INTO v_deviation_count FROM deviation_nature;
  SELECT COUNT(*) INTO v_lv_eval_count FROM lv_evaluation_options;
  SELECT COUNT(*) INTO v_routine_status_count FROM routine_activity_status;
  SELECT COUNT(*) INTO v_criticality_count FROM lv_criticality_levels;
  SELECT COUNT(*) INTO v_inspection_types_count FROM lv_inspection_types;
  SELECT COUNT(*) INTO v_waste_class_count FROM waste_classifications;
  SELECT COUNT(*) INTO v_validation_rules_count FROM lv_validation_rules;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POPULAÇÃO DE DADOS CONCLUÍDA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 ESTATÍSTICAS:';
  RAISE NOTICE '  • Tipos de Termo: %', v_term_types_count;
  RAISE NOTICE '  • Status de Termo: %', v_term_status_count;
  RAISE NOTICE '  • Níveis de Severidade: %', v_severity_count;
  RAISE NOTICE '  • Natureza de Desvio: %', v_deviation_count;
  RAISE NOTICE '  • Opções de Avaliação LV: %', v_lv_eval_count;
  RAISE NOTICE '  • Status de Rotina: %', v_routine_status_count;
  RAISE NOTICE '  • Níveis de Criticidade: %', v_criticality_count;
  RAISE NOTICE '  • Tipos de Inspeção: %', v_inspection_types_count;
  RAISE NOTICE '  • Classificações de Resíduos: %', v_waste_class_count;
  RAISE NOTICE '  • Regras de Validação: %', v_validation_rules_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximo passo: Criar APIs backend para acessar essas tabelas';
  RAISE NOTICE '';
END $$;
