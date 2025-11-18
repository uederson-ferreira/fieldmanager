-- ===================================================================
-- DIAGNÓSTICO METAS DE LVs E LV_RESIDUOS - ECOFIELD
-- ===================================================================
-- Script para identificar por que metas de LVs não estão funcionando

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ===================================================================
SELECT 'ESTRUTURA TABELA LVs:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lvs' 
AND column_name IN ('id', 'usuario_id', 'data_lv', 'tipo_lv')
ORDER BY column_name;

SELECT 'ESTRUTURA TABELA LV_RESIDUOS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lv_residuos' 
AND column_name IN ('id', 'usuario_id', 'data_lv', 'lv_id')
ORDER BY column_name;

-- 2. VERIFICAR DADOS EXISTENTES
-- ===================================================================
SELECT 'DADOS LVs:' as info;
SELECT 
  COUNT(*) as total_lvs,
  COUNT(DISTINCT usuario_id) as usuarios_diferentes,
  MIN(data_lv) as data_mais_antiga,
  MAX(data_lv) as data_mais_recente
FROM lvs;

SELECT 'DADOS LV_RESIDUOS:' as info;
SELECT 
  COUNT(*) as total_lv_residuos,
  COUNT(DISTINCT usuario_id) as usuarios_diferentes,
  MIN(data_lv) as data_mais_antiga,
  MAX(data_lv) as data_mais_recente
FROM lv_residuos;

-- 3. VERIFICAR METAS DE LV EXISTENTES
-- ===================================================================
SELECT 'METAS DE LV:' as info;
SELECT 
  id,
  tipo_meta,
  escopo,
  periodo,
  ano,
  mes,
  meta_quantidade,
  ativa,
  criada_por
FROM metas 
WHERE tipo_meta = 'lv'
ORDER BY created_at DESC;

-- 4. VERIFICAR ATRIBUIÇÕES DE METAS DE LV
-- ===================================================================
SELECT 'ATRIBUIÇÕES METAS LV:' as info;
SELECT 
  ma.id,
  ma.meta_id,
  ma.tma_id,
  ma.meta_quantidade_individual,
  ma.responsavel,
  u.nome as nome_tma,
  m.tipo_meta,
  m.escopo
FROM metas_atribuicoes ma
JOIN metas m ON ma.meta_id = m.id
LEFT JOIN usuarios u ON ma.tma_id = u.id
WHERE m.tipo_meta = 'lv'
ORDER BY ma.created_at DESC;

-- 5. VERIFICAR PROGRESSO DE METAS DE LV
-- ===================================================================
SELECT 'PROGRESSO METAS LV:' as info;
SELECT 
  pm.id,
  pm.meta_id,
  pm.tma_id,
  pm.quantidade_atual,
  pm.percentual_alcancado,
  pm.status,
  pm.ultima_atualizacao,
  m.tipo_meta,
  m.escopo,
  u.nome as nome_tma
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.tipo_meta = 'lv'
ORDER BY pm.ultima_atualizacao DESC;

-- 6. VERIFICAR TRIGGERS ATIVOS
-- ===================================================================
SELECT 'TRIGGERS LVs:' as info;
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%lvs%' OR trigger_name LIKE '%lv_residuos%'
ORDER BY event_object_table, trigger_name;

-- 7. TESTE MANUAL DE CONTAGEM
-- ===================================================================
SELECT 'TESTE CONTAGEM LVs - USUÁRIO ESPECÍFICO:' as info;
-- Substitua 'ID_DO_USUARIO' pelo ID real de um usuário que tem metas de LV
SELECT 
  'LVs' as tipo,
  COUNT(*) as quantidade,
  EXTRACT(YEAR FROM data_lv) as ano,
  EXTRACT(MONTH FROM data_lv) as mes
FROM lvs 
WHERE usuario_id = 'ID_DO_USUARIO' -- SUBSTITUIR PELO ID REAL
AND EXTRACT(YEAR FROM data_lv) = 2024
GROUP BY EXTRACT(YEAR FROM data_lv), EXTRACT(MONTH FROM data_lv)
ORDER BY ano, mes;

SELECT 'TESTE CONTAGEM LV_RESIDUOS - USUÁRIO ESPECÍFICO:' as info;
SELECT 
  'LV_RESIDUOS' as tipo,
  COUNT(*) as quantidade,
  EXTRACT(YEAR FROM data_lv) as ano,
  EXTRACT(MONTH FROM data_lv) as mes
FROM lv_residuos 
WHERE usuario_id = 'ID_DO_USUARIO' -- SUBSTITUIR PELO ID REAL
AND EXTRACT(YEAR FROM data_lv) = 2024
GROUP BY EXTRACT(YEAR FROM data_lv), EXTRACT(MONTH FROM data_lv)
ORDER BY ano, mes;

-- 8. VERIFICAR FUNÇÃO DE CÁLCULO
-- ===================================================================
SELECT 'FUNÇÃO CALCULAR_PROGRESSO_METAS:' as info;
SELECT 
  proname as nome_funcao,
  prosrc as codigo_fonte
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 9. TESTE DE EXECUÇÃO MANUAL
-- ===================================================================
SELECT 'TESTE EXECUÇÃO MANUAL:' as info;
-- Este teste simula a execução da função para um usuário específico
-- Substitua 'ID_DO_USUARIO' e 'ID_DA_META' pelos valores reais

-- Exemplo para testar manualmente:
-- SELECT calcular_progresso_metas_manual('ID_DA_META', 'ID_DO_USUARIO');

SELECT '✅ DIAGNÓSTICO CONCLUÍDO!' as resultado;
SELECT 'Verifique os resultados acima para identificar o problema.' as instrucao; 