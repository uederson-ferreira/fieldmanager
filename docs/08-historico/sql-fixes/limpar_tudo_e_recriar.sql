-- ===================================================================
-- LIMPAR TUDO E RECRIAR CORRETAMENTE - ECOFIELD
-- ===================================================================
-- Script para remover todas as funções e triggers duplicados

-- 1. REMOVER TODOS OS TRIGGERS EXISTENTES
-- ===================================================================
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_insert ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_teste ON termos_ambientais;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_insert_lvs ON lvs;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_insert_residuos ON lv_residuos;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas_insert ON atividades_rotina;

-- 2. REMOVER FUNÇÕES ESPECÍFICAS ANTIGAS
-- ===================================================================
DROP FUNCTION IF EXISTS calcular_progresso_lvs();
DROP FUNCTION IF EXISTS calcular_progresso_rotinas();
DROP FUNCTION IF EXISTS calcular_progresso_termos();
DROP FUNCTION IF EXISTS calcular_progresso_metas_teste();

-- 3. VERIFICAR SE A FUNÇÃO UNIFICADA EXISTE
-- ===================================================================
SELECT 'VERIFICANDO FUNÇÃO UNIFICADA:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calcular_progresso_metas')
    THEN '✅ Função calcular_progresso_metas existe'
    ELSE '❌ Função calcular_progresso_metas NÃO existe - precisa recriar'
  END as status_funcao;

-- 4. CRIAR APENAS OS TRIGGERS CORRETOS
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

-- 5. VERIFICAR RESULTADO FINAL
-- ===================================================================
SELECT 'RESULTADO FINAL:' as info;

-- Verificar funções
SELECT 'FUNÇÕES:' as tipo, proname as nome 
FROM pg_proc 
WHERE proname LIKE '%calcular_progresso%' 
ORDER BY proname;

-- Verificar triggers
SELECT 'TRIGGERS:' as tipo, trigger_name as nome, event_object_table as tabela
FROM information_schema.triggers 
WHERE trigger_name LIKE '%calcular_progresso%' 
ORDER BY event_object_table, trigger_name;

-- Contagens
SELECT 'CONTAGENS:' as tipo, 'Funções' as item, COUNT(*) as total FROM pg_proc WHERE proname LIKE '%calcular_progresso%'
UNION ALL
SELECT 'CONTAGENS', 'Triggers', COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE '%calcular_progresso%'
UNION ALL
SELECT 'CONTAGENS', 'Metas', COUNT(*) FROM metas;

SELECT '✅ LIMPEZA E RECRIAÇÃO CONCLUÍDA!' as resultado; 