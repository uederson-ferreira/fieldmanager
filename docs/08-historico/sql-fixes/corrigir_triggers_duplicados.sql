-- ===================================================================
-- CORRIGIR TRIGGERS DUPLICADOS - ECOFIELD
-- ===================================================================
-- Script para remover triggers duplicados e manter apenas os corretos

-- 1. REMOVER TODOS OS TRIGGERS EXISTENTES
-- ===================================================================
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- Remover triggers duplicados antigos
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_old ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_old ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas_old ON atividades_rotina;

-- 2. VERIFICAR FUNÇÕES EXISTENTES
-- ===================================================================
SELECT 'FUNÇÕES EXISTENTES:' as info;
SELECT 
  proname as nome_funcao,
  prosrc as codigo
FROM pg_proc 
WHERE proname LIKE '%calcular_progresso%'
ORDER BY proname;

-- 3. CRIAR APENAS OS TRIGGERS CORRETOS
-- ===================================================================
-- Trigger para termos_ambientais
CREATE TRIGGER trigger_calcular_progresso_termos 
  AFTER INSERT OR UPDATE ON termos_ambientais 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para lvs
CREATE TRIGGER trigger_calcular_progresso_lvs 
  AFTER INSERT OR UPDATE ON lvs 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para lv_residuos
CREATE TRIGGER trigger_calcular_progresso_lv_residuos 
  AFTER INSERT OR UPDATE ON lv_residuos 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para atividades_rotina
CREATE TRIGGER trigger_calcular_progresso_rotinas 
  AFTER INSERT OR UPDATE ON atividades_rotina 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

-- 4. VERIFICAR TRIGGERS CRIADOS
-- ===================================================================
SELECT 'TRIGGERS CORRETOS CRIADOS:' as info;
SELECT 
  trigger_name,
  event_object_table,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%calcular_progresso%'
ORDER BY event_object_table, trigger_name;

-- 5. RESUMO FINAL
-- ===================================================================
SELECT 'RESUMO:' as info, 'Triggers ativos:' as tipo, COUNT(*) as quantidade 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%calcular_progresso%'
UNION ALL
SELECT 'RESUMO', 'Funções de progresso:', COUNT(*) 
FROM pg_proc 
WHERE proname LIKE '%calcular_progresso%';

SELECT '✅ CORREÇÃO CONCLUÍDA!' as resultado;
SELECT 'Agora temos apenas 4 triggers corretos usando a função unificada.' as instrucao; 