-- =====================================================
-- VALIDAÇÃO: Configurações Dinâmicas
-- Data: 04/01/2025
-- Descrição: Script para validar se a migração foi bem-sucedida
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE TODAS AS TABELAS FORAM CRIADAS
-- =====================================================
SELECT
  '📊 TABELAS CRIADAS' as status,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
    table_name LIKE 'term_%'
    OR table_name LIKE 'lv_%'
    OR table_name LIKE 'severity_%'
    OR table_name LIKE 'deviation_%'
    OR table_name LIKE 'waste_%'
    OR table_name = 'routine_activity_status'
  )
ORDER BY table_name;

-- Resultado esperado: 11 tabelas
-- term_status
-- term_status_transitions
-- term_types
-- deviation_nature
-- lv_criticality_levels
-- lv_evaluation_options
-- lv_inspection_types
-- lv_validation_rules
-- routine_activity_status
-- severity_levels
-- waste_classifications

-- =====================================================
-- 2. VERIFICAR QUANTIDADE DE REGISTROS POR TABELA
-- =====================================================
SELECT
  '📈 CONTAGEM DE REGISTROS' as status,
  '---' as tabela,
  0 as total
UNION ALL
SELECT
  '✅' as status,
  'term_types' as tabela,
  COUNT(*)::integer as total
FROM term_types
UNION ALL
SELECT
  '✅',
  'term_status',
  COUNT(*)::integer
FROM term_status
UNION ALL
SELECT
  '✅',
  'term_status_transitions',
  COUNT(*)::integer
FROM term_status_transitions
UNION ALL
SELECT
  '✅',
  'severity_levels',
  COUNT(*)::integer
FROM severity_levels
UNION ALL
SELECT
  '✅',
  'deviation_nature',
  COUNT(*)::integer
FROM deviation_nature
UNION ALL
SELECT
  '✅',
  'lv_evaluation_options',
  COUNT(*)::integer
FROM lv_evaluation_options
UNION ALL
SELECT
  '✅',
  'routine_activity_status',
  COUNT(*)::integer
FROM routine_activity_status
UNION ALL
SELECT
  '✅',
  'lv_criticality_levels',
  COUNT(*)::integer
FROM lv_criticality_levels
UNION ALL
SELECT
  '✅',
  'lv_inspection_types',
  COUNT(*)::integer
FROM lv_inspection_types
UNION ALL
SELECT
  '✅',
  'waste_classifications',
  COUNT(*)::integer
FROM waste_classifications
UNION ALL
SELECT
  '✅',
  'lv_validation_rules',
  COUNT(*)::integer
FROM lv_validation_rules
ORDER BY tabela;

-- Resultado esperado:
-- term_types: 3
-- term_status: 4
-- term_status_transitions: 4
-- severity_levels: 5
-- deviation_nature: 3
-- lv_evaluation_options: 3
-- routine_activity_status: 4
-- lv_criticality_levels: 4
-- lv_inspection_types: 3
-- waste_classifications: 3
-- lv_validation_rules: 3
-- TOTAL: 39 registros

-- =====================================================
-- 3. VERIFICAR DADOS ESPECÍFICOS - TIPOS DE TERMO
-- =====================================================
SELECT
  '🏷️ TIPOS DE TERMO' as categoria,
  code,
  prefix,
  name,
  active
FROM term_types
ORDER BY display_order;

-- Resultado esperado:
-- RECOMENDACAO | RC | Recomendação | true
-- NOTIFICACAO | NT | Notificação | true
-- PARALIZACAO_TECNICA | PT | Paralização Técnica | true

-- =====================================================
-- 4. VERIFICAR DADOS ESPECÍFICOS - STATUS DE TERMO
-- =====================================================
SELECT
  '📋 STATUS DE TERMO' as categoria,
  code,
  name,
  is_initial,
  is_final,
  color
FROM term_status
ORDER BY display_order;

-- Resultado esperado:
-- PENDENTE | Pendente | true | false | gray
-- EM_ANDAMENTO | Em Andamento | false | false | yellow
-- CORRIGIDO | Corrigido | false | false | blue
-- LIBERADO | Liberado | false | true | green

-- =====================================================
-- 5. VERIFICAR WORKFLOW DE TRANSIÇÕES
-- =====================================================
SELECT
  '🔄 TRANSIÇÕES PERMITIDAS' as categoria,
  fs.code as de_status,
  ts.code as para_status,
  t.requires_comment,
  t.requires_role
FROM term_status_transitions t
JOIN term_status fs ON t.from_status_id = fs.id
JOIN term_status ts ON t.to_status_id = ts.id
WHERE t.active = true
ORDER BY fs.display_order;

-- Resultado esperado:
-- PENDENTE → EM_ANDAMENTO (sem restrições)
-- EM_ANDAMENTO → CORRIGIDO (requer comentário)
-- EM_ANDAMENTO → PENDENTE (requer supervisor)
-- CORRIGIDO → LIBERADO (requer comentário)

-- =====================================================
-- 6. VERIFICAR NÍVEIS DE SEVERIDADE
-- =====================================================
SELECT
  '⚠️ NÍVEIS DE SEVERIDADE' as categoria,
  code,
  name,
  priority,
  sla_hours,
  color
FROM severity_levels
ORDER BY priority DESC;

-- Resultado esperado (ordem decrescente de prioridade):
-- MA | Muito Alto | 5 | 2 | red
-- A | Alto | 4 | 24 | orange
-- M | Moderado | 3 | 72 | yellow
-- B | Baixo | 2 | 168 | blue
-- PE | Pequeno Evento | 1 | null | green

-- =====================================================
-- 7. VERIFICAR OPÇÕES DE AVALIAÇÃO LV (C/NC/NA)
-- =====================================================
SELECT
  '✓ OPÇÕES DE AVALIAÇÃO LV' as categoria,
  code,
  label,
  weight,
  affects_compliance,
  color,
  icon
FROM lv_evaluation_options
ORDER BY display_order;

-- Resultado esperado:
-- C | Conforme | 1.0 | true | green | CheckCircle
-- NC | Não Conforme | 0.0 | true | red | XCircle
-- NA | Não Aplicável | null | false | gray | MinusCircle

-- =====================================================
-- 8. VERIFICAR STATUS DE ATIVIDADES DE ROTINA
-- =====================================================
SELECT
  '📅 STATUS DE ROTINA' as categoria,
  code,
  name,
  is_initial,
  is_final,
  allows_edit,
  allows_photos
FROM routine_activity_status
ORDER BY display_order;

-- Resultado esperado:
-- PLANEJADA | Planejada | true | false | true | false
-- EM_ANDAMENTO | Em Andamento | false | false | true | true
-- CONCLUIDA | Concluída | false | true | false | true
-- CANCELADA | Cancelada | false | true | false | false

-- =====================================================
-- 9. VERIFICAR RLS (ROW LEVEL SECURITY) HABILITADO
-- =====================================================
SELECT
  '🔒 RLS HABILITADO' as status,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'term_%'
    OR tablename LIKE 'lv_%'
    OR tablename LIKE 'severity_%'
    OR tablename LIKE 'deviation_%'
    OR tablename LIKE 'waste_%'
    OR tablename = 'routine_activity_status'
  )
ORDER BY tablename;

-- Resultado esperado: Todas as tabelas com rowsecurity = true

-- =====================================================
-- 10. VERIFICAR POLICIES CRIADAS
-- =====================================================
SELECT
  '🛡️ POLICIES CRIADAS' as status,
  schemaname,
  tablename,
  policyname,
  cmd as operacao,
  CASE
    WHEN qual::text LIKE '%Admin%' THEN 'Apenas Admin'
    WHEN qual::text = 'true' THEN 'Público'
    ELSE 'Customizada'
  END as permissao
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'term_%'
    OR tablename LIKE 'lv_%'
    OR tablename LIKE 'severity_%'
    OR tablename LIKE 'deviation_%'
    OR tablename LIKE 'waste_%'
    OR tablename = 'routine_activity_status'
  )
ORDER BY tablename, policyname;

-- Resultado esperado: 2 policies por tabela (leitura pública + modificação admin)

-- =====================================================
-- 11. VERIFICAR TRIGGERS DE updated_at
-- =====================================================
SELECT
  '⏰ TRIGGERS DE updated_at' as status,
  event_object_table as tabela,
  trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    event_object_table LIKE 'term_%'
    OR event_object_table LIKE 'lv_%'
    OR event_object_table LIKE 'severity_%'
    OR event_object_table LIKE 'deviation_%'
    OR event_object_table LIKE 'waste_%'
    OR event_object_table = 'routine_activity_status'
  )
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- Resultado esperado: 10 triggers (não há trigger para term_status_transitions)

-- =====================================================
-- 12. TESTE DE INTEGRIDADE - Classificação de Resíduos
-- =====================================================
SELECT
  '♻️ CLASSIFICAÇÃO DE RESÍDUOS' as categoria,
  code,
  name,
  regulatory_reference,
  requires_special_handling,
  requires_manifest
FROM waste_classifications
ORDER BY display_order;

-- Resultado esperado:
-- classe1 | Classe I - Perigoso | NBR 10.004/2004 - Classe I | true | true
-- classe2a | Classe II A - Não Inerte | NBR 10.004/2004 - Classe II A | false | true
-- classe2b | Classe II B - Inerte | NBR 10.004/2004 - Classe II B | false | false

-- =====================================================
-- 13. TESTE DE INTEGRIDADE - Regras de Validação
-- =====================================================
SELECT
  '📏 REGRAS DE VALIDAÇÃO' as categoria,
  rule_type,
  entity_type,
  threshold_value,
  is_blocking,
  LEFT(error_message, 50) as mensagem_erro
FROM lv_validation_rules
ORDER BY rule_type, entity_type;

-- Resultado esperado:
-- minimum_percentage | lv_inspecao | 80.0 | true | Pelo menos 80% dos itens...
-- minimum_percentage | lv_residuos | 70.0 | true | Pelo menos 70% dos itens...
-- required_photos | lv_inspecao | 1.0 | false | É obrigatório anexar...

-- =====================================================
-- RESUMO FINAL
-- =====================================================
DO $$
DECLARE
  v_total_tabelas INT;
  v_total_registros INT;
  v_total_policies INT;
  v_total_triggers INT;
BEGIN
  -- Contar tabelas
  SELECT COUNT(*) INTO v_total_tabelas
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND (
      table_name LIKE 'term_%'
      OR table_name LIKE 'lv_%'
      OR table_name LIKE 'severity_%'
      OR table_name LIKE 'deviation_%'
      OR table_name LIKE 'waste_%'
      OR table_name = 'routine_activity_status'
    );

  -- Contar registros totais
  SELECT
    (SELECT COUNT(*) FROM term_types) +
    (SELECT COUNT(*) FROM term_status) +
    (SELECT COUNT(*) FROM term_status_transitions) +
    (SELECT COUNT(*) FROM severity_levels) +
    (SELECT COUNT(*) FROM deviation_nature) +
    (SELECT COUNT(*) FROM lv_evaluation_options) +
    (SELECT COUNT(*) FROM routine_activity_status) +
    (SELECT COUNT(*) FROM lv_criticality_levels) +
    (SELECT COUNT(*) FROM lv_inspection_types) +
    (SELECT COUNT(*) FROM waste_classifications) +
    (SELECT COUNT(*) FROM lv_validation_rules)
  INTO v_total_registros;

  -- Contar policies
  SELECT COUNT(*) INTO v_total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND (
      tablename LIKE 'term_%'
      OR tablename LIKE 'lv_%'
      OR tablename LIKE 'severity_%'
      OR tablename LIKE 'deviation_%'
      OR tablename LIKE 'waste_%'
      OR tablename = 'routine_activity_status'
    );

  -- Contar triggers
  SELECT COUNT(*) INTO v_total_triggers
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND (
      event_object_table LIKE 'term_%'
      OR event_object_table LIKE 'lv_%'
      OR event_object_table LIKE 'severity_%'
      OR event_object_table LIKE 'deviation_%'
      OR event_object_table LIKE 'waste_%'
      OR event_object_table = 'routine_activity_status'
    )
    AND trigger_name LIKE '%updated_at%';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VALIDAÇÃO CONCLUÍDA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 ESTATÍSTICAS:';
  RAISE NOTICE '  • Tabelas criadas: % (esperado: 11)', v_total_tabelas;
  RAISE NOTICE '  • Registros populados: % (esperado: 39)', v_total_registros;
  RAISE NOTICE '  • Policies configuradas: % (esperado: 22)', v_total_policies;
  RAISE NOTICE '  • Triggers criados: % (esperado: 10)', v_total_triggers;
  RAISE NOTICE '';

  IF v_total_tabelas = 11 AND v_total_registros = 39 THEN
    RAISE NOTICE '🎉 MIGRAÇÃO BEM-SUCEDIDA!';
    RAISE NOTICE '✅ Todas as tabelas foram criadas';
    RAISE NOTICE '✅ Todos os dados foram populados';
    RAISE NOTICE '✅ Sistema pronto para uso';
  ELSE
    RAISE NOTICE '⚠️ ATENÇÃO: Alguns dados não correspondem ao esperado';
    RAISE NOTICE '📝 Revisar queries acima para detalhes';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🚀 Próximo passo: Testar APIs backend';
  RAISE NOTICE '   curl http://localhost:3001/api/configuracoes/dinamicas/all';
  RAISE NOTICE '';
END $$;
